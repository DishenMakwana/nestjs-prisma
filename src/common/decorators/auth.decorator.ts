import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ATGuard } from '../guards/at.guard';
import { Role } from '@prisma/client';
import { RolesGuard } from '../guards';

type Authorization = {
  roles?: Role[];
};

export function Auth(authorization: Authorization): MethodDecorator {
  const { roles } = authorization;

  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(ATGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' })
  );
}
