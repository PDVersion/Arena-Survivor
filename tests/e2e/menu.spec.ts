import { expect, test, type Page } from "@playwright/test";
import { activeTheme } from "../../src/game/content/active-theme";

// Declared here rather than imported: `config.ts` pulls in Phaser, which cannot
// load in Playwright's Node runner. Mirrors `tests/unit/director`.
const LOGICAL_VIEW = { width: 1600, height: 900 };

function snapshot(page: Page) {
  return page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
}

// Every other browser path goes straight to the run, so this file is the only
// coverage of the title screen and of the transition out of it. See BootScene.
test("the game opens on a title screen rather than a live run", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/?menu=1");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().scene)).toBe("menu");

  const menu = await snapshot(page);
  expect(menu?.menu).toMatchObject({
    title: activeTheme.copy.gameTitle,
    startAction: activeTheme.copy.vocabulary.startAction,
    runsPlayed: 0,
  });
  // Nothing is simulating yet: the player is not being attacked on arrival.
  expect(menu?.run).toBeUndefined();
  expect(consoleErrors).toEqual([]);
});

test("Enter leaves the menu for a live run", async ({ page }) => {
  await page.goto("/?menu=1&spawnRadius=320");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().scene)).toBe("menu");

  await page.keyboard.press("Enter");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().scene), { timeout: 15_000 })
    .toBe("run");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");

  // A real run, not a frozen one: the simulation actually advances.
  const opening = await snapshot(page);
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.elapsedMs))
    .toBeGreaterThan(opening?.run?.elapsedMs ?? 0);
});

test("clicking the start button also begins a run", async ({ page }) => {
  await page.goto("/?menu=1&spawnRadius=320");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().scene)).toBe("menu");

  // The canvas letterboxes a fixed logical view, so the button's logical
  // position is converted through the rendered scale rather than guessed.
  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  const scale = (box?.width ?? LOGICAL_VIEW.width) / LOGICAL_VIEW.width;
  await canvas.click({
    position: { x: (LOGICAL_VIEW.width / 2) * scale, y: LOGICAL_VIEW.height * 0.52 * scale },
  });
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), {
      timeout: 15_000,
    })
    .toBe("playing");
});
