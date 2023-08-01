import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  ApiOperationResponse,
  Auth,
  CurrentUser,
  UserRequestInfo,
} from '../common/decorators';
import { apiDesc, message } from '../common/assets';
import {
  ChangePasswordDto,
  EmailResentDto,
  LoginDto,
  OTPDto,
  PasswordResetDto,
  SocialLoginDto,
  SocialRegisterDto,
  UserRegisterDto,
  VerifyOTPDto,
} from './dto';
import { Role } from '@prisma/client';
import { AuthUserType, RequestInfo } from '../common/types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperationResponse(
    apiDesc.auth.login,
    HttpStatus.OK,
    message.user.SUCCESS_LOGIN
  )
  @Post('login')
  async login(
    @UserRequestInfo() requestInfo: RequestInfo,
    @Body()
    body: LoginDto
  ) {
    return this.authService.login(body, requestInfo);
  }

  @Auth({
    roles: [Role.admin, Role.user],
  })
  @ApiOperationResponse(
    apiDesc.auth.logout,
    HttpStatus.OK,
    message.user.SUCCESS_LOGOUT
  )
  @Post('logout')
  async logout(
    @UserRequestInfo() requestInfo: RequestInfo,
    @CurrentUser() authUser: AuthUserType
  ) {
    return this.authService.logout(authUser, requestInfo);
  }

  @ApiOperationResponse(
    apiDesc.auth.forgotPassword,
    HttpStatus.OK,
    message.user.FORGOT_PASSWORD
  )
  @Post('forgot-password')
  async forgotPassword(
    @UserRequestInfo() requestInfo: RequestInfo,
    @Body() body: OTPDto
  ) {
    return this.authService.forgotPassword(body, requestInfo);
  }

  @ApiOperationResponse(
    apiDesc.auth.verifyOTP,
    HttpStatus.OK,
    message.user.OTP_VERIFIED
  )
  @Post('verify-otp')
  async verifyOTP(@Body() body: VerifyOTPDto) {
    return this.authService.verifyOTP(body);
  }

  @ApiOperationResponse(
    apiDesc.auth.resetPassword,
    HttpStatus.OK,
    message.user.SUCCESS_PASSWORD_CHANGED
  )
  @Post('reset-password')
  async resetPassword(@Body() body: PasswordResetDto) {
    return this.authService.resetPassword(body);
  }

  @Auth({
    roles: [Role.admin, Role.user],
  })
  @ApiOperationResponse(
    apiDesc.auth.changePassword,
    HttpStatus.OK,
    message.user.SUCCESS_PASSWORD_CHANGED
  )
  @Post('change-password')
  async changePassword(
    @Body() body: ChangePasswordDto,
    @CurrentUser() authUser: AuthUserType
  ) {
    return this.authService.changePassword(authUser, body);
  }

  @ApiOperationResponse(
    apiDesc.auth.resentVerificationEmail,
    HttpStatus.OK,
    message.user.RESENT_VERIFICATION_EMAIL
  )
  @Post('verification/resent')
  async resentVerificationEmail(@Body() body: EmailResentDto) {
    return this.authService.resentVerificationEmail(body);
  }

  @ApiOperationResponse(
    apiDesc.auth.register,
    HttpStatus.OK,
    message.user.REGISTRATION_SUCCESSFULLY
  )
  @Post('register')
  async register(@Body() body: UserRegisterDto) {
    return this.authService.register(body);
  }

  @ApiOperationResponse(
    apiDesc.auth.verifyUser,
    HttpStatus.OK,
    message.user.VERIFICATION_SUCCESSFULLY
  )
  @Post('verification')
  async verifyUser(@Body() body: VerifyOTPDto) {
    return this.authService.verifyUser(body);
  }

  @ApiOperationResponse(
    apiDesc.auth.socialRegister,
    HttpStatus.OK,
    message.user.SUCCESS_SOCIAL_REGISTER
  )
  @Post('social-register')
  async socialRegister(@Body() body: SocialRegisterDto) {
    return this.authService.socialRegister(body);
  }

  @ApiOperationResponse(
    apiDesc.auth.socialLogin,
    HttpStatus.OK,
    message.user.SUCCESS_SOCIAL_LOGIN
  )
  @Post('social-login')
  async socialLogin(
    @UserRequestInfo() requestInfo: RequestInfo,
    @Body() body: SocialLoginDto
  ) {
    return this.authService.socialLogin(body, requestInfo);
  }
}
