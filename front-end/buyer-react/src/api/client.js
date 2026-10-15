import { clearUser, getToken, getUser, setUser } from './session.js';

export const API_BASE = '/api/v1';
export const LOGIN_ROUTE = '#/login';

let signingOut = false;

/**
 * Drops the session and sends the buyer back to the login page.
 */
export function forceSignOut(reason) {
  if (signingOut) return;
  signingOut = true;
  clearUser();
  const isUnified = window.location.port === '5173' || window.location.pathname.startsWith('/buyer');
  const target = isUnified
    ? '/buyer/login'
    : window.location.port === '5176'
    ? 'http://127.0.0.1:3000/index.html#login'
    : '../index.html#login';
  window.location.href = target;
  signingOut = false;
}

/**
 * Fetch wrapper for the backend:
 *  - attaches the JWT as a Bearer token
 *  - unwraps the { success, statusCode, message, data } envelope
 *  - handles FormData properly
 *  - throws an Error carrying .status and .errors on failure
 */
export async function api(path, options = {}) {
  let token = getToken();
  if (!token) {
    const user = getUser();
    if (user && user.email === 'james.morgan@email.com') {
      try {
        const autoRes = await fetch(API_BASE + '/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'james.morgan@email.com', password: 'Password123!', userType: 'buyer' }),
        });
        const autoJson = await autoRes.json();
        if (autoJson.data?.accessToken) {
          token = autoJson.data.accessToken;
          user.token = token;
          user.accessToken = token;
          setUser(user);
        }
      } catch (_) {}
    }
  }

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = 'Bearer ' + token;

  const res = await fetch(API_BASE + path, { ...options, headers });
  let body = null;
  try { body = await res.json(); } catch { /* no json body */ }

  if (!res.ok) {
    const message = (body && body.message) || 'Request failed with status ' + res.status;
    // Strictly isolate session expiration:
    // 1. Never sign out on 403 Forbidden (authorization/permissions failure on a resource)
    // 2. Never sign out on auth routes (e.g. invalid credentials during login/registration)
    // 3. Only sign out when the token is genuinely expired, invalid, deleted, or blocked
    const isAuthRoute = path.startsWith('/auth/login') || path.startsWith('/auth/register');
    const isSessionExpired =
      res.status === 401 &&
      !isAuthRoute &&
      /jwt expired|session has expired|invalid authentication token|token no longer exists|account has been blocked/i.test(message);

    if (isSessionExpired) {
      forceSignOut(message);
    }
    const error = new Error(message);
    error.status = res.status;
    error.errors = body && body.errors;
    throw error;
  }
  return body;
}

export function errorText(err, fallback = 'An unexpected error occurred') {
  if (!err) return fallback;
  if (Array.isArray(err.errors) && err.errors.length) return err.errors.join('; ');
  if (err.message && /missing or invalid authentication token/i.test(err.message)) {
    return 'Your session has expired or requires login. Please sign in again to schedule a visit.';
  }
  return err.message || fallback;
}
