import { expect, test, type Page } from "@playwright/test";

async function waitForRun(page: Page): Promise<void> {
  await page.goto("/");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");
}

test("movement is normalized and the camera follows the player", async ({ page }) => {
  await waitForRun(page);
  const initial = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());

  await page.keyboard.down("KeyW");
  await page.keyboard.down("KeyD");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().player))
    .toMatchObject({ velocityX: 141.42135623730948, velocityY: -141.42135623730948 });
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().camera?.scrollX))
    .toBeGreaterThan(initial?.camera?.scrollX ?? Number.POSITIVE_INFINITY);
  await page.keyboard.up("KeyW");
  await page.keyboard.up("KeyD");

  const moved = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(moved?.player?.x).toBeGreaterThan(initial?.player?.x ?? Number.POSITIVE_INFINITY);
  expect(moved?.player?.y).toBeLessThan(initial?.player?.y ?? Number.NEGATIVE_INFINITY);
  expect(moved?.camera?.scrollX).toBeGreaterThan(initial?.camera?.scrollX ?? Number.POSITIVE_INFINITY);
});

test("opposing movement inputs cancel", async ({ page }) => {
  await waitForRun(page);
  await page.keyboard.down("KeyA");
  await page.keyboard.down("KeyD");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().player?.velocityX))
    .toBe(0);
  await page.keyboard.up("KeyA");
  await page.keyboard.up("KeyD");
});

test("arena boundaries contain the player body", async ({ page }) => {
  test.setTimeout(15_000);
  await waitForRun(page);
  await page.keyboard.down("ArrowRight");
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const snapshot = window.__ARENA_TEST__?.getSnapshot();
          if (!snapshot?.player || !snapshot.arena) return false;
          return snapshot.player.x >= snapshot.arena.width - snapshot.player.radius - 0.5;
        }),
      { timeout: 8000 },
    )
    .toBe(true);
  await page.keyboard.up("ArrowRight");

  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.player?.x).toBeLessThanOrEqual(
    (snapshot?.arena?.width ?? 0) - (snapshot?.player?.radius ?? 0),
  );
});

test("pause stops movement and simulation time until resumed", async ({ page }) => {
  await waitForRun(page);
  await page.keyboard.press("Escape");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("paused");

  const paused = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(250);
  await page.keyboard.up("ArrowRight");
  const stillPaused = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());

  expect(stillPaused?.player?.x).toBe(paused?.player?.x);
  expect(stillPaused?.run?.elapsedMs).toBe(paused?.run?.elapsedMs);

  await page.keyboard.press("Escape");
  await page.keyboard.down("ArrowRight");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().player?.x))
    .toBeGreaterThan(paused?.player?.x ?? Number.POSITIVE_INFINITY);
  await page.keyboard.up("ArrowRight");
});
