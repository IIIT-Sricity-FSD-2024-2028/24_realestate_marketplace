import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  statSync,
  unlinkSync,
} from 'fs';
import { readFile } from 'fs/promises';
import { join, resolve } from 'path';
import { LOG_CHANNELS, LogChannel, LogEntry, LogLevel } from './log-channels.js';
import { istDateStamp, istTimestamp } from '../../shared/helpers/ist-time.helper.js';

/**
 * Buffered, self-rotating file logger.
 *
 * Design notes:
 * - **Buffered, flushed on an interval.** Writing to disk on every request would
 *   put a synchronous syscall in the hot path of every single HTTP call. Lines
 *   are instead queued in memory and flushed every `LOG_FLUSH_INTERVAL_MS`
 *   (default 5s). Errors bypass the buffer and are flushed immediately — an
 *   error log that gets lost in a crash is worthless.
 * - **Not a Nest provider.** Middleware registered with `app.use()`, the global
 *   exception filter, and the `process.on('uncaughtException')` handler all run
 *   outside (or before) the DI container, so this is a plain module singleton
 *   that any of them can import. `LoggingModule` re-exports it as a provider for
 *   the code that *is* inside DI.
 * - **Rotation** is by date — a new file at each IST midnight — and by size (a file that would
 *   exceed `LOG_MAX_FILE_SIZE_MB` is rolled to `<name>.1.log`, `.2.log`, …), with
 *   files older than `LOG_RETENTION_DAYS` pruned so the disk can't fill up.
 */
export class FileLogger {
  private logDir!: string;
  private flushIntervalMs!: number;
  private maxFileSizeBytes!: number;
  private retentionDays!: number;
  private maxBufferedLines!: number;

  private readonly buffers = new Map<LogChannel, string[]>();
  private flushTimer?: NodeJS.Timeout;
  private cleanupTimer?: NodeJS.Timeout;
  private dirsReady = false;
  /** Set while flush() is writing, so a logger call from inside flush can't recurse. */
  private flushing = false;

  constructor() {
    this.readConfig();
    for (const channel of LOG_CHANNELS) this.buffers.set(channel, []);
  }

  /**
   * Reads the LOG_* settings out of the environment.
   *
   * Called from the constructor (so the logger works from the very first import,
   * before Nest exists) and again from `start()` — by which point @nestjs/config
   * has loaded `.env` into `process.env`, so values set there take effect.
   */
  private readConfig(): void {
    const previousDir = this.logDir;
    // resolve() keeps a relative LOG_DIR project-relative while still honouring an
    // absolute one (deployments often want /var/log/<app>).
    this.logDir = resolve(process.cwd(), process.env.LOG_DIR ?? 'logs');
    this.flushIntervalMs = Number(process.env.LOG_FLUSH_INTERVAL_MS ?? 5_000);
    this.maxFileSizeBytes = Number(process.env.LOG_MAX_FILE_SIZE_MB ?? 5) * 1024 * 1024;
    this.retentionDays = Number(process.env.LOG_RETENTION_DAYS ?? 14);
    this.maxBufferedLines = Number(process.env.LOG_MAX_BUFFERED_LINES ?? 200);
    if (previousDir && previousDir !== this.logDir) this.dirsReady = false;
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  /** Starts the periodic flush + retention timers. Safe to call more than once. */
  start(): void {
    this.readConfig();
    this.ensureDirs();
    // Recreated rather than reused: start() runs twice (once before Nest boots,
    // once from LoggingModule after .env is loaded) and the interval may differ.
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushTimer = setInterval(() => this.flush(), this.flushIntervalMs);
    // Don't hold the event loop open just to flush an empty buffer.
    this.flushTimer.unref?.();
    if (!this.cleanupTimer) {
      this.pruneOldFiles();
      this.cleanupTimer = setInterval(() => this.pruneOldFiles(), 6 * 60 * 60 * 1000);
      this.cleanupTimer.unref?.();
    }
  }

  /** Flushes everything still buffered and stops the timers (called on shutdown). */
  stop(): void {
    if (this.flushTimer) clearInterval(this.flushTimer);
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
    this.flushTimer = undefined;
    this.cleanupTimer = undefined;
    this.flush();
  }

  // ─── Writing ──────────────────────────────────────────────────────────────

  write(channel: LogChannel, level: LogLevel, message: string, meta: Record<string, unknown> = {}): void {
    const entry: LogEntry = {
      timestamp: istTimestamp(),
      level,
      channel,
      message,
      ...meta,
    };

    const buffer = this.buffers.get(channel);
    if (!buffer) return;
    buffer.push(JSON.stringify(entry));

    // Errors are flushed straight away — if the process dies a second later we
    // still want the reason on disk. Everything else waits for the interval, or
    // for the buffer to grow past its cap.
    if (!this.flushing && (level === 'error' || level === 'fatal' || buffer.length >= this.maxBufferedLines)) {
      this.flush();
    }
  }

  http(message: string, meta: Record<string, unknown>): void {
    this.write('http', (meta.level as LogLevel) ?? 'info', message, meta);
  }

  audit(message: string, meta: Record<string, unknown> = {}): void {
    this.write('audit', 'info', message, meta);
  }

  error(message: string, meta: Record<string, unknown> = {}): void {
    this.write('error', 'error', message, meta);
  }

  app(level: LogLevel, message: string, meta: Record<string, unknown> = {}): void {
    this.write('app', level, message, meta);
  }

  /** Writes every buffered line to its channel's current file. */
  flush(): void {
    if (this.flushing) return;
    this.flushing = true;
    try {
      this.ensureDirs();
      for (const channel of LOG_CHANNELS) {
        const buffer = this.buffers.get(channel);
        if (!buffer || buffer.length === 0) continue;
        // Swap the buffer out first so lines logged during the write aren't lost.
        const lines = buffer.splice(0, buffer.length);
        const payload = lines.join('\n') + '\n';
        try {
          const file = this.rotateIfNeeded(channel, Buffer.byteLength(payload));
          appendFileSync(file, payload, 'utf8');
        } catch (err) {
          // Never let a logging failure take down a request. Fall back to stderr.
          process.stderr.write(
            `[FileLogger] could not write ${channel} log: ${err instanceof Error ? err.message : String(err)}\n`,
          );
        }
      }
    } finally {
      this.flushing = false;
    }
  }

  // ─── Files, rotation and retention ────────────────────────────────────────

  getLogDir(): string {
    return this.logDir;
  }

  channelDir(channel: LogChannel): string {
    return join(this.logDir, channel);
  }

  /** `logs/http/http-2026-08-28.log` — the file today's lines go into. */
  currentFile(channel: LogChannel, date = new Date()): string {
    return join(this.channelDir(channel), `${channel}-${istDateStamp(date)}.log`);
  }

  listFiles(channel: LogChannel): { name: string; sizeBytes: number; modifiedAt: string }[] {
    const dir = this.channelDir(channel);
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((name) => name.endsWith('.log'))
      .map((name) => {
        const stats = statSync(join(dir, name));
        return {
          name,
          sizeBytes: stats.size,
          modifiedAt: istTimestamp(stats.mtime),
        };
      })
      .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
  }

  /** Reads the last `lines` entries of a log file, newest last. */
  async tail(channel: LogChannel, fileName: string, lines: number): Promise<LogEntry[]> {
    // Defend against `../` in the requested file name — this is reachable from an
    // HTTP route, so the name must never be able to escape the channel directory.
    const safeName = fileName.replace(/[^A-Za-z0-9._-]/g, '');
    const file = join(this.channelDir(channel), safeName);
    if (!safeName.endsWith('.log') || !existsSync(file)) return [];

    const content = await readFile(file, 'utf8');
    return content
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .slice(-lines)
      .map((line) => {
        try {
          return JSON.parse(line) as LogEntry;
        } catch {
          return { timestamp: '', level: 'info', channel, message: line } as LogEntry;
        }
      });
  }

  private ensureDirs(): void {
    if (this.dirsReady) return;
    for (const channel of LOG_CHANNELS) {
      mkdirSync(this.channelDir(channel), { recursive: true });
    }
    this.dirsReady = true;
  }

  /**
   * Returns the file to append to, rolling the current one aside first if adding
   * `incomingBytes` would push it past the size cap.
   */
  private rotateIfNeeded(channel: LogChannel, incomingBytes: number): string {
    const file = this.currentFile(channel);
    if (!existsSync(file)) return file;

    const { size } = statSync(file);
    if (size + incomingBytes <= this.maxFileSizeBytes) return file;

    const base = file.replace(/\.log$/, '');
    let index = 1;
    while (existsSync(`${base}.${index}.log`)) index++;
    renameSync(file, `${base}.${index}.log`);
    return file;
  }

  /** Deletes log files whose mtime is older than the retention window. */
  private pruneOldFiles(): void {
    const cutoff = Date.now() - this.retentionDays * 24 * 60 * 60 * 1000;
    for (const channel of LOG_CHANNELS) {
      const dir = this.channelDir(channel);
      if (!existsSync(dir)) continue;
      for (const name of readdirSync(dir)) {
        const file = join(dir, name);
        try {
          if (statSync(file).mtimeMs < cutoff) unlinkSync(file);
        } catch {
          // A file that vanished or is locked isn't worth failing over.
        }
      }
    }
  }
}

/**
 * The single process-wide logger instance. Imported directly by middleware,
 * filters and the crash handlers; also exposed through `LoggingModule` for DI.
 */
export const fileLogger = new FileLogger();
