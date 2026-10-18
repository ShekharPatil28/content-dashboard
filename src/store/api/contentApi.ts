import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
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

const MOVIES_PER_PAGE = 8; // TMDB sends 20 per page; keep the mix balanced

export const contentApi = createApi({
  reducerPath: "contentApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  
  endpoints: (build) => ({
    getNews: build.query<PagedResponse, { category?: string; page: number; q?: string }>({
      query: ({ category, page, q }) => ({ url: "news", params: { category, page, q } }),
    }),
    getMovies: build.query<PagedResponse, { page: number; q?: string; trending?: boolean }>({
      query: ({ page, q, trending }) => ({
        url: "movies",
        params: { page, q, trending: trending ? "week" : undefined },
      }),
    }),
    getSocial: build.query<PagedResponse, { hashtag?: string; page: number; q?: string }>({
      query: ({ hashtag, page, q }) => ({ url: "social", params: { hashtag, page, q } }),
    }),

    // One unified, paginated feed built from all three sources
    getFeed: build.infiniteQuery<FeedPage, FeedArgs, number>({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (lastPage, _allPages, lastPageParam) =>
          lastPage.hasMore ? lastPageParam + 1 : undefined,
      },
      queryFn: async ({ queryArg, pageParam }, _api, _extra, baseQuery) => {
        const { categories, q } = queryArg;
        const perCategory = Math.max(2, Math.ceil(10 / Math.max(categories.length, 1)));
        // searching looks across everything; otherwise follow the user's categories
        const newsCategories: (Category | undefined)[] = q ? [undefined] : categories;

        const calls = [
          ...newsCategories.map((category) => ({
            type: "news" as const,
            request: baseQuery({
              url: "news",
              params: { category, page: pageParam, q, pageSize: perCategory },
            }),
          })),
          {
            type: "movies" as const,
            request: baseQuery({ url: "movies", params: { page: pageParam, q } }),
          },
          {
            type: "social" as const,
            request: baseQuery({
              url: "social",
              params: { hashtag: q ? undefined : categories.join(","), page: pageParam, q },
            }),
          },
        ];

        const results = await Promise.all(calls.map((c) => c.request));

        // every source failed -> whole page is an error
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
      },
    }),
  }),
});

export const {
  useGetNewsQuery,
  useGetMoviesQuery,
  useGetSocialQuery,
  useGetFeedInfiniteQuery,
} = contentApi;