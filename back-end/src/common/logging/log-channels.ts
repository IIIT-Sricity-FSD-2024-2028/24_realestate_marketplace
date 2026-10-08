/**
 * Every log line the application writes belongs to exactly one channel, and each
 * channel gets its own directory + its own dated file on disk:
 *
 *   logs/http/http-2026-08-28.log      ← one line per HTTP request/response
 *   logs/error/error-2026-08-28.log    ← every handled + unhandled error
 *   logs/app/app-2026-08-28.log        ← application/framework log output
 *   logs/audit/audit-2026-08-28.log    ← security-sensitive actions (auth, admin, uploads)
 *
 * Keeping them separate means a reviewer (or an on-call human) can `tail` the
 * one stream they care about instead of grepping a single interleaved file.
 */
export const LOG_CHANNELS = ['http', 'error', 'app', 'audit'] as const;

export type LogChannel = (typeof LOG_CHANNELS)[number];

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/** One serialized line in a log file (written as JSON so it stays machine-readable). */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  channel: LogChannel;
  message: string;
  /** Correlation id shared by the request log line and any error it produced. */
  requestId?: string;
  context?: string;
  [key: string]: unknown;
}

export function isLogChannel(value: string): value is LogChannel {
  return (LOG_CHANNELS as readonly string[]).includes(value);
}
