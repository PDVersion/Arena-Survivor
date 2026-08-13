import { expect, test } from "@playwright/test";

test("enemy roster exposes all four distinct configured roles", async ({ page }) => {
  await page.goto("/?enemyRoster=all");
  await expect.poll(async () => {
    const roster = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.rosterHighWater);
    return roster ? Object.values(roster).filter((count) => count > 0).length : 0;
  }).toBe(4);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.combat?.rosterHighWater).toMatchObject({
    "enemy.swarm_basic": 1,
    "enemy.fast_fragile": 1,
    "enemy.slow_durable": 1,
    "enemy.death_spawner": 1,
  });
});

test("Broodmother queues and eventually spawns exactly five offspring", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?enemyRoster=broodmother");
  await expect.poll(async () => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.offspringSpawned), { timeout: 25_000 }).toBe(5);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.combat?.offspringQueued).toBe(5);
  expect(snapshot?.combat?.rosterHighWater["enemy.death_spawner"]).toBe(1);
  expect(snapshot?.combat?.rosterHighWater["enemy.fast_fragile"]).toBe(5);
  expect(snapshot?.run?.liveEnemies).toBeLessThanOrEqual(snapshot?.combat?.enemyCap ?? 0);
  expect(errors).toEqual([]);
});
