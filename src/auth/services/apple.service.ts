import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as appleSignIn from 'apple-signin-auth';

@Injectable()
export class AppleApiService {
  private readonly logger: Logger = new Logger(AppleApiService.name);

  constructor(private readonly configService: ConfigService) {}

  async getUserInfo(token: string) {
    return await this.validateAppleIdToken(token);
  }

  async validateAppleIdToken(
    idToken: string
  ): Promise<appleSignIn.AppleIdTokenType> {
    try {
      const audience = this.configService
        .getOrThrow<string>('APPLE_CLIENTID')
        .split(',');

      const data: appleSignIn.AppleIdTokenType =
        await appleSignIn.verifyIdToken(idToken, {
          // Optional Options for further verification - Full list can be found here https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
          audience, // client id - can also be an array
          nonce: undefined, // nonce // Check this note if coming from React Native AS RN automatically SHA256-hashes the nonce https://github.com/invertase/react-native-apple-authentication#nonce
          // If you want to handle expiration on your own, or if you want the expired tokens decoded
          ignoreExpiration: true, // default is false
        });

      return data;
    } catch (error) {
      // Token is not verified
      this.logger.error({ error });
      throw new ForbiddenException('Token validation failed', error.message);
    }
  }
}
