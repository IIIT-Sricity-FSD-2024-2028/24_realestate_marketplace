/**
 * session.js
 * Purpose: Stores the signed-in account for THIS browser tab (ported from
 *          TruEstate.setUser/getUser/clearUser in the old app.js).
 * Inputs:  the user object returned by POST /auth/login or /auth/register.
 * Outputs: getUser() → { id, name, email, role, token, city? } or null.
 * API calls: none.
 *
 * Why two storages: sessionStorage is per tab, so a buyer in one tab and a
 * seller in another never overwrite each other. localStorage is only a seed
 * so a brand-new tab adopts the last login instead of demanding a new one.
 */

// The same key the old static pages used, so existing logins keep working.
export const SESSION_KEY = 'truEstate_user';

// Map each role to its login page (used by redirects and sign-out).
export const LOGIN_PATH_BY_ROLE = {
  admin: '/admin/login',
  superuser: '/superuser/login',
};

/** Where an account of `role` should log in again. */
export function loginPathForRole(role) {
  // Buyers and sellers share the main login page.
  return LOGIN_PATH_BY_ROLE[role] || '/login';
}

/** Where "Logout" lands: staff go to their login page, buyers/sellers to the home page (as before). */
export function logoutPathForRole(role) {
  return LOGIN_PATH_BY_ROLE[role] || '/';
}

/** The dashboard each role lands on after signing in. */
export const DASHBOARD_BY_ROLE = {
  buyer: '/buyer',
  seller: '/seller',
  admin: '/admin',
  superuser: '/superuser',
};

/** Reads one storage area without crashing in private mode. */
function safeRead(storage, key) {
  try {
    return storage.getItem(key);
  } catch {
    return null; // storage blocked (private window) → behave as signed out
  }
}

/** Writes one storage area without crashing in private mode. */
function safeWrite(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch {
    /* storage blocked — nothing else we can do */
  }
}

/** Removes a key from one storage area without crashing. */
function safeRemove(storage, key) {
  try {
    storage.removeItem(key);
  } catch {
    /* storage blocked */
  }
}

/**
 * Saves the account in this tab and (when `remember` is true, the default)
 * seeds future tabs. "Remember me" unticked = this tab only.
 */
export function setUser(user, { remember = true } = {}) {
  const serialized = JSON.stringify(user);
  safeWrite(sessionStorage, SESSION_KEY, serialized); // this tab
  if (remember)
    safeWrite(localStorage, SESSION_KEY, serialized); // seed for new tabs
  else safeRemove(localStorage, SESSION_KEY); // don't leave an older seed behind
}

/** Returns the account signed in on this tab, or null. */
export function getUser() {
  // 1) This tab's own session wins.
  let raw = safeRead(sessionStorage, SESSION_KEY);
  if (!raw) {
    // 2) First load in a new tab → inherit the last login, then claim it.
    raw = safeRead(localStorage, SESSION_KEY);
    if (raw) safeWrite(sessionStorage, SESSION_KEY, raw);
  }
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null; // corrupted value → treat as signed out
  }
}

/** Signs the tab out (both storages, like the original logout). */
export function clearUser() {
  safeRemove(sessionStorage, SESSION_KEY);
  safeRemove(localStorage, SESSION_KEY);
}

/** The JWT for the Authorization header, or null when signed out. */
export function getToken() {
  const user = getUser();
  return user && user.token ? user.token : null;
}

/**
 * True when `user` may open a dashboard meant for `role`.
 * Supports both shapes the old pages stored: role:'buyer' or
 * role:'user' + userType:'buyer'.
 */
export function hasRoleAccess(user, role) {
  if (!role) return true; // public page
  if (!user) return false; // must be signed in
  if (user.role === role) return true;
  if (role === 'buyer' && user.role === 'user' && user.userType === 'buyer') return true;
  if (role === 'seller' && user.role === 'user' && user.userType === 'seller') return true;
  return false;
}

/**
 * Per-account localStorage helpers (old tsUserGet/tsUserSet).
 * Shortlists, profiles etc. are keyed by user id so a new account
 * never sees the previous account's saved data.
 */
export function userKey(base, user = getUser()) {
  return base + ':' + String((user && user.id) || 'guest');
}

/** Reads + parses a per-account value, self-healing corrupt JSON. */
export function readUserData(base, fallback, user) {
  const key = userKey(base, user);
  const raw = safeRead(localStorage, key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    safeRemove(localStorage, key); // drop the corrupt entry
    return fallback;
  }
}

/** Saves a per-account value as JSON. */
export function writeUserData(base, value, user) {
  safeWrite(localStorage, userKey(base, user), JSON.stringify(value));
}

/** Reads + parses a shared (not per-account) localStorage value. */
export function readLocalJson(key, fallback) {
  const raw = safeRead(localStorage, key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** Saves a shared (not per-account) localStorage value. */
export function writeLocalJson(key, value) {
  safeWrite(localStorage, key, JSON.stringify(value));
}
