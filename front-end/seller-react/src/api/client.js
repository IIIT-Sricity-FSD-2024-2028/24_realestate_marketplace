import { clearUser, getToken } from './session.js';

export const API_BASE = '/api/v1';
export const LOGIN_ROUTE = '#/login';

let signingOut = false;

/**
 * Drops the session and sends the seller back to the login page.
 */
export function forceSignOut(reason) {
  if (signingOut) return;
  signingOut = true;
  clearUser();
  const target = window.location.port === '5175'
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
  const token = getToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = 'Bearer ' + token;

  const res = await fetch(API_BASE + path, { ...options, headers });
  let body = null;
  try { body = await res.json(); } catch { /* no body */ }

  if (!res.ok) {
    const message = (body && body.message) || 'Request failed with status ' + res.status;
    if ((res.status === 401 || res.status === 403) && /blocked|no longer exists/i.test(message)) {
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
  return err.message || fallback;
}
