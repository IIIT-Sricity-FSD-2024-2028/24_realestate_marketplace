import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import sellerReducer, {
  setListings,
  setNegotiations,
  setPurchases,
  setCatalog,
  setBilling,
  removeListing,
  setSelectedListing,
  clearSelectedListing,
  resetSellerState,
  fetchSellerListings,
  fetchSellerNegotiations,
  fetchSellerPurchases,
  fetchSellerBilling,
  deleteSellerListing,
  reloadSellerResource,
  reloadAllSellerData,
  completedDeals,
  selectSellerListings,
  selectSellerNegotiations,
  selectSellerPurchases,
  selectSellerCatalog,
  selectSellerBilling,
  selectSellerLoading,
  selectSellerErrors,
  selectSelectedListing,
  selectSellerStats,
} from '../store/slices/sellerSlice.js';
import * as sellerActions from '../store/actions/sellerActions.js';
import { propertiesApi, negotiationsApi, purchasesApi, billingApi } from '../api/services.js';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useSellerData } from '../pages/seller/useSellerData.js';

// Mock API services
vi.mock('../api/services.js', () => ({
  propertiesApi: {
    mine: vi.fn(),
    remove: vi.fn(),
  },
  negotiationsApi: {
    sellerQueue: vi.fn(),
  },
  purchasesApi: {
    sellerQueue: vi.fn(),
  },
  billingApi: {
    catalog: vi.fn(),
    summary: vi.fn(),
  },
}));

function createTestStore(preloadedState) {
  return configureStore({
    reducer: {
      seller: sellerReducer,
    },
    preloadedState,
  });
}

describe('sellerSlice reducers and actions', () => {
  it('should initialize with correct default state', () => {
    const state = sellerReducer(undefined, { type: '@@INIT' });
    expect(state).toEqual({
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
    });
  });

  it('handles synchronous setters properly', () => {
    let state = sellerReducer(undefined, setListings([{ id: 'prop-1', title: 'Luxury Villa' }]));
    expect(state.listings).toHaveLength(1);
    expect(state.listings[0].title).toBe('Luxury Villa');

    state = sellerReducer(state, setNegotiations([{ id: 'neg-1', offerAmount: 5000000 }]));
    expect(state.negotiations).toHaveLength(1);

    state = sellerReducer(state, setPurchases([{ id: 'pur-1', agreedPrice: 5000000 }]));
    expect(state.purchases).toHaveLength(1);

    state = sellerReducer(state, setCatalog({ plans: [{ id: 'starter' }] }));
    expect(state.catalog.plans).toHaveLength(1);

    state = sellerReducer(state, setBilling({ plan: { tier: 'silver' } }));
    expect(state.billing.plan.tier).toBe('silver');

    state = sellerReducer(state, setSelectedListing({ id: 'prop-1' }));
    expect(state.selectedListing.id).toBe('prop-1');

    state = sellerReducer(state, clearSelectedListing());
    expect(state.selectedListing).toBeNull();

    state = sellerReducer(state, removeListing('prop-1'));
    expect(state.listings).toHaveLength(0);

    state = sellerReducer(state, resetSellerState());
    expect(state.negotiations).toHaveLength(0);
    expect(state.purchases).toHaveLength(0);
  });

  it('selectors read values accurately from root state', () => {
    const rootState = {
      seller: {
        listings: [{ id: 'l1' }],
        negotiations: [{ id: 'n1' }],
        purchases: [{ id: 'p1' }],
        catalog: { mockCat: true },
        billing: { mockBill: true },
        loading: { listings: false, negotiations: false, purchases: false, billing: false },
        errors: { listings: 'err1', negotiations: null, purchases: null, billing: null },
        selectedListing: { id: 'l1' },
      },
    };

    expect(selectSellerListings(rootState)).toEqual([{ id: 'l1' }]);
    expect(selectSellerNegotiations(rootState)).toEqual([{ id: 'n1' }]);
    expect(selectSellerPurchases(rootState)).toEqual([{ id: 'p1' }]);
    expect(selectSellerCatalog(rootState)).toEqual({ mockCat: true });
    expect(selectSellerBilling(rootState)).toEqual({ mockBill: true });
    expect(selectSellerLoading(rootState).listings).toBe(false);
    expect(selectSellerErrors(rootState).listings).toBe('err1');
    expect(selectSelectedListing(rootState)).toEqual({ id: 'l1' });
  });
});

describe('completedDeals and selectSellerStats', () => {
  it('correctly filters completed deals by listing type', () => {
    const deals = [
      { id: '1', dealStatus: 'completed', propertyListingType: 'sale', agreedPrice: 10000000 },
      { id: '2', dealStatus: 'completed', propertyListingType: 'rent', agreedPrice: 50000 },
      { id: '3', dealStatus: 'in_progress', propertyListingType: 'sale', agreedPrice: 8000000 },
    ];

    const sold = completedDeals(deals, 'sale');
    const rented = completedDeals(deals, 'rent');

    expect(sold).toHaveLength(1);
    expect(sold[0].id).toBe('1');
    expect(rented).toHaveLength(1);
    expect(rented[0].id).toBe('2');
  });

  it('selectSellerStats computes accurate summary statistics', () => {
    const mockState = {
      seller: {
        listings: [
          { id: 'p1', verificationStatus: 'verified' },
          { id: 'p2', verificationStatus: 'pending' },
          { id: 'p3', verificationStatus: 'verified' },
        ],
        purchases: [
          { id: 'd1', propertyId: 'p1', dealStatus: 'completed', propertyListingType: 'sale', agreedPrice: 7500000 },
          { id: 'd2', propertyId: 'p4', dealStatus: 'completed', propertyListingType: 'rent', agreedPrice: 30000 },
        ],
      },
    };

    const stats = selectSellerStats(mockState);
    expect(stats.totalListings).toBe(3);
    expect(stats.activeListings).toBe(1); // p1 is sold, so only p3 is active
    expect(stats.pendingReview).toBe(1); // p2
    expect(stats.totalRevenue).toBe(7500000);
  });
});

describe('sellerSlice async thunks and extraReducers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches listings successfully', async () => {
    const mockData = [{ id: 'p1', title: 'Beachside House' }];
    propertiesApi.mine.mockResolvedValueOnce({ data: mockData });

    const store = createTestStore();
    await store.dispatch(fetchSellerListings());

    const state = store.getState().seller;
    expect(state.loading.listings).toBe(false);
    expect(state.listings).toEqual(mockData);
    expect(state.errors.listings).toBeNull();
  });

  it('handles fetchListings failure', async () => {
    propertiesApi.mine.mockRejectedValueOnce(new Error('Network error'));

    const store = createTestStore();
    await store.dispatch(fetchSellerListings());

    const state = store.getState().seller;
    expect(state.loading.listings).toBe(false);
    expect(state.errors.listings).toBe('Network error');
  });

  it('fetches negotiations successfully', async () => {
    const mockOffers = [{ id: 'n1', offerAmount: 1200000 }];
    negotiationsApi.sellerQueue.mockResolvedValueOnce({ data: { items: mockOffers } });

    const store = createTestStore();
    await store.dispatch(fetchSellerNegotiations());

    const state = store.getState().seller;
    expect(state.loading.negotiations).toBe(false);
    expect(state.negotiations).toEqual(mockOffers);
  });

  it('fetches purchases successfully', async () => {
    const mockPurchases = [{ id: 'pur1', agreedPrice: 2000000 }];
    purchasesApi.sellerQueue.mockResolvedValueOnce({ data: { items: mockPurchases } });

    const store = createTestStore();
    await store.dispatch(fetchSellerPurchases());

    const state = store.getState().seller;
    expect(state.loading.purchases).toBe(false);
    expect(state.purchases).toEqual(mockPurchases);
  });

  it('fetches billing and catalog info', async () => {
    const mockCat = { cycles: [] };
    const mockBill = { plan: { tier: 'gold' } };
    billingApi.catalog.mockResolvedValueOnce({ data: mockCat });
    billingApi.summary.mockResolvedValueOnce({ data: mockBill });

    const store = createTestStore();
    await store.dispatch(fetchSellerBilling());

    const state = store.getState().seller;
    expect(state.loading.billing).toBe(false);
    expect(state.catalog).toEqual(mockCat);
    expect(state.billing).toEqual(mockBill);
  });

  it('deletes seller listing and updates store state', async () => {
    propertiesApi.remove.mockResolvedValueOnce({});
    billingApi.catalog.mockResolvedValueOnce({ data: {} });
    billingApi.summary.mockResolvedValueOnce({ data: { plan: {} } });

    const store = createTestStore({
      seller: {
        listings: [{ id: 'p1' }, { id: 'p2' }],
        negotiations: [],
        purchases: [],
        catalog: null,
        billing: null,
        loading: { listings: false, negotiations: false, purchases: false, billing: false },
        errors: { listings: null, negotiations: null, purchases: null, billing: null },
        selectedListing: null,
      },
    });

    await store.dispatch(deleteSellerListing('p1'));

    expect(propertiesApi.remove).toHaveBeenCalledWith('p1');
    const state = store.getState().seller;
    expect(state.listings).toHaveLength(1);
    expect(state.listings[0].id).toBe('p2');
  });

  it('reloadSellerResource and reloadAllSellerData dispatch correctly', async () => {
    propertiesApi.mine.mockResolvedValue({ data: [{ id: 'p1' }] });
    negotiationsApi.sellerQueue.mockResolvedValue({ data: { items: [] } });
    purchasesApi.sellerQueue.mockResolvedValue({ data: { items: [] } });
    billingApi.catalog.mockResolvedValue({ data: {} });
    billingApi.summary.mockResolvedValue({ data: {} });

    const store = createTestStore();
    await store.dispatch(reloadAllSellerData());

    let state = store.getState().seller;
    expect(state.listings).toHaveLength(1);
    expect(state.loading.listings).toBe(false);
    expect(state.loading.negotiations).toBe(false);
    expect(state.loading.purchases).toBe(false);
    expect(state.loading.billing).toBe(false);

    // Test reloadSellerResource for individual resources
    await store.dispatch(reloadSellerResource('listings'));
    await store.dispatch(reloadSellerResource('negotiations'));
    await store.dispatch(reloadSellerResource('purchases'));
    await store.dispatch(reloadSellerResource('billing'));
    const unk = await store.dispatch(reloadSellerResource('unknown'));
    expect(unk.payload).toBeNull();
  });
});

describe('sellerActions exports', () => {
  it('exports all expected actions and thunks', () => {
    expect(sellerActions.fetchSellerListings).toBeDefined();
    expect(sellerActions.fetchSellerNegotiations).toBeDefined();
    expect(sellerActions.fetchSellerPurchases).toBeDefined();
    expect(sellerActions.fetchSellerBilling).toBeDefined();
    expect(sellerActions.deleteSellerListing).toBeDefined();
    expect(sellerActions.reloadSellerResource).toBeDefined();
    expect(sellerActions.reloadAllSellerData).toBeDefined();
    expect(sellerActions.setListings).toBeDefined();
    expect(sellerActions.setNegotiations).toBeDefined();
    expect(sellerActions.setPurchases).toBeDefined();
    expect(sellerActions.setCatalog).toBeDefined();
    expect(sellerActions.setBilling).toBeDefined();
    expect(sellerActions.removeListing).toBeDefined();
    expect(sellerActions.setSelectedListing).toBeDefined();
    expect(sellerActions.clearSelectedListing).toBeDefined();
    expect(sellerActions.resetSellerState).toBeDefined();
  });
});

describe('useSellerData hook integration with Redux', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides Redux state and action dispatchers', async () => {
    propertiesApi.mine.mockResolvedValue({ data: [{ id: 'item1', title: 'Green Park' }] });
    negotiationsApi.sellerQueue.mockResolvedValue({ data: { items: [] } });
    purchasesApi.sellerQueue.mockResolvedValue({ data: { items: [] } });
    billingApi.catalog.mockResolvedValue({ data: {} });
    billingApi.summary.mockResolvedValue({ data: {} });

    const store = createTestStore({
      seller: {
        listings: [{ id: 'item1', title: 'Green Park' }],
        negotiations: [],
        purchases: [],
        catalog: { mock: true },
        billing: { mock: true },
        loading: { listings: false, negotiations: false, purchases: false, billing: false },
        errors: { listings: null, negotiations: null, purchases: null, billing: null },
        selectedListing: null,
      },
    });

    const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;

    let hookResult;
    await act(async () => {
      hookResult = renderHook(() => useSellerData(), { wrapper });
    });

    const { result } = hookResult;

    expect(result.current.listings).toEqual([{ id: 'item1', title: 'Green Park' }]);
    expect(result.current.catalog).toEqual({ mock: true });
    expect(typeof result.current.reload).toBe('function');
    expect(typeof result.current.reloadAll).toBe('function');
    expect(typeof result.current.deleteListing).toBe('function');

    act(() => {
      result.current.selectListing({ id: 'item1' });
    });

    expect(result.current.selectedListing).toEqual({ id: 'item1' });

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedListing).toBeNull();
  });
});
