"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityMiddleware = void 0;
const common_1 = require("@nestjs/common");
const file_logger_js_1 = require("../logging/file-logger.js");
const http_logger_middleware_js_1 = require("./http-logger.middleware.js");
const PROTOTYPE_POLLUTION_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const MAX_URL_LENGTH = Number(process.env.MAX_URL_LENGTH ?? 2048);
const MAX_JSON_BODY_BYTES = Number(process.env.MAX_JSON_BODY_KB ?? 256) * 1024;
const MAX_SANITIZE_DEPTH = 8;
let SecurityMiddleware = class SecurityMiddleware {
    use(req, res, next) {
        res.removeHeader('X-Powered-By');
        if (req.originalUrl.length > MAX_URL_LENGTH) {
            throw new common_1.PayloadTooLargeException('Request URL is too long');
        }
        const declaredLength = Number(req.headers['content-length'] ?? 0);
        const isMultipart = (req.headers['content-type'] ?? '').includes('multipart/form-data');
        if (!isMultipart && declaredLength > MAX_JSON_BODY_BYTES) {
            throw new common_1.PayloadTooLargeException('Request body is too large');
        }
        const stripped = [];
        if (req.body && typeof req.body === 'object') {
            sanitize(req.body, stripped, 0);
        }
        if (req.query && typeof req.query === 'object') {
            const cleanQuery = { ...req.query };
            sanitize(cleanQuery, stripped, 0);
            Object.defineProperty(req, 'query', {
                value: cleanQuery,
                writable: true,
                configurable: true,
                enumerable: true,
            });
        }
        if (stripped.length > 0) {
            file_logger_js_1.fileLogger.audit('Blocked potentially malicious keys in request payload', {
                level: 'warn',
                event: 'payload.sanitized',
                requestId: req.requestId,
                method: req.method,
                url: req.originalUrl,
                ip: (0, http_logger_middleware_js_1.clientIp)(req),
                userAgent: req.headers['user-agent'],
                strippedKeys: stripped,
            });
        }
        next();
    }
};
exports.SecurityMiddleware = SecurityMiddleware;
exports.SecurityMiddleware = SecurityMiddleware = __decorate([
    (0, common_1.Injectable)()
], SecurityMiddleware);
function sanitize(target, stripped, depth) {
    if (depth > MAX_SANITIZE_DEPTH || target === null || typeof target !== 'object')
        return;
    if (Array.isArray(target)) {
        for (const item of target)
            sanitize(item, stripped, depth + 1);
        return;
    }
    for (const key of Object.keys(target)) {
        if (key.startsWith('$') || key.includes('.') || PROTOTYPE_POLLUTION_KEYS.has(key)) {
            stripped.push(key);
            delete target[key];
            continue;
        }
        sanitize(target[key], stripped, depth + 1);
    }
}
//# sourceMappingURL=security.middleware.js.map