"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileLogger = exports.FileLogger = void 0;
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const log_channels_js_1 = require("./log-channels.js");
const ist_time_helper_js_1 = require("../../shared/helpers/ist-time.helper.js");
class FileLogger {
    logDir;
    flushIntervalMs;
    maxFileSizeBytes;
    retentionDays;
    maxBufferedLines;
    buffers = new Map();
    flushTimer;
    cleanupTimer;
    dirsReady = false;
    flushing = false;
    constructor() {
        this.readConfig();
        for (const channel of log_channels_js_1.LOG_CHANNELS)
            this.buffers.set(channel, []);
    }
    readConfig() {
        const previousDir = this.logDir;
        this.logDir = (0, path_1.resolve)(process.cwd(), process.env.LOG_DIR ?? 'logs');
        this.flushIntervalMs = Number(process.env.LOG_FLUSH_INTERVAL_MS ?? 5_000);
        this.maxFileSizeBytes = Number(process.env.LOG_MAX_FILE_SIZE_MB ?? 5) * 1024 * 1024;
        this.retentionDays = Number(process.env.LOG_RETENTION_DAYS ?? 14);
        this.maxBufferedLines = Number(process.env.LOG_MAX_BUFFERED_LINES ?? 200);
        if (previousDir && previousDir !== this.logDir)
            this.dirsReady = false;
    }
    start() {
        this.readConfig();
        this.ensureDirs();
        if (this.flushTimer)
            clearInterval(this.flushTimer);
        this.flushTimer = setInterval(() => this.flush(), this.flushIntervalMs);
        this.flushTimer.unref?.();
        if (!this.cleanupTimer) {
            this.pruneOldFiles();
            this.cleanupTimer = setInterval(() => this.pruneOldFiles(), 6 * 60 * 60 * 1000);
            this.cleanupTimer.unref?.();
        }
    }
    stop() {
        if (this.flushTimer)
            clearInterval(this.flushTimer);
        if (this.cleanupTimer)
            clearInterval(this.cleanupTimer);
        this.flushTimer = undefined;
        this.cleanupTimer = undefined;
        this.flush();
    }
    write(channel, level, message, meta = {}) {
        const entry = {
            timestamp: (0, ist_time_helper_js_1.istTimestamp)(),
            level,
            channel,
            message,
            ...meta,
        };
        const buffer = this.buffers.get(channel);
        if (!buffer)
            return;
        buffer.push(JSON.stringify(entry));
        if (!this.flushing && (level === 'error' || level === 'fatal' || buffer.length >= this.maxBufferedLines)) {
            this.flush();
        }
    }
    http(message, meta) {
        this.write('http', meta.level ?? 'info', message, meta);
    }
    audit(message, meta = {}) {
        this.write('audit', 'info', message, meta);
    }
    error(message, meta = {}) {
        this.write('error', 'error', message, meta);
    }
    app(level, message, meta = {}) {
        this.write('app', level, message, meta);
    }
    flush() {
        if (this.flushing)
            return;
        this.flushing = true;
        try {
            this.ensureDirs();
            for (const channel of log_channels_js_1.LOG_CHANNELS) {
                const buffer = this.buffers.get(channel);
                if (!buffer || buffer.length === 0)
                    continue;
                const lines = buffer.splice(0, buffer.length);
                const payload = lines.join('\n') + '\n';
                try {
                    const file = this.rotateIfNeeded(channel, Buffer.byteLength(payload));
                    (0, fs_1.appendFileSync)(file, payload, 'utf8');
                }
                catch (err) {
                    process.stderr.write(`[FileLogger] could not write ${channel} log: ${err instanceof Error ? err.message : String(err)}\n`);
                }
            }
        }
        finally {
            this.flushing = false;
        }
    }
    getLogDir() {
        return this.logDir;
    }
    channelDir(channel) {
        return (0, path_1.join)(this.logDir, channel);
    }
    currentFile(channel, date = new Date()) {
        return (0, path_1.join)(this.channelDir(channel), `${channel}-${(0, ist_time_helper_js_1.istDateStamp)(date)}.log`);
    }
    listFiles(channel) {
        const dir = this.channelDir(channel);
        if (!(0, fs_1.existsSync)(dir))
            return [];
        return (0, fs_1.readdirSync)(dir)
            .filter((name) => name.endsWith('.log'))
            .map((name) => {
            const stats = (0, fs_1.statSync)((0, path_1.join)(dir, name));
            return {
                name,
                sizeBytes: stats.size,
                modifiedAt: (0, ist_time_helper_js_1.istTimestamp)(stats.mtime),
            };
        })
            .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
    }
    async tail(channel, fileName, lines) {
        const safeName = fileName.replace(/[^A-Za-z0-9._-]/g, '');
        const file = (0, path_1.join)(this.channelDir(channel), safeName);
        if (!safeName.endsWith('.log') || !(0, fs_1.existsSync)(file))
            return [];
        const content = await (0, promises_1.readFile)(file, 'utf8');
        return content
            .split('\n')
            .filter((line) => line.trim().length > 0)
            .slice(-lines)
            .map((line) => {
            try {
                return JSON.parse(line);
            }
            catch {
                return { timestamp: '', level: 'info', channel, message: line };
            }
        });
    }
    ensureDirs() {
        if (this.dirsReady)
            return;
        for (const channel of log_channels_js_1.LOG_CHANNELS) {
            (0, fs_1.mkdirSync)(this.channelDir(channel), { recursive: true });
        }
        this.dirsReady = true;
    }
    rotateIfNeeded(channel, incomingBytes) {
        const file = this.currentFile(channel);
        if (!(0, fs_1.existsSync)(file))
            return file;
        const { size } = (0, fs_1.statSync)(file);
        if (size + incomingBytes <= this.maxFileSizeBytes)
            return file;
        const base = file.replace(/\.log$/, '');
        let index = 1;
        while ((0, fs_1.existsSync)(`${base}.${index}.log`))
            index++;
        (0, fs_1.renameSync)(file, `${base}.${index}.log`);
        return file;
    }
    pruneOldFiles() {
        const cutoff = Date.now() - this.retentionDays * 24 * 60 * 60 * 1000;
        for (const channel of log_channels_js_1.LOG_CHANNELS) {
            const dir = this.channelDir(channel);
            if (!(0, fs_1.existsSync)(dir))
                continue;
            for (const name of (0, fs_1.readdirSync)(dir)) {
                const file = (0, path_1.join)(dir, name);
                try {
                    if ((0, fs_1.statSync)(file).mtimeMs < cutoff)
                        (0, fs_1.unlinkSync)(file);
                }
                catch {
                }
            }
        }
    }
}
exports.FileLogger = FileLogger;
exports.fileLogger = new FileLogger();
//# sourceMappingURL=file-logger.js.map