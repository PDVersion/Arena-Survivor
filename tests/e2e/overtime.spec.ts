import { expect, test, type Page } from "@playwright/test";
import { activeTheme } from "../../src/game/content/active-theme";

function snapshot(page: Page) {
  return page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
}

/**
 * Wall-clock budget for reaching a simulated milestone.
 *
 * A hosted runner advances simulation at roughly a fifth of real time, so every
 * wait here is sized against that rather than against the simulated duration.
 * REC-041 and REC-049 both record this class of failure; the first version of
 * this file reproduced it exactly, allowing 20 s for 2.5 s of simulated time.
 */
const SIMULATION_BUDGET_MS = 90_000;

/** Simulated milliseconds, which is the only clock a run actually obeys. */
async function elapsedMs(page: Page): Promise<number> {
  return (await snapshot(page))?.run?.elapsedMs ?? 0;
}

/** Let the run advance by simulated time, never by wall time. */
async function advanceSimulation(page: Page, byMs: number): Promise<void> {
  const from = await elapsedMs(page);
  await expect
    .poll(() => elapsedMs(page), { timeout: SIMULATION_BUDGET_MS })
    .toBeGreaterThan(from + byMs);
}

async function waitForTimeUp(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: SIMULATION_BUDGET_MS,
    })
    .toBe("time_up");
}

// Every other browser path answers this decision through `atTimeUp=complete`,
// which reproduces the V0.3 ending. This file is the only coverage of the
// decision itself and of the two modes it can leave the run in.
test("the timer ends in a decision rather than an ending", async ({ page }) => {
  test.setTimeout(150_000);
  await waitForTimeUp(page, "/?runDurationMs=1500&noContact&noXp=1&noHazards&spawnRadius=320");

  const timeUp = await snapshot(page);
  expect(timeUp?.run?.mode).toBe("timed");
  // The run is held, not ended: no summary, and the clock has stopped.
  expect(timeUp?.lifecycle?.terminalOverlay ?? null).toBeNull();
  await page.waitForTimeout(500);
  expect(await elapsedMs(page)).toBe(timeUp?.run?.elapsedMs);
});

test("continuing endlessly lifts the limit and keeps the run going", async ({ page }) => {
  test.setTimeout(150_000);
  await waitForTimeUp(page, "/?runDurationMs=1500&noContact&noXp=1&noHazards&spawnRadius=320");

  await page.keyboard.press("Digit1");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.mode))
    .toBe("endless");
  expect((await snapshot(page))?.run?.status).toBe("playing");

  // Past the limit the clock keeps running and enemies keep arriving.
  await advanceSimulation(page, 1_000);
  const running = await snapshot(page);
  expect(running?.run?.elapsedMs).toBeGreaterThan(running?.run?.durationMs ?? 0);
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.liveEnemies), {
      timeout: SIMULATION_BUDGET_MS,
    })
    .toBeGreaterThan(0);

  // Overtime reads as a count-up, never as a negative countdown.
  expect((await snapshot(page))?.hud?.time?.startsWith("+")).toBe(true);
});

test("overtime escalates far harder than the timed run ever did", async ({ page }) => {
  test.setTimeout(150_000);
  await waitForTimeUp(page, "/?runDurationMs=1500&noContact&noXp=1&noHazards&spawnRadius=320");

  const atLimit = await snapshot(page);
  const healthAtLimit = atLimit?.world?.enemyHealthMultiplier ?? 1;

  await page.keyboard.press("Digit1");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.mode))
    .toBe("endless");

  // Endless is meant to end, not to be farmed: enemy health compounds per step
  // instead of plateauing the way the timed curve does at its limit.
  await advanceSimulation(page, 1_500);
  const overtime = await snapshot(page);

  expect(overtime?.world?.enemyHealthMultiplier ?? 0).toBeGreaterThan(healthAtLimit * 1.5);
  expect(overtime?.world?.threatStep ?? 0).toBeGreaterThan(atLimit?.world?.threatStep ?? 0);
});

test("clearing the field stops arrivals and ends on an empty arena", async ({ page }) => {
  test.setTimeout(150_000);
  // Enough firepower that whatever is still standing can be cleared inside the
  // budget; the subject is the mode, not the weapon.
  await waitForTimeUp(
    page,
    "/?runDurationMs=2000&noContact&noXp=1&noHazards&spawnRadius=320&critChance=3&pierce=12&attackSpeedBonus=9",
  );

  await page.keyboard.press("Digit2");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.mode))
    .toBe("clearing");

  // No new arrivals. Measured against simulated time, so the window genuinely
  // covers a spawn interval rather than however much wall time the runner had.
  const atChoice = (await snapshot(page))?.run?.liveEnemies ?? 0;
  if ((await snapshot(page))?.run?.status === "playing") {
    await advanceSimulation(page, 1_200);
    expect((await snapshot(page))?.run?.liveEnemies ?? 0).toBeLessThanOrEqual(atChoice);
  }

  // The field empties by being fought, and the run ends when it is empty.
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: SIMULATION_BUDGET_MS,
    })
    .toBe("complete");

  const finished = await snapshot(page);
  expect(finished?.run?.liveEnemies).toBe(0);
  // The summary is the same one a timed run ends on, and the only thing offered
  // is a new run: the decision does not come back.
  expect(finished?.lifecycle?.terminalOverlay).toBe("complete");
  expect(finished?.ui?.overtimeOpen).toBe(false);
  // And it says what actually happened: the run outlived the shift rather than
  // being held for it.
  expect(finished?.ui?.terminalTitle).toBe(activeTheme.copy.vocabulary.clearedTitle);

  await page.keyboard.press("KeyR");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().lifecycle?.runGeneration))
    .toBeGreaterThan(finished?.lifecycle?.runGeneration ?? 0);
  const restarted = await snapshot(page);
  expect(restarted?.run?.mode).toBe("timed");
  expect(restarted?.lifecycle?.terminalOverlay ?? null).toBeNull();
});

test("a level-up card states the tier it rolled and gives what it states", async ({ page }) => {
  test.setTimeout(150_000);
  await page.goto("/?noContact&closeLoad=1&loadHarness=60&critChance=0.6&pierce=4&atTimeUp=complete");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: SIMULATION_BUDGET_MS,
    })
    .toBe("level_up");

  const tierNames = Object.keys(activeTheme.copy.tiers);
  const cards = (await snapshot(page))?.ui?.cardDescriptions ?? [];
  expect(cards.length).toBe(3);
  for (const card of cards) {
    expect(tierNames).toContain(card.tier);
    // The ladder never goes below the authored value, and unique is the top.
    expect(card.tierMultiplier).toBeGreaterThanOrEqual(1);
    expect(card.tierMultiplier).toBeLessThanOrEqual(2.5);
  }

  // What the card claims is what the run applies: taking it must move a stat by
  // the amount the card stated, tier included.
  const before = await snapshot(page);
  const claimed = cards[0]!.lines[0];
  const takenBefore = before?.progression?.selectedUpgradeIds?.length ?? 0;
  await page.keyboard.press("Digit1");
  // Wait on the choice being consumed, not on leaving `level_up`: with this
  // much XP income the next level-up is usually already queued behind it.
  await expect
    .poll(() =>
      page.evaluate(
        () => window.__ARENA_TEST__?.getSnapshot().progression?.selectedUpgradeIds?.length ?? 0,
      ),
    )
    .toBeGreaterThan(takenBefore);

  const after = await snapshot(page);
  if (claimed) {
    const matching = (after?.ui?.statLines ?? []).find((line) => line.display === claimed.to);
    const skillsGrew =
      Object.keys(after?.progression?.skillLevels ?? {}).length >
      Object.keys(before?.progression?.skillLevels ?? {}).length;
    expect(Boolean(matching) || skillsGrew).toBe(true);
  }
});
