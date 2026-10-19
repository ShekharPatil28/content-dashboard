import { renderHook } from "@testing-library/react";
import { useInfiniteFeed } from "@/hooks/useInfiniteFeed";
import { useGetFeedInfiniteQuery } from "@/store/api/contentApi";

jest.mock("@/store/api/contentApi", () => ({ useGetFeedInfiniteQuery: jest.fn() }));
const mockQuery = useGetFeedInfiniteQuery as jest.Mock;

const item = (id: string) => ({
  id,
  type: "news",
  title: id,
  description: "",
  image: null,
  url: "https://example.com",
  source: "s",
});

const queryResult = (pages?: unknown[]) => ({
  data: pages ? { pages } : undefined,
  hasNextPage: true,
  fetchNextPage: jest.fn(),
  isLoading: false,
  isFetchingNextPage: false,
  isError: false,
  error: undefined,
  refetch: jest.fn(),
});

describe("useInfiniteFeed", () => {
  it("flattens pages and removes duplicate items", () => {
    mockQuery.mockReturnValue(
      queryResult([
        { items: [item("a"), item("b")], failed: [] },
        { items: [item("b"), item("c")], failed: [] },
      ])
    );
    const { result } = renderHook(() => useInfiniteFeed({ categories: ["technology"] }));
    expect(result.current.items.map((i) => i.id)).toEqual(["a", "b", "c"]);
  });

  it("lists each failed source once", () => {
    mockQuery.mockReturnValue(
      queryResult([
        { items: [], failed: ["news"] },
        { items: [], failed: ["news", "movies"] },
      ])
    );
    const { result } = renderHook(() => useInfiniteFeed({ categories: ["technology"] }));
    expect(result.current.failed).toEqual(["news", "movies"]);
  });

  it("returns empty lists before any data has loaded", () => {
    mockQuery.mockReturnValue(queryResult());
    const { result } = renderHook(() => useInfiniteFeed({ categories: ["technology"] }));
    expect(result.current.items).toEqual([]);
    expect(result.current.failed).toEqual([]);
  });

  it("skips the request when there are no categories and no search", () => {
    mockQuery.mockReturnValue(queryResult());
    renderHook(() => useInfiniteFeed({ categories: [] }));
    expect(mockQuery).toHaveBeenLastCalledWith({ categories: [], q: undefined }, { skip: true });
  });

  it("does not skip when searching, even without categories", () => {
    mockQuery.mockReturnValue(queryResult());
    renderHook(() => useInfiniteFeed({ categories: [], q: "dune" }));
    expect(mockQuery).toHaveBeenLastCalledWith({ categories: [], q: "dune" }, { skip: false });
  });

  it("sorts categories so the same selection always shares one cache entry", () => {
    mockQuery.mockReturnValue(queryResult());
    renderHook(() => useInfiniteFeed({ categories: ["sports", "finance"] }));
    expect(mockQuery).toHaveBeenLastCalledWith(
      { categories: ["finance", "sports"], q: undefined },
      { skip: false }
    );
  });
});