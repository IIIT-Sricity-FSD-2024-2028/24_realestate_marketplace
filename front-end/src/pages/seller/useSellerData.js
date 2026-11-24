/** Redux selectors and commands for seller-wide data. */
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBillingCatalog, fetchBillingSummary, fetchMyProperties, fetchSellerNegotiations, fetchSellerPurchases } from '../../store/actions/apiActions.js';

export function useSellerData() {
  const dispatch = useDispatch();
  const listings = useSelector((state) => state.properties.mine);
  const negotiationsState = useSelector((state) => state.negotiations);
  const purchasesState = useSelector((state) => state.purchases);
  const negotiations = negotiationsState.seller;
  const purchases = purchasesState.seller;
  const billing = useSelector((state) => state.billing);
  const properties = useSelector((state) => state.properties);
  const reload = useCallback(
    (name) => {
      const loads = {
        listings: () => dispatch(fetchMyProperties()).unwrap(),
        negotiations: () => dispatch(fetchSellerNegotiations()).unwrap(),
        purchases: () => dispatch(fetchSellerPurchases()).unwrap(),
        billing: () => Promise.all([dispatch(fetchBillingCatalog()).unwrap(), dispatch(fetchBillingSummary()).unwrap()]),
      };
      return loads[name]?.() || Promise.resolve();
    },
    [dispatch],
  );
  const reloadAll = useCallback(() => Promise.all(['listings', 'negotiations', 'purchases', 'billing'].map(reload)), [reload]);
  useEffect(() => {
    reloadAll();
  }, [reloadAll]);
  return useMemo(
    () => ({
      listings,
      negotiations,
      purchases,
      catalog: billing.catalog,
      billing: billing.summary,
      loading: {
        listings: properties.loading.mine,
        negotiations: negotiationsState.loading.seller,
        purchases: purchasesState.loading.seller,
        billing: billing.loading.catalog || billing.loading.summary,
      },
      errors: {
        listings: properties.error,
        negotiations: negotiationsState.error,
        purchases: purchasesState.error,
        billing: billing.error,
      },
      reload,
      reloadAll,
    }),
    [listings, negotiations, purchases, billing, properties, negotiationsState, purchasesState, reload, reloadAll],
  );
}

export function completedDeals(purchases, listingType) {
  return purchases.filter((p) => p.dealStatus === 'completed' && p.propertyListingType === listingType);
}
