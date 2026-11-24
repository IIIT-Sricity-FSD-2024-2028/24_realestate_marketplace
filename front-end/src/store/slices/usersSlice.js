import { createSlice } from '@reduxjs/toolkit';
import { createUser, deleteUser, fetchUsers, updateUser } from '../actions/apiActions.js';
const initialState = { items: [], loading: false, error: null };
const errorMessage = (payload) => payload?.message || payload || 'Request failed';
const upsert = (state, entity) => {
  if (!entity?.id) return;
  const i = state.items.findIndex((item) => item.id === entity.id);
  if (i < 0) state.items.unshift(entity);
  else state.items[i] = entity;
};
const upsertAction = (state, { payload }) => upsert(state, payload);
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    userCreated: upsertAction,
    userUpdated: upsertAction,
    userRemoved(s, { payload }) {
      s.items = s.items.filter((item) => item.id !== payload);
    },
    clearUsers() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchUsers.fulfilled, (s, { payload }) => {
        s.items = payload || [];
        s.loading = false;
      })
      .addCase(fetchUsers.rejected, (s, { payload }) => {
        s.loading = false;
        s.error = errorMessage(payload);
      });
    builder
      .addCase(createUser.fulfilled, upsertAction)
      .addCase(updateUser.fulfilled, upsertAction)
      .addCase(deleteUser.fulfilled, (s, { payload }) => usersSlice.caseReducers.userRemoved(s, { payload }));
  },
});
export const { userCreated, userUpdated, userRemoved, clearUsers } = usersSlice.actions;
export default usersSlice.reducer;
