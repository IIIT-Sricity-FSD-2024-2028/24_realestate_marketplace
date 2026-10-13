import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { getUser } from '../api/session.js';
import SessionChangedOverlay from '../components/SessionChangedOverlay.jsx';

/**
 * Tracks the superuser session this dashboard was opened with.
 * If the session disappears or switches to a non-superuser account,
 * the dashboard shows an overlay to protect user action integrity.
 */
const SessionContext = createContext({ checkSession: () => true });

export function SessionProvider({ children }) {
  const sessionIdRef = useRef((getUser() || {}).id || null);
  const [changed, setChanged] = useState(false);

  const checkSession = useCallback(() => {
    const user = getUser();
    const valid =
      !!user &&
      !(sessionIdRef.current && user.id && user.id !== sessionIdRef.current) &&
      user.role === 'superuser';
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
