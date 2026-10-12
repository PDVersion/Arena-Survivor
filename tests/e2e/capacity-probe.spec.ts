import { expect, test } from "@playwright/test";

test("benchmark-only capacity can exceed 300 and origin counts reset on restart", async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?representativeLoad&closeLoad&frameMeasure&loadHarness=450&enemyCap=450&noWeapon&noContact&noXp&noHazards&runDurationMs=500&atTimeUp=complete");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().load?.spawned), { timeout: 20_000 }).toBe(450);
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), { timeout: 30_000 }).toBe("complete");
  const before = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(before?.combat?.enemyCap).toBe(450);
  expect(before?.spawnOrigins?.live.benchmark).toBe(450);
  expect(before?.spawnOrigins?.spawned.benchmark).toBe(450);
  expect(before?.spawnOrigins?.spawned.natural).toBe(0);
  await page.keyboard.press("r");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().lifecycle?.runGeneration)).toBe((before?.lifecycle?.runGeneration ?? 0) + 1);
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), { timeout: 30_000 }).toBe("complete");
  expect(await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().spawnOrigins?.spawned.benchmark)).toBe(450);
  expect(errors).toEqual([]);
});
