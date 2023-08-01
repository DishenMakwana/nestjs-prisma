import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';

@Injectable()
export class AdminTransformer {
  constructor(private readonly configService: ConfigService) {}

  public transformUserDetail(userDetail: Partial<User>) {
    const logo = !userDetail.logo
      ? `${this.configService.getOrThrow<string>(
          'API_BASE_URL'
        )}/assets/profile.png`
      : `${this.configService.getOrThrow<string>('CDN_URL')}/${
          userDetail.logo
        }`;

    return {
      ...userDetail,
      logo,
    };
  }
}
