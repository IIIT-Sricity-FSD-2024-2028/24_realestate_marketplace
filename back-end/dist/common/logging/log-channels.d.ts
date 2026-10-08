export declare const LOG_CHANNELS: readonly ["http", "error", "app", "audit"];
export type LogChannel = (typeof LOG_CHANNELS)[number];
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    channel: LogChannel;
    message: string;
    requestId?: string;
    context?: string;
    [key: string]: unknown;
}
export declare function isLogChannel(value: string): value is LogChannel;
