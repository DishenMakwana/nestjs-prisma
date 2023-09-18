import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFiles,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import {
  ApiImageFiles,
  ApiOperationResponse,
  Auth,
  CurrentUser,
} from '../common/decorators';
import { Role } from '@prisma/client';
import { apiDesc, message } from '../common/assets';
import { AuthUserType } from '../common/types';
import { FileUploadDto, UpdateProfileDto, UserPhotoDto } from './dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth({ roles: [Role.user] })
  @ApiOperationResponse(
    apiDesc.user.profileData,
    HttpStatus.OK,
    message.user.PROFILE_DATA
  )
  @Get()
  async profileData(@CurrentUser() authUser: AuthUserType) {
    return this.userService.profileData(authUser);
  }

  @Auth({ roles: [Role.user] })
  @ApiOperationResponse(
    apiDesc.user.profilePhotoUpdate,
    HttpStatus.OK,
    message.user.PROFILE_PHOTO_UPDATE
  )
  @ApiImageFiles([{ name: 'photo', maxCount: 1, required: false }])
  @Post('photo')
  async profilePhotoUpdate(
    @CurrentUser() authUser: AuthUserType,
    @UploadedFiles()
    files: UserPhotoDto
  ) {
    return this.userService.profilePhotoUpdate(authUser, files);
  }

  @Auth({ roles: [Role.user] })
  @ApiOperationResponse(
    apiDesc.user.profileUpdate,
    HttpStatus.OK,
    message.user.PROFILE_UPDATE
  )
  @Put()
  async profileUpdate(
    @CurrentUser() authUser: AuthUserType,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    return this.userService.profileUpdate(authUser, updateProfileDto);
  }

  @ApiOperationResponse(
    apiDesc.user.testPusher,
    HttpStatus.OK,
    message.user.TEST_PUSHER
  )
  @Get('test/pusher/:channel/:event')
  async testPusher(
    @Param('channel') channel: string,
    @Param('event') event: string
  ) {
    return this.userService.testPusher(channel, event);
  }

  @ApiOperationResponse(
    apiDesc.user.testEmail,
    HttpStatus.OK,
    message.user.TEST_EMAIL
  )
  @Get('test/email/:email')
  async testEmail(@Param('email') email: string) {
    return this.userService.testEmail(email);
  }

  @ApiOperationResponse(
    apiDesc.user.testNotification,
    HttpStatus.OK,
    message.user.TEST_NOTIFICATION
  )
  @Get('test/notification/:userId')
  async testNotification(@Param('userId') userId: string) {
    return this.userService.testNotification(userId);
  }

  @ApiOperationResponse(
    apiDesc.user.testAWSUploadFile,
    HttpStatus.OK,
    message.user.TEST_AWS_UPLOAD_FILE
  )
  @ApiImageFiles([{ name: 'file', maxCount: 1, required: false }])
  @Post('test/file-upload/:userId/:path')
  async testAWSUploadFile(
    @Param('userId') userId: string,
    @Param('path') path: string,
    @UploadedFiles()
    files: FileUploadDto
  ) {
    return this.userService.testAWSUploadFile(userId, path, files);
  }

  @ApiOperationResponse(
    apiDesc.user.testCache,
    HttpStatus.OK,
    message.user.TEST_CACHE
  )
  @Get('test/cache')
  async testCache() {
    return this.userService.testCache();
  }
}
