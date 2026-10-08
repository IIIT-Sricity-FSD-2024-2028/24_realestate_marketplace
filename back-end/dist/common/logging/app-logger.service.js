"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppLogger = void 0;
const common_1 = require("@nestjs/common");
const file_logger_js_1 = require("./file-logger.js");
const ist_time_helper_js_1 = require("../../shared/helpers/ist-time.helper.js");
class AppLogger extends common_1.ConsoleLogger {
    log(message, ...rest) {
        super.log(message, ...rest);
        this.persist('info', message, rest);
    }
    warn(message, ...rest) {
        super.warn(message, ...rest);
        this.persist('warn', message, rest);
    }
    debug(message, ...rest) {
        super.debug(message, ...rest);
        this.persist('debug', message, rest);
    }
    verbose(message, ...rest) {
        super.verbose(message, ...rest);
        this.persist('debug', message, rest);
    }
    fatal(message, ...rest) {
        super.fatal(message, ...rest);
        this.persist('fatal', message, rest);
    }
    error(message, ...rest) {
        super.error(message, ...rest);
        const [maybeStack, maybeContext] = rest;
        const context = maybeContext ?? this.context;
        const stack = typeof maybeStack === 'string' && maybeStack.includes('\n') ? maybeStack : undefined;
        file_logger_js_1.fileLogger.app('error', stringify(message), { context, stack });
        file_logger_js_1.fileLogger.error(stringify(message), { context, stack, source: 'logger' });
    }
    setLogLevels(levels) {
        super.setLogLevels(levels);
    }
    getTimestamp() {
        return (0, ist_time_helper_js_1.istDisplay)();
    }
    persist(level, message, rest) {
        const context = rest.find((arg) => typeof arg === 'string' && !arg.includes('\n'));
        file_logger_js_1.fileLogger.app(level, stringify(message), { context: context ?? this.context });
    }
}
exports.AppLogger = AppLogger;
function stringify(message) {
    if (typeof message === 'string')
        return message;
    if (message instanceof Error)
        return message.message;
    try {
        return JSON.stringify(message);
    }
    catch {
        return String(message);
    }
}
//# sourceMappingURL=app-logger.service.js.map