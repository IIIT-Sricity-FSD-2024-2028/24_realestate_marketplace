import { createSlice } from '@reduxjs/toolkit';
import {
  cancelCheckout,
  cancelSubscription,
  demoCheckout,
  fetchBillingCatalog,
  fetchBillingSummary,
  fetchRevenue,
  openCheckout,
  verifyCheckout,
} from '../actions/apiActions.js';

const initialState = {
  catalog: null,
  summary: null,
  revenue: null,
  checkout: { order: null, demoOrder: null, processing: false },
  loading: { catalog: false, summary: false, revenue: false },
  error: null,
};
const errorMessage = (payload) => payload?.message || payload || 'Request failed';
const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    checkoutOpened(s, { payload }) {
      s.checkout.order = payload;
    },
    demoCheckoutOpened(s, { payload }) {
      s.checkout.demoOrder = payload;
      s.checkout.processing = false;
    },
    demoCheckoutClosed(s) {
      s.checkout.demoOrder = null;
      s.checkout.processing = false;
    },
    demoCheckoutProcessing(s, { payload }) {
      s.checkout.processing = payload;
    },
    billingCleared() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    [
      [fetchBillingCatalog, 'catalog'],
      [fetchBillingSummary, 'summary'],
      [fetchRevenue, 'revenue'],
    ].forEach(([action, key]) =>
      builder
        .addCase(action.pending, (s) => {
          s.loading[key] = true;
          s.error = null;
        })
        .addCase(action.fulfilled, (s, { payload }) => {
          s[key] = payload;
          s.loading[key] = false;
        })
        .addCase(action.rejected, (s, { payload }) => {
          s.loading[key] = false;
          s.error = errorMessage(payload);
        }),
    );
    builder.addCase(openCheckout.fulfilled, (s, { payload }) => {
      s.checkout.order = payload;
    });
    builder
      .addCase(demoCheckout.pending, (s) => {
        s.checkout.processing = true;
      })
      .addCase(demoCheckout.fulfilled, (s) => {
        s.checkout.processing = false;
      })
      .addCase(demoCheckout.rejected, (s, { payload }) => {
        s.checkout.processing = false;
        s.error = errorMessage(payload);
      });
    builder
      .addCase(verifyCheckout.fulfilled, (s) => {
        s.checkout.order = null;
        s.checkout.demoOrder = null;
        s.checkout.processing = false;
      })
      .addCase(cancelCheckout.fulfilled, (s) => {
        s.checkout.order = null;
        s.checkout.demoOrder = null;
        s.checkout.processing = false;
      });
    builder.addCase(cancelSubscription.fulfilled, (s, { payload }) => {
      if (s.summary) s.summary = { ...s.summary, ...(payload || {}) };
    });
  },
});
export const { checkoutOpened, demoCheckoutOpened, demoCheckoutClosed, demoCheckoutProcessing, billingCleared } = billingSlice.actions;
export default billingSlice.reducer;
