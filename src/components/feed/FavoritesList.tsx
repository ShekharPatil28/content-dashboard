"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import ContentCard from "@/components/cards/ContentCard";
import EmptyState from "@/components/ui/EmptyState";
import { useAppSelector } from "@/hooks/redux";
import { CARD_GRID } from "@/lib/constants";

export default function FavoritesList() {
  const favorites = useAppSelector((s) => s.favorites);

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="No favorites yet"
        description="Tap the heart on any card and it will be saved here."
        action={
          <Link
            href="/"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Browse your feed
          </Link>
        }
      />
    );
  }

  return (
    <ul className={CARD_GRID}>
      {favorites.map((item) => (
        <li key={item.id}>
          <ContentCard item={item} />
        </li>
      ))}
    </ul>
  );
}