import { useCallback, useEffect, useRef, useState } from 'react';
import useLiveRefresh from './useLiveRefresh.js';

/**
 * Loads data for an admin page and keeps it fresh.
 *
 *   const { status, data, error, reload } = useAdminData(loader);
 *
 * - status is 'loading' | 'ready' | 'error'
 * - reload()      → shows "Loading…" again (used after an action, as before)
 * - reload(true)  → silent refresh that keeps the current content on screen
 *                   (used by the 15-second live refresh so nothing blinks)
 */
export default function useAdminData(loader, { live = true } = {}) {
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  const reload = useCallback(async (silent = false) => {
    if (!silent) setState((s) => ({ ...s, status: 'loading' }));
    try {
      const data = await loaderRef.current();
      setState({ status: 'ready', data, error: null });
    } catch (error) {
      setState({ status: 'error', data: null, error });
    }
  }, []);

  // Initial load when the page mounts.
  useEffect(() => { reload(false); }, [reload]);

  // Silent background refresh while the page is open.
  useLiveRefresh(() => reload(true), { enabled: live });

  return { ...state, reload };
}
