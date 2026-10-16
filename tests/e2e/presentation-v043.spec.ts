import { expect, test, type Page } from "@playwright/test";

async function state(page: Page) { return page.evaluate(() => window.__ARENA_TEST__?.getSnapshot()); }
async function clickRow(page: Page, row: number) {
  const canvas = page.locator("canvas");
  const box = (await canvas.boundingBox())!;
  await canvas.click({ position: { x: 1230 * box.width / 1600, y: (232.5 + 55 * row) * box.height / 900 } });
}
async function settings(page: Page) {
  await page.keyboard.press("Escape");
  for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
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
  await clickRow(page, 5);
  await expect.poll(async () => (await state(page))?.ui?.settings.presentationQuality).toBe("low");
  await page.setViewportSize({ width: 900, height: 620 });
  await clickRow(page, 1); // reduced motion
  await expect.poll(async () => (await state(page))?.ui?.settings.reducedMotion).toBe(true);
  await clickRow(page, 3); // .6 -> .85
  await clickRow(page, 3); // OFF
  await expect.poll(async () => (await state(page))?.ui?.settings.minimapOpacity).toBe(0);
  const held = await state(page);
  expect(held?.run?.elapsedMs).toBe(paused?.run?.elapsedMs);
  expect(held?.view).toMatchObject({ logicalWidth: paused?.view?.logicalWidth, logicalHeight: paused?.view?.logicalHeight, worldWidth: paused?.view?.worldWidth, worldHeight: paused?.view?.worldHeight, zoom: paused?.view?.zoom });
  expect(held?.view?.displayWidth).toBe(900);
  expect(held?.player).toEqual(paused?.player);
  expect(held?.statistics).toEqual(paused?.statistics);
  await clickRow(page, 5);
  await expect.poll(async () => (await state(page))?.ui?.settings.presentationQuality).toBe("default");
  await clickRow(page, 5);
  await clickRow(page, 3); // .35
  await page.keyboard.press("Escape");
  await expect.poll(async () => (await state(page))?.ui?.minimapVisible).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("low-map.png") });
  await expect.poll(async () => (await state(page))?.run?.status, { timeout: 30_000 }).toBe("complete");
  const generation = (await state(page))?.lifecycle?.runGeneration ?? 0;
  await page.keyboard.press("r");
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
  await clickRow(page, 5);
  await page.keyboard.press("Escape");
  await page.keyboard.press("Enter");
  await expect.poll(async () => (await state(page))?.ui?.settings.presentationQuality).toBe("low");
  await expect.poll(async () => (await state(page))?.run?.status, { timeout: 60_000 }).toBe("level_up");
  expect((await state(page))?.ui?.minimapVisible).toBe(false);
  await page.setViewportSize({ width: 1000, height: 700 });
  await page.keyboard.press("1");
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
  await clickRow(page, 5);
  await expect.poll(async () => (await state(page))?.ui?.settings.presentationQuality).toBe("low");
  await page.keyboard.press("Escape");
  await expect.poll(async () => (await state(page))?.ui?.minimapVisible).toBe(true);
  const after = await state(page);
  expect(after?.run?.liveEnemies).toBe(300);
  expect(after?.view?.worldWidth).toBe(before?.view?.worldWidth);
  expect(after?.view?.worldHeight).toBe(before?.view?.worldHeight);
  expect(after?.combat?.enemyCap).toBe(300);
  expect(after?.statistics?.totalDamage).toBe(before?.statistics?.totalDamage);
  await page.screenshot({ path: testInfo.outputPath("dense-low.png") });
});
