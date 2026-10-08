import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Verifies the `Authorization: Bearer <token>` header using the `jwt`
 * passport strategy and attaches the decoded user to `request.user`.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: unknown, user: TUser, info: unknown, _context: ExecutionContext): TUser {
    if (err || !user) {
      const reason =
        info instanceof Error && info.message === 'jwt expired'
          ? 'Your session has expired. Please log in again.'
          : 'Missing or invalid authentication token';
      throw new UnauthorizedException(reason);
    }
    return user;
  }
}
