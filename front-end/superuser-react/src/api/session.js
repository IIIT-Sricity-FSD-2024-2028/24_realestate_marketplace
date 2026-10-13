/**
 * Session storage for the signed-in superuser.
 *
 * Mirrors TruEstate.setUser/getUser/clearUser in front-end/app.js exactly and
 * uses the same storage key ('truEstate_user'), so the React superuser portal
 * shares its session with every other page on the site.
 *
 * The session lives in sessionStorage (per tab). localStorage is written as a
 * seed so new tabs inherit the session.
 */
export const SESSION_KEY = 'truEstate_user';

export function setUser(user) {
  const serialized = JSON.stringify(user);
  try { sessionStorage.setItem(SESSION_KEY, serialized); } catch { /* private mode */ }
  try { localStorage.setItem(SESSION_KEY, serialized); } catch { /* private mode */ }
}

export function getUser() {
  let raw = null;
  try { raw = sessionStorage.getItem(SESSION_KEY); } catch { /* private mode */ }
  if (!raw) {
    try { raw = localStorage.getItem(SESSION_KEY); } catch { /* private mode */ }
    if (raw) {
      try { sessionStorage.setItem(SESSION_KEY, raw); } catch { /* private mode */ }
    }
  }
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function clearUser() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* private mode */ }
  try { localStorage.removeItem(SESSION_KEY); } catch { /* private mode */ }
}

export function getToken() {
  const user = getUser();
  return user && user.token ? user.token : null;
}

/** RBAC check used by the route guard — role must be 'superuser'. */
export function isSuperuserSession(user = getUser()) {
  return !!user && user.role === 'superuser';
}
