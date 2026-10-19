import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Feed from "@/components/feed/Feed";
import FavoritesList from "@/components/feed/FavoritesList";
import SearchResults from "@/components/feed/SearchResults";
import ThemeToggle from "@/components/layout/ThemeToggle";
import CategoryPicker from "@/components/settings/CategoryPicker";
import { CATEGORIES } from "@/lib/constants";
import { makeItem, renderWithStore } from "@/test-utils";

describe("CategoryPicker", () => {
  it("shows every category", () => {
    renderWithStore(<CategoryPicker />);
    expect(screen.getAllByRole("checkbox")).toHaveLength(CATEGORIES.length);
  });

  it("toggles a category on and off and saves it in the store", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<CategoryPicker />);

    await user.click(screen.getByLabelText("Technology"));
    expect(screen.getByLabelText("Technology")).toBeChecked();
    expect(store.getState().preferences.categories).toEqual(["technology"]);

    await user.click(screen.getByLabelText("Technology"));
    expect(screen.getByLabelText("Technology")).not.toBeChecked();
    expect(store.getState().preferences.categories).toEqual([]);
  });

  it("shows saved preferences as checked", () => {
    renderWithStore(<CategoryPicker />, { preferences: { categories: ["sports"] } });
    expect(screen.getByLabelText("Sports")).toBeChecked();
    expect(screen.getByLabelText("Finance")).not.toBeChecked();
  });
});

describe("Feed with no preferences", () => {
  it("asks the user to pick interests instead of loading anything", () => {
    renderWithStore(<Feed />);
    expect(screen.getByRole("heading", { name: "Pick your interests" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open settings/i })).toHaveAttribute(
      "href",
      "/settings"
    );
  });
});

describe("FavoritesList", () => {
  it("shows an empty state with a way back to the feed", () => {
    renderWithStore(<FavoritesList />);
    expect(screen.getByRole("heading", { name: "No favorites yet" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse your feed/i })).toHaveAttribute("href", "/");
  });

  it("lists saved items and removes one when un-hearted", async () => {
    const user = userEvent.setup();
    const favorites = [makeItem({ id: "1", title: "One" }), makeItem({ id: "2", title: "Two" })];
    renderWithStore(<FavoritesList />, { favorites });
    expect(screen.getAllByRole("article")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Remove One from favorites" }));
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Two" })).toBeInTheDocument();
  });
});

describe("SearchResults", () => {
  it("shows a prompt instead of searching when the query is empty", () => {
    renderWithStore(<SearchResults query="" />);
    expect(screen.getByRole("heading", { name: "Search everything" })).toBeInTheDocument();
  });
});

describe("ThemeToggle", () => {
  it("switches between light and dark and updates its label", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    expect(store.getState().theme.mode).toBe("dark");

    await user.click(screen.getByRole("button", { name: "Switch to light mode" }));
    expect(store.getState().theme.mode).toBe("light");
  });
});