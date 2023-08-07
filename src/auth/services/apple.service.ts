import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as NodeRSA from 'node-rsa';
import { AppleIdTokenType } from '../../common/types';

@Injectable()
export class AppleApiService {
  private appleKeys: Record<string, string> = {};
  private ENDPOINT_URL: string;

  constructor(private readonly configService: ConfigService) {
    this.ENDPOINT_URL =
      this.configService.getOrThrow<string>('APPLE_ENDPOINT_URL');
  }

  async getUserInfo(token: string) {
    return await this.validateAppleIdToken(token);
  }

  async validateAppleIdToken(idToken: string): Promise<AppleIdTokenType> {
    try {
      const audience = this.configService
        .getOrThrow<string>('APPLE_CLIENTID')
        .split(',');

      const data: AppleIdTokenType = await this.verifyIdToken(idToken, {
        // Optional Options for further verification - Full list can be found here https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
        audience, // client id - can also be an array
        nonce: undefined, // nonce // Check this note if coming from React Native AS RN automatically SHA256-hashes the nonce https://github.com/invertase/react-native-apple-authentication#nonce
        // If you want to handle expiration on your own, or if you want the expired tokens decoded
        ignoreExpiration: true, // default is false
      });

      return data;
    } catch (error) {
      // Token is not verified
      console.log(AppleApiService.name, error);
      throw new ForbiddenException('Token validation failed', error.message);
    }
  }

  private verifyIdToken = async (
    idToken: string,
    options: any = {}
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      jwt.verify(
        idToken,
        this.getApplePublicKey,
        {
          algorithms: ['RS256'],
          issuer: this.ENDPOINT_URL,
          ...options,
        },
        (error: Error, decoded: any) => {
          return error ? reject(error) : resolve(decoded);
        }
      );
    });
  };

  private getApplePublicKey = async (
    header: any,
    cb: (err: Error | null, key) => void
  ): Promise<void> => {
    const publicKey = this.appleKeys[header.kid];

    if (publicKey) {
      cb(null, publicKey);
    } else {
      try {
        await this.fetchAndCacheApplePublicKeys();

        const updatedPublicKey = this.appleKeys[header.kid];

        if (updatedPublicKey) {
          cb(null, updatedPublicKey);
        } else {
          cb(new Error('Input error: Invalid id token public key id'), '');
        }
      } catch (error) {
        cb(error, '');
      }
    }
  };

  private fetchAndCacheApplePublicKeys = async (): Promise<void> => {
    // Fetch Apple's Public keys
    const res = await fetch(`${this.ENDPOINT_URL}/auth/keys`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await this.populateResAsJson(res);

    // Parse and cache keys
    this.appleKeys = {};

    const keys = data.keys.forEach((key: any) => {
      const publKeyObj = new NodeRSA();

      publKeyObj.importKey(
        { n: Buffer.from(key.n, 'base64'), e: Buffer.from(key.e, 'base64') },
        'components-public'
      );

      const publicKey = publKeyObj.exportKey(['public']);

      this.appleKeys[key.kid] = publicKey;

      return publicKey;
    });

    return keys;
  };

  private populateResAsJson = async (res: Response) => {
    const data = await res.text();
    if (!data) {
      return data;
    }
    return JSON.parse(data);
  };
}
