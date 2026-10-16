import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { NextFunction, Request, Response } from 'express';
import { createSpaFallback } from './spa-fallback.middleware.js';

describe('createSpaFallback', () => {
  let dir: string;
  let next: jest.Mock;
  let res: Response & { sendFile: jest.Mock; status: jest.Mock; send: jest.Mock };

  const request = (path: string, method = 'GET', acceptsHtml = true): Request =>
    ({ path, originalUrl: path, method, accepts: () => (acceptsHtml ? 'html' : false) }) as unknown as Request;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'spa-'));
    writeFileSync(join(dir, 'index.html'), '<div id="root"></div>');
    next = jest.fn();
    const r: Record<string, jest.Mock> = {};
    r.sendFile = jest.fn();
    r.send = jest.fn();
    r.type = jest.fn().mockReturnValue(r);
    r.status = jest.fn().mockReturnValue(r);
    res = r as unknown as typeof res;
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('answers client-side routes with index.html', () => {
    createSpaFallback(dir)(request('/admin/login'), res, next as NextFunction);
    expect(res.sendFile).toHaveBeenCalledWith(join(dir, 'index.html'));
    expect(next).not.toHaveBeenCalled();
  });

  it('answers the old .html page URLs too (React redirects them)', () => {
    createSpaFallback(dir)(request('/seller-dashboard.html'), res, next as NextFunction);
    expect(res.sendFile).toHaveBeenCalled();
  });

  it.each(['/api/v1/properties', '/api/docs', '/uploads/a.pdf', '/health'])('leaves %s to the backend', (path) => {
    createSpaFallback(dir)(request(path), res, next as NextFunction);
    expect(next).toHaveBeenCalled();
    expect(res.sendFile).not.toHaveBeenCalled();
  });

  it('lets a missing asset file 404 instead of returning HTML', () => {
    createSpaFallback(dir)(request('/assets/missing.js'), res, next as NextFunction);
    expect(next).toHaveBeenCalled();
  });

  it('ignores non-GET requests and clients that do not want HTML', () => {
    createSpaFallback(dir)(request('/admin', 'POST'), res, next as NextFunction);
    createSpaFallback(dir)(request('/admin', 'GET', false), res, next as NextFunction);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('explains a missing build with a 503', () => {
    createSpaFallback(join(dir, 'nope'))(request('/buyer'), res, next as NextFunction);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.send).toHaveBeenCalledWith(expect.stringContaining('npm run build:frontend'));
  });
});
