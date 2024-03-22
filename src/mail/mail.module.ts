import { MailerModule } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailConfig } from './mail.config';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const mailConfig = new MailConfig(configService);

        return mailConfig.mailServiceConfig;
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService, MailConfig],
  exports: [MailService],
})
export class MailModule {}
