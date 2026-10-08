import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role } from '../enums/role.enum.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { AuthenticatedUser } from '../../modules/auth/interfaces/authenticated-user.interface.js';

/**
 * Authorizes the request based on the role of `request.user`, which must
 * already have been populated by JwtAuthGuard (see the `@ApiRole()` decorator,
 * which applies both guards together in the correct order).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Route has no @Roles() — publicly accessible
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const user = request.user;

    // Superuser is a superset role — it automatically satisfies any specific
    // role requirement (e.g. a route guarded with @ApiRole(Role.ADMIN) is
    // also reachable by a superuser) rather than needing every admin-only
    // route updated to list it explicitly.
    if (user?.role === Role.SUPERUSER) {
      return true;
    }

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Access denied. Required role(s): ${requiredRoles.join(', ')}.` +
          (user ? ` Your role: ${user.role}` : ''),
      );
    }

    return true;
  }
}
