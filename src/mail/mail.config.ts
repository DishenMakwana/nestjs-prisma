import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MAIL_SERVICE } from '../common/assets';
import { SES, SendRawEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class MailConfig {
  constructor(private readonly configService: ConfigService) {}

  get mailServiceConfig() {
    const mailService = this.configService.getOrThrow<string>('MAIL_SERVICE');

    console.log(
      'email-template path: ',
      join(__dirname, '../../../public/mail-templates')
    );

    const mailConfig: MailerOptions = {
      defaults: {
        from: this.configService.getOrThrow<string>('MAIL_FROM'),
      },
      template: {
        dir: join(__dirname, '../../../public/mail-templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };

    if (mailService === MAIL_SERVICE.SMTP) {
      // SMTP Configuration
      mailConfig.transport = {
        host: this.configService.getOrThrow<string>('MAIL_HOST'),
        port: this.configService.getOrThrow<number>('MAIL_PORT'),
        secure: this.configService.getOrThrow<string>('MAIL_SECURE') === 'true',
        ignoreTLS:
          this.configService.getOrThrow<string>('MAIL_IGNORE_TLS') === 'true',
        auth: {
          user: this.configService.getOrThrow<string>('MAIL_USER'),
          pass: this.configService.getOrThrow<string>('MAIL_PASSWORD'),
        },
        logger: this.configService.getOrThrow<string>('MAIL_LOGGER') === 'true',
      };
    } else if (mailService === MAIL_SERVICE.SES) {
      // SES Configuration
      const ses = new SES({
        credentials: {
          accessKeyId:
            this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
          secretAccessKey: this.configService.getOrThrow<string>(
            'AWS_SECRET_ACCESS_KEY'
          ),
        },
        region: this.configService.getOrThrow<string>('AWS_S3_REGION'),
      });

      mailConfig.transport = {
        SES: { ses, aws: { SendRawEmailCommand } },
      };
    } else {
      throw new Error(
        'Invalid MAIL_SERVICE. Please provide either SMTP or SES.'
      );
    }

    return mailConfig;
  }
}
