// in your test file
import {EntityNotFoundError} from '@loopback/repository';
import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
  toJSON,
} from '@loopback/testlab';
import {UserManageApplication} from '../../';
import {Role} from '../../models';
import {givenRole, RoleRepository} from '../helpers/database.helpers';

describe('RoleController (unit)', () => {
  let app: UserManageApplication;
  let client: Client;
  let roleRepo: RoleRepository;
  before(givenRunningApplicationWithCustomConfiguration);
  after(() => app.stop());

  before(givenRoleRepository);
  before(() => {
    client = createRestAppClient(app);
  });

  beforeEach(async () => {
    await roleRepo.deleteAll();
  });

  it('creates a role', async function () {
    const role = givenRole();
    const response = await client.post('/roles').send(role).expect(200);
    expect(response.body).to.containDeep(role);
    const result = await roleRepo.findById(response.body.id);
    expect(result).to.containDeep(role);
  });

  it('rejects requests to create a role with no role name', async () => {
    const role: Partial<Role> = givenRole();
    delete role.role;
    await client.post('/roles').send(role).expect(422);
  });

  it('rejects requests with input that contains excluded properties', async () => {
    const role = givenRole();
    role.id = 1;
    await client.post('/roles').send(role).expect(422);
  });

  context('when dealing with a single persisted role', () => {
    let persistedRole: Role;

    beforeEach(async () => {
      persistedRole = await givenRoleInstance();
    });

    it('gets a role by ID', () => {
      return client
        .get(`/roles/${persistedRole.id}`)
        .send()
        .expect(200, toJSON(persistedRole));
    });

    it('returns 404 when getting a role that does not exist', () => {
      return client.get('/roles/99999').expect(404);
    });

    it('replaces the role by ID', async () => {
      const updatedRole = givenRole({
        role: 'LOOKS I`M INVITABLE ROLE',
      });
      await client
        .put(`/roles/${persistedRole.id}`)
        .send(updatedRole)
        .expect(204);
      const result = await roleRepo.findById(persistedRole.id);
      expect(result).to.containEql(updatedRole);
    });

    it('returns 404 when replacing a role that does not exist', () => {
      return client.put('/roles/99999').send(givenRole()).expect(404);
    });

    it('updates the role by ID ', async () => {
      const updatedRole = givenRole({
        role: 'I`M NOT CHANGING',
      });
      await client
        .patch(`/roles/${persistedRole.id}`)
        .send(updatedRole)
        .expect(204);
      const result = await roleRepo.findById(persistedRole.id);
      expect(result).to.containEql(updatedRole);
    });

    it('returns 404 when updating a role that does not exist', () => {
      return client
        .patch('/roles/99999')
        .send(givenRole({role: 'I`M NOT CHANGING'}))
        .expect(404);
    });

    it('deletes the role', async () => {
      await client.del(`/roles/${persistedRole.id}`).send().expect(204);
      await expect(roleRepo.findById(persistedRole.id)).to.be.rejectedWith(
        EntityNotFoundError,
      );
    });

    it('returns 404 when deleting a role that does not exist', async () => {
      await client.del(`/roles/99999`).expect(404);
    });
  });

  // it('queries roles with a filter', async () => {
  //   await givenRoleInstance({role: 'subscriber'});

  //   const roleInProgress = await givenRoleInstance({
  //     role: 'subscriber',
  //   });

  //   await client
  //     .get('/roles')
  //     .query({filter: {where: {role: 'subscriber'}}})
  //     .expect(200, [toJSON(roleInProgress)]);
  // });

  it('exploded filter conditions work', async () => {
    await givenRoleInstance({role: 'admin'});
    await givenRoleInstance({
      role: 'user',
    });

    const response = await client.get('/roles').query('filter[limit]=2');
    expect(response.body).to.have.length(2);
  });

  // Helpers
  async function givenRunningApplicationWithCustomConfiguration() {
    app = new UserManageApplication({
      rest: givenHttpServerConfig(),
    });

    await app.boot();

    /**
     * Override default config for DataSource for testing so we don't write
     * test data to file when using the memory connector.
     */
    app.bind('datasources.config.db').to({
      name: 'db',
      connector: 'memory',
    });

    // Start Application
    await app.start();
  }

  async function givenRoleRepository() {
    roleRepo = await app.get<RoleRepository>('repositories.RoleRepository');
  }

  async function givenRoleInstance(role?: Partial<Role>) {
    return roleRepo.create(givenRole(role));
  }
});
