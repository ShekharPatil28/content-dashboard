import { expect, test } from "@playwright/test";
import { heading } from "./helpers";

test("the intro plays on the first visit, then reveals the app", async ({ page }) => {
  // no mockApis here on purpose, so the intro is not skipped
  await page.goto("/");

  const title = page.getByText("CONTENT HUB");
  await expect(title).toBeVisible();
  await expect(title).toBeHidden(); // removed after it slides away

  await expect(heading(page, "Pick your interests")).toBeVisible();
});

test("the intro is skipped once it has been seen in this tab", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("content-hub-intro-seen", "1"));
  await page.goto("/");

  await expect(heading(page, "Pick your interests")).toBeVisible();
  await expect(page.getByText("CONTENT HUB")).toHaveCount(0);
});