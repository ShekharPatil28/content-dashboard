"use client";

import { Moon, Sun } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { toggleTheme } from "@/store/slices/themeSlice";

export default function ThemeToggle() {
  const mode = useAppSelector((s) => s.theme.mode);
  const dispatch = useAppDispatch();

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
      className="rounded-lg p-2 hover:bg-background"
    >
      {mode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}