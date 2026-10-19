import {
  normalizeMovies,
  normalizeNews,
  normalizeSocial,
  type MockPost,
  type NewsApiArticle,
} from "@/lib/normalizers";

const article = (overrides: Partial<NewsApiArticle> = {}): NewsApiArticle => ({
  source: { name: "BBC" },
  title: "Headline",
  description: "Description",
  url: "https://example.com/a",
  urlToImage: "https://example.com/a.jpg",
  publishedAt: "2026-01-01T00:00:00Z",
  ...overrides,
});

describe("normalizeNews", () => {
  it("maps a NewsAPI article to a ContentItem", () => {
    const [item] = normalizeNews([article()], "technology");
    expect(item).toMatchObject({
      type: "news",
      title: "Headline",
      description: "Description",
      image: "https://example.com/a.jpg",
      url: "https://example.com/a",
      source: "BBC",
      category: "technology",
    });
    expect(item.id).toMatch(/^news-/);
  });

  it("drops removed, untitled, link-less and duplicate articles", () => {
    const items = normalizeNews([
      article({ title: "[Removed]", url: "https://example.com/removed" }),
      article({ title: null, url: "https://example.com/no-title" }),
      article({ url: "" }),
      article({ title: "Keep me", url: "https://example.com/keep" }),
      article({ title: "Keep me again", url: "https://example.com/keep" }),
    ]);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("Keep me");
  });

  it("falls back for missing source, description and image", () => {
    const [item] = normalizeNews([
      article({ source: undefined, description: null, urlToImage: null }),
    ]);
    expect(item.source).toBe("Unknown");
    expect(item.description).toBe("");
    expect(item.image).toBeNull();
  });

  it("gives the same url the same id, and different urls different ids", () => {
    const [a1] = normalizeNews([article({ url: "https://example.com/one" })]);
    const [a2] = normalizeNews([article({ url: "https://example.com/one" })]);
    const [b] = normalizeNews([article({ url: "https://example.com/two" })]);
    expect(a1.id).toBe(a2.id);
    expect(a1.id).not.toBe(b.id);
  });
});

describe("normalizeMovies", () => {
  it("maps a TMDB movie and builds the poster and page urls", () => {
    const [item] = normalizeMovies([
      { id: 5, title: "Dune", overview: "Sand", poster_path: "/p.jpg", release_date: "2024-03-01" },
    ]);
    expect(item).toMatchObject({
      id: "movie-5",
      type: "movie",
      title: "Dune",
      description: "Sand",
      image: "https://image.tmdb.org/t/p/w500/p.jpg",
      url: "https://www.themoviedb.org/movie/5",
      source: "TMDB",
      publishedAt: "2024-03-01",
    });
  });

  it("handles a missing poster and an empty release date", () => {
    const [item] = normalizeMovies([{ id: 6, title: "No Poster", poster_path: null, release_date: "" }]);
    expect(item.image).toBeNull();
    expect(item.publishedAt).toBeUndefined();
    expect(item.description).toBe("");
  });

  it("skips movies without a title", () => {
    expect(normalizeMovies([{ id: 7, title: "", poster_path: null }])).toEqual([]);
  });
});

describe("normalizeSocial", () => {
  it("maps a post to a ContentItem", () => {
    const post: MockPost = {
      id: "9",
      author: "Priya Nair",
      handle: "priyanair",
      text: "Hello world",
      hashtags: ["technology"],
      image: null,
      createdAt: "2026-01-01T00:00:00Z",
    };
    expect(normalizeSocial([post])[0]).toMatchObject({
      id: "social-9",
      type: "social",
      title: "Priya Nair",
      description: "Hello world",
      source: "@priyanair",
      category: "technology",
      image: null,
    });
  });
});