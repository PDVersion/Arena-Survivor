import { expect, test } from "@playwright/test";

test("elite capability applies to every enemy role and survives duplication", async ({ page }) => {
  await page.goto("/?forceElite=1&enemyRoster=all&worldScenario=all&noXp=1");
  await expect.poll(
    () => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().elites?.spawned),
    { timeout: 15_000 },
  ).toBeGreaterThanOrEqual(8);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.elites?.byRole).toMatchObject({
    "enemy.swarm_basic": expect.any(Number),
    "enemy.fast_fragile": expect.any(Number),
    "enemy.slow_durable": expect.any(Number),
    "enemy.death_spawner": expect.any(Number),
  });
  for (const count of Object.values(snapshot?.elites?.byRole ?? {})) expect(count).toBeGreaterThanOrEqual(2);
  expect(snapshot?.world?.duplicatedEnemiesSpawned).toBeGreaterThanOrEqual(4);
});

test("feedback unlocks after interaction, throttles dense combat, and supports mute", async ({ page }) => {
  await page.goto("/?forceElite=1&loadHarness=80&critChance=3&attackSpeedBonus=9&noXp=1");
  await expect.poll(() => page.evaluate(
    () => window.__ARENA_TEST__?.getSnapshot().load?.spawned,
  ), { timeout: 30_000 }).toBe(80);
  await expect.poll(() => page.evaluate(
    () => window.__ARENA_TEST__?.getSnapshot().feedback?.visualHighWater,
  ), { timeout: 15_000 }).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().feedback?.audioUnlocked)).toBe(false);
  await page.keyboard.press("ArrowLeft");
  await expect.poll(() => page.evaluate(
    () => window.__ARENA_TEST__?.getSnapshot().feedback?.audioEmitted,
  ), { timeout: 15_000 }).toBeGreaterThan(0);
  await page.keyboard.press("KeyM");
  await expect.poll(() => page.evaluate(
    () => window.__ARENA_TEST__?.getSnapshot().feedback?.muted,
  )).toBe(true);
  const feedback = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().feedback);
  expect(feedback?.visualHighWater).toBeLessThanOrEqual(48);
  expect(feedback?.voices).toBeLessThanOrEqual(8);
});

test("reduced-motion feedback remains bounded without changing elite simulation", async ({ page }) => {
  await page.goto("/?forceElite=1&enemyRoster=all&reducedMotion=1&noXp=1");
  await expect.poll(() => page.evaluate(
    () => window.__ARENA_TEST__?.getSnapshot().elites?.spawned,
  )).toBe(4);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.feedback?.reducedMotion).toBe(true);
  expect(snapshot?.feedback?.visualHighWater).toBeLessThanOrEqual(48);
});
