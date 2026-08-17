import { expect, test, type Page } from "@playwright/test";
import { activeTheme } from "../../src/game/content/active-theme";

const time = activeTheme.tuning.difficulty.time;

async function snapshot(page: Page) {
  return page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
}

test("world pressure escalates on the timer without any shrine", async ({ page }) => {
  test.setTimeout(120_000);
  // Chaos stays at 1.0 throughout: this is the escalation V0.2 could not do.
  await page.goto("/?runDurationMs=20000&noContact=1&noXp=1&noHazards=1&spawnRadius=320");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");

  const opening = await snapshot(page);
  expect(opening?.world?.chaos).toBe(1);
  expect(opening?.world?.threatStep).toBe(0);
  expect(opening?.world?.enemyHealthMultiplier).toBeCloseTo(1, 5);
  expect(opening?.world?.enemyMoveSpeedMultiplier).toBeCloseTo(1, 5);

  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 90_000,
    })
    .toBe("complete");

  const finished = await snapshot(page);
  // Chaos never moved, so everything here came from elapsed time alone.
  expect(finished?.world?.chaos).toBe(1);
  expect(finished?.world?.threatStep).toBe(time.steps);
  expect(finished?.world?.enemyHealthMultiplier).toBeCloseTo(1 + time.enemyHealthAtEnd, 5);
  expect(finished?.world?.enemyDamageMultiplier).toBeCloseTo(1 + time.enemyDamageAtEnd, 5);
  expect(finished?.world?.enemyMoveSpeedMultiplier).toBeCloseTo(1 + time.enemyMoveSpeedAtEnd, 5);
});

test("escalation advances in legible steps, not continuously", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/?runDurationMs=20000&noContact=1&noXp=1&noHazards=1&spawnRadius=320");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");

  const seen = new Set<number>();
  for (let sample = 0; sample < 40; sample += 1) {
    const state = await snapshot(page);
    if (state?.run?.status !== "playing") break;
    const step = state?.world?.threatStep ?? -1;
    // A smooth ramp would produce a new value on nearly every sample; a stepped
    // one produces a small set of integers.
    expect(Number.isInteger(step)).toBe(true);
    expect(step).toBeGreaterThanOrEqual(0);
    expect(step).toBeLessThanOrEqual(time.steps);
    seen.add(step);
    await page.waitForTimeout(120);
  }

  expect(seen.size).toBeGreaterThan(1);
  expect(seen.size).toBeLessThanOrEqual(time.steps + 1);
});

test("hazards telegraph, damage, and clean up without touching enemy accounting", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/?runDurationMs=12000&noXp=1&noAmbient=1&hazardIntervalMs=900");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().hazards?.placed ?? 0), {
      timeout: 60_000,
    })
    .toBeGreaterThan(0);

  const placed = await snapshot(page);
  // Hazards are world content: they never enter the enemy cap or the kill count.
  expect(placed?.run?.liveEnemies).toBe(0);
  expect(placed?.run?.kills).toBe(0);
  expect(placed?.hazards?.active).toBeGreaterThan(0);
  expect(placed?.hazards?.active).toBeLessThanOrEqual(activeTheme.tuning.hazards.maxActive);

  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 90_000,
    })
    .toBe("complete");

  const terminal = await snapshot(page);
  // Hazard damage is recorded separately; the ledger still means damage the
  // player dealt, and it still reconciles exactly.
  const breakdown = terminal?.statistics?.damageBreakdown;
  const total = Object.values(breakdown ?? {}).reduce((sum, value) => sum + value, 0);
  expect(total).toBeCloseTo(terminal?.statistics?.totalDamage ?? 0, 6);
  expect(terminal?.hazards?.active).toBeLessThanOrEqual(activeTheme.tuning.hazards.maxActive);
});

test("a restarted run clears every hazard and rewinds escalation", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/?runDurationMs=6000&noXp=1&noAmbient=1&hazardIntervalMs=900");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 60_000,
    })
    .toBe("complete");

  const finished = await snapshot(page);
  expect(finished?.hazards?.placed).toBeGreaterThan(0);

  await page.keyboard.press("KeyR");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");

  const restarted = await snapshot(page);
  expect(restarted?.hazards?.placed).toBe(0);
  expect(restarted?.hazards?.active).toBe(0);
  expect(restarted?.world?.threatStep).toBe(0);
  expect(restarted?.world?.enemyHealthMultiplier).toBeCloseTo(1, 5);
});
