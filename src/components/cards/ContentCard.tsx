"use client";

import { useState } from "react";
import { Film, Heart, MessageCircle, Newspaper } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { toggleFavorite } from "@/store/slices/favoritesSlice";
import type { ContentItem } from "@/types/content";

const META = {
  news: { label: "News", icon: Newspaper, cta: "Read More" },
  movie: { label: "Movie", icon: Film, cta: "View Movie" },
  social: { label: "Post", icon: MessageCircle, cta: null }, // mock posts have no real link
} as const;

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function ContentCard({ item }: { item: ContentItem }) {
  const dispatch = useAppDispatch();
  const isFavorite = useAppSelector((s) => s.favorites.some((f) => f.id === item.id));
  const [imageFailed, setImageFailed] = useState(false);

  const { label, icon: Icon, cta } = META[item.type];
  const showImage = item.image && !imageFailed;
  const hasLink = item.url.startsWith("http");
  const date = formatDate(item.publishedAt);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-video bg-background">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image!}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <Icon size={36} aria-hidden="true" />
          </div>
        )}

        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-surface/90 px-2 py-1 text-xs font-medium">
          <Icon size={12} aria-hidden="true" />
          {label}
        </span>

        <button
          onClick={() => dispatch(toggleFavorite(item))}
          aria-pressed={isFavorite}
          aria-label={
            isFavorite
              ? `Remove ${item.title} from favorites`
              : `Add ${item.title} to favorites`
          }
          className="absolute right-3 top-3 rounded-full bg-surface/90 p-2 hover:bg-surface"
        >
          <Heart size={16} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="line-clamp-2 font-semibold leading-snug">{item.title}</h2>
        {item.description && (
          <p className="line-clamp-3 text-sm text-muted">{item.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="truncate text-xs text-muted">
            {item.source}
            {date && ` · ${date}`}
          </span>
          {cta && hasLink && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
            >
              {cta}
              <span className="sr-only"> about {item.title}</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}