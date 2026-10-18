"use client";

import { Search, SearchX } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { useInfiniteFeed } from "@/hooks/useInfiniteFeed";
import type { Category } from "@/lib/constants";
import FeedView from "./FeedView";

const NO_CATEGORIES: Category[] = [];

export default function SearchResults({ query }: { query: string }) {
  // search covers all content, so categories are not applied
  const feed = useInfiniteFeed({ categories: NO_CATEGORIES, q: query || undefined });

  if (!query) {
    return (
      <EmptyState
        icon={Search}
        title="Search everything"
        description="Type in the search bar to find news, movies and posts."
      />
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted">Results for &ldquo;{query}&rdquo;</p>
      <FeedView
        feed={feed}
        empty={{
          icon: SearchX,
          title: "No results",
          description: `Nothing matched “${query}”. Try a different keyword.`,
        }}
      />
    </>
  );
}