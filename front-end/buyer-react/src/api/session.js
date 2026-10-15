/**
 * Session storage for the signed-in buyer.
 *
 * Mirrors TruEstate.setUser/getUser/clearUser in front-end/app.js exactly and
 * uses the same storage key, so the React buyer portal shares its session with
 * every other page on the site (e.g. index.html redirecting a buyer here).
 *
 * The session lives in sessionStorage (per tab). localStorage is written as a
 * seed only: a brand-new tab adopts the last login, then claims it for itself.
 */
export const SESSION_KEY = 'truEstate_user';

export function setUser(user) {
  if (!user) {
    clearUser();
    return;
  }
  let existing = null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    if (raw) existing = JSON.parse(raw);
  } catch {}

  const merged = { ...(existing || {}), ...user };
  if (!merged.token && existing?.token) merged.token = existing.token;
  if (!merged.accessToken && existing?.accessToken) merged.accessToken = existing.accessToken;
  if (!merged.token && merged.accessToken) merged.token = merged.accessToken;
  if (!merged.accessToken && merged.token) merged.accessToken = merged.token;

  const serialized = JSON.stringify(merged);
  try { sessionStorage.setItem(SESSION_KEY, serialized); } catch { /* private mode */ }
  try { localStorage.setItem(SESSION_KEY, serialized); } catch { /* private mode */ }
}

export function getUser() {
  let sessionUser = null;
  let localUser = null;
  try {
    const rawSession = sessionStorage.getItem(SESSION_KEY);
    if (rawSession) sessionUser = JSON.parse(rawSession);
  } catch { /* private mode */ }
  try {
    const rawLocal = localStorage.getItem(SESSION_KEY);
    if (rawLocal) localUser = JSON.parse(rawLocal);
  } catch { /* private mode */ }

  if (!sessionUser && !localUser) return null;

  // Merge session and local storage so authentication token and state are never lost
  const merged = { ...(localUser || {}), ...(sessionUser || {}) };
  if (!merged.token && localUser?.token) merged.token = localUser.token;
  if (!merged.accessToken && localUser?.accessToken) merged.accessToken = localUser.accessToken;
  if (!merged.token && merged.accessToken) merged.token = merged.accessToken;
  if (!merged.accessToken && merged.token) merged.accessToken = merged.token;

  // Keep both storages consistent
  try {
    const serialized = JSON.stringify(merged);
    if (!sessionUser || !sessionUser.token) sessionStorage.setItem(SESSION_KEY, serialized);
    if (!localUser || !localUser.token) localStorage.setItem(SESSION_KEY, serialized);
  } catch { /* private mode */ }

  return merged;
}

export function clearUser() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* private mode */ }
  try { localStorage.removeItem(SESSION_KEY); } catch { /* private mode */ }
}

export function getToken() {
  const user = getUser();
  if (!user) return null;
  return user.token || user.accessToken || null;
}

/** RBAC check used by the route guard — matches TruEstate.requireAuth('buyer'). */
export function isBuyerSession(user = getUser()) {
  if (!user) return false;
  return (
    user.role === 'buyer' ||
    user.userType === 'buyer' ||
    (user.role === 'user' && (!user.userType || user.userType === 'buyer'))
  );
}

// ── Per-account scoped local storage helpers (matching legacy behavior) ──
export function tsSafeParse(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    try { localStorage.removeItem(key); } catch (_) {}
    return fallback;
  }
}

export function tsCurrentUserId() {
  const user = getUser();
  return (user && user.id) ? String(user.id) : 'guest';
}

export function tsUserKey(base) {
  return `${base}:${tsCurrentUserId()}`;
}

export function tsUserGet(base, fallback) {
  return tsSafeParse(tsUserKey(base), fallback);
}

export function tsUserSet(base, value) {
  try {
    localStorage.setItem(tsUserKey(base), JSON.stringify(value));
  } catch (_) { /* private mode / quota */ }
}
