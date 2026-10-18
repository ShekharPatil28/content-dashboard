"use client";

import Link from "next/link";
import { Newspaper, SlidersHorizontal } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { useAppSelector } from "@/hooks/redux";
import { useInfiniteFeed } from "@/hooks/useInfiniteFeed";
import FeedView from "./FeedView";

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

  return (
    <FeedView
      feed={feed}
      sortable
      empty={{
        icon: Newspaper,
        title: "Nothing to show yet",
        description: "We couldn't find content for your categories. Try adding more in Settings.",
      }}
    />
  );
}