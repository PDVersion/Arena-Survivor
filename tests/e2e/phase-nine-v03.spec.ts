import { expect, test, type Page } from "@playwright/test";

async function snapshot(page: Page) {
  return page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
}

test("damage numbers aggregate without losing or double-counting damage", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto(
    "/?representativeLoad=1&closeLoad=1&loadHarness=200&compoundBuild=1&critChance=3&pierce=10&attackSpeedBonus=8&runDurationMs=6000&noXp=1&noContact=1&atTimeUp=complete",
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
    "/?representativeLoad=1&closeLoad=1&loadHarness=300&compoundBuild=1&forceElite=1&critChance=3.4&pierce=12&attackSpeedBonus=9&runDurationMs=6000&noXp=1&noContact=1&atTimeUp=complete",
  );
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 90_000,
    })
    .toBe("complete");

  const terminal = await snapshot(page);
  // Emphasis must never become a stall. These are product invariants: the
  // budget is never exceeded, and the run still performs its full simulated
  // duration however long that took in wall time.
  expect(terminal?.impact?.hitStopSpentMs).toBeLessThanOrEqual(180);
  expect(terminal?.run?.elapsedMs).toBe(terminal?.run?.durationMs);

  // Deliberately no frame-time threshold here. Hosted-runner throughput is not
  // a product invariant (REC-042), and asserting one put a hardware
  // measurement into the required suite. The rule that actually matters is
  // conditional and hardware-independent: when frames did go slow, hit-stop
  // must have refused rather than piling on.
  if ((terminal?.load?.maxFrameMs ?? 0) > 34) {
    expect(terminal?.impact?.hitStopDenied ?? 0).toBeGreaterThan(0);
  }
  // Granted freezes can never account for more than the budget allows.
  expect(terminal?.impact?.hitStopSpentMs ?? 0).toBeLessThanOrEqual(
    (terminal?.impact?.hitStopGranted ?? 0) * 90,
  );
});

test("a death records what killed the player", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/?spawnRadius=260&noXp=1&atTimeUp=complete");
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
    "/?reducedMotion=1&representativeLoad=1&closeLoad=1&loadHarness=150&compoundBuild=1&forceElite=1&critChance=3&attackSpeedBonus=8&runDurationMs=5000&noXp=1&noContact=1&atTimeUp=complete",
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
