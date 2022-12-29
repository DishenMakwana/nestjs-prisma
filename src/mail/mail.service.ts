import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';

@Injectable()
export class MailService {
  private readonly logo: string;

  constructor(
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.logo = `${this.configService.get<string>(
      'API_BASE_URL',
    )}/assets/logo.png`;
  }

  async sendForgotPasswordEmail(user: User, otp: string) {
    await this.mailService.sendMail({
      to: user.email,
      subject: 'Forgot Password',
      template: __dirname + './forgot_password',
      context: {
        name: user.name,
        otp,
        logo: this.logo,
      },
    });
  }

  async sendUserConfirmation(user: User, code: string) {
    const activationUrl = `${this.configService.get<string>(
      'API_BASE_URL',
    )}/api/auth/user-activation/${code}`;

    await this.mailService.sendMail({
      to: user.email,
      subject: 'Welcome to NestJS App! Confirm your Email',
      template: __dirname + './confirmation',
      context: {
        name: user.name,
        url: activationUrl,
        logo: this.logo,
      },
    });
  }
}
