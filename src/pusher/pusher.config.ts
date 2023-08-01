import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Pusher from 'pusher';

@Injectable()
export class PusherConfig {
  constructor(private readonly configService: ConfigService) {}

  get getPusherConfig(): Pusher.Options {
    return {
      appId: this.configService.getOrThrow<string>('SOKETI_APP_ID'),
      key: this.configService.getOrThrow<string>('SOKETI_APP_KEY'),
      secret: this.configService.getOrThrow<string>('SOKETI_APP_SECRET'),
      cluster: this.configService.getOrThrow<string>('SOKETI_APP_CLUSTER'),
      encryptionMasterKeyBase64:
        this.configService.getOrThrow<string>('SOKETI_APP_ENC_KEY'),
      host: this.configService.getOrThrow<string>('SOKETI_APP_HOST'),
      // port: this.configService.getOrThrow<string>('SOKETI_APP_PORT'),
      useTLS:
        this.configService.getOrThrow<string>('SOKETI_APP_USE_TLS') === 'true',
    };
  }
}
