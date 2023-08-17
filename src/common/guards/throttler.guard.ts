import { ContextType, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const reqType = context.getType<ContextType | 'graphql'>();

    if (reqType === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext();

      return { req: ctx.req, res: ctx.res };
    } else if (reqType === 'http') {
      return {
        req: context.switchToHttp().getRequest(),
        res: context.switchToHttp().getResponse(),
      };
    } else {
      // handle rpc and ws if you have them, otherwise ignore and make previous `else if` just an `else`
    }
  }
}
