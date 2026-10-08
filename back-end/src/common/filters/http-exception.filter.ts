import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { fileLogger } from '../logging/file-logger.js';
import { istTimestamp } from '../../shared/helpers/ist-time.helper.js';
import { clientIp, describeUser } from '../middlewares/http-logger.middleware.js';
import { ContextualRequest, elapsedMs } from '../middlewares/request-context.middleware.js';

interface ValidationErrorResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

/** Body fields that must never reach a log file, however the request failed. */
const SENSITIVE_FIELDS = new Set([
  'password',
  'newPassword',
  'oldPassword',
  'currentPassword',
  'confirmPassword',
  'token',
  'accessToken',
  'refreshToken',
  'otp',
]);

/**
 * Global error-handling filter (`@Catch()` with no argument = everything).
 *
 * Two jobs:
 * 1. Turn any thrown value into the platform's standard error envelope, so a
 *    client never sees a stack trace or an inconsistent shape.
 * 2. Write the *full* story — stack, sanitized body, acting user, request id — to
 *    `logs/error/error-<date>.log`, immediately (error lines skip the buffer).
 *    The client gets a generic message on a 500; the log keeps the detail.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<ContextualRequest>();

    let status: number;
    let message: string;
    let errors: string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // NestJS ValidationPipe throws an array of messages
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as ValidationErrorResponse;
        if (Array.isArray(resp.message)) {
          message = 'Validation failed';
          errors = resp.message;
        } else {
          message = resp.message ?? exception.message;
        }
      } else {
        message = exceptionResponse as string;
      }
    } else if (clientErrorStatus(exception) !== undefined) {
      // Errors raised by Express-layer middleware (body-parser and friends) are
      // plain Errors carrying a numeric `status`, not HttpExceptions. Without
      // this branch "request entity too large" surfaced as a 500, blaming the
      // server for something the client did.
      status = clientErrorStatus(exception) as number;
      message = (exception as Error).message;
    } else {
      // Unhandled / unexpected errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred. Please try again later.';
      this.logger.error(
        `Unhandled exception on [${request.method}] ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    this.persist(exception, request, status, message, errors);

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      ...(errors && { errors }),
      // Echoed so a user can quote it in a bug report and it can be grepped
      // straight out of logs/error and logs/http.
      requestId: request.requestId,
      timestamp: istTimestamp(),
      path: request.url,
    });
  }

  /**
   * Appends the failure to the error log. 5xx (a real defect) is always recorded;
   * 4xx is recorded too, but at `warn`, since a stream of 401s or 403s is itself
   * worth being able to see. Ordinary 404s from browsers probing for favicons and
   * the like are skipped so they don't drown the file.
   */
  private persist(
    exception: unknown,
    request: ContextualRequest,
    status: number,
    message: string,
    errors: string[] | undefined,
  ): void {
    if (status === Number(HttpStatus.NOT_FOUND) && !request.originalUrl.startsWith('/api')) return;

    const meta = {
      requestId: request.requestId,
      method: request.method,
      url: request.originalUrl,
      statusCode: status,
      errors,
      exceptionName: exception instanceof Error ? exception.name : typeof exception,
      stack: exception instanceof Error ? exception.stack : undefined,
      user: describeUser(request) ?? 'anonymous',
      ip: clientIp(request),
      userAgent: request.headers['user-agent'],
      body: redact(request.body),
      query: redact(request.query),
      durationMs: Number(elapsedMs(request).toFixed(3)),
    };

    if (status >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      fileLogger.error(message, meta);
    } else {
      fileLogger.write('error', 'warn', message, meta);
    }
  }
}

/**
 * The status an Express-layer error is asking for, when it is a *client* error.
 *
 * body-parser, multer and similar middleware follow the convention of hanging a
 * numeric `status`/`statusCode` on the Error. Only 4xx is honoured — a 5xx from
 * deeper in the stack stays a generic 500 so internal detail never reaches the
 * client.
 */
function clientErrorStatus(exception: unknown): number | undefined {
  if (!(exception instanceof Error)) return undefined;
  const candidate = exception as Error & { status?: unknown; statusCode?: unknown };
  const status = typeof candidate.status === 'number' ? candidate.status : candidate.statusCode;
  if (typeof status !== 'number') return undefined;
  return status >= 400 && status < 500 ? status : undefined;
}

/** Copies an object minus anything that looks like a credential. */
function redact(value: unknown): unknown {
  if (!value || typeof value !== 'object') return undefined;
  const source = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(source)) {
    out[key] = SENSITIVE_FIELDS.has(key) ? '[REDACTED]' : val;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
