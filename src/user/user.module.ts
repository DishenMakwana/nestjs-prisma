import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserEvent } from './events';
import { UserTransformer } from './user.transformer';
import { UserResolver } from './user.resolver';

@Module({
  controllers: [UserController],
  providers: [UserService, UserEvent, UserTransformer, UserResolver],
  exports: [UserService],
})
export class UserModule {}
