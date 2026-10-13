/**
 * Formats a numeric amount as Indian Rupees (INR).
 * Example: 2500000 -> "₹25,00,000"
 */
export function formatINR(amount) {
  const n = Number(amount) || 0;
  return '₹' + n.toLocaleString('en-IN');
}

/**
 * Formats a byte count into human-readable size units (B, KB, MB, GB).
 */
export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Renders timestamps in Indian Standard Time (IST, UTC+05:30)
 * matching the server's rotated log files.
 */
export function formatLogTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return String(timestamp);
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

/**
 * Standard readable date formatting (e.g., "13 Oct 2026").
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
