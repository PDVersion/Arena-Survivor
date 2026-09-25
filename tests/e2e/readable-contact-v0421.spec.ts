import { expect, test, type Page } from "@playwright/test";

async function pressUntil(
  page: Page,
  key: string,
  reached: () => Promise<boolean | undefined>,
): Promise<void> {
  for (let press = 0; press < 12; press += 1) {
    if (await reached()) return;
    await page.keyboard.press(key);
    await page.waitForTimeout(120);
  }
  expect(await reached()).toBe(true);
}

test("movement hint dismisses once and the minimap stays in the bottom-right safe area", async ({ page }) => {
  await page.goto("/?noContact&noXp&noHazards");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.movementHintVisible)).toBe(true);

  const initial = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(initial?.ui?.minimapVisible).toBe(true);
  expect(initial?.ui?.minimapBounds?.left).toBeGreaterThan((initial?.canvas.width ?? 0) / 2);
  expect(initial?.ui?.minimapBounds?.top).toBeGreaterThan((initial?.canvas.height ?? 0) / 2);

  await page.keyboard.down("KeyD");
  await page.waitForTimeout(150);
  await page.keyboard.up("KeyD");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.movementHintVisible)).toBe(false);

  await pressUntil(page, "Escape", () => page.evaluate(
    () => window.__ARENA_TEST__?.getSnapshot().ui?.minimapVisible === false,
  ));
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.minimapVisible)).toBe(false);
});

test("movement hint timeout counts active real play rather than paused time", async ({ page }) => {
  await page.goto("/?noContact&noXp&noHazards&movementHintDurationMs=300");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status)).toBe("playing");
  await pressUntil(page, "Escape", () => page.evaluate(
    () => window.__ARENA_TEST__?.getSnapshot().run?.status === "paused",
  ));
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.movementHintVisible)).toBe(true);
  await pressUntil(page, "Escape", () => page.evaluate(
    () => window.__ARENA_TEST__?.getSnapshot().run?.status === "playing",
  ));
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.movementHintVisible)).toBe(false);
});

test("all enemy roles are walk-through while valid contact gives one bounded shove", async ({ page }) => {
  await page.goto("/?enemyRoster=all&spawnRadius=36&noXp&noHazards&debugBodies");
  const start = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().player?.x ?? 0);
  await page.keyboard.down("KeyD");
  await page.waitForTimeout(1_200);
  await page.keyboard.up("KeyD");

  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().crowd?.contactShoves)).toBeGreaterThan(0);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.player?.x ?? 0).toBeGreaterThan(start + 120);
  expect(snapshot?.crowd?.solidResolutions).toBe(0);
  expect(Object.values(snapshot?.combat?.rosterHighWater ?? {}).filter((count) => count > 0)).toHaveLength(5);
});

test("Collection Sweep triggers from completed grabber attacks without projectiles", async ({ page }) => {
  await page.goto("/?loadHarness=24&loadRole=enemy.slow_durable&closeLoad&lineLoad&noContact&noXp&noHazards&collectionSweepLevel=1&attackSpeedBonus=8");
  await expect.poll(
    () => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.collectionSweepsTriggered),
    { timeout: 15_000 },
  ).toBeGreaterThan(0);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.combat?.collectionSweepAttacks).toBeGreaterThanOrEqual(8);
  expect(snapshot?.combat?.collectionSweepHits).toBeGreaterThan(0);
  expect(snapshot?.combat?.projectiles).toBe(0);
});
