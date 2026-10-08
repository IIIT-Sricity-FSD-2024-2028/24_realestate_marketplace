"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingModule = exports.FILE_LOGGER = void 0;
const common_1 = require("@nestjs/common");
const file_logger_js_1 = require("./file-logger.js");
exports.FILE_LOGGER = 'FILE_LOGGER';
let LoggingModule = class LoggingModule {
    logger = file_logger_js_1.fileLogger;
    onModuleInit() {
        this.logger.start();
    }
    onApplicationShutdown(signal) {
        this.logger.app('info', 'Application shutting down — flushing buffered logs', { signal });
        this.logger.stop();
    }
};
exports.LoggingModule = LoggingModule;
exports.LoggingModule = LoggingModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [{ provide: exports.FILE_LOGGER, useValue: file_logger_js_1.fileLogger }],
        exports: [exports.FILE_LOGGER],
    })
], LoggingModule);
//# sourceMappingURL=logging.module.js.map