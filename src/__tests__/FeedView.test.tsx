import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Newspaper } from "lucide-react";
import FeedView from "@/components/feed/FeedView";
import type { FeedState } from "@/hooks/useInfiniteFeed";
import { makeItem, renderWithStore } from "@/test-utils";

const empty = { icon: Newspaper, title: "Nothing here", description: "Try again later" };

function makeFeed(overrides: Partial<FeedState> = {}) {
  return {
    items: [],
    failed: [],
    hasNextPage: false,
    fetchNextPage: jest.fn(),
    isLoading: false,
    isFetchingNextPage: false,
    isError: false,
    error: undefined,
    refetch: jest.fn(),
    ...overrides,
  } as unknown as FeedState;
}

const items = [
  makeItem({ id: "a", title: "Alpha" }),
  makeItem({ id: "b", title: "Bravo" }),
  makeItem({ id: "c", title: "Charlie" }),
];
const cardTitles = () =>
  screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);



describe("FeedView states", () => {
  it("shows skeletons while loading", () => {
    renderWithStore(<FeedView feed={makeFeed({ isLoading: true })} empty={empty} />);
    expect(screen.getByRole("status", { name: /loading content/i })).toBeInTheDocument();
  });

    it("shows the API error message with a working retry button", async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    const error = { status: 500, data: { error: "NEWS_API_KEY is not configured" } };
    renderWithStore(
      <FeedView feed={makeFeed({ isError: true,  refetch })} empty={empty} />
    );

    expect(screen.getByRole("alert")).toHaveTextContent("NEWS_API_KEY is not configured");
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("shows the empty state when there is nothing to show", () => {
    renderWithStore(<FeedView feed={makeFeed()} empty={empty} />);
    expect(screen.getByRole("heading", { name: "Nothing here" })).toBeInTheDocument();
    expect(screen.getByText("Try again later")).toBeInTheDocument();
  });

  it("renders a card for every item", () => {
    renderWithStore(<FeedView feed={makeFeed({ items })} empty={empty} />);
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(cardTitles()).toEqual(["Alpha", "Bravo", "Charlie"]);
  });

  it("warns about failed sources but still shows the rest", () => {
    renderWithStore(<FeedView feed={makeFeed({ items, failed: ["news"] })} empty={empty} />);
    expect(screen.getByRole("status")).toHaveTextContent(/some sources.*news/i);
    expect(screen.getAllByRole("article")).toHaveLength(3);
  });

  it("keeps the cards and offers a retry when a later page fails", async () => {
    const user = userEvent.setup();
    const fetchNextPage = jest.fn();
    renderWithStore(
      <FeedView
        feed={makeFeed({ items, isError: true, hasNextPage: true, fetchNextPage })}
        empty={empty}
      />
    );
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getByText(/couldn't load more/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it("loads more on request and says when everything has loaded", async () => {
    const user = userEvent.setup();
    const fetchNextPage = jest.fn();
    const { unmount } = renderWithStore(
      <FeedView feed={makeFeed({ items, hasNextPage: true, fetchNextPage })} empty={empty} />
    );
    await user.click(screen.getByRole("button", { name: /load more/i }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
    unmount();

    renderWithStore(<FeedView feed={makeFeed({ items, hasNextPage: false })} empty={empty} />);
    expect(screen.getByText(/all caught up/i)).toBeInTheDocument();
  });
});

describe("FeedView ordering", () => {
  it("applies the saved card order only when sortable", () => {
    const preloaded = { feed: { order: ["c", "a"] } };

    const { unmount } = renderWithStore(
      <FeedView feed={makeFeed({ items })} empty={empty} sortable />,
      preloaded
    );
    expect(cardTitles()).toEqual(["Charlie", "Alpha", "Bravo"]);
    unmount();

    renderWithStore(<FeedView feed={makeFeed({ items })} empty={empty} />, preloaded);
    expect(cardTitles()).toEqual(["Alpha", "Bravo", "Charlie"]);
  });

  it("lets the user reorder with the arrow buttons and saves the order", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(
      <FeedView feed={makeFeed({ items })} empty={empty} sortable />
    );

    await user.click(screen.getByRole("button", { name: "Organize" }));
    expect(screen.getByRole("button", { name: "Move Alpha up" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move Charlie down" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Move Alpha down" }));
    expect(store.getState().feed.order).toEqual(["b", "a", "c"]);

    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(cardTitles()).toEqual(["Bravo", "Alpha", "Charlie"]);
  });

  it("resets the order", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(
      <FeedView feed={makeFeed({ items })} empty={empty} sortable />,
      { feed: { order: ["c", "b", "a"] } }
    );

    await user.click(screen.getByRole("button", { name: /reset order/i }));
    expect(store.getState().feed.order).toEqual([]);
    expect(cardTitles()).toEqual(["Alpha", "Bravo", "Charlie"]);
  });

  it("refreshes the feed on request", async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    renderWithStore(<FeedView feed={makeFeed({ items, refetch })} empty={empty} sortable />);

    await user.click(screen.getByRole("button", { name: "Refresh" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});