/**
 * Every timestamp this application emits — log files, API response bodies, error
 * envelopes and the console — is expressed in **India Standard Time**, not UTC.
 *
 * The offset is applied explicitly rather than relying on the server's own clock
 * settings, so a deployment running on a UTC box (which is what every PaaS gives
 * you by default) still writes log lines a person here can read at a glance.
 * India has no daylight saving, so a fixed +05:30 is always correct.
 */
export const IST_OFFSET_MINUTES = 330; // UTC+05:30
export const IST_TIME_ZONE = 'Asia/Kolkata';
const IST_OFFSET_SUFFIX = '+05:30';

/** The same instant, shifted so the UTC getters read back IST wall-clock values. */
function shiftToIst(date: Date): Date {
  return new Date(date.getTime() + IST_OFFSET_MINUTES * 60_000);
}

const pad = (value: number, width = 2): string => String(value).padStart(width, '0');

/**
 * ISO-8601 in IST, e.g. `2026-08-28T09:19:55.704+05:30`.
 *
 * The offset is kept on the string deliberately: it stays sortable, `new Date(...)`
 * parses it back to the correct instant, and it can never be mistaken for UTC.
 */
export function istTimestamp(date: Date = new Date()): string {
  const ist = shiftToIst(date);
  return (
    `${ist.getUTCFullYear()}-${pad(ist.getUTCMonth() + 1)}-${pad(ist.getUTCDate())}` +
    `T${pad(ist.getUTCHours())}:${pad(ist.getUTCMinutes())}:${pad(ist.getUTCSeconds())}` +
    `.${pad(ist.getUTCMilliseconds(), 3)}${IST_OFFSET_SUFFIX}`
  );
}

/** `2026-08-28` in IST — the date portion log files are named and rotated by. */
export function istDateStamp(date: Date = new Date()): string {
  const ist = shiftToIst(date);
  return `${ist.getUTCFullYear()}-${pad(ist.getUTCMonth() + 1)}-${pad(ist.getUTCDate())}`;
}

/** `28/08/2026, 09:19:55` — the human-readable form used for console output. */
export function istDisplay(date: Date = new Date()): string {
  return date.toLocaleString('en-IN', {
    timeZone: IST_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}
