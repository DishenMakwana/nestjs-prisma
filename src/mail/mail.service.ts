import 'dotenv/config';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment-timezone';
import { EmailSubject } from '../common/assets';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class MailService {
  private readonly logo: string;
  private readonly supportEmail: string;
  private readonly adminEmail: string;
  private readonly appTimeZone: string;
  private readonly appName: string;
  private readonly logger: Logger;

  constructor(
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.logo = `${this.configService.getOrThrow<string>(
      'API_BASE_URL'
    )}/assets/logo.png`;

    this.supportEmail = this.configService.getOrThrow<string>('SUPPORT_EMAIL');

    this.adminEmail = this.configService.getOrThrow<string>('ADMIN_EMAIL');

    this.appTimeZone = this.configService.getOrThrow<string>('APP_TIME_ZONE');

    this.appName = 'NestJS';

    this.logger = new Logger(MailService.name);
  }

  async sendForgotPasswordEmail(email: string, otp: string) {
    return this.sendMail({
      to: email,
      subject: `${this.appName} | ${EmailSubject.FORGOT_PASSWORD}`,
      template: './forgot_password',
      context: {
        name: email.toLowerCase().split('@')[0],
        otp,
        logo: this.logo,
        supportEmail: this.supportEmail,
      },
    });
  }

  async sendVerificationEmailToUser(email: string, otp: string) {
    return this.sendMail({
      to: email,
      subject: `${this.appName} | ${EmailSubject.ACCOUNT_VERIFICATION}`,
      template: './register_user',
      context: {
        name: email.toLowerCase().split('@')[0],
        otp,
        logo: this.logo,
        supportEmail: this.supportEmail,
      },
    });
  }

  async sendTestEmail(email: string) {
    return this.sendMail({
      to: email,
      subject: `${this.appName} | ${EmailSubject.TEST_EMAIL}`,
      template: './test_email',
      context: {
        logo: this.logo,
        supportEmail: this.supportEmail,
      },
    });
  }

  private sendMail({ to, subject, template, context }) {
    try {
      return this.mailService.sendMail({
        to,
        subject,
        template,
        context,
      });
    } catch (error) {
      this.logger.error('Error in sending mail: ', error);
    }
  }

  private formateDateTime(date: Date): { date: string; time: string } {
    return {
      date: moment.utc(date).format('MM/DD/YYYY'),
      time: `${moment.utc(date).tz(this.appTimeZone).format('hh:mm A')} EST`,
    };
  }
}
