"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticRateLimitMiddleware = exports.STATIC_RATE_LIMIT = void 0;
const common_1 = require("@nestjs/common");
const file_logger_js_1 = require("../logging/file-logger.js");
const http_logger_middleware_js_1 = require("./http-logger.middleware.js");
const WINDOW_MS = Number(process.env.STATIC_RATE_LIMIT_TTL_MS ?? 60_000);
const MAX_REQUESTS = Number(process.env.STATIC_RATE_LIMIT ?? 100);
exports.STATIC_RATE_LIMIT = MAX_REQUESTS;
const SKIPPED_PREFIXES = ['/api/v1', '/health'];
const windows = new Map();
let lastPrune = 0;
let StaticRateLimitMiddleware = class StaticRateLimitMiddleware {
    use(req, res, next) {
        const path = req.path ?? req.originalUrl;
        if (SKIPPED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
            return next();
        }
        const now = Date.now();
        prune(now);
        const key = rateLimitKey(req);
        let window = windows.get(key);
        if (!window || window.resetAt <= now) {
            window = { count: 0, resetAt: now + WINDOW_MS };
            windows.set(key, window);
        }
        window.count += 1;
        const remaining = Math.max(0, MAX_REQUESTS - window.count);
        res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', Math.ceil(window.resetAt / 1000));
        if (window.count > MAX_REQUESTS) {
            const retryAfter = Math.max(1, Math.ceil((window.resetAt - now) / 1000));
            res.setHeader('Retry-After', retryAfter);
            if (window.count === MAX_REQUESTS + 1) {
                file_logger_js_1.fileLogger.audit('Static asset rate limit exceeded', {
                    level: 'warn',
                    event: 'ratelimit.static.blocked',
                    requestId: req.requestId,
                    method: req.method,
                    url: req.originalUrl,
                    ip: (0, http_logger_middleware_js_1.clientIp)(req),
                    userAgent: req.headers['user-agent'],
                    limit: MAX_REQUESTS,
                    windowMs: WINDOW_MS,
                });
            }
            res.status(429).json({
                statusCode: 429,
                message: 'Too Many Requests',
                error: 'ThrottlerException',
            });
            return;
        }
        next();
    }
};
exports.StaticRateLimitMiddleware = StaticRateLimitMiddleware;
exports.StaticRateLimitMiddleware = StaticRateLimitMiddleware = __decorate([
    (0, common_1.Injectable)()
], StaticRateLimitMiddleware);
function rateLimitKey(req) {
    return req.ip ?? req.socket?.remoteAddress ?? 'unknown';
}
function prune(now) {
    if (now - lastPrune < WINDOW_MS)
        return;
    lastPrune = now;
    for (const [ip, window] of windows) {
        if (window.resetAt <= now)
            windows.delete(ip);
    }
}
//# sourceMappingURL=static-rate-limit.middleware.js.map