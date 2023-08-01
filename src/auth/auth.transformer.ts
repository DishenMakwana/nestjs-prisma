import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';

@Injectable()
export class AuthTransformer {
  constructor(private readonly configService: ConfigService) {}

  public transformUser(user: Partial<User>) {
    delete user.password;

    const logo = !user.logo
      ? `${this.configService.getOrThrow<string>(
          'API_BASE_URL'
        )}/assets/profile.png`
      : `${this.configService.getOrThrow<string>('CDN_URL')}/${user.logo}`;

    return { ...user, logo };
  }
}
