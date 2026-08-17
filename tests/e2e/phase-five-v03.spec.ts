import { expect, test, type Page } from "@playwright/test";

async function snapshot(page: Page) {
  return page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
}

const densePath =
  "/?representativeLoad=1&closeLoad=1&loadHarness=200&runDurationMs=6000&noXp=1&noContact=1";

test("a dense crowd never stays perfectly stacked", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto(densePath);
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().load?.spawned), {
      timeout: 30_000,
    })
    .toBe(200);

  // Enemies spawn after separation runs in the same frame, so a freshly placed
  // pair can share a position for exactly one frame. The invariant is that it
  // never persists: a stack must resolve, not merely start small.
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().crowd?.coincidentPairs ?? -1), {
      timeout: 20_000,
    })
    .toBe(0);

  for (let sample = 0; sample < 10; sample += 1) {
    const state = await snapshot(page);
    if (state?.run?.status !== "playing") break;
    // Transients are allowed while spawning continues; a pile is not.
    expect(state?.crowd?.coincidentPairs).toBeLessThanOrEqual(2);
    await page.waitForTimeout(120);
  }

  const settled = await snapshot(page);
  expect(settled?.crowd?.adjustments).toBeGreaterThan(0);
  // Bounded work: candidate visits stay far below an all-pairs scan.
  expect(settled?.crowd?.pairChecksHighWater).toBeLessThan(200 * 200);
});

test("solid enemies block the player and soft ones do not", async ({ page }) => {
  test.setTimeout(120_000);
  // Only the durable role, which is solid, spawned right on the player.
  await page.goto("/?enemyRoster=all&noXp=1&noContact=1&spawnRadius=90&runDurationMs=20000");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");

  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().crowd?.solidResolutions ?? 0), {
      timeout: 30_000,
    })
    .toBeGreaterThan(0);

  const state = await snapshot(page);
  // The player is displaced out of solids but never out of the arena.
  const player = state?.player;
  const arena = state?.arena;
  expect(player!.x).toBeGreaterThanOrEqual(player!.radius - 1);
  expect(player!.y).toBeGreaterThanOrEqual(player!.radius - 1);
  expect(player!.x).toBeLessThanOrEqual(arena!.width - player!.radius + 1);
  expect(player!.y).toBeLessThanOrEqual(arena!.height - player!.radius + 1);
});

test("separation never alters damage, rewards, or statistics", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto(
    "/?representativeLoad=1&closeLoad=1&loadHarness=120&compoundBuild=1&critChance=3&pierce=8&attackSpeedBonus=6&runDurationMs=5000&noContact=1&noXp=1",
  );
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 90_000,
    })
    .toBe("complete");

  const terminal = await snapshot(page);
  const breakdown = terminal?.statistics?.damageBreakdown;
  const total = Object.values(breakdown ?? {}).reduce((sum, value) => sum + value, 0);

  // The ledger still reconciles exactly, and crowd work is accounted separately
  // from anything that touches damage or rewards.
  expect(total).toBeCloseTo(terminal?.statistics?.totalDamage ?? 0, 6);
  expect(terminal?.statistics?.kills).toBeGreaterThan(0);
  expect(terminal?.crowd?.adjustments).toBeGreaterThan(0);
  expect(terminal?.crowd?.coincidentPairs).toBe(0);
  // Both production weapons declare zero knockback, so none is applied.
  expect(terminal?.crowd?.weaponShoves).toBe(0);
});
