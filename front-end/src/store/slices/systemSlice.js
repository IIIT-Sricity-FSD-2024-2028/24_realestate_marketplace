import { createSlice } from '@reduxjs/toolkit';
import { fetchHealth, fetchLogChannels, fetchLogEntries } from '../actions/apiActions.js';
const initialState = {
  health: null,
  channels: [],
  logResult: { file: '', entries: [] },
  loading: { health: false, channels: false, entries: false },
  error: null,
};
const errorMessage = (payload) => payload?.message || payload || 'Request failed';
const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    systemCleared() {
      return initialState;
    },
    clearLogEntries(s) {
      s.logResult = { file: '', entries: [] };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHealth.pending, (s) => {
        s.loading.health = true;
      })
      .addCase(fetchHealth.fulfilled, (s, { payload }) => {
        s.health = payload;
        s.loading.health = false;
      })
      .addCase(fetchHealth.rejected, (s, { payload }) => {
        s.loading.health = false;
        s.error = errorMessage(payload);
      });
    builder
      .addCase(fetchLogChannels.pending, (s) => {
        s.loading.channels = true;
      })
      .addCase(fetchLogChannels.fulfilled, (s, { payload }) => {
        s.channels = payload || [];
        s.loading.channels = false;
      })
      .addCase(fetchLogChannels.rejected, (s, { payload }) => {
        s.loading.channels = false;
        s.error = errorMessage(payload);
      });
    builder
      .addCase(fetchLogEntries.pending, (s) => {
        s.loading.entries = true;
      })
      .addCase(fetchLogEntries.fulfilled, (s, { payload }) => {
        s.logResult = payload || { file: '', entries: [] };
        s.loading.entries = false;
      })
      .addCase(fetchLogEntries.rejected, (s, { payload }) => {
        s.loading.entries = false;
        s.error = errorMessage(payload);
      });
  },
});
export const { systemCleared, clearLogEntries } = systemSlice.actions;
export default systemSlice.reducer;
