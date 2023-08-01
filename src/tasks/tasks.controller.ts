import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiOperationResponse, Auth } from '../common/decorators';
import { Role } from '@prisma/client';
import { TasksService } from './tasks.service';
import { apiDesc, message } from '../common/assets';

@ApiTags('Task')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Auth({
    roles: [Role.admin],
  })
  @ApiOperationResponse(
    apiDesc.task.handleExpiredTokens,
    HttpStatus.OK,
    message.task.HANDLE_EXPIRED_TOKENS
  )
  @Get('handle-expired-tokens')
  async handleExpiredTokens() {
    this.tasksService.handleExpiredTokens();
  }
}
