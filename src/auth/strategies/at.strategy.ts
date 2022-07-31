import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../database/prisma.service';
import { Request } from 'express';
import { ACCESS_TOKEN_SECRET } from 'src/common/assets/constant.asset';

type Payload = {
  sub: string;
  email: string;
};

@Injectable()
export class ATStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: ACCESS_TOKEN_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: Payload) {
    const access_token = request
      .get('authorization')
      .replace('Bearer ', '')
      .trim();

    /**
     * Check if access_token is valid or you can write a custom check here
     */

    const user = await this.prisma.user.findUnique({
      where: {
        id: Number(payload.sub),
      },
    });

    if (!user || !user.status) {
      throw new UnauthorizedException();
    }

    const payloadData = {
      id: Number(payload.sub),
      role: user.role,
      email: payload.email,
    };

    return {
      ...payloadData,
      access_token,
    };
  }
}
