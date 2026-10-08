import type { LogChannel } from '../../../common/logging/log-channels.js';
export declare class LogQueryDto {
    file?: string;
    lines?: number;
    level?: string;
}
export declare class LogChannelParamDto {
    channel: LogChannel;
}
