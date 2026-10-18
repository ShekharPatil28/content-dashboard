"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  const navigate = (raw: string) => {
    const term = raw.trim();
    const url = term ? `/search?q=${encodeURIComponent(term)}` : "/search";
    if (pathname === "/search") router.replace(url); // don't pile up history while typing
    else if (term) router.push(url);
  };
  const debouncedNavigate = useDebouncedCallback(navigate, 400);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        navigate(value); // Enter searches immediately
      }}
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
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          debouncedNavigate(e.target.value);
        }}
        placeholder="Search news, movies, posts..."
        className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
    </form>
  );
}