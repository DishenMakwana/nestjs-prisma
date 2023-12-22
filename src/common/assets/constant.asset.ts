export const RoleType = {
  ADMIN: 1,
  USER: 2,
};

export const NODE_ENVIRONMENT = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  STAGING: 'staging',
};

export const Actions = {
  LOGIN: 1,
  LOGOUT: 2,
  FORGOT_PASSWORD: 3,
  RESET_PASSWORD: 4,
  CREATE_USER: 5,
  UPDATE_USER: 6,
  DELETE_USER: 7,
  OTP_VERIFY: 8,
};

export const taskEvent = {
  USER_REGISTER: 'user.register',
  FORGOT_PASSWORD: 'forgot.password',
  TEST_EMAIL: 'test.email',
};

export const SOCIAL_LOGIN_PROVIDER = {
  GOOGLE: 'google',
  APPLE: 'apple',
};

export const EmailSubject = {
  ACCOUNT_VERIFICATION: 'Account Verification',
  FORGOT_PASSWORD: 'Forgot Password Request',
  TEST_EMAIL: 'Test Email',
};

export const CustomResponse = (data: any, message?: string) => {
  return message ? { message, data } : { data };
};
