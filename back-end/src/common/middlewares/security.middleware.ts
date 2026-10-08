import { Injectable, NestMiddleware, PayloadTooLargeException } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { fileLogger } from '../logging/file-logger.js';
import { clientIp } from './http-logger.middleware.js';
import { ContextualRequest } from './request-context.middleware.js';

/** Keys that let an attacker walk up the prototype chain if they reach an object merge. */
const PROTOTYPE_POLLUTION_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const MAX_URL_LENGTH = Number(process.env.MAX_URL_LENGTH ?? 2048);
const MAX_JSON_BODY_BYTES = Number(process.env.MAX_JSON_BODY_KB ?? 256) * 1024;
const MAX_SANITIZE_DEPTH = 8;

/**
 * Security middleware — the request-shape defences that `helmet` doesn't cover.
 *
 * helmet (installed globally in main.ts) sets the response headers; this handles
 * the *incoming* payload:
 *
 * 1. **NoSQL operator injection.** Mongoose happily accepts `{ email: { "$ne": null } }`
 *    as a filter, which turns a login form into "log me in as anyone". Every key
 *    beginning with `$`, and every key containing a `.` (dotted path notation), is
 *    stripped from the body and query string before a controller ever sees it.
 * 2. **Prototype pollution.** `__proto__` / `constructor` / `prototype` keys are
 *    dropped for the same reason.
 * 3. **Oversized requests** are rejected before they are parsed further.
 * 4. `X-Powered-By` is removed so the response stops advertising the stack.
 *
 * Anything stripped is written to `logs/audit/*.log` — a stripped `$` key is a
 * strong signal someone is probing the API, and that belongs in a security trail.
 */
@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: ContextualRequest, res: Response, next: NextFunction): void {
    res.removeHeader('X-Powered-By');

    if (req.originalUrl.length > MAX_URL_LENGTH) {
      throw new PayloadTooLargeException('Request URL is too long');
    }

    const declaredLength = Number(req.headers['content-length'] ?? 0);
    const isMultipart = (req.headers['content-type'] ?? '').includes('multipart/form-data');
    if (!isMultipart && declaredLength > MAX_JSON_BODY_BYTES) {
      // File uploads are exempt: they have their own, much larger limit enforced
      // by UploadValidationMiddleware + multer.
      throw new PayloadTooLargeException('Request body is too large');
    }

    const stripped: string[] = [];
    if (req.body && typeof req.body === 'object') {
      sanitize(req.body, stripped, 0);
    }
    if (req.query && typeof req.query === 'object') {
      const cleanQuery = { ...(req.query as Record<string, unknown>) };
      sanitize(cleanQuery, stripped, 0);
      // Express 5 exposes `query` as a prototype getter, so it can't be assigned —
      // shadow it with an own property instead.
      Object.defineProperty(req, 'query', {
        value: cleanQuery,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }

    if (stripped.length > 0) {
      fileLogger.audit('Blocked potentially malicious keys in request payload', {
        level: 'warn',
        event: 'payload.sanitized',
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        ip: clientIp(req),
        userAgent: req.headers['user-agent'],
        strippedKeys: stripped,
      });
    }

    next();
  }
}

/**
 * Recursively deletes injection-prone keys from `target`, recording what it removed.
 * Mutates in place so the sanitized object is the same reference the parser produced.
 */
function sanitize(target: unknown, stripped: string[], depth: number): void {
  if (depth > MAX_SANITIZE_DEPTH || target === null || typeof target !== 'object') return;

  if (Array.isArray(target)) {
    for (const item of target) sanitize(item, stripped, depth + 1);
    return;
  }

  for (const key of Object.keys(target)) {
    if (key.startsWith('$') || key.includes('.') || PROTOTYPE_POLLUTION_KEYS.has(key)) {
      stripped.push(key);
      delete (target as Record<string, unknown>)[key];
      continue;
    }
    sanitize((target as Record<string, unknown>)[key], stripped, depth + 1);
  }
}
