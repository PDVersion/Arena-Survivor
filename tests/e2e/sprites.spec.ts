import { expect, test } from "@playwright/test";
import { activeTheme } from "../../src/game/content/active-theme";

const rosterIds = activeTheme.enemies.filter((enemy) => !("boss" in enemy && enemy.boss)).map((enemy) => enemy.id).sort();

const spritePaths = [...new Set(Object.values(activeTheme.tokens.sprites ?? {}).flatMap((sprite) =>
  sprite.path.endsWith("/atlas.png") ? [`/${sprite.path}`, `/${sprite.path.replace(/\.png$/, ".json")}`] : [`/${sprite.path}`],
))].sort();

test("the accepted player and enemy roster load together in a live run", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?enemyRoster=all&noContact=1&noXp=1&noHazards=1");

  await expect.poll(async () => {
    const roster = await page.evaluate(
      () => window.__ARENA_TEST__?.getSnapshot().combat?.rosterHighWater,
    );
    return Object.keys(roster ?? {}).filter((id) => (roster?.[id] ?? 0) > 0).sort();
  }).toEqual(rosterIds);

  const loaded = await page.evaluate(() =>
    performance.getEntriesByType("resource").map((entry) => new URL(entry.name).pathname),
  );
  for (const path of spritePaths) expect(loaded).toContain(path);
  expect(loaded.filter((path) => path.startsWith("/sprites/eco-guardian/")).sort()).toEqual(spritePaths);
  expect(errors).toEqual([]);
});

test("the player holds a walk pose with the authored right facing and mirrors left", async ({ page }) => {
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
    .toEqual({ walking: true, mirrored: false });
  await page.keyboard.up("ArrowRight");

  await page.keyboard.down("ArrowLeft");
  await expect
    .poll(() =>
      page.evaluate(() => {
        const player = window.__ARENA_TEST__?.getSnapshot().player;
        return player?.velocityX && player.velocityX < 0 ? player.spriteMirrored : null;
      }),
    )
    .toBe(true);
  await page.keyboard.up("ArrowLeft");

  await expect
    .poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().player?.spriteFrame))
    .toBe(4);
});

test("regenerated player walks through four distinct step frames", async ({ page }, info) => {
  await page.goto("/?noContact=1&noXp=1&noHazards=1");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status)).toBe("playing");
  await page.keyboard.down("ArrowRight");
  const frames = await page.evaluate(async () => {
    const seen = new Set<number>();
    const deadline = performance.now() + 1500;
    while (performance.now() < deadline && seen.size < 4) {
      const frame = window.__ARENA_TEST__?.getSnapshot().player?.spriteFrame;
      if (typeof frame === "number" && frame < 4) seen.add(frame);
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
    return [...seen].sort();
  });
  await page.keyboard.up("ArrowRight");
  expect(frames).toEqual([0,1,2,3]);
  await page.screenshot({ path: info.outputPath("player-gait-live.png") });
});
