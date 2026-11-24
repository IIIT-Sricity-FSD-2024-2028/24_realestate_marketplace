/**
 * Async boundaries for the application.  Components never call an API service
 * directly: they dispatch one of these thunks and render the matching slice.
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  authApi,
  billingApi,
  fetchHealth as fetchHealthCheck,
  logsApi,
  negotiationsApi,
  propertiesApi,
  purchasesApi,
  usersApi,
  visitsApi,
} from '../../api/services.js';

const data = (response) => response.data;
const withError = async (work, { rejectWithValue }) => {
  try {
    return await work();
  } catch (error) {
    return rejectWithValue({
      message: error?.message || 'Request failed',
      status: error?.status,
      errors: error?.errors,
    });
  }
};

// Authentication
export const login = createAsyncThunk('auth/login', (payload, api) => withError(async () => data(await authApi.login(payload)), api));
export const register = createAsyncThunk('auth/register', (payload, api) => withError(async () => data(await authApi.register(payload)), api));
export const loadCurrentUser = createAsyncThunk('profile/loadCurrentUser', (_, api) => withError(async () => data(await authApi.me()), api));
export const changePassword = createAsyncThunk('profile/changePassword', (payload, api) =>
  withError(async () => data(await authApi.changePassword(payload)), api),
);
export const forgotPassword = createAsyncThunk('auth/forgotPassword', (payload, api) =>
  withError(async () => data(await authApi.forgotPassword(payload)), api),
);

// Properties
export const fetchProperties = createAsyncThunk('properties/fetch', (params, api) => withError(async () => data(await propertiesApi.list(params)), api));
export const fetchAllProperties = createAsyncThunk('properties/fetchAll', (_, api) =>
  withError(async () => {
    const items = [];
    for (let page = 1; page <= 20; page += 1) {
      const result = data(await propertiesApi.list({ limit: 50, page }));
      items.push(...(result.items || []));
      if (page >= (result.totalPages || 1) || !(result.items || []).length) return { ...result, items };
    }
    return { items, page: 1, total: items.length, totalPages: 1 };
  }, api),
);
export const fetchMyProperties = createAsyncThunk('properties/fetchMine', (_, api) => withError(async () => data(await propertiesApi.mine()), api));
export const fetchReviewProperties = createAsyncThunk('properties/fetchReview', (limit = 100, api) =>
  withError(async () => data(await propertiesApi.reviewQueue(limit)), api),
);
export const createProperty = createAsyncThunk('properties/create', (payload, api) => withError(async () => data(await propertiesApi.create(payload)), api));
export const updateProperty = createAsyncThunk('properties/update', ({ id, payload }, api) =>
  withError(async () => data(await propertiesApi.update(id, payload)), api),
);
export const deleteProperty = createAsyncThunk('properties/delete', (id, api) =>
  withError(async () => {
    await propertiesApi.remove(id);
    return id;
  }, api),
);
export const verifyProperty = createAsyncThunk('properties/verify', (id, api) => withError(async () => data(await propertiesApi.verify(id)), api));
export const rejectProperty = createAsyncThunk('properties/reject', ({ id, reason }, api) =>
  withError(async () => data(await propertiesApi.reject(id, reason)), api),
);
export const uploadPropertyImages = createAsyncThunk('properties/uploadImages', ({ id, files }, api) =>
  withError(async () => data(await propertiesApi.uploadImages(id, files)), api),
);
export const uploadPropertyDocuments = createAsyncThunk('properties/uploadDocuments', ({ id, files }, api) =>
  withError(async () => data(await propertiesApi.uploadDocuments(id, files)), api),
);

// Public landing-page queries are kept separate from staff catalogue state.
export const fetchListingStats = createAsyncThunk('listings/fetchStats', (_, api) =>
  withError(async () => {
    const [all, sale, rent] = await Promise.all([
      propertiesApi.list({ limit: 1 }),
      propertiesApi.list({ limit: 1, listingType: 'sale' }),
      propertiesApi.list({ limit: 1, listingType: 'rent' }),
    ]);
    return { all: data(all).total, sale: data(sale).total, rent: data(rent).total };
  }, api),
);
export const fetchFeaturedListings = createAsyncThunk('listings/fetchFeatured', (params, api) =>
  withError(async () => data(await propertiesApi.list(params)), api),
);
export const fetchLiveListings = createAsyncThunk('listings/fetchLive', (params, api) => withError(async () => data(await propertiesApi.list(params)), api));

// Users
export const fetchUsers = createAsyncThunk('users/fetch', (_, api) => withError(async () => data(await usersApi.list()), api));
export const createUser = createAsyncThunk('users/create', (payload, api) => withError(async () => data(await usersApi.create(payload)), api));
export const updateUser = createAsyncThunk('users/update', ({ id, payload }, api) => withError(async () => data(await usersApi.update(id, payload)), api));
export const deleteUser = createAsyncThunk('users/delete', (id, api) =>
  withError(async () => {
    await usersApi.remove(id);
    return id;
  }, api),
);

// Negotiations
export const fetchMyNegotiations = createAsyncThunk('negotiations/fetchMine', (_, api) => withError(async () => data(await negotiationsApi.mine()), api));
export const fetchReviewNegotiations = createAsyncThunk('negotiations/fetchReview', (limit = 100, api) =>
  withError(async () => data(await negotiationsApi.reviewQueue(limit)), api),
);
export const fetchSellerNegotiations = createAsyncThunk('negotiations/fetchSeller', (limit = 100, api) =>
  withError(async () => data(await negotiationsApi.sellerQueue(limit)), api),
);
export const createNegotiation = createAsyncThunk('negotiations/create', (payload, api) =>
  withError(async () => data(await negotiationsApi.create(payload)), api),
);
export const counterNegotiation = createAsyncThunk('negotiations/counter', ({ id, amount }, api) =>
  withError(async () => data(await negotiationsApi.counter(id, amount)), api),
);
export const acceptNegotiation = createAsyncThunk('negotiations/accept', (id, api) => withError(async () => data(await negotiationsApi.accept(id)), api));
export const rejectNegotiation = createAsyncThunk('negotiations/reject', ({ id, reason }, api) =>
  withError(async () => data(await negotiationsApi.reject(id, reason)), api),
);
export const acceptCounterNegotiation = createAsyncThunk('negotiations/acceptCounter', (id, api) =>
  withError(async () => data(await negotiationsApi.acceptCounter(id)), api),
);
export const withdrawNegotiation = createAsyncThunk('negotiations/withdraw', (id, api) => withError(async () => data(await negotiationsApi.withdraw(id)), api));

// Visits
export const fetchMyVisits = createAsyncThunk('visits/fetchMine', (_, api) => withError(async () => data(await visitsApi.mine()), api));
export const fetchReviewVisits = createAsyncThunk('visits/fetchReview', (limit = 100, api) =>
  withError(async () => data(await visitsApi.reviewQueue(limit)), api),
);
export const createVisit = createAsyncThunk('visits/create', (payload, api) => withError(async () => data(await visitsApi.create(payload)), api));
export const confirmVisit = createAsyncThunk('visits/confirm', (id, api) => withError(async () => data(await visitsApi.confirm(id)), api));
export const rescheduleVisit = createAsyncThunk('visits/reschedule', ({ id, date, slot }, api) =>
  withError(async () => data(await visitsApi.reschedule(id, date, slot)), api),
);
export const completeVisit = createAsyncThunk('visits/complete', (id, api) => withError(async () => data(await visitsApi.complete(id)), api));
export const cancelVisit = createAsyncThunk('visits/cancel', (id, api) => withError(async () => data(await visitsApi.cancel(id)), api));

// Purchases
export const fetchMyPurchases = createAsyncThunk('purchases/fetchMine', (_, api) => withError(async () => data(await purchasesApi.mine()), api));
export const fetchReviewPurchases = createAsyncThunk('purchases/fetchReview', (limit = 100, api) =>
  withError(async () => data(await purchasesApi.reviewQueue(limit)), api),
);
export const fetchSellerPurchases = createAsyncThunk('purchases/fetchSeller', (limit = 100, api) =>
  withError(async () => data(await purchasesApi.sellerQueue(limit)), api),
);
export const advancePurchase = createAsyncThunk('purchases/advance', (id, api) => withError(async () => data(await purchasesApi.advance(id)), api));
export const cancelPurchase = createAsyncThunk('purchases/cancel', (id, api) => withError(async () => data(await purchasesApi.cancel(id)), api));

// Billing and checkout
export const fetchBillingCatalog = createAsyncThunk('billing/fetchCatalog', (_, api) => withError(async () => data(await billingApi.catalog()), api));
export const fetchBillingSummary = createAsyncThunk('billing/fetchSummary', (_, api) => withError(async () => data(await billingApi.summary()), api));
export const fetchRevenue = createAsyncThunk('billing/fetchRevenue', (_, api) => withError(async () => data(await billingApi.revenue()), api));
export const openCheckout = createAsyncThunk('billing/openCheckout', (request, api) => withError(async () => data(await billingApi.checkout(request)), api));
export const demoCheckout = createAsyncThunk('billing/demoCheckout', (orderId, api) =>
  withError(async () => data(await billingApi.demoCheckout(orderId)), api),
);
export const verifyCheckout = createAsyncThunk('billing/verifyCheckout', (signature, api) =>
  withError(async () => data(await billingApi.verify(signature)), api),
);
export const cancelCheckout = createAsyncThunk('billing/cancelCheckout', ({ orderId, reason }, api) =>
  withError(async () => data(await billingApi.cancelled(orderId, reason)), api),
);
export const cancelSubscription = createAsyncThunk('billing/cancelSubscription', (_, api) =>
  withError(async () => data(await billingApi.cancelSubscription()), api),
);

// Superuser operations
export const fetchHealth = createAsyncThunk('system/fetchHealth', (_, api) => withError(fetchHealthCheck, api));
export const fetchLogChannels = createAsyncThunk('system/fetchLogChannels', (_, api) => withError(async () => data(await logsApi.channels()), api));
export const fetchLogEntries = createAsyncThunk('system/fetchLogEntries', (filters, api) =>
  withError(async () => data(await logsApi.entries(filters.channel, { lines: filters.lines, level: filters.level })), api),
);
