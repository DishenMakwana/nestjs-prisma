import {
  CallHandler,
  Injectable,
  NestInterceptor,
  ExecutionContext,
  HttpException,
  InternalServerErrorException,
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
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const success_message = this.reflector.get<string[]>(
          'success_message',
          context.getHandler(),
        );
        data = camelize(data);
        return {
          success: true,
          message: success_message ?? message.SUCCESS_RESPONSE,
          data: data,
        };
      }),
      catchError((error) => {
        if (error.status)
          return throwError(
            () =>
              new HttpException(
                {
                  success: false,
                  message: error.message,
                  stack: error.stack,
                  error: error,
                },
                error.status,
              ),
          );

        return throwError(
          () =>
            new InternalServerErrorException(
              {
                success: false,
                message: error.message,
                stack: error.stack,
              },
              error.status,
            ),
        );
      }),
    );
  }
}
