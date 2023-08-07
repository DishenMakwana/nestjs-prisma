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
import { map, catchError } from 'rxjs/operators';
import { message } from '../assets/message.asset';
import * as camelize from 'camelize';
import { ConfigService } from '@nestjs/config';
import { NODE_ENVIRONMENT } from '../assets';
import { CryptoEncryptDecryptInterceptor } from '../middleware';

export interface Response<T> {
  data: T;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, Response<T> | string>
{
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Response<T> | string> {
    const logger: Logger = new Logger(ResponseInterceptor.name);

    return next.handle().pipe(
      map((data) => {
        const success_message = this.reflector.get<string>(
          'success_message',
          context.getHandler()
        );

        data = camelize(data);

        const response = {
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

        // return response;

        return CryptoEncryptDecryptInterceptor.encryptRequestData(
          response,
          'cryptoKey@123$%'
        );

        // return JsrsasignEncryptDecryptInterceptor.encryptRequestData(response);

        // return JWTEncryptDecryptInterceptor.encryptRequestData(response);
      }),

      catchError((error) => {
        if (error.status) {
          return throwError(() => {
            logger.error({ error });

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
          logger.error({ error });

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
