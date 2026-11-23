/**
 * useBuyerData.js
 * Purpose: Redux-connected hook providing buyer data and actions:
 *          browse catalogue, my offers, my deals, my visits, billing,
 *          plus per-account shortlist and under-consideration lists.
 * Inputs:  none (reads from Redux store via useSelector / useDispatch).
 * Outputs: { catalog, negotiations, purchases, visits, catalogInfo, billing,
 *            loading, errors, reload(name), reloadAll(),
 *            shortlist, toggleShortlist(card), considering, addConsidering(card),
 *            removeConsidering(card) }
 */
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  listingPhotos,
  toBuyerCard,
  legacyCardId,
  savedMatches,
  reloadBuyerResource,
  reloadAllBuyerData,
  toggleShortlist as toggleShortlistAction,
  addConsidering as addConsideringAction,
  removeConsidering as removeConsideringAction,
  selectBuyerCatalog,
  selectBuyerNegotiations,
  selectBuyerPurchases,
  selectBuyerVisits,
  selectBuyerCatalogInfo,
  selectBuyerBilling,
  selectBuyerLoading,
  selectBuyerErrors,
  selectBuyerShortlist,
  selectBuyerConsidering,
} from '../../store/slices/buyerSlice.js';

export { listingPhotos, toBuyerCard, legacyCardId, savedMatches };

export function useBuyerData() {
  const dispatch = useDispatch();

  const catalog = useSelector(selectBuyerCatalog);
  const negotiations = useSelector(selectBuyerNegotiations);
  const purchases = useSelector(selectBuyerPurchases);
  const visits = useSelector(selectBuyerVisits);
  const catalogInfo = useSelector(selectBuyerCatalogInfo);
  const billing = useSelector(selectBuyerBilling);
  const loading = useSelector(selectBuyerLoading);
  const errors = useSelector(selectBuyerErrors);
  const shortlist = useSelector(selectBuyerShortlist);
  const considering = useSelector(selectBuyerConsidering);

  const reload = useCallback((name) => dispatch(reloadBuyerResource(name)), [dispatch]);
  const reloadAll = useCallback(() => dispatch(reloadAllBuyerData()), [dispatch]);

  useEffect(() => {
    dispatch(reloadAllBuyerData());
    try {
      localStorage.removeItem('properties');
    } catch {
      /* private mode */
    }
  }, [dispatch]);

  /** Heart button: add if missing, remove if present. Returns true when added. */
  const toggleShortlist = useCallback(
    (card) => {
      const exists = shortlist.some((e) => savedMatches(e, card));
      dispatch(toggleShortlistAction(card));
      return !exists;
    },
    [dispatch, shortlist],
  );

  /** Adds to "Under Consideration". Returns false if it was already there. */
  const addConsidering = useCallback(
    (card) => {
      const exists = considering.some((e) => savedMatches(e, card));
      if (exists) return false;
      dispatch(addConsideringAction(card));
      return true;
    },
    [dispatch, considering],
  );

  const removeConsidering = useCallback(
    (card) => {
      dispatch(removeConsideringAction(card));
    },
    [dispatch],
  );

  return useMemo(
    () => ({
      catalog,
      negotiations,
      purchases,
      visits,
      catalogInfo,
      billing,
      loading,
      errors,
      reload,
      reloadAll,
      shortlist,
      toggleShortlist,
      considering,
      addConsidering,
      removeConsidering,
    }),
    [
      catalog,
      negotiations,
      purchases,
      visits,
      catalogInfo,
      billing,
      loading,
      errors,
      reload,
      reloadAll,
      shortlist,
      toggleShortlist,
      considering,
      addConsidering,
      removeConsidering,
    ],
  );
}
