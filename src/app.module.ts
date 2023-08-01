import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RequestInterceptor, ResponseInterceptor } from './common/interceptors';
import { AwsModule } from './aws/aws.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CustomConfigModule } from './config/config.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { MailModule } from './mail/mail.module';
import { NotificationModule } from './notification/notification.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { PusherModule } from './pusher/pusher.module';
import { PusherConfig } from './pusher/pusher.config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

export const modules = {
  Auth: AuthModule,
  Admin: AdminModule,
  CustomConfig: CustomConfigModule,
  User: UserModule,
  Task: TasksModule,
};

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: +configService.getOrThrow<number>('THROTTLE_TTL'),
        limit: +configService.getOrThrow<number>('THROTTLE_LIMIT'),
      }),
    }),
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['./.env'],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    PusherModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const pusherConfig = new PusherConfig(configService);
        return {
          options: pusherConfig.getPusherConfig,
        };
      },
      inject: [ConfigService],
    }),
    MailModule,
    AwsModule,
    NotificationModule,
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
  ],
})
export class AppModule {}
