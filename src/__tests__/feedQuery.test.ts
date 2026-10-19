import { fetchFeedPage } from "@/lib/feedQuery";
import { makeItem } from "@/test-utils";
import type { ContentItem } from "@/types/content";

type Err = { status: number };
type Req = { url: string; params: Record<string, unknown> };
type Reply = { data?: unknown; error?: Err };

const items = (prefix: string, n: number): ContentItem[] =>
  Array.from({ length: n }, (_, i) =>
    makeItem({ id: `${prefix}${i + 1}`, title: `${prefix}${i + 1}` })
  );
const ok = (list: ContentItem[], hasMore = false): Reply => ({
  data: { items: list, page: 1, hasMore },
});
const fail = (status = 500): Reply => ({ error: { status } });

type Replies = Partial<Record<"news" | "movies" | "social", Reply>>;
const makeFetcher = (replies: Replies) =>
  jest.fn(async ({ url }: Req): Promise<Reply> => replies[url as keyof Replies] ?? ok([]));

const run = (
  args: Parameters<typeof fetchFeedPage>[0],
  fetcher: ReturnType<typeof makeFetcher>,
  page = 1
) => fetchFeedPage<Err>(args, page, fetcher);

function dataOf(result: Awaited<ReturnType<typeof run>>) {
  if (!("data" in result)) throw new Error("expected data but got an error");
  return result.data;
}

const requestsTo = (fetcher: ReturnType<typeof makeFetcher>, url: string) =>
  fetcher.mock.calls.map(([arg]) => arg).filter((arg) => arg.url === url);

describe("fetchFeedPage", () => {
  it("mixes news, movies and posts so no source dominates the top", async () => {
    const fetcher = makeFetcher({
      news: ok(items("n", 3)),
      movies: ok(items("m", 2)),
      social: ok(items("s", 2)),
    });
    const data = dataOf(await run({ categories: ["technology"] }, fetcher));
    expect(data.items.map((i) => i.id)).toEqual(["n1", "m1", "s1", "n2", "m2", "s2", "n3"]);
    expect(data.failed).toEqual([]);
  });

  it("makes one news request per category and splits the page size between them", async () => {
    const fetcher = makeFetcher({});
    await run({ categories: ["sports", "technology", "health"] }, fetcher, 2);

    const news = requestsTo(fetcher, "news");
    expect(news.map((r) => r.params.category)).toEqual(["sports", "technology", "health"]);
    expect(news.every((r) => r.params.pageSize === 4 && r.params.page === 2)).toBe(true);

    const social = requestsTo(fetcher, "social");
    expect(social).toHaveLength(1);
    expect(social[0].params.hashtag).toBe("sports,technology,health");
  });

  it("keeps only 8 movies per page", async () => {
    const fetcher = makeFetcher({ movies: ok(items("m", 20)) });
    const data = dataOf(await run({ categories: ["sports"] }, fetcher));
    expect(data.items.filter((i) => i.id.startsWith("m"))).toHaveLength(8);
  });

  it("searches across everything and ignores the chosen categories", async () => {
    const fetcher = makeFetcher({});
    await run({ categories: ["sports"], q: "batman" }, fetcher);

    const news = requestsTo(fetcher, "news");
    expect(news).toHaveLength(1);
    expect(news[0].params.category).toBeUndefined();
    expect(news[0].params.q).toBe("batman");
    expect(requestsTo(fetcher, "social")[0].params.hashtag).toBeUndefined();
  });

  it("still returns the other sources when one fails, and reports it", async () => {
    const fetcher = makeFetcher({
      news: fail(),
      movies: ok(items("m", 2)),
      social: ok(items("s", 2)),
    });
    const data = dataOf(await run({ categories: ["technology"] }, fetcher));
    expect(data.failed).toEqual(["news"]);
    expect(data.items.map((i) => i.id)).toEqual(["m1", "s1", "m2", "s2"]);
  });

  it("reports a failing source once even with several categories", async () => {
    const fetcher = makeFetcher({ news: fail(), movies: ok(items("m", 1)) });
    const data = dataOf(await run({ categories: ["sports", "health"] }, fetcher));
    expect(data.failed).toEqual(["news"]);
  });

  it("returns an error when every source fails", async () => {
    const fetcher = makeFetcher({ news: fail(502), movies: fail(500), social: fail(500) });
    const result = await run({ categories: ["technology"] }, fetcher);
    expect(result).toEqual({ error: { status: 502 } });
  });

  it("has more pages if any source has more", async () => {
    const some = makeFetcher({ news: ok([], false), movies: ok([], true) });
    expect(dataOf(await run({ categories: ["technology"] }, some)).hasMore).toBe(true);

    const none = makeFetcher({ news: ok([]), movies: ok([]), social: ok([]) });
    expect(dataOf(await run({ categories: ["technology"] }, none)).hasMore).toBe(false);
  });
});