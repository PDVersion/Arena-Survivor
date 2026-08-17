import { expect, test } from "@playwright/test";
import { activeTheme } from "../../src/game/content/active-theme";

test("boots a themed arena and resizes its single canvas", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/");
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.getByText("Arena Survivor")).toBeHidden();

  await expect
    .poll(() =>
      page.evaluate(() => window.__ARENA_TEST__?.getSnapshot()),
    )
    // Resolved from the facade rather than a literal, so swapping the
    // production pack stays a one-line change in `active-theme.ts`.
    .toMatchObject({ status: "ready", scene: "run", themeId: activeTheme.id });

  const wide = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());

  await page.setViewportSize({ width: 900, height: 600 });
  // The logical view is fixed and letterboxed: a smaller window must render the
  // same world area at a smaller scale, never a different amount of world.
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().view?.displayWidth))
    .toBeLessThanOrEqual(900);

  const narrow = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(narrow?.canvas).toEqual(wide?.canvas);
  expect(narrow?.view?.worldWidth).toBe(wide?.view?.worldWidth);
  expect(narrow?.view?.worldHeight).toBe(wide?.view?.worldHeight);
  expect(narrow?.view?.displayHeight).toBeLessThanOrEqual(600);

  expect(consoleErrors).toEqual([]);
});
