import { Role } from '@prisma/client';

export type UserForToken = {
  id: number;
  email: string;
  role: string;
};

export type LoginResponse = {
  user: {
    id?: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    email?: string;
    role?: Role;
    logo: string;
    is_verified?: boolean;
    is_onboarded?: boolean;
    is_social_register?: boolean;
    provider?: string;
    provider_id?: string;
  };
  access_token: string | null;
};
