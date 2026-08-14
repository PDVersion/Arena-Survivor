import { expect, test, type Page } from "@playwright/test";

async function waitForCombat(page: Page): Promise<void> {
  await page.goto("/");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.enemyId))
    .toBe("enemy.swarm_basic");
}

test("combat auto-targets, fires, and kills swarm enemies", async ({ page }) => {
  test.setTimeout(45_000);
  await waitForCombat(page);
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.shotsFired))
    .toBeGreaterThan(0);
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.projectileSample))
    .not.toBeNull();
  const fired = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.projectileSample);
  expect(Math.hypot(fired?.velocityX ?? 0, fired?.velocityY ?? 0)).toBeCloseTo(400);
  await expect
    .poll(() =>
      page.evaluate((sample) => {
        const current = window.__ARENA_TEST__?.getSnapshot().combat?.projectileSample;
        if (!current || current.id !== sample?.id) return 0;
        return Math.hypot(current.x - sample.x, current.y - sample.y);
      }, fired),
    )
    .toBeGreaterThan(20);
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.kills), {
      timeout: 25_000,
    })
    .toBeGreaterThan(0);

  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.combat).toMatchObject({
    weaponId: "weapon.starter_projectile",
    enemyId: "enemy.swarm_basic",
    enemyCap: 300,
    projectileCap: 192,
  });
  expect(snapshot?.run?.liveEnemies).toBeGreaterThan(0);
});

test("contact damage is visible, throttled, and can cause death", async ({ page }) => {
  test.setTimeout(100_000);
  await waitForCombat(page);

  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.contactHits), {
      timeout: 35_000,
    })
    .toBeGreaterThan(0);
  const firstHit = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(firstHit?.player?.health).toBeLessThan(100);
  expect(firstHit?.player?.invulnerable).toBe(true);

  const deadline = Date.now() + 55_000;
  while (Date.now() < deadline) {
    const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
    if (snapshot?.run?.status === "dead") break;
    if (snapshot?.run?.status === "level_up") {
      const choices = snapshot.progression?.choiceIds ?? [];
      const preferred = [
        "upgrade.move_speed",
        "upgrade.health",
        "upgrade.pickup_radius",
      ];
      const index = Math.max(
        0,
        choices.findIndex((choice) => preferred.includes(choice)),
      );
      await page.keyboard.press(`Digit${index + 1}`);
    }
    await page.waitForTimeout(100);
  }
  expect(await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status)).toBe("dead");
  const dead = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(dead?.player?.health).toBe(0);
  expect(dead?.player?.velocityX).toBe(0);
  expect(dead?.player?.velocityY).toBe(0);
  expect(dead?.combat?.projectiles).toBe(0);
  expect(dead?.combat?.projectileSample).toBeNull();
  expect(dead?.lifecycle?.terminalOverlay).toBe("dead");
});
