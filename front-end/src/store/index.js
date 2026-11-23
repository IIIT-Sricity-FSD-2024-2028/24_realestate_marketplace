/**
 * store/index.js
 * Purpose: Central Redux store — combines all reducers and exports typed
 *          hooks so components never import directly from 'react-redux'.
 * Usage:
 *   import { store } from './store/index.js';          // for <Provider>
 *   import { useAppDispatch, useAppSelector } from './store/index.js'; // in components
 */
import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice.js';
import usersReducer from './slices/usersSlice.js';
import propertiesReducer from './slices/propertiesSlice.js';
import revenueReducer from './slices/revenueSlice.js';
import logsReducer from './slices/logsSlice.js';
import overviewReducer from './slices/overviewSlice.js';
import settingsReducer from './slices/settingsSlice.js';

import { useDispatch, useSelector } from 'react-redux';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    suProperties: propertiesReducer,
    revenue: revenueReducer,
    logs: logsReducer,
    overview: overviewReducer,
    settings: settingsReducer,
  },
  // Redux Thunk middleware is included by default via configureStore.
  // devTools is enabled automatically in development by RTK.
});

// ── Typed hooks ────────────────────────────────────────────────────────────
// Use these in components instead of plain useDispatch / useSelector so the
// entire app can be typed later without touching every component.

/** Pre-typed dispatch — aware of thunk actions. */
export const useAppDispatch = () => useDispatch();

/** Pre-typed selector — infers state shape from the store. */
export const useAppSelector = useSelector;
