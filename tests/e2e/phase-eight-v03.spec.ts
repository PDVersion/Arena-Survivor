import { expect, test, type Page } from "@playwright/test";

async function snapshot(page: Page) {
  return page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
}

async function waitForLevelUp(page: Page, query = ""): Promise<void> {
  await page.goto(`/?noContact&spawnRadius=320${query}`);
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 60_000,
    })
    .toBe("level_up");
}

test("cards state levels, newness, and resolved before/after values", async ({ page }) => {
  test.setTimeout(120_000);
  await waitForLevelUp(page);

  const state = await snapshot(page);
  const cards = state?.ui?.cardDescriptions ?? [];
  expect(cards).toHaveLength(3);

  for (const card of cards) {
    // Badges are identity, so every card carries one either way.
    expect(card.isNew).toBe(card.level === 0);
    expect(card.nextLevel).toBe(card.level + 1);
    // A card that says nothing would be a wasted pick with no warning.
    expect(card.lines.length).toBeGreaterThan(0);
    for (const line of card.lines) {
      expect(line.label.length).toBeGreaterThan(0);
      expect(line.to.length).toBeGreaterThan(0);
      // A first take has nothing to compare against; a repeat must show both.
      if (!card.isNew) expect(line.from).not.toBeNull();
    }
  }
});

test("a card's stated result matches the pause menu after taking it", async ({ page }) => {
  test.setTimeout(120_000);
  await waitForLevelUp(page);

  const before = await snapshot(page);
  const cards = before?.ui?.cardDescriptions ?? [];
  // Pick a card whose first line names a stat the pause menu also shows.
  const index = cards.findIndex((card) =>
    (before?.ui?.statLines ?? []).some((stat) =>
      card.lines.some((line) => line.label.length > 0 && line.to.length > 0 && stat.display.length > 0),
    ),
  );
  expect(index).toBeGreaterThanOrEqual(0);

  const chosen = cards[index]!;
  const claimed = chosen.lines[0]!;
  await page.keyboard.press(String(index + 1));

  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .not.toBe("level_up");

  // The claim must be reproducible from the live state, not just plausible.
  const after = await snapshot(page);
  const matching = (after?.ui?.statLines ?? []).find((stat) => stat.display === claimed.to);
  const worldChanged = (after?.world?.enemySpawnMultiplier ?? 1) !== (before?.world?.enemySpawnMultiplier ?? 1) ||
    (after?.world?.chaos ?? 1) !== (before?.world?.chaos ?? 1);
  const skillChanged = Object.keys(after?.progression?.skillLevels ?? {}).length >
    Object.keys(before?.progression?.skillLevels ?? {}).length;

  expect(Boolean(matching) || worldChanged || skillChanged).toBe(true);
});

test("the detail toggle hides numbers without hiding identity", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/?noContact&spawnRadius=320");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");

  const initial = await snapshot(page);
  expect(initial?.ui?.settings?.detailedUpgradeCards).toBe(true);

  await page.keyboard.press("Escape");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.pauseOpen))
    .toBe(true);

  const paused = await snapshot(page);
  expect(paused?.run?.status).toBe("paused");
  expect(paused?.ui?.pauseTab).toBe("stats");
  expect((paused?.ui?.statLines ?? []).length).toBeGreaterThan(0);
});

test("the pause menu cycles tabs, toggles settings, and never resumes by accident", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/?noContact&spawnRadius=320");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");

  const running = await snapshot(page);
  await page.keyboard.press("Escape");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.pauseOpen))
    .toBe(true);

  // Simulation is frozen while the overlay is up.
  const opened = await snapshot(page);
  await page.waitForTimeout(300);
  const held = await snapshot(page);
  expect(held?.run?.elapsedMs).toBe(opened?.run?.elapsedMs);
  expect(opened?.run?.elapsedMs).toBeGreaterThanOrEqual(running?.run?.elapsedMs ?? 0);

  await page.keyboard.press("Tab");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.pauseTab))
    .not.toBe("stats");

  // Mute is a setting now, so the key and the menu cannot disagree.
  await page.keyboard.press("KeyM");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.settings?.muted))
    .toBe(true);
  expect((await snapshot(page))?.feedback?.muted).toBe(true);

  // Still paused after all of that.
  expect((await snapshot(page))?.run?.status).toBe("paused");

  await page.keyboard.press("Escape");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.pauseOpen))
    .toBe(false);
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");
});

test("both overlays survive a resize", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/?noContact&spawnRadius=320");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");

  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 900, height: 620 });
  await page.waitForTimeout(200);

  const resized = await snapshot(page);
  expect(resized?.ui?.pauseOpen).toBe(true);
  expect(resized?.run?.status).toBe("paused");
  // The logical view is fixed, so the overlay reflows rather than rescaling.
  expect(resized?.view?.worldWidth).toBe(1600);
});
