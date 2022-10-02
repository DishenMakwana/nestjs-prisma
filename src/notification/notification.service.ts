import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as https from 'https';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  sendNotification(
    headings: any,
    contents: any,
    include_external_user_ids: any,
    object = null,
    send_after = null,
  ) {
    let objectData;

    if (object) {
      objectData = {
        ...object,
      };
    }

    const data = {
      app_id: process.env.PUSH_NOTIFICATION_APP_ID,
      contents: {
        en: contents,
      },
      headings: {
        en: headings,
      },
      channel_for_external_user_ids: 'push',
      include_external_user_ids: include_external_user_ids,
      send_after,
      data: objectData,
    };

    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Basic ${process.env.PUSH_NOTIFICATION_API_KEY}`,
    };

    const options = {
      host: 'onesignal.com',
      port: 443,
      path: '/api/v1/notifications',
      method: 'POST',
      headers: headers,
    };

    const req = https.request(options, function (res) {
      res.on('data', function (data) {
        console.log('Response:');
        console.log(JSON.parse(data));
      });
    });

    req.on('error', function (e) {
      console.log('ERROR:');
      console.log(e);
    });

    req.write(JSON.stringify(data));
    req.end();
  }
}
