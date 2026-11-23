/**
 * authSlice.js
 * Purpose: Holds the signed-in user object in Redux so superuser dashboard
 *          components can read it via useSelector instead of calling getUser().
 * Initial state: hydrated from session.js (reads sessionStorage/localStorage
 *                once at startup — no new writes).
 * Reducers:
 *   setUser(user)  — called after a successful login
 *   clearUser()    — called on logout
 */
import { createSlice } from '@reduxjs/toolkit';
import { getUser, setUser as writeSession, clearUser as clearSession } from '../../auth/session.js';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    // Hydrate from session storage so a page refresh doesn't lose the user.
    user: getUser(),
  },
  reducers: {
    /** Store a freshly-signed-in user both in Redux and in session storage. */
    setUser(state, action) {
      state.user = action.payload;
      writeSession(action.payload);
    },
    /** Sign out: clear Redux state and both storage areas. */
    clearUser(state) {
      state.user = null;
      clearSession();
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────
export const selectAuthUser = (state) => state.auth.user;

export default authSlice.reducer;
