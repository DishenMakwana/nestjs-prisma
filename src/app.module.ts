import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RequestInterceptor, ResponseInterceptor } from './common/interceptors';
import { AwsModule } from './aws/aws.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { MailModule } from './mail/mail.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CustomExceptionFilter } from './common/filters';
import { WinstonModule } from './winston/winston.module';

export const modules = {
  Auth: AuthModule,
  Admin: AdminModule,
  User: UserModule,
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['./.env'],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: +configService.getOrThrow<number>('THROTTLE_TTL'), // milliseconds
          limit: +configService.getOrThrow<number>('THROTTLE_LIMIT'),
        },
      ],
    }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    MailModule,
    AwsModule,
    WinstonModule,
    ...Object.values(modules),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestInterceptor,
    },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
  ],
})
export class AppModule {}
