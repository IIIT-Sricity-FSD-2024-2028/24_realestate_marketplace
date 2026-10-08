import { HttpStatus } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { fileLogger } from '../logging/file-logger.js';
import { istTimestamp } from '../../shared/helpers/ist-time.helper.js';
import { ContextualRequest } from './request-context.middleware.js';

/**
 * Express-style error-handling middleware (the four-argument form) — registered
 * last in the stack, after Nest's router.
 *
 * Nest's global exception filter handles everything thrown inside the request
 * pipeline; this catches what happens *outside* it, where a filter never gets a
 * look in: a failure in the static-asset middleware, a malformed multipart body
 * that breaks the parser, a socket error mid-response. Without this, those become
 * Express's default HTML stack-trace page — which leaks the source path of every
 * file in the project — and nothing is written to the error log.
 */
export function errorHandlerMiddleware(
  err: Error & { status?: number; statusCode?: number; code?: string },
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const request = req as ContextualRequest;
  const status = err.status ?? err.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;

  fileLogger.error(`Unhandled middleware error: ${err.message}`, {
    requestId: request.requestId,
    method: req.method,
    url: req.originalUrl,
    statusCode: status,
    errorName: err.name,
    errorCode: err.code,
    stack: err.stack,
    source: 'express-error-middleware',
  });

  // The response may already be streaming (e.g. a static file that failed
  // half-way) — in that case only Express can tear the socket down cleanly.
  if (res.headersSent) return next(err);

  res.status(status).json({
    success: false,
    statusCode: status,
    message:
      status >= Number(HttpStatus.INTERNAL_SERVER_ERROR)
        ? 'An unexpected error occurred. Please try again later.'
        : err.message,
    requestId: request.requestId,
    timestamp: istTimestamp(),
    path: req.originalUrl,
  });
}
