import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { message } from 'src/common/assets/message.asset';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserTransformer } from '../user/user.transformer';
import { HelperService } from '../helper/helper.service';
import { MailService } from '../mail/mail.service';
import { Role } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

export type Tokens = {
  access_token: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userTransformer: UserTransformer,
    private readonly helper: HelperService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string, role: Role) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        role,
      },
    });

    if (!user) throw new ForbiddenException(message.user.INVALID_CRED);

    if (!user.status)
      throw new ForbiddenException(message.user.USER_ACCOUNT_DEACTIVATED);

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new ForbiddenException(message.user.INVALID_CRED);
    }

    const { access_token }: Tokens = await this.getToken(user.id, user.email);

    return {
      user: this.userTransformer.transform(user),
      access_token,
    };
  }

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    mobile: string,
  ) {
    let user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) throw new BadRequestException(message.user.EMAIL_ALREADY_PRESENT);

    if (mobile) {
      user = await this.prisma.user.findFirst({
        where: {
          mobile,
        },
      });

      if (user)
        throw new BadRequestException(message.user.MOBILE_NUMBER_ALREADY_EXIST);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await this.prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        mobile,
        password: hashedPassword,
      },
    });

    await this.sendEmail(email);

    return this.userTransformer.transform(user);
  }

  async userActivation(code: string) {
    const userCode = await this.prisma.code.findFirst({
      where: {
        code,
      },
    });

    if (!userCode) throw new BadRequestException(message.user.INVALID_CODE);

    const user = await this.prisma.user.update({
      where: {
        id: userCode.userId,
      },
      data: {
        status: true,
      },
    });

    await this.prisma.code.delete({
      where: {
        userId: user.id,
      },
    });

    return this.userTransformer.transform(user);
  }

  async sendEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: email },
    });

    if (user.status) {
      throw new ForbiddenException(message.user.ALREADY_VERIFY_EMAIL);
    }

    const code = this.helper.randomString(25);

    const userCode = await this.prisma.code.upsert({
      where: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        code: code,
      },
      update: {},
    });

    await this.mailService.sendUserConfirmation(user, userCode.code);
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new BadRequestException(message.user.USER_DOES_NOT_EXIST);

    if (!user.status)
      throw new BadRequestException(message.user.USER_ACCOUNT_DEACTIVATED);

    const code = Math.floor(Math.random() * (9999 - 1000) + 1000);

    const userCode = await this.prisma.code.upsert({
      where: {
        userId: user.id,
      },
      update: {},
      create: {
        userId: user.id,
        code: code.toString(),
      },
    });

    await this.mailService.sendForgotPasswordEmail(user, userCode.code);

    return true;
  }

  async verifyOtp(email: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new BadRequestException(message.user.INVALID_OTP);

    const userCode = await this.prisma.code.findFirst({
      where: {
        userId: user.id,
        code,
      },
      include: {
        user: true,
      },
    });

    if (!userCode) throw new BadRequestException(message.user.INVALID_OTP);

    return this.userTransformer.transform(user);
  }

  async resetPassword(email: string, otp: string, password: string) {
    const user = await this.verifyOtp(email, otp);

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    await this.prisma.code.delete({
      where: {
        userId: user.id,
      },
    });

    return this.userTransformer.transform(user);
  }

  async getToken(user_id: number, email: string): Promise<Tokens> {
    const [at] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user_id,
          email,
        },
        {
          secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
          expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN'),
        },
      ),
    ]);

    return {
      access_token: at,
    };
  }
}
