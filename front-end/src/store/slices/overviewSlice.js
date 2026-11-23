/**
 * overviewSlice.js
 * Purpose: Redux slice for the SuperuserOverview stat cards and health check.
 * State:
 *   stats   – { totalUsers, activeUsers, totalProperties } or null
 *   health  – health object from GET /health or null
 *   status  – 'idle' | 'loading' | 'succeeded' | 'failed'
 *   error   – error message or null
 * Thunks:
 *   fetchOverview  – parallel GET /users + GET /properties?limit=1 + GET /health
 * API calls: GET /users, GET /properties?limit=1, GET /health
 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchHealth, propertiesApi, usersApi } from '../../api/services.js';

// ── Async thunk ────────────────────────────────────────────────────────────

/**
 * Fetch the three data points needed for the overview dashboard in parallel.
 * Health is fetched separately and stored independently so a health check
 * failure does not wipe out the user/property counts.
 */
export const fetchOverview = createAsyncThunk(
  'overview/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const [usersRes, propsRes] = await Promise.all([
        usersApi.list(),
        propertiesApi.list({ limit: 1 }),
      ]);
      const users = usersRes.data;
      return {
        stats: {
          totalUsers: users.length,
          activeUsers: users.filter((u) => !u.isBlocked).length,
          totalProperties: propsRes.data.total,
        },
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load dashboard stats');
    }
  },
);

/** Fetch the backend health check separately so it doesn't block stats. */
export const fetchOverviewHealth = createAsyncThunk(
  'overview/fetchHealth',
  async () => {
    try {
      return await fetchHealth();
    } catch {
      return { status: 'unreachable' };
    }
  },
);

// ── Slice ──────────────────────────────────────────────────────────────────

const overviewSlice = createSlice({
  name: 'overview',
  initialState: {
    stats: null,
    health: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    resetOverview(state) {
      state.stats = null;
      state.health = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchOverview ────────────────────────────────────────────────────
    builder
      .addCase(fetchOverview.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOverview.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.stats = action.payload.stats;
      })
      .addCase(fetchOverview.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // ── fetchOverviewHealth ──────────────────────────────────────────────
    builder
      .addCase(fetchOverviewHealth.fulfilled, (state, action) => {
        state.health = action.payload;
      });
  },
});

export const { resetOverview } = overviewSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────
export const selectOverviewStats = (state) => state.overview.stats;
export const selectOverviewHealth = (state) => state.overview.health;
export const selectOverviewStatus = (state) => state.overview.status;
export const selectOverviewError = (state) => state.overview.error;

export default overviewSlice.reducer;
