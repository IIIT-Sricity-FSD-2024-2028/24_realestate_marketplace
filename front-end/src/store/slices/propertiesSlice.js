/**
 * propertiesSlice.js
 * Purpose: Redux slice for the global property catalogue (superuser only).
 * State:
 *   items        – array of property objects from GET /properties
 *   status       – 'idle' | 'loading' | 'succeeded' | 'failed'
 *   error        – error message string or null
 *   activeStatus – the server-side filter ('all' | 'pending' | 'active' | …)
 * Thunks:
 *   fetchProperties({ status })  – GET  /properties?limit=50[&status=…]
 *   updateProperty({ id, payload }) – PATCH /properties/:id
 *   deleteProperty(id)           – DELETE /properties/:id
 * API calls: /properties
 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { propertiesApi } from '../../api/services.js';

// ── Async thunks ───────────────────────────────────────────────────────────

/** Fetch the property catalogue with an optional status filter. */
export const fetchProperties = createAsyncThunk(
  'suProperties/fetchAll',
  async ({ status = 'all' } = {}, { rejectWithValue }) => {
    try {
      const params = { limit: 50 };
      if (status !== 'all') params.status = status;
      const res = await propertiesApi.list(params);
      return res.data.items; // array of property objects
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load properties');
    }
  },
);

/** Update a property (PATCH /properties/:id). */
export const updateProperty = createAsyncThunk(
  'suProperties/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await propertiesApi.update(id, payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update property');
    }
  },
);

/** Delete a property (DELETE /properties/:id). */
export const deleteProperty = createAsyncThunk(
  'suProperties/delete',
  async (id, { rejectWithValue }) => {
    try {
      await propertiesApi.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete property');
    }
  },
);

// ── Slice ──────────────────────────────────────────────────────────────────

const propertiesSlice = createSlice({
  name: 'suProperties',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    activeStatus: 'all', // persisted so filter survives tab-switch
    searchQuery: '',     // persisted search box value
  },
  reducers: {
    /** Update the server-side status filter (triggers a re-fetch in the component). */
    setActiveStatus(state, action) {
      state.activeStatus = action.payload;
      // Reset items so the loading state is visible immediately.
      state.status = 'idle';
    },
    /** Update the client-side text search query (persists across tab-switches). */
    setPropertySearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
    resetProperties(state) {
      state.items = [];
      state.status = 'idle';
      state.error = null;
      state.activeStatus = 'all';
      state.searchQuery = '';
    },
  },
  extraReducers: (builder) => {
    // ── fetchProperties ─────────────────────────────────────────────────
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // ── updateProperty ──────────────────────────────────────────────────
    builder
      .addCase(updateProperty.fulfilled, (state, action) => {
        if (action.payload && action.payload.id) {
          const idx = state.items.findIndex((p) => p.id === action.payload.id);
          if (idx !== -1) state.items[idx] = action.payload;
        }
      });

    // ── deleteProperty ──────────────────────────────────────────────────
    builder
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      });
  },
});

export const { setActiveStatus, setPropertySearchQuery, resetProperties } = propertiesSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────
export const selectSuProperties = (state) => state.suProperties.items;
export const selectSuPropertiesStatus = (state) => state.suProperties.status;
export const selectSuPropertiesError = (state) => state.suProperties.error;
export const selectSuPropertiesActiveStatus = (state) => state.suProperties.activeStatus;
export const selectSuPropertiesSearchQuery = (state) => state.suProperties.searchQuery;

export default propertiesSlice.reducer;
