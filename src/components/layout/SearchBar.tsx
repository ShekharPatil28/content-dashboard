"use client";

import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="relative w-full max-w-md"
    >
      <label htmlFor="search" className="sr-only">Search content</label>
      <Search
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        id="search"
        type="search"
        placeholder="Search news, movies, posts..."
        className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
    </form>
  );
}