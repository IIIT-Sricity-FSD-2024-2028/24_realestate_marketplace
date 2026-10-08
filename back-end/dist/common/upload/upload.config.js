"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_IMAGE_MIME_TYPES = exports.ALLOWED_DOCUMENT_MIME_TYPES = exports.MAX_UPLOAD_REQUEST_BYTES = exports.MAX_FILES_PER_REQUEST = exports.MAX_FILE_SIZE_BYTES = void 0;
exports.buildUploadOptions = buildUploadOptions;
exports.noValidFilesException = noValidFilesException;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const multer_1 = require("multer");
const path_1 = require("path");
const file_logger_js_1 = require("../logging/file-logger.js");
exports.MAX_FILE_SIZE_BYTES = Number(process.env.MAX_UPLOAD_FILE_MB ?? 10) * 1024 * 1024;
exports.MAX_FILES_PER_REQUEST = Number(process.env.MAX_UPLOAD_FILES ?? 10);
exports.MAX_UPLOAD_REQUEST_BYTES = exports.MAX_FILE_SIZE_BYTES * exports.MAX_FILES_PER_REQUEST + 1024 * 1024;
exports.ALLOWED_DOCUMENT_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
];
exports.ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const EXTENSION_BY_MIME = {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
};
function buildUploadOptions(options) {
    const { folder, allowedMimeTypes, maxFileSizeBytes = exports.MAX_FILE_SIZE_BYTES, maxFiles = exports.MAX_FILES_PER_REQUEST, } = options;
    return {
        storage: (0, multer_1.diskStorage)({
            destination: (req, _file, cb) => {
                const safeId = String(req.params?.id ?? '').replace(/[^a-fA-F0-9]/g, '') || 'unknown';
                const dir = (0, path_1.join)(process.cwd(), 'uploads', folder, safeId);
                (0, fs_1.mkdirSync)(dir, { recursive: true });
                cb(null, dir);
            },
            filename: (_req, file, cb) => {
                cb(null, `${Date.now()}-${(0, crypto_1.randomBytes)(8).toString('hex')}${safeExtension(file)}`);
            },
        }),
        limits: {
            fileSize: maxFileSizeBytes,
            files: maxFiles,
            fields: 20,
            fieldNameSize: 100,
        },
        fileFilter: (req, file, cb) => {
            const accepted = allowedMimeTypes.includes(file.mimetype);
            file_logger_js_1.fileLogger.audit(accepted ? 'Upload accepted' : 'Upload rejected by file filter', {
                level: accepted ? 'info' : 'warn',
                event: accepted ? 'upload.accepted' : 'upload.rejected',
                requestId: req.requestId,
                url: req.originalUrl,
                folder,
                originalName: file.originalname,
                mimeType: file.mimetype,
                reason: accepted ? undefined : `MIME type not in [${allowedMimeTypes.join(', ')}]`,
            });
            cb(null, accepted);
        },
    };
}
function safeExtension(file) {
    const allowed = EXTENSION_BY_MIME[file.mimetype];
    if (!allowed)
        return '';
    const claimed = (0, path_1.extname)(file.originalname).toLowerCase();
    return allowed.includes(claimed) ? claimed : allowed[0];
}
function noValidFilesException(allowedMimeTypes) {
    const readable = allowedMimeTypes.map((type) => type.split('/')[1].toUpperCase()).join(', ');
    return new common_1.BadRequestException(`No valid files were uploaded (allowed: ${readable} — max ${Math.round(exports.MAX_FILE_SIZE_BYTES / (1024 * 1024))}MB each, ${exports.MAX_FILES_PER_REQUEST} files per request)`);
}
//# sourceMappingURL=upload.config.js.map