import { expect, test, type Page } from "@playwright/test";

async function snapshot(page: Page) {
  return page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
}

const densePath =
  "/?representativeLoad=1&closeLoad=1&loadHarness=200&runDurationMs=6000&noWeapon=1&noXp=1&noContact=1&atTimeUp=complete";

test("a dense crowd never stays perfectly stacked", async ({ page }) => {
  test.setTimeout(120_000);
  // Retain the complete crowd and isolate separation from weapon shoves/kills;
  // compound combat and its exact ledger have their own path below.
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
    // This metric counts neighbours within 0.5 units, not persistent pair
    // identities. Cold frames can briefly produce three near-coincidences;
    // require recovery to zero instead of assuming a per-frame ceiling of two.
    await expect.poll(
      async () => (await snapshot(page))?.crowd?.coincidentPairs,
      { timeout: 30_000 },
    ).toBe(0);
    await page.waitForTimeout(120);
  }

  const settled = await snapshot(page);
  expect(settled?.run?.liveEnemies).toBe(200);
  expect(settled?.crowd?.adjustments).toBeGreaterThan(0);
  // Bounded work: candidate visits stay far below an all-pairs scan.
  expect(settled?.crowd?.pairChecksHighWater).toBeLessThan(200 * 200);
});

test("every enemy remains walk-through without displacing the player", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/?enemyRoster=all&noXp=1&noContact=1&spawnRadius=90&runDurationMs=20000&atTimeUp=complete");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");

  const startX = (await snapshot(page))?.player?.x ?? 0;
  await page.keyboard.down("KeyD");
  await expect.poll(
    () => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().player?.x ?? 0),
    { timeout: 30_000 },
  ).toBeGreaterThan(startX + 150);
  await page.keyboard.up("KeyD");
  const state = await snapshot(page);
  expect(state?.crowd?.solidResolutions).toBe(0);
});

test("separation never alters damage, rewards, or statistics", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto(
    "/?representativeLoad=1&closeLoad=1&loadHarness=120&compoundBuild=1&critChance=3&pierce=8&attackSpeedBonus=6&runDurationMs=5000&noContact=1&noXp=1&atTimeUp=complete",
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
  // The grabber's small shove is presentation-independent and leaves the
  // damage/reward ledger unchanged.
  expect(terminal?.crowd?.weaponShoves).toBeGreaterThan(0);
});
