import { DynamicModule, Module, Provider } from '@nestjs/common';
import { PusherService } from './pusher.service';
import { NestJsPusherAsyncOptions } from './pusher.interface';
import * as Pusher from 'pusher';

// DynamicModule
@Module({})
export class PusherModule {
  static forRoot(
    options: Pusher.Options,
    chunkingOptions = { limit: 9216, enabled: true },
    isGlobal = true
  ): DynamicModule {
    const providers: Provider[] = [
      {
        provide: PusherService,
        useValue: new PusherService(options, chunkingOptions),
      },
    ];

    return {
      module: PusherModule,
      global: isGlobal,
      providers,
      exports: providers,
    };
  }

  static forRootAsync(
    options: NestJsPusherAsyncOptions,
    isGlobal = true
  ): DynamicModule {
    const providers: Provider[] = [
      {
        provide: PusherService,
        useFactory: async (...args) => {
          const nestJsPusherOptions = await options.useFactory(...args);

          return new PusherService(
            nestJsPusherOptions.options,
            nestJsPusherOptions.chunkingOptions || {
              limit: 9216,
              enabled: true,
            }
          );
        },
        inject: options.inject,
      },
    ];

    return {
      module: PusherModule,
      imports: options.imports,
      global: isGlobal,
      providers,
      exports: providers,
    };
  }
}
