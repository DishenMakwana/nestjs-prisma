import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiListQuery(): MethodDecorator {
  return applyDecorators(
    ApiQuery({ name: 'limit', required: false }),
    ApiQuery({ name: 'page', required: true }),
    ApiQuery({ name: 'search', required: false }),
    ApiQuery({ name: 'sort', required: false }),
    ApiQuery({ name: 'order', required: false })
  );
}

export function ApiFilterDateQuery(): MethodDecorator {
  return applyDecorators(
    ApiQuery({ name: 'startDate', required: false }),
    ApiQuery({ name: 'endDate', required: false })
  );
}
