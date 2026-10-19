import { configureStore } from "@reduxjs/toolkit";
import { render, type RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { rootReducer, type RootState } from "@/store";
import { contentApi } from "@/store/api/contentApi";
import type { ContentItem } from "@/types/content";

export function makeTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefault) => getDefault().concat(contentApi.middleware),
  });
}

// Renders a component inside a fresh Redux store, optionally pre-filled with state
export function renderWithStore(
  ui: React.ReactElement,
  preloadedState?: Partial<RootState>,
  options?: RenderOptions
) {
  const store = makeTestStore(preloadedState);
  return { store, ...render(<Provider store={store}>{ui}</Provider>, options) };
}

// A valid ContentItem you can tweak per test
export function makeItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: "news-1",
    type: "news",
    title: "Test headline",
    description: "A short description",
    image: "https://example.com/a.jpg",
    url: "https://example.com/article",
    source: "Test Source",
    ...overrides,
  };
}