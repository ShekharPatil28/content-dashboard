import type { NextRequest } from "next/server";
import { getPage, json } from "@/lib/api-helpers";
import { MOCK_POSTS } from "@/lib/mockSocial";
import { normalizeSocial } from "@/lib/normalizers";

const PAGE_SIZE = 6;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = getPage(searchParams.get("page"));
  const hashtag = searchParams.get("hashtag")?.replace(/^#/, "").toLowerCase();
  const q = searchParams.get("q")?.trim().toLowerCase();

  let posts = MOCK_POSTS;
  if (hashtag) posts = posts.filter((p) => p.hashtags.includes(hashtag));
  if (q) {
    posts = posts.filter(
      (p) => p.text.toLowerCase().includes(q) || p.author.toLowerCase().includes(q)
    );
  }

  const start = (page - 1) * PAGE_SIZE;
  return json({
    items: normalizeSocial(posts.slice(start, start + PAGE_SIZE)),
    page,
    hasMore: start + PAGE_SIZE < posts.length,
  });
}