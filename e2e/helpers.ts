import type { Page, Route } from "@playwright/test";

type Source = "news" | "movies" | "social";

export interface MockOptions {
  news?: "ok" | "error";
  movies?: "ok" | "error";
  social?: "ok" | "error";
  emptyQuery?: string; // searching for exactly this returns no results
  onNewsQuery?: (q: string | null) => void; // lets a test see every search sent
}

const LABEL: Record<Source, string> = { news: "News", movies: "Movie", social: "Post" };
const TYPE = { news: "news", movies: "movie", social: "social" } as const;

function payload(source: Source, q: string | null, empty: boolean) {
  const items = Array.from({ length: empty ? 0 : 4 }, (_, i) => {
    const n = i + 1;
    return {
      id: `${TYPE[source]}-${q ?? "feed"}-${n}`,
      type: TYPE[source],
      title: q ? `${LABEL[source]} result for ${q} ${n}` : `${LABEL[source]} ${n}`,
      description: `Description for ${LABEL[source]} ${n}`,
      image: null,
      url: source === "social" ? "#" : `https://example.com/${source}/${n}`,
      source: "Mock",
    };
  });
  return { items, page: 1, hasMore: false };
}

// Answers our own /api/* routes with fake data. Pass the same options object
// you keep a reference to and change it mid-test to simulate an API recovering.
export async function mockApis(page: Page, options: MockOptions = {}) {
  const handle = (source: Source) => async (route: Route) => {
    const q = new URL(route.request().url()).searchParams.get("q");
    if (source === "news") options.onNewsQuery?.(q);

    if (options[source] === "error") {
      return route.fulfill({ status: 502, json: { error: `${LABEL[source]} API is down` } });
    }
    return route.fulfill({ json: payload(source, q, q !== null && q === options.emptyQuery) });
  };

  await page.route(/\/api\/news/, handle("news"));
  await page.route(/\/api\/movies/, handle("movies"));
  await page.route(/\/api\/social/, handle("social"));
}

// Pre-fills the saved categories before the app loads (only on the first visit,
// so reload tests still use what the app itself saved afterwards)
export async function seedPreferences(page: Page, categories: string[]) {
  await page.addInitScript((cats) => {
    if (!localStorage.getItem("persist:root")) {
      localStorage.setItem(
        "persist:root",
        JSON.stringify({ preferences: JSON.stringify({ categories: cats }) })
      );
    }
  }, categories);
}

// A card or page heading by its exact text
export const heading = (page: Page, name: string) =>
  page.getByRole("heading", { name, exact: true });