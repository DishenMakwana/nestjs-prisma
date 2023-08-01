import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserEvent } from './events';
import { UserTransformer } from './user.transformer';

@Module({
  controllers: [UserController],
  providers: [UserService, UserEvent, UserTransformer],
  exports: [UserService],
})
export class UserModule {}
