import {
  Injectable,
  NestMiddleware,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { fileLogger } from '../logging/file-logger.js';
import { MAX_UPLOAD_REQUEST_BYTES } from '../upload/upload.config.js';
import { clientIp, describeUser } from './http-logger.middleware.js';
import { ContextualRequest, elapsedMs } from './request-context.middleware.js';

/**
 * Router-level middleware — bound to the file-upload routes only.
 *
 * It runs *before* multer, which matters: multer streams a multipart body to disk
 * as it parses it, so anything caught here is a request that never touches the
 * filesystem at all. It rejects non-multipart bodies (415) and requests whose
 * declared size exceeds the whole-request ceiling (413), then records the outcome
 * of the upload — filenames, sizes, and who uploaded them — in the audit log.
 */
@Injectable()
export class UploadValidationMiddleware implements NestMiddleware {
  use(req: ContextualRequest, res: Response, next: NextFunction): void {
    const contentType = req.headers['content-type'] ?? '';

    if (!contentType.includes('multipart/form-data')) {
      throw new UnsupportedMediaTypeException(
        'File uploads must be sent as multipart/form-data',
      );
    }

    const declaredLength = Number(req.headers['content-length'] ?? 0);
    if (declaredLength > MAX_UPLOAD_REQUEST_BYTES) {
      fileLogger.audit('Upload rejected before parsing — request too large', {
        level: 'warn',
        event: 'upload.too_large',
        requestId: req.requestId,
        url: req.originalUrl,
        declaredLength,
        limit: MAX_UPLOAD_REQUEST_BYTES,
        ip: clientIp(req),
      });
      throw new PayloadTooLargeException(
        `Upload exceeds the ${Math.round(MAX_UPLOAD_REQUEST_BYTES / (1024 * 1024))}MB request limit`,
      );
    }

    // By the time the response finishes, multer has populated req.files — so this
    // is where we know what actually landed on disk.
    res.on('finish', () => {
      const files = normalizeFiles(req);
      fileLogger.audit(`Upload ${res.statusCode < 400 ? 'completed' : 'failed'}`, {
        level: res.statusCode < 400 ? 'info' : 'warn',
        event: 'upload.completed',
        requestId: req.requestId,
        url: req.originalUrl,
        statusCode: res.statusCode,
        actor: describeUser(req) ?? 'anonymous',
        ip: clientIp(req),
        fileCount: files.length,
        files: files.map((file) => ({
          originalName: file.originalname,
          storedAs: file.filename,
          mimeType: file.mimetype,
          sizeBytes: file.size,
        })),
        durationMs: Number(elapsedMs(req).toFixed(3)),
      });
    });

    next();
  }
}

/** `req.files` is either an array or a field-keyed map depending on the interceptor. */
function normalizeFiles(req: ContextualRequest): Express.Multer.File[] {
  const files = (req as unknown as { files?: unknown }).files;
  if (!files) return [];
  if (Array.isArray(files)) return files as Express.Multer.File[];
  return Object.values(files as Record<string, Express.Multer.File[]>).flat();
}
