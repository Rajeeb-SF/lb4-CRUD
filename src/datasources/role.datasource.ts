import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'role',
  connector: 'postgresql',
  url: process.env.DB_URL ?? '',
  host: process.env.DB_HOST ?? 'localhost',
  port: process.env.DB_PORT ?? 5432,
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'source@123',
  database: process.env.DB_NAME ?? 'user-manage',
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class RoleDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'role';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.role', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
