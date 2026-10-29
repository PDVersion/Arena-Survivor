import { clickSettingControl } from "./settings-controls";
import { expect, test } from "@playwright/test";
import { activeTheme } from "../../src/game/content/active-theme";
import { difficultyIds } from "../../src/game/core/archetypes/difficulty";
import { resolveDifficultyTheme } from "../../src/game/systems/difficulty/resolve-difficulty";

for (const [index, difficulty] of difficultyIds.entries()) {
  test(`title selection starts and restarts ${difficulty} with the resolved stats`, async ({ page }) => {
    await page.goto("/?menu=1&noContact=1&noXp=1&noHazards=1&runDurationMs=1500&atTimeUp=complete");
    await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().menu?.difficulty)).toBe("normal");
    await page.keyboard.press(String(index + 1));
    await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().menu?.difficulty)).toBe(difficulty);
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.difficulty)).toBe(difficulty);
    const themed = resolveDifficultyTheme(activeTheme, difficulty);
    const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
    expect(snapshot?.player?.maxHealth).toBe(themed.characters[0]!.baseStats.maxHealth);
    expect(snapshot?.player?.moveSpeed).toBe(themed.characters[0]!.baseStats.moveSpeed);
    expect(snapshot?.pacing?.baseSpawnIntervalMs).toBe(themed.tuning.director.baseIntervalMs);
    expect(snapshot?.view?.worldTextResolution).toBe(4);
    await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), { timeout: 30_000 }).toBe("complete");
    const generation = snapshot?.lifecycle?.runGeneration ?? 0;
    await page.keyboard.press("r");
    await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().lifecycle?.runGeneration)).toBe(generation + 1);
    expect(await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.difficulty)).toBe(difficulty);
  });
}

test("changing difficulty while paused takes effect on the next run", async ({ page }) => {
  await page.goto("/?noContact=1&noXp=1&noHazards=1&runDurationMs=1500&atTimeUp=complete");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.difficulty)).toBe("normal");
  const opening = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  await page.keyboard.press("Escape");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.pauseOpen)).toBe(true);
  for (const tab of ["upgrades", "world", "codex", "settings"]) {
    await page.keyboard.down("Tab");
    try { await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.pauseTab)).toBe(tab); }
    finally { await page.keyboard.up("Tab"); }
  }
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.pauseTab)).toBe("settings");
  await clickSettingControl(page, "difficulty");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.settings.difficulty)).toBe("experienced");
  const paused = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(paused?.run?.difficulty).toBe("normal");
  expect(paused?.pacing?.baseSpawnIntervalMs).toBe(opening?.pacing?.baseSpawnIntervalMs);
  await page.keyboard.press("Escape");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), { timeout: 30_000 }).toBe("complete");
  await page.keyboard.press("r");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.difficulty)).toBe("experienced");
  expect(await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().pacing?.baseSpawnIntervalMs))
    .toBe(resolveDifficultyTheme(activeTheme, "experienced").tuning.director.baseIntervalMs);
});
