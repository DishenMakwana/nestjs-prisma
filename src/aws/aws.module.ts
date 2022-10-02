import { Global, Module } from '@nestjs/common';
import { AWSService } from './aws.service';

@Global()
@Module({
  providers: [AWSService],
  exports: [AWSService],
})
export class AWSModule {}
