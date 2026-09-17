import { expect, test, type Page } from "@playwright/test";
import { activeTheme } from "../../src/game/content/active-theme";

async function elapsedMs(page: Page): Promise<number> {
  return (await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.elapsedMs)) ?? 0;
}

test("half speed advances about one simulated second per two wall-clock seconds", async ({ page }) => {
  await page.goto("/?noContact&noXp");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");

  const before = await elapsedMs(page);
  await page.waitForTimeout(2_000);
  const after = await elapsedMs(page);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());

  // Parallel Chromium workers can clamp RAF after a scheduling stall; keep the
  // lower bound broad while still ruling out the old 1.0 rate.
  expect(after - before).toBeGreaterThan(600);
  expect(after - before).toBeLessThan(1_250);
  expect(snapshot?.pacing?.gameplayRate).toBe(0.5);
  expect(snapshot?.pacing?.expectedRealDurationMs).toBe(
    (snapshot?.run?.durationMs ?? 0) / activeTheme.tuning.pace.gameplayRate,
  );
});

test("pause freezes the half-speed clock and reduced motion preserves the base rate", async ({ page }) => {
  await page.goto("/?noContact&noXp&reducedMotion=1");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");

  const before = await elapsedMs(page);
  await page.waitForTimeout(1_000);
  const after = await elapsedMs(page);
  expect(after - before).toBeGreaterThan(275);
  expect(after - before).toBeLessThan(700);

  await page.keyboard.press("Escape");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("paused");
  const paused = await elapsedMs(page);
  await page.waitForTimeout(500);
  expect(await elapsedMs(page)).toBe(paused);
});
