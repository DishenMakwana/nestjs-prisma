import { Global, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { OneSignalModule } from 'onesignal-api-client-nest';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    OneSignalModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          appId: configService.getOrThrow<string>('ONESIGNAL_APP_ID'),
          restApiKey: configService.getOrThrow<string>(
            'ONESIGNAL_REST_API_KEY'
          ),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
