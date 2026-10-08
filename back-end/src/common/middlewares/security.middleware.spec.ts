import { PayloadTooLargeException } from '@nestjs/common';
import { Response } from 'express';
import { fileLogger } from '../logging/file-logger.js';
import { ContextualRequest } from './request-context.middleware.js';
import { SecurityMiddleware } from './security.middleware.js';

describe('SecurityMiddleware', () => {
  let middleware: SecurityMiddleware;
  let res: Response;
  let removeHeader: jest.Mock;
  let next: jest.Mock;
  let audit: jest.SpyInstance;

  const request = (overrides: Partial<ContextualRequest> = {}): ContextualRequest =>
    ({
      method: 'POST',
      originalUrl: '/api/v1/auth/login',
      headers: { 'content-type': 'application/json' },
      body: {},
      query: {},
      socket: { remoteAddress: '127.0.0.1' },
      ...overrides,
    }) as unknown as ContextualRequest;

  beforeEach(() => {
    middleware = new SecurityMiddleware();
    removeHeader = jest.fn();
    res = { removeHeader, setHeader: jest.fn() } as unknown as Response;
    next = jest.fn();
    audit = jest.spyOn(fileLogger, 'audit').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('strips MongoDB operators so a filter object cannot be smuggled in as a login', () => {
    const req = request({ body: { email: { $ne: null }, password: 'x' } } as never);

    middleware.use(req, res, next);

    expect(req.body).toEqual({ email: {}, password: 'x' });
    expect(next).toHaveBeenCalled();
  });

  it('strips operators nested inside arrays and sub-objects', () => {
    const req = request({
      body: { filters: [{ price: { $gt: 0 } }], nested: { deep: { $where: 'x' } } },
    } as never);

    middleware.use(req, res, next);

    expect(req.body).toEqual({ filters: [{ price: {} }], nested: { deep: {} } });
  });

  it('strips prototype-pollution and dotted keys', () => {
    // Built with JSON.parse, not a literal: a literal's `__proto__` sets the
    // prototype, while the body parser produces it as a real own property —
    // which is the case that actually matters here.
    const body = JSON.parse('{"__proto__": {"admin": true}, "a.b": 1, "ok": 2}');
    const req = request({ body } as never);

    middleware.use(req, res, next);

    expect(Object.keys(req.body as object)).toEqual(['ok']);
  });

  it('records what it stripped in the audit log', () => {
    middleware.use(request({ body: { $where: '1' } } as never), res, next);

    expect(audit).toHaveBeenCalledWith(
      'Blocked potentially malicious keys in request payload',
      expect.objectContaining({ event: 'payload.sanitized', strippedKeys: ['$where'] }),
    );
  });

  it('leaves a clean payload untouched and logs nothing', () => {
    const req = request({ body: { email: 'buyer@example.com', password: 'secret' } } as never);

    middleware.use(req, res, next);

    expect(req.body).toEqual({ email: 'buyer@example.com', password: 'secret' });
    expect(audit).not.toHaveBeenCalled();
  });

  it('rejects an oversized JSON body before it reaches a controller', () => {
    const req = request({
      headers: { 'content-type': 'application/json', 'content-length': String(10 * 1024 * 1024) },
    } as never);

    expect(() => middleware.use(req, res, next)).toThrow(PayloadTooLargeException);
    expect(next).not.toHaveBeenCalled();
  });

  it('exempts multipart uploads from the JSON body limit', () => {
    const req = request({
      headers: {
        'content-type': 'multipart/form-data; boundary=x',
        'content-length': String(10 * 1024 * 1024),
      },
    } as never);

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('removes the X-Powered-By header', () => {
    middleware.use(request(), res, next);

    expect(removeHeader).toHaveBeenCalledWith('X-Powered-By');
  });
});
