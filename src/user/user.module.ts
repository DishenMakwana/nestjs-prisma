import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserTransformer } from './user.transformer';

@Module({
  providers: [UserService, UserTransformer],
  controllers: [UserController],
  exports: [UserTransformer],
})
export class UserModule {}
