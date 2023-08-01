import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AuthModule } from '../auth/auth.module';
import { TasksController } from './tasks.controller';

@Module({
  imports: [AuthModule],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
