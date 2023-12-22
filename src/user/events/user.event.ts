import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailSubject, taskEvent } from '../../common/assets';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../../mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserEvent {
  private readonly logger = new Logger(UserEvent.name);
  private readonly adminEmail: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService
  ) {
    this.adminEmail = this.configService.getOrThrow<string>('ADMIN_EMAIL');
  }

  @OnEvent(taskEvent.TEST_EMAIL, { async: true })
  async handleTestEmail(email: string) {
    const res = await this.mailService.sendTestEmail(email);

    await this.prisma.emailLog.create({
      data: {
        to: email,
        subject: EmailSubject.TEST_EMAIL,
      },
    });

    this.logger.debug('Email response: ', { res });
  }
}
