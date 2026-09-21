import { expect, test, type Page } from "@playwright/test";

async function waitForCombat(page: Page): Promise<void> {
  // `spawnRadius` restores close-quarters timing. Since Phase 4 the ambient ring
  // sits ~958 units out, so a stationary player waits seconds for the first
  // enemy and far longer to accumulate kills. This path is about combat, not
  // about where enemies appear -- phase-four-v03 covers that. See REC-049.
  await page.goto("/?spawnRadius=320&loadHarness=4&closeLoad=1");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.enemyId))
    .toBe("enemy.swarm_basic");
}

test("combat auto-targets, stabs, and kills swarm enemies", async ({ page }) => {
  test.setTimeout(45_000);
  await waitForCombat(page);
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.shotsFired))
    .toBeGreaterThan(0);
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.meleeHits))
    .toBeGreaterThan(0);
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.kills), {
      timeout: 25_000,
    })
    .toBeGreaterThan(0);

  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.combat).toMatchObject({
    weaponId: "weapon.starter",
    deliveryKind: "melee",
    projectiles: 0,
    enemyId: "enemy.swarm_basic",
    enemyCap: 300,
    projectileCap: 192,
  });
  expect(snapshot?.run?.liveEnemies).toBeGreaterThan(0);
});

test("contact damage is visible, throttled, and can cause death", async ({ page }) => {
  test.setTimeout(100_000);
  // Multi-hit grabber progression can now clear the whole close pack before it
  // proves contact lethality, so isolate the contact contract from offense.
  await page.goto("/?spawnRadius=320&loadHarness=30&closeLoad=1&noWeapon=1");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.enemyId))
    .toBe("enemy.swarm_basic");

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
