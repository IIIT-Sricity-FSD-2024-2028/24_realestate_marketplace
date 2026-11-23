/**
 * useSellerData.js
 * Purpose: Redux-connected hook providing seller data and actions:
 *          my listings, buyer negotiations, purchases, billing & catalog,
 *          plus reload operations dispatched through Redux Toolkit.
 * Inputs:  none (reads from Redux store via useSelector / useDispatch).
 * Outputs: { listings, negotiations, purchases, catalog, billing, loading,
 *            errors, reload(name), reloadAll(), deleteListing(id) }
 */
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  completedDeals,
  reloadSellerResource,
  reloadAllSellerData,
  deleteSellerListing,
  selectSellerListings,
  selectSellerNegotiations,
  selectSellerPurchases,
  selectSellerCatalog,
  selectSellerBilling,
  selectSellerLoading,
  selectSellerErrors,
  selectSelectedListing,
  setSelectedListing,
  clearSelectedListing,
} from '../../store/slices/sellerSlice.js';

export { completedDeals };

export function useSellerData() {
  const dispatch = useDispatch();

  const listings = useSelector(selectSellerListings);
  const negotiations = useSelector(selectSellerNegotiations);
  const purchases = useSelector(selectSellerPurchases);
  const catalog = useSelector(selectSellerCatalog);
  const billing = useSelector(selectSellerBilling);
  const loading = useSelector(selectSellerLoading);
  const errors = useSelector(selectSellerErrors);
  const selectedListing = useSelector(selectSelectedListing);

  const reload = useCallback((name) => dispatch(reloadSellerResource(name)), [dispatch]);
  const reloadAll = useCallback(() => dispatch(reloadAllSellerData()), [dispatch]);
  const deleteListing = useCallback((id) => dispatch(deleteSellerListing(id)), [dispatch]);
  const selectListing = useCallback((listing) => dispatch(setSelectedListing(listing)), [dispatch]);
  const clearSelection = useCallback(() => dispatch(clearSelectedListing()), [dispatch]);

  useEffect(() => {
    dispatch(reloadAllSellerData());
  }, [dispatch]);

  return useMemo(
    () => ({
      listings,
      negotiations,
      purchases,
      catalog,
      billing,
      loading,
      errors,
      selectedListing,
      reload,
      reloadAll,
      deleteListing,
      selectListing,
      clearSelection,
    }),
    [
      listings,
      negotiations,
      purchases,
      catalog,
      billing,
      loading,
      errors,
      selectedListing,
      reload,
      reloadAll,
      deleteListing,
      selectListing,
      clearSelection,
    ],
  );
}
