import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: {
    permissions?: string[];
    [key: string]: unknown;
  };
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user || !user.permissions) {
      throw new ForbiddenException('Acceso denegado: permisos no identificados');
    }

    const permissions = user.permissions;
    const hasAllPermissions = requiredPermissions.every((perm) => permissions.includes(perm));

    if (!hasAllPermissions) {
      throw new ForbiddenException('Acceso denegado: no cuenta con los permisos requeridos');
    }

    return true;
  }
}
