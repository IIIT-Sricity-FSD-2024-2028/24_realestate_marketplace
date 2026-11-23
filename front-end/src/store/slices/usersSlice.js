/**
 * usersSlice.js
 * Purpose: Redux slice for the platform user list (superuser user CRUD).
 * State:
 *   items   – array of user objects from GET /users
 *   status  – 'idle' | 'loading' | 'succeeded' | 'failed'
 *   error   – error message string or null
 * Thunks (async via Redux Thunk built into RTK):
 *   fetchUsers        – GET  /users
 *   createUser        – POST /users
 *   updateUser        – PATCH /users/:id  (also used for block/unblock)
 *   deleteUser        – DELETE /users/:id
 * API calls: /users (all methods)
 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { usersApi } from '../../api/services.js';

// ── Async thunks ───────────────────────────────────────────────────────────

/** Fetch all users (GET /users). */
export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await usersApi.list();
      return res.data; // array of user objects
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load users');
    }
  },
);

/** Create a new user (POST /users). */
export const createUser = createAsyncThunk(
  'users/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await usersApi.create(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create user');
    }
  },
);

/** Update an existing user (PATCH /users/:id). Used for edits and block/unblock. */
export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await usersApi.update(id, payload);
      return res.data; // updated user object
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update user');
    }
  },
);

/** Delete a user (DELETE /users/:id). */
export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id, { rejectWithValue }) => {
    try {
      await usersApi.remove(id);
      return id; // return the id so we can remove it from state
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete user');
    }
  },
);

// ── Slice ──────────────────────────────────────────────────────────────────

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    searchQuery: '',  // persisted search box value
    roleFilter: 'all', // persisted role dropdown value
  },
  reducers: {
    /** Reset slice when the superuser navigates away (optional cleanup). */
    resetUsers(state) {
      state.items = [];
      state.status = 'idle';
      state.error = null;
      state.searchQuery = '';
      state.roleFilter = 'all';
    },
    /** Update the search query (persists across tab-switches). */
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
    /** Update the role filter dropdown (persists across tab-switches). */
    setRoleFilter(state, action) {
      state.roleFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ── fetchUsers ──────────────────────────────────────────────────────
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // ── createUser ──────────────────────────────────────────────────────
    builder
      .addCase(createUser.fulfilled, (state, action) => {
        // Add the new user to the list (if the API returned it).
        if (action.payload && action.payload.id) {
          state.items.push(action.payload);
        }
      });

    // ── updateUser ──────────────────────────────────────────────────────
    builder
      .addCase(updateUser.fulfilled, (state, action) => {
        // Replace the stale entry with the updated one.
        if (action.payload && action.payload.id) {
          const idx = state.items.findIndex((u) => u.id === action.payload.id);
          if (idx !== -1) state.items[idx] = action.payload;
        }
      });

    // ── deleteUser ──────────────────────────────────────────────────────
    builder
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.items = state.items.filter((u) => u.id !== action.payload);
      });
  },
});

export const { resetUsers, setSearchQuery, setRoleFilter } = usersSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────
export const selectUsers = (state) => state.users.items;
export const selectUsersStatus = (state) => state.users.status;
export const selectUsersError = (state) => state.users.error;
export const selectUsersSearchQuery = (state) => state.users.searchQuery;
export const selectUsersRoleFilter = (state) => state.users.roleFilter;

export default usersSlice.reducer;
