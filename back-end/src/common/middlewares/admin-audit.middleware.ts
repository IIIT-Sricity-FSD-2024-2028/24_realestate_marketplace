import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { fileLogger } from '../logging/file-logger.js';
import { clientIp, describeUser } from './http-logger.middleware.js';
import { ContextualRequest, elapsedMs } from './request-context.middleware.js';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Router-level middleware — bound to the privileged route groups (admins, users,
 * properties, purchases, payments … see AppModule.configure).
 *
 * Reads are ignored; every *write* is recorded in `logs/audit/*.log` with the
 * acting user, so "who approved this property / deleted this listing / moved this
 * payment" has an answer that doesn't depend on anyone remembering.
 *
 * `req.user` is only populated once JwtAuthGuard has run — which happens after
 * middleware — so the entry is written on the response's `finish` event, by which
 * time the actor is known.
 */
@Injectable()
export class AdminAuditMiddleware implements NestMiddleware {
  use(req: ContextualRequest, res: Response, next: NextFunction): void {
    if (!STATE_CHANGING_METHODS.has(req.method)) return next();

    res.on('finish', () => {
      const succeeded = res.statusCode < 400;
      fileLogger.audit(`${req.method} ${req.originalUrl} by ${describeActor(req)}`, {
        level: succeeded ? 'info' : 'warn',
        event: 'privileged.write',
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        outcome: succeeded ? 'success' : 'failure',
        actor: describeUser(req) ?? 'anonymous',
        ip: clientIp(req),
        durationMs: Number(elapsedMs(req).toFixed(3)),
      });
    });

    next();
  }
}

function describeActor(req: ContextualRequest): string {
  const user = describeUser(req) as { email?: string; role?: string } | undefined;
  if (!user) return 'anonymous';
  return `${user.email ?? 'unknown'} (${user.role ?? 'no role'})`;
}
