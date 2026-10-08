"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadValidationMiddleware = void 0;
const common_1 = require("@nestjs/common");
const file_logger_js_1 = require("../logging/file-logger.js");
const upload_config_js_1 = require("../upload/upload.config.js");
const http_logger_middleware_js_1 = require("./http-logger.middleware.js");
const request_context_middleware_js_1 = require("./request-context.middleware.js");
let UploadValidationMiddleware = class UploadValidationMiddleware {
    use(req, res, next) {
        const contentType = req.headers['content-type'] ?? '';
        if (!contentType.includes('multipart/form-data')) {
            throw new common_1.UnsupportedMediaTypeException('File uploads must be sent as multipart/form-data');
        }
        const declaredLength = Number(req.headers['content-length'] ?? 0);
        if (declaredLength > upload_config_js_1.MAX_UPLOAD_REQUEST_BYTES) {
            file_logger_js_1.fileLogger.audit('Upload rejected before parsing — request too large', {
                level: 'warn',
                event: 'upload.too_large',
                requestId: req.requestId,
                url: req.originalUrl,
                declaredLength,
                limit: upload_config_js_1.MAX_UPLOAD_REQUEST_BYTES,
                ip: (0, http_logger_middleware_js_1.clientIp)(req),
            });
            throw new common_1.PayloadTooLargeException(`Upload exceeds the ${Math.round(upload_config_js_1.MAX_UPLOAD_REQUEST_BYTES / (1024 * 1024))}MB request limit`);
        }
        res.on('finish', () => {
            const files = normalizeFiles(req);
            file_logger_js_1.fileLogger.audit(`Upload ${res.statusCode < 400 ? 'completed' : 'failed'}`, {
                level: res.statusCode < 400 ? 'info' : 'warn',
                event: 'upload.completed',
                requestId: req.requestId,
                url: req.originalUrl,
                statusCode: res.statusCode,
                actor: (0, http_logger_middleware_js_1.describeUser)(req) ?? 'anonymous',
                ip: (0, http_logger_middleware_js_1.clientIp)(req),
                fileCount: files.length,
                files: files.map((file) => ({
                    originalName: file.originalname,
                    storedAs: file.filename,
                    mimeType: file.mimetype,
                    sizeBytes: file.size,
                })),
                durationMs: Number((0, request_context_middleware_js_1.elapsedMs)(req).toFixed(3)),
            });
        });
        next();
    }
};
exports.UploadValidationMiddleware = UploadValidationMiddleware;
exports.UploadValidationMiddleware = UploadValidationMiddleware = __decorate([
    (0, common_1.Injectable)()
], UploadValidationMiddleware);
function normalizeFiles(req) {
    const files = req.files;
    if (!files)
        return [];
    if (Array.isArray(files))
        return files;
    return Object.values(files).flat();
}
//# sourceMappingURL=upload-validation.middleware.js.map