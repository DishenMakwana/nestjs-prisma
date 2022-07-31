import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiDescription(
  description: string | null | undefined,
): MethodDecorator {
  if (description) {
    return applyDecorators(ApiOperation({ description: description }));
  }
  return applyDecorators();
}
