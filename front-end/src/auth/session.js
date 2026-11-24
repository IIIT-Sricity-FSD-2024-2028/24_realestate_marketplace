/** In-memory session helpers backed by Redux. Deliberately no browser storage. */
import { dispatchStore, getStoreState } from '../store/storeBridge.js';

export const SESSION_KEY = 'truEstate_user'; // compatibility name; never stored in the browser
export const LOGIN_PATH_BY_ROLE = { admin: '/admin/login', superuser: '/superuser/login' };
export const DASHBOARD_BY_ROLE = { buyer: '/buyer', seller: '/seller', admin: '/admin', superuser: '/superuser' };

export const loginPathForRole = (role) => LOGIN_PATH_BY_ROLE[role] || '/login';
export const logoutPathForRole = (role) => LOGIN_PATH_BY_ROLE[role] || '/';
export const getUser = () => getStoreState()?.auth?.user || null;
export const getToken = () => getUser()?.token || null;
export const setUser = (user) => dispatchStore({ type: 'auth/sessionStarted', payload: user });
export const clearUser = () => dispatchStore({ type: 'application/cleared' });

export function hasRoleAccess(user, role) {
  if (!role) return true;
  if (!user) return false;
  if (user.role === role) return true;
  return (role === 'buyer' || role === 'seller') && user.role === 'user' && user.userType === role;
}
