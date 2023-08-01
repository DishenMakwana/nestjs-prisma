import { Injectable, Logger } from '@nestjs/common';
import * as Pusher from 'pusher';
import * as camelize from 'camelize';

@Injectable()
export class PusherService {
  private pusher: Pusher;
  private readonly logger = new Logger(PusherService.name);

  constructor(
    private readonly options: Pusher.Options,
    private readonly chunkingOptions: { limit: number; enabled: boolean }
  ) {
    this.pusher = new Pusher(this.options);
    this.validateChunkingOptions();
  }

  private validateChunkingOptions() {
    if (this.chunkingOptions.enabled && this.chunkingOptions.limit > 10000) {
      this.logger.warn(
        `Pusher payload limit is 10 MB, you have passed ${this.chunkingOptions.limit} therefore it's recommended to keep it equal or less.`
      );
    }
  }

  private async trigger(channel: string, event: string, data: any) {
    await this.pusher.trigger(channel, event, data);
  }

  public async send(
    channel: string,
    event: string,
    data: any,
    message: string = undefined
  ) {
    data = {
      message,
      data: camelize(data),
    };

    await this.trigger(channel, event, data);
  }
}
