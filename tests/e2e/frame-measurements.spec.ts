import { expect, test } from "@playwright/test";

test("wall frame measurement stays separate from the half-speed simulation and pause", async ({ page }) => {
  await page.goto("/?frameMeasure=1&noContact=1&noXp=1");
  await expect.poll(() => page.evaluate(
    () => window.__ARENA_TEST__?.getSnapshot().load?.frameSamples,
  )).toBeGreaterThan(10);
  const measured = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(measured?.pacing?.gameplayRate).toBe(0.5);
  expect(measured?.load?.clock).toBe("phaser-raw-wall-ms");
  expect(measured?.load?.averageFrameMs).toBeGreaterThan(0);
  expect(measured?.load?.averageSimulationDeltaMs).toBeGreaterThan(0);
  expect(measured?.load?.averageUpdateCpuMs).toBeGreaterThan(0);
  // Compare units, not hardware throughput. Smoothing means this isn't exactly 2x.
  expect(measured!.load!.averageFrameMs).toBeGreaterThan(measured!.load!.averageSimulationDeltaMs);
  await page.keyboard.press("Escape");
  await expect.poll(() => page.evaluate(
    () => window.__ARENA_TEST__?.getSnapshot().run?.status,
  )).toBe("paused");
  const paused = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().load);
  expect(paused?.distribution?.windowSamples).toBe(paused?.frameSamples);
  expect(paused?.distribution?.wall.p50Ms).toBeGreaterThan(0);
  await page.waitForTimeout(250);
  const afterPause = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().load);
  expect(afterPause?.frameSamples).toBe(paused?.frameSamples);
  expect(afterPause?.averageFrameMs).toBe(paused?.averageFrameMs);
  await page.keyboard.press("Escape");
  await expect.poll(() => page.evaluate(
    () => window.__ARENA_TEST__?.getSnapshot().load?.frameSamples,
  )).toBeGreaterThan(paused!.frameSamples);
});
