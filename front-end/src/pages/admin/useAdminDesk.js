/**
 * useAdminDesk.js
 * Purpose: Loads (and keeps fresh) every queue the admin desk works from, so
 *          the dashboard sections share one copy instead of each re-fetching.
 * Inputs:  none.
 * Outputs: { listings, negotiations, purchases, visits, users,
 *            errors, loading, reload(name), reloadAll(silent) }
 *          Each list is an array; errors[name] holds a message on failure.
 * API calls (all city-scoped by the server for admins):
 *   GET /properties/review-queue?limit=100
 *   GET /negotiations/review-queue?limit=100
 *   GET /purchases/review-queue?limit=100
 *   GET /visits/review-queue?limit=100
 *   GET /users
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { negotiationsApi, propertiesApi, purchasesApi, usersApi, visitsApi } from '../../api/services.js';

// name → function that fetches that list.
const LOADERS = {
  listings: () => propertiesApi.reviewQueue(100).then((r) => r.data.items || []),
  negotiations: () => negotiationsApi.reviewQueue(100).then((r) => r.data.items || []),
  purchases: () => purchasesApi.reviewQueue(100).then((r) => r.data.items || []),
  visits: () => visitsApi.reviewQueue(100).then((r) => r.data.items || []),
  users: () => usersApi.list().then((r) => r.data || []),
};
const NAMES = Object.keys(LOADERS);

export function useAdminDesk() {
  const [data, setData] = useState(() => Object.fromEntries(NAMES.map((n) => [n, []])));
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(() => Object.fromEntries(NAMES.map((n) => [n, true])));

  /** Re-fetches one list. A failed background refresh keeps the old data. */
  const reload = useCallback(async (name) => {
    try {
      const list = await LOADERS[name]();
      setData((d) => ({ ...d, [name]: list }));
      setErrors((e) => ({ ...e, [name]: '' }));
    } catch (err) {
      setErrors((e) => ({ ...e, [name]: err.message || "Couldn't load " + name + '.' }));
    } finally {
      setLoading((l) => ({ ...l, [name]: false }));
    }
  }, []);

  /** Re-fetches everything (used on open and by the live refresh). */
  const reloadAll = useCallback(() => Promise.all(NAMES.map((n) => reload(n))), [reload]);

  // First load when the dashboard opens.
  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  return useMemo(() => ({ ...data, errors, loading, reload, reloadAll }), [data, errors, loading, reload, reloadAll]);
}

/**
 * Groups the desk's listings by seller (who is "under me" in this city).
 * Returns a Map sellerId → { id, name, email, phone, since, listings[] }.
 * Admin-created listings have no sellerId and are skipped.
 */
export function groupSellers(listings) {
  const sellers = new Map();
  listings.forEach((listing) => {
    if (!listing.sellerId) return;
    if (!sellers.has(listing.sellerId)) {
      sellers.set(listing.sellerId, {
        id: listing.sellerId,
        name: listing.sellerName || 'Unknown seller',
        email: listing.sellerEmail || '',
        phone: listing.sellerPhone || null,
        since: listing.sellerSince || null,
        listings: [],
      });
    }
    sellers.get(listing.sellerId).listings.push(listing);
  });
  return sellers;
}

/**
 * Buyers currently active anywhere on this desk (offers, visits, purchases),
 * each with a list of what they are doing. Returns an array.
 */
export function groupBuyers(negotiations, visits, purchases) {
  const buyers = new Map();
  const touch = (id, name, email) => {
    const key = id || email || name; // fall back when an id is missing
    if (!buyers.has(key)) buyers.set(key, { id: key, name: name || 'Unknown', email: email || '', activities: [] });
    return buyers.get(key);
  };
  const NEG = { pending: 'Awaiting seller', countered: 'Seller countered', accepted: 'Accepted', rejected: 'Rejected', withdrawn: 'Withdrawn' };
  const VISIT = { pending: 'awaiting confirmation', confirmed: 'confirmed', rescheduled: 'rescheduled', completed: 'completed', cancelled: 'cancelled' };
  negotiations.forEach((n) =>
    touch(n.buyerId, n.buyerName, n.buyerEmail).activities.push({
      icon: '💬',
      text: 'Offered on ' + (n.propertyTitle || 'a property') + ' — ' + (NEG[n.status] || n.status),
    }),
  );
  visits.forEach((v) =>
    touch(v.buyerId, v.buyerName, v.buyerEmail).activities.push({
      icon: '📅',
      text: 'Visit to ' + (v.propertyTitle || 'a property') + ' — ' + (VISIT[v.status] || v.status),
    }),
  );
  purchases.forEach((p) =>
    touch(p.buyerId, p.buyerName, p.buyerEmail).activities.push({
      icon: '🏠',
      text: 'Purchasing ' + (p.propertyTitle || 'a property') + ' — ' + (p.dealStatus === 'in_progress' ? p.dealStepLabel : p.dealStatus),
    }),
  );
  return [...buyers.values()];
}
