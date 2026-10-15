import { NextResponse } from "next/server";

export const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status });

export const errorResponse = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

// Safe page number: defaults to 1, capped at 500 (TMDB's own limit)
export function getPage(value: string | null) {
  const n = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? Math.min(n, 500) : 1;
}