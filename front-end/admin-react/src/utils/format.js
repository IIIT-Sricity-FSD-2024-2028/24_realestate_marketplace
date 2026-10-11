// Small display helpers shared by the admin pages (ported from admin-dashboard.html / app.js).

/** Compact Indian format used on deal cards: ₹45 Lac / ₹1.25 Cr (old fmtInr). */
export function fmtInr(value) {
  const n = Number(value) || 0;
  return '₹' + (n / 10000000 >= 1
    ? (n / 10000000).toFixed(2) + ' Cr'
    : (n / 100000).toFixed(n % 100000 === 0 ? 0 : 1) + ' Lac');
}

/** ₹ with Indian digit grouping and no decimals — 1,44,550 (old TruEstate.formatINR). */
export function formatINR(value) {
  const n = Number(value) || 0;
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

/** ₹ with Indian grouping, as the listing tables/cards printed prices. */
export function rupees(value) {
  return '₹' + Number(value).toLocaleString('en-IN');
}

/** Up to two upper-case initials for an avatar circle. */
export function initials(name, fallback = '?') {
  return (name || fallback).trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || fallback;
}

/** "Aug 2026" style date, or an em dash when missing/invalid. */
export function monthYear(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d) ? '—' : d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

export function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

/** Avatar colours cycled across seller cards. */
export const AVATAR_COLORS = ['#f97316', '#3b82f6', '#1DB954', '#a855f7', '#ec4899', '#14b8a6'];
