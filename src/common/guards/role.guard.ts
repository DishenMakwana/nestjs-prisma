import {
  CanActivate,
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { message } from '../assets/message.asset';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const [roles, isPublic] = [
      this.reflector.get<string[]>('roles', context.getHandler()),
      this.reflector.get<boolean>('isPublic', context.getHandler()),
    ];

    console.log(roles, isPublic);
    const request = context.switchToHttp().getRequest();

    if (isPublic && !request.user) {
      return true;
    }

    if (!roles || roles.length == 0) return false;

    const role = request.user.role;

    if (!roles.includes(role))
      throw new ForbiddenException(message.UNAUTHORIZED);

    return roles.includes(role);
  }
}
