import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from './../database/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
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
import {
  Algorithm,
  AppleIdTokenType,
  AuthUserType,
  ForgotPasswordEvent,
  GoogleUser,
  RequestInfo,
  Tokens,
  UserRegisterEvent,
} from '../common/types';
import {
  Actions,
  taskEvent,
  message,
  SOCIAL_LOGIN_PROVIDER,
} from '../common/assets';
import { LoginResponse, UserForToken } from './types';
import { ConfigService } from '@nestjs/config';
import { AuthTransformer } from './auth.transformer';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, User } from '@prisma/client';
import { AppleApiService, GoogleApiService } from './services';

@Injectable()
export class AuthService {
  private readonly saltRounds: number = 10;
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authTransformer: AuthTransformer,
    private readonly eventEmitter: EventEmitter2,
    private readonly googleApiService: GoogleApiService,
    private readonly appleService: AppleApiService
  ) {
    this.saltRounds = +this.configService.getOrThrow<number>('SALT_ROUNDS');
  }

  async login(
    body: LoginDto,
    requestInfo: RequestInfo
  ): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        username: true,
        email: true,
        role: true,
        logo: true,
        is_verified: true,
        is_approved: true,
        is_social_register: true,
        password: true,
        provider: true,
        provider_id: true,
      },
    });

    if (!user) {
      throw new ForbiddenException(message.user.INVALID_CRED);
    }

    // if (user?.is_social_register) {
    //   throw new ForbiddenException(message.user.SOCIAL_LOGIN);
    // }

    return this.loginResponse(body, user, requestInfo);
  }

  private async loginResponse(
    body: LoginDto,
    user: Partial<User>,
    requestInfo: RequestInfo
  ): Promise<LoginResponse> {
    const isValidPassword = await bcrypt.compare(body.password, user.password);

    if (!isValidPassword) {
      throw new ForbiddenException(message.user.INVALID_CRED);
    }

    const { access_token }: Tokens = await this.getToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    await this.prisma.log.create({
      data: {
        user_id: user.id,
        action_id: Actions.LOGIN,
        request_data: requestInfo as Prisma.JsonValue,
      },
    });

    return {
      user: this.authTransformer.transformUser(user),
      access_token,
    };
  }

  async logout(userData: AuthUserType, requestInfo: RequestInfo) {
    const user = await this.prisma.user.findUnique({
      where: { id: userData.id },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      throw new ForbiddenException(message.user.USER_NOT_FOUND);
    }

    await this.prisma.log.create({
      data: {
        user_id: user.id,
        action_id: Actions.LOGOUT,
        request_data: requestInfo as Prisma.JsonValue,
      },
    });
  }

  async forgotPassword(body: OTPDto, requestInfo: RequestInfo) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
      select: {
        id: true,
        is_approved: true,
        is_verified: true,
        is_social_register: true,
      },
    });

    if (!user) {
      throw new ForbiddenException(message.user.USER_NOT_FOUND);
    }

    if (!user?.is_approved) {
      throw new ForbiddenException(message.user.USER_NOT_ONBOARDED);
    }

    if (!user?.is_verified) {
      throw new ForbiddenException(message.user.USER_NOT_VERIFIED);
    }

    // social register user not allowed to change password
    // if (user?.is_social_register) {
    //   throw new ForbiddenException(message.user.NOT_ALLOWED);
    // }

    const newOTP: number = this.generateOTP();

    await this.prisma.user.update({
      data: {
        code: newOTP.toString(),
      },
      where: {
        id: user.id,
      },
    });

    //sent email to user
    try {
      const data: ForgotPasswordEvent = {
        email: body.email,
        otp: newOTP.toString(),
      };

      this.eventEmitter.emit(taskEvent.FORGOT_PASSWORD, data);
    } catch (e) {
      this.logger.error('Email error: ', { e });
    }

    await this.prisma.log.create({
      data: {
        user_id: user.id,
        action_id: Actions.FORGOT_PASSWORD,
        request_data: requestInfo as Prisma.JsonValue,
      },
    });
  }

  async verifyOTP(body: VerifyOTPDto) {
    await this.otpValidate(body);
  }

  async verifyUser(body: VerifyOTPDto) {
    const validate = await this.otpValidate(body);

    if (validate) {
      await this.prisma.user.update({
        where: {
          email: body.email,
        },
        data: {
          is_verified: true,
          code: null,
        },
      });
    }
  }

  async resetPassword(body: PasswordResetDto) {
    const user = await this.otpValidate(body);

    if (user) {
      if (user.password !== null) {
        if (await bcrypt.compare(body.password, user.password)) {
          throw new ForbiddenException(message.user.USE_DIFFERENT_PASSWORD);
        }
      }

      await this.prisma.user.update({
        where: {
          email: body.email,
        },
        data: {
          password: await bcrypt.hash(body.password, this.saltRounds),
          code: null,
        },
      });

      await this.prisma.log.create({
        data: {
          user_id: user.id,
          action_id: Actions.RESET_PASSWORD,
        },
      });
    }
  }

  async changePassword(userData: AuthUserType, body: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userData.id,
      },
      select: {
        password: true,
      },
    });

    if (user.password !== null) {
      const isValidPassword = await bcrypt.compare(
        body.currentPassword,
        user.password
      );

      if (body.currentPassword === body.newPassword) {
        throw new ForbiddenException(message.user.SAME_PASSWORD);
      }

      if (!isValidPassword) {
        throw new ForbiddenException(message.user.INVALID_CURRENT_PASSWORD);
      }
    }

    await this.prisma.user.update({
      where: {
        id: userData.id,
      },
      data: {
        password: await bcrypt.hash(body.newPassword, this.saltRounds),
      },
    });

    await this.prisma.log.create({
      data: {
        user_id: userData.id,
        action_id: Actions.RESET_PASSWORD,
      },
    });
  }

  async resentVerificationEmail(body: EmailResentDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
      select: {
        id: true,
        is_verified: true,
        is_social_register: true,
      },
    });

    if (!user) {
      throw new ForbiddenException(message.user.USER_NOT_FOUND);
    }

    if (user?.is_verified) {
      throw new ForbiddenException(message.user.USER_ALREADY_VERIFIED);
    }

    // if (user?.is_social_register) {
    //   throw new ForbiddenException(message.user.NOT_ALLOWED);
    // }

    const newOTP: number = this.generateOTP();

    await this.prisma.user.update({
      data: {
        code: newOTP.toString(),
      },
      where: {
        id: user.id,
      },
    });

    //sent email to user
    try {
      const data: UserRegisterEvent = {
        email: body.email,
        otp: newOTP.toString(),
      };

      this.eventEmitter.emit(taskEvent.USER_REGISTER, data);
    } catch (e) {
      this.logger.error('Email error: ', { e });
    }
  }

  async register(body: UserRegisterDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
      select: {
        id: true,
        is_approved: true,
      },
    });

    const newOTP: number = this.generateOTP();

    if (user) {
      if (user?.is_approved) {
        throw new ForbiddenException(message.user.USER_ALREADY_EXISTS);
      } else if (!user?.is_approved) {
        await this.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            is_approved: true,
            first_name: body.firstName,
            last_name: body.lastName,
            username: body.username,
            password: await bcrypt.hash(body.password, this.saltRounds),
            code: newOTP.toString(),
            is_verified: false,
            is_social_register: false,
          },
        });
      }
    } else {
      await this.prisma.user.create({
        data: {
          email: body.email,
          is_approved: true,
          first_name: body.firstName,
          last_name: body.lastName,
          username: body.username,
          password: await bcrypt.hash(body.password, this.saltRounds),
          code: newOTP.toString(),
          is_verified: false,
          is_social_register: false,
        },
      });
    }

    // send verification email to user
    try {
      const data: UserRegisterEvent = {
        email: body.email,
        otp: newOTP.toString(),
      };

      this.eventEmitter.emit(taskEvent.USER_REGISTER, data);
    } catch (e) {
      this.logger.error('Email error: ', { e });
    }

    const newUser = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
      select: {
        id: true,
        is_approved: true,
        role: true,
        email: true,
        username: true,
        logo: true,
        is_verified: true,
        is_social_register: true,
        password: true,
        provider: true,
        provider_id: true,
      },
    });

    await this.prisma.log.create({
      data: {
        user_id: newUser.id,
        action_id: Actions.CREATE_USER,
      },
    });

    const { access_token }: Tokens = await this.getToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return {
      user: this.authTransformer.transformUser(newUser),
      access_token,
    };
  }

  async socialRegister(body: SocialRegisterDto): Promise<LoginResponse> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: body.email,
      },
      select: {
        id: true,
        is_approved: true,
        role: true,
      },
    });

    if (user) {
      if (user?.is_approved) {
        throw new ForbiddenException(message.user.USER_ALREADY_EXISTS);
      } else if (!user?.is_approved) {
        await this.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            is_approved: true,
            first_name: body.firstName,
            last_name: body.lastName,
            username: body.username,
          },
        });
      }
    } else {
      throw new NotFoundException(message.user.USER_NOT_FOUND);
    }

    await this.prisma.log.create({
      data: {
        user_id: user.id,
        action_id: Actions.CREATE_USER,
      },
    });

    const userData = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        username: true,
        email: true,
        role: true,
        logo: true,
        is_verified: true,
        is_approved: true,
        is_social_register: true,
        password: true,
        provider: true,
        provider_id: true,
      },
    });

    const { access_token }: Tokens = await this.getToken({
      id: userData.id,
      email: userData.email,
      role: userData.role,
    });

    return {
      user: this.authTransformer.transformUser(userData),
      access_token,
    };
  }

  private async otpValidate(body: VerifyOTPDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
      select: {
        id: true,
        code: true,
        password: true,
      },
    });

    if (!user) {
      throw new ForbiddenException(message.user.INVALID_REQUEST);
    }

    if (user?.code !== body.otp) {
      throw new ForbiddenException(message.user.INVALID_OTP);
    }

    await this.prisma.log.create({
      data: {
        user_id: user.id,
        action_id: Actions.OTP_VERIFY,
      },
    });

    return user;
  }

  async socialLogin(
    body: SocialLoginDto,
    requestInfo: RequestInfo
  ): Promise<LoginResponse> {
    let userInfo: GoogleUser | AppleIdTokenType;

    switch (body.provider) {
      case SOCIAL_LOGIN_PROVIDER.GOOGLE:
        userInfo = await this.googleApiService.getUserInfo(body.accessToken);
        break;
      case SOCIAL_LOGIN_PROVIDER.APPLE:
        userInfo = await this.appleService.getUserInfo(body.accessToken);
        break;
      default:
        throw new ForbiddenException(message.user.INVALID_REQUEST);
    }

    this.logger.debug('userInfo', { userInfo });

    let userExist = await this.prisma.user.findFirst({
      where: {
        email: userInfo.email,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        username: true,
        email: true,
        role: true,
        logo: true,
        is_verified: true,
        is_approved: true,
        is_social_register: true,
        password: true,
        provider: true,
        provider_id: true,
      },
    });

    // if (userExist && !userExist?.is_social_register) {
    //   throw new ForbiddenException(message.user.REGULAR_LOGIN);
    // }

    if (!userExist) {
      userExist = await this.prisma.user.create({
        data: {
          email: userInfo.email,
          is_approved: false,
          is_verified: true,
          is_social_register: true,
          provider: body.provider,
          provider_id: body.providerId,
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          username: true,
          email: true,
          role: true,
          logo: true,
          is_verified: true,
          is_approved: true,
          is_social_register: true,
          password: true,
          provider: true,
          provider_id: true,
        },
      });

      return {
        user: this.authTransformer.transformUser(userExist),
        access_token: null,
      };
    } else {
      await this.prisma.user.update({
        where: {
          id: userExist?.id,
        },
        data: {
          provider: body.provider,
          provider_id: body.providerId,
        },
      });

      if (!userExist?.is_approved) {
        return {
          user: this.authTransformer.transformUser(userExist),
          access_token: null,
        };
      } else {
        const { access_token }: Tokens = await this.getToken({
          id: userExist.id,
          email: userInfo.email,
          role: userExist.role,
        });

        await this.prisma.log.create({
          data: {
            user_id: userExist.id,
            action_id: Actions.LOGIN,
            request_data: requestInfo as Prisma.JsonValue,
          },
        });

        return {
          user: this.authTransformer.transformUser(userExist),
          access_token,
        };
      }
    }
  }

  private async getToken(data: UserForToken): Promise<Tokens> {
    const [at] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: data.id,
          email: data.email,
          role: data.role,
        },
        {
          secret: this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
          expiresIn: this.configService.getOrThrow<string>(
            'ACCESS_TOKEN_EXPIRES_IN'
          ),
          algorithm: this.configService.getOrThrow<string>(
            'JWT_ALGORITHM'
          ) as Algorithm,
        }
      ),
    ]);

    return {
      access_token: at,
    };
  }

  private generateOTP = (): number => {
    return Math.floor(1000 + Math.random() * 9000);
  };

  private randomString(length: number): string {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  }

  async handleExpiredTokens() {
    return;
  }
}
