import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';

@ApiTags('Tasks')
@Injectable()
export class TasksService {
  constructor(private readonly authService: AuthService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredTokens() {
    return this.authService.handleExpiredTokens();
  }
}
