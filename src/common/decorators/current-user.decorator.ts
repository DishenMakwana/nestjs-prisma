import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type Payload = {
  id: number;
  email: string;
};

type CurrentUserResponse = string | number | Payload;

export const CurrentUser = createParamDecorator(
  (
    data: string | undefined,
    context: ExecutionContext,
  ): CurrentUserResponse => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;
    return request.user[data];
  },
);
