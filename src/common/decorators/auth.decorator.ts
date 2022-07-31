import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { Role } from '@prisma/client';
import { ATGuard } from '../guards/at.guard';
import { RolesGuard } from '../guards/role.guard';

export function Auth(...roles: Role[]): MethodDecorator {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(ATGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
