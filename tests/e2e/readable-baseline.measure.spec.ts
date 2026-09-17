import { expect, test } from "@playwright/test";

const enabled = process.env.ARENA_LONG_MEASURE === "1";

test("@measurement records the combined readable baseline through two simulated minutes", async ({ page }) => {
  test.skip(!enabled, "Run explicitly with ARENA_LONG_MEASURE=1");
  test.setTimeout(300_000);
  await page.goto("/?noContact=1");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");

  let firstVisibleAtMs: number | null = null;
  let firstGrabAtMs: number | null = null;
  let firstKillAtMs: number | null = null;
  let firstLevelAtMs: number | null = null;
  const occupancy: Record<string, number> = {};

  for (;;) {
    const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
    const elapsedMs = snapshot?.run?.elapsedMs ?? 0;
    if (firstVisibleAtMs === null && (snapshot?.view?.visibleEnemies ?? 0) > 0) firstVisibleAtMs = elapsedMs;
    firstGrabAtMs ??= snapshot?.combat?.firstMeleeHitAtMs ?? null;
    firstKillAtMs ??= snapshot?.combat?.firstKillAtMs ?? null;
    firstLevelAtMs ??= snapshot?.pacing?.levelTimestampsMs?.[0] ?? null;
    if (snapshot?.run?.status === "level_up") await page.keyboard.press("1");
    if (elapsedMs >= 30_000 && occupancy["30s"] === undefined) occupancy["30s"] = snapshot?.view?.visibleEnemies ?? 0;
    if (elapsedMs >= 60_000 && occupancy["60s"] === undefined) occupancy["60s"] = snapshot?.view?.visibleEnemies ?? 0;
    if (elapsedMs >= 120_000) {
      occupancy["120s"] = snapshot?.view?.visibleEnemies ?? 0;
      console.log("V0.4.2 readable baseline", JSON.stringify({
        firstVisibleAtMs,
        firstGrabAtMs,
        firstKillAtMs,
        firstLevelAtMs,
        occupancy,
        peakVisibleEnemies: snapshot?.view?.peakVisibleEnemies,
      }));
      expect(firstVisibleAtMs).not.toBeNull();
      expect(firstGrabAtMs).not.toBeNull();
      expect(firstKillAtMs).not.toBeNull();
      expect(firstLevelAtMs).not.toBeNull();
      expect(snapshot?.view?.peakVisibleEnemies).toBeGreaterThan(0);
      return;
    }
    await page.waitForTimeout(200);
  }
});
