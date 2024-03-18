import { Module } from '@nestjs/common';
import { WinstonService } from './winston.service';

@Module({
  providers: [WinstonService],
  exports: [WinstonService],
})
export class WinstonModule {}
