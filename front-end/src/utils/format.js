/**
 * format.js
 * Purpose: Display helpers for money, dates, bytes and names, shared by every
 *          dashboard (replaces the per-page fmtInr/formatINR/shortDate copies).
 * Inputs:  raw numbers / ISO date strings / names from the API.
 * Outputs: human-readable strings.
 * API calls: none.
 */

/** ₹ with Indian digit grouping, no decimals — ₹1,44,550. */
export function formatINR(amount) {
  const n = Number(amount) || 0;
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

/**
 * Compact rupees for cards: ₹45,000 · ₹12.5 Lac · ₹1.25 Cr.
 * Amounts under a lakh are shown in full because "₹0.5 Lac" misleads.
 */
export function formatCompactINR(amount) {
  const n = Number(amount) || 0;
  if (n === 0) return '₹0';
  if (n < 100000) return '₹' + n.toLocaleString('en-IN'); // below 1 lakh
  if (n < 10000000) return '₹' + (n / 100000).toFixed(n % 100000 === 0 ? 0 : 1) + ' Lac'; // lakhs
  return '₹' + (n / 10000000).toFixed(2) + ' Cr'; // crores
}

/** "11 Oct 2026" style date, or "—" when missing/invalid. */
export function shortDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** "Oct 2026" — used for "member since" / "seller since". */
export function monthYear(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

/** "3 hours ago" style relative time for activity feeds. */
export function timeAgo(iso, now = Date.now()) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const seconds = Math.max(0, Math.round((now - then) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return minutes + ' minute' + (minutes === 1 ? '' : 's') + ' ago';
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours + ' hour' + (hours === 1 ? '' : 's') + ' ago';
  const days = Math.round(hours / 24);
  if (days < 30) return days + ' day' + (days === 1 ? '' : 's') + ' ago';
  return shortDate(iso); // older items show the real date
}

/** Log timestamps rendered in IST (+05:30) so they match the files on disk. */
export function formatLogTime(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp || '';
  return (
    date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }) + ' IST'
  );
}

/** 1536 → "1.5 KB". */
export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
}

/** "Sarah Johnson" → "SJ" (max two letters, "?" when empty). */
export function initials(name) {
  return (
    String(name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || '?'
  );
}

/** "apartment" → "Apartment". */
export function capitalize(text) {
  const s = String(text || '');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Joins non-empty parts with ", " (e.g. city + state). */
export function joinPlace(...parts) {
  return parts.filter(Boolean).join(', ');
}
