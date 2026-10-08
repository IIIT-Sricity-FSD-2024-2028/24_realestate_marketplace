import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../../modules/auth/interfaces/authenticated-user.interface.js';

/**
 * Extracts the authenticated user attached to the request by JwtAuthGuard.
 * @example create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreatePropertyDto)
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<Request & { user: AuthenticatedUser }>();
    return request.user;
  },
);
