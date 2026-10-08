"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuditMiddleware = void 0;
const common_1 = require("@nestjs/common");
const file_logger_js_1 = require("../logging/file-logger.js");
const http_logger_middleware_js_1 = require("./http-logger.middleware.js");
const request_context_middleware_js_1 = require("./request-context.middleware.js");
const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
let AdminAuditMiddleware = class AdminAuditMiddleware {
    use(req, res, next) {
        if (!STATE_CHANGING_METHODS.has(req.method))
            return next();
        res.on('finish', () => {
            const succeeded = res.statusCode < 400;
            file_logger_js_1.fileLogger.audit(`${req.method} ${req.originalUrl} by ${describeActor(req)}`, {
                level: succeeded ? 'info' : 'warn',
                event: 'privileged.write',
                requestId: req.requestId,
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                outcome: succeeded ? 'success' : 'failure',
                actor: (0, http_logger_middleware_js_1.describeUser)(req) ?? 'anonymous',
                ip: (0, http_logger_middleware_js_1.clientIp)(req),
                durationMs: Number((0, request_context_middleware_js_1.elapsedMs)(req).toFixed(3)),
            });
        });
        next();
    }
};
exports.AdminAuditMiddleware = AdminAuditMiddleware;
exports.AdminAuditMiddleware = AdminAuditMiddleware = __decorate([
    (0, common_1.Injectable)()
], AdminAuditMiddleware);
function describeActor(req) {
    const user = (0, http_logger_middleware_js_1.describeUser)(req);
    if (!user)
        return 'anonymous';
    return `${user.email ?? 'unknown'} (${user.role ?? 'no role'})`;
}
//# sourceMappingURL=admin-audit.middleware.js.map