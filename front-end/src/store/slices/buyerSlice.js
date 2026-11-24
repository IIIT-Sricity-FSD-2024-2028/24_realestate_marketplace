import { createSlice } from '@reduxjs/toolkit';

const initialState = { shortlist: [], considering: [], initiatedOfferIds: [] };
const buyerSlice = createSlice({
  name: 'buyer',
  initialState,
  reducers: {
    shortlistToggled(state, { payload: id }) {
      const index = state.shortlist.indexOf(id);
      if (index >= 0) state.shortlist.splice(index, 1);
      else state.shortlist.push(id);
    },
    considerationAdded(state, { payload: id }) {
      if (!state.considering.includes(id)) state.considering.push(id);
    },
    considerationRemoved(state, { payload: id }) {
      state.considering = state.considering.filter((value) => value !== id);
    },
    initiatedOfferAdded(state, { payload: id }) {
      if (!state.initiatedOfferIds.includes(id)) state.initiatedOfferIds.push(id);
    },
    buyerCleared() {
      return initialState;
    },
  },
});
export const { shortlistToggled, considerationAdded, considerationRemoved, initiatedOfferAdded, buyerCleared } = buyerSlice.actions;
export default buyerSlice.reducer;
