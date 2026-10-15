import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { PagedResponse } from "@/types/content";

export const contentApi = createApi({
  reducerPath: "contentApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (build) => ({
    getNews: build.query<PagedResponse, { category: string; page: number; q?: string }>({
      query: ({ category, page, q }) => ({ url: "news", params: { category, page, q } }),
    }),
    getMovies: build.query<PagedResponse, { page: number; q?: string }>({
      query: ({ page, q }) => ({ url: "movies", params: { page, q } }),
    }),
    getSocial: build.query<PagedResponse, { hashtag?: string; page: number; q?: string }>({
      query: ({ hashtag, page, q }) => ({ url: "social", params: { hashtag, page, q } }),
    }),
  }),
});

export const { useGetNewsQuery, useGetMoviesQuery, useGetSocialQuery } = contentApi;