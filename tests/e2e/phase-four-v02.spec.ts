import { expect, test } from "@playwright/test";

test("explosion, Fracture, Bloodlust, and chain reaction compose iteratively", async ({ page }) => {
  test.setTimeout(50_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?interactions=all&critChance=3&attackSpeedBonus=9&loadHarness=80&noXp=1&atTimeUp=complete");

  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().effects?.chainExplosionsCommitted), { timeout: 35_000 }).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().effects?.fractureQueued)).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().effects?.bloodlustAttackSpeedBonus)).toBeGreaterThan(0);
  await expect.poll(async () => {
    const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
    return (snapshot?.run?.liveEnemies ?? -1) + (snapshot?.effects?.eventBacklog ?? -1);
  }, { timeout: 35_000 }).toBe(0);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.effects).toMatchObject({ explosionsCommitted: expect.any(Number) });
  expect(snapshot?.effects?.explosionsCommitted).toBeGreaterThan(0);
  expect(snapshot?.effects?.fractureSpawned).toBe(snapshot?.effects?.fractureQueued);
  expect(snapshot?.effects?.directDamage).toBeGreaterThan(0);
  expect(snapshot?.effects?.explosionDamage).toBeGreaterThan(0);
  expect(snapshot?.effects?.chainedExplosionDamage).toBeGreaterThan(0);
  expect(snapshot?.run?.liveEnemies).toBeLessThanOrEqual(snapshot?.combat?.enemyCap ?? 0);
  expect(errors).toEqual([]);
});

test("terminal restart clears interaction queues and rolling Bloodlust", async ({ page }) => {
  await page.goto("/?interactions=all&runDurationMs=700&attackSpeedBonus=9&loadHarness=40&noXp=1&atTimeUp=complete");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), { timeout: 15_000 }).toBe("complete");
  await page.keyboard.press("r");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().lifecycle?.runGeneration)).toBeGreaterThan(1);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.effects).toMatchObject({
    explosionsCommitted: 0,
    chainExplosionsCommitted: 0,
    fractureQueued: 0,
    fractureSpawned: 0,
    bloodlustKills: 0,
    bloodlustAttackSpeedBonus: 0,
  });
});
