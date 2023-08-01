import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminTransformer } from './admin.transformer';

@Module({
  providers: [AdminService, AdminTransformer],
  controllers: [AdminController],
  imports: [],
})
export class AdminModule {}
