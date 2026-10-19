import type { Category } from "@/lib/constants";
import { interleave } from "@/lib/feed";
import type { ContentItem, PagedResponse } from "@/types/content";

export interface FeedArgs {
  categories: Category[];
  q?: string;
}

export interface FeedPage {
  items: ContentItem[];
  hasMore: boolean;
  failed: string[]; // sources that errored on this page
}

type Params = Record<string, string | number | undefined>;
type Result<E> = { data?: unknown; error?: E };
type Fetcher<E> = (arg: { url: string; params: Params }) => Result<E> | PromiseLike<Result<E>>;

const MOVIES_PER_PAGE = 8; // TMDB sends 20 per page; keep the mix balanced

export async function fetchFeedPage<E>(
  { categories, q }: FeedArgs,
  page: number,
  fetcher: Fetcher<E>
): Promise<{ data: FeedPage } | { error: E }> {
  const perCategory = Math.max(2, Math.ceil(10 / Math.max(categories.length, 1)));
  // searching looks across everything; otherwise follow the user's categories
  const newsCategories: (Category | undefined)[] = q ? [undefined] : categories;

  const calls = [
    ...newsCategories.map((category) => ({
      type: "news" as const,
      request: fetcher({ url: "news", params: { category, page, q, pageSize: perCategory } }),
    })),
    { type: "movies" as const, request: fetcher({ url: "movies", params: { page, q } }) },
    {
      type: "social" as const,
      request: fetcher({
        url: "social",
        params: { hashtag: q ? undefined : categories.join(","), page, q },
      }),
    },
  ];

  const results = await Promise.all(calls.map((c) => c.request));

  // every source failed -> the whole page is an error
  const firstError = results.find((r) => r.error)?.error;
  if (firstError && results.every((r) => r.error)) return { error: firstError };

  const news: ContentItem[][] = [];
  let movies: ContentItem[] = [];
  let social: ContentItem[] = [];
  const failed: string[] = [];
  let hasMore = false;

  results.forEach((result, i) => {
    const { type } = calls[i];
    if (result.error || !result.data) {
      if (!failed.includes(type)) failed.push(type);
      return;
    }
    const data = result.data as PagedResponse;
    hasMore ||= data.hasMore;
    if (type === "news") news.push(data.items);
    else if (type === "movies") movies = data.items.slice(0, MOVIES_PER_PAGE);
    else social = data.items;
  });

  return {
    data: { items: interleave([interleave(news), movies, social]), hasMore, failed },
  };
}