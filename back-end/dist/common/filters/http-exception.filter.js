"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const file_logger_js_1 = require("../logging/file-logger.js");
const ist_time_helper_js_1 = require("../../shared/helpers/ist-time.helper.js");
const http_logger_middleware_js_1 = require("../middlewares/http-logger.middleware.js");
const request_context_middleware_js_1 = require("../middlewares/request-context.middleware.js");
const SENSITIVE_FIELDS = new Set([
    'password',
    'newPassword',
    'oldPassword',
    'currentPassword',
    'confirmPassword',
    'token',
    'accessToken',
    'refreshToken',
    'otp',
]);
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    logger = new common_1.Logger(HttpExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status;
        let message;
        let errors;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const resp = exceptionResponse;
                if (Array.isArray(resp.message)) {
                    message = 'Validation failed';
                    errors = resp.message;
                }
                else {
                    message = resp.message ?? exception.message;
                }
            }
            else {
                message = exceptionResponse;
            }
        }
        else if (clientErrorStatus(exception) !== undefined) {
            status = clientErrorStatus(exception);
            message = exception.message;
        }
        else {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'An unexpected error occurred. Please try again later.';
            this.logger.error(`Unhandled exception on [${request.method}] ${request.url}`, exception instanceof Error ? exception.stack : String(exception));
        }
        this.persist(exception, request, status, message, errors);
        response.status(status).json({
            success: false,
            statusCode: status,
            message,
            ...(errors && { errors }),
            requestId: request.requestId,
            timestamp: (0, ist_time_helper_js_1.istTimestamp)(),
            path: request.url,
        });
    }
    persist(exception, request, status, message, errors) {
        if (status === Number(common_1.HttpStatus.NOT_FOUND) && !request.originalUrl.startsWith('/api'))
            return;
        const meta = {
            requestId: request.requestId,
            method: request.method,
            url: request.originalUrl,
            statusCode: status,
            errors,
            exceptionName: exception instanceof Error ? exception.name : typeof exception,
            stack: exception instanceof Error ? exception.stack : undefined,
            user: (0, http_logger_middleware_js_1.describeUser)(request) ?? 'anonymous',
            ip: (0, http_logger_middleware_js_1.clientIp)(request),
            userAgent: request.headers['user-agent'],
            body: redact(request.body),
            query: redact(request.query),
            durationMs: Number((0, request_context_middleware_js_1.elapsedMs)(request).toFixed(3)),
        };
        if (status >= Number(common_1.HttpStatus.INTERNAL_SERVER_ERROR)) {
            file_logger_js_1.fileLogger.error(message, meta);
        }
        else {
            file_logger_js_1.fileLogger.write('error', 'warn', message, meta);
        }
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
function clientErrorStatus(exception) {
    if (!(exception instanceof Error))
        return undefined;
    const candidate = exception;
    const status = typeof candidate.status === 'number' ? candidate.status : candidate.statusCode;
    if (typeof status !== 'number')
        return undefined;
    return status >= 400 && status < 500 ? status : undefined;
}
function redact(value) {
    if (!value || typeof value !== 'object')
        return undefined;
    const source = value;
    const out = {};
    for (const [key, val] of Object.entries(source)) {
        out[key] = SENSITIVE_FIELDS.has(key) ? '[REDACTED]' : val;
    }
    return Object.keys(out).length > 0 ? out : undefined;
}
//# sourceMappingURL=http-exception.filter.js.map