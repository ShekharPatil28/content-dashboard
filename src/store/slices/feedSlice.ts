import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Stores only the user's custom card order (ids). New pages from infinite
// scroll aren't in this list, so they get appended after ordered items.
const feedSlice = createSlice({
  name: "feed",
  initialState: { order: [] as string[] },
  reducers: {
    setOrder(state, action: PayloadAction<string[]>) {
      state.order = action.payload;
    },
    resetOrder(state) {
      state.order = [];
    },
  },
});

export const { setOrder, resetOrder } = feedSlice.actions;
export default feedSlice.reducer;