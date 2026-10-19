"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MotionConfig } from "framer-motion";
import { useAppSelector } from "@/hooks/redux";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const mode = useAppSelector((s) => s.theme.mode);
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

  // the content now scrolls inside <main>, so start every page at the top
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 flex overflow-hidden bg-surface">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header onMenuClick={() => setMenuOpen(true)} />
          <main
            ref={mainRef}
            id="main"
            className="flex-1 overflow-y-auto overscroll-contain bg-background p-4 md:rounded-tl-3xl md:p-6"
          >
            {children}
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}