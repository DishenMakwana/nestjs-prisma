import {
  CanActivate,
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from '@prisma/client';
import { message } from '../assets';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const [requiredRoles, isPublic] = [
      this.reflector.getAllAndOverride<Role[]>('roles', [
        context.getHandler(),
        context.getClass(),
      ]),
      this.reflector.getAllAndOverride<boolean>('isPublic', [
        context.getHandler(),
        context.getClass(),
      ]),
    ];

    const request = context.switchToHttp().getRequest();

    if (isPublic && !request.user) {
      return true;
    }

    if (!requiredRoles || requiredRoles.length === 0) {
      return false;
    }

    const userRole: Role = request.user.role;

    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException(message.FORBIDDEN_RESOURCE);
    }

    return true;
  }
}
