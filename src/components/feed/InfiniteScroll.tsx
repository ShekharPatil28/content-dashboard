"use client";

import { useEffect, useRef } from "react";
import Spinner from "@/components/ui/Spinner";

interface Props {
  hasMore: boolean;
  loading: boolean;
  error?: boolean;
  onLoadMore: () => void;
}

export default function InfiniteScroll({ hasMore, loading, error, onLoadMore }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    // after an error we wait for the button instead of retrying in a loop
    if (!el || !hasMore || loading || error) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, error, onLoadMore]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-3 py-8">
      {loading && <Spinner />}
      {error && <p className="text-sm text-red-500">Couldn&apos;t load more.</p>}
      {hasMore && !loading && (
        <button
          onClick={onLoadMore}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface"
        >
          {error ? "Retry" : "Load more"}
        </button>
      )}
      {!hasMore && <p className="text-sm text-muted">You&apos;re all caught up</p>}
    </div>
  );
}