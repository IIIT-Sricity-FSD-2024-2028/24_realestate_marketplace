import { PayloadTooLargeException, UnsupportedMediaTypeException } from '@nestjs/common';
import { EventEmitter } from 'events';
import { Response } from 'express';
import { fileLogger } from '../logging/file-logger.js';
import { MAX_UPLOAD_REQUEST_BYTES } from '../upload/upload.config.js';
import { ContextualRequest } from './request-context.middleware.js';
import { UploadValidationMiddleware } from './upload-validation.middleware.js';

describe('UploadValidationMiddleware', () => {
  let middleware: UploadValidationMiddleware;
  let res: Response & EventEmitter;
  let next: jest.Mock;
  let audit: jest.SpyInstance;

  const request = (headers: Record<string, string>, files?: unknown): ContextualRequest =>
    ({
      method: 'POST',
      originalUrl: '/api/v1/properties/65f1b2c3d4e5f6a7b8c9d0e1/images',
      requestId: 'req-1',
      startedAt: process.hrtime.bigint(),
      headers,
      ip: '10.0.0.1',
      files,
    }) as unknown as ContextualRequest;

  beforeEach(() => {
    middleware = new UploadValidationMiddleware();
    res = new EventEmitter() as EventEmitter & Response;
    res.statusCode = 201;
    next = jest.fn();
    audit = jest.spyOn(fileLogger, 'audit').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('rejects a body that is not multipart/form-data', () => {
    expect(() =>
      middleware.use(request({ 'content-type': 'application/json' }), res, next),
    ).toThrow(UnsupportedMediaTypeException);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects an oversized upload from Content-Length alone — before anything hits disk', () => {
    expect(() =>
      middleware.use(
        request({
          'content-type': 'multipart/form-data; boundary=x',
          'content-length': String(MAX_UPLOAD_REQUEST_BYTES + 1),
        }),
        res,
        next,
      ),
    ).toThrow(PayloadTooLargeException);

    expect(audit).toHaveBeenCalledWith(
      'Upload rejected before parsing — request too large',
      expect.objectContaining({ event: 'upload.too_large' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('lets a valid multipart request through', () => {
    middleware.use(
      request({ 'content-type': 'multipart/form-data; boundary=x', 'content-length': '2048' }),
      res,
      next,
    );

    expect(next).toHaveBeenCalled();
  });

  it('audits what was actually stored once multer has run', () => {
    const files = [
      { originalname: 'deed.pdf', filename: '123-abc.pdf', mimetype: 'application/pdf', size: 900 },
    ];
    middleware.use(
      request({ 'content-type': 'multipart/form-data; boundary=x' }, files),
      res,
      next,
    );
    res.emit('finish');

    expect(audit).toHaveBeenCalledWith(
      'Upload completed',
      expect.objectContaining({
        event: 'upload.completed',
        fileCount: 1,
        files: [
          { originalName: 'deed.pdf', storedAs: '123-abc.pdf', mimeType: 'application/pdf', sizeBytes: 900 },
        ],
      }),
    );
  });
});
