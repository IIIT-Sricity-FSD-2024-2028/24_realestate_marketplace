import { NotFoundException } from '@nestjs/common';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileLogger } from '../../common/logging/file-logger.js';
import { LOG_CHANNELS } from '../../common/logging/log-channels.js';
import { LogsService } from './logs.service.js';

describe('LogsService', () => {
  let service: LogsService;
  let dir: string;

  beforeAll(() => {
    // Point the shared logger at a throwaway directory so the test writes real
    // files (that's the behaviour under test) without touching logs/.
    dir = mkdtempSync(join(tmpdir(), 'logs-service-'));
    process.env.LOG_DIR = dir;
    fileLogger.start();
  });

  afterAll(() => {
    fileLogger.stop();
    delete process.env.LOG_DIR;
    rmSync(dir, { recursive: true, force: true });
  });

  beforeEach(() => {
    service = new LogsService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('reports one summary per channel, each with its own directory', () => {
    const summary = service.summary();

    expect(summary.map((entry) => entry.channel)).toEqual([...LOG_CHANNELS]);
    expect(summary.every((entry) => entry.directory.startsWith(dir))).toBe(true);
  });

  it('reads back what the logger has written', async () => {
    fileLogger.audit('Login succeeded', { email: 'admin@truestate.local' });
    fileLogger.flush();

    const result = await service.read('audit', { lines: 10 });

    expect(result.channel).toBe('audit');
    expect(result.entries.at(-1)).toMatchObject({
      message: 'Login succeeded',
      email: 'admin@truestate.local',
    });
  });

  it('filters by level', async () => {
    fileLogger.app('info', 'routine');
    fileLogger.write('app', 'warn', 'something odd');
    fileLogger.flush();

    const result = await service.read('app', { lines: 10, level: 'warn' });

    expect(result.entries.map((entry) => entry.message)).toEqual(['something odd']);
  });

  it('404s on a log file that does not exist', async () => {
    await expect(service.read('http', { file: 'http-1999-01-01.log' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
