// in your test file
import {Client, expect} from '@loopback/testlab';
import {UserManageApplication} from '../../../';
import {setupApplication} from '../../acceptance/test-helper';

describe('UserController (integration)', () => {
  let app: UserManageApplication;
  let client: Client;
  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });
  after(async () => {
    await app.stop();
  });
  it('Get users from database', async () => {
    const expected = {
      id: 1,
      firstName: 'del',
      middleName: 'dd',
      lastName: 'Sam',
      email: 'alexander@john.com',
      phoneNumber: '+289383938392',
      address: 'abc colony united state',
      createdAt: '2021-12-22T06:07:48.361Z',
      updatedAt: '2021-12-22T06:07:48.361Z',
      roleId: 1,
    };
    const response = await client.get('/users');
    expect(response.body).to.containEql(expected);
  });
  it('Get user by id', async () => {
    const expected = {
      id: 1,
      firstName: 'del',
      middleName: 'dd',
      lastName: 'Sam',
      email: 'alexander@john.com',
      phoneNumber: '+289383938392',
      address: 'abc colony united state',
      createdAt: '2021-12-22T06:07:48.361Z',
      updatedAt: '2021-12-22T06:07:48.361Z',
      roleId: 1,
    };
    const response = await client.get(`/users/${expected.id}`);
    expect(response.body).to.containEql(expected);
  });
  it('Get 404 when user does not exist', async () => {
    const notExistUserId = 10001;
    await client.get(`/users/${notExistUserId}`).expect(404);
  });
});
