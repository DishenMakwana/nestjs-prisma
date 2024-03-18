import { Injectable } from '@nestjs/common';
import { createLogger, transports, format } from 'winston';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

@Injectable()
export class WinstonService {
  private readonly logger;

  constructor(private readonly configService: ConfigService) {
    const logToFile =
      this.configService.get<string>('WRITE_LOG_IN_FILE') === 'true';

    const transportsArray = [];

    if (logToFile) {
      const logDirectory = path.join(__dirname, '../../logs');
      const fileTransport = new transports.File({
        filename: path.join(logDirectory, 'combined.log'),
        format: format.combine(
          format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
          }),
          format.json() // Log objects as JSON in the file
        ),
      });

      transportsArray.push(fileTransport);

      this.logger = createLogger({
        transports: transportsArray,
        format: format.combine(
          format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
          }),
          format.printf(
            (info) => `${info.timestamp} ${info.level}: ${info.message}`
          )
        ),
      });

      // Intercept console.log and redirect it to the Winston logger
      const originalConsoleLog = console.log;
      console.log = (...args: any[]) => {
        this.logger.log('info', { message: args }); // Log objects as JSON
        originalConsoleLog.apply(console, args);
      };

      const originalConsoleError = console.error;
      console.error = (...args: any[]) => {
        this.logger.log('error', { message: args }); // Log objects as JSON
        originalConsoleError.apply(console, args);
      };
    }
  }
}
