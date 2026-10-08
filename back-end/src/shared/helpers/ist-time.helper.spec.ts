import { istDateStamp, istDisplay, istTimestamp } from './ist-time.helper.js';

describe('IST timestamps', () => {
  // 2026-08-28T21:45:30.123Z → 2026-08-29 03:15:30.123 IST (next day, +05:30).
  const instant = new Date('2026-08-28T21:45:30.123Z');

  it('formats an ISO string carrying the +05:30 offset', () => {
    expect(istTimestamp(instant)).toBe('2026-08-29T03:15:30.123+05:30');
  });

  it('round-trips back to the same instant', () => {
    expect(new Date(istTimestamp(instant)).getTime()).toBe(instant.getTime());
  });

  it('rolls the file-name date over at IST midnight, not UTC midnight', () => {
    // 18:45 UTC is already the next day in India — the log file must roll with it.
    expect(istDateStamp(new Date('2026-08-28T18:45:00.000Z'))).toBe('2026-08-29');
    expect(istDateStamp(new Date('2026-08-28T18:15:00.000Z'))).toBe('2026-08-28');
  });

  it('is independent of the host machine\'s own timezone', () => {
    const original = process.env.TZ;
    process.env.TZ = 'UTC';
    try {
      expect(istTimestamp(instant)).toBe('2026-08-29T03:15:30.123+05:30');
      expect(istDateStamp(instant)).toBe('2026-08-29');
    } finally {
      process.env.TZ = original;
    }
  });

  it('renders a readable IST string for the console', () => {
    expect(istDisplay(instant)).toContain('29/08/2026');
    expect(istDisplay(instant)).toContain('03:15:30');
  });
});
