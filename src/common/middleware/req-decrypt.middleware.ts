import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as CryptoJS from 'crypto-js';
import * as jsrsasign from 'jsrsasign';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class DecryptionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const method = req.method;

    if (method === 'GET' || method === 'DELETE') {
      return next();
    }

    const decryptedBody = CryptoEncryptDecryptInterceptor.decryptResponseData(
      req.body.data,
      'cryptoKey@123$%'
    );

    // const decryptedBody =
    //   JsrsasignEncryptDecryptInterceptor.decryptResponseData(req.body.data);

    // const decryptedBody = JWTEncryptDecryptInterceptor.decryptResponseData(
    //   req.body.data
    // );

    req.body = decryptedBody;

    next();
  }
}

export class CryptoEncryptDecryptInterceptor {
  private static encryptionKey: string;

  static encryptRequestData(data: any, key, algorithm = 'AES') {
    let encryptedData: string;

    if (algorithm === 'AES') {
      encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(data),
        key
      ).toString();
    } else if (algorithm === 'DES') {
      encryptedData = CryptoJS.DES.encrypt(
        JSON.stringify(data),
        key
      ).toString();
    } else {
      throw new Error('Invalid encryption algorithm');
    }

    return encryptedData;
  }

  static decryptResponseData(encryptedData: string, key, algorithm = 'AES') {
    let decryptedData: string;

    if (algorithm === 'AES') {
      decryptedData = CryptoJS.AES.decrypt(encryptedData, key).toString(
        CryptoJS.enc.Utf8
      );
    } else if (algorithm === 'DES') {
      decryptedData = CryptoJS.DES.decrypt(encryptedData, key).toString(
        CryptoJS.enc.Utf8
      );
    } else {
      throw new Error('Invalid encryption algorithm');
    }

    return JSON.parse(decryptedData);
  }
}

export class JsrsasignEncryptDecryptInterceptor {
  private static privateKey: string = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAgnnL80703vmLTfYIEw/Kyyl7VgBu9NGwXDWIBK4uEvzt6UKx
ZZxASmRj2QIfOpL9qdXJLeF85h3YP3xMNLv9WkCRAwpQaU/VUx9g4u+WQ/yaJnPY
N62oe/JxjXyBEinz9cSNZlE7lqhpP1lIOTb2cwsDwHcHndQqxlVYD3oFESkut+Ww
5MQBCDmc8MFswXJjxgMZ79ESvNDHe01p8oDn/GcIhwFumYA4kUA+LuKEAYyGEQkW
p1bdJ4lTkBBSVLGB1UBpZx7EIAsgBFvYJbdxIzwePNP3WXVn7u+FUFPaBmRmBX9/
2LgOdyqPnxxwRjpI9DVip1ToRsM6MXNRBGV20QIDAQABAoIBAGG3zGq2OKkCZjWG
TTfRfQU5VRjtDCypGxeENBGlTfaEnb40Z9387x2IIEu3ziG1UuuupJSLK1rBAWNS
uVRJcw70Cmcng1/MHa26c3qjC3xxpBWmb0oL8oKZ6jeYBqbO6tqnUWtO7X0BNonu
WSwYoO06U54Cx56J91tBMcmtjjvx5b/LccNWAWhOOYC2jI9jwbAGz51HsD/s5LDu
Jk9e6IgeswTnFkg/v0B2Y2OuSgT3pXO1MahOsAni36n5T75vLRK753vHiNxXr8uB
g3PfqVlGDZZqSFZHG99p2gpOmWM/pllN9FA70XFAbDli9gTQ7b+1DO9p9RWAYONF
BoYzc1ECgYEA/3CZHnU/LEPJKL14mKijnel2SnPfFc2/PpPImcr10FBCP+vM0A5j
xMT2DjOGBE0X+mgcRlYc1xe6Et4XZM7pCtmdW2wN+IrcPNcxB2gTAGD3nxB1k2qS
mBi+3wmAXN8DpYBm9Jmqr7rax0I3wvmlAoRW321N2iEYKidswkWaBG0CgYEAgsML
c59nrqJSBC8cl9XmTjcstsLwblWrjMPO28cGyEDl7yrtdg7Hu1m5ftjx5HWnwYEi
/KHRMUKRnHnTcxjKvHS5RFcF0XN0tBVR1XwqFyjSJkPK+0ndlGwkPTYwqGByi3Nr
HsPQ6BrrS52mXl3Y4frrawIJvnMU7uaV7+FmlXUCgYATv9Xm1/PRbVBBORz42JkF
3YYKzZii6+xsXyq0UU/eEkZ9ALMuJt6p2PyZLnyfGoLPFnuRKJlEPA5j5Q3z+ldk
Qlz7M4iE/d93SL/+rZpCfjzG7JPamPPKlKc1QVvOUmPKyPms0bCzs4O0wjbjeT+7
yRWaYq4RPlvK7o9nGdCFpQKBgGozVRqr7X51EN2bEcLzk6AUybkJrFJAPBsQcPIo
vAZqRxUvLTtEF82+upweQJ+HOx867Zp3Jjq20SJgA28oRIg42Lt7XhtVhQQ5iIQ1
2s2CduNjDfl3bYH9LpWUbIJkCsPdkrOi4AmSy2VXfeaIm/w1WXxIZHeMagT5u+7e
hv19AoGBAKVClS+XuD6wlQp9gpoNeug75quJRiN5x8H/ap7AxOlhNADeusA4T88V
wlbH9s3uJxvXef/HeO68nio941mDmbPUbytJhT9mO3xR+st1GuHHdpvo0VC3pF+7
JZw7j95eh3Iypw8mxC/jGaU9cYjMQ7pYuHfr9Aq5XDFC0hzX7RCi
-----END RSA PRIVATE KEY-----`;
  private static publicKey: string = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgnnL80703vmLTfYIEw/K
yyl7VgBu9NGwXDWIBK4uEvzt6UKxZZxASmRj2QIfOpL9qdXJLeF85h3YP3xMNLv9
WkCRAwpQaU/VUx9g4u+WQ/yaJnPYN62oe/JxjXyBEinz9cSNZlE7lqhpP1lIOTb2
cwsDwHcHndQqxlVYD3oFESkut+Ww5MQBCDmc8MFswXJjxgMZ79ESvNDHe01p8oDn
/GcIhwFumYA4kUA+LuKEAYyGEQkWp1bdJ4lTkBBSVLGB1UBpZx7EIAsgBFvYJbdx
IzwePNP3WXVn7u+FUFPaBmRmBX9/2LgOdyqPnxxwRjpI9DVip1ToRsM6MXNRBGV2
0QIDAQAB
-----END PUBLIC KEY-----`;

  static encryptRequestData(decryptedData: any) {
    try {
      const key = jsrsasign.KEYUTIL.getKey(this.publicKey);

      const encryptedData = jsrsasign.KJUR.crypto.Cipher.encrypt(
        JSON.stringify(decryptedData),
        jsrsasign.KEYUTIL.getKey(key)
      );

      return encryptedData;
    } catch (error) {
      console.error('Encryption Error:', error);
      throw new Error(error);
    }
  }

  static decryptResponseData(encryptedData: string) {
    try {
      const key = jsrsasign.KEYUTIL.getKey(this.privateKey);

      const decryptedData = jsrsasign.KJUR.crypto.Cipher.decrypt(
        encryptedData,
        jsrsasign.KEYUTIL.getKey(key)
      );

      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Encryption Error:', error);
      throw new Error(error);
    }
  }
}

export class JWTEncryptDecryptInterceptor {
  private static privateKey: string = `-----BEGIN EC PRIVATE KEY-----
MIHcAgEBBEIBPs2XodNwMDAPiE1ONL3rUdfGrlr/7YZIzBo4Xdn0Nblj7bm99B7R
xw0z4oohhHSjzERA3HOBUt0W/FDJopS6t7OgBwYFK4EEACOhgYkDgYYABADZkRfZ
woKvKAOTF/SHB8FvCeozjXl2dhTjAizeRJiyvcM84RzOQPu6zusSCcXc4rOzwY2X
X4eZqU3zzjJAYOp9vQGOjYu0S5xefGqVAUhkYgv7aQuPIXsPL9FNFkUZwbJg9038
4k6+HnmXFLm5JePNLDwbWByVTDyjDXPW1d6RuHY4dA==
-----END EC PRIVATE KEY-----`;
  private static publicKey: string = `-----BEGIN PUBLIC KEY-----
MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQA2ZEX2cKCrygDkxf0hwfBbwnqM415
dnYU4wIs3kSYsr3DPOEczkD7us7rEgnF3OKzs8GNl1+HmalN884yQGDqfb0Bjo2L
tEucXnxqlQFIZGIL+2kLjyF7Dy/RTRZFGcGyYPdN/OJOvh55lxS5uSXjzSw8G1gc
lUw8ow1z1tXekbh2OHQ=
-----END PUBLIC KEY-----`;

  static encryptRequestData(data: any) {
    const encryptedData = jwt.sign(JSON.stringify(data), this.privateKey, {
      algorithm: 'ES512',
    });

    console.log('encryptedData', encryptedData);

    return encryptedData;
  }

  static decryptResponseData(encryptedData: string) {
    const decryptedData = jwt.verify(encryptedData, this.privateKey, {
      algorithms: ['ES512'],
    });

    console.log('decryptedData', decryptedData);

    return decryptedData;
  }
}
