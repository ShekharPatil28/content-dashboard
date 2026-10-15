export type ContentType = "news" | "movie" | "social";

export interface ContentItem {
  id: string;            // prefixed, e.g. "news-abc123", so ids never collide across sources
  type: ContentType;
  title: string;
  description: string;
  image: string | null;
  url: string;
  source: string;        // "BBC News", "TMDB", "@username"
  category?: string;
  publishedAt?: string;
}

export interface PagedResponse {
  items: ContentItem[];
  page: number;
  hasMore: boolean;
}