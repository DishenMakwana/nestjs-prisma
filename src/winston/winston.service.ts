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

    if (logToFile) {
      const transportsArray = [];
      const mainDirectory = process.cwd();
      const logDirectory = path.join(mainDirectory, 'logs');

      const currentDate = new Date().toISOString().split('T')[0];
      const filename = path.join(logDirectory, `${currentDate}.log`);

      const fileTransport = new transports.File({
        filename: filename,
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

      // Intercept console.error and redirect it to the Winston logger
      const originalConsoleError = console.error;
      console.error = (...args: any[]) => {
        this.logger.log('error', { message: args }); // Log objects as JSON
        originalConsoleError.apply(console, args);
      };

      // Intercept console.warn and redirect it to the Winston logger
      const originalConsoleWarn = console.warn;
      console.warn = (...args: any[]) => {
        this.logger.log('warn', { message: args }); // Log objects as JSON
        originalConsoleWarn.apply(console, args);
      };

      // Intercept console.info and redirect it to the Winston logger
      const originalConsoleInfo = console.info;
      console.info = (...args: any[]) => {
        this.logger.log('info', { message: args }); // Log objects as JSON
        originalConsoleInfo.apply(console, args);
      };

      // Intercept console.debug and redirect it to the Winston logger
      const originalConsoleDebug = console.debug;
      console.debug = (...args: any[]) => {
        this.logger.log('debug', { message: args }); // Log objects as JSON
        originalConsoleDebug.apply(console, args);
      };
    }
  }
}
