import { useMemo } from "react";
import type { Category } from "@/lib/constants";
import { useGetFeedInfiniteQuery } from "@/store/api/contentApi";
import type { ContentItem } from "@/types/content";

export function useInfiniteFeed({ categories, q }: { categories: Category[]; q?: string }) {
  // sorted so the same selection always hits the same cache entry
  const sorted = useMemo(() => [...categories].sort(), [categories]);
  const query = useGetFeedInfiniteQuery(
    { categories: sorted, q },
    { skip: !q && sorted.length === 0 }
  );

  const { items, failed } = useMemo(() => {
    const seen = new Set<string>();
    const items: ContentItem[] = [];
    const failed = new Set<string>();
    for (const page of query.data?.pages ?? []) {
      page.failed.forEach((f) => failed.add(f));
      for (const item of page.items) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          items.push(item);
        }
      }
    }
    return { items, failed: [...failed] };
  }, [query.data]);

  return {
    items,
    failed,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export type FeedState = ReturnType<typeof useInfiniteFeed>;