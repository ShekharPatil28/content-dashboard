import type { MockPost } from "./normalizers";

const SEED: Record<string, string[]> = {
  technology: [
    "Just shipped a side project with Next.js and RTK Query. The caching alone is worth it.",
    "Hot take: good types save more time than good tests. Why not both?",
    "Tried a new open-source LLM locally today. Faster than I expected.",
  ],
  sports: [
    "What a final over! That chase had everything.",
    "Early morning run done. Consistency beats intensity every time.",
    "Transfer window chaos is back and I'm here for it.",
  ],
  finance: [
    "Index funds and patience. Boring advice, but it keeps working.",
    "Reminder: track your monthly expenses before you try to invest more.",
    "Rate decisions are coming up. Markets are jumpy.",
  ],
  entertainment: [
    "Finally watched the movie everyone's been talking about. Worth the hype.",
    "That season finale was unreal. No spoilers, just wow.",
    "Soundtrack on repeat all week.",
  ],
  health: [
    "Ten minutes of stretching every morning changed how my back feels.",
    "Sleep is the most underrated productivity tool.",
    "Meal prepping on Sundays keeps the week simple.",
  ],
  science: [
    "New telescope images are mind-blowing. The universe is huge.",
    "Fascinating paper on how plants communicate through roots.",
    "Space missions this year have been wild.",
  ],
};

const AUTHORS = [
  ["Aarav Mehta", "aaravm"],
  ["Priya Nair", "priyanair"],
  ["Dev Sharma", "devsharma"],
  ["Sara Khan", "sarakhan"],
  ["Liam Brooks", "liambrooks"],
  ["Mei Tanaka", "meitanaka"],
];

const BASE_TIME = Date.parse("2026-01-01T12:00:00Z");
const categories = Object.keys(SEED);

// Interleaved across categories, newest first
export const MOCK_POSTS: MockPost[] = [0, 1, 2].flatMap((round) =>
  categories.map((cat, c) => {
    const i = round * categories.length + c;
    const [author, handle] = AUTHORS[i % AUTHORS.length];
    return {
      id: String(i + 1),
      author,
      handle,
      text: SEED[cat][round],
      hashtags: [cat],
      image: `https://picsum.photos/seed/post${i + 1}/600/400`,
      createdAt: new Date(BASE_TIME - i * 3600_000).toISOString(),
    };
  })
);