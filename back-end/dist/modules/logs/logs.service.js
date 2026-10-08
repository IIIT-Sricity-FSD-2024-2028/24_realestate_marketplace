"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogsService = void 0;
const common_1 = require("@nestjs/common");
const file_logger_js_1 = require("../../common/logging/file-logger.js");
const log_channels_js_1 = require("../../common/logging/log-channels.js");
const CHANNEL_DESCRIPTIONS = {
    http: 'One entry per HTTP request — method, path, status, latency, caller.',
    error: 'Every handled and unhandled error, with stack traces and request context.',
    app: 'Application and framework log output (bootstrap, services, database).',
    audit: 'Security-relevant events: sign-ins, privileged writes, uploads, blocked payloads.',
};
let LogsService = class LogsService {
    summary() {
        return log_channels_js_1.LOG_CHANNELS.map((channel) => {
            const current = file_logger_js_1.fileLogger.currentFile(channel).split(/[\\/]/).pop() ?? '';
            const files = file_logger_js_1.fileLogger.listFiles(channel).map((file) => ({
                ...file,
                isCurrent: file.name === current,
            }));
            return {
                channel,
                description: CHANNEL_DESCRIPTIONS[channel],
                directory: file_logger_js_1.fileLogger.channelDir(channel),
                currentFile: current,
                fileCount: files.length,
                totalSizeBytes: files.reduce((sum, file) => sum + file.sizeBytes, 0),
                files,
            };
        });
    }
    async read(channel, options = {}) {
        const file = options.file ?? file_logger_js_1.fileLogger.currentFile(channel).split(/[\\/]/).pop();
        const available = file_logger_js_1.fileLogger.listFiles(channel).map((entry) => entry.name);
        if (options.file && !available.includes(options.file)) {
            throw new common_1.NotFoundException(`No '${channel}' log file named '${options.file}'`);
        }
        const lines = options.lines ?? 100;
        let entries = await file_logger_js_1.fileLogger.tail(channel, file, options.level ? lines * 10 : lines);
        if (options.level) {
            entries = entries.filter((entry) => entry.level === options.level).slice(-lines);
        }
        return { channel, file, count: entries.length, entries };
    }
};
exports.LogsService = LogsService;
exports.LogsService = LogsService = __decorate([
    (0, common_1.Injectable)()
], LogsService);
//# sourceMappingURL=logs.service.js.map