import {inject} from '@loopback/core';
import {LoggingBindings, logInvocation, WinstonLogger} from '@loopback/logging';
import {MiddlewareSequence, RequestContext} from '@loopback/rest';
import moment from 'moment';

export class MySequence extends MiddlewareSequence {
  log(message: string): void {
    console.log(message);
  }
  @inject(LoggingBindings.WINSTON_LOGGER)
  private logger: WinstonLogger;
  @logInvocation()
  parseHeader(headers: Array<string>, headerKey: string): string | undefined {
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      if (header === headerKey) {
        return headers[i + 1];
      }
    }
  }
  async handle(context: RequestContext) {
    try {
      const userAgent = this.parseHeader(
        context.request.rawHeaders,
        'User-Agent',
      );

      this.logger.log('error', 'hello world!');
      const Referer = this.parseHeader(context.request.rawHeaders, 'Host');
      const allowedOrigins = process.env.ALLOWED_ORIGIN?.split(' ');
      this.log(`Request Start Time: ${moment().format()}`);
      this.log(`User Agent: ${userAgent}`);
      this.log(`Referer: ${Referer}`);
      this.log(`Request Ip: ${context.request.connection.remoteAddress}`);
      if (
        !allowedOrigins?.some((origin: string) => origin === Referer) &&
        userAgent
      ) {
        throw new Error(`Invalid origin`);
      }
      await super.handle(context);
      this.log(`Request End Time: ${moment().format()}`);
    } catch (error) {
      this.log(`Error Time: ${moment().format()}`);
      throw error;
    }
  }
}
