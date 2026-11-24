import { createSlice } from '@reduxjs/toolkit';
import { advancePurchase, cancelPurchase, fetchMyPurchases, fetchReviewPurchases, fetchSellerPurchases } from '../actions/apiActions.js';
const initialState = { mine: [], review: [], seller: [], loading: { mine: false, review: false, seller: false }, error: null };
const errorMessage = (payload) => payload?.message || payload || 'Request failed';
const update = (state, entity) =>
  [state.mine, state.review, state.seller].forEach((list) => {
    const i = list.findIndex((item) => item.id === entity?.id);
    if (i >= 0) list[i] = entity;
  });
const updateAction = (state, { payload }) => update(state, payload);
const purchasesSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    purchaseCreated(s, { payload }) {
      if (payload?.id && !s.mine.some((item) => item.id === payload.id)) s.mine.unshift(payload);
    },
    purchaseUpdated: updateAction,
    purchaseRemoved(s, { payload: id }) {
      s.mine = s.mine.filter((item) => item.id !== id);
      s.review = s.review.filter((item) => item.id !== id);
      s.seller = s.seller.filter((item) => item.id !== id);
    },
    clearPurchases() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    [
      [fetchMyPurchases, 'mine'],
      [fetchReviewPurchases, 'review'],
      [fetchSellerPurchases, 'seller'],
    ].forEach(([action, key]) =>
      builder
        .addCase(action.pending, (s) => {
          s.loading[key] = true;
        })
        .addCase(action.fulfilled, (s, { payload }) => {
          s[key] = payload?.items || payload || [];
          s.loading[key] = false;
        })
        .addCase(action.rejected, (s, { payload }) => {
          s.loading[key] = false;
          s.error = errorMessage(payload);
        }),
    );
    [advancePurchase, cancelPurchase].forEach((action) => builder.addCase(action.fulfilled, updateAction));
  },
});
export const { purchaseCreated, purchaseUpdated, purchaseRemoved, clearPurchases } = purchasesSlice.actions;
export default purchasesSlice.reducer;
