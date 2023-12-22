import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiListQuery, ApiOperationResponse, Auth } from '../common/decorators';
import { Role } from '@prisma/client';
import { apiDesc, message } from '../common/assets';
import { AdminService } from './admin.service';
import { ListQueryDto } from '../auth/dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Auth({ roles: [Role.admin] })
  @ApiOperationResponse(
    apiDesc.admin.userList,
    HttpStatus.OK,
    message.admin.USER_LIST
  )
  @ApiListQuery()
  @Get('user-list')
  async userList(@Query() query: ListQueryDto) {
    return this.adminService.userList(query);
  }

  @Auth({ roles: [Role.admin] })
  @ApiOperationResponse(
    apiDesc.admin.userDetails,
    HttpStatus.OK,
    message.admin.USER_DETAILS
  )
  @Get('users/:userId')
  async userDetails(@Param('userId', ParseIntPipe) userId: number) {
    return this.adminService.userDetail(userId);
  }
}
