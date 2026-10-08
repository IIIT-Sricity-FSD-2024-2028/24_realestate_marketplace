"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandlerMiddleware = errorHandlerMiddleware;
const common_1 = require("@nestjs/common");
const file_logger_js_1 = require("../logging/file-logger.js");
const ist_time_helper_js_1 = require("../../shared/helpers/ist-time.helper.js");
function errorHandlerMiddleware(err, req, res, next) {
    const request = req;
    const status = err.status ?? err.statusCode ?? common_1.HttpStatus.INTERNAL_SERVER_ERROR;
    file_logger_js_1.fileLogger.error(`Unhandled middleware error: ${err.message}`, {
        requestId: request.requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: status,
        errorName: err.name,
        errorCode: err.code,
        stack: err.stack,
        source: 'express-error-middleware',
    });
    if (res.headersSent)
        return next(err);
    res.status(status).json({
        success: false,
        statusCode: status,
        message: status >= Number(common_1.HttpStatus.INTERNAL_SERVER_ERROR)
            ? 'An unexpected error occurred. Please try again later.'
            : err.message,
        requestId: request.requestId,
        timestamp: (0, ist_time_helper_js_1.istTimestamp)(),
        path: req.originalUrl,
    });
}
//# sourceMappingURL=error-handler.middleware.js.map