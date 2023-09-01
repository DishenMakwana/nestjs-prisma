import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Origin = createParamDecorator(
  (_, context: ExecutionContext): string | undefined => {
    return context.switchToHttp().getRequest<Request>().headers?.host;
  }
);
