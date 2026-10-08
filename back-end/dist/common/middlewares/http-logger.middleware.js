"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpLoggerMiddleware = void 0;
exports.clientIp = clientIp;
exports.describeUser = describeUser;
const common_1 = require("@nestjs/common");
const file_logger_js_1 = require("../logging/file-logger.js");
const request_context_middleware_js_1 = require("./request-context.middleware.js");
const STATIC_ASSET_PATTERN = /\.(?:css|js|map|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|eot)$/i;
const REDACTED_HEADERS = new Set(['authorization', 'cookie', 'x-api-key', 'proxy-authorization']);
let HttpLoggerMiddleware = class HttpLoggerMiddleware {
    logger = new common_1.Logger('HTTP');
    logStaticAssets = process.env.LOG_STATIC_ASSETS === 'true';
    use(req, res, next) {
        const { method, originalUrl } = req;
        if (!this.logStaticAssets && STATIC_ASSET_PATTERN.test(originalUrl.split('?')[0])) {
            return next();
        }
        let logged = false;
        const record = (aborted) => {
            if (logged)
                return;
            logged = true;
            const durationMs = Number((0, request_context_middleware_js_1.elapsedMs)(req).toFixed(3));
            const statusCode = res.statusCode;
            const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
            file_logger_js_1.fileLogger.http(`${method} ${originalUrl} ${statusCode} ${durationMs}ms`, {
                level,
                requestId: req.requestId,
                method,
                url: originalUrl,
                route: req.route?.path,
                statusCode,
                durationMs,
                ip: clientIp(req),
                userAgent: req.headers['user-agent'],
                referer: req.headers.referer,
                requestBytes: Number(req.headers['content-length'] ?? 0),
                responseBytes: Number(res.getHeader('content-length') ?? 0),
                contentType: req.headers['content-type'],
                user: describeUser(req),
                aborted: aborted || undefined,
                headers: process.env.LOG_HTTP_HEADERS === 'true' ? safeHeaders(req) : undefined,
            });
            const line = `${method} ${originalUrl} ${statusCode} - ${durationMs}ms - ${clientIp(req)}`;
            if (level === 'error')
                this.logger.error(line);
            else if (level === 'warn')
                this.logger.warn(line);
            else
                this.logger.log(line);
        };
        res.on('finish', () => record(false));
        res.on('close', () => record(!res.writableEnded));
        next();
    }
};
exports.HttpLoggerMiddleware = HttpLoggerMiddleware;
exports.HttpLoggerMiddleware = HttpLoggerMiddleware = __decorate([
    (0, common_1.Injectable)()
], HttpLoggerMiddleware);
function clientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0)
        return forwarded.split(',')[0].trim();
    return req.ip ?? req.socket?.remoteAddress ?? 'unknown';
}
function describeUser(req) {
    const user = req.user;
    if (!user)
        return undefined;
    return {
        id: user.userId ?? user.id,
        email: user.email,
        role: user.role,
    };
}
function safeHeaders(req) {
    return Object.fromEntries(Object.entries(req.headers).map(([key, value]) => [
        key,
        REDACTED_HEADERS.has(key.toLowerCase()) ? '[REDACTED]' : value,
    ]));
}
//# sourceMappingURL=http-logger.middleware.js.map