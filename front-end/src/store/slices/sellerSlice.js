/**
 * sellerSlice.js
 * Purpose: Central Redux slice for the Seller module.
 * State:
 *   listings              – seller's submitted properties (GET /properties/mine)
 *   negotiations          – buyer offers on seller's properties (GET /negotiations/seller-queue)
 *   purchases             – deals / purchases involving seller's properties (GET /purchases/seller-queue)
 *   catalog               – billing catalog (plans, pricing, payment gateway config)
 *   billing               – seller's billing summary (plan, listing quota, commissions, payments)
 *   loading               – loading status per resource { listings, negotiations, purchases, billing }
 *   errors                – error messages per resource { listings, negotiations, purchases, billing }
 *   selectedListing       – currently selected listing object (or null)
 *   listingsFilter        – active filter on My Listings ('all' | 'approved' | 'pending' | 'rejected')
 *   negotiationsFilter    – active filter on Negotiate ('all' | 'ongoing' | 'completed' | 'rejected')
 *   paymentsFilter        – active filter on Track Payments ('all' | 'ongoing' | 'completed' | 'rejected')
 *   billingCycle          – selected cycle on Billing & Plans ('monthly' | 'quarterly' | 'yearly')
 *   counteringNegotiation – active negotiation object for counter offer modal (or null)
 *   quotaMessage          – error message for 402 plan limit modal (or '')
 * Thunks:
 *   fetchSellerListings        – GET /properties/mine
 *   fetchSellerNegotiations    – GET /negotiations/seller-queue?limit=100
 *   fetchSellerPurchases       – GET /purchases/seller-queue?limit=100
 *   fetchSellerBilling         – GET /billing/catalog & GET /billing/summary
 *   reloadSellerResource       – re-fetches a single seller resource by name
 *   reloadAllSellerData        – re-fetches all seller resources in parallel
 *   deleteSellerListing        – DELETE /properties/:id and refreshes listings & billing quota
 *   acceptSellerOffer          – PATCH /negotiations/:id/accept and refreshes offers & deals
 *   counterSellerOffer         – PATCH /negotiations/:id/counter and refreshes offers
 *   rejectSellerOffer          – PATCH /negotiations/:id/reject and refreshes offers
 *   cancelSellerSubscription   – PATCH /billing/subscription/cancel and refreshes billing & listings
 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { billingApi, negotiationsApi, propertiesApi, purchasesApi } from '../../api/services.js';

/** Filter completed deals of one listing type ('sale' | 'rent'). */
export function completedDeals(purchases, listingType) {
  return (purchases || []).filter((p) => p.dealStatus === 'completed' && p.propertyListingType === listingType);
}

// ── Async Thunks ─────────────────────────────────────────────────────────────

/** Fetch seller's own property listings (GET /properties/mine). */
export const fetchSellerListings = createAsyncThunk(
  'seller/fetchListings',
  async (_, { rejectWithValue }) => {
    try {
      const res = await propertiesApi.mine();
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err.message || 'Could not load listings');
    }
  },
);

/** Fetch offers on seller's listings (GET /negotiations/seller-queue?limit=100). */
export const fetchSellerNegotiations = createAsyncThunk(
  'seller/fetchNegotiations',
  async (_, { rejectWithValue }) => {
    try {
      const res = await negotiationsApi.sellerQueue(100);
      return res.data?.items || [];
    } catch (err) {
      return rejectWithValue(err.message || 'Could not load negotiations');
    }
  },
);

/** Fetch seller's active deals and completed purchases (GET /purchases/seller-queue?limit=100). */
export const fetchSellerPurchases = createAsyncThunk(
  'seller/fetchPurchases',
  async (_, { rejectWithValue }) => {
    try {
      const res = await purchasesApi.sellerQueue(100);
      return res.data?.items || [];
    } catch (err) {
      return rejectWithValue(err.message || 'Could not load purchases');
    }
  },
);

/** Fetch seller billing summary and catalog info (GET /billing/catalog & GET /billing/summary). */
export const fetchSellerBilling = createAsyncThunk(
  'seller/fetchBilling',
  async (_, { getState, rejectWithValue }) => {
    try {
      const currentCatalog = getState().seller?.catalog;
      const catalogPromise = currentCatalog ? Promise.resolve({ data: currentCatalog }) : billingApi.catalog();
      const [catRes, sumRes] = await Promise.all([catalogPromise, billingApi.summary()]);
      return {
        catalog: catRes.data,
        billing: sumRes.data,
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Could not load billing');
    }
  },
);

/** Delete a seller property listing and update local state + quota. */
export const deleteSellerListing = createAsyncThunk(
  'seller/deleteListing',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await propertiesApi.remove(id);
      dispatch(removeListing(id));
      dispatch(reloadSellerResource('billing'));
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete property');
    }
  },
);

/** Accept an offer on seller's listing (creates a purchase deal). */
export const acceptSellerOffer = createAsyncThunk(
  'seller/acceptOffer',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await negotiationsApi.accept(id);
      await Promise.all([
        dispatch(fetchSellerNegotiations()),
        dispatch(fetchSellerPurchases()),
      ]);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to accept offer');
    }
  },
);

/** Make a counter offer on a buyer's offer. */
export const counterSellerOffer = createAsyncThunk(
  'seller/counterOffer',
  async ({ id, amount }, { dispatch, rejectWithValue }) => {
    try {
      await negotiationsApi.counter(id, amount);
      await dispatch(fetchSellerNegotiations());
      return { id, amount };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to submit counter offer');
    }
  },
);

/** Reject a buyer's offer with an optional reason. */
export const rejectSellerOffer = createAsyncThunk(
  'seller/rejectOffer',
  async ({ id, reason }, { dispatch, rejectWithValue }) => {
    try {
      await negotiationsApi.reject(id, reason);
      await dispatch(fetchSellerNegotiations());
      return { id, reason };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to reject offer');
    }
  },
);

/** Cancel the seller's active subscription plan. */
export const cancelSellerSubscription = createAsyncThunk(
  'seller/cancelSubscription',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await billingApi.cancelSubscription();
      await Promise.all([
        dispatch(fetchSellerBilling()),
        dispatch(fetchSellerListings()),
        dispatch(fetchSellerPurchases()),
      ]);
      return res.message;
    } catch (err) {
      return rejectWithValue(err.message || 'Could not cancel the plan');
    }
  },
);

/** Re-fetch a specific seller resource by key: 'listings' | 'negotiations' | 'purchases' | 'billing'. */
export const reloadSellerResource = createAsyncThunk(
  'seller/reloadResource',
  async (name, { dispatch }) => {
    switch (name) {
      case 'listings':
        return dispatch(fetchSellerListings()).unwrap();
      case 'negotiations':
        return dispatch(fetchSellerNegotiations()).unwrap();
      case 'purchases':
        return dispatch(fetchSellerPurchases()).unwrap();
      case 'billing':
        return dispatch(fetchSellerBilling()).unwrap();
      default:
        return null;
    }
  },
);

/** Re-fetch all seller resources in parallel. */
export const reloadAllSellerData = createAsyncThunk(
  'seller/reloadAll',
  async (_, { dispatch }) => {
    await Promise.all([
      dispatch(fetchSellerListings()),
      dispatch(fetchSellerNegotiations()),
      dispatch(fetchSellerPurchases()),
      dispatch(fetchSellerBilling()),
    ]);
  },
);

// ── Slice ────────────────────────────────────────────────────────────────────

const sellerSlice = createSlice({
  name: 'seller',
  initialState: {
    listings: [],
    negotiations: [],
    purchases: [],
    catalog: null,
    billing: null,
    loading: {
      listings: true,
      negotiations: true,
      purchases: true,
      billing: true,
    },
    errors: {
      listings: null,
      negotiations: null,
      purchases: null,
      billing: null,
    },
    selectedListing: null,
    listingsFilter: 'all',
    negotiationsFilter: 'all',
    paymentsFilter: 'all',
    billingCycle: 'monthly',
    counteringNegotiation: null,
    quotaMessage: '',
  },
  reducers: {
    setListings(state, action) {
      state.listings = action.payload;
    },
    setNegotiations(state, action) {
      state.negotiations = action.payload;
    },
    setPurchases(state, action) {
      state.purchases = action.payload;
    },
    setCatalog(state, action) {
      state.catalog = action.payload;
    },
    setBilling(state, action) {
      state.billing = action.payload;
    },
    removeListing(state, action) {
      state.listings = state.listings.filter((p) => p.id !== action.payload);
    },
    setSelectedListing(state, action) {
      state.selectedListing = action.payload;
    },
    clearSelectedListing(state) {
      state.selectedListing = null;
    },
    setListingsFilter(state, action) {
      state.listingsFilter = action.payload;
    },
    setNegotiationsFilter(state, action) {
      state.negotiationsFilter = action.payload;
    },
    setPaymentsFilter(state, action) {
      state.paymentsFilter = action.payload;
    },
    setBillingCycle(state, action) {
      state.billingCycle = action.payload;
    },
    setCounteringNegotiation(state, action) {
      state.counteringNegotiation = action.payload;
    },
    openCounterModal(state, action) {
      state.counteringNegotiation = action.payload;
    },
    closeCounterModal(state) {
      state.counteringNegotiation = null;
    },
    setQuotaMessage(state, action) {
      state.quotaMessage = action.payload;
    },
    clearQuotaMessage(state) {
      state.quotaMessage = '';
    },
    resetSellerState(state) {
      state.listings = [];
      state.negotiations = [];
      state.purchases = [];
      state.catalog = null;
      state.billing = null;
      state.loading = {
        listings: true,
        negotiations: true,
        purchases: true,
        billing: true,
      };
      state.errors = {
        listings: null,
        negotiations: null,
        purchases: null,
        billing: null,
      };
      state.selectedListing = null;
      state.listingsFilter = 'all';
      state.negotiationsFilter = 'all';
      state.paymentsFilter = 'all';
      state.billingCycle = 'monthly';
      state.counteringNegotiation = null;
      state.quotaMessage = '';
    },
  },
  extraReducers: (builder) => {
    // ── fetchSellerListings ──────────────────────────────────────────────────
    builder
      .addCase(fetchSellerListings.pending, (state) => {
        state.loading.listings = true;
        state.errors.listings = null;
      })
      .addCase(fetchSellerListings.fulfilled, (state, action) => {
        state.loading.listings = false;
        state.listings = action.payload;
        state.errors.listings = null;
      })
      .addCase(fetchSellerListings.rejected, (state, action) => {
        state.loading.listings = false;
        state.errors.listings = action.payload;
      });

    // ── fetchSellerNegotiations ──────────────────────────────────────────────
    builder
      .addCase(fetchSellerNegotiations.pending, (state) => {
        state.loading.negotiations = true;
        state.errors.negotiations = null;
      })
      .addCase(fetchSellerNegotiations.fulfilled, (state, action) => {
        state.loading.negotiations = false;
        state.negotiations = action.payload;
        state.errors.negotiations = null;
      })
      .addCase(fetchSellerNegotiations.rejected, (state, action) => {
        state.loading.negotiations = false;
        state.errors.negotiations = action.payload;
      });

    // ── fetchSellerPurchases ─────────────────────────────────────────────────
    builder
      .addCase(fetchSellerPurchases.pending, (state) => {
        state.loading.purchases = true;
        state.errors.purchases = null;
      })
      .addCase(fetchSellerPurchases.fulfilled, (state, action) => {
        state.loading.purchases = false;
        state.purchases = action.payload;
        state.errors.purchases = null;
      })
      .addCase(fetchSellerPurchases.rejected, (state, action) => {
        state.loading.purchases = false;
        state.errors.purchases = action.payload;
      });

    // ── fetchSellerBilling ───────────────────────────────────────────────────
    builder
      .addCase(fetchSellerBilling.pending, (state) => {
        state.loading.billing = true;
        state.errors.billing = null;
      })
      .addCase(fetchSellerBilling.fulfilled, (state, action) => {
        state.loading.billing = false;
        state.catalog = action.payload.catalog;
        state.billing = action.payload.billing;
        state.errors.billing = null;
      })
      .addCase(fetchSellerBilling.rejected, (state, action) => {
        state.loading.billing = false;
        state.errors.billing = action.payload;
      });
  },
});

export const {
  setListings,
  setNegotiations,
  setPurchases,
  setCatalog,
  setBilling,
  removeListing,
  setSelectedListing,
  clearSelectedListing,
  setListingsFilter,
  setNegotiationsFilter,
  setPaymentsFilter,
  setBillingCycle,
  setCounteringNegotiation,
  openCounterModal,
  closeCounterModal,
  setQuotaMessage,
  clearQuotaMessage,
  resetSellerState,
} = sellerSlice.actions;

// ── Selectors ────────────────────────────────────────────────────────────────
export const selectSeller = (state) => state.seller;
export const selectSellerListings = (state) => state.seller?.listings || [];
export const selectSellerNegotiations = (state) => state.seller?.negotiations || [];
export const selectSellerPurchases = (state) => state.seller?.purchases || [];
export const selectSellerCatalog = (state) => state.seller?.catalog || null;
export const selectSellerBilling = (state) => state.seller?.billing || null;
export const selectSellerLoading = (state) =>
  state.seller?.loading || { listings: false, negotiations: false, purchases: false, billing: false };
export const selectSellerErrors = (state) => state.seller?.errors || {};
export const selectSelectedListing = (state) => state.seller?.selectedListing || null;

export const selectSellerListingsFilter = (state) => state.seller?.listingsFilter || 'all';
export const selectSellerNegotiationsFilter = (state) => state.seller?.negotiationsFilter || 'all';
export const selectSellerPaymentsFilter = (state) => state.seller?.paymentsFilter || 'all';
export const selectSellerBillingCycle = (state) => state.seller?.billingCycle || 'monthly';
export const selectCounteringNegotiation = (state) => state.seller?.counteringNegotiation || null;
export const selectSellerQuotaMessage = (state) => state.seller?.quotaMessage || '';

/** Derived selector: computes overview statistics for the seller dashboard. */
export const selectSellerStats = (state) => {
  const listings = state.seller?.listings || [];
  const purchases = state.seller?.purchases || [];
  const sold = completedDeals(purchases, 'sale');
  const rented = completedDeals(purchases, 'rent');
  const closedIds = new Set([...sold, ...rented].map((d) => String(d.propertyId)));
  const active = listings.filter((p) => p.verificationStatus === 'verified' && !closedIds.has(String(p.id)));
  const pending = listings.filter((p) => p.verificationStatus === 'pending');
  const revenue = sold.reduce((sum, d) => sum + (d.agreedPrice || 0), 0);
  return {
    totalListings: listings.length,
    activeListings: active.length,
    pendingReview: pending.length,
    totalRevenue: revenue,
  };
};

export default sellerSlice.reducer;
