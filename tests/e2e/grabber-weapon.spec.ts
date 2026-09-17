import { expect, test } from "@playwright/test";

test("the cleanup grabber damages one nearby target without creating a projectile", async ({ page }) => {
  await page.goto("/?loadHarness=2&closeLoad=1&noContact=1&noXp=1");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.meleeHits), {
      timeout: 10_000,
    })
    .toBeGreaterThan(0);

  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.combat).toMatchObject({
    weaponId: "weapon.starter",
    deliveryKind: "melee",
    projectiles: 0,
    projectileSample: null,
  });
  expect(snapshot?.combat?.meleeHits).toBe(snapshot?.combat?.meleeStrikes);
  expect(snapshot?.combat?.meleeHits).toBeLessThanOrEqual(snapshot?.combat?.shotsFired ?? 0);
});

test("the grabber presentation exposes an extend and retract lifetime", async ({ page }) => {
  await page.goto("/?loadHarness=1&closeLoad=1&noContact=1&noXp=1");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.grabberActive), {
      timeout: 10_000,
      intervals: [20, 20, 20, 50],
    })
    .toBeGreaterThan(0);
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.grabberActive), {
      timeout: 2_000,
      intervals: [50],
    })
    .toBe(0);
});
