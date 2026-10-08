import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Like JwtAuthGuard, but never rejects the request — it just attaches
 * `request.user` when a valid bearer token is present, and leaves it
 * `undefined` otherwise (no token, expired, malformed). Used on routes that
 * are public but behave differently for a logged-in caller (e.g. a property
 * detail page showing private documents only to its own seller/admin).
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(_err: unknown, user: TUser): TUser {
    return user;
  }
}
