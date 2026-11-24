import { createSlice } from '@reduxjs/toolkit';
import { loadCurrentUser } from '../actions/apiActions.js';

const initialState = { account: null, profiles: {}, loading: false, error: null };
const errorMessage = (payload) => payload?.message || payload || 'Request failed';
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    profileSaved(state, { payload: { key, value } }) {
      state.profiles[key] = value;
    },
    profileCleared() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCurrentUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(loadCurrentUser.fulfilled, (s, { payload }) => {
        s.account = payload;
        s.loading = false;
      })
      .addCase(loadCurrentUser.rejected, (s, { payload }) => {
        s.loading = false;
        s.error = errorMessage(payload);
      });
  },
});
export const { profileSaved, profileCleared } = profileSlice.actions;
export default profileSlice.reducer;
