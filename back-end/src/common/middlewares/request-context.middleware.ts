import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

/** Shape of the extra fields the middleware chain hangs off the request. */
export interface RequestContext {
  /** Correlation id — echoed back as `X-Request-Id` and stamped on every log line. */
  requestId?: string;
  /** `process.hrtime.bigint()` at the moment the request entered the app. */
  startedAt?: bigint;
}

export type ContextualRequest = Request &
  RequestContext & {
    user?: { userId?: string; id?: string; email?: string; role?: string };
  };

/**
 * Application-level middleware — the very first thing every request touches.
 *
 * Gives each request an id and a start timestamp, so the HTTP log line, the audit
 * line and any error written by the exception filter can all be tied back to the
 * same request later (grep the request id across the files in logs/). A client may supply its
 * own `X-Request-Id` to trace a call across services; otherwise we mint one.
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: ContextualRequest, res: Response, next: NextFunction): void {
    const incoming = req.headers['x-request-id'];
    const requestId =
      typeof incoming === 'string' && /^[\w-]{1,64}$/.test(incoming) ? incoming : randomUUID();

    req.requestId = requestId;
    req.startedAt = process.hrtime.bigint();
    res.setHeader('X-Request-Id', requestId);

    next();
  }
}

/** Milliseconds elapsed since the request entered the app, to 3 decimal places. */
export function elapsedMs(req: ContextualRequest): number {
  if (req.startedAt === undefined) return 0;
  return Number(process.hrtime.bigint() - req.startedAt) / 1e6;
}
