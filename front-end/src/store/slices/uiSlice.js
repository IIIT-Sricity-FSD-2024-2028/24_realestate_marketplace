import { createSlice } from '@reduxjs/toolkit';
let nextToastId = 1;
const initialState = { toasts: [], dialog: null };
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toastAdded: {
      reducer(s, { payload }) {
        s.toasts.push(payload);
      },
      prepare(message, type = 'success') {
        return { payload: { id: nextToastId++, message: String(message), type } };
      },
    },
    toastRemoved(s, { payload }) {
      s.toasts = s.toasts.filter((toast) => toast.id !== payload);
    },
    dialogOpened(s, { payload }) {
      s.dialog = payload;
    },
    dialogClosed(s) {
      s.dialog = null;
    },
    uiCleared() {
      return initialState;
    },
  },
});
export const { toastAdded, toastRemoved, dialogOpened, dialogClosed, uiCleared } = uiSlice.actions;
export default uiSlice.reducer;
