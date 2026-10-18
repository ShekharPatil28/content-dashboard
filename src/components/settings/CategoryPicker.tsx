"use client";

import { Check } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { CATEGORIES } from "@/lib/constants";
import { toggleCategory } from "@/store/slices/preferencesSlice";

export default function CategoryPicker() {
  const selected = useAppSelector((s) => s.preferences.categories);
  const dispatch = useAppDispatch();

  return (
    <fieldset>
      <legend className="text-lg font-semibold">Your interests</legend>
      <p className="mt-1 text-sm text-muted">
        Pick the categories you want in your feed. Changes are saved automatically.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map(({ id, label }) => {
          const checked = selected.includes(id);
          return (
            <label
              key={id}
              className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-primary ${
                checked
                  ? "border-primary bg-primary/10"
                  : "border-border bg-surface hover:bg-background"
              }`}
            >
              {label}
              <input
                type="checkbox"
                checked={checked}
                onChange={() => dispatch(toggleCategory(id))}
                className="sr-only"
              />
              {checked && <Check size={18} className="text-primary" aria-hidden="true" />}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}