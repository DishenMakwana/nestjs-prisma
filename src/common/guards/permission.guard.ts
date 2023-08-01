// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { Observable } from 'rxjs';
// import { Permission, Role } from '@prisma/client';

// @Injectable()
// export class PermissionGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}

//   canActivate(
//     context: ExecutionContext
//   ): boolean | Promise<boolean> | Observable<boolean> {
//     const [requiredPermissions, isPublic] = [
//       this.reflector.getAllAndOverride<Permission[]>('permissions', [
//         context.getHandler(),
//         context.getClass(),
//       ]),
//       this.reflector.getAllAndOverride<boolean>('isPublic', [
//         context.getHandler(),
//         context.getClass(),
//       ]),
//     ];

//     const request = context.switchToHttp().getRequest();

//     if (isPublic && !request.user) {
//       return true;
//     }

//     const userRole: Role = request.user.role;

//     // Admin can do everything
//     if (userRole === Role.admin) {
//       return true;
//     }

//     if (!requiredPermissions || requiredPermissions.length === 0) {
//       return false;
//     }

//     const userPermission: Permission = request.user.permission;

//     return requiredPermissions.includes(userPermission);
//   }
// }
