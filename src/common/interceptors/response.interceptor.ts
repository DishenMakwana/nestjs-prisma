import {
  CallHandler,
  Injectable,
  NestInterceptor,
  ExecutionContext,
  HttpException,
  InternalServerErrorException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { message } from '../assets/message.asset';
import * as camelize from 'camelize';
import { ConfigService } from '@nestjs/config';
import { NODE_ENVIRONMENT } from '../assets';

export interface Response<T> {
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  private logger: Logger = new Logger(ResponseInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const success_message = this.reflector.get<string>(
          'success_message',
          context.getHandler()
        );

        data = camelize(data);

        return {
          success: true,
          message:
            data !== undefined
              ? Object.hasOwn(data, 'message')
                ? data.message
                : success_message
              : message.SUCCESS_RESPONSE,
          data:
            data !== undefined
              ? Object.hasOwn(data, 'data')
                ? data.data
                : data
              : {},
        };
      }),

      catchError((error) => {
        if (error.status) {
          return throwError(() => {
            this.logger.error(ResponseInterceptor.name, error, error.stack);

            const message =
              typeof error.response.message === 'string'
                ? error.response.message
                : error.response.message[0];

            const response = {
              statusCode: error.status,
              success: false,
              message: message,
              exception: error.response.error,
              stack: error.stack,
              error: error,
            };

            if (
              this.configService.getOrThrow<string>('NODE_ENV') ===
              NODE_ENVIRONMENT.PRODUCTION
            ) {
              return new HttpException(
                { ...response, stack: undefined, error: undefined },
                error.status
              );
            }

            return new HttpException(response, error.status);
          });
        }

        return throwError(() => {
          this.logger.error(ResponseInterceptor.name, error, error.stack);

          const response = {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: error.message,
            stack: error.stack,
            error: error,
          };

          if (
            this.configService.getOrThrow<string>('NODE_ENV') ===
            NODE_ENVIRONMENT.PRODUCTION
          ) {
            return new InternalServerErrorException(
              { ...response, stack: undefined, error: undefined },
              error.status
            );
          }

          return new InternalServerErrorException(response, error.status);
        });
      })
    );
  }
}
