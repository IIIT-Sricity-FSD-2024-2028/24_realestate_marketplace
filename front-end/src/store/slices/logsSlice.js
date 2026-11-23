/**
 * logsSlice.js
 * Purpose: Redux slice for the system logs viewer (superuser only).
 * State:
 *   channels        – array of channel summary objects from GET /logs
 *   channelsStatus  – 'idle' | 'loading' | 'succeeded' | 'failed'
 *   channelsError   – error message or null
 *   entries         – array of log entry objects from GET /logs/:channel
 *   entriesFile     – file name string reported by the backend
 *   entriesStatus   – 'idle' | 'loading' | 'succeeded' | 'failed'
 *   entriesError    – error message or null
 * Thunks:
 *   fetchLogChannels                  – GET /logs
 *   fetchLogEntries({ channel, lines, level }) – GET /logs/:channel?lines=…&level=…
 * API calls: GET /logs, GET /logs/:channel
 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { logsApi } from '../../api/services.js';

// ── Async thunks ───────────────────────────────────────────────────────────

/** Fetch the list of log channels (one per category). */
export const fetchLogChannels = createAsyncThunk(
  'logs/fetchChannels',
  async (_, { rejectWithValue }) => {
    try {
      const res = await logsApi.channels();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load log channels');
    }
  },
);

/** Fetch the actual log entries for a specific channel with optional filters. */
export const fetchLogEntries = createAsyncThunk(
  'logs/fetchEntries',
  async ({ channel, lines, level }, { rejectWithValue }) => {
    try {
      const res = await logsApi.entries(channel, { lines, level });
      return { file: res.data.file, entries: res.data.entries };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load log entries');
    }
  },
);

// ── Slice ──────────────────────────────────────────────────────────────────

const logsSlice = createSlice({
  name: 'logs',
  initialState: {
    channels: [],
    channelsStatus: 'idle',
    channelsError: null,
    entries: [],
    entriesFile: '',
    entriesStatus: 'idle',
    entriesError: null,
    // UI filter state — persisted so they survive navigating away and back.
    filters: { channel: 'http', level: '', lines: '100' },
    autoRefresh: false,
  },
  reducers: {
    resetLogs(state) {
      state.channels = [];
      state.channelsStatus = 'idle';
      state.channelsError = null;
      state.entries = [];
      state.entriesFile = '';
      state.entriesStatus = 'idle';
      state.entriesError = null;
      state.filters = { channel: 'http', level: '', lines: '100' };
      state.autoRefresh = false;
    },
    /** Update one or more log filter fields (channel, level, or lines). */
    setLogFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      // Reset entries so stale data is not shown while new ones load.
      state.entriesStatus = 'idle';
    },
    /** Toggle auto-refresh on/off. */
    setAutoRefresh(state, action) {
      state.autoRefresh = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ── fetchLogChannels ─────────────────────────────────────────────────
    builder
      .addCase(fetchLogChannels.pending, (state) => {
        state.channelsStatus = 'loading';
        state.channelsError = null;
      })
      .addCase(fetchLogChannels.fulfilled, (state, action) => {
        state.channelsStatus = 'succeeded';
        state.channels = action.payload;
      })
      .addCase(fetchLogChannels.rejected, (state, action) => {
        state.channelsStatus = 'failed';
        state.channelsError = action.payload;
      });

    // ── fetchLogEntries ──────────────────────────────────────────────────
    builder
      .addCase(fetchLogEntries.pending, (state) => {
        state.entriesStatus = 'loading';
        state.entriesError = null;
      })
      .addCase(fetchLogEntries.fulfilled, (state, action) => {
        state.entriesStatus = 'succeeded';
        state.entries = action.payload.entries;
        state.entriesFile = action.payload.file;
      })
      .addCase(fetchLogEntries.rejected, (state, action) => {
        state.entriesStatus = 'failed';
        state.entriesError = action.payload;
        state.entries = [];
        state.entriesFile = '';
      });
  },
});

export const { resetLogs, setLogFilters, setAutoRefresh } = logsSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────
export const selectLogChannels = (state) => state.logs.channels;
export const selectLogChannelsStatus = (state) => state.logs.channelsStatus;
export const selectLogChannelsError = (state) => state.logs.channelsError;
export const selectLogEntries = (state) => state.logs.entries;
export const selectLogEntriesFile = (state) => state.logs.entriesFile;
export const selectLogEntriesStatus = (state) => state.logs.entriesStatus;
export const selectLogEntriesError = (state) => state.logs.entriesError;
export const selectLogFilters = (state) => state.logs.filters;
export const selectAutoRefresh = (state) => state.logs.autoRefresh;

export default logsSlice.reducer;
