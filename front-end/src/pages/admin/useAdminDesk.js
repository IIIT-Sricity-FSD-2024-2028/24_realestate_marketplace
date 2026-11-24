/** Redux selectors and commands for the city-admin's shared queues. */
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReviewNegotiations, fetchReviewProperties, fetchReviewPurchases, fetchReviewVisits, fetchUsers } from '../../store/actions/apiActions.js';

export function useAdminDesk() {
  const dispatch = useDispatch();
  const listings = useSelector((state) => state.properties.review);
  const negotiationsState = useSelector((state) => state.negotiations);
  const purchasesState = useSelector((state) => state.purchases);
  const visitsState = useSelector((state) => state.visits);
  const usersState = useSelector((state) => state.users);
  const negotiations = negotiationsState.review;
  const purchases = purchasesState.review;
  const visits = visitsState.review;
  const users = usersState.items;
  const properties = useSelector((state) => state.properties);
  const reload = useCallback(
    (name) => {
      const loads = {
        listings: () => dispatch(fetchReviewProperties()).unwrap(),
        negotiations: () => dispatch(fetchReviewNegotiations()).unwrap(),
        purchases: () => dispatch(fetchReviewPurchases()).unwrap(),
        visits: () => dispatch(fetchReviewVisits()).unwrap(),
        users: () => dispatch(fetchUsers()).unwrap(),
      };
      return loads[name]?.() || Promise.resolve();
    },
    [dispatch],
  );
  const reloadAll = useCallback(() => Promise.all(['listings', 'negotiations', 'purchases', 'visits', 'users'].map(reload)), [reload]);
  useEffect(() => {
    reloadAll();
  }, [reloadAll]);
  return useMemo(
    () => ({
      listings,
      negotiations,
      purchases,
      visits,
      users,
      errors: {
        listings: properties.error,
        negotiations: negotiationsState.error,
        purchases: purchasesState.error,
        visits: visitsState.error,
        users: usersState.error,
      },
      loading: {
        listings: properties.loading.review,
        negotiations: negotiationsState.loading.review,
        purchases: purchasesState.loading.review,
        visits: visitsState.loading.review,
        users: usersState.loading,
      },
      reload,
      reloadAll,
    }),
    [listings, negotiations, purchases, visits, users, properties, negotiationsState, purchasesState, visitsState, usersState, reload, reloadAll],
  );
}

export function groupSellers(listings) {
  const sellers = new Map();
  listings.forEach((listing) => {
    if (!listing.sellerId) return;
    if (!sellers.has(listing.sellerId))
      sellers.set(listing.sellerId, {
        id: listing.sellerId,
        name: listing.sellerName || 'Unknown seller',
        email: listing.sellerEmail || '',
        phone: listing.sellerPhone || null,
        since: listing.sellerSince || null,
        listings: [],
      });
    sellers.get(listing.sellerId).listings.push(listing);
  });
  return sellers;
}
export function groupBuyers(negotiations, visits, purchases) {
  const buyers = new Map();
  const touch = (id, name, email) => {
    const key = id || email || name;
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
