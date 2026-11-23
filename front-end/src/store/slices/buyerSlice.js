/**
 * buyerSlice.js
 * Purpose: Central Redux slice for the Buyer module.
 * State:
 *   catalog         – browse catalogue mapped into buyer card shapes
 *   negotiations    – buyer's active and past offer negotiations
 *   purchases       – buyer's active purchase tracking and completed deals
 *   visits          – buyer's scheduled site visit requests
 *   catalogInfo     – billing catalog info (brokerage tiers / Razorpay key)
 *   billing         – buyer's billing summary (commissions, receipts, spend)
 *   loading         – loading status per resource { catalog, deals, visits, billing }
 *   errors          – error messages per resource { catalog, deals, visits, billing }
 *   shortlist       – persisted array of hearted listing IDs (per account in localStorage)
 *   considering     – persisted array of under-consideration listing IDs (per account in localStorage)
 *   detailCard      – active listing object displayed in PropertyDetailModal (or null)
 *   offerCard       – active listing object for OfferFormModal (or null)
 *   visitCard       – active listing object for ScheduleVisitModal (or null)
 *   contactCard     – active listing object for ContactManagerModal (or null)
 *   offerDoneMessage– message string displayed in the Offer Submitted modal (or null)
 * Thunks:
 *   fetchBuyerCatalog   – GET /properties (all pages, capped at 20)
 *   fetchBuyerDeals     – GET /negotiations/mine & GET /purchases/mine
 *   fetchBuyerVisits    – GET /visits/mine
 *   fetchBuyerBilling   – GET /billing/catalog & GET /billing/summary
 *   reloadBuyerResource – re-fetches a single buyer resource by name
 *   reloadAllBuyerData  – re-fetches all buyer resources in parallel
 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { billingApi, negotiationsApi, propertiesApi, purchasesApi, visitsApi } from '../../api/services.js';
import { readUserData, writeUserData } from '../../auth/session.js';
import { capitalize, formatCompactINR } from '../../utils/format.js';
import { FALLBACK_PROPERTY_IMAGE } from '../../utils/constants.js';

const MAX_CATALOG_PAGES = 20; // safety cap (API returns max 50 per page)
const POPULAR_STRIP_SIZE = 8; // first N of the API order (promoted first, then newest)
const STATUS_LABELS = { available: 'Available', under_offer: 'Under Offer', sold: 'Sold', rented: 'Rented' };

/** Extract every photo URL of a listing. */
export function listingPhotos(rp) {
  const images = (rp.images || []).filter(Boolean);
  if (images.length) return images;
  return (rp.documents || []).filter((d) => /\.(jpe?g|png|webp)$/i.test(d.url || d.originalName || '')).map((d) => d.url);
}

/** Map backend property object to buyer card shape. */
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

/** FNV-1a hash matching the legacy dashboard integer IDs. */
export function legacyCardId(realId) {
  let h = 0x811c9dc5;
  const str = String(realId);
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return 1000 + (h % 2000000000);
}

/** Check if a saved ID (legacy hash or Mongo ID string) matches a card. */
export function savedMatches(entry, card) {
  if (!card) return false;
  return String(entry) === String(card.id) || String(entry) === String(legacyCardId(card.id));
}

/** Fetch all pages from propertiesApi. */
async function fetchEveryListing() {
  const all = [];
  for (let page = 1; page <= MAX_CATALOG_PAGES; page += 1) {
    const data = (await propertiesApi.list({ limit: 50, page })).data || {};
    all.push(...(data.items || []));
    if (page >= (data.totalPages || 1) || !(data.items || []).length) break;
  }
  return all;
}

// ── Async Thunks ─────────────────────────────────────────────────────────────

/** Fetch browse catalogue (GET /properties). */
export const fetchBuyerCatalog = createAsyncThunk('buyer/fetchCatalog', async (_, { rejectWithValue }) => {
  try {
    const rawList = await fetchEveryListing();
    return rawList.map((rp, i) => toBuyerCard(rp, i));
  } catch (err) {
    return rejectWithValue(err.message || 'Could not load property catalogue');
  }
});

/** Fetch buyer negotiations and purchases (GET /negotiations/mine & GET /purchases/mine). */
export const fetchBuyerDeals = createAsyncThunk('buyer/fetchDeals', async (_, { rejectWithValue }) => {
  try {
    const [neg, pur] = await Promise.all([negotiationsApi.mine(), purchasesApi.mine()]);
    return {
      negotiations: neg.data || [],
      purchases: pur.data || [],
    };
  } catch (err) {
    return rejectWithValue(err.message || 'Could not load deals');
  }
});

/** Fetch buyer site visits (GET /visits/mine). */
export const fetchBuyerVisits = createAsyncThunk('buyer/fetchVisits', async (_, { rejectWithValue }) => {
  try {
    const res = await visitsApi.mine();
    return res.data || [];
  } catch (err) {
    return rejectWithValue(err.message || 'Could not load visits');
  }
});

/** Fetch buyer billing summary and catalog info (GET /billing/catalog & GET /billing/summary). */
export const fetchBuyerBilling = createAsyncThunk('buyer/fetchBilling', async (_, { getState, rejectWithValue }) => {
  try {
    const currentCatalogInfo = getState().buyer?.catalogInfo;
    const catalogInfoPromise = currentCatalogInfo ? Promise.resolve({ data: currentCatalogInfo }) : billingApi.catalog();
    const [catRes, sumRes] = await Promise.all([catalogInfoPromise, billingApi.summary()]);
    return {
      catalogInfo: catRes.data,
      billing: sumRes.data,
    };
  } catch (err) {
    return rejectWithValue(err.message || 'Could not load billing');
  }
});

/** Re-fetch a specific buyer resource by key: 'catalog' | 'deals' | 'visits' | 'billing'. */
export const reloadBuyerResource = createAsyncThunk('buyer/reloadResource', async (name, { dispatch }) => {
  switch (name) {
    case 'catalog':
      return dispatch(fetchBuyerCatalog()).unwrap();
    case 'deals':
      return dispatch(fetchBuyerDeals()).unwrap();
    case 'visits':
      return dispatch(fetchBuyerVisits()).unwrap();
    case 'billing':
      return dispatch(fetchBuyerBilling()).unwrap();
    default:
      return null;
  }
});

/** Re-fetch all buyer resources in parallel. */
export const reloadAllBuyerData = createAsyncThunk('buyer/reloadAll', async (_, { dispatch }) => {
  await Promise.all([
    dispatch(fetchBuyerCatalog()),
    dispatch(fetchBuyerDeals()),
    dispatch(fetchBuyerVisits()),
    dispatch(fetchBuyerBilling()),
  ]);
});

// ── Slice ────────────────────────────────────────────────────────────────────

const buyerSlice = createSlice({
  name: 'buyer',
  initialState: {
    catalog: [],
    negotiations: [],
    purchases: [],
    visits: [],
    catalogInfo: null,
    billing: null,
    loading: {
      catalog: true,
      deals: true,
      visits: true,
      billing: true,
    },
    errors: {
      catalog: null,
      deals: null,
      visits: null,
      billing: null,
    },
    shortlist: readUserData('slList', []),
    considering: readUserData('ucList', []),

    // Shared modal dialog state
    detailCard: null,
    offerCard: null,
    visitCard: null,
    contactCard: null,
    offerDoneMessage: null,
  },
  reducers: {
    // ── Saved Lists (Shortlist & Considering) ─────────────────────────────────
    toggleShortlist(state, action) {
      const card = action.payload;
      const exists = state.shortlist.some((e) => savedMatches(e, card));
      const next = exists ? state.shortlist.filter((e) => !savedMatches(e, card)) : [...state.shortlist, card.id];
      writeUserData('slList', next);
      state.shortlist = next;
    },
    addConsidering(state, action) {
      const card = action.payload;
      if (!state.considering.some((e) => savedMatches(e, card))) {
        const next = [...state.considering, card.id];
        writeUserData('ucList', next);
        state.considering = next;
      }
    },
    removeConsidering(state, action) {
      const card = action.payload;
      const next = state.considering.filter((e) => !savedMatches(e, card));
      writeUserData('ucList', next);
      state.considering = next;
    },
    setShortlist(state, action) {
      state.shortlist = action.payload;
      writeUserData('slList', action.payload);
    },
    setConsidering(state, action) {
      state.considering = action.payload;
      writeUserData('ucList', action.payload);
    },

    // ── Modal State Controls ──────────────────────────────────────────────────
    setDetailCard(state, action) {
      state.detailCard = action.payload;
    },
    closeDetailModal(state) {
      state.detailCard = null;
    },
    openOfferModal(state, action) {
      state.detailCard = null;
      state.offerCard = action.payload;
    },
    closeOfferModal(state) {
      state.offerCard = null;
    },
    openVisitModal(state, action) {
      state.detailCard = null;
      state.contactCard = null;
      state.visitCard = action.payload;
    },
    closeVisitModal(state) {
      state.visitCard = null;
    },
    openContactModal(state, action) {
      state.contactCard = action.payload;
    },
    closeContactModal(state) {
      state.contactCard = null;
    },
    setOfferDoneMessage(state, action) {
      state.offerDoneMessage = action.payload;
    },
    closeOfferDoneModal(state) {
      state.offerDoneMessage = null;
    },
    closeAllModals(state) {
      state.detailCard = null;
      state.offerCard = null;
      state.visitCard = null;
      state.contactCard = null;
      state.offerDoneMessage = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchBuyerCatalog ──────────────────────────────────────────────────
    builder
      .addCase(fetchBuyerCatalog.pending, (state) => {
        state.loading.catalog = true;
        state.errors.catalog = null;
      })
      .addCase(fetchBuyerCatalog.fulfilled, (state, action) => {
        state.loading.catalog = false;
        state.catalog = action.payload;
        state.errors.catalog = null;
      })
      .addCase(fetchBuyerCatalog.rejected, (state, action) => {
        state.loading.catalog = false;
        state.errors.catalog = action.payload;
      });

    // ── fetchBuyerDeals ────────────────────────────────────────────────────
    builder
      .addCase(fetchBuyerDeals.pending, (state) => {
        state.loading.deals = true;
        state.errors.deals = null;
      })
      .addCase(fetchBuyerDeals.fulfilled, (state, action) => {
        state.loading.deals = false;
        state.negotiations = action.payload.negotiations;
        state.purchases = action.payload.purchases;
        state.errors.deals = null;
      })
      .addCase(fetchBuyerDeals.rejected, (state, action) => {
        state.loading.deals = false;
        state.errors.deals = action.payload;
      });

    // ── fetchBuyerVisits ───────────────────────────────────────────────────
    builder
      .addCase(fetchBuyerVisits.pending, (state) => {
        state.loading.visits = true;
        state.errors.visits = null;
      })
      .addCase(fetchBuyerVisits.fulfilled, (state, action) => {
        state.loading.visits = false;
        state.visits = action.payload;
        state.errors.visits = null;
      })
      .addCase(fetchBuyerVisits.rejected, (state, action) => {
        state.loading.visits = false;
        state.errors.visits = action.payload;
      });

    // ── fetchBuyerBilling ──────────────────────────────────────────────────
    builder
      .addCase(fetchBuyerBilling.pending, (state) => {
        state.loading.billing = true;
        state.errors.billing = null;
      })
      .addCase(fetchBuyerBilling.fulfilled, (state, action) => {
        state.loading.billing = false;
        state.catalogInfo = action.payload.catalogInfo;
        state.billing = action.payload.billing;
        state.errors.billing = null;
      })
      .addCase(fetchBuyerBilling.rejected, (state, action) => {
        state.loading.billing = false;
        state.errors.billing = action.payload;
      });
  },
});

export const {
  toggleShortlist,
  addConsidering,
  removeConsidering,
  setShortlist,
  setConsidering,
  setDetailCard,
  closeDetailModal,
  openOfferModal,
  closeOfferModal,
  openVisitModal,
  closeVisitModal,
  openContactModal,
  closeContactModal,
  setOfferDoneMessage,
  closeOfferDoneModal,
  closeAllModals,
} = buyerSlice.actions;

// ── Selectors ────────────────────────────────────────────────────────────────
export const selectBuyer = (state) => state.buyer;
export const selectBuyerCatalog = (state) => state.buyer?.catalog || [];
export const selectBuyerNegotiations = (state) => state.buyer?.negotiations || [];
export const selectBuyerPurchases = (state) => state.buyer?.purchases || [];
export const selectBuyerVisits = (state) => state.buyer?.visits || [];
export const selectBuyerCatalogInfo = (state) => state.buyer?.catalogInfo || null;
export const selectBuyerBilling = (state) => state.buyer?.billing || null;
export const selectBuyerLoading = (state) => state.buyer?.loading || { catalog: false, deals: false, visits: false, billing: false };
export const selectBuyerErrors = (state) => state.buyer?.errors || {};
export const selectBuyerShortlist = (state) => state.buyer?.shortlist || [];
export const selectBuyerConsidering = (state) => state.buyer?.considering || [];

export const selectDetailCard = (state) => state.buyer?.detailCard || null;
export const selectOfferCard = (state) => state.buyer?.offerCard || null;
export const selectVisitCard = (state) => state.buyer?.visitCard || null;
export const selectContactCard = (state) => state.buyer?.contactCard || null;
export const selectOfferDoneMessage = (state) => state.buyer?.offerDoneMessage || null;

export default buyerSlice.reducer;
