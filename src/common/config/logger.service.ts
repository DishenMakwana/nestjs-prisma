import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class LoggerService extends ConsoleLogger {
  private readonly _logger: winston.Logger;

  constructor(private readonly configService: ConfigService) {
    super(LoggerService.name, { timestamp: true });

    this._logger = winston.createLogger({
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
          level: 'debug',
          handleExceptions: true,
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({
              format: 'DD-MM-YYYY HH:mm:ss',
            }),
            winston.format.simple()
          ),
        }),
      ],
    });

    if (this.configService.getOrThrow<string>('NODE_ENV') !== 'production') {
      this._logger.debug('Logging initialized at debug level');
    }
  }

  log(message: string): void {
    this._logger.info(message);
  }

  info(message: string): void {
    this._logger.info(message);
  }

  debug(message: string): void {
    this._logger.debug(message);
  }

  error(message: string, trace?: any, context?: string): void {
    // i think the trace should be JSON Stringified
    this._logger.error(
      `${context || ''} ${message} -> (${trace || 'trace not provided !'})`
    );
  }

  warn(message: string): void {
    this._logger.warn(message);
  }
}
