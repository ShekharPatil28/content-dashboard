import { expect, test } from "@playwright/test";
import { heading, mockApis, seedPreferences } from "./helpers";

const searchBox = (page: import("@playwright/test").Page) =>
  page.getByRole("searchbox", { name: "Search content" });

test("debounced search shows results from every source", async ({ page }) => {
  const queries: (string | null)[] = [];
  await seedPreferences(page, ["technology"]);
  await mockApis(page, { onNewsQuery: (q) => queries.push(q) });
  await page.goto("/");

  await searchBox(page).pressSequentially("batman", { delay: 60 });

  await expect(page).toHaveURL(/\/search\?q=batman$/);
  await expect(heading(page, "News result for batman 1")).toBeVisible();
  await expect(heading(page, "Movie result for batman 1")).toBeVisible();
  await expect(heading(page, "Post result for batman 1")).toBeVisible();

  // six keystrokes, but only the final word was ever searched
  expect([...new Set(queries.filter(Boolean))]).toEqual(["batman"]);
});

test("shows a friendly message when nothing matches", async ({ page }) => {
  await mockApis(page, { emptyQuery: "zzzz" });
  await page.goto("/");

  await searchBox(page).fill("zzzz");
  await page.keyboard.press("Enter");

  await expect(heading(page, "No results")).toBeVisible();
});

test("opens a shared search link with the box pre-filled", async ({ page }) => {
  await mockApis(page);
  await page.goto("/search?q=dune");

  await expect(searchBox(page)).toHaveValue("dune");
  await expect(heading(page, "News result for dune 1")).toBeVisible();
});