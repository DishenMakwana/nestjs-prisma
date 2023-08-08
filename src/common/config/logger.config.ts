import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { utilities } from 'nest-winston';

@Injectable()
export class LoggerConfig {
  constructor(private readonly configService: ConfigService) {}

  get getLoggerConfig() {
    return {
      format: winston.format.colorize(),
      exitOnError: false,
      transports: [
        new DailyRotateFile({
          level: 'debug',
          filename: `./logs/${this.configService.getOrThrow<string>(
            'NODE_ENV'
          )}/debug-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
        new DailyRotateFile({
          level: 'error',
          filename: `./logs/${this.configService.getOrThrow<string>(
            'NODE_ENV'
          )}/error-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxSize: '20m',
          maxFiles: '30d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            utilities.format.nestLike('NestJS Prisma', {
              prettyPrint: true,
            })
          ),
        }),
        // new winston.transports.Console({
        //   level: 'debug',
        //   handleExceptions: true,
        //   format: winston.format.combine(
        //     winston.format.colorize(),
        //     winston.format.timestamp({
        //       format: 'DD-MM-YYYY HH:mm:ss',
        //     }),
        //     winston.format.simple()
        //   ),
        // }),
      ],
    };
  }
}
