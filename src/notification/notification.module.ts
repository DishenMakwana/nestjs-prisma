import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Module({
  controllers: [],
  providers: [NotificationService],
})
export class NotificationModule {}
