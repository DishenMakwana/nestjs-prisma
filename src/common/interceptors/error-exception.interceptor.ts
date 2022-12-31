import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  InternalServerErrorException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const logger: Logger = new Logger('Error Exception Interceptor');

    return next.handle().pipe(
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
