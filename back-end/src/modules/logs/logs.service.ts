import { Injectable, NotFoundException } from '@nestjs/common';
import { fileLogger } from '../../common/logging/file-logger.js';
import { LOG_CHANNELS, LogChannel, LogEntry } from '../../common/logging/log-channels.js';

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

const CHANNEL_DESCRIPTIONS: Record<LogChannel, string> = {
  http: 'One entry per HTTP request — method, path, status, latency, caller.',
  error: 'Every handled and unhandled error, with stack traces and request context.',
  app: 'Application and framework log output (bootstrap, services, database).',
  audit: 'Security-relevant events: sign-ins, privileged writes, uploads, blocked payloads.',
};

/** Read-only access to what the file logger has written to disk. */
@Injectable()
export class LogsService {
  summary(): LogChannelSummary[] {
    return LOG_CHANNELS.map((channel) => {
      const current = fileLogger.currentFile(channel).split(/[\\/]/).pop() ?? '';
      const files = fileLogger.listFiles(channel).map((file) => ({
        ...file,
        isCurrent: file.name === current,
      }));

      return {
        channel,
        description: CHANNEL_DESCRIPTIONS[channel],
        directory: fileLogger.channelDir(channel),
        currentFile: current,
        fileCount: files.length,
        totalSizeBytes: files.reduce((sum, file) => sum + file.sizeBytes, 0),
        files,
      };
    });
  }

  async read(
    channel: LogChannel,
    options: { file?: string; lines?: number; level?: string } = {},
  ): Promise<{ channel: LogChannel; file: string; count: number; entries: LogEntry[] }> {
    const file = options.file ?? (fileLogger.currentFile(channel).split(/[\\/]/).pop() as string);
    const available = fileLogger.listFiles(channel).map((entry) => entry.name);

    if (options.file && !available.includes(options.file)) {
      throw new NotFoundException(`No '${channel}' log file named '${options.file}'`);
    }

    const lines = options.lines ?? 100;
    let entries = await fileLogger.tail(channel, file, options.level ? lines * 10 : lines);
    if (options.level) {
      entries = entries.filter((entry) => entry.level === options.level).slice(-lines);
    }

    return { channel, file, count: entries.length, entries };
  }
}
