"use client";

import type { LucideIcon } from "lucide-react";
import CardSkeleton from "@/components/cards/CardSkeleton";
import ContentCard from "@/components/cards/ContentCard";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import type { FeedState } from "@/hooks/useInfiniteFeed";
import { CARD_GRID } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import InfiniteScroll from "./InfiniteScroll";

interface Props {
  feed: FeedState;
  empty: { icon: LucideIcon; title: string; description: string };
}

export default function FeedView({ feed, empty }: Props) {
  if (feed.isLoading) {
    return (
      <div className={CARD_GRID} role="status" aria-label="Loading content">
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
    return <EmptyState icon={empty.icon} title={empty.title} description={empty.description} />;
  }

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
      <ul className={CARD_GRID}>
        {feed.items.map((item) => (
          <li key={item.id}>
            <ContentCard item={item} />
          </li>
        ))}
      </ul>
      <InfiniteScroll
        hasMore={feed.hasNextPage}
        loading={feed.isFetchingNextPage}
        error={feed.isError}
        onLoadMore={feed.fetchNextPage}
      />
    </>
  );
}