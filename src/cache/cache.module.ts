import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule, CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          store: await redisStore({
            // Store-specific configuration:
            url: configService.getOrThrow<string>('REDIS_URL'),
          }),
          ttl: +configService.getOrThrow<number>('CACHE_TTL'), // milliseconds
          readyLog: true,
          errorLog: true,
        } as CacheModuleAsyncOptions;
      },
      inject: [ConfigService],
    }),
  ],
})
export class CacheConfigModule {}
