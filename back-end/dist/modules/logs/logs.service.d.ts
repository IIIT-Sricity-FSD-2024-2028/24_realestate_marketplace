import { LogChannel, LogEntry } from '../../common/logging/log-channels.js';
export interface LogFileSummary {
    name: string;
    sizeBytes: number;
    modifiedAt: string;
    isCurrent: boolean;
}
export interface LogChannelSummary {
    channel: LogChannel;
    description: string;
    directory: string;
    currentFile: string;
    fileCount: number;
    totalSizeBytes: number;
    files: LogFileSummary[];
}
export declare class LogsService {
    summary(): LogChannelSummary[];
    read(channel: LogChannel, options?: {
        file?: string;
        lines?: number;
        level?: string;
    }): Promise<{
        channel: LogChannel;
        file: string;
        count: number;
        entries: LogEntry[];
    }>;
}
