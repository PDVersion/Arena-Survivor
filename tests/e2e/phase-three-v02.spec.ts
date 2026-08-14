import { expect, test } from "@playwright/test";

test("overcrit resolves guaranteed tier three with distinct telemetry", async ({ page }) => {
  await page.goto("/?critChance=3&loadHarness=40&noXp=1");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.highestCritTier), { timeout: 15_000 }).toBe(3);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.player?.critChance).toBe(3);
  expect(snapshot?.combat?.criticalShots).toBeGreaterThan(0);
});

test("piercing momentum increases one projectile across unique hits", async ({ page }) => {
  await page.goto("/?piercingMomentum=1&pierce=12&loadHarness=80&noXp=1");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.longestPierceChain), { timeout: 25_000 }).toBeGreaterThanOrEqual(2);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.progression?.activeSkillIds).toContain("skill.piercing_momentum");
  expect(snapshot?.combat?.longestPierceChain).toBeGreaterThanOrEqual(2);
});
