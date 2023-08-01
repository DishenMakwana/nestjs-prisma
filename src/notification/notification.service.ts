import { Injectable, Logger } from '@nestjs/common';
import { OneSignalService } from 'onesignal-api-client-nest';
import { NotificationByDeviceBuilder } from 'onesignal-api-client-core';

type inputType = {
  limit: number;
  offset: number;
  kind: number;
};

@Injectable()
export class NotificationService {
  constructor(private readonly oneSignalService: OneSignalService) {}

  async createNotification(
    headings: string,
    contents: string,
    includeExternalUserIds: string[],
    data: any = null,
    sendAfter: number = null
  ) {
    const logger: Logger = new Logger(NotificationService.name);

    try {
      const input = new NotificationByDeviceBuilder()
        .setIncludeExternalUserIds(includeExternalUserIds)
        .notification()
        .setHeadings({ en: headings })
        .setContents({ en: contents })
        .setDelivery({ send_after: sendAfter })
        .setAttachments({ data })
        .setPlatform({
          channel_for_external_user_ids: 'push',
        })
        .build();

      const response = await this.oneSignalService.createNotification(input);

      logger.log(response);
    } catch (error) {
      logger.error({ error });
    }
  }

  async viewNotifications(input: inputType) {
    return this.oneSignalService.viewNotifications(input);
  }

  async viewNotification(id: string) {
    return this.oneSignalService.viewNotification({ id });
  }

  async cancelNotification(id: string) {
    return this.oneSignalService.cancelNotification({ id });
  }
}
