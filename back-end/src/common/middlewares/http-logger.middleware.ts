import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { fileLogger } from '../logging/file-logger.js';
import { ContextualRequest, elapsedMs } from './request-context.middleware.js';

/** Static assets a browser fetches by the dozen — noise in an API request log. */
const STATIC_ASSET_PATTERN = /\.(?:css|js|map|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|eot)$/i;

/** Never write these to disk, even though they arrive on the request. */
const REDACTED_HEADERS = new Set(['authorization', 'cookie', 'x-api-key', 'proxy-authorization']);

/**
 * Application-level logging middleware.
 *
 * Writes exactly one line per request into `logs/http/http-<date>.log` — the file
 * a new one is appended to every single time a request comes in — and mirrors a
 * short summary to the console. The line is written on the response's `finish`
 * event rather than on the way in, so it can carry the status code, the response
 * size, the total latency, and the authenticated user (guards populate `req.user`
 * long after this middleware itself has returned).
 */
@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  /** Set LOG_STATIC_ASSETS=true to also log every .css/.js/.png fetch. */
  private readonly logStaticAssets = process.env.LOG_STATIC_ASSETS === 'true';

  use(req: ContextualRequest, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;

    if (!this.logStaticAssets && STATIC_ASSET_PATTERN.test(originalUrl.split('?')[0])) {
      return next();
    }

    // 'finish' fires once the last byte of the response is handed to the socket;
    // 'close' covers the client hanging up mid-response, which 'finish' misses.
    let logged = false;
    const record = (aborted: boolean) => {
      if (logged) return;
      logged = true;

      const durationMs = Number(elapsedMs(req).toFixed(3));
      const statusCode = res.statusCode;
      const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

      fileLogger.http(`${method} ${originalUrl} ${statusCode} ${durationMs}ms`, {
        level,
        requestId: req.requestId,
        method,
        url: originalUrl,
        route: req.route?.path,
        statusCode,
        durationMs,
        ip: clientIp(req),
        userAgent: req.headers['user-agent'],
        referer: req.headers.referer,
        requestBytes: Number(req.headers['content-length'] ?? 0),
        responseBytes: Number(res.getHeader('content-length') ?? 0),
        contentType: req.headers['content-type'],
        user: describeUser(req),
        aborted: aborted || undefined,
        headers: process.env.LOG_HTTP_HEADERS === 'true' ? safeHeaders(req) : undefined,
      });

      const line = `${method} ${originalUrl} ${statusCode} - ${durationMs}ms - ${clientIp(req)}`;
      if (level === 'error') this.logger.error(line);
      else if (level === 'warn') this.logger.warn(line);
      else this.logger.log(line);
    };

    res.on('finish', () => record(false));
    res.on('close', () => record(!res.writableEnded));

    next();
  }
}

export function clientIp(req: ContextualRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) return forwarded.split(',')[0].trim();
  return req.ip ?? req.socket?.remoteAddress ?? 'unknown';
}

/** Who made the call, once the auth guards have run. Never includes the token. */
export function describeUser(req: ContextualRequest): Record<string, unknown> | undefined {
  const user = req.user;
  if (!user) return undefined;
  return {
    id: user.userId ?? user.id,
    email: user.email,
    role: user.role,
  };
}

function safeHeaders(req: ContextualRequest): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(req.headers).map(([key, value]) => [
      key,
      REDACTED_HEADERS.has(key.toLowerCase()) ? '[REDACTED]' : value,
    ]),
  );
}
