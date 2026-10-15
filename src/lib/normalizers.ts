import type { ContentItem } from "@/types/content";

const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

// Small string hash so ids are short and stable for the same URL
function hash(str: string) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
  return (h >>> 0).toString(36);
}

export interface NewsApiArticle {
  source?: { name?: string | null };
  title: string | null;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string | null;
}

export function normalizeNews(articles: NewsApiArticle[], category?: string): ContentItem[] {
  const seen = new Set<string>();
  const items: ContentItem[] = [];
  for (const a of articles) {
    // skip broken, removed and duplicate articles
    if (!a.url || !a.title || a.title === "[Removed]" || seen.has(a.url)) continue;
    seen.add(a.url);
    items.push({
      id: `news-${hash(a.url)}`,
      type: "news",
      title: a.title,
      description: a.description ?? "",
      image: a.urlToImage,
      url: a.url,
      source: a.source?.name ?? "Unknown",
      category,
      publishedAt: a.publishedAt ?? undefined,
    });
  }
  return items;
}

export interface TmdbMovie {
  id: number;
  title: string;
  overview?: string;
  poster_path: string | null;
  release_date?: string;
}

export function normalizeMovies(movies: TmdbMovie[]): ContentItem[] {
  return movies
    .filter((m) => m.id && m.title)
    .map((m) => ({
      id: `movie-${m.id}`,
      type: "movie" as const,
      title: m.title,
      description: m.overview ?? "",
      image: m.poster_path ? `${TMDB_IMG}${m.poster_path}` : null,
      url: `https://www.themoviedb.org/movie/${m.id}`,
      source: "TMDB",
      category: "entertainment",
      publishedAt: m.release_date || undefined,
    }));
}

export interface MockPost {
  id: string;
  author: string;
  handle: string;
  text: string;
  hashtags: string[];
  image: string | null;
  createdAt: string;
}

export function normalizeSocial(posts: MockPost[]): ContentItem[] {
  return posts.map((p) => ({
    id: `social-${p.id}`,
    type: "social" as const,
    title: p.author,
    description: p.text,
    image: p.image,
    url: "#", // mock posts have no real page to link to
    source: `@${p.handle}`,
    category: p.hashtags[0],
    publishedAt: p.createdAt,
  }));
}