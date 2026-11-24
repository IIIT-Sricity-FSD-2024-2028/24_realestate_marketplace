import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { attachStore } from './storeBridge.js';
import auth from './slices/authSlice.js';
import billing from './slices/billingSlice.js';
import buyer from './slices/buyerSlice.js';
import listings from './slices/listingsSlice.js';
import negotiations from './slices/negotiationsSlice.js';
import profile from './slices/profileSlice.js';
import properties from './slices/propertiesSlice.js';
import purchases from './slices/purchasesSlice.js';
import system from './slices/systemSlice.js';
import ui from './slices/uiSlice.js';
import users from './slices/usersSlice.js';
import visits from './slices/visitsSlice.js';

const appReducer = combineReducers({ auth, billing, buyer, listings, negotiations, profile, properties, purchases, system, ui, users, visits });
const rootReducer = (state, action) => appReducer(action.type === 'application/cleared' ? undefined : state, action);
export const store = configureStore({ reducer: rootReducer });
attachStore(store);

export const clearApplicationState = () => ({ type: 'application/cleared' });
