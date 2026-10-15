/**
 * Formatting and helper utilities for the truEstate Buyer Portal.
 */

// Formats a number in Indian Rupee format (e.g. ₹45,00,000 or ₹1.25 Cr)
export function formatINR(num) {
  const n = Number(num) || 0;
  return '₹' + n.toLocaleString('en-IN');
}

export function formatIndianPriceFmt(n) {
  const val = Number(n) || 0;
  if (val >= 10000000) {
    return '₹' + (Math.round((val / 10000000) * 100) / 100) + ' Cr';
  }
  if (val >= 100000) {
    return '₹' + (Math.round((val / 100000) * 100) / 100) + ' Lac';
  }
  return '₹' + val.toLocaleString('en-IN');
}

export function formatOfferAmount(amount) {
  const numericAmount = Number(amount) || 0;
  return (
    '₹' +
    (numericAmount / 100000 >= 100
      ? (numericAmount / 10000000).toFixed(2) + ' Cr'
      : (numericAmount / 100000).toFixed(0) + ' Lac')
  );
}

export function shortDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getInitials(name) {
  if (!name || typeof name !== 'string') return 'BY';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'BY';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generates a stable integer card ID for a given MongoDB ID string (FNV-1a),
 * matching the legacy buyer dashboard.
 */
const realIdToCardId = new Map();
const cardIdToRealId = new Map();

export function cardIdForRealId(realId) {
  if (realIdToCardId.has(realId)) return realIdToCardId.get(realId);
  let h = 0x811c9dc5;
  const str = String(realId);
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  let candidate = 1000 + (h % 2000000000);
  while (cardIdToRealId.has(candidate) && cardIdToRealId.get(candidate) !== realId) candidate++;
  realIdToCardId.set(realId, candidate);
  cardIdToRealId.set(candidate, realId);
  return candidate;
}

export function isImageFile(name) {
  return /\.(jpe?g|png|webp|avif)$/i.test(name || '');
}

export function allDisplayImages(rp) {
  const images = (rp?.images || []).filter(Boolean);
  if (images.length) return images;
  const docImages = (rp?.documents || [])
    .filter((d) => isImageFile(d.url) || isImageFile(d.originalName))
    .map((d) => d.url);
  if (docImages.length) return docImages;
  return ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'];
}

export function firstDisplayImage(rp) {
  return allDisplayImages(rp)[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80';
}
