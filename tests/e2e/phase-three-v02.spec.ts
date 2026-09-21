import { expect, test } from "@playwright/test";

test("overcrit resolves guaranteed tier three with distinct telemetry", async ({ page }) => {
  await page.goto("/?critChance=3&loadHarness=40&closeLoad=1&noXp=1");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.highestCritTier), { timeout: 15_000 }).toBe(3);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.player?.critChance).toBe(3);
  expect(snapshot?.combat?.criticalShots).toBeGreaterThan(0);
});

test("parked projectile hooks cannot turn the eco grabber into a projectile", async ({ page }) => {
  await page.goto("/?piercingMomentum=1&pierce=12&loadHarness=80&closeLoad=1&noXp=1");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.meleeHits), { timeout: 25_000 }).toBeGreaterThanOrEqual(2);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.progression?.skillLevels?.["skill.piercing_momentum"] ?? 0).toBeGreaterThan(0);
  expect(snapshot?.combat?.deliveryKind).toBe("melee");
  expect(snapshot?.combat?.projectiles).toBe(0);
  expect(snapshot?.combat?.longestPierceChain).toBe(0);
});
