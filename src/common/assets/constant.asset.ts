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
  INC_EVENT_LIKE_COUNT: 'inc.event.like.count',
  DEC_EVENT_LIKE_COUNT: 'dec.event.like.count',
  EVENT_RSVP_NO: 'event.rsvp.no',
  TEAM_MEMBER_ADDED: 'team.member.added',
  TEAM_MEMBER_REMOVED: 'team.member.removed',
  TEAM_CREATED: 'team.created',
  GO_TO_RANDOM_REQUEST: 'go.to.random.request',
  TEAM_MEMBER_UPDATE: 'team.member.update',
  TEAM_MEMBER_ADDED_NOTIFICATION: 'team.member.added.notification',
  TEAM_MEMBER_REMOVED_NOTIFICATION: 'team.member.removed.notification',
  TEAM_CREATED_NOTIFICATION: 'team.created.notification',
  GO_TO_RANDOM_REQUEST_NOTIFICATION: 'go.to.random.request.notification',
  TEAM_MEMBER_UPDATE_NOTIFICATION: 'team.member.update.notification',
  EVENT_REMINDER_NOTIFICATION: 'event.reminder.notification',
  EVENT_CHECK_IN_REMINDER_NOTIFICATION: 'event.check.in.reminder.notification',
  EVENT_PATH_GENERATE_EMAIL: 'event.path.generate.email',
  PUSHER_LOG: 'pusher.log',
  TEST_EMAIL: 'test.email',
  TEST_NOTIFICATION: 'test.notification',
};

export const PUSHER_EVENTS = {
  SEND: 'send-message',
  CHECKIN: 'check-in',
  RIDDLE: 'riddle',
  BONUS: 'bonus',
  FINAL: 'final',
};

export const NOTIFICATION_TYPE = {
  EVENT_REMINDER: 'EVENT_REMINDER',
  EVENT_CHECK_IN_REMINDER: 'EVENT_CHECK_IN_REMINDER',
  CREATE_TEAM: 'CREATE_TEAM',
  UPDATE_TEAM: 'UPDATE_TEAM',
  REMOVE_FROM_TEAM: 'REMOVE_FROM_TEAM',
};

export const SOCIAL_LOGIN_PROVIDER = {
  GOOGLE: 'google',
  APPLE: 'apple',
};

export const QR_CODE_TYPE = {
  CHECK_IN_LOCATION: 'check-in-location',
  RIDDLE_LOCATION: 'riddle-location',
  BONUS_LOCATION: 'bonus-location',
  FINAL_LOCATION: 'final-location',
};

export const UPDATE_NOTIFICATION = {
  RSVP_NO: 'RSVP_NO',
  TEAM_MEMBER_UPDATED: 'TEAM_MEMBER_UPDATED',
};

export const EmailSubject = {
  ACCOUNT_VERIFICATION: 'Account Verification',
  FORGOT_PASSWORD: 'Forgot Password Request',
  RSVP_NO: 'RSVP No to an Event',
  TEAM_MEMBER_REMOVED: 'Removed from an Event',
  TEAM_MEMBER_ADDED: 'Added to an Event',
  GO_TO_RANDOM_REQUEST: 'Go Random Request for an Event',
  TEAM_CREATED: 'Team Created',
  TEAM_MEMBER_UPDATE: 'Team Member Updated',
  EVENT_PATH_GENERATE: 'Event Path Generate',
  TEST_EMAIL: 'Test Email',
};

export const ConfigData = {
  DOMAIN: 'domain',
  BONUS_LOCATION_RADIUS: 'bonusLocationRadius',
  SAFETY_TIPS: 'safetyTips',
  PRIVACY_POLICY: 'privacyPolicy',
  TERMS_CONDITIONS: 'termsConditions',
  IOS_URL: 'iosUrl',
  ANDROID_URL: 'androidUrl',
};
