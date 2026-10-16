/**
 * useBuyerData.js
 * Purpose: Loads and keeps fresh everything the buyer dashboard shows:
 *          the full browse catalogue, my offers, my deals, my visits and
 *          billing — plus the per-account shortlist / under-consideration lists.
 * Inputs:  none.
 * Outputs: { catalog, negotiations, purchases, visits, catalogInfo, billing,
 *            loading, errors, reload(name), reloadAll(),
 *            shortlist, toggleShortlist(id), considering, addConsidering(id),
 *            removeConsidering(id) }
 * API calls:
 *   GET /properties?limit=50&page=N (every page, max 20) – browse catalogue
 *   GET /negotiations/mine, GET /purchases/mine, GET /visits/mine
 *   GET /billing/catalog (once), GET /billing/summary
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { billingApi, negotiationsApi, propertiesApi, purchasesApi, visitsApi } from '../../api/services.js';
import { readUserData, writeUserData } from '../../auth/session.js';
import { capitalize, formatCompactINR } from '../../utils/format.js';
import { FALLBACK_PROPERTY_IMAGE } from '../../utils/constants.js';

const MAX_CATALOG_PAGES = 20; // safety cap (the API returns max 50 per page)
const POPULAR_STRIP_SIZE = 8; // first N of the API order (promoted first, then newest)
const STATUS_LABELS = { available: 'Available', under_offer: 'Under Offer', sold: 'Sold', rented: 'Rented' };

/** Every photo of a listing: real images, else image-type documents (older uploads). */
export function listingPhotos(rp) {
  const images = (rp.images || []).filter(Boolean);
  if (images.length) return images;
  return (rp.documents || []).filter((d) => /\.(jpe?g|png|webp)$/i.test(d.url || d.originalName || '')).map((d) => d.url);
}

/** Maps an API listing to the card shape the buyer pages render. */
export function toBuyerCard(rp, index = 0) {
  const price = rp.price || 0;
  const gallery = listingPhotos(rp);
  return {
    id: rp.id, // real MongoDB id
    title: rp.title,
    type: rp.type ? capitalize(rp.type) : 'Property',
    listingType: rp.listingType === 'rent' ? 'Rent' : 'Buy',
    location: rp.city, // used by the Location filter
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

/**
 * The old dashboard stored shortlist entries as numeric "card ids" hashed
 * from the listing id (FNV-1a). Recomputing that hash lets a buyer's
 * existing shortlist keep working after the move to plain listing ids.
 */
export function legacyCardId(realId) {
  let h = 0x811c9dc5;
  const str = String(realId);
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return 1000 + (h % 2000000000);
}

/** True when a saved entry (new string id or legacy number) refers to `card`. */
export function savedMatches(entry, card) {
  return String(entry) === String(card.id) || String(entry) === String(legacyCardId(card.id));
}

/** Fetches every page of the public catalogue. */
async function fetchEveryListing() {
  const all = [];
  for (let page = 1; page <= MAX_CATALOG_PAGES; page += 1) {
    const data = (await propertiesApi.list({ limit: 50, page })).data || {};
    all.push(...(data.items || []));
    if (page >= (data.totalPages || 1) || !(data.items || []).length) break;
  }
  return all;
}

export function useBuyerData() {
  const [state, setState] = useState({ catalog: [], negotiations: [], purchases: [], visits: [], catalogInfo: null, billing: null });
  const [loading, setLoading] = useState({ catalog: true, deals: true, visits: true, billing: true });
  const [errors, setErrors] = useState({});
  const billingCatalogRef = useRef(null);

  // Per-account saved lists (localStorage, same keys as before).
  const [shortlist, setShortlist] = useState(() => readUserData('slList', []));
  const [considering, setConsidering] = useState(() => readUserData('ucList', []));

  const LOADERS = useMemo(
    () => ({
      catalog: async () => ({ catalog: (await fetchEveryListing()).map((rp, i) => toBuyerCard(rp, i)) }),
      deals: async () => {
        const [neg, pur] = await Promise.all([negotiationsApi.mine(), purchasesApi.mine()]);
        return { negotiations: neg.data || [], purchases: pur.data || [] };
      },
      visits: async () => ({ visits: (await visitsApi.mine()).data || [] }),
      billing: async () => {
        if (!billingCatalogRef.current) billingCatalogRef.current = (await billingApi.catalog()).data;
        return { catalogInfo: billingCatalogRef.current, billing: (await billingApi.summary()).data };
      },
    }),
    [],
  );

  const reload = useCallback(
    async (name) => {
      try {
        const patch = await LOADERS[name]();
        setState((s) => ({ ...s, ...patch }));
        setErrors((e) => ({ ...e, [name]: '' }));
      } catch (err) {
        // A failed background poll keeps what is already on screen.
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
    // An old build merged a localStorage "properties" key into the catalogue;
    // nothing writes it any more, so clear leftovers (as the old page did).
    try {
      localStorage.removeItem('properties');
    } catch {
      /* private mode */
    }
  }, [reloadAll]);

  /** Heart button: add if missing, remove if present. Returns true when added. */
  const toggleShortlist = useCallback(
    (card) => {
      const exists = shortlist.some((e) => savedMatches(e, card));
      const next = exists ? shortlist.filter((e) => !savedMatches(e, card)) : [...shortlist, card.id];
      writeUserData('slList', next); // persist for this account
      setShortlist(next);
      return !exists;
    },
    [shortlist],
  );

  /** Adds to "Under Consideration". Returns false if it was already there. */
  const addConsidering = useCallback(
    (card) => {
      if (considering.some((e) => savedMatches(e, card))) return false;
      const next = [...considering, card.id];
      writeUserData('ucList', next);
      setConsidering(next);
      return true;
    },
    [considering],
  );

  const removeConsidering = useCallback(
    (card) => {
      const next = considering.filter((e) => !savedMatches(e, card));
      writeUserData('ucList', next);
      setConsidering(next);
    },
    [considering],
  );

  return useMemo(
    () => ({ ...state, loading, errors, reload, reloadAll, shortlist, toggleShortlist, considering, addConsidering, removeConsidering }),
    [state, loading, errors, reload, reloadAll, shortlist, toggleShortlist, considering, addConsidering, removeConsidering],
  );
}
