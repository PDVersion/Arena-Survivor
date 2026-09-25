import { expect, test } from "@playwright/test";

const spritePaths = [
  "/sprites/eco-guardian/atlas.png",
  "/sprites/eco-guardian/atlas.json",
] as const;

test("the accepted player and enemy roster load together in a live run", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?enemyRoster=all&noContact=1&noXp=1&noHazards=1");

  await expect.poll(async () => {
    const roster = await page.evaluate(
      () => window.__ARENA_TEST__?.getSnapshot().combat?.rosterHighWater,
    );
    return roster ? Object.values(roster).filter((count) => count > 0).length : 0;
  }).toBe(5);

  const loaded = await page.evaluate(() =>
    performance.getEntriesByType("resource").map((entry) => new URL(entry.name).pathname),
  );
  for (const path of spritePaths) expect(loaded).toContain(path);
  expect(loaded.filter((path) => path.startsWith("/sprites/eco-guardian/"))).toHaveLength(2);
  expect(errors).toEqual([]);
});

test("the player holds a walk pose and mirrors right while restoring the regular left pose", async ({ page }) => {
  await page.goto("/?noContact=1&noXp=1&noHazards=1");
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status))
    .toBe("playing");

  await page.keyboard.down("ArrowRight");
  await expect
    .poll(() =>
      page.evaluate(() => {
        const player = window.__ARENA_TEST__?.getSnapshot().player;
        return player?.velocityX && player.velocityX > 0
          ? { walking: player.spriteFrame !== 4, mirrored: player.spriteMirrored }
          : null;
      }),
    )
    .toEqual({ walking: true, mirrored: true });
  await page.keyboard.up("ArrowRight");

  await page.keyboard.down("ArrowLeft");
  await expect
    .poll(() =>
      page.evaluate(() => {
        const player = window.__ARENA_TEST__?.getSnapshot().player;
        return player?.velocityX && player.velocityX < 0 ? player.spriteMirrored : null;
      }),
    )
    .toBe(false);
  await page.keyboard.up("ArrowLeft");

  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().player?.spriteFrame))
    .toBe(4);
});
