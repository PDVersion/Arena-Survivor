import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("portable diagnostic pack exports a real bounded sample and build identity", async ({ page }, testInfo) => {
  test.skip(!testInfo.config.configFile?.endsWith("playwright.device-pack.config.ts"), "Explicit device-pack verification only");
  test.setTimeout(100000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.locator("#device").fill("M5 verification only; no older-device acceptance");
  await page.locator("#scenario").selectOption("60");
  await page.locator("#load").click();
  const game = page.frameLocator("#game");
  await expect(game.locator("canvas")).toHaveCount(1);
  await expect.poll(() => page.locator("#game").evaluate((element) =>
    (element as HTMLIFrameElement).contentWindow?.__ARENA_TEST__?.getSnapshot().run?.status)).toBe("playing");
  await page.locator("#record").click();
  await expect(page.locator("#download")).toBeEnabled({ timeout: 85000 });
  const downloaded = page.waitForEvent("download");
  await page.locator("#download").click();
  const path = testInfo.outputPath("device-result.json");
  await (await downloaded).saveAs(path);
  const result = JSON.parse(await readFile(path, "utf8"));
  expect(result.schema).toBe("arena-device-evidence-v1");
  expect(result.source.mode).toBe("test");
  expect(result.source.revision).toMatch(/^[0-9a-f]{40}$/);
  expect(Object.keys(result.source.files).length).toBeGreaterThan(5);
  expect(result.acceptance).toContain("unreviewed");
  expect(result.reason).toBe("60-second window complete");
  expect(result.wallWindowMs).toBeGreaterThanOrEqual(60000);
  expect(result.measurement.clock).toBe("browser-raf-wall-ms");
  expect(result.measurement).not.toHaveProperty("averageUpdateCpuMs");
  expect(result.measurement.frameSamples).toBeGreaterThan(100);
  expect(result.measurement.distribution.wall.p95Ms).toBeGreaterThan(0);
  expect(result.qualities).toEqual(["default"]);
  expect(result.end.load.spawned).toBe(60);
  expect(result.end.run.liveEnemies).toBe(60);
  expect(result.end.pacing.gameplayRate).toBe(0.5);
  expect(result.end.statistics.totalDamage).toBe(0);
  expect(errors).toEqual([]);
  await testInfo.attach("device-result", { path, contentType: "application/json" });
});

test("portable server refuses traversal beyond its artifact root", async ({ request }, testInfo) => {
  test.skip(!testInfo.config.configFile?.endsWith("playwright.device-pack.config.ts"), "Explicit device-pack verification only");
  const response = await request.get("/%2e%2e%2fREADME.txt");
  expect(response.status()).toBe(403);
});
