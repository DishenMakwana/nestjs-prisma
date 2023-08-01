import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        console.log(
          'email-template path: ',
          join(__dirname, '../../../public/mail-templates')
        );

        return {
          transport: {
            host: configService.getOrThrow<string>('MAIL_HOST'),
            port: configService.getOrThrow<number>('MAIL_PORT'),
            secure: configService.getOrThrow<string>('MAIL_SECURE') === 'true',
            ignoreTLS:
              configService.getOrThrow<string>('MAIL_IGNORE_TLS') === 'true',
            auth: {
              user: configService.getOrThrow<string>('MAIL_USER'),
              pass: configService.getOrThrow<string>('MAIL_PASSWORD'),
            },
            logger: configService.getOrThrow<string>('MAIL_LOGGER') === 'true',
          },
          defaults: {
            from: configService.getOrThrow<string>('MAIL_FROM'),
          },
          template: {
            dir: join(__dirname, '../../../public/mail-templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
