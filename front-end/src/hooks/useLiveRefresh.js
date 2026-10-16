/**
 * useLiveRefresh.js
 * Purpose: Keeps a dashboard in sync without the user pressing reload
 *          (ported from TruEstate.startLiveRefresh in app.js).
 * Inputs:  refresh – async function that re-loads the page's data
 *          options – { role, intervalMs = 20000, enabled = true }
 * Outputs: { sessionChanged } – true when THIS tab's session disappeared or
 *          switched account, so the page can freeze itself (overlay).
 * API calls: none itself; it calls whatever `refresh` calls.
 *
 * Behaviour (same as before): polls every `intervalMs` while the tab is
 * visible, refreshes immediately when the tab becomes visible again, and on
 * window focus (rate-limited to once per 5 s).
 */
import { useEffect, useRef, useState } from 'react';
import { getUser } from '../auth/session.js';

export function useLiveRefresh(refresh, { role, intervalMs = 20000, enabled = true } = {}) {
  const [sessionChanged, setSessionChanged] = useState(false);
  // Always call the newest refresh function without restarting the timer.
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    if (!enabled) return undefined;
    const sessionId = (getUser() || {}).id || null; // who this tab started as
    let running = false; // prevents overlapping refreshes
    let stopped = false; // set on unmount
    let lastRun = Date.now();

    /** Is this tab still signed in as the same account and role? */
    const sessionStillValid = () => {
      const user = getUser();
      if (!user) return false;
      if (sessionId && user.id && user.id !== sessionId) return false;
      if (role && user.role !== role) return false;
      return true;
    };

    const run = async (force) => {
      if (running || stopped) return;
      // Hidden tabs don't poll (saves the API from idle background tabs).
      if (!force && document.visibilityState !== 'visible') return;
      if (!sessionStillValid()) {
        setSessionChanged(true); // freeze the page instead of acting as someone else
        return;
      }
      running = true;
      try {
        await refreshRef.current();
        lastRun = Date.now();
      } catch (err) {
        // A transient failure must not kill the loop — the next tick retries.
        console.warn('Live refresh failed:', err && err.message);
      } finally {
        running = false;
      }
    };

    const timer = window.setInterval(run, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === 'visible') run(true);
    };
    const onFocus = () => {
      if (Date.now() - lastRun > 5000) run(true);
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);

    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
    };
  }, [role, intervalMs, enabled]);

  return { sessionChanged };
}
