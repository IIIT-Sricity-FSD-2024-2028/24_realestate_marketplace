import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { fileLogger } from '../logging/file-logger.js';
import { clientIp } from './http-logger.middleware.js';
import { ContextualRequest } from './request-context.middleware.js';

const WINDOW_MS = Number(process.env.STATIC_RATE_LIMIT_TTL_MS ?? 60_000);
const MAX_REQUESTS = Number(process.env.STATIC_RATE_LIMIT ?? 100);

/** Re-exported so bootstrap can print the live value in the startup banner. */
export const STATIC_RATE_LIMIT = MAX_REQUESTS;

/** Paths the Nest pipeline already guards, or that must never be throttled. */
const SKIPPED_PREFIXES = ['/api/v1', '/health'];

type Window = { count: number; resetAt: number };

/** Fixed-window counters, keyed by client IP. Pruned lazily on each sweep. */
const windows = new Map<string, Window>();
let lastPrune = 0;

/**
 * Rate limiting for everything Nest's `ThrottlerGuard` structurally cannot see.
 *
 * `main.ts` serves `public/` and `uploads/` via `app.useStaticAssets(...)`, which is
 * Express `serve-static` middleware sitting *in front of* the Nest router. Guards —
 * including the global `ThrottlerGuard` — only run once a request matches a controller
 * handler, so a static file is answered and the response finished before any guard
 * exists. That left `/index.html`, every dashboard `.css`/`.js`, and every uploaded
 * document unlimited: 500 requests in a loop all returned 200.
 *
 * This closes that hole at the Express layer instead. It is registered before
 * `useStaticAssets` so it runs first, and it deliberately skips `/api/v1/*` and
 * `/health` — ThrottlerGuard owns the former (at its own, stricter per-route limits)
 * and the latter must stay reachable for liveness probes even while an IP is blocked.
 *
 * Counters are per-process and in-memory, matching ThrottlerModule's default storage.
 * Behind more than one instance, both need a shared (Redis) store to be exact.
 */
@Injectable()
export class StaticRateLimitMiddleware implements NestMiddleware {
  use(req: ContextualRequest, res: Response, next: NextFunction): void {
    const path = req.path ?? req.originalUrl;
    if (SKIPPED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
      return next();
    }

    const now = Date.now();
    prune(now);

    const key = rateLimitKey(req);
    let window = windows.get(key);
    if (!window || window.resetAt <= now) {
      window = { count: 0, resetAt: now + WINDOW_MS };
      windows.set(key, window);
    }
    window.count += 1;

    const remaining = Math.max(0, MAX_REQUESTS - window.count);
    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(window.resetAt / 1000));

    if (window.count > MAX_REQUESTS) {
      const retryAfter = Math.max(1, Math.ceil((window.resetAt - now) / 1000));
      res.setHeader('Retry-After', retryAfter);

      // Only the first rejection of a window is logged; a blocked flood would
      // otherwise write one audit line per request and drown the trail.
      if (window.count === MAX_REQUESTS + 1) {
        fileLogger.audit('Static asset rate limit exceeded', {
          level: 'warn',
          event: 'ratelimit.static.blocked',
          requestId: req.requestId,
          method: req.method,
          url: req.originalUrl,
          ip: clientIp(req),
          userAgent: req.headers['user-agent'],
          limit: MAX_REQUESTS,
          windowMs: WINDOW_MS,
        });
      }

      res.status(429).json({
        statusCode: 429,
        message: 'Too Many Requests',
        error: 'ThrottlerException',
      });
      return;
    }

    next();
  }
}

/**
 * The bucket key. Deliberately NOT `clientIp()`: that helper trusts
 * `X-Forwarded-For` unconditionally, which is right for a log line but fatal for a
 * limiter — a caller could rotate the header and mint a fresh quota per request.
 * `req.ip` is resolved by Express and only reflects `X-Forwarded-For` when the app
 * is explicitly configured with `trust proxy`, so it cannot be spoofed by default.
 * Deploying behind a load balancer means enabling that setting, or every request
 * arrives keyed to the proxy's own address and shares one bucket.
 */
function rateLimitKey(req: ContextualRequest): string {
  return req.ip ?? req.socket?.remoteAddress ?? 'unknown';
}

/** Drops windows that have already expired, at most once per window. */
function prune(now: number): void {
  if (now - lastPrune < WINDOW_MS) return;
  lastPrune = now;
  for (const [ip, window] of windows) {
    if (window.resetAt <= now) windows.delete(ip);
  }
}
