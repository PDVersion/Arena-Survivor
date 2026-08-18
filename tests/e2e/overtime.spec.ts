import { expect, test, type Page } from "@playwright/test";
import { activeTheme } from "../../src/game/content/active-theme";

function snapshot(page: Page) {
  return page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
}

// Every other browser path answers this decision through `atTimeUp=complete`,
// which reproduces the V0.3 ending. This file is the only coverage of the
// decision itself and of the two modes it can leave the run in.
test("the timer ends in a decision rather than an ending", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/?runDurationMs=2500&noContact&noXp=1&spawnRadius=320");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 20_000,
    })
    .toBe("time_up");

  const timeUp = await snapshot(page);
  expect(timeUp?.run?.mode).toBe("timed");
  // The run is held, not ended: no summary, and the clock has stopped.
  expect(timeUp?.lifecycle?.terminalOverlay ?? null).toBeNull();
  await page.waitForTimeout(400);
  expect((await snapshot(page))?.run?.elapsedMs).toBe(timeUp?.run?.elapsedMs);
});

test("continuing endlessly lifts the limit and keeps the run going", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/?runDurationMs=2500&noContact&noXp=1&spawnRadius=320");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 20_000,
    })
    .toBe("time_up");

  await page.keyboard.press("Digit1");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.mode))
    .toBe("endless");
  expect((await snapshot(page))?.run?.status).toBe("playing");

  // Past the limit the clock keeps running and enemies keep arriving.
  const resumed = await snapshot(page);
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.elapsedMs))
    .toBeGreaterThan((resumed?.run?.durationMs ?? 0) + 500);
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.liveEnemies), {
      timeout: 20_000,
    })
    .toBeGreaterThan(0);

  // Overtime reads as a count-up, never as a negative countdown.
  expect((await snapshot(page))?.hud?.time?.startsWith("+")).toBe(true);
});

test("clearing the field stops arrivals and ends on an empty arena", async ({ page }) => {
  test.setTimeout(90_000);
  // Enough firepower that the enemies still standing can actually be cleared
  // inside the path's budget; the subject is the mode, not the weapon.
  await page.goto(
    "/?runDurationMs=2500&noContact&noXp=1&spawnRadius=320&critChance=3&pierce=12&attackSpeedBonus=9",
  );
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 20_000,
    })
    .toBe("time_up");

  await page.keyboard.press("Digit2");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.mode))
    .toBe("clearing");

  // No new arrivals: the live count only ever falls from here.
  const atChoice = (await snapshot(page))?.run?.liveEnemies ?? 0;
  await page.waitForTimeout(600);
  expect((await snapshot(page))?.run?.liveEnemies ?? 0).toBeLessThanOrEqual(atChoice);

  // The field empties by being fought, and the run ends when it is empty.
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 60_000,
    })
    .toBe("complete");

  const finished = await snapshot(page);
  expect(finished?.run?.liveEnemies).toBe(0);
  expect(finished?.lifecycle?.terminalOverlay).toBe("complete");
});

test("a level-up card states the tier it rolled and gives what it states", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/?noContact&closeLoad=1&loadHarness=60&critChance=0.6&pierce=4&atTimeUp=complete");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 40_000,
    })
    .toBe("level_up");

  const tierNames = Object.keys(activeTheme.copy.tiers);
  const cards = (await snapshot(page))?.ui?.cardDescriptions ?? [];
  expect(cards.length).toBe(3);
  for (const card of cards) {
    expect(tierNames).toContain(card.tier);
    // The ladder never goes below the authored value.
    expect(card.tierMultiplier).toBeGreaterThanOrEqual(1);
    expect(card.tierMultiplier).toBeLessThanOrEqual(2);
  }

  // What the card claims is what the run applies: taking it must move a stat by
  // the amount the card stated, tier included.
  const before = await snapshot(page);
  const chosen = cards[0]!;
  const claimed = chosen.lines[0];
  await page.keyboard.press("Digit1");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .not.toBe("level_up");

  const after = await snapshot(page);
  if (claimed) {
    const matching = (after?.ui?.statLines ?? []).find((line) => line.display === claimed.to);
    const skillsGrew =
      Object.keys(after?.progression?.skillLevels ?? {}).length >
      Object.keys(before?.progression?.skillLevels ?? {}).length;
    expect(Boolean(matching) || skillsGrew).toBe(true);
  }
});
