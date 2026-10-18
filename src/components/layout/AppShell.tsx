"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/hooks/redux";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { MotionConfig } from "framer-motion";


export default function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const mode = useAppSelector((s) => s.theme.mode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

  return (
    <MotionConfig reducedMotion="user">
    <div className="flex min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setMenuOpen(true)} />
        <main id="main" className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
    </MotionConfig>
  );
}