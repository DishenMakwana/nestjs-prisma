import * as pusher from 'pusher';

const appId: string = process.env.SOKETI_APP_ID || '';
const appKey: string = process.env.SOKETI_APP_KEY || '';
const appSecret: string = process.env.SOKETI_APP_SECRET || '';
const appEncKey: string = process.env.SOKETI_APP_ENC_KEY;
const appHost: string = process.env.SOKETI_APP_HOST || '';
const appPort: string = process.env.SOKETI_APP_PORT || '';
const appTLS: boolean = process.env.SOKETI_APP_TLS === 'true';

const pusherConnection = new pusher({
  appId,
  key: appKey,
  secret: appSecret,
  useTLS: appTLS,
  encryptionMasterKeyBase64: appEncKey,
  host: appHost,
  port: appPort,
});

export default pusherConnection;
