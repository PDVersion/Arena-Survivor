import { expect, test, type Page } from "@playwright/test";
import { activeTheme } from "../../src/game/content/active-theme";
import { archetypeIds } from "../../src/game/core/archetypes/ids";

const director = activeTheme.tuning.director;

async function snapshot(page: Page) {
  return page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
}

async function waitForPlaying(page: Page, query: string): Promise<void> {
  await page.goto(query);
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");
}

test("ambient enemies never appear inside the visible view", async ({ page }) => {
  test.setTimeout(60_000);
  await waitForPlaying(page, "/?noContact&atTimeUp=complete");

  // Sweep the player into every wall and corner. V0.2 clamped spawn candidates
  // into the arena, which dragged them on screen precisely when the player was
  // against a wall, so the edges are the cases that matter.
  const sweeps: readonly (readonly string[])[] = [
    ["KeyW"], ["KeyA"], ["KeyS"], ["KeyD"],
    ["KeyW", "KeyA"], ["KeyW", "KeyD"], ["KeyS", "KeyA"], ["KeyS", "KeyD"],
  ];

  for (const keys of sweeps) {
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(900);
    for (const key of keys) await page.keyboard.up(key);
    await page.waitForTimeout(250);

    const state = await snapshot(page);
    if (state?.run?.status !== "playing") break;
    // Checked at the authoritative moment a spawn point is chosen, rather than
    // sampled from rendered positions.
    expect(state?.pacing?.spawnsInsideView).toBe(0);
    const view = state?.view;
    if (view) {
      expect(view.spawnRadius).toBeGreaterThan(Math.hypot(view.worldWidth, view.worldHeight) / 2);
    }
  }

  const final = await snapshot(page);
  expect(final?.pacing?.spawnsInsideView).toBe(0);
  expect(final?.run?.kills ?? 0).toBeGreaterThanOrEqual(0);
  expect(final?.arena).toEqual({ width: 3600, height: 2400 });
});

test("the director gates the roster on run progress and announces each milestone", async ({ page }) => {
  test.setTimeout(120_000);
  // A compressed run traverses every unlock for free: the director resolves from
  // normalized progress, so nothing needed rescaling for this test.
  //
  // `noXp` keeps the run out of `level_up`, which otherwise pauses simulation
  // indefinitely waiting for a choice this test never makes. The director is
  // what is under test here, not progression.
  await waitForPlaying(page, "/?runDurationMs=20000&noContact&noXp&atTimeUp=complete");

  const opening = await snapshot(page);
  expect(Object.keys(opening?.pacing?.roleWeights ?? {})).toEqual([
    archetypeIds.enemy.swarmBasic,
  ]);
  expect(opening?.pacing?.batchSize).toBe(1);
  expect(opening?.pacing?.eliteChance).toBe(0);

  // Wait on a simulation boundary, not wall time. A slow runner advances
  // simulation at a fraction of real time, so polling a progress threshold
  // against a fixed timeout is a CI flake waiting to happen (REC-041).
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 90_000,
    })
    .toBe("complete");

  const late = await snapshot(page);
  expect(late?.pacing?.progress).toBe(1);
  // Every declared role is live, the batch has grown, and elites appear without
  // any shrine activation — which a V0.2 run never did.
  expect(Object.keys(late?.pacing?.roleWeights ?? {}).sort()).toEqual(
    director.roles.map((role) => role.enemyId).sort(),
  );
  expect(late?.pacing?.batchSize).toBeGreaterThan(opening?.pacing?.batchSize ?? 0);
  expect(late?.pacing?.eliteChance).toBeGreaterThan(0);
  expect(late?.world?.chaos).toBe(1);

  // One announced wave per role unlocked after the opening.
  expect(late?.pacing?.milestoneWaves).toBe(director.roles.length - 1);
  expect(late?.pacing?.waveSpawned).toBeGreaterThan(0);

  // Cadence tightened as the run progressed.
  expect(late?.pacing?.spawnIntervalMs).toBeLessThan(opening?.pacing?.spawnIntervalMs ?? Infinity);
  expect(late?.pacing?.spawnIntervalMs).toBeGreaterThanOrEqual(director.minIntervalMs);
});

test("a restarted run rewinds the director to its opening state", async ({ page }) => {
  test.setTimeout(60_000);
  await waitForPlaying(page, "/?runDurationMs=8000&noContact&noXp&atTimeUp=complete");

  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 30_000,
    })
    .toBe("complete");

  const finished = await snapshot(page);
  expect(finished?.pacing?.milestoneWaves).toBeGreaterThan(0);

  await page.keyboard.press("KeyR");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");

  const restarted = await snapshot(page);
  expect(restarted?.pacing?.milestoneWaves).toBe(0);
  expect(restarted?.pacing?.waveSpawned).toBe(0);
  expect(restarted?.pacing?.progress).toBeLessThan(0.2);
  expect(Object.keys(restarted?.pacing?.roleWeights ?? {})).toEqual([
    archetypeIds.enemy.swarmBasic,
  ]);
});

test("the first milestone wave sweeps past instead of homing in", async ({ page }) => {
  test.setTimeout(120_000);
  await waitForPlaying(page, "/?runDurationMs=20000&noContact&noXp&atTimeUp=complete");

  // Cross the first unlock, which releases the fast role's wave.
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().pacing?.milestoneWaves ?? 0), {
      timeout: 60_000,
    })
    .toBeGreaterThanOrEqual(1);

  const released = await snapshot(page);
  // The fast role outruns the player, so its wave must not chase.
  expect(released?.pacing?.driftSpawned).toBeGreaterThan(0);
  expect(released?.pacing?.driftLive).toBeGreaterThan(0);

  // Drifting enemies leave rather than accumulating against the arena edge.
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().pacing?.driftReclaimed ?? 0), {
      timeout: 60_000,
    })
    .toBeGreaterThan(0);

  const later = await snapshot(page);
  expect(later?.pacing?.driftLive).toBeLessThan(released?.pacing?.driftSpawned ?? 0);
});
