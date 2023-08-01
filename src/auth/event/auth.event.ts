import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailSubject, taskEvent } from '../../common/assets';
import { ForgotPasswordEvent, UserRegisterEvent } from '../../common/types';
import { MailService } from '../../mail/mail.service';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuthEvent {
  private readonly logger: Logger = new Logger(AuthEvent.name);

  constructor(
    private readonly mailService: MailService,
    private readonly prisma: PrismaService
  ) {}

  @OnEvent(taskEvent.USER_REGISTER, { async: true })
  async handleSentEmailVerification(payload: UserRegisterEvent) {
    const res = await this.mailService.sendVerificationEmailToUser(
      payload.email,
      payload.otp
    );

    await this.prisma.emailLog.create({
      data: {
        to: payload.email.toString(),
        subject: EmailSubject.ACCOUNT_VERIFICATION,
      },
    });

    this.logger.debug('Email response: ', { res });
  }

  @OnEvent(taskEvent.FORGOT_PASSWORD)
  async handleForgotPasswordEvent(payload: ForgotPasswordEvent) {
    const res = await this.mailService.sendForgotPasswordEmail(
      payload.email,
      payload.otp
    );

    await this.prisma.emailLog.create({
      data: {
        to: payload.email.toString(),
        subject: EmailSubject.FORGOT_PASSWORD,
      },
    });

    this.logger.debug('Email response: ', { res });
  }
}
