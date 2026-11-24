import { createSlice } from '@reduxjs/toolkit';
import {
  acceptCounterNegotiation,
  acceptNegotiation,
  counterNegotiation,
  createNegotiation,
  fetchMyNegotiations,
  fetchReviewNegotiations,
  fetchSellerNegotiations,
  rejectNegotiation,
  withdrawNegotiation,
} from '../actions/apiActions.js';

const initialState = { mine: [], review: [], seller: [], loading: { mine: false, review: false, seller: false }, error: null };
const errorMessage = (payload) => payload?.message || payload || 'Request failed';
const upsert = (lists, entity) =>
  lists.forEach((list) => {
    const index = list.findIndex((item) => item.id === entity?.id);
    if (index >= 0) list[index] = entity;
  });
const upsertAction = (state, { payload }) => {
  if (!payload?.id) return;
  upsert([state.mine, state.review, state.seller], payload);
};
const negotiationsSlice = createSlice({
  name: 'negotiations',
  initialState,
  reducers: {
    negotiationCreated(s, { payload }) {
      if (payload?.id && !s.mine.some((item) => item.id === payload.id)) s.mine.unshift(payload);
    },
    negotiationUpdated: upsertAction,
    negotiationRemoved(s, { payload: id }) {
      s.mine = s.mine.filter((item) => item.id !== id);
      s.review = s.review.filter((item) => item.id !== id);
      s.seller = s.seller.filter((item) => item.id !== id);
    },
    clearNegotiations() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    const loads = [
      [fetchMyNegotiations, 'mine'],
      [fetchReviewNegotiations, 'review'],
      [fetchSellerNegotiations, 'seller'],
    ];
    loads.forEach(([action, key]) =>
      builder
        .addCase(action.pending, (s) => {
          s.loading[key] = true;
          s.error = null;
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
    builder.addCase(createNegotiation.fulfilled, (s, { payload }) => negotiationsSlice.caseReducers.negotiationCreated(s, { payload }));
    [counterNegotiation, acceptNegotiation, rejectNegotiation, acceptCounterNegotiation, withdrawNegotiation].forEach((action) =>
      builder.addCase(action.fulfilled, upsertAction),
    );
  },
});
export const { negotiationCreated, negotiationUpdated, negotiationRemoved, clearNegotiations } = negotiationsSlice.actions;
export default negotiationsSlice.reducer;
