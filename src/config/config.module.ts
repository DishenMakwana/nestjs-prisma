import { Module } from '@nestjs/common';
import { CustomConfigController } from './config.controller';
import { CustomConfigService } from './config.service';

@Module({
  controllers: [CustomConfigController],
  providers: [CustomConfigService],
})
export class CustomConfigModule {}
