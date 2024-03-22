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
    apiDesc.task.handleDeleteOldLogs,
    HttpStatus.OK,
    message.task.HANDLE_DELETE_OLD_LOGS
  )
  @Get('handle-delete-old-logs')
  async handleDeleteOldLogs() {
    this.tasksService.handleDeleteOldLogs();
  }
}
