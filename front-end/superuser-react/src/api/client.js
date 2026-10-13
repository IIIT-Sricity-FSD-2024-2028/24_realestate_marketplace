import { clearUser, getToken } from './session.js';

// Same base path as TruEstate.API_BASE — the backend serves this app, so a
// relative URL works on :3000, :3001 and through the Vite dev proxy.
export const API_BASE = '/api/v1';

// Hash route of the React superuser login page (HashRouter needs no backend fallback).
export const LOGIN_ROUTE = '#/login';

let signingOut = false;

/**
 * Drops the session and sends the superuser back to the login page, explaining
 * why. Triggered when the API says the account is blocked or invalidated.
 */
export function forceSignOut(reason) {
  if (signingOut) return;
  signingOut = true;
  clearUser();
  window.alert(reason || 'Your session has ended. Please sign in again.');
  window.location.hash = LOGIN_ROUTE;
  signingOut = false;
}

/**
 * Fetch wrapper for the backend:
 *  - attaches the JWT as a Bearer token,
 *  - unwraps the `{ success, statusCode, message, data }` envelope,
 *  - throws an Error carrying `.status` and `.errors` on failure.
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
  try {
    body = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    const message = (body && body.message) || 'Request failed with status ' + res.status;
    if ((res.status === 401 || res.status === 403) && /blocked|no longer exists|unauthorized/i.test(message)) {
      forceSignOut(message);
    }
    const error = new Error(message);
    error.status = res.status;
    error.errors = body && body.errors;
    throw error;
  }
  return body;
}

/** Turns an API error into readable text shown in form error summaries. */
export function errorText(err, fallback = 'Operation failed') {
  return (
    (err && Array.isArray(err.errors) && err.errors.join('; ')) ||
    (err && err.message) ||
    fallback
  );
}
