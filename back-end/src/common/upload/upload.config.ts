import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { randomBytes } from 'crypto';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { fileLogger } from '../logging/file-logger.js';

/** Per-file ceiling. Multer aborts the stream the moment a file crosses it. */
export const MAX_FILE_SIZE_BYTES = Number(process.env.MAX_UPLOAD_FILE_MB ?? 10) * 1024 * 1024;

/** How many files one multipart request may carry. */
export const MAX_FILES_PER_REQUEST = Number(process.env.MAX_UPLOAD_FILES ?? 10);

/**
 * Ceiling for the whole multipart request, checked from `Content-Length` before a
 * single byte is written to disk (see UploadValidationMiddleware).
 */
export const MAX_UPLOAD_REQUEST_BYTES = MAX_FILE_SIZE_BYTES * MAX_FILES_PER_REQUEST + 1024 * 1024;

/** Verification paperwork — private, admin/owning-seller only. */
export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

/** Buyer-facing property photos — public. */
export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Extensions we are willing to write, keyed by the MIME type that must accompany them. */
const EXTENSION_BY_MIME: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export interface UploadOptions {
  /** Sub-directory under `uploads/`, e.g. `property-documents`. */
  folder: string;
  allowedMimeTypes: string[];
  maxFileSizeBytes?: number;
  maxFiles?: number;
}

/**
 * Builds the multer (file-upload) middleware configuration shared by every upload
 * endpoint, so the safety rules live in one place instead of being copy-pasted
 * per route:
 *
 * - files land in `uploads/<folder>/<ownerId>/` on disk, never in memory;
 * - the stored filename is generated from random bytes, so a caller can't pick the
 *   path, overwrite a sibling's file, or smuggle `../` into a name;
 * - the extension is derived from the *declared MIME type* rather than trusted
 *   from the client, which is what stops `invoice.pdf.php` style uploads;
 * - MIME type and per-file size are enforced by multer itself;
 * - every accepted and every rejected file is recorded in `logs/audit/*.log`.
 */
export function buildUploadOptions(options: UploadOptions): MulterOptions {
  const {
    folder,
    allowedMimeTypes,
    maxFileSizeBytes = MAX_FILE_SIZE_BYTES,
    maxFiles = MAX_FILES_PER_REQUEST,
  } = options;

  return {
    storage: diskStorage({
      destination: (req, _file, cb) => {
        // The id becomes a directory name — reduce it to hex characters so it can
        // never traverse. The service still validates it's a real ObjectId.
        const safeId = String(req.params?.id ?? '').replace(/[^a-fA-F0-9]/g, '') || 'unknown';
        const dir = join(process.cwd(), 'uploads', folder, safeId);
        mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${randomBytes(8).toString('hex')}${safeExtension(file)}`);
      },
    }),
    limits: {
      fileSize: maxFileSizeBytes,
      files: maxFiles,
      // Reject absurd field counts/lengths outright — a multipart body with 10k
      // fields is an attempt to exhaust memory, not a property upload.
      fields: 20,
      fieldNameSize: 100,
    },
    fileFilter: (req, file, cb) => {
      const accepted = allowedMimeTypes.includes(file.mimetype);
      fileLogger.audit(accepted ? 'Upload accepted' : 'Upload rejected by file filter', {
        level: accepted ? 'info' : 'warn',
        event: accepted ? 'upload.accepted' : 'upload.rejected',
        requestId: (req as { requestId?: string }).requestId,
        url: req.originalUrl,
        folder,
        originalName: file.originalname,
        mimeType: file.mimetype,
        reason: accepted ? undefined : `MIME type not in [${allowedMimeTypes.join(', ')}]`,
      });
      // `false` skips the file quietly; the controller turns "nothing accepted"
      // into a 400 that names the allowed types.
      cb(null, accepted);
    },
  };
}

/**
 * The extension to store the file under. Derived from the declared MIME type, and
 * only falling back to the client's own extension when that extension is one the
 * MIME type is actually allowed to have.
 */
function safeExtension(file: { originalname: string; mimetype: string }): string {
  const allowed = EXTENSION_BY_MIME[file.mimetype];
  if (!allowed) return '';
  const claimed = extname(file.originalname).toLowerCase();
  return allowed.includes(claimed) ? claimed : allowed[0];
}

/** Shared 400 for "the request had files, but none of them were usable". */
export function noValidFilesException(allowedMimeTypes: string[]): BadRequestException {
  const readable = allowedMimeTypes.map((type) => type.split('/')[1].toUpperCase()).join(', ');
  return new BadRequestException(
    `No valid files were uploaded (allowed: ${readable} — max ${Math.round(
      MAX_FILE_SIZE_BYTES / (1024 * 1024),
    )}MB each, ${MAX_FILES_PER_REQUEST} files per request)`,
  );
}
