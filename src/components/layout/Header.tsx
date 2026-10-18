"use client";

import Link from "next/link";
import { Menu, Settings, User } from "lucide-react";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";
import { Suspense } from "react";


export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="rounded-lg p-2 hover:bg-background md:hidden"
      >
        <Menu size={20} />
      </button>

      <SearchBar />

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <Link href="/settings" aria-label="Settings" className="rounded-lg p-2 hover:bg-background">
          <Settings size={20} />
        </Link>
        <div
          aria-label="Account"
          className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          <User size={18} />
        </div>

        <Suspense fallback={null}>
        <SearchBar />
      </Suspense>
      </div>
    </header>
  );
}