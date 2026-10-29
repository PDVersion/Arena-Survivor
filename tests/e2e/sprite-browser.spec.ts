import { activeTheme } from "../../src/game/content/active-theme";
import { expect, test } from "@playwright/test";

test("sprite browser freezes every frame, compares the set, filters and retains reviews", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/sprite-browser.html");
  await expect(page.locator(".card")).toHaveCount(Object.keys(activeTheme.tokens.sprites ?? {}).length);
  await page.locator('[data-id="character.starter"]').click();
  await expect(page.locator(".strip button")).toHaveCount(8);
  await page.getByRole("button", { name: "Frame 5", exact: true }).click();
  await expect(page.locator("#selected-pose")).toHaveAttribute("data-frame", "5");
  await page.waitForTimeout(200);
  await expect(page.locator("#selected-pose")).toHaveAttribute("data-frame", "5");
  await page.getByRole("button", { name: "Next frame" }).click();
  await expect(page.locator("#selected-pose")).toHaveAttribute("data-frame", "6");
  await page.getByLabel("Assessment").selectOption("bad");
  await page.getByLabel("Review notes").fill("Check hit pose artifacts");
  await page.getByLabel("Review notes").blur();
  await page.locator("#filter").selectOption("bad");
  await expect(page.locator(".card")).toHaveCount(1);
  await page.reload();
  await page.locator('[data-id="character.starter"]').click();
  await expect(page.getByLabel("Assessment")).toHaveValue("bad");
  await expect(page.getByLabel("Review notes")).toHaveValue("Check hit pose artifacts");
  await page.locator("#search").fill("Glass Shards");
  await expect(page.locator(".card")).toHaveCount(1);
  await page.locator(".card").click();
  await expect(page.locator("#selected-pose")).toHaveAttribute("data-loaded", "true");
  await expect(page.locator("#frame-caption")).toContainText("Frame 0");
  expect(errors).toEqual([]);
});

test("sprite browser exposes fallbacks and exports review data", async ({ page }) => {
  await page.goto("/sprite-browser.html");
  await page.locator("#art").selectOption("fallback");
  await expect(page.locator(".card")).toHaveCount(0);
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export reviews" }).click();
  expect((await downloaded).suggestedFilename()).toBe("arena-sprite-reviews.json");
  await page.locator("#theme").selectOption("knight_magic");
  await expect(page.locator(".card").first()).toContainText("Primitive fallback");
});

test("sprite browser links to the architecture atlas and back", async ({ page }) => {
  await page.goto("/sprite-browser.html");
  await page.getByRole("link", { name: "Architecture atlas", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Architecture atlas", exact: true })).toBeVisible();
  await expect(page.locator("#snapshot")).toContainText("P1 verified");
  await page.getByRole("link", { name: "Sprite browser ↗", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Sprite browser", exact: true })).toBeVisible();
});
