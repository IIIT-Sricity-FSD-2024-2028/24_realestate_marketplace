import { useEffect, useRef } from 'react';
import { useSession } from '../context/SessionContext.jsx';

/**
 * Keeps seller pages in sync with the backend in real time.
 *  - polls `refresh` every `intervalMs` while the tab is visible
 *  - refreshes immediately when the tab becomes visible again
 *  - refreshes on window focus (rate-limited to 5s)
 *  - stops issuing requests if this tab's seller session changed
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
        console.warn('Seller live refresh tick failed:', err && err.message);
      } finally {
        running = false;
      }
    }

    const timer = setInterval(() => run(false), intervalMs);
    const onVisible = () => { if (document.visibilityState === 'visible') run(true); };
    const onFocus = () => { if (Date.now() - lastRun > 5000) run(true); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
    };
  }, [checkSession, intervalMs, enabled]);
}
