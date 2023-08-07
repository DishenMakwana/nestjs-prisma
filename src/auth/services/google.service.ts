import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { message } from '../../common/assets';

export type GoogleUser = {
  sub: string;
  name: string;
  givenName: string;
  familyName: string;
  picture: string;
  email: string;
  emailVerified: boolean;
  locale: string;
};

@Injectable()
export class GoogleApiService {
  private endpoint = '';

  constructor(private readonly configService: ConfigService) {
    this.endpoint = this.configService.getOrThrow<string>('GOOGLE_CLIENT_URL');
  }

  async getUserInfo(token: string): Promise<GoogleUser> {
    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };

    try {
      const response: AxiosResponse<GoogleUser> = await axios.get(
        this.endpoint,
        {
          headers,
        }
      );

      return response.data;
    } catch (error) {
      console.log(GoogleApiService.name, error.response.data);
      throw new ForbiddenException(message.user.INVALID_GOOGLE_TOKEN);
    }
  }
}
