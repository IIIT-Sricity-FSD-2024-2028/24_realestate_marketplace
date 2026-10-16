/**
 * useSellerData.js
 * Purpose: Loads and keeps fresh everything the seller dashboard shows, so
 *          all sections share one copy (listings, offers, deals, billing).
 * Inputs:  none.
 * Outputs: { listings, negotiations, purchases, catalog, billing, loading,
 *            errors, reload(name), reloadAll() }
 * API calls:
 *   GET /properties/mine                     – my listings (any status)
 *   GET /negotiations/seller-queue?limit=100 – offers on my listings
 *   GET /purchases/seller-queue?limit=100    – my deals
 *   GET /billing/catalog (once)              – plans, packs, gateway info
 *   GET /billing/summary                     – my plan, quota, dues, payments
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { billingApi, negotiationsApi, propertiesApi, purchasesApi } from '../../api/services.js';

export function useSellerData() {
  const [state, setState] = useState({ listings: [], negotiations: [], purchases: [], catalog: null, billing: null });
  const [loading, setLoading] = useState({ listings: true, negotiations: true, purchases: true, billing: true });
  const [errors, setErrors] = useState({});
  const catalogRef = useRef(null); // the catalogue rarely changes → fetched once

  const LOADERS = useMemo(
    () => ({
      listings: async () => ({ listings: (await propertiesApi.mine()).data || [] }),
      negotiations: async () => ({ negotiations: (await negotiationsApi.sellerQueue(100)).data.items || [] }),
      purchases: async () => ({ purchases: (await purchasesApi.sellerQueue(100)).data.items || [] }),
      billing: async () => {
        if (!catalogRef.current) catalogRef.current = (await billingApi.catalog()).data;
        return { catalog: catalogRef.current, billing: (await billingApi.summary()).data };
      },
    }),
    [],
  );

  /** Re-fetches one part; a failed refresh keeps what is on screen. */
  const reload = useCallback(
    async (name) => {
      try {
        const patch = await LOADERS[name]();
        setState((s) => ({ ...s, ...patch }));
        setErrors((e) => ({ ...e, [name]: '' }));
      } catch (err) {
        setErrors((e) => ({ ...e, [name]: err.message || 'Could not load ' + name }));
      } finally {
        setLoading((l) => ({ ...l, [name]: false }));
      }
    },
    [LOADERS],
  );

  const reloadAll = useCallback(() => Promise.all(Object.keys(LOADERS).map((n) => reload(n))), [LOADERS, reload]);

  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  return useMemo(() => ({ ...state, loading, errors, reload, reloadAll }), [state, loading, errors, reload, reloadAll]);
}

/** Completed deals of one listing type ('sale' | 'rent'). */
export function completedDeals(purchases, listingType) {
  return purchases.filter((p) => p.dealStatus === 'completed' && p.propertyListingType === listingType);
}
