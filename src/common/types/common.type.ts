import { Request } from 'express';

export type RoleType = 'admin' | 'user';

export type AuthUserType = {
  id: number;
  email: string;
  role: RoleType;
  access_token: string;
  username: string;
};

export type PayloadType = {
  search?: string | null;
  limit?: number;
  page?: number;
  sort?: string | null;
  order?: string | null;
};

export type Tokens = {
  access_token: string;
};

export type Payload = {
  sub: string;
  email: string;
  role: number;
};

export type UserRegisterEvent = {
  email: string;
  otp: string;
};

export type ForgotPasswordEvent = {
  email: string;
  otp: string;
};

export type OrderType = 'asc' | 'desc';

export type AWSFileType = {
  fileName: string;
  mimetype: string;
};

export type RequestInfo = {
  ip: string;
  host: string;
  referer: string;
  method: string;
  originalUrl: string;
  ua: string;
  userAgent: object;
};

export interface CustomRequest extends Request {
  requestInfo: RequestInfo;
}

export type Algorithm =
  | 'HS256'
  | 'HS384'
  | 'HS512'
  | 'RS256'
  | 'RS384'
  | 'RS512'
  | 'ES256'
  | 'ES384'
  | 'ES512'
  | 'PS256'
  | 'PS384'
  | 'PS512'
  | 'none';

export type AppleIdTokenType = {
  iss: string;
  sub: string;
  aud: string;
  exp: string;
  iat: string;
  nonce: string;
  nonce_supported: boolean;
  email: string;
  email_verified: 'true' | 'false' | boolean;
  is_private_email: 'true' | 'false' | boolean;
};

export type GoogleUser = {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
  hd: string;
};
