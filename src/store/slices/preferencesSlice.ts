import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Category } from "@/lib/constants";

interface PreferencesState {
  categories: Category[];
}

const initialState: PreferencesState = { categories: [] };
const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    toggleCategory(state, action: PayloadAction<Category>) {
      const i = state.categories.indexOf(action.payload);
      if (i >= 0) state.categories.splice(i, 1);
      else state.categories.push(action.payload);
    },
    setCategories(state, action: PayloadAction<Category[]>) {
      state.categories = action.payload;
    },
  },
});

export const { toggleCategory, setCategories } = preferencesSlice.actions;
export default preferencesSlice.reducer;