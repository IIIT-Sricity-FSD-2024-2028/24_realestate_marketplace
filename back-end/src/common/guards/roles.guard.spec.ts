import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum.js';
import { RolesGuard } from './roles.guard.js';

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  /** A context carrying the roles a route requires and the user making the call. */
  const contextFor = (requiredRoles: Role[] | undefined, role?: Role): ExecutionContext => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
    return {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => (role ? { user: { role } } : {}) }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  afterEach(() => jest.restoreAllMocks());

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('allows a route with no @Roles() through — those are public', () => {
    expect(guard.canActivate(contextFor(undefined))).toBe(true);
    expect(guard.canActivate(contextFor([]))).toBe(true);
  });

  it('allows a user whose role is listed', () => {
    expect(guard.canActivate(contextFor([Role.ADMIN], Role.ADMIN))).toBe(true);
  });

  it('lets the superuser satisfy any role requirement', () => {
    expect(guard.canActivate(contextFor([Role.ADMIN], Role.SUPERUSER))).toBe(true);
    expect(guard.canActivate(contextFor([Role.USER], Role.SUPERUSER))).toBe(true);
  });

  it('rejects a user whose role is not listed', () => {
    expect(() => guard.canActivate(contextFor([Role.ADMIN], Role.USER))).toThrow(ForbiddenException);
  });

  it('rejects an unauthenticated request on a role-guarded route', () => {
    expect(() => guard.canActivate(contextFor([Role.ADMIN]))).toThrow(ForbiddenException);
  });
});
