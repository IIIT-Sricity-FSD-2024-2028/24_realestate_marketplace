"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthAuditMiddleware = void 0;
const common_1 = require("@nestjs/common");
const file_logger_js_1 = require("../logging/file-logger.js");
const http_logger_middleware_js_1 = require("./http-logger.middleware.js");
const request_context_middleware_js_1 = require("./request-context.middleware.js");
let AuthAuditMiddleware = class AuthAuditMiddleware {
    use(req, res, next) {
        const body = (req.body ?? {});
        const email = typeof body.email === 'string' ? body.email : undefined;
        const action = req.path.split('/').filter(Boolean).pop() ?? 'auth';
        res.on('finish', () => {
            const succeeded = res.statusCode < 400;
            file_logger_js_1.fileLogger.audit(`Auth ${action} ${succeeded ? 'succeeded' : 'failed'}`, {
                level: succeeded ? 'info' : 'warn',
                event: `auth.${action}`,
                requestId: req.requestId,
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                outcome: succeeded ? 'success' : 'failure',
                email,
                ip: (0, http_logger_middleware_js_1.clientIp)(req),
                userAgent: req.headers['user-agent'],
                durationMs: Number((0, request_context_middleware_js_1.elapsedMs)(req).toFixed(3)),
            });
        });
        next();
    }
};
exports.AuthAuditMiddleware = AuthAuditMiddleware;
exports.AuthAuditMiddleware = AuthAuditMiddleware = __decorate([
    (0, common_1.Injectable)()
], AuthAuditMiddleware);
//# sourceMappingURL=auth-audit.middleware.js.map