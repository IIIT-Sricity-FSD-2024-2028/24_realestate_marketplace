/**
 * Validation rules ported from front-end/form-validation.js (the tv* helpers
 * that admin-dashboard.html loaded). React renders the messages inline instead
 * of injecting DOM nodes, but the rules and wording are the same.
 */

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isPhone(value) {
  const stripped = value.trim();
  if (!/^[+]?[\d\s\-()]{7,15}$/.test(stripped)) return false;
  // Reject numbers that are entirely zeros (e.g. 0000000000).
  const digits = stripped.replace(/[^0-9]/g, '');
  return !(digits.length > 0 && /^0+$/.test(digits));
}

/**
 * Live input restriction (old tvRestrictInput). Returns the cleaned value and
 * the hint to flash when something was stripped.
 *   alpha      → letters, spaces, - and ' (names, city, location)
 *   alphaList  → alpha plus commas (comma-separated coverage areas)
 *   number     → digits, dots and commas (phone numbers)
 *   email      → forced to lower case
 */
const RESTRICTIONS = {
  alpha: { clean: (v) => v.replace(/[^a-zA-Z \-']/g, ''), hint: '⚠️ Only letters are allowed here' },
  alphaList: { clean: (v) => v.replace(/[^a-zA-Z ,\-']/g, ''), hint: '⚠️ Only letters are allowed here' },
  number: { clean: (v) => v.replace(/[^0-9.,]/g, ''), hint: '⚠️ Only numbers are allowed here' },
  email: { clean: (v) => v.toLowerCase(), hint: '✉️ Auto-converted to lowercase' },
};

export function restrictValue(value, mode) {
  const rule = RESTRICTIONS[mode];
  if (!rule) return { value, hint: null };
  const cleaned = rule.clean(value);
  return { value: cleaned, hint: cleaned !== value ? rule.hint : null };
}

/** Phone fields may never hold only zeros (old blur/input guard). */
export function isAllZeros(value) {
  const digits = value.replace(/[^0-9]/g, '');
  return digits.length > 0 && /^0+$/.test(digits);
}

// ── Date-of-birth limits (old tvApplyDobRestrictions) ──────────────────
export const DOB_MIN = '1900-01-01';
export const dobMax = () => new Date().toISOString().split('T')[0];

/** Returns an error message for an out-of-range year, or null when fine. */
export function dobYearError(value) {
  if (!value) return null;
  const yearStr = value.split('-')[0] || '';
  if (yearStr.length > 4) return '⚠️ Year must be 4 digits (e.g. 1995)';
  const year = parseInt(yearStr, 10);
  if (year < 1900) return '⚠️ Year cannot be before 1900';
  if (year > new Date().getFullYear()) return `⚠️ Year cannot be after ${new Date().getFullYear()}`;
  return null;
}

/**
 * Runs a list of rules (old tvValidate) against a values object.
 * rule: { field, label, required, type: 'email' | 'phone', minLen }
 * Returns { fieldName: message } — empty object means valid.
 */
export function validate(rules, values) {
  const errors = {};
  rules.forEach((rule) => {
    const val = String(values[rule.field] ?? '').trim();
    if (rule.required && !val) {
      errors[rule.field] = `${rule.label} is required`;
      return;
    }
    if (!val) return;
    if (rule.type === 'email' && !isEmail(val)) errors[rule.field] = 'Please enter a valid email address';
    else if (rule.type === 'phone' && !isPhone(val)) errors[rule.field] = 'Please enter a valid phone number';
    else if (rule.minLen && val.length < rule.minLen) errors[rule.field] = `${rule.label} must be at least ${rule.minLen} characters`;
  });
  return errors;
}
