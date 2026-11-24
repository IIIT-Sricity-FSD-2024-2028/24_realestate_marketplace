/** Redux selectors and commands for the buyer dashboard. */
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllProperties,
  fetchBillingCatalog,
  fetchBillingSummary,
  fetchMyNegotiations,
  fetchMyPurchases,
  fetchMyVisits,
} from '../../store/actions/apiActions.js';
import { considerationAdded, considerationRemoved, shortlistToggled } from '../../store/slices/buyerSlice.js';
import { capitalize, formatCompactINR } from '../../utils/format.js';
import { FALLBACK_PROPERTY_IMAGE } from '../../utils/constants.js';

const POPULAR_STRIP_SIZE = 8;
const STATUS_LABELS = { available: 'Available', under_offer: 'Under Offer', sold: 'Sold', rented: 'Rented' };
export function listingPhotos(rp) {
  const images = (rp.images || []).filter(Boolean);
  return images.length ? images : (rp.documents || []).filter((d) => /\.(jpe?g|png|webp)$/i.test(d.url || d.originalName || '')).map((d) => d.url);
}
export function toBuyerCard(rp, index = 0) {
  const price = rp.price || 0;
  const gallery = listingPhotos(rp);
  return {
    id: rp.id,
    title: rp.title,
    type: rp.type ? capitalize(rp.type) : 'Property',
    listingType: rp.listingType === 'rent' ? 'Rent' : 'Buy',
    location: rp.city,
    area: rp.address ? rp.address + ', ' + rp.city : rp.city || '',
    price,
    priceFmt: formatCompactINR(price) + (rp.listingType === 'rent' ? '/mo' : ''),
    priceFull: '₹' + price.toLocaleString('en-IN'),
    perSqft: rp.areaSqft ? '₹' + Math.round(price / rp.areaSqft).toLocaleString('en-IN') + ' per sqft' : 'N/A',
    beds: rp.bedrooms || 0,
    baths: rp.bathrooms || 0,
    sqft: rp.areaSqft || 0,
    status: STATUS_LABELS[rp.status] || 'Available',
    tx: rp.listingType === 'rent' ? 'For Rent' : 'For Sale',
    img: gallery[0] || FALLBACK_PROPERTY_IMAGE,
    gallery: gallery.length ? gallery : [FALLBACK_PROPERTY_IMAGE],
    photoCount: gallery.length,
    popular: index < POPULAR_STRIP_SIZE,
    isFeatured: !!rp.isFeatured,
    featuredTier: rp.featuredTier || null,
    desc: rp.description || '',
  };
}
export function legacyCardId(realId) {
  return String(realId);
}
export function savedMatches(entry, card) {
  return String(entry) === String(card.id);
}

export function useBuyerData() {
  const dispatch = useDispatch();
  const properties = useSelector((state) => state.properties);
  const negotiationsState = useSelector((state) => state.negotiations);
  const purchasesState = useSelector((state) => state.purchases);
  const visitsState = useSelector((state) => state.visits);
  const negotiations = negotiationsState.mine;
  const purchases = purchasesState.mine;
  const visits = visitsState.mine;
  const billing = useSelector((state) => state.billing);
  const buyer = useSelector((state) => state.buyer);
  const catalog = useMemo(() => properties.public.items.map(toBuyerCard), [properties.public.items]);
  const reload = useCallback(
    (name) => {
      const loads = {
        catalog: () => dispatch(fetchAllProperties()).unwrap(),
        deals: () => Promise.all([dispatch(fetchMyNegotiations()).unwrap(), dispatch(fetchMyPurchases()).unwrap()]),
        visits: () => dispatch(fetchMyVisits()).unwrap(),
        billing: () => Promise.all([dispatch(fetchBillingCatalog()).unwrap(), dispatch(fetchBillingSummary()).unwrap()]),
      };
      return loads[name]?.() || Promise.resolve();
    },
    [dispatch],
  );
  const reloadAll = useCallback(() => Promise.all(['catalog', 'deals', 'visits', 'billing'].map(reload)), [reload]);
  useEffect(() => {
    reloadAll();
  }, [reloadAll]);
  const toggleShortlist = useCallback(
    (card) => {
      const exists = buyer.shortlist.some((item) => savedMatches(item, card));
      dispatch(shortlistToggled(card.id));
      return !exists;
    },
    [buyer.shortlist, dispatch],
  );
  const addConsidering = useCallback(
    (card) => {
      const exists = buyer.considering.some((item) => savedMatches(item, card));
      if (!exists) dispatch(considerationAdded(card.id));
      return !exists;
    },
    [buyer.considering, dispatch],
  );
  const removeConsidering = useCallback((card) => dispatch(considerationRemoved(card.id)), [dispatch]);
  return useMemo(
    () => ({
      catalog,
      negotiations,
      purchases,
      visits,
      catalogInfo: billing.catalog,
      billing: billing.summary,
      loading: {
        catalog: properties.loading.public,
        deals: negotiationsState.loading.mine || purchasesState.loading.mine,
        visits: visitsState.loading.mine,
        billing: billing.loading.catalog || billing.loading.summary,
      },
      errors: {
        catalog: properties.error,
        deals: negotiationsState.error || purchasesState.error,
        visits: visitsState.error,
        billing: billing.error,
      },
      reload,
      reloadAll,
      shortlist: buyer.shortlist,
      toggleShortlist,
      considering: buyer.considering,
      addConsidering,
      removeConsidering,
    }),
    [
      catalog,
      negotiations,
      purchases,
      visits,
      billing,
      properties,
      negotiationsState,
      purchasesState,
      visitsState,
      buyer,
      reload,
      reloadAll,
      toggleShortlist,
      addConsidering,
      removeConsidering,
    ],
  );
}
