import type { NextRequest } from "next/server";
import { CATEGORIES } from "@/lib/constants";
import { errorResponse, getPage, json } from "@/lib/api-helpers";
import { normalizeNews, type NewsApiArticle } from "@/lib/normalizers";

const PAGE_SIZE = 10;
const MAX_RESULTS = 100; // NewsAPI free plan only serves the first 100 results

export async function GET(request: NextRequest) {
  const key = process.env.NEWS_API_KEY;
  if (!key) return errorResponse("NEWS_API_KEY is not configured", 500);

  const { searchParams } = request.nextUrl;
  const page = getPage(searchParams.get("page"));
  const q = searchParams.get("q")?.trim();
  const category = CATEGORIES.find((c) => c.id === searchParams.get("category"));

  // past the free-plan limit: return an empty page instead of an upstream error
  if (page * PAGE_SIZE > MAX_RESULTS) return json({ items: [], page, hasMore: false });

  const params = new URLSearchParams({ pageSize: String(PAGE_SIZE), page: String(page) });
  let endpoint = "top-headlines";
  if (q) {
    endpoint = "everything";
    params.set("q", q);
    params.set("language", "en");
    params.set("sortBy", "publishedAt");
  } else {
    params.set("country", "us");
    if (category) params.set("category", category.newsApi);
  }

  try {
    const res = await fetch(`https://newsapi.org/v2/${endpoint}?${params}`, {
      headers: { "X-Api-Key": key },
      next: { revalidate: 300 }, // cache identical requests for 5 minutes
    });
    const data = await res.json();
    if (!res.ok) {
      return errorResponse(data.message ?? "News API request failed", res.status === 429 ? 429 : 502);
    }
    const items = normalizeNews((data.articles ?? []) as NewsApiArticle[], category?.id);
    const total = Math.min(data.totalResults ?? 0, MAX_RESULTS);
    return json({ items, page, hasMore: page * PAGE_SIZE < total });
  } catch {
    return errorResponse("Could not reach the News API", 502);
  }
}   