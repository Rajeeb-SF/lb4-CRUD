import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {LoggingBindings, LoggingComponent} from '@loopback/logging';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import * as dotenv from 'dotenv';
import path from 'path';
import {MySequence} from './sequence';

export {ApplicationConfig};

export class UserManageApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    dotenv.config();
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.configure(LoggingBindings.COMPONENT).to({
      enableFluent: false, // default to true
      enableHttpAccessLog: true, // default to true
    });
    this.configure(LoggingBindings.FLUENT_SENDER).to({
      host: process.env.FLUENTD_SERVICE_HOST ?? 'localhost',
      port: +(process.env.FLUENTD_SERVICE_PORT_TCP ?? 24224),
      timeout: 3.0,
      reconnectInterval: 600000, // 10 minutes
    });

    this.component(RestExplorerComponent);
    this.component(LoggingComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
