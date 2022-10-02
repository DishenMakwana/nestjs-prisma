import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error.status)
          return throwError(
            () =>
              new HttpException(
                {
                  statusCode: error.status,
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
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
                stack: error.stack,
                error: error,
              },
              error.status,
            ),
        );
      }),
    );
  }
}
