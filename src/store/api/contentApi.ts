import {
  createApi,
  fetchBaseQuery,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { fetchFeedPage, type FeedArgs, type FeedPage } from "@/lib/feedQuery";
import type { PagedResponse } from "@/types/content";

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
      queryFn: ({ queryArg, pageParam }, _api, _extra, baseQuery) =>
        fetchFeedPage<FetchBaseQueryError>(queryArg, pageParam, baseQuery),
    }),
  }),
});

export const {
  useGetNewsQuery,
  useGetMoviesQuery,
  useGetSocialQuery,
  useGetFeedInfiniteQuery,
} = contentApi;