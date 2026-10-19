import { expect, test } from "@playwright/test";
import { heading, mockApis } from "./helpers";

test("asks for interests first, then personalizes the feed", async ({ page }) => {
  await mockApis(page);
  await page.goto("/");
  await expect(heading(page, "Pick your interests")).toBeVisible();

  await page.getByRole("link", { name: "Open settings" }).click();
  await page.locator("label", { hasText: "Technology" }).click();
  await expect(page.getByLabel("Technology")).toBeChecked();

  await page.getByRole("link", { name: "Feed" }).click();
  await expect(heading(page, "News 1")).toBeVisible();

  // the choice is remembered
  await page.reload();
  await expect(heading(page, "News 1")).toBeVisible();
  await page.goto("/settings");
  await expect(page.getByLabel("Technology")).toBeChecked();
});

test("dark mode persists across reloads", async ({ page }) => {
  await mockApis(page);
  await page.goto("/");

  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);

  await page.reload();
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  await expect(page.getByRole("button", { name: "Switch to light mode" })).toBeVisible();
});