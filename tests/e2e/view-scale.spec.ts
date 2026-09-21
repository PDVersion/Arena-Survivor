import { expect, test } from "@playwright/test";
import { activeTheme } from "../../src/game/content/active-theme";

test("the run camera crops the world at two-times zoom without resizing actors", async ({ page }) => {
  await page.goto("/?noContact&noXp");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");

  const state = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(state?.view).toMatchObject({
    logicalWidth: 1600,
    logicalHeight: 900,
    worldWidth: 800,
    worldHeight: 450,
    zoom: activeTheme.tuning.view.zoom,
  });
  expect(state?.player?.radius).toBe(18);
  expect(state?.view?.spawnRadius).toBeGreaterThan(
    Math.hypot(state?.view?.worldWidth ?? 0, state?.view?.worldHeight ?? 0) / 2,
  );
  expect(state?.pacing?.spawnsInsideView).toBe(0);
});
