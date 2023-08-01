import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserTransformer {
  constructor(private readonly configService: ConfigService) {}

  public transformUser(user: any) {
    const logo = !user.logo
      ? `${this.configService.getOrThrow<string>(
          'API_BASE_URL'
        )}/assets/profile.png`
      : `${this.configService.getOrThrow<string>('CDN_URL')}/${user.logo}`;

    return {
      ...user,
      logo,
    };
  }

  public transformUserProfile(logo: any) {
    const newLogo = !logo
      ? `${this.configService.getOrThrow<string>(
          'API_BASE_URL'
        )}/assets/profile.png`
      : `${this.configService.getOrThrow<string>('CDN_URL')}/${logo}`;

    return { logo: newLogo };
  }
}
