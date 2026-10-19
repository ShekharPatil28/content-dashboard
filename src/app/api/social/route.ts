import type { NextRequest } from "next/server";
import { getPage, json } from "@/lib/api-helpers";
import { MOCK_POSTS } from "@/lib/mockSocial";
import { normalizeSocial, type MockPost } from "@/lib/normalizers";


const PAGE_SIZE = 6;
const ROTATE_EVERY_MS = 5 * 60 * 1000; // a fresh mix every 5 minutes

function livePosts(): MockPost[] {
  const now = Date.now();
  const shift = Math.floor(now / ROTATE_EVERY_MS) % MOCK_POSTS.length;
  return [...MOCK_POSTS.slice(shift), ...MOCK_POSTS.slice(0, shift)].map((post, i) => ({
    ...post,
    createdAt: new Date(now - i * 20 * 60_000).toISOString(),
  }));
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = getPage(searchParams.get("page"));
  const hashtags = (searchParams.get("hashtag") ?? "")
    .split(",")
    .map((h) => h.replace(/^#/, "").trim().toLowerCase())
    .filter(Boolean);  const q = searchParams.get("q")?.trim().toLowerCase();

  let posts = livePosts();
  if (hashtags.length) posts = posts.filter((p) => p.hashtags.some((h) => hashtags.includes(h)));  if (q) {
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