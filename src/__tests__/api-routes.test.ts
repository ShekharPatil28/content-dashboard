/** @jest-environment node */
import { NextRequest } from "next/server";
import { GET as getMovies } from "@/app/api/movies/route";
import { GET as getNews } from "@/app/api/news/route";
import { GET as getSocial } from "@/app/api/social/route";

const req = (path: string) => new NextRequest(`http://localhost${path}`);

const realFetch = global.fetch;

function mockUpstream(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

const calledUrl = (fetchMock: jest.Mock) => new URL(String(fetchMock.mock.calls[0][0]));

beforeEach(() => {
  process.env.NEWS_API_KEY = "test-news-key";
  process.env.TMDB_API_KEY = "test-tmdb-key";
});
afterEach(() => {
  global.fetch = realFetch;
});

describe("GET /api/news", () => {
  const upstream = {
    totalResults: 50,
    articles: [
      { source: { name: "BBC" }, title: "Hello", description: "d", url: "https://e.com/1", urlToImage: null, publishedAt: null },
      { source: { name: "X" }, title: "[Removed]", description: null, url: "https://e.com/2", urlToImage: null, publishedAt: null },
    ],
  };

  it("returns 500 when the API key is not configured", async () => {
    delete process.env.NEWS_API_KEY;
    const res = await getNews(req("/api/news"));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/NEWS_API_KEY/);
  });

  it("returns normalized items and pagination info", async () => {
    const fetchMock = mockUpstream(upstream);
    const res = await getNews(req("/api/news?category=finance&page=2"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.page).toBe(2);
    expect(body.hasMore).toBe(true); // 2 * 10 < 50
    expect(body.items).toHaveLength(1); // [Removed] dropped
    expect(body.items[0]).toMatchObject({ title: "Hello", category: "finance", type: "news" });

    // our "finance" maps to NewsAPI's "business"
    expect(calledUrl(fetchMock).searchParams.get("category")).toBe("business");
  });

  it("keeps the API key out of the url and sends it in a header", async () => {
    const fetchMock = mockUpstream(upstream);
    await getNews(req("/api/news"));
    expect(String(fetchMock.mock.calls[0][0])).not.toContain("test-news-key");
    expect(fetchMock.mock.calls[0][1].headers["X-Api-Key"]).toBe("test-news-key");
  });

  it("uses the search endpoint when a query is given", async () => {
    const fetchMock = mockUpstream(upstream);
    await getNews(req("/api/news?q=batman"));
    const url = calledUrl(fetchMock);
    expect(url.pathname).toBe("/v2/everything");
    expect(url.searchParams.get("q")).toBe("batman");
  });

  it("ignores unknown categories and clamps the page size", async () => {
    const fetchMock = mockUpstream(upstream);
    await getNews(req("/api/news?category=hacker&pageSize=500"));
    const url = calledUrl(fetchMock);
    expect(url.searchParams.has("category")).toBe(false);
    expect(url.searchParams.get("pageSize")).toBe("20");
  });

  it("returns an empty page past the free-plan limit without calling NewsAPI", async () => {
    const fetchMock = mockUpstream(upstream);
    const res = await getNews(req("/api/news?page=11"));
    expect(await res.json()).toEqual({ items: [], page: 11, hasMore: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("passes rate limits through as 429", async () => {
    mockUpstream({ message: "Too many requests" }, { ok: false, status: 429 });
    const res = await getNews(req("/api/news"));
    expect(res.status).toBe(429);
    expect((await res.json()).error).toBe("Too many requests");
  });

  it("turns other upstream failures into 502", async () => {
    mockUpstream({ message: "Server error" }, { ok: false, status: 500 });
    const res = await getNews(req("/api/news"));
    expect(res.status).toBe(502);
  });

  it("returns 502 when the network request throws", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("boom")) as unknown as typeof fetch;
    const res = await getNews(req("/api/news"));
    expect(res.status).toBe(502);
    expect((await res.json()).error).toMatch(/could not reach/i);
  });
});

describe("GET /api/movies", () => {
  const upstream = {
    total_pages: 3,
    results: [{ id: 1, title: "Dune", overview: "Sand", poster_path: "/p.jpg", release_date: "2024-03-01" }],
  };

  it("returns 500 when the API key is not configured", async () => {
    delete process.env.TMDB_API_KEY;
    const res = await getMovies(req("/api/movies"));
    expect(res.status).toBe(500);
  });

  it("returns normalized movies and knows when there are more pages", async () => {
    mockUpstream(upstream);
    const first = await (await getMovies(req("/api/movies?page=1"))).json();
    expect(first.items[0]).toMatchObject({ id: "movie-1", title: "Dune", type: "movie" });
    expect(first.hasMore).toBe(true);

    mockUpstream(upstream);
    const last = await (await getMovies(req("/api/movies?page=3"))).json();
    expect(last.hasMore).toBe(false);
  });

  it("picks the right TMDB endpoint", async () => {
    let fetchMock = mockUpstream(upstream);
    await getMovies(req("/api/movies"));
    expect(calledUrl(fetchMock).pathname).toBe("/3/discover/movie");

    fetchMock = mockUpstream(upstream);
    await getMovies(req("/api/movies?trending=week"));
    expect(calledUrl(fetchMock).pathname).toBe("/3/trending/movie/week");

    fetchMock = mockUpstream(upstream);
    await getMovies(req("/api/movies?q=dune"));
    const url = calledUrl(fetchMock);
    expect(url.pathname).toBe("/3/search/movie");
    expect(url.searchParams.get("query")).toBe("dune");
  });

  it("only forwards genre ids that look like genre ids", async () => {
    let fetchMock = mockUpstream(upstream);
    await getMovies(req("/api/movies?genres=878,99"));
    expect(calledUrl(fetchMock).searchParams.get("with_genres")).toBe("878,99");

    fetchMock = mockUpstream(upstream);
    await getMovies(req("/api/movies?genres=1;drop"));
    expect(calledUrl(fetchMock).searchParams.has("with_genres")).toBe(false);
  });

  it("passes TMDB errors on as 502", async () => {
    mockUpstream({ status_message: "Invalid API key" }, { ok: false, status: 401 });
    const res = await getMovies(req("/api/movies"));
    expect(res.status).toBe(502);
    expect((await res.json()).error).toBe("Invalid API key");
  });
});

describe("GET /api/social (mock)", () => {
  it("returns the first page of posts", async () => {
    const body = await (await getSocial(req("/api/social"))).json();
    expect(body.items).toHaveLength(6);
    expect(body.hasMore).toBe(true);
  });

  it("filters by hashtag, with or without #", async () => {
    const plain = await (await getSocial(req("/api/social?hashtag=sports"))).json();
    expect(plain.items).toHaveLength(3);
    expect(plain.items.every((i: { category: string }) => i.category === "sports")).toBe(true);
    expect(plain.hasMore).toBe(false);

    const hashed = await (await getSocial(req("/api/social?hashtag=%23Sports"))).json();
    expect(hashed.items).toHaveLength(3);
  });

  it("accepts several hashtags at once", async () => {
    const body = await (await getSocial(req("/api/social?hashtag=technology,finance"))).json();
    expect(body.items).toHaveLength(6);
  });

  it("searches post text", async () => {
    const body = await (await getSocial(req("/api/social?q=sleep"))).json();
    expect(body.items.length).toBeGreaterThan(0);
    expect(
      body.items.every((i: { description: string }) => i.description.toLowerCase().includes("sleep"))
    ).toBe(true);
  });

  it("paginates and returns an empty page past the end", async () => {
    const last = await (await getSocial(req("/api/social?page=3"))).json();
    expect(last.items).toHaveLength(6);
    expect(last.hasMore).toBe(false);

    const beyond = await (await getSocial(req("/api/social?page=4"))).json();
    expect(beyond.items).toEqual([]);
  });
});