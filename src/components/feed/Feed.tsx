"use client";

import Link from "next/link";
import { Newspaper, SlidersHorizontal } from "lucide-react";
import CardSkeleton from "@/components/cards/CardSkeleton";
import ContentCard from "@/components/cards/ContentCard";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { useAppSelector } from "@/hooks/redux";
import { useInfiniteFeed } from "@/hooks/useInfiniteFeed";
import { getErrorMessage } from "@/lib/errors";
import InfiniteScroll from "./InfiniteScroll";

const GRID = "grid gap-4 sm:grid-cols-2 xl:grid-cols-3";

export default function Feed() {
  const categories = useAppSelector((s) => s.preferences.categories);
  const feed = useInfiniteFeed({ categories });

  if (categories.length === 0) {
    return (
      <EmptyState
        icon={SlidersHorizontal}
        title="Pick your interests"
        description="Choose a few categories in Settings and we'll build your personalized feed."
        action={
          <Link
            href="/settings"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Open settings
          </Link>
        }
      />
    );
  }

  if (feed.isLoading) {
    return (
      <div className={GRID} role="status" aria-label="Loading feed">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (feed.isError && feed.items.length === 0) {
    return <ErrorState message={getErrorMessage(feed.error)} onRetry={feed.refetch} />;
  }

  if (feed.items.length === 0) {
    return (
      <EmptyState
        icon={Newspaper}
        title="Nothing to show yet"
        description="We couldn't find content for your categories. Try adding more in Settings."
      />
    );
  }

  const loadMoreFailed = feed.isError; // items exist, so a later page failed

  return (
    <>
      {feed.failed.length > 0 && (
        <p
          role="status"
          className="mb-4 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted"
        >
          Some sources couldn&apos;t be loaded ({feed.failed.join(", ")}). Showing the rest.
        </p>
      )}
      <ul className={GRID}>
        {feed.items.map((item) => (
          <li key={item.id}>
            <ContentCard item={item} />
          </li>
        ))}
      </ul>
      <InfiniteScroll
        hasMore={feed.hasNextPage}
        loading={feed.isFetchingNextPage}
        error={loadMoreFailed}
        onLoadMore={feed.fetchNextPage}
      />
    </>
  );
}