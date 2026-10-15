import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ContentItem } from "@/types/content";

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: [] as ContentItem[],
  reducers: {
    toggleFavorite(state, action: PayloadAction<ContentItem>) {
      const i = state.findIndex((x) => x.id === action.payload.id);
      if (i >= 0) state.splice(i, 1);
      else state.push(action.payload);
    },
  },
});

export const { toggleFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;