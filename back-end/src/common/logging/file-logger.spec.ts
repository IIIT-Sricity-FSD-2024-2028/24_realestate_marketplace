import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { FileLogger } from './file-logger.js';
import { istDateStamp } from '../../shared/helpers/ist-time.helper.js';

describe('FileLogger', () => {
  let dir: string;
  let logger: FileLogger;

  const readChannel = (channel: string): string[] => {
    const channelDir = join(dir, channel);
    if (!existsSync(channelDir)) return [];
    return readdirSync(channelDir)
      .filter((name) => name.endsWith('.log'))
      .flatMap((name) =>
        readFileSync(join(channelDir, name), 'utf8').split('\n').filter(Boolean),
      );
  };

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'file-logger-'));
    process.env.LOG_DIR = dir;
    logger = new FileLogger();
  });

  afterEach(() => {
    logger.stop();
    delete process.env.LOG_DIR;
    delete process.env.LOG_MAX_FILE_SIZE_MB;
    rmSync(dir, { recursive: true, force: true });
  });

  it('buffers ordinary entries until flush(), so disk writes stay off the request path', () => {
    logger.http('GET /api/v1/properties 200 4ms', { statusCode: 200 });

    expect(readChannel('http')).toHaveLength(0);

    logger.flush();

    const [line] = readChannel('http');
    expect(JSON.parse(line)).toMatchObject({
      channel: 'http',
      level: 'info',
      message: 'GET /api/v1/properties 200 4ms',
      statusCode: 200,
    });
  });

  it('writes errors immediately — a crash a moment later must not lose the reason', () => {
    logger.error('Database connection lost', { stack: 'Error: ...' });

    const [line] = readChannel('error');
    expect(JSON.parse(line)).toMatchObject({
      channel: 'error',
      level: 'error',
      message: 'Database connection lost',
    });
  });

  it('stamps entries with an IST timestamp, not UTC', () => {
    logger.app('info', 'hello');
    logger.flush();

    const { timestamp } = JSON.parse(readChannel('app')[0]) as { timestamp: string };
    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}\+05:30$/);
    // Still the correct instant — the offset is carried, not discarded.
    expect(Math.abs(new Date(timestamp).getTime() - Date.now())).toBeLessThan(5_000);
  });

  it('names the file after the IST date', () => {
    logger.app('info', 'hello');
    logger.flush();

    expect(readdirSync(join(dir, 'app'))).toContain(`app-${istDateStamp()}.log`);
  });

  it('keeps each channel in its own file', () => {
    logger.http('GET /health 200 1ms', {});
    logger.audit('Login succeeded', { email: 'a@b.com' });
    logger.app('info', 'Nest application started');
    logger.flush();

    expect(readChannel('http')).toHaveLength(1);
    expect(readChannel('audit')).toHaveLength(1);
    expect(readChannel('app')).toHaveLength(1);
  });

  it('rotates the current file once it would exceed the size cap', () => {
    process.env.LOG_MAX_FILE_SIZE_MB = String(1 / 1024); // 1KB
    logger = new FileLogger();

    for (let i = 0; i < 40; i++) {
      logger.app('info', `entry ${i} ${'x'.repeat(100)}`);
      logger.flush();
    }

    const files = readdirSync(join(dir, 'app'));
    expect(files.length).toBeGreaterThan(1);
    expect(files.some((name) => /\.\d+\.log$/.test(name))).toBe(true);
  });

  it('refuses to read outside the channel directory', async () => {
    logger.app('info', 'hello');
    logger.flush();

    await expect(logger.tail('app', '../../../etc/passwd', 10)).resolves.toEqual([]);
  });

  it('tails only the most recent entries', async () => {
    for (let i = 0; i < 10; i++) logger.app('info', `entry ${i}`);
    logger.flush();

    const entries = await logger.tail('app', `app-${istDateStamp()}.log`, 3);

    expect(entries.map((entry) => entry.message)).toEqual(['entry 7', 'entry 8', 'entry 9']);
  });
});
