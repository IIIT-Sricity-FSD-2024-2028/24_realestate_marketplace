/**
 * client.js
 * Purpose: The one fetch wrapper every page uses to talk to the NestJS API
 *          (ported from TruEstate.api in the old app.js).
 * Inputs:  path like '/properties?page=1' and fetch options (method, body…).
 * Outputs: resolves with the backend envelope { success, statusCode, message, data };
 *          rejects with an Error that carries .status and .errors.
 * API calls: any endpoint under /api/v1 (relative URL → same origin).
 */
import { clearUser, getToken, getUser, loginPathForRole } from '../auth/session.js';

// Every backend route lives under this prefix (see main.ts setGlobalPrefix).
export const API_BASE = '/api/v1';

// Guards against showing the "signed out" alert twice in a row.
let signingOut = false;

/**
 * Drops the session and sends the user to the right login page, explaining why.
 * Used when the API says the account was blocked or deleted mid-session.
 */
export function forceSignOut(reason) {
  if (signingOut) return; // already on the way out
  signingOut = true;
  const user = getUser();
  clearUser(); // forget the dead token
  window.alert(reason || 'Your session has ended. Please sign in again.');
  // Full page load so every in-memory cache is discarded too.
  window.location.assign(loginPathForRole(user && user.role));
}

/** Calls the backend and unwraps errors into thrown Error objects. */
export async function api(path, options = {}) {
  const token = getToken();
  // FormData (file uploads) must let the browser set the multipart boundary.
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = 'Bearer ' + token; // JWT for protected routes

  const res = await fetch(API_BASE + path, { ...options, headers });
  let body = null;
  try {
    body = await res.json(); // every API response is JSON
  } catch {
    /* empty body (e.g. 204) */
  }

  if (!res.ok) {
    const message = (body && body.message) || 'Request failed with status ' + res.status;
    // A superuser can block (or delete) an account while it is signed in.
    if ((res.status === 401 || res.status === 403) && /blocked|no longer exists/i.test(message)) {
      forceSignOut(message);
    }
    const error = new Error(message);
    error.status = res.status; // lets callers react to 402/401 etc.
    error.errors = body && body.errors; // field-level validation messages
    throw error;
  }
  return body;
}

/** Shortcut: JSON request with a body (POST/PATCH). */
export function sendJson(path, method, payload) {
  return api(path, { method, body: JSON.stringify(payload ?? {}) });
}

/** Builds "message: first validation error" for toasts. */
export function errorText(err, fallback) {
  const detail = err && err.errors && err.errors.length ? ': ' + err.errors[0] : '';
  return ((err && err.message) || fallback) + detail;
}
