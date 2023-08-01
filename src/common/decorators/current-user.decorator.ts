import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUserType } from '../types';

type CurrentUserResponse = string | number | AuthUserType;

export const CurrentUser = createParamDecorator(
  (
    data: string | undefined,
    context: ExecutionContext
  ): CurrentUserResponse => {
    const request = context.switchToHttp().getRequest();

    if (!data) return request.user;

    return request.user[data];
  }
);
