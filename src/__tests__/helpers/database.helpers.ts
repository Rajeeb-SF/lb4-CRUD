import {EntityCrudRepository} from '@loopback/repository';
import {Role} from '../../models';
import {
  CustomerRepository,
  RoleRepository as actualRoleRepository,
  UserRepository,
} from '../../repositories';
import {testdb} from '../fixtures/datasources/testdb.datasource';

export async function givenEmptyDatabase() {
  const roleRepository: actualRoleRepository = new actualRoleRepository(testdb);
  const userRepository: UserRepository = new UserRepository(
    testdb,
    async () => roleRepository,
  );
  const customerRepository: CustomerRepository = new CustomerRepository(
    testdb,
    async () => userRepository,
  );

  await customerRepository.deleteAll();
  await userRepository.deleteAll();
  await roleRepository.deleteAll();
}

/**
 * Generate a complete Todo object for use with tests.
 * @param todo - A partial (or complete) Todo object.
 */
export function givenRole(todo?: Partial<Role>) {
  const data = Object.assign(
    {
      role: 'admin',
    },
    todo,
  );
  return new Role(data);
}

// Type alias used for tests (not an actual repository class)
export type RoleRepository = EntityCrudRepository<
  Role,
  typeof Role.prototype.id
>;
