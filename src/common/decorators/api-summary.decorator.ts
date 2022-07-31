import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiSummary(
  description: string | null | undefined,
): MethodDecorator {
  if (description) {
    return applyDecorators(ApiOperation({ summary: description }));
  }
  return applyDecorators();
}
