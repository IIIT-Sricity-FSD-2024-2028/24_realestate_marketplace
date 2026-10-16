/**
 * validation.js
 * Purpose: Pure form-validation rules (ported from form-validation.js).
 *          Pure functions = easy to unit test and reuse in every form.
 * Inputs:  form values + a list of rules.
 * Outputs: an errors object { fieldName: 'message' } (empty = valid),
 *          or a single message string for the login form.
 * API calls: none.
 */

/** Basic email shape check (same regex the old pages used). */
export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

/** Phone: 7–15 digits/spaces/+-() and not all zeros. */
export function isPhone(value) {
  const stripped = String(value || '').trim();
  if (!/^[+]?[\d\s\-()]{7,15}$/.test(stripped)) return false;
  const digits = stripped.replace(/[^0-9]/g, '');
  return !(digits.length > 0 && /^0+$/.test(digits)); // reject 0000000000
}

/** Positive number, commas allowed ("1,25,00,000"). */
export function isPositiveNumber(value) {
  const text = String(value || '').trim();
  return /^[\d,.]+$/.test(text) && parseFloat(text.replace(/,/g, '')) > 0;
}

/** Backend password policy (RegisterDto): 8–32 chars, upper, lower, digit, special. */
export const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/;

/**
 * Runs rules against values and returns { field: message } for failures.
 * Rule shape: { field, label, required, type: 'email'|'phone'|'number', minLen, match, matchLabel }
 */
export function validateRules(values, rules) {
  const errors = {};
  rules.forEach((rule) => {
    const value = String(values[rule.field] ?? '').trim();
    if (rule.required && value === '') {
      errors[rule.field] = rule.label + ' is required';
      return; // stop at the first problem for this field
    }
    if (!value) return; // optional + empty → nothing else to check
    if (rule.type === 'email' && !isEmail(value)) {
      errors[rule.field] = 'Please enter a valid email address';
    } else if (rule.type === 'phone' && !isPhone(value)) {
      errors[rule.field] = 'Please enter a valid phone number';
    } else if (rule.minLen && value.length < rule.minLen) {
      errors[rule.field] = rule.label + ' must be at least ' + rule.minLen + ' characters';
    } else if (rule.type === 'number' && !isPositiveNumber(value)) {
      errors[rule.field] = rule.label + ' must be a valid positive number';
    } else if (rule.match && value !== String(values[rule.match] ?? '').trim()) {
      errors[rule.field] = rule.label + ' does not match ' + (rule.matchLabel || 'the other field');
    }
  });
  return errors;
}

/** True when an errors object has no entries. */
export function isValid(errors) {
  return Object.keys(errors).length === 0;
}

/**
 * Login / sign-up checks (old tvValidateLoginForm). Returns the first problem
 * as a friendly message, or null when the form can be submitted.
 */
export function validateAuthForm({ isSignup, name, email, password, confirmPassword }) {
  const nameVal = String(name || '').trim();
  const emailVal = String(email || '').trim();
  if (isSignup && !nameVal) return '👤 Please enter your full name to sign up.';
  if (isSignup && nameVal.length < 2) return '👤 Name must be at least 2 characters.';
  if (!emailVal && !password) return '📧 Please fill in your email and password to ' + (isSignup ? 'sign up.' : 'login.');
  if (!emailVal) return '📧 Please enter your email address.';
  if (!isEmail(emailVal)) return '📧 Please enter a valid email address.';
  if (!password) return '🔒 Please enter your password.';
  if (isSignup && !STRONG_PASSWORD.test(password)) {
    // Mirrors the server rule so the user learns it before submitting.
    return '🔒 Password must be 8–32 characters with an uppercase letter, a lowercase letter, a number and a special character (@$!%*?&).';
  }
  if (isSignup && confirmPassword !== password) return '🔒 Passwords do not match. Please re-enter.';
  return null;
}

/** Change-password checks shared by every profile page. */
export function validatePasswordChange({ currentPassword, newPassword, confirmPassword }) {
  if (!currentPassword || !newPassword || !confirmPassword) return 'Please fill in all three password fields';
  if (newPassword.length < 8) return 'New password must be at least 8 characters';
  if (newPassword !== confirmPassword) return 'New password and confirmation do not match';
  return null;
}

/** Office/profile date of birth must be a real 4-digit year between 1900 and today. */
export function validateDob(value, today = new Date()) {
  if (!value) return null;
  const year = parseInt(String(value).split('-')[0], 10);
  if (String(value).split('-')[0].length > 4) return 'Year must be 4 digits (e.g. 1995)';
  if (year < 1900) return 'Year cannot be before 1900';
  if (year > today.getFullYear()) return 'Year cannot be after ' + today.getFullYear();
  return null;
}

/**
 * Live input clean-up (old tvRestrictInput). Returns the cleaned text and
 * whether something was removed, so the UI can show a short hint.
 *   alpha  → letters, spaces, hyphen, apostrophe (names, cities)
 *   number → digits, comma, dot (prices, areas)
 *   phone  → digits, spaces, + - ( )
 *   email  → forced to lowercase
 */
export function sanitizeInput(value, mode) {
  const text = String(value ?? '');
  let cleaned = text;
  if (mode === 'alpha') cleaned = text.replace(/[^a-zA-Z \-']/g, '');
  else if (mode === 'number') cleaned = text.replace(/[^0-9.,]/g, '');
  else if (mode === 'phone') cleaned = text.replace(/[^0-9+\-() ]/g, '');
  else if (mode === 'email') cleaned = text.toLowerCase();
  return { value: cleaned, changed: cleaned !== text };
}

/** The hint shown when sanitizeInput removed something. */
export const RESTRICT_HINTS = {
  alpha: 'Only letters are allowed here',
  number: 'Only numbers are allowed here',
  phone: 'Only digits, spaces and + - ( ) are allowed',
  email: 'Auto-converted to lowercase',
};

/** Strips everything but digits/dot and returns a number (0 when blank). */
export function toNumber(text) {
  return Number(String(text ?? '').replace(/[^0-9.]/g, '')) || 0;
}
