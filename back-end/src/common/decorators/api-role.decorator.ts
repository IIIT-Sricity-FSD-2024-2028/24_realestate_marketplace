import { UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Roles } from './roles.decorator.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { Role } from '../enums/role.enum.js';

/**
 * Composite decorator that:
 * 1. Requires a valid JWT bearer token (JwtAuthGuard)
 * 2. Attaches required roles metadata and enforces it (RolesGuard)
 * 3. Documents bearer auth + 401/403 responses in Swagger
 *
 * @example @ApiRole(Role.ADMIN)
 */
export function ApiRole(...roles: Role[]) {
  return applyDecorators(
    Roles(...roles),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth('access-token'),
    ApiUnauthorizedResponse({ description: 'Missing or invalid authentication token' }),
    ApiForbiddenResponse({ description: `Forbidden. Required role(s): ${roles.join(', ')}` }),
  );
}
