import { expect, test, type Page } from "@playwright/test";

async function waitForCombat(page: Page): Promise<void> {
  await page.goto("/");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.enemyId))
    .toBe("enemy.swarm_basic");
}

test("combat auto-targets, fires, and kills swarm enemies", async ({ page }) => {
  await waitForCombat(page);
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.shotsFired))
    .toBeGreaterThan(0);
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.kills), {
      timeout: 12_000,
    })
    .toBeGreaterThan(0);

  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.combat).toMatchObject({
    weaponId: "weapon.starter_projectile",
    enemyId: "enemy.swarm_basic",
    enemyCap: 80,
    projectileCap: 64,
  });
  expect(snapshot?.run?.liveEnemies).toBeGreaterThan(0);
});

test("contact damage is visible, throttled, and can cause death", async ({ page }) => {
  test.setTimeout(40_000);
  await waitForCombat(page);

  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.contactHits), {
      timeout: 18_000,
    })
    .toBeGreaterThan(0);
  const firstHit = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(firstHit?.player?.health).toBeLessThan(100);
  expect(firstHit?.player?.invulnerable).toBe(true);

  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 20_000,
    })
    .toBe("dead");
  const dead = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(dead?.player?.health).toBe(0);
  expect(dead?.player?.velocityX).toBe(0);
  expect(dead?.player?.velocityY).toBe(0);
});
