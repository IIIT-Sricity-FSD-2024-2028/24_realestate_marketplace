import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role } from '../enums/role.enum.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

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

    const request = context.switchToHttp().getRequest<Request>();
    const roleHeader = request.headers['role'] as string;

    if (!roleHeader) {
      throw new BadRequestException(
        'Missing required header: role. Must be one of: superuser, admin, agent, seller, buyer',
      );
    }

    const validRoles = Object.values(Role) as string[];
    if (!validRoles.includes(roleHeader)) {
      throw new BadRequestException(
        `Invalid role "${roleHeader}". Must be one of: ${validRoles.join(', ')}`,
      );
    }

    const userRole = roleHeader as Role;
    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException(
        `Access denied. Required role(s): ${requiredRoles.join(', ')}. Your role: ${userRole}`,
      );
    }

    return true;
  }
}
