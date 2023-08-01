import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailSubject, taskEvent } from '../../common/assets';
import { PrismaService } from '../../database/prisma.service';
import { PusherLogEvent } from '../types';
import { MailService } from '../../mail/mail.service';
import { NotificationService } from '../../notification/notification.service';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserEvent {
  private readonly logger = new Logger(UserEvent.name);
  private readonly adminEmail: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly notificationService: NotificationService,
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

  @OnEvent(taskEvent.TEST_NOTIFICATION, { async: true })
  async handleTestNotification(userId: string) {
    await this.notificationService.createNotification(
      `Test notification`,
      `Test notification description`,
      [userId],
      {
        type: `TEST`,
        data: {
          key1: 'value1',
          key2: 'value2',
        },
      }
    );

    const payload: unknown = {
      type: `TEST`,
      data: {
        key1: 'value1',
        key2: 'value2',
      },
    };

    await this.prisma.notificationLog.create({
      data: {
        user_ids: userId,
        title: `Test notification`,
        payload: payload as Prisma.JsonValue,
      },
    });
  }

  @OnEvent(taskEvent.PUSHER_LOG, { async: true })
  async handlePusherLog(data: PusherLogEvent) {
    await this.prisma.pusherLog.create({
      data: {
        event_id: data.event_id,
        event_name: data.event_name,
        channel_name: data.channel_name,
        data: data.data,
      },
    });
  }
}
