import type { NextRequest } from "next/server";
import { errorResponse, getPage, json } from "@/lib/api-helpers";
import { normalizeMovies, type TmdbMovie } from "@/lib/normalizers";

export async function GET(request: NextRequest) {
  const key = process.env.TMDB_API_KEY;
  if (!key) return errorResponse("TMDB_API_KEY is not configured", 500);

  const { searchParams } = request.nextUrl;
  const page = getPage(searchParams.get("page"));
  const q = searchParams.get("q")?.trim();
  const genres = searchParams.get("genres");

  const params = new URLSearchParams({
    api_key: key,
    page: String(page),
    language: "en-US",
    include_adult: "false",
  });

  let endpoint = "discover/movie";
  if (q) {
    endpoint = "search/movie";
    params.set("query", q);
  } else {
    params.set("sort_by", "popularity.desc");
    // only digits, commas and pipes allowed (genre ids)
    if (genres && /^[\d,|]+$/.test(genres)) params.set("with_genres", genres);
  }

  try {
    const res = await fetch(`https://api.themoviedb.org/3/${endpoint}?${params}`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();
    if (!res.ok) {
      return errorResponse(data.status_message ?? "Movie API request failed", res.status === 429 ? 429 : 502);
    }
    const items = normalizeMovies((data.results ?? []) as TmdbMovie[]);
    const totalPages = Math.min(data.total_pages ?? 0, 500);
    return json({ items, page, hasMore: page < totalPages });
  } catch {
    return errorResponse("Could not reach the movie API", 502);
  }
}