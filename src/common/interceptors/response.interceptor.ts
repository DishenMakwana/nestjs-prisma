import {
  CallHandler,
  Injectable,
  NestInterceptor,
  ExecutionContext,
  HttpException,
  InternalServerErrorException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { message } from '../assets/message.asset';
import * as camelize from 'camelize';
import { catchError } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const logger: Logger = new Logger('Response Interceptor');

    return next.handle().pipe(
      map((data) => {
        const success_message =
          (typeof data === 'object' ? data.message : undefined) ??
          this.reflector.get<string[]>('success_message', context.getHandler());

        data = camelize(data);

        data =
          typeof data === 'object'
            ? {
                ...data,
                message: undefined,
              }
            : data;

        return {
          success: true,
          message: success_message ?? message.SUCCESS_RESPONSE,
          data: data,
        };
      }),

      catchError((error) => {
        if (error.status) {
          return throwError(() => {
            logger.error(error.message, error.stack);

            return new HttpException(
              {
                statusCode: error.status,
                success: false,
                message: error.message,
                stack: error.stack,
                error: error,
              },
              error.status,
            );
          });
        }

        return throwError(() => {
          logger.error(error.message, error.stack);

          return new InternalServerErrorException(
            {
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              success: false,
              message: error.message,
              stack: error.stack,
              error: error,
            },
            error.status,
          );
        });
      }),
    );
  }
}
