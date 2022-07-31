import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiListQuery(): MethodDecorator {
  return applyDecorators(
    ApiQuery({ name: 'search', required: false }),
    ApiQuery({ name: 'limit', required: false }),
    ApiQuery({ name: 'page', required: true }),
  );
}
