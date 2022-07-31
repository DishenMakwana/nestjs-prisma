import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { API_BASE_URL } from 'src/common/assets/constant.asset';
const logo = `${API_BASE_URL}/assets/logo.svg`;
@Injectable()
export class MailService {
  constructor(private mailService: MailerService) {}

  async sendForgotPasswordEmail(user: User, otp: string) {
    await this.mailService.sendMail({
      to: user.email,
      subject: 'Forgot Password',
      template: __dirname + './forgot_password',
      context: {
        name: user.name,
        otp,
        logo,
      },
    });
  }

  async sendUserConfirmation(user: User, code: string) {
    const activationUrl = `${API_BASE_URL}/api/auth/user-activation/${code}`;

    await this.mailService.sendMail({
      to: user.email,
      subject: 'Welcome to NestJS App! Confirm your Email',
      template: __dirname + './confirmation',
      context: {
        name: user.name,
        url: activationUrl,
        logo,
      },
    });
  }
}
