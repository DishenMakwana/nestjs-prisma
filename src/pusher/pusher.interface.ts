import { FactoryProvider, ModuleMetadata } from '@nestjs/common';
import * as Pusher from 'pusher';

export interface NestJsPusherOptions {
  options: Pusher.Options;
  chunkingOptions?: { limit: number; enabled: boolean };
}

export type NestJsPusherAsyncOptions = Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider<NestJsPusherOptions>, 'useFactory' | 'inject'>;
