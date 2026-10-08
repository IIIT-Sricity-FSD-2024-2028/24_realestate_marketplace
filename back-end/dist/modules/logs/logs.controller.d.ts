import { LogChannel } from '../../common/logging/log-channels.js';
import { LogChannelParamDto, LogQueryDto } from './dto/log-query.dto.js';
import { LogsService } from './logs.service.js';
export declare class LogsController {
    private readonly logsService;
    constructor(logsService: LogsService);
    summary(): {
        message: string;
        data: import("./logs.service.js").LogChannelSummary[];
    };
    read(params: LogChannelParamDto, query: LogQueryDto): Promise<{
        message: string;
        data: {
            channel: LogChannel;
            file: string;
            count: number;
            entries: import("../../common/logging/log-channels.js").LogEntry[];
        };
    }>;
}
