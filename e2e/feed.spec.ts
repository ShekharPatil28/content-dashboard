import { expect, test } from "@playwright/test";
import { heading, mockApis, seedPreferences, type MockOptions } from "./helpers";

test("shows a mixed feed of news, movies and posts", async ({ page }) => {
  await seedPreferences(page, ["technology"]);
  await mockApis(page);
  await page.goto("/");

  await expect(heading(page, "News 1")).toBeVisible();
  await expect(heading(page, "Movie 1")).toBeVisible();
  await expect(heading(page, "Post 1")).toBeVisible();
  await expect(page.getByText(/all caught up/i)).toBeVisible();
});

test("keeps showing the other sources when one fails", async ({ page }) => {
  await seedPreferences(page, ["technology"]);
  await mockApis(page, { news: "error" });
  await page.goto("/");

  await expect(page.getByText(/some sources couldn't be loaded \(news\)/i)).toBeVisible();
  await expect(heading(page, "Movie 1")).toBeVisible();
  await expect(heading(page, "News 1")).toHaveCount(0);
});

test("shows an error with a working retry when every source fails", async ({ page }) => {
  const options: MockOptions = { news: "error", movies: "error", social: "error" };
  await seedPreferences(page, ["technology"]);
  await mockApis(page, options);
  await page.goto("/");

  await expect(page.getByText("News API is down")).toBeVisible();

  // the APIs "recover", then the user retries
  options.news = "ok";
  options.movies = "ok";
  options.social = "ok";
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(heading(page, "News 1")).toBeVisible();
});

test("favorites survive navigation and a reload", async ({ page }) => {
  await seedPreferences(page, ["technology"]);
  await mockApis(page);
  await page.goto("/");

  await page.getByRole("button", { name: "Add News 1 to favorites" }).click();
  await expect(page.getByRole("button", { name: "Remove News 1 from favorites" })).toBeVisible();

  await page.getByRole("link", { name: "Favorites" }).click();
  await expect(page).toHaveURL(/\/favorites$/);
  await expect(heading(page, "Favorites")).toBeVisible();
  await expect(heading(page, "News 1")).toBeVisible();

  await page.reload();
  await expect(page).toHaveURL(/\/favorites$/);
  await expect(heading(page, "News 1")).toBeVisible();

  await page.getByRole("button", { name: "Remove News 1 from favorites" }).click();
  await expect(heading(page, "No favorites yet")).toBeVisible();
});

test("trending shows all three sections and filters by category", async ({ page }) => {
  await mockApis(page);
  await page.goto("/trending");

  await expect(heading(page, "Trending news")).toBeVisible();
  await expect(heading(page, "Trending movies this week")).toBeVisible();
  await expect(heading(page, "Trending posts")).toBeVisible();
  await expect(heading(page, "Movie 1")).toBeVisible();

  const request = page.waitForRequest(
    (r) => r.url().includes("/api/news") && r.url().includes("category=technology")
  );
  await page.getByRole("button", { name: "Technology" }).click();
  await request;
  await expect(page.getByRole("button", { name: "Technology" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
});