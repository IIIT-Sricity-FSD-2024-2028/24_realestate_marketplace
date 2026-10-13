import { useCallback, useEffect, useRef, useState } from 'react';
import useLiveRefresh from './useLiveRefresh.js';

/**
 * Loads data for a superuser page and manages reload/refresh state.
 *
 *   const { status, data, error, reload } = useSuperuserData(loader);
 *
 * - status: 'loading' | 'ready' | 'error'
 * - reload()     → shows "Loading…" indicator
 * - reload(true) → silent background refresh without flickering
 */
export default function useSuperuserData(loader, { live = true } = {}) {
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

  useEffect(() => {
    reload(false);
  }, [reload]);

  useLiveRefresh(() => reload(true), { enabled: live });

  return { ...state, reload };
}
