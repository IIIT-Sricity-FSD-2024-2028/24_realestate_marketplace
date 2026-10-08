import { ArgumentsHost, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { fileLogger } from '../logging/file-logger.js';
import { ContextualRequest } from '../middlewares/request-context.middleware.js';
import { HttpExceptionFilter } from './http-exception.filter.js';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let status: jest.Mock;
  let json: jest.Mock;
  let host: ArgumentsHost;
  let request: ContextualRequest;
  let logError: jest.SpyInstance;
  let logWrite: jest.SpyInstance;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    request = {
      method: 'POST',
      url: '/api/v1/auth/login',
      originalUrl: '/api/v1/auth/login',
      requestId: 'req-42',
      startedAt: process.hrtime.bigint(),
      headers: { 'user-agent': 'jest' },
      body: {},
      query: {},
      ip: '10.0.0.1',
    } as unknown as ContextualRequest;
    host = {
      switchToHttp: () => ({
        getResponse: () => ({ status } as unknown as Response),
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;

    logError = jest.spyOn(fileLogger, 'error').mockImplementation(() => undefined);
    logWrite = jest.spyOn(fileLogger, 'write').mockImplementation(() => undefined);
    jest.spyOn(filter['logger'], 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('returns the standard envelope with the request id and an IST timestamp', () => {
    filter.catch(new BadRequestException('Bad input'), host);

    expect(status).toHaveBeenCalledWith(400);
    const payload = json.mock.calls[0][0] as Record<string, unknown>;
    expect(payload).toMatchObject({
      success: false,
      statusCode: 400,
      message: 'Bad input',
      requestId: 'req-42',
    });
    expect(payload.timestamp).toMatch(/\+05:30$/);
  });

  it('collapses a ValidationPipe message array into message + errors', () => {
    filter.catch(new BadRequestException({ message: ['email must be an email'] }), host);

    expect(json.mock.calls[0][0]).toMatchObject({
      message: 'Validation failed',
      errors: ['email must be an email'],
    });
  });

  it('honours the status on an Express-layer error instead of blaming the server', () => {
    // body-parser's "request entity too large" is a plain Error with status 413.
    const err = Object.assign(new Error('request entity too large'), { status: 413 });

    filter.catch(err, host);

    expect(status).toHaveBeenCalledWith(413);
    expect(json.mock.calls[0][0]).toMatchObject({ message: 'request entity too large' });
  });

  it('still hides a 5xx from an Express-layer error', () => {
    const err = Object.assign(new Error('internal pool exhausted'), { status: 503 });

    filter.catch(err, host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json.mock.calls[0][0]).toMatchObject({
      message: 'An unexpected error occurred. Please try again later.',
    });
  });

  it('writes a 500 to the error log at error level, with the stack', () => {
    filter.catch(new Error('kaboom'), host);

    expect(logError).toHaveBeenCalledWith(
      'An unexpected error occurred. Please try again later.',
      expect.objectContaining({ requestId: 'req-42', stack: expect.stringContaining('kaboom') }),
    );
  });

  it('writes a 4xx to the error log at warn level', () => {
    filter.catch(new HttpException('Nope', HttpStatus.FORBIDDEN), host);

    expect(logWrite).toHaveBeenCalledWith('error', 'warn', 'Nope', expect.any(Object));
    expect(logError).not.toHaveBeenCalled();
  });

  it('never writes a password to the log', () => {
    request.body = { email: 'buyer@example.com', password: 'hunter2' };

    filter.catch(new BadRequestException('Bad input'), host);

    const meta = logWrite.mock.calls[0][3] as { body: Record<string, unknown> };
    expect(meta.body).toEqual({ email: 'buyer@example.com', password: '[REDACTED]' });
  });
});
