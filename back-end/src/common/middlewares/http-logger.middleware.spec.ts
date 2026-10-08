import { EventEmitter } from 'events';
import { Response } from 'express';
import { fileLogger } from '../logging/file-logger.js';
import { HttpLoggerMiddleware } from './http-logger.middleware.js';
import { ContextualRequest } from './request-context.middleware.js';

describe('HttpLoggerMiddleware', () => {
  let middleware: HttpLoggerMiddleware;
  let res: Response & EventEmitter;
  let next: jest.Mock;
  let http: jest.SpyInstance;

  const request = (overrides: Partial<ContextualRequest> = {}): ContextualRequest =>
    ({
      method: 'GET',
      originalUrl: '/api/v1/properties?city=Hyderabad',
      requestId: 'req-1',
      startedAt: process.hrtime.bigint(),
      headers: { 'user-agent': 'jest' },
      ip: '10.0.0.1',
      ...overrides,
    }) as unknown as ContextualRequest;

  const response = (statusCode = 200): Response & EventEmitter => {
    const emitter = new EventEmitter() as EventEmitter & Response;
    emitter.statusCode = statusCode;
    Object.defineProperty(emitter, 'writableEnded', { value: true, writable: true });
    emitter.getHeader = jest.fn().mockReturnValue(120) as never;
    return emitter;
  };

  beforeEach(() => {
    middleware = new HttpLoggerMiddleware();
    res = response();
    next = jest.fn();
    http = jest.spyOn(fileLogger, 'http').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('passes the request straight through — logging happens on the way out', () => {
    middleware.use(request(), res, next);

    expect(next).toHaveBeenCalled();
    expect(http).not.toHaveBeenCalled();
  });

  it('writes one entry per request once the response finishes', () => {
    middleware.use(request(), res, next);
    res.emit('finish');

    expect(http).toHaveBeenCalledTimes(1);
    expect(http).toHaveBeenCalledWith(
      expect.stringContaining('GET /api/v1/properties?city=Hyderabad 200'),
      expect.objectContaining({
        level: 'info',
        requestId: 'req-1',
        method: 'GET',
        statusCode: 200,
        ip: '10.0.0.1',
        userAgent: 'jest',
      }),
    );
    expect(http.mock.calls[0][1].durationMs).toBeGreaterThanOrEqual(0);
  });

  it('records the authenticated caller, which guards only attach after middleware runs', () => {
    const req = request();
    middleware.use(req, res, next);
    // Simulates JwtAuthGuard populating req.user later in the pipeline.
    req.user = { userId: 'u1', email: 'admin@truestate.local', role: 'admin' };
    res.emit('finish');

    expect(http.mock.calls[0][1].user).toEqual({
      id: 'u1',
      email: 'admin@truestate.local',
      role: 'admin',
    });
  });

  it('escalates the level with the status code', () => {
    middleware.use(request(), (res = response(500)), next);
    res.emit('finish');

    expect(http.mock.calls[0][1].level).toBe('error');
  });

  it('logs a request the client aborted, which never emits finish', () => {
    Object.defineProperty(res, 'writableEnded', { value: false, writable: true });
    middleware.use(request(), res, next);
    res.emit('close');

    expect(http.mock.calls[0][1].aborted).toBe(true);
  });

  it('logs each request exactly once even though both finish and close fire', () => {
    middleware.use(request(), res, next);
    res.emit('finish');
    res.emit('close');

    expect(http).toHaveBeenCalledTimes(1);
  });

  it('skips static assets by default so the API log stays readable', () => {
    middleware.use(request({ originalUrl: '/seller-dashboard.css' }), res, next);
    res.emit('finish');

    expect(http).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
