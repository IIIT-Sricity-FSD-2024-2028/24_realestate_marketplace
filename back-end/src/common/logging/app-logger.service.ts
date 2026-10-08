import { ConsoleLogger, LoggerService, LogLevel as NestLogLevel } from '@nestjs/common';
import { fileLogger } from './file-logger.js';
import { LogLevel } from './log-channels.js';
import { istDisplay } from '../../shared/helpers/ist-time.helper.js';

/**
 * The application's Nest logger.
 *
 * Extends the stock ConsoleLogger so terminal output looks exactly as before,
 * then mirrors every line into `logs/app/*.log` (and errors additionally into
 * `logs/error/*.log`). Installed in main.ts via `app.useLogger(...)`, which means
 * *everything* that logs through Nest — the framework's own bootstrap messages,
 * Mongoose connection notices, and every `new Logger(...)` call in our services —
 * ends up on disk without a single service having to change.
 */
export class AppLogger extends ConsoleLogger implements LoggerService {
  log(message: unknown, ...rest: unknown[]): void {
    super.log(message as string, ...(rest as string[]));
    this.persist('info', message, rest);
  }

  warn(message: unknown, ...rest: unknown[]): void {
    super.warn(message as string, ...(rest as string[]));
    this.persist('warn', message, rest);
  }

  debug(message: unknown, ...rest: unknown[]): void {
    super.debug(message as string, ...(rest as string[]));
    this.persist('debug', message, rest);
  }

  verbose(message: unknown, ...rest: unknown[]): void {
    super.verbose(message as string, ...(rest as string[]));
    this.persist('debug', message, rest);
  }

  fatal(message: unknown, ...rest: unknown[]): void {
    super.fatal(message as string, ...(rest as string[]));
    this.persist('fatal', message, rest);
  }

  error(message: unknown, ...rest: unknown[]): void {
    super.error(message as string, ...(rest as string[]));

    // Nest calls error(message, stack, context) — pull the stack out so it lands
    // in the error log as a real field instead of an anonymous trailing arg.
    const [maybeStack, maybeContext] = rest as (string | undefined)[];
    const context = maybeContext ?? this.context;
    const stack = typeof maybeStack === 'string' && maybeStack.includes('\n') ? maybeStack : undefined;

    fileLogger.app('error', stringify(message), { context, stack });
    fileLogger.error(stringify(message), { context, stack, source: 'logger' });
  }

  setLogLevels(levels: NestLogLevel[]): void {
    super.setLogLevels(levels);
  }

  /**
   * Nest stamps console lines with the *server's* local time. Pinned to IST so the
   * terminal matches the log files even when the process runs on a UTC host.
   */
  protected getTimestamp(): string {
    return istDisplay();
  }

  private persist(level: LogLevel, message: unknown, rest: unknown[]): void {
    const context = rest.find((arg) => typeof arg === 'string' && !arg.includes('\n')) as string | undefined;
    fileLogger.app(level, stringify(message), { context: context ?? this.context });
  }
}

function stringify(message: unknown): string {
  if (typeof message === 'string') return message;
  if (message instanceof Error) return message.message;
  try {
    return JSON.stringify(message);
  } catch {
    return String(message);
  }
}
