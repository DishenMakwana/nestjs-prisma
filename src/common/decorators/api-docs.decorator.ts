import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

export function ApiDocs(name = 'default', allAuth = true): ClassDecorator {
  name = name.toUpperCase();
  if (allAuth) {
    return applyDecorators(ApiTags(name), ApiBearerAuth());
  }
  return applyDecorators(ApiTags(name));
}
