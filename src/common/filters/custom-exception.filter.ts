import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NODE_ENVIRONMENT, message } from '../assets';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly configService: ConfigService
  ) {}

  catch(exception: object, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const path = ctx.getRequest().url;

    console.error(CustomExceptionFilter.name, exception);

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();

      const errorMessage =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : typeof exceptionResponse.message === 'string'
            ? exceptionResponse?.message
            : exceptionResponse?.message[0];

      const stack =
        this.configService.getOrThrow<string>('NODE_ENV') ===
        NODE_ENVIRONMENT.PRODUCTION
          ? undefined
          : exception.stack ?? undefined;

      const responseBody = {
        statusCode: status,
        success: false,
        message: errorMessage,
        stack,
        error: exception,
        path,
      };

      httpAdapter.reply(ctx.getResponse(), responseBody, status);
    } else {
      const messages =
        this.configService.getOrThrow<string>('NODE_ENV') ===
        NODE_ENVIRONMENT.PRODUCTION
          ? undefined
          : (exception as TypeError).message ?? undefined;

      const stack =
        this.configService.getOrThrow<string>('NODE_ENV') ===
        NODE_ENVIRONMENT.PRODUCTION
          ? undefined
          : (exception as TypeError).stack ?? undefined;

      const status =
        (exception as TypeError).cause ?? HttpStatus.INTERNAL_SERVER_ERROR;

      httpAdapter.reply(
        ctx.getResponse(),
        {
          statusCode:
            (exception as any).name === 'JsonWebTokenError'
              ? HttpStatus.UNAUTHORIZED
              : status ?? HttpStatus.INTERNAL_SERVER_ERROR,
          success: false,
          message: messages ?? message.INTERNAL_SERVER_ERROR,
          stack,
          error: exception,
          path,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
