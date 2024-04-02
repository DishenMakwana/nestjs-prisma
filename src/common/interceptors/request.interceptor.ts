import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UAParser } from 'ua-parser-js';
import { CustomRequest, RequestInfo } from '../types';
import * as requestIp from 'request-ip';

export const getRequestInfo = (request: CustomRequest): RequestInfo => {
  const ip = requestIp.getClientIp(request); // Get the request IP
  const userAgent = request.headers['user-agent']; // Get the user agent
  const host = request.get('host'); // Get the request host
  const referer = request.headers['referer']; // Get the referer
  const method = request.method; // Get the request method
  const originalUrl = request.originalUrl; // Get the original URL

  const parser = new UAParser();
  const parsedUserAgent = parser.setUA(userAgent).getResult();

  const requestInfo: RequestInfo = {
    ip,
    host,
    referer,
    method,
    originalUrl,
    ua: userAgent,
    userAgent: parsedUserAgent,
  };

  return requestInfo;
};

@Injectable()
export class RequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: CustomRequest = context.switchToHttp().getRequest();

    const requestInfoData = getRequestInfo(request);

    // add this info to the request object
    request.requestInfo = requestInfoData;

    return next.handle();
  }
}
