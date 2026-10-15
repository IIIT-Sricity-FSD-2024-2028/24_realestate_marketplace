import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { getUser, isBuyerSession } from '../api/session.js';
import SessionChangedOverlay from '../components/SessionChangedOverlay.jsx';

/**
 * Tracks the buyer session this dashboard was opened with.
 * If the session in *this tab* disappears or switches to a different account,
 * the dashboard is frozen behind an overlay so nothing runs as the wrong user.
 */
const SessionContext = createContext({ checkSession: () => true });

export function SessionProvider({ children }) {
  const sessionIdRef = useRef((getUser() || {}).id || null);
  const [changed, setChanged] = useState(false);

  /** Returns true while the tab is still signed in as the same buyer. */
  const checkSession = useCallback(() => {
    const user = getUser();
    if (!user) {
      return false;
    }
    if (!sessionIdRef.current && user.id) {
      sessionIdRef.current = String(user.id);
    }
    const isSameAccount =
      !sessionIdRef.current ||
      !user.id ||
      String(user.id) === String(sessionIdRef.current);

    if (sessionIdRef.current && user.id && String(user.id) !== String(sessionIdRef.current)) {
      setChanged(true);
      return false;
    }

    const valid = isSameAccount && isBuyerSession(user);
    if (!valid && user.role && user.role !== 'user' && user.role !== 'buyer') {
      setChanged(true);
    }
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
