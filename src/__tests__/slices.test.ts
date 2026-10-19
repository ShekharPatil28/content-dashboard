import favorites, { toggleFavorite } from "@/store/slices/favoritesSlice";
import feed, { resetOrder, setOrder } from "@/store/slices/feedSlice";
import preferences, { setCategories, toggleCategory } from "@/store/slices/preferencesSlice";
import theme, { toggleTheme } from "@/store/slices/themeSlice";
import { makeItem } from "@/test-utils";

const init = { type: "@@test/init" };

describe("preferences slice", () => {
  it("starts with no categories selected", () => {
    expect(preferences(undefined, init).categories).toEqual([]);
  });

  it("adds a category and removes it when toggled again", () => {
    let state = preferences(undefined, toggleCategory("sports"));
    expect(state.categories).toEqual(["sports"]);
    state = preferences(state, toggleCategory("technology"));
    expect(state.categories).toEqual(["sports", "technology"]);
    state = preferences(state, toggleCategory("sports"));
    expect(state.categories).toEqual(["technology"]);
  });

  it("replaces all categories with setCategories", () => {
    const state = preferences({ categories: ["sports"] }, setCategories(["health", "science"]));
    expect(state.categories).toEqual(["health", "science"]);
  });
});

describe("favorites slice", () => {
  it("adds an item and removes it when toggled again", () => {
    const item = makeItem({ id: "x" });
    let state = favorites(undefined, toggleFavorite(item));
    expect(state).toEqual([item]);
    state = favorites(state, toggleFavorite(item));
    expect(state).toEqual([]);
  });

  it("never stores the same item twice", () => {
    const item = makeItem({ id: "x" });
    const once = favorites(undefined, toggleFavorite(item));
    const other = favorites(once, toggleFavorite(makeItem({ id: "y" })));
    expect(other.map((i) => i.id)).toEqual(["x", "y"]);
  });
});

describe("feed slice", () => {
  it("saves and resets the custom card order", () => {
    let state = feed(undefined, setOrder(["b", "a"]));
    expect(state.order).toEqual(["b", "a"]);
    state = feed(state, resetOrder());
    expect(state.order).toEqual([]);
  });
});

describe("theme slice", () => {
  it("starts light and toggles back and forth", () => {
    let state = theme(undefined, init);
    expect(state.mode).toBe("light");
    state = theme(state, toggleTheme());
    expect(state.mode).toBe("dark");
    state = theme(state, toggleTheme());
    expect(state.mode).toBe("light");
  });
});