import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { CustomRequest, RequestInfo } from '../types';

export const UserRequestInfo = createParamDecorator(
  (
    data: string | undefined,
    context: ExecutionContext
  ): RequestInfo | undefined => {
    const request: CustomRequest = context.switchToHttp().getRequest();

    if (!data) return request.requestInfo;

    return request.requestInfo[data];
  }
);
