import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { getUser } from '../api/session.js';
import SessionChangedOverlay from '../components/SessionChangedOverlay.jsx';

/**
 * Tracks the admin session this dashboard was opened with.
 * If the session in *this tab* disappears or switches to a different account
 * (old TruEstate.onSessionChanged), the dashboard is frozen behind an overlay
 * so nothing keeps running as the wrong user.
 */
const SessionContext = createContext({ checkSession: () => true });

export function SessionProvider({ children }) {
  // The identity captured when the dashboard mounted.
  const sessionIdRef = useRef((getUser() || {}).id || null);
  const [changed, setChanged] = useState(false);

  /** Returns true while the tab is still signed in as the same admin. */
  const checkSession = useCallback(() => {
    const user = getUser();
    const valid = !!user
      && !(sessionIdRef.current && user.id && user.id !== sessionIdRef.current)
      && user.role === 'admin';
    if (!valid) setChanged(true);
    return valid;
  }, []);

  const value = useMemo(() => ({ checkSession }), [checkSession]);

  return (
    <SessionContext.Provider value={value}>
      {children}
      {changed && <SessionChangedOverlay />}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
