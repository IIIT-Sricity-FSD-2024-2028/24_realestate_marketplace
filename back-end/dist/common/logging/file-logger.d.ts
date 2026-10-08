import { LogChannel, LogEntry, LogLevel } from './log-channels.js';
export declare class FileLogger {
    private logDir;
    private flushIntervalMs;
    private maxFileSizeBytes;
    private retentionDays;
    private maxBufferedLines;
    private readonly buffers;
    private flushTimer?;
    private cleanupTimer?;
    private dirsReady;
    private flushing;
    constructor();
    private readConfig;
    start(): void;
    stop(): void;
    write(channel: LogChannel, level: LogLevel, message: string, meta?: Record<string, unknown>): void;
    http(message: string, meta: Record<string, unknown>): void;
    audit(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
    app(level: LogLevel, message: string, meta?: Record<string, unknown>): void;
    flush(): void;
    getLogDir(): string;
    channelDir(channel: LogChannel): string;
    currentFile(channel: LogChannel, date?: Date): string;
    listFiles(channel: LogChannel): {
        name: string;
        sizeBytes: number;
        modifiedAt: string;
    }[];
    tail(channel: LogChannel, fileName: string, lines: number): Promise<LogEntry[]>;
    private ensureDirs;
    private rotateIfNeeded;
    private pruneOldFiles;
}
export declare const fileLogger: FileLogger;
