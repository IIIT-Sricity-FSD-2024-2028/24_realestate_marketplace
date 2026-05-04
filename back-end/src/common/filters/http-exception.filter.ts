import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ValidationErrorResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

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
    } else {
      // Unhandled / unexpected errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred. Please try again later.';
      this.logger.error(
        `Unhandled exception on [${request.method}] ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
