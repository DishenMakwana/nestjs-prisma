import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../database/prisma.service';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthUserType, Payload } from '../../common/types';

@Injectable()
export class ATStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: configService.getOrThrow<string>('ACCESS_TOKEN_EXPIRES_IN'),
    });
  }

  async validate(request: Request, payload: Payload): Promise<AuthUserType> {
    const access_token = request
      .get('authorization')
      .replace('Bearer ', '')
      .trim();

    const user = await this.prisma.user.findUnique({
      where: {
        id: Number(payload.sub),
        email: payload.email,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        is_verified: true,
      },
    });

    if (!user || !user.is_verified || payload.role !== user.role) {
      throw new UnauthorizedException();
    }

    return {
      ...user,
      access_token,
    };
  }
}
