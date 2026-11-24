import { createSlice } from '@reduxjs/toolkit';
import {
  createProperty,
  deleteProperty,
  fetchAllProperties,
  fetchMyProperties,
  fetchProperties,
  fetchReviewProperties,
  rejectProperty,
  updateProperty,
  uploadPropertyDocuments,
  uploadPropertyImages,
  verifyProperty,
} from '../actions/apiActions.js';

const initialState = {
  public: { items: [], page: 1, total: 0, totalPages: 1 },
  mine: [],
  review: [],
  loading: { public: false, mine: false, review: false },
  error: null,
};
const errorMessage = (payload) => payload?.message || payload || 'Request failed';
const replaceIn = (items, entity) => {
  const index = items.findIndex((item) => item.id === entity.id);
  if (index < 0) return items;
  items[index] = entity;
  return items;
};
const applyEntity = (state, entity) => {
  if (!entity?.id) return;
  replaceIn(state.public.items, entity);
  replaceIn(state.mine, entity);
  replaceIn(state.review, entity);
};
const applyEntityAction = (state, { payload }) => applyEntity(state, payload);
const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    propertyCreated(state, { payload }) {
      if (payload?.id && !state.mine.some((p) => p.id === payload.id)) state.mine.unshift(payload);
    },
    propertyUpdated: applyEntityAction,
    propertyRemoved(state, { payload: id }) {
      state.public.items = state.public.items.filter((p) => p.id !== id);
      state.mine = state.mine.filter((p) => p.id !== id);
      state.review = state.review.filter((p) => p.id !== id);
    },
    clearProperties() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (s) => {
        s.loading.public = true;
        s.error = null;
      })
      .addCase(fetchProperties.fulfilled, (s, { payload }) => {
        s.public = { items: payload.items || [], page: payload.page || 1, total: payload.total || 0, totalPages: payload.totalPages || 1 };
        s.loading.public = false;
      })
      .addCase(fetchProperties.rejected, (s, { payload }) => {
        s.loading.public = false;
        s.error = errorMessage(payload);
      })
      .addCase(fetchAllProperties.pending, (s) => {
        s.loading.public = true;
        s.error = null;
      })
      .addCase(fetchAllProperties.fulfilled, (s, { payload }) => {
        s.public = { items: payload.items || [], page: payload.page || 1, total: payload.total || 0, totalPages: payload.totalPages || 1 };
        s.loading.public = false;
      })
      .addCase(fetchAllProperties.rejected, (s, { payload }) => {
        s.loading.public = false;
        s.error = errorMessage(payload);
      })
      .addCase(fetchMyProperties.pending, (s) => {
        s.loading.mine = true;
      })
      .addCase(fetchMyProperties.fulfilled, (s, { payload }) => {
        s.mine = payload || [];
        s.loading.mine = false;
      })
      .addCase(fetchMyProperties.rejected, (s, { payload }) => {
        s.loading.mine = false;
        s.error = errorMessage(payload);
      })
      .addCase(fetchReviewProperties.pending, (s) => {
        s.loading.review = true;
      })
      .addCase(fetchReviewProperties.fulfilled, (s, { payload }) => {
        s.review = payload.items || [];
        s.loading.review = false;
      })
      .addCase(fetchReviewProperties.rejected, (s, { payload }) => {
        s.loading.review = false;
        s.error = errorMessage(payload);
      });
    for (const action of [updateProperty, verifyProperty, rejectProperty, uploadPropertyImages, uploadPropertyDocuments])
      builder.addCase(action.fulfilled, applyEntityAction);
    builder.addCase(createProperty.fulfilled, (s, { payload }) => {
      if (payload?.id && !s.mine.some((p) => p.id === payload.id)) s.mine.unshift(payload);
    });
    builder.addCase(deleteProperty.fulfilled, (s, { payload }) => propertiesSlice.caseReducers.propertyRemoved(s, { payload }));
  },
});
export const { propertyCreated, propertyUpdated, propertyRemoved, clearProperties } = propertiesSlice.actions;
export default propertiesSlice.reducer;
