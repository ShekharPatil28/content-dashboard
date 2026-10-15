"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Heart, Home, Settings, X } from "lucide-react";

const links = [
  { href: "/", label: "Feed", icon: Home },
  { href: "/trending", label: "Trending", icon: Flame },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-surface p-4 transition-transform md:static md:shrink-0 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <span className="text-lg font-bold">Dashboard</span>
          <button onClick={onClose} aria-label="Close menu" className="md:hidden">
            <X size={20} />
          </button>
        </div>
        <nav aria-label="Main">
          <ul className="space-y-1">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted hover:bg-background hover:text-foreground"
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}