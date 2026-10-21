import { readFile, writeFile } from "node:fs/promises";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const CURRENT = "arena-survivor.profile";
const BACKUP = "arena-survivor.profile.backup";
const pageErrors = new WeakMap<Page, string[]>();
const browserVersions = new WeakMap<Page, string>();
test.beforeEach(({ page, browser }) => { browserVersions.set(page, browser.version()); const errors: string[] = []; pageErrors.set(page, errors); page.on("pageerror", (error) => errors.push(error.message)); });

declare global { interface Window { __C7_SAVE_UI_CLEANUP__?: () => void } }

async function stored(page: Page) {
  return page.evaluate(({ CURRENT, BACKUP }) => ({ current: localStorage.getItem(CURRENT), backup: localStorage.getItem(BACKUP) }), { CURRENT, BACKUP });
}
async function currentProfile(page: Page) {
  return page.evaluate(async () => {
    const path = "/src/game/systems/persistence/profile-service.ts";
    const service = await import(path); return service.getProfile();
  });
}
async function showFixture(page: Page, themeKey = "eco-guardian") {
  await page.goto("/sprite-browser.html");
  await page.evaluate(async (themeKey) => {
    const paths = ["/src/game/content/theme-registry.ts", "/src/game/systems/persistence/profile-service.ts", "/src/game/ui/save-manager-ui.ts", "/src/style.css"];
    const [{ themeRegistry }, service, { SaveManagerUi }] = await Promise.all(paths.map((path) => import(path)));
    const theme = themeRegistry.find((entry: { key: string }) => entry.key === themeKey).theme;
    document.getElementById("sprite-browser")!.style.display = "none";
    service.initializeProfile(theme);
    const ui = new SaveManagerUi(theme, () => {}); ui.show();
    window.__C7_SAVE_UI_CLEANUP__ = () => ui.destroy();
  }, themeKey);
  await expect(page.getByRole("dialog", { name: "Manage Save" })).toBeVisible();
}
async function candidateCode(page: Page) {
  return page.evaluate(async () => {
    const paths = ["/src/game/systems/persistence/profile-service.ts", "/src/game/systems/persistence/save-codec.ts"];
    const [service, codec] = await Promise.all(paths.map((path) => import(path)));
    const profile = service.getProfile();
    const candidate = { ...profile, statistics: { ...profile.statistics, runsPlayed: 2, totalKills: 25, totalDamage: 123.5, bestLevel: 7, bestKills: 20, bestDamage: 100 },
      completedRuns: 1, deaths: 1, bestDurationMs: 300000,
      unlockedWeaponIds: [...new Set([...profile.unlockedWeaponIds, "weapon.secondary", "weapon.future_fixture"])],
      settings: { ...profile.settings, difficulty: "experienced", presentationQuality: "low", muted: true } };
    return { code: await codec.encodeProfile(candidate), candidate };
  });
}
async function previewPaste(page: Page, code: string) {
  await page.getByLabel("Save code", { exact: true }).fill(code);
  await page.getByRole("button", { name: "Preview Import", exact: true }).click();
  await expect(page.getByRole("button", { name: "Confirm Import", exact: true })).toBeVisible();
  return page.getByRole("region", { name: "Review replacement" }).innerText();
}
async function evidence(page: Page, info: TestInfo, details: unknown) {
  const environment = await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("#game-container canvas");
    const gl = canvas ? (canvas.getContext("webgl2") || canvas.getContext("webgl")) : null;
    const extension = gl?.getExtension("WEBGL_debug_renderer_info");
    return { userAgent: navigator.userAgent, dpr: devicePixelRatio,
      renderer: gl ? (extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)) : "native DOM; no game renderer" };
  });
  const result = { details, stored: await stored(page), environment, browserVersion: browserVersions.get(page), viewport: page.viewportSize(), mode: "test", nativeDom: true, errors: pageErrors.get(page) };
  await writeFile(info.outputPath("evidence.json"), JSON.stringify(result, null, 2));
  await info.attach("save evidence", { body: JSON.stringify(result, null, 2), contentType: "application/json" });
}

test.afterEach(async ({ page }) => { await page.evaluate(() => window.__C7_SAVE_UI_CLEANUP__?.()).catch(() => {}); expect(pageErrors.get(page)).toEqual([]); });

test("title Settings opens save management without a fourth menu action and exports equivalent code", async ({ page, context }, info) => {
  test.setTimeout(30_000);
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/?menu=1");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().scene)).toBe("menu");
  const canvas = page.locator("canvas"); const box = await canvas.boundingBox();
  const scale = box!.width / 1600;
  await canvas.click({ position: { x: 800 * scale, y: 698 * scale } });
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().menu?.overlayTab)).toBe("settings");
  await canvas.click({ position: { x: 800 * scale, y: 565 * scale } });
  const dialog = page.getByRole("dialog", { name: "Manage Save" }); await expect(dialog).toBeVisible();
  expect(await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().menu?.actions)).toEqual(["start", "info", "settings"]);
  const before = await stored(page);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Save", exact: true }).click();
  const download = await downloadPromise; expect(download.suggestedFilename()).toBe("arena-survivor-save.txt");
  await download.saveAs(info.outputPath("arena-survivor-save.txt"));
  const downloaded = await readFile(info.outputPath("arena-survivor-save.txt"), "utf8");
  expect(downloaded).toBe(await page.getByLabel("Save code", { exact: true }).inputValue());
  await page.getByRole("button", { name: "Copy Code", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(downloaded);
  expect(await stored(page)).toEqual(before);
  // Deterministic denied-clipboard collaborator; not native permission acceptance.
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new DOMException("Denied", "NotAllowedError")) } }));
  await page.getByRole("button", { name: "Copy Code", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Copy the selected save code manually");
  expect(await page.getByLabel("Save code", { exact: true }).inputValue()).toBe(downloaded);
  expect(await page.getByLabel("Save code", { exact: true }).evaluate((element) => ({ start: (element as HTMLTextAreaElement).selectionStart, end: (element as HTMLTextAreaElement).selectionEnd }))).toEqual({ start: 0, end: downloaded.length });
  await page.getByLabel("Save code", { exact: true }).focus(); await page.keyboard.press("Enter");
  expect(await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().scene)).toBe("menu");
  await page.setViewportSize({ width: 900, height: 650 });
  await page.screenshot({ path: info.outputPath("save-export.png") });
  await page.getByRole("button", { name: "Close", exact: true }).click(); await expect(dialog).not.toBeVisible();
  expect(await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().menu?.overlayTab)).toBe("settings");
  expect(errors).toEqual([]);
  await evidence(page, info, { downloadedBytes: Buffer.byteLength(downloaded), errors, exportsPreserveStorage: true, keyboardStayedOnMenu: true });
});

for (const themeKey of ["eco-guardian", "knight-magic"]) test(`${themeKey} paste and file share a preview, cancel preserves, confirmation backs up and reloads`, async ({ page }, info) => {
  test.setTimeout(30_000);
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  await showFixture(page, themeKey);
  const before = await stored(page); const { code, candidate } = await candidateCode(page);
  const pastePreview = await previewPaste(page, code);
  expect(pastePreview).toContain("weapon.future_fixture");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(await stored(page)).toEqual(before);
  await page.getByLabel("Save file", { exact: true }).setInputFiles({ name: "progress.txt", mimeType: "text/plain", buffer: Buffer.from(code) });
  await expect(page.getByRole("button", { name: "Confirm Import", exact: true })).toBeVisible();
  const filePreview = await page.getByRole("region", { name: "Review replacement" }).innerText();
  expect(filePreview).toBe(pastePreview);
  expect(await stored(page)).toEqual(before);
  await page.screenshot({ path: info.outputPath("save-import-preview.png") });
  await page.getByRole("button", { name: "Confirm Import", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("replaced");
  const installed = await currentProfile(page); expect(installed).toEqual(candidate);
  const changed = await stored(page); expect(JSON.parse(changed.backup!)).toEqual(JSON.parse(before.current!));
  await page.reload();
  const restored = await page.evaluate(async (themeKey) => {
    const paths = ["/src/game/content/theme-registry.ts", "/src/game/systems/persistence/profile-service.ts"];
    const [{ themeRegistry }, service] = await Promise.all(paths.map((path) => import(path)));
    const theme = themeRegistry.find((entry: { key: string }) => entry.key === themeKey).theme;
    service.initializeProfile(theme); return service.getProfile();
  }, themeKey);
  expect(restored).toEqual(candidate); expect(restored.unlockedWeaponIds).toContain("weapon.future_fixture");
  expect(errors).toEqual([]);
  await evidence(page, info, { themeKey, pastePreview, filePreview, reload: restored, errors });
});

test("invalid and oversized portable input preserves both saved copies", async ({ page }, info) => {
  test.setTimeout(30_000);
  await showFixture(page);
  const before = await stored(page); const { code } = await candidateCode(page);
  const lines = code.split("\n"); lines[lines.length - 1] = "0".repeat(64);
  const invalid = ["", "not a save", code.slice(0, -10), lines.join("\n"), code.replace("ARENA-SURVIVOR-SAVE:1", "ARENA-SURVIVOR-SAVE:99")];
  for (const value of invalid) {
    await page.getByLabel("Save code", { exact: true }).fill(value);
    await page.getByRole("button", { name: "Preview Import", exact: true }).click();
    await expect(page.getByRole("alert")).not.toBeEmpty();
    await expect(page.getByRole("button", { name: "Confirm Import", exact: true })).not.toBeVisible();
    expect(await stored(page)).toEqual(before);
  }
  await page.getByLabel("Save file", { exact: true }).setInputFiles({ name: "oversized.txt", mimeType: "text/plain", buffer: Buffer.alloc(350 * 1024 + 1, "x") });
  await expect(page.getByRole("alert")).toContainText("too large"); expect(await stored(page)).toEqual(before);
  await page.screenshot({ path: info.outputPath("save-invalid.png") });
  await evidence(page, info, { invalidCases: invalid.length, oversizeRejectedBeforeRead: true, unchanged: true });
});

test("restore and reset require their own confirmation and retain a recoverable backup", async ({ page }, info) => {
  test.setTimeout(30_000);
  await showFixture(page); const before = await stored(page); const { code, candidate } = await candidateCode(page);
  await previewPaste(page, code); await page.getByRole("button", { name: "Confirm Import", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("replaced");
  const imported = await stored(page);
  await page.getByRole("button", { name: "Restore Backup", exact: true }).click();
  await expect(page.getByRole("button", { name: "Confirm Restore", exact: true })).toBeVisible();
  expect(await stored(page)).toEqual(imported);
  await page.getByRole("button", { name: "Cancel", exact: true }).click(); expect(await currentProfile(page)).toEqual(candidate);
  await page.getByRole("button", { name: "Restore Backup", exact: true }).click();
  await page.getByRole("button", { name: "Confirm Restore", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("replaced");
  expect(await currentProfile(page)).toEqual(JSON.parse(before.current!));
  expect(JSON.parse((await stored(page)).backup!)).toEqual(candidate);
  const restored = await stored(page);
  await page.getByRole("button", { name: "Reset Progress", exact: true }).click();
  await expect(page.getByRole("button", { name: "Confirm Reset", exact: true })).toBeVisible(); expect(await stored(page)).toEqual(restored);
  await page.getByRole("button", { name: "Cancel", exact: true }).click(); expect(await stored(page)).toEqual(restored);
  await page.getByRole("button", { name: "Reset Progress", exact: true }).click();
  await page.getByRole("button", { name: "Confirm Reset", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("replaced");
  const reset = await currentProfile(page); expect(reset.statistics.runsPlayed).toBe(0); expect(reset.unlockedWeaponIds).toEqual(["weapon.starter"]);
  expect(JSON.parse((await stored(page)).backup!)).toEqual(JSON.parse(restored.current!));
  await evidence(page, info, { restoreAndResetConfirmation: true, reset });
});
