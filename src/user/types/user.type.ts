import { Prisma } from '@prisma/client';

export type PusherLogEvent = {
  event_id: number;
  event_name: string;
  channel_name: string;
  data: Prisma.JsonValue;
};
