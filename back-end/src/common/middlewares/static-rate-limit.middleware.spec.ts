import { Response } from 'express';
import { fileLogger } from '../logging/file-logger.js';
import { ContextualRequest } from './request-context.middleware.js';
import { StaticRateLimitMiddleware } from './static-rate-limit.middleware.js';

describe('StaticRateLimitMiddleware', () => {
  let middleware: StaticRateLimitMiddleware;
  let next: jest.Mock;
  let status: jest.Mock;
  let json: jest.Mock;
  let res: Response;

  // Counters are module-level and keyed by IP, so each test uses a distinct
  // address rather than trying to reset shared state between runs.
  let nextIp = 0;
  const freshIp = () => `10.9.${++nextIp}.1`;

  const request = (ip: string, path = '/index.html'): ContextualRequest =>
    ({
      method: 'GET',
      path,
      originalUrl: path,
      ip,
      headers: {},
      socket: { remoteAddress: ip },
    }) as unknown as ContextualRequest;

  beforeEach(() => {
    middleware = new StaticRateLimitMiddleware();
    next = jest.fn();
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    res = { setHeader: jest.fn(), status } as unknown as Response;
    jest.spyOn(fileLogger, 'audit').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('lets the first 100 static requests through and blocks the 101st', () => {
    const ip = freshIp();

    for (let i = 0; i < 100; i++) middleware.use(request(ip), res, next);
    expect(next).toHaveBeenCalledTimes(100);
    expect(status).not.toHaveBeenCalled();

    middleware.use(request(ip), res, next);
    expect(next).toHaveBeenCalledTimes(100);
    expect(status).toHaveBeenCalledWith(429);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 429 }));
  });

  it('counts each IP separately so one abusive client cannot block everyone', () => {
    const abuser = freshIp();
    for (let i = 0; i < 101; i++) middleware.use(request(abuser), res, next);
    expect(status).toHaveBeenCalledWith(429);

    status.mockClear();
    middleware.use(request(freshIp()), res, next);
    expect(status).not.toHaveBeenCalled();
  });

  it('never throttles /health, so liveness probes survive a flood from the same IP', () => {
    const ip = freshIp();
    for (let i = 0; i < 150; i++) middleware.use(request(ip, '/health'), res, next);

    expect(next).toHaveBeenCalledTimes(150);
    expect(status).not.toHaveBeenCalled();
  });

  it('defers /api/v1 routes to ThrottlerGuard instead of double-counting them', () => {
    const ip = freshIp();
    for (let i = 0; i < 150; i++) {
      middleware.use(request(ip, '/api/v1/properties'), res, next);
    }

    expect(next).toHaveBeenCalledTimes(150);
    expect(status).not.toHaveBeenCalled();
  });

  it('keys on req.ip so a spoofed X-Forwarded-For cannot mint a fresh quota', () => {
    const ip = freshIp();
    for (let i = 0; i < 101; i++) {
      const req = request(ip);
      (req.headers as Record<string, string>)['x-forwarded-for'] = `203.0.113.${i}`;
      middleware.use(req, res, next);
    }

    expect(status).toHaveBeenCalledWith(429);
  });

  it('logs the rejection once per window rather than once per blocked request', () => {
    const audit = jest.spyOn(fileLogger, 'audit').mockImplementation(() => undefined);
    const ip = freshIp();
    for (let i = 0; i < 120; i++) middleware.use(request(ip), res, next);

    const blocks = audit.mock.calls.filter(([, meta]) => meta?.event === 'ratelimit.static.blocked');
    expect(blocks).toHaveLength(1);
  });
});
