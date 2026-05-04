import { UseGuards, applyDecorators } from '@nestjs/common';
import { ApiHeader, ApiSecurity, ApiForbiddenResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { Roles } from './roles.decorator.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Role } from '../enums/role.enum.js';

/**
 * Composite decorator that:
 * 1. Attaches required roles metadata (@Roles)
 * 2. Applies the RolesGuard
 * 3. Documents the role header in Swagger
 * 4. Documents 400/403 responses in Swagger
 *
 * @example @ApiRole(Role.ADMIN, Role.AGENT)
 */
export function ApiRole(...roles: Role[]) {
  return applyDecorators(
    Roles(...roles),
    UseGuards(RolesGuard),
    ApiSecurity('role-header'),
    ApiHeader({
      name: 'role',
      description: `Required role. Allowed: ${roles.join(' | ')}`,
      required: true,
      example: roles[0],
    }),
    ApiBadRequestResponse({ description: 'Missing or invalid role header' }),
    ApiForbiddenResponse({ description: `Forbidden. Required role(s): ${roles.join(', ')}` }),
  );
}
