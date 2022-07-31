export type RoleType = 'admin' | 'user';

export type AuthUserType = {
  id: number;
  role: RoleType;
  email: string;
  access_token: string;
};
