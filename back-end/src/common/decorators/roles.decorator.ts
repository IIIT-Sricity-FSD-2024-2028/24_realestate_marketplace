import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum.js';

export const ROLES_KEY = 'roles';

/**
 * Attach required roles to a route or controller.
 * @example @Roles(Role.ADMIN, Role.AGENT)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
