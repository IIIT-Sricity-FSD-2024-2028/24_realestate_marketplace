import { createSlice } from '@reduxjs/toolkit';
import { login, register } from '../actions/apiActions.js';

const initialState = { user: null, status: 'idle', error: null };
const errorMessage = (payload) => payload?.message || payload || 'Authentication failed';

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionStarted(state, action) {
      state.user = action.payload;
      state.status = 'authenticated';
      state.error = null;
    },
    sessionCleared() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    for (const action of [login, register]) {
      builder.addCase(action.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      });
      builder.addCase(action.fulfilled, (state, { payload }) => {
        const account = payload.user;
        state.user = {
          id: account.id,
          name: account.name,
          email: account.email,
          role: account.role === 'user' ? account.userType : account.role,
          userType: account.userType,
          city: account.city || null,
          token: payload.accessToken,
        };
        state.status = 'authenticated';
      });
      builder.addCase(action.rejected, (state, { payload }) => {
        state.status = 'error';
        state.error = errorMessage(payload);
      });
    }
  },
});

export const { sessionStarted, sessionCleared } = authSlice.actions;
export default authSlice.reducer;
