import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

import preferences from "./slices/preferencesSlice";
import favorites from "./slices/favoritesSlice";
import feed from "./slices/feedSlice";
import theme from "./slices/themeSlice";
import { contentApi } from "./api/contentApi";

// localStorage doesn't exist on the server, so use a no-op there
const createNoopStorage = () => ({
  getItem: async () => null,
  setItem: async (_k: string, v: string) => v,
  removeItem: async () => {},
});
const storage = typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage();

export const rootReducer = combineReducers({
  preferences,
  favorites,
  feed,
  theme,
  [contentApi.reducerPath]: contentApi.reducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["preferences", "favorites", "feed", "theme"], // API cache stays fresh
};

export const makeStore = () =>
  configureStore({
    reducer: persistReducer(persistConfig, rootReducer),
    middleware: (getDefault) =>
      getDefault({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(contentApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore["dispatch"];