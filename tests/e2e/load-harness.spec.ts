import { expect, test } from "@playwright/test";

test("load harness retains and processes scripted spawn work", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?loadHarness=80");
  await expect.poll(async () => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().load?.spawned), { timeout: 20_000 }).toBe(80);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.load).toMatchObject({
    enabled: true,
    requested: 80,
    spawned: 80,
    eventBacklog: 0,
    eventBacklogHighWater: 80,
    processedEffects: 80,
    droppedPresentationCues: 0,
    liveHighWater: 80,
  });
  expect(snapshot?.run?.liveEnemies).toBeLessThanOrEqual(snapshot?.combat?.enemyCap ?? 0);
  expect(errors).toEqual([]);
});
