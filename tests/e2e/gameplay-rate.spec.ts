import { expect, test, type Page } from "@playwright/test";
import { activeTheme } from "../../src/game/content/active-theme";

async function elapsedMs(page: Page): Promise<number> {
  return (await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.elapsedMs)) ?? 0;
}

const SIMULATION_BUDGET_MS = 90_000;

async function advanceSimulation(page: Page, byMs: number): Promise<number> {
  const from = await elapsedMs(page);
  await expect
    .poll(() => elapsedMs(page), { timeout: SIMULATION_BUDGET_MS })
    .toBeGreaterThan(from + byMs);
  return elapsedMs(page);
}

test("half speed is wired to the advancing browser simulation clock", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/?noContact&noXp");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");

  const before = await elapsedMs(page);
  const after = await advanceSimulation(page, 500);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());

  expect(after - before).toBeGreaterThan(500);
  expect(snapshot?.pacing?.gameplayRate).toBe(0.5);
  expect(snapshot?.pacing?.expectedRealDurationMs).toBe(
    (snapshot?.run?.durationMs ?? 0) / activeTheme.tuning.pace.gameplayRate,
  );
});

test("pause freezes the half-speed clock and reduced motion preserves the base rate", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/?noContact&noXp&reducedMotion=1");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");

  const before = await elapsedMs(page);
  const after = await advanceSimulation(page, 250);
  expect(after - before).toBeGreaterThan(250);
  expect((await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().pacing?.gameplayRate))).toBe(0.5);

  await page.keyboard.press("Escape");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("paused");
  const paused = await elapsedMs(page);
  await page.waitForTimeout(500);
  expect(await elapsedMs(page)).toBe(paused);
});
