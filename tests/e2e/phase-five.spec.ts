import { expect, test, type Page } from "@playwright/test";
import { activeTheme } from "../../src/game/content/active-theme";
import { xpRequiredForLevelOn } from "../../src/game/systems/xp";

// Resolved from theme tuning so a curve change is a data edit, not a test edit.
const firstLevelRequirement = xpRequiredForLevelOn(
  activeTheme.tuning.progression.xpCurve,
  1,
);

async function waitForReady(page: Page, path = "/"): Promise<void> {
  await page.goto(path);
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");
}

test("HUD shows health, XP, level, timer, kills, and live enemies", async ({ page }) => {
  await waitForReady(page, "/?runDurationMs=60000");
  const initial = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(initial?.hud).toMatchObject({
    health: "100 / 100",
    experience: `0 / ${firstLevelRequirement}`,
    level: "1",
    time: "1:00",
    kills: "0",
  });
  expect(initial?.hud?.enemies).toBe(String(initial?.run?.liveEnemies));

  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.liveEnemies))
    .toBeGreaterThan(0);
  const active = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(active?.hud?.enemies).toBe(String(active?.run?.liveEnemies));
  expect(active?.feedback?.trailsEmitted).toBeGreaterThanOrEqual(0);
});

test("complete overlay freezes at zero and restart resets without navigation", async ({ page }) => {
  test.setTimeout(90_000);
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await waitForReady(page, "/?runDurationMs=700");
  const navigationCount = await page.evaluate(() => performance.getEntriesByType("navigation").length);

  for (let expectedGeneration = 1; expectedGeneration <= 3; expectedGeneration += 1) {
    await expect
      .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
        timeout: 30_000,
      })
      .toBe("complete");
    const complete = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
    expect(complete?.hud?.time).toBe("0:00");
    expect(complete?.lifecycle).toMatchObject({
      runGeneration: expectedGeneration,
      terminalOverlay: "complete",
    });

    if (expectedGeneration === 3) break;
    await page.keyboard.press("KeyR");
    await expect
      .poll(
        () => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().lifecycle?.runGeneration),
        { timeout: 10_000 },
      )
      .toBe(expectedGeneration + 1);
    await page.keyboard.press("Escape");
    await expect.poll(
      () => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status),
    ).toBe("paused");
    expect(pageErrors).toEqual([]);
    const restarted = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
    expect(restarted?.run).toMatchObject({
      status: "paused",
      kills: 0,
      level: 1,
      xp: 0,
      pendingChoices: 0,
    });
    expect(restarted?.player).toMatchObject({ health: 100, maxHealth: 100, damageBonus: 0 });
    expect(restarted?.progression?.selectedUpgradeIds).toEqual([]);
    expect(restarted?.lifecycle?.terminalOverlay).toBeNull();
    await page.keyboard.press("Escape");
  }

  expect(await page.evaluate(() => performance.getEntriesByType("navigation").length)).toBe(
    navigationCount,
  );
});

test("HUD and run remain coherent through focus loss and resize", async ({ page }) => {
  await waitForReady(page, "/?runDurationMs=60000");
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().lifecycle?.focusPaused))
    .toBe(true);
  const paused = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(paused?.feedback?.focused).toBe(false);
  await page.waitForTimeout(250);
  expect((await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.elapsedMs))).toBe(
    paused?.run?.elapsedMs,
  );

  await page.setViewportSize({ width: 900, height: 600 });
  const resized = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  // Fixed logical view: the canvas keeps its world area and only the letterboxed
  // display size follows the window.
  expect(resized?.canvas).toEqual(paused?.canvas);
  expect(resized?.view?.worldWidth).toBe(paused?.view?.worldWidth);
  expect(resized?.view?.displayWidth).toBeLessThanOrEqual(900);
  expect(resized?.hud).toEqual(paused?.hud);

  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");
  expect(await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().feedback?.focused)).toBe(true);
});
