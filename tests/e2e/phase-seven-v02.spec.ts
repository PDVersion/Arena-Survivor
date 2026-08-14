import { expect, test } from "@playwright/test";

const compoundPath = "/?representativeLoad=1&closeLoad=1&loadHarness=300&compoundBuild=1&critChance=3.4&pierce=12&attackSpeedBonus=9&worldScenario=all&runDurationMs=1500&noXp=1&noContact=1";

test("critical V0.2 path sustains 300 mixed enemies, reconciles statistics, and restarts repeatedly", async ({ page }) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(compoundPath);
  const initial = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(250);
  await page.keyboard.up("ArrowRight");
  await expect.poll(() => page.evaluate(
    () => window.__ARENA_TEST__?.getSnapshot().load?.spawned,
  ), { timeout: 15_000 }).toBe(300);
  await expect.poll(() => page.evaluate(
    () => window.__ARENA_TEST__?.getSnapshot().statistics?.peakEnemiesAlive,
  ), { timeout: 30_000 }).toBe(300);
  await expect.poll(() => page.evaluate(
    () => window.__ARENA_TEST__?.getSnapshot().effects?.explosionsCommitted,
  ), { timeout: 60_000 }).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(
    () => window.__ARENA_TEST__?.getSnapshot().run?.status,
  ), { timeout: 60_000 }).toBe("complete");

  const terminal = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(terminal?.player?.x).toBeGreaterThan(initial?.player?.x ?? 0);
  expect(terminal?.combat?.rosterHighWater).toMatchObject({
    "enemy.swarm_basic": expect.any(Number),
    "enemy.fast_fragile": expect.any(Number),
    "enemy.slow_durable": expect.any(Number),
    "enemy.death_spawner": expect.any(Number),
  });
  expect(terminal?.elites?.spawned).toBeGreaterThanOrEqual(60);
  expect(terminal?.statistics).toMatchObject({
    peakEnemiesAlive: 300,
    highestChaos: 4.2,
    highestCritChance: 3.4,
    highestCritTier: expect.any(Number),
    totalDamage: expect.any(Number),
  });
  expect(terminal?.statistics?.highestCritTier).toBeGreaterThanOrEqual(3);
  expect(terminal?.statistics?.longestPierceChain).toBeGreaterThan(0);
  expect(terminal?.statistics?.largestKillChain).toBeGreaterThan(0);
  const breakdown = terminal?.statistics?.damageBreakdown;
  const breakdownTotal = breakdown ? Object.values(breakdown).reduce((total, value) => total + value, 0) : 0;
  expect(breakdownTotal).toBe(terminal?.statistics?.totalDamage ?? -1);
  expect(breakdown?.direct).toBeGreaterThan(0);
  expect(breakdown?.criticalBonus).toBeGreaterThan(0);
  expect(breakdown?.remainder).toBe(0);
  expect(terminal?.statistics?.summaryMetrics).toContain("Peak Foes: 300");
  expect(terminal?.statistics?.summaryDamage[0]).toContain("Total Damage:");
  expect(terminal?.feedback?.visualHighWater).toBeLessThanOrEqual(48);
  expect(terminal?.feedback?.voices).toBe(0);
  expect(terminal?.feedback?.activeVisuals).toBe(0);
  expect(terminal?.load?.processedEffects).toBe(300);
  expect(terminal?.load?.eventBacklogHighWater).toBe(300);
  expect(terminal?.load?.gameplayBacklogHighWater).toBeGreaterThanOrEqual(300);
  expect(terminal?.load?.trackedHighWater).toBeLessThanOrEqual(492);
  expect(terminal?.load?.frameSamples).toBeGreaterThan(0);
  expect(terminal?.load?.averageFrameMs).toBeGreaterThan(0);
  expect(terminal?.load?.maxFrameMs).toBeGreaterThan(0);
  expect(terminal?.load?.eventBacklog).toBe(0);
  expect(terminal?.effects?.eventBacklog).toBe(0);
  expect(terminal?.combat?.projectiles).toBe(0);
  expect(errors).toEqual([]);

  const firstGeneration = terminal?.lifecycle?.runGeneration ?? 0;
  await page.locator("canvas").click({ position: { x: 640, y: 637 } });
  await expect.poll(() => page.evaluate(
    () => window.__ARENA_TEST__?.getSnapshot().lifecycle?.runGeneration,
  )).toBe(firstGeneration + 1);
  expect(await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().statistics?.totalDamage)).toBe(0);
  await expect.poll(() => page.evaluate(
    () => window.__ARENA_TEST__?.getSnapshot().run?.status,
  ), { timeout: 60_000 }).toBe("complete");
  await page.keyboard.press("KeyR");
  await expect.poll(() => page.evaluate(
    () => window.__ARENA_TEST__?.getSnapshot().lifecycle?.runGeneration,
  )).toBe(firstGeneration + 2);
});
