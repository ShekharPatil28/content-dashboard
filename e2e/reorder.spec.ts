import { expect, test, type Page } from "@playwright/test";
import { mockApis, seedPreferences } from "./helpers";

const handles = (page: Page) => page.getByRole("button", { name: /^Drag to reorder/ });
const labels = (page: Page) =>
  handles(page).evaluateAll((els) => els.map((el) => el.getAttribute("aria-label")));

async function openOrganize(page: Page) {
  await seedPreferences(page, ["technology"]);
  await mockApis(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Organize" }).click();
}

test("drag a card to a new position and keep the order after a reload", async ({ page }) => {
  await openOrganize(page);

  const before = await labels(page);
  expect(before.length).toBeGreaterThan(2);

  const first = (await handles(page).nth(0).boundingBox())!;
  const second = (await handles(page).nth(1).boundingBox())!;
  const startX = first.x + first.width / 2;
  const startY = first.y + first.height / 2;

  // a real mouse drag: press the first handle, pull past the second row, release
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX, startY + 10, { steps: 5 }); // get past the drag threshold
  await page.mouse.move(startX, second.y + second.height / 2 + 20, { steps: 20 });
  await page.mouse.up();

  const swapped = [before[1], before[0], ...before.slice(2)];
  await expect.poll(() => labels(page)).toEqual(swapped);

  await page.getByRole("button", { name: "Done" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Organize" }).click();
  await expect.poll(() => labels(page)).toEqual(swapped);
});

test("reorder with the arrow buttons instead of dragging", async ({ page }) => {
  await openOrganize(page);

  const before = await labels(page);
  const firstTitle = before[0]!.replace("Drag to reorder ", "");

  await page.getByRole("button", { name: `Move ${firstTitle} down` }).click();
  await expect.poll(() => labels(page)).toEqual([before[1], before[0], ...before.slice(2)]);
});