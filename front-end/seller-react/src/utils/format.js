export const SERVICE_CITY_STATE = {
  Hyderabad: 'Telangana',
  Chennai: 'Tamil Nadu',
  Bangalore: 'Karnataka',
  Kochi: 'Kerala',
};

export const CITIES = Object.keys(SERVICE_CITY_STATE);

export function fmtInrSeller(n) {
  n = Number(n) || 0;
  if (n === 0) return '₹0';
  if (n < 100000) return '₹' + n.toLocaleString('en-IN');
  if (n < 10000000) return '₹' + (n / 100000).toFixed(n % 100000 === 0 ? 0 : 1) + ' Lac';
  return '₹' + (n / 10000000).toFixed(2) + ' Cr';
}

export function formatINR(n) {
  const num = Number(n) || 0;
  return '₹' + num.toLocaleString('en-IN');
}

export function shortDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'SE';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
