"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, Check, RefreshCw, RotateCcw, type LucideIcon } from "lucide-react";
import CardSkeleton from "@/components/cards/CardSkeleton";
import ContentCard from "@/components/cards/ContentCard";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import type { FeedState } from "@/hooks/useInfiniteFeed";
import { CARD_GRID } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { applyOrder } from "@/lib/feed";
import { resetOrder, setOrder } from "@/store/slices/feedSlice";
import DraggableList from "./DraggableList";
import InfiniteScroll from "./InfiniteScroll";

interface Props {
  feed: FeedState;
  empty: { icon: LucideIcon; title: string; description: string };
  sortable?: boolean; // lets the user drag to reorder (main feed only)
}

const toolbarButton =
  "inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-surface";

export default function FeedView({ feed, empty, sortable = false }: Props) {
  const dispatch = useAppDispatch();
  const order = useAppSelector((s) => s.feed.order);
  const [organizing, setOrganizing] = useState(false);

  const items = useMemo(
    () => (sortable ? applyOrder(feed.items, order) : feed.items),
    [sortable, feed.items, order]
  );

  if (feed.isLoading) {
    return (
      <div className={CARD_GRID} role="status" aria-label="Loading content">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (feed.isError && items.length === 0) {
    return <ErrorState message={getErrorMessage(feed.error)} onRetry={feed.refetch} />;
  }

  if (items.length === 0) {
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

      {sortable && (
        <div className="mb-4 flex items-center justify-end gap-2">
          
          <button
            onClick={() => feed.refetch()}
            disabled={feed.isFetching}
            className={`${toolbarButton} disabled:opacity-60`}
          >
            <RefreshCw
              size={14}
              aria-hidden="true"
              className={feed.isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>

          {order.length > 0 && (
            <button onClick={() => dispatch(resetOrder())} className={toolbarButton}>
              <RotateCcw size={14} aria-hidden="true" />
              Reset order
            </button>
          )}
          <button
            onClick={() => setOrganizing((v) => !v)}
            aria-pressed={organizing}
            className={toolbarButton}
          >
            {organizing ? (
              <Check size={14} aria-hidden="true" />
            ) : (
              <ArrowUpDown size={14} aria-hidden="true" />
            )}
            {organizing ? "Done" : "Organize"}
          </button>
        </div>
      )}

      {organizing ? (
        <>
          <p className="mb-3 text-sm text-muted">
            Drag the handle or use the arrows to reorder. Your order is saved automatically.
          </p>
          <DraggableList items={items} onReorder={(ids) => dispatch(setOrder(ids))} />
        </>
      ) : (
        <ul className={CARD_GRID}>
          {items.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: (i % 6) * 0.05 }}
            >
              <ContentCard item={item} />
            </motion.li>
          ))}
        </ul>
      )}

      <InfiniteScroll
        hasMore={feed.hasNextPage}
        loading={feed.isFetchingNextPage}
        error={feed.isError}
        onLoadMore={feed.fetchNextPage}
      />
    </>
  );
}