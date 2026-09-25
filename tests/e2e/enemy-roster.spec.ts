import { expect, test } from "@playwright/test";

test("enemy roster exposes all five distinct configured roles", async ({ page }) => {
  await page.goto("/?enemyRoster=all");
  await expect.poll(async () => {
    const roster = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.rosterHighWater);
    return roster ? Object.values(roster).filter((count) => count > 0).length : 0;
  }).toBe(5);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.combat?.rosterHighWater).toMatchObject({
    "enemy.swarm_basic": 1,
    "enemy.fast_fragile": 1,
    "enemy.slow_durable": 1,
    "enemy.death_spawner": 1,
    "enemy.stationary_fragment": 1,
  });
});

test("Bagged Waste queues and eventually spawns its finite five-child material mix", async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  // The subject is retained death-spawn work, not the time taken for a slow
  // Broodmother to cross the off-screen spawn ring on a throttled CI runner.
  await page.goto("/?enemyRoster=broodmother&spawnRadius=72&noContact&noXp&noHazards");
  await expect.poll(async () => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.offspringSpawned), { timeout: 90_000 }).toBe(5);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.combat?.offspringQueued).toBe(5);
  expect(snapshot?.combat?.rosterHighWater["enemy.death_spawner"]).toBe(1);
  expect(snapshot?.combat?.rosterHighWater["enemy.swarm_basic"]).toBe(2);
  expect(snapshot?.combat?.rosterHighWater["enemy.fast_fragile"]).toBe(2);
  expect(snapshot?.combat?.rosterHighWater["enemy.slow_durable"]).toBe(1);
  expect(snapshot?.run?.liveEnemies).toBeLessThanOrEqual(snapshot?.combat?.enemyCap ?? 0);
  expect(errors).toEqual([]);
});
