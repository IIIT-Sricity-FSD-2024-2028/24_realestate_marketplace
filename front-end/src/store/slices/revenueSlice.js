/**
 * revenueSlice.js
 * Purpose: Redux slice for the platform revenue report (superuser only).
 * State:
 *   report  – the full revenue object from GET /billing/revenue, or null
 *   status  – 'idle' | 'loading' | 'succeeded' | 'failed'
 *   error   – error message string or null
 * Thunks:
 *   fetchRevenue  – GET /billing/revenue
 * API calls: GET /billing/revenue
 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { billingApi } from '../../api/services.js';

// ── Async thunks ───────────────────────────────────────────────────────────

/** Load the platform revenue report. */
export const fetchRevenue = createAsyncThunk(
  'revenue/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await billingApi.revenue();
      return res.data; // the report object
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load the revenue report');
    }
  },
);

// ── Slice ──────────────────────────────────────────────────────────────────

const revenueSlice = createSlice({
  name: 'revenue',
  initialState: {
    report: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    /** Force a fresh fetch next time the section mounts. */
    resetRevenue(state) {
      state.report = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRevenue.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRevenue.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.report = action.payload;
      })
      .addCase(fetchRevenue.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetRevenue } = revenueSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────
export const selectRevenueReport = (state) => state.revenue.report;
export const selectRevenueStatus = (state) => state.revenue.status;
export const selectRevenueError = (state) => state.revenue.error;

export default revenueSlice.reducer;
