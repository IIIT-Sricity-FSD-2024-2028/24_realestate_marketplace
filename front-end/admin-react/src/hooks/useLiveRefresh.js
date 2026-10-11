import { useEffect, useRef } from 'react';
import { useSession } from '../context/SessionContext.jsx';

/**
 * Keeps a page in sync without a manual reload (port of TruEstate.startLiveRefresh).
 *  - polls `refresh` every `intervalMs` while the tab is visible,
 *  - refreshes immediately when the tab becomes visible again,
 *  - refreshes on window focus (at most once every 5 seconds),
 *  - stops issuing requests if this tab's admin session changed.
 */
export default function useLiveRefresh(refresh, { intervalMs = 15000, enabled = true } = {}) {
  const { checkSession } = useSession();
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    if (!enabled) return undefined;
    let running = false;
    let lastRun = Date.now();

    async function run(force) {
      if (running) return;
      if (!force && document.visibilityState !== 'visible') return;
      if (!checkSession()) return;
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
    }

    const timer = setInterval(() => run(false), intervalMs);
    const onVisible = () => { if (document.visibilityState === 'visible') run(true); };
    const onFocus = () => { if (Date.now() - lastRun > 5000) run(true); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);

    // Cleanup when the page unmounts (e.g. the admin opens another section).
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
    };
  }, [checkSession, intervalMs, enabled]);
}
