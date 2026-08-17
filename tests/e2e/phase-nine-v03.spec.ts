import { expect, test, type Page } from "@playwright/test";

async function snapshot(page: Page) {
  return page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
}

test("damage numbers aggregate without losing or double-counting damage", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto(
    "/?representativeLoad=1&closeLoad=1&loadHarness=200&compoundBuild=1&critChance=3&pierce=10&attackSpeedBonus=8&runDurationMs=6000&noXp=1&noContact=1",
  );
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 90_000,
    })
    .toBe("complete");

  const terminal = await snapshot(page);
  // Everything that entered aggregation was drawn exactly once by the terminal
  // flush, so no number is silently dropped when a run ends mid-window.
  expect(terminal?.impact?.damageAccumulated).toBeGreaterThan(0);
  expect(terminal?.impact?.damageFlushed).toBeCloseTo(terminal?.impact?.damageAccumulated ?? 0, 6);
  expect(terminal?.impact?.pendingNumbers).toBe(0);

  // The ledger is untouched by presentation.
  const breakdown = terminal?.statistics?.damageBreakdown;
  const total = Object.values(breakdown ?? {}).reduce((sum, value) => sum + value, 0);
  expect(total).toBeCloseTo(terminal?.statistics?.totalDamage ?? 0, 6);
});

test("hit-stop stays inside its budget under load", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto(
    "/?representativeLoad=1&closeLoad=1&loadHarness=300&compoundBuild=1&forceElite=1&critChance=3.4&pierce=12&attackSpeedBonus=9&runDurationMs=6000&noXp=1&noContact=1",
  );
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 90_000,
    })
    .toBe("complete");

  const terminal = await snapshot(page);
  // Emphasis must never become a stall: the budget refuses requests, and the
  // run still completes its full simulated duration.
  expect(terminal?.impact?.hitStopSpentMs).toBeLessThanOrEqual(180);
  expect(terminal?.run?.elapsedMs).toBe(terminal?.run?.durationMs);
  expect(terminal?.load?.maxFrameMs ?? 0).toBeLessThan(120);
});

test("a death records what killed the player", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/?spawnRadius=260&noXp=1");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 90_000,
    })
    .toBe("dead");

  const terminal = await snapshot(page);
  const cause = terminal?.impact?.deathCause;
  expect(cause).not.toBeNull();
  expect(cause!.sourceId.length).toBeGreaterThan(0);
  expect(cause!.atMs).toBeGreaterThan(0);
  expect(typeof cause!.elite).toBe("boolean");
});

test("reduced motion disables the freeze without changing the run", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto(
    "/?reducedMotion=1&representativeLoad=1&closeLoad=1&loadHarness=150&compoundBuild=1&forceElite=1&critChance=3&attackSpeedBonus=8&runDurationMs=5000&noXp=1&noContact=1",
  );
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 90_000,
    })
    .toBe("complete");

  const terminal = await snapshot(page);
  expect(terminal?.feedback?.reducedMotion).toBe(true);
  expect(terminal?.impact?.hitStopGranted).toBe(0);
  // The run still performed its full simulation and still reconciles.
  expect(terminal?.run?.elapsedMs).toBe(terminal?.run?.durationMs);
  expect(terminal?.impact?.damageFlushed).toBeCloseTo(terminal?.impact?.damageAccumulated ?? 0, 6);
});
