import {
  CustomerRepository,
  RoleRepository,
  UserRepository,
} from '../../repositories';
import {testdb} from '../fixtures/datasources/testdb.datasource';

export async function givenEmptyDatabase() {
  const roleRepository: RoleRepository = new RoleRepository(testdb);
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
