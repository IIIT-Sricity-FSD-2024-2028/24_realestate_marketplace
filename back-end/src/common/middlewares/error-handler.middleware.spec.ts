import { Request, Response } from 'express';
import { fileLogger } from '../logging/file-logger.js';
import { errorHandlerMiddleware } from './error-handler.middleware.js';

describe('errorHandlerMiddleware', () => {
  let res: Response;
  let status: jest.Mock;
  let json: jest.Mock;
  let next: jest.Mock;
  let logError: jest.SpyInstance;

  const req = {
    method: 'GET',
    originalUrl: '/uploads/property-images/abc/photo.png',
    requestId: 'req-9',
  } as unknown as Request;

  beforeEach(() => {
    status = jest.fn().mockReturnThis();
    json = jest.fn().mockReturnThis();
    res = { headersSent: false, status, json } as unknown as Response;
    next = jest.fn();
    logError = jest.spyOn(fileLogger, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('writes the failure to the error log with its request id', () => {
    errorHandlerMiddleware(new Error('ENOENT: no such file'), req, res, next);

    expect(logError).toHaveBeenCalledWith(
      'Unhandled middleware error: ENOENT: no such file',
      expect.objectContaining({
        requestId: 'req-9',
        url: '/uploads/property-images/abc/photo.png',
        source: 'express-error-middleware',
      }),
    );
  });

  it('replies with the standard envelope and hides the internal detail on a 500', () => {
    errorHandlerMiddleware(new Error('connection string is mongodb://user:pw@host'), req, res, next);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 500,
        message: 'An unexpected error occurred. Please try again later.',
        requestId: 'req-9',
      }),
    );
  });

  it('keeps the message for a client error', () => {
    const err = Object.assign(new Error('Unexpected end of form'), { status: 400 });

    errorHandlerMiddleware(err, req, res, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, message: 'Unexpected end of form' }),
    );
  });

  it('hands back to Express when the response is already streaming', () => {
    (res as { headersSent: boolean }).headersSent = true;
    const err = new Error('socket hang up');

    errorHandlerMiddleware(err, req, res, next);

    expect(next).toHaveBeenCalledWith(err);
    expect(json).not.toHaveBeenCalled();
  });
});
