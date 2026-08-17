import { expect, test, type Page } from "@playwright/test";
import { activeTheme } from "../../src/game/content/active-theme";

// Spawn-time reward scaling is declared theme tuning, so the expectation is
// computed from it rather than pinned to a number that drifts with balance.
const toughnessShare = activeTheme.tuning.progression.toughnessRewardShare;
const toughnessReward = (healthMultiplier: number): number =>
  1 + (healthMultiplier - 1) * toughnessShare;

async function waitForRun(page: Page, path: string): Promise<void> {
  await page.goto(`${path}${path.includes("?") ? "&" : "?"}spawnRadius=320`);
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");
}

async function choosePendingUpgrades(page: Page, deadlineMs: number): Promise<void> {
  const deadline = Date.now() + deadlineMs;
  while (Date.now() < deadline) {
    const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
    if (snapshot?.run?.status === "level_up") {
      await page.locator("canvas").click({ position: { x: 640, y: 255 } });
    }
    if ((snapshot?.shrine?.scheduled ?? 0) >= 100) return;
    await page.waitForTimeout(50);
  }
}

test("Horde shrine activates once, schedules 100 tagged enemies, and creates bonus XP", async ({
  page,
}) => {
  test.setTimeout(35_000);
  // Firepower so at least one tagged enemy dies inside the window. Nearest-target
  // selection churns in a dense crowd, so a one-shot-per-second weapon spreads
  // damage across many enemies and finishes none. The subject here is reward
  // provenance, not weapon DPS.
  await waitForRun(page, "/?surgeDurationMs=1000&noAmbient=1&attackSpeedBonus=5");
  const ready = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(ready?.shrine).toMatchObject({
    id: "shrine.spawn_surge",
    inRange: true,
    activated: false,
    targetCount: 100,
    durationMs: 1000,
    rewardMultiplier: 1.5,
  });

  await page.keyboard.press("KeyE");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().shrine?.activated))
    .toBe(true);
  await page.keyboard.press("Space");
  await choosePendingUpgrades(page, 15_000);
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().shrine?.scheduled), {
      timeout: 15_000,
    })
    .toBe(100);

  const surged = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(surged?.shrine).toMatchObject({ activated: true, scheduled: 100, feedbackCount: 1 });
  expect(surged?.shrine?.spawned).toBeLessThanOrEqual(100);
  expect(surged?.shrine?.enemiesSpawned).toBe(surged?.shrine?.spawned);
  expect(surged?.run?.liveEnemies).toBeLessThanOrEqual(surged?.combat?.enemyCap ?? 0);

  const defeatDeadline = Date.now() + 12_000;
  while (Date.now() < defeatDeadline) {
    const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
    if ((snapshot?.shrine?.shrineXpDropped ?? 0) >= 1.5) break;
    if (snapshot?.run?.status === "level_up") {
      await page.locator("canvas").click({ position: { x: 640, y: 255 } });
    }
    if (snapshot?.run?.status === "dead") break;
    await page.waitForTimeout(50);
  }
  const rewarded = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(rewarded?.shrine?.enemiesDefeated).toBeGreaterThan(0);
  const resolvedReward = rewarded?.shrine?.rewardMultiplier ?? 0;
  expect(resolvedReward).toBeGreaterThan(1.5);
  const toughness = toughnessReward(rewarded?.world?.enemyHealthMultiplier ?? 1);
  expect(rewarded?.shrine?.shrineXpDropped).toBeCloseTo(
    (rewarded?.shrine?.enemiesDefeated ?? 0) * resolvedReward * toughness,
  );
  const collected = rewarded?.shrine?.shrineXpCollected ?? 0;
  if (collected > 0) {
    const perPickup = resolvedReward * toughness * (rewarded?.world?.xpMultiplier ?? 1);
    expect(collected / perPickup).toBeCloseTo(Math.round(collected / perPickup));
  }
});

test("restart during an active surge clears its scheduler and tagged enemies", async ({ page }) => {
  test.setTimeout(45_000);
  await waitForRun(page, "/?runDurationMs=900&surgeDurationMs=20000");
  const generation = await page.evaluate(
    () => window.__ARENA_TEST__?.getSnapshot().lifecycle?.runGeneration,
  );
  await page.waitForTimeout(450);
  await page.keyboard.press("KeyE");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().shrine?.active))
    .toBe(true);
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 30_000,
    })
    .toBe("complete");

  await page.keyboard.press("KeyR");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().lifecycle?.runGeneration))
    .toBe((generation ?? 0) + 1);
  const restarted = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(restarted?.shrine).toMatchObject({
    activated: false,
    active: false,
    scheduled: 0,
    spawned: 0,
    enemiesSpawned: 0,
    shrineXpDropped: 0,
    shrineXpCollected: 0,
  });

  await page.waitForTimeout(400);
  expect(
    await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().shrine?.enemiesSpawned),
  ).toBe(0);
});
