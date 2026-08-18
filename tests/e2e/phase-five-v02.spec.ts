import { expect, test } from "@playwright/test";

test("Chaos resolves two Multiplicity shrines through one world model", async ({ page }) => {
  await page.goto("/?shrineLayout=adjacent&worldScenario=multiplicity2&enemyRoster=all&noXp=1");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().world?.activations["shrine.multiplicity"])).toBe(2);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.world).toMatchObject({
    chaos: 2.4,
    enemySpawnMultiplier: 5.4,
    xpMultiplier: 3.0375,
  });
  expect(snapshot?.shrine?.instances.filter(({ id, activated }) => id === "shrine.multiplicity" && activated)).toHaveLength(2);
});

test("all shrine roles activate exactly once and Duplication retains every copy", async ({ page }) => {
  await page.goto("/?shrineLayout=adjacent&worldScenario=all&enemyRoster=all&noXp=1");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().world?.duplicatedEnemiesSpawned), { timeout: 15_000 }).toBe(4);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.world?.activations).toMatchObject({
    "shrine.spawn_surge": 1,
    "shrine.greed": 1,
    "shrine.multiplicity": 2,
    "shrine.duplication": 1,
  });
  expect(snapshot?.world).toMatchObject({ chaos: 4.2, duplicatedEnemiesQueued: 4, duplicatedEnemiesSpawned: 4 });
  expect(snapshot?.shrine?.instances.every(({ activated }) => activated)).toBe(true);
  expect(snapshot?.run?.liveEnemies).toBeLessThanOrEqual(snapshot?.combat?.enemyCap ?? 0);
});

test("world multipliers restart to a clean 1.0x state", async ({ page }) => {
  await page.goto("/?shrineLayout=adjacent&worldScenario=multiplicity2&enemyRoster=all&runDurationMs=900&noXp=1");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().world?.chaos)).toBe(2.4);
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), { timeout: 15_000 }).toBe("complete");
  await page.keyboard.press("r");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().lifecycle?.runGeneration)).toBeGreaterThan(1);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.world).toMatchObject({ chaos: 1, enemySpawnMultiplier: 1, xpMultiplier: 1, activations: {} });
});
