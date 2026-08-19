import { expect, test, type Page } from "@playwright/test";
import { activeTheme } from "../../src/game/content/active-theme";

const shrineTuning = activeTheme.tuning.shrines;

function snapshot(page: Page) {
  return page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
}

/**
 * Press a key until the UI reports the state it should move to.
 *
 * A single press is not reliable under a loaded runner: Phaser reads keys on its
 * own frame, and a frame that never ran swallows the press. Pressing until the
 * state actually changes tests the same behaviour without depending on when the
 * next frame happens to land.
 */
async function pressUntil(
  page: Page,
  key: string,
  reached: (snap: Awaited<ReturnType<typeof snapshot>>) => boolean,
  presses = 8,
): Promise<void> {
  for (let press = 0; press < presses; press += 1) {
    if (reached(await snapshot(page))) return;
    await page.keyboard.press(key);
    await page.waitForTimeout(120);
  }
  expect(reached(await snapshot(page))).toBe(true);
}

test("shrines arrive across the run rather than all at the start", async ({ page }) => {
  test.setTimeout(60_000);
  // A short run compresses the whole arrival schedule into the path's budget
  // without changing it: arrivals are normalized progress, not minutes.
  await page.goto("/?runDurationMs=12000&noContact&noXp=1&atTimeUp=complete");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status)).toBe("playing");

  const opening = await snapshot(page);
  expect(opening?.shrine?.plannedCount).toBe(shrineTuning.arrivals.length);
  // The defect being fixed: V0.3 had every instance present from the first frame.
  expect(opening?.shrine?.revealedCount).toBeLessThan(shrineTuning.arrivals.length);
  expect(opening?.shrine?.nextAppearAtMs).toBeGreaterThan(0);

  // Arrivals accumulate rather than landing together.
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().shrine?.revealedCount), {
      timeout: 20_000,
    })
    .toBeGreaterThan(1);
  const midRun = await snapshot(page);
  expect(midRun?.shrine?.revealedCount).toBeLessThan(shrineTuning.arrivals.length);

  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().shrine?.revealedCount), {
      timeout: 25_000,
    })
    .toBe(shrineTuning.arrivals.length);

  const complete = await snapshot(page);
  expect(complete?.shrine?.nextAppearAtMs).toBeNull();

  const instances = complete?.shrine?.instances ?? [];
  expect(instances).toHaveLength(shrineTuning.arrivals.length);
  // Scattered across the stage, not clustered on one spot.
  for (let index = 1; index < instances.length; index += 1) {
    for (let other = 0; other < index; other += 1) {
      const separation = Math.hypot(
        instances[index]!.x - instances[other]!.x,
        instances[index]!.y - instances[other]!.y,
      );
      expect(separation).toBeGreaterThanOrEqual(shrineTuning.minSeparation);
    }
  }
});

test("a restarted run reschedules its shrines from the opening", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/?runDurationMs=3000&noContact&noXp=1&atTimeUp=complete");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().shrine?.revealedCount), {
      timeout: 20_000,
    })
    .toBe(shrineTuning.arrivals.length);
  const generation = (await snapshot(page))?.lifecycle?.runGeneration ?? 0;

  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 15_000,
    })
    .toBe("complete");
  await page.keyboard.press("KeyR");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().lifecycle?.runGeneration))
    .toBe(generation + 1);

  const restarted = await snapshot(page);
  expect(restarted?.shrine?.revealedCount).toBeLessThan(shrineTuning.arrivals.length);
  expect(restarted?.shrine?.plannedCount).toBe(shrineTuning.arrivals.length);
  expect(restarted?.shrine?.instances.every(({ activated }) => !activated)).toBe(true);
});

test("the codex states what every shrine does", async ({ page }) => {
  await page.goto("/?noContact&noXp=1&spawnRadius=320&atTimeUp=complete");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status)).toBe("playing");

  await page.keyboard.press("Escape");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.pauseOpen)).toBe(true);

  // The tab is reachable by keyboard alone, like every other pause tab.
  await pressUntil(page, "Tab", (snap) => snap?.ui?.pauseTab === "codex");

  const entries = (await snapshot(page))?.ui?.codexEntries ?? [];
  expect(entries).toHaveLength(activeTheme.shrines.length);
  for (const shrine of activeTheme.shrines) {
    const entry = entries.find((candidate) => candidate.id === shrine.id);
    expect(entry?.name).toBe(activeTheme.copy.content[shrine.id].name);
    // Identity alone is not the point: the entry has to say what it does.
    expect(entry?.effects.length).toBeGreaterThan(0);
  }

  const surge = entries.find((entry) => entry.id === "shrine.spawn_surge");
  expect(surge?.effects.map((effect) => effect.display)).toContain("100 over 20s");
});

test("the Field Guide catalogues the upgrade pool and the session so far", async ({ page }) => {
  test.setTimeout(150_000);
  // `closeLoad` puts enemies beside the player so this path spends its budget on
  // the Field Guide rather than on waiting for the first level-up. See REC-049.
  await page.goto("/?noContact&closeLoad=1&loadHarness=60&critChance=0.6&pierce=4&atTimeUp=complete");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status)).toBe("playing");

  // Take one upgrade, so the catalogue has something real to count. The budget
  // is wall time against a runner that simulates at roughly a fifth of it, not
  // against how long the level-up takes locally: this needed two CI retries at
  // 40 s. See REC-041.
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 90_000,
    })
    .toBe("level_up");
  const takenId = (await snapshot(page))?.progression?.choiceIds?.[0];

  // Drain every queued choice rather than assuming one press returns the run to
  // `playing`: at this XP income the next level-up is usually already waiting,
  // and pausing needs a run that is actually running.
  for (let press = 0; press < 12; press += 1) {
    if ((await snapshot(page))?.run?.status !== "level_up") break;
    await page.keyboard.press("Digit1");
    await page.waitForTimeout(150);
  }
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 30_000,
    })
    .toBe("playing");

  await page.keyboard.press("Escape");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.pauseOpen)).toBe(true);
  await pressUntil(page, "Tab", (snap) => snap?.ui?.pauseTab === "codex");
  expect((await snapshot(page))?.ui?.codexSection).toBe("shrines");

  // Down moves within the Field Guide; Tab and left/right still move tabs.
  await pressUntil(page, "ArrowDown", (snap) => snap?.ui?.codexSection === "equipment");
  expect((await snapshot(page))?.ui?.pauseTab).toBe("codex");

  const upgrades = (await snapshot(page))?.ui?.codexUpgrades ?? [];
  expect(upgrades.length).toBe(activeTheme.upgrades.length);
  for (const upgrade of activeTheme.upgrades) {
    const entry = upgrades.find((candidate) => candidate.id === upgrade.id);
    // Every entry is listed whether or not it has been taken, and its per-run
    // cap comes from the definition rather than being written twice.
    expect(entry?.maxPerRun).toBe(upgrade.maxLevel);
  }
  const taken = upgrades.find((entry) => entry.id === takenId);
  expect(taken?.sessionTotal).toBeGreaterThan(0);
  expect(taken?.bestInRun).toBeGreaterThan(0);

  await pressUntil(page, "ArrowDown", (snap) => snap?.ui?.codexSection === "session");
  const session = (await snapshot(page))?.ui?.codexSession ?? [];
  expect(session.length).toBeGreaterThan(0);
  for (const line of session) {
    expect(line.label.trim()).not.toBe("");
    expect(line.display.trim()).not.toBe("");
  }
  // Total damage is a session figure, and the run has been dealing damage.
  const damage = session.find((line) => line.label === activeTheme.copy.vocabulary.totalDamage);
  expect(Number(damage?.display)).toBeGreaterThan(0);
});
