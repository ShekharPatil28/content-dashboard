"use client";

import { useState } from "react";
import { CATEGORIES, type Category } from "@/lib/constants";
import {
  useGetMoviesQuery,
  useGetNewsQuery,
  useGetSocialQuery,
} from "@/store/api/contentApi";
import TrendingSection from "./TrendingSection";

const FILTERS: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  ...CATEGORIES.map(({ id, label }) => ({ id, label })),
];
const LIMIT = 6;

export default function TrendingView() {
  const [category, setCategory] = useState<Category | "all">("all");
  const selected = category === "all" ? undefined : category;

  const news = useGetNewsQuery({ category: selected, page: 1 });
  const movies = useGetMoviesQuery({ page: 1, trending: true });
  const social = useGetSocialQuery({ hashtag: selected, page: 1 });

  return (
    <div>
      <div role="group" aria-label="Filter by category" className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setCategory(id)}
            aria-pressed={category === id}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              category === id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface hover:bg-background"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <TrendingSection
        title="Trending news"
        items={news.currentData?.items.slice(0, LIMIT) ?? []}
        isLoading={news.isFetching}
        isError={news.isError}
        error={news.error}
        onRetry={news.refetch}
      />
      <TrendingSection
        title="Trending movies this week"
        items={movies.currentData?.items.slice(0, LIMIT) ?? []}
        isLoading={movies.isFetching}
        isError={movies.isError}
        error={movies.error}
        onRetry={movies.refetch}
      />
      <TrendingSection
        title="Trending posts"
        items={social.currentData?.items.slice(0, LIMIT) ?? []}
        isLoading={social.isFetching}
        isError={social.isError}
        error={social.error}
        onRetry={social.refetch}
      />
    </div>
  );
}