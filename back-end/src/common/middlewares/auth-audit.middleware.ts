import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { fileLogger } from '../logging/file-logger.js';
import { clientIp } from './http-logger.middleware.js';
import { ContextualRequest, elapsedMs } from './request-context.middleware.js';

/**
 * Router-level middleware — bound to the auth routes only (see AppModule.configure).
 *
 * Every credential-handling call leaves a line in `logs/audit/*.log`: who tried,
 * from where, and whether it worked. That's what makes "the same IP failed 40
 * logins in a minute" a question you can actually answer after the fact.
 *
 * The password is never read, never logged, and never leaves the request body.
 */
@Injectable()
export class AuthAuditMiddleware implements NestMiddleware {
  use(req: ContextualRequest, res: Response, next: NextFunction): void {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const email = typeof body.email === 'string' ? body.email : undefined;
    // `req.path` is the full path (/api/v1/auth/login) — the last segment is the
    // action, which is what makes a useful event name (`auth.login`).
    const action = req.path.split('/').filter(Boolean).pop() ?? 'auth';

    res.on('finish', () => {
      const succeeded = res.statusCode < 400;
      fileLogger.audit(`Auth ${action} ${succeeded ? 'succeeded' : 'failed'}`, {
        level: succeeded ? 'info' : 'warn',
        event: `auth.${action}`,
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        outcome: succeeded ? 'success' : 'failure',
        email,
        ip: clientIp(req),
        userAgent: req.headers['user-agent'],
        durationMs: Number(elapsedMs(req).toFixed(3)),
      });
    });

    next();
  }
}
