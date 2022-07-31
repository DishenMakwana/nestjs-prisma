import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Role } from '@prisma/client';
import { SuccessMessage } from '../common/decorators/success-message.decorator';
import { message } from '../common/assets/message.asset';
import { ApiSummary } from 'src/common/decorators/api-summary.decorator';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthUserType } from 'src/common/types';
import { ChangePasswordDto } from './dto/user.dto';
import { apiDesc } from '../common/assets/api-description..asset';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth(Role.admin, Role.user)
  @ApiSummary(apiDesc.user.changePassword)
  @SuccessMessage(message.user.SUCCESS_PASSWORD_CHANGED)
  @Post('change-password')
  async changePassword(
    @CurrentUser() authUser: AuthUserType,
    @Body() body: ChangePasswordDto,
  ) {
    const { password } = body;
    return this.userService.changePassword(authUser, password);
  }
}
