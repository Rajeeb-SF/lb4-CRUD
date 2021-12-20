import {MiddlewareSequence, RequestContext} from '@loopback/rest';
import moment from 'moment';

export class MySequence extends MiddlewareSequence {
  log(message: string): void {
    console.log(message);
  }
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
      this.log(`Request Start Time: ${moment().format()}`);
      this.log(
        `User Agent: ${this.parseHeader(
          context.request.rawHeaders,
          'User-Agent',
        )}`,
      );
      this.log(
        `Referer: ${this.parseHeader(context.request.rawHeaders, 'Host')}`,
      );
      this.log(`Request Ip: ${context.request.connection.remoteAddress}`);
      let allowedOrigins: any = process.env.ALLOWED_ORIGIN?.split(' ');
      let referer: any = this.parseHeader(context.request.rawHeaders, 'Host');
      if (!allowedOrigins.some((origin: string) => origin === referer)) {
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
