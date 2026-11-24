import { createSlice } from '@reduxjs/toolkit';
import { fetchFeaturedListings, fetchListingStats, fetchLiveListings } from '../actions/apiActions.js';

const page = { items: [], page: 1, totalPages: 1, total: 0, loading: false, error: null };
const errorMessage = (payload) => payload?.message || payload || 'Request failed';
const initialState = { stats: null, statsError: null, featured: { ...page }, live: { ...page } };
const listingsSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    listingsCleared() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchListingStats.fulfilled, (s, { payload }) => {
        s.stats = payload;
        s.statsError = null;
      })
      .addCase(fetchListingStats.rejected, (s, { payload }) => {
        s.statsError = errorMessage(payload);
      });
    [
      [fetchFeaturedListings, 'featured'],
      [fetchLiveListings, 'live'],
    ].forEach(([action, key]) =>
      builder
        .addCase(action.pending, (s) => {
          s[key].loading = true;
          s[key].error = null;
        })
        .addCase(action.fulfilled, (s, { payload }) => {
          s[key] = { ...payload, loading: false, error: null };
        })
        .addCase(action.rejected, (s, { payload }) => {
          s[key] = { ...page, loading: false, error: errorMessage(payload) };
        }),
    );
  },
});
export const { listingsCleared } = listingsSlice.actions;
export default listingsSlice.reducer;
