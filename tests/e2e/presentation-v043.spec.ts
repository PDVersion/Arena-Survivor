import { clickSettingControl } from "./settings-controls";
import { expect, test, type Page } from "@playwright/test";

async function state(page: Page) { return page.evaluate(() => window.__ARENA_TEST__?.getSnapshot()); }
async function settings(page: Page) {
  await page.keyboard.press("Escape", { delay: 80 });
  for (let i = 0; i < 4; i++) await page.keyboard.press("Tab", { delay: 80 });
  await expect.poll(async () => (await state(page))?.ui?.pauseTab).toBe("settings");
}

test("Low switches reversibly while paused, resizes, respects map opacity and survives restart", async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  await page.goto("/?noContact=1&noXp=1&noHazards=1&runDurationMs=10000&atTimeUp=complete");
  await expect.poll(async () => (await state(page))?.run?.status).toBe("playing");
  const initial = await state(page);
  expect(initial?.ui?.settings.presentationQuality).toBe("default");
  await settings(page);
  const paused = await state(page);
  await clickSettingControl(page, "presentationQuality");
  await expect.poll(async () => (await state(page))?.ui?.settings.presentationQuality).toBe("low");
  await page.setViewportSize({ width: 900, height: 620 });
  // Phaser handles resize on a later frame; do not calculate clicks from its old canvas size.
  await expect.poll(async () => (await page.locator("canvas").boundingBox())?.width).toBe(900);
  await clickSettingControl(page, "reducedMotion"); // reduced motion
  await expect.poll(async () => (await state(page))?.ui?.settings.reducedMotion).toBe(true);
  await clickSettingControl(page, "minimapOpacity"); // .6 -> .85
  await clickSettingControl(page, "minimapOpacity"); // OFF
  await expect.poll(async () => (await state(page))?.ui?.settings.minimapOpacity).toBe(0);
  const held = await state(page);
  expect(held?.run?.elapsedMs).toBe(paused?.run?.elapsedMs);
  expect(held?.view).toMatchObject({ logicalWidth: paused?.view?.logicalWidth, logicalHeight: paused?.view?.logicalHeight, worldWidth: paused?.view?.worldWidth, worldHeight: paused?.view?.worldHeight, zoom: paused?.view?.zoom });
  expect(held?.view?.displayWidth).toBe(900);
  expect(held?.player).toEqual(paused?.player);
  expect(held?.statistics).toEqual(paused?.statistics);
  await clickSettingControl(page, "presentationQuality");
  await expect.poll(async () => (await state(page))?.ui?.settings.presentationQuality).toBe("default");
  await clickSettingControl(page, "presentationQuality");
  await clickSettingControl(page, "minimapOpacity"); // .35
  await page.keyboard.press("Escape", { delay: 80 });
  await expect.poll(async () => (await state(page))?.ui?.minimapVisible).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("low-map.png") });
  await expect.poll(async () => (await state(page))?.run?.status, { timeout: 30_000 }).toBe("complete");
  const generation = (await state(page))?.lifecycle?.runGeneration ?? 0;
  await page.keyboard.press("r", { delay: 80 });
  await expect.poll(async () => (await state(page))?.lifecycle?.runGeneration).toBe(generation + 1);
  expect((await state(page))?.ui?.settings.presentationQuality).toBe("low");
  await settings(page);
  await page.screenshot({ path: testInfo.outputPath("settings.png") });
});

test("title settings carry Low into the next run and level-up hides the map", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/?menu=1&noContact=1&spawnRadius=320");
  await expect.poll(async () => (await state(page))?.menu?.difficulty).toBe("normal");
  const canvas = page.locator("canvas");
  const box = (await canvas.boundingBox())!;
  await canvas.click({ position: { x: box.width / 2, y: box.height * 0.775 } });
  await clickSettingControl(page, "presentationQuality");
  await page.keyboard.press("Escape", { delay: 80 });
  await page.keyboard.press("Enter", { delay: 80 });
  await expect.poll(async () => (await state(page))?.ui?.settings.presentationQuality).toBe("low");
  await expect.poll(async () => (await state(page))?.run?.status, { timeout: 60_000 }).toBe("level_up");
  expect((await state(page))?.ui?.minimapVisible).toBe(false);
  await page.setViewportSize({ width: 1000, height: 700 });
  await page.keyboard.press("1", { delay: 80 });
  await expect.poll(async () => (await state(page))?.run?.status).toBe("playing");
  expect((await state(page))?.ui?.settings.presentationQuality).toBe("low");
});


test("dense map keeps the same world and live population with readable Low markers", async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  await page.goto("/?representativeLoad=1&closeLoad=1&loadHarness=300&noWeapon=1&noContact=1&noXp=1&noHazards=1");
  await expect.poll(async () => (await state(page))?.load?.spawned, { timeout: 30_000 }).toBe(300);
  const before = await state(page);
  await page.screenshot({ path: testInfo.outputPath("dense-default.png") });
  await settings(page);
  await clickSettingControl(page, "presentationQuality");
  await expect.poll(async () => (await state(page))?.ui?.settings.presentationQuality).toBe("low");
  await page.keyboard.press("Escape", { delay: 80 });
  await expect.poll(async () => (await state(page))?.ui?.minimapVisible).toBe(true);
  const after = await state(page);
  expect(after?.run?.liveEnemies).toBe(300);
  expect(after?.view?.worldWidth).toBe(before?.view?.worldWidth);
  expect(after?.view?.worldHeight).toBe(before?.view?.worldHeight);
  expect(after?.combat?.enemyCap).toBe(300);
  expect(after?.statistics?.totalDamage).toBe(before?.statistics?.totalDamage);
  await page.screenshot({ path: testInfo.outputPath("dense-low.png") });
});
