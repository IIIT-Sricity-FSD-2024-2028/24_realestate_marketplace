import { createSlice } from '@reduxjs/toolkit';
import { cancelVisit, completeVisit, confirmVisit, createVisit, fetchMyVisits, fetchReviewVisits, rescheduleVisit } from '../actions/apiActions.js';
const initialState = { mine: [], review: [], loading: { mine: false, review: false }, error: null };
const errorMessage = (payload) => payload?.message || payload || 'Request failed';
const replace = (state, entity) =>
  [state.mine, state.review].forEach((list) => {
    const i = list.findIndex((item) => item.id === entity?.id);
    if (i >= 0) list[i] = entity;
  });
const replaceAction = (state, { payload }) => replace(state, payload);
const visitsSlice = createSlice({
  name: 'visits',
  initialState,
  reducers: {
    visitCreated(s, { payload }) {
      if (payload?.id && !s.mine.some((item) => item.id === payload.id)) s.mine.unshift(payload);
    },
    visitUpdated: replaceAction,
    visitRemoved(s, { payload: id }) {
      s.mine = s.mine.filter((item) => item.id !== id);
      s.review = s.review.filter((item) => item.id !== id);
    },
    clearVisits() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    [
      [fetchMyVisits, 'mine'],
      [fetchReviewVisits, 'review'],
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
    builder.addCase(createVisit.fulfilled, (s, { payload }) => visitsSlice.caseReducers.visitCreated(s, { payload }));
    [confirmVisit, rescheduleVisit, completeVisit, cancelVisit].forEach((action) => builder.addCase(action.fulfilled, replaceAction));
  },
});
export const { visitCreated, visitUpdated, visitRemoved, clearVisits } = visitsSlice.actions;
export default visitsSlice.reducer;
