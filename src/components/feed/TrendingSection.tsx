import CardSkeleton from "@/components/cards/CardSkeleton";
import ContentCard from "@/components/cards/ContentCard";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { CARD_GRID } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import type { ContentItem } from "@/types/content";
import { TrendingUp } from "lucide-react";

interface Props {
  title: string;
  items: ContentItem[];
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => void;
}

export default function TrendingSection({ title, items, isLoading, isError, error, onRetry }: Props) {
  return (
    <section aria-label={title} className="mb-10">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {isLoading ? (
        <div className={CARD_GRID} role="status" aria-label={`Loading ${title}`}>
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={onRetry} />
      ) : items.length === 0 ? (
        <EmptyState icon={TrendingUp} title="Nothing trending" description="Check back in a bit." />
      ) : (
        <ul className={CARD_GRID}>
          {items.map((item) => (
            <li key={item.id}>
              <ContentCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}