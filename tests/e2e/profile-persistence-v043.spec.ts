import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
for (const themeKey of ["eco-guardian", "knight-magic"]) test(`${themeKey} durable terminal profile and next-run unlocks`, async ({ page, browser }, testInfo) => {
  test.setTimeout(30000);
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?menu&noAmbient&noContact&noHazards");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().scene)).toBe("menu");
  const result = await page.evaluate(async (key) => {
    const paths = ["/src/game/content/theme-registry.ts", "/src/game/systems/persistence/profile-service.ts", "/src/game/systems/statistics/run-statistics.ts", "/src/game/state/settings-state.ts"];
    const [{ themeRegistry }, service, stats, settings] = await Promise.all(paths.map((path) => import(path)));
    const theme = themeRegistry.find((entry: { key: string }) => entry.key === key).theme;
    service.initializeProfile(theme);
    const before = service.selectRunUpgradePool(theme).map((entry: { id: string }) => entry.id);
    settings.updateSessionSettings({ ...settings.getSessionSettings(), muted: true, difficulty: "experienced", presentationQuality: "low" });
    const newly = service.recordProfileFinishedRun(theme, { level: 5, status: "complete", elapsedMs: 1234, statistics: { ...stats.createRunStatistics(), kills: 25, totalDamage: 123.25 } });
    return { before, newly, after: service.selectRunUpgradePool(theme).map((entry: { id: string }) => entry.id), profile: service.getProfile(), browser: navigator.userAgent };
  }, themeKey);
  expect(result.before).not.toContain("upgrade.equip_secondary"); expect(result.before).not.toContain("upgrade.bloodlust");
  expect(result.newly).toEqual(["weapon.secondary", "upgrade.bloodlust"]); expect(result.after).toContain("upgrade.equip_secondary");
  await page.reload(); await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().menu?.difficulty)).toBe("experienced");
  const restored = await page.evaluate(async () => { const path = "/src/game/systems/persistence/profile-service.ts"; const service = await import(path); return service.getProfile(); });
  expect(restored).toEqual(result.profile);
  await page.screenshot({ path: testInfo.outputPath("restored-title.png") });
  await writeFile(testInfo.outputPath("profile-evidence.json"), JSON.stringify({ result, restored, browserVersion: browser.version(), viewport: page.viewportSize() }, null, 2));
  expect(errors).toEqual([]);
});
test("denied and corrupt storage preserve gameplay startup and source", async ({ page }, testInfo) => {
  test.setTimeout(30000);
  await page.addInitScript(() => Object.defineProperty(window, "localStorage", { get() { throw new DOMException("denied", "SecurityError"); } }));
  await page.goto("/?menu"); await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().scene)).toBe("menu");
  expect(await page.evaluate(async () => { const path = "/src/game/systems/persistence/profile-service.ts"; return (await import(path)).getProfileStatus().mode; })).toBe("memory");
  await page.screenshot({ path: testInfo.outputPath("storage-denied.png") });
});
test("actual short terminal commits once and reload retains earned tool", async ({ page, browser }, testInfo) => {
  test.setTimeout(30000);
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?runDurationMs=1000&noAmbient&noContact&noHazards&noXp&atTimeUp=complete");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status)).toBe("complete");
  const first = await page.evaluate(async () => { const path = "/src/game/systems/persistence/profile-service.ts"; return (await import(path)).getProfile(); });
  expect(first.statistics.runsPlayed).toBe(1); expect(first.completedRuns).toBe(1); expect(first.unlockedWeaponIds).toContain("weapon.secondary");
  await page.screenshot({ path: testInfo.outputPath("actual-terminal-unlock.png") });
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("arena-survivor.profile")!).statistics.runsPlayed)).toBe(1);
  await page.goto("/?menu"); await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().menu?.runsPlayed)).toBe(1);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("arena-survivor.profile")!))).toEqual(first);
  await writeFile(testInfo.outputPath("actual-terminal.json"), JSON.stringify({ profile: first, browserVersion: browser.version(), userAgent: await page.evaluate(() => navigator.userAgent), viewport: page.viewportSize(), rate: 0.5, mode: "test", aid: "legacy short complete ending, noAmbient/noContact/noHazards/noXp" }, null, 2));
  expect(errors).toEqual([]);
});
test("corrupt source and known-good backup remain intact after actual boot", async ({ page }) => {
  test.setTimeout(30000);
  await page.goto("/sprite-browser.html");
  await page.evaluate(() => { localStorage.setItem("arena-survivor.profile", "broken JSON"); localStorage.setItem("arena-survivor.profile.backup", "retained-backup"); });
  await page.goto("/?menu"); await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().scene)).toBe("menu");
  const result = await page.evaluate(async () => { const path = "/src/game/systems/persistence/profile-service.ts"; const service = await import(path); return { status: service.getProfileStatus(), raw: localStorage.getItem("arena-survivor.profile"), backup: localStorage.getItem("arena-survivor.profile.backup") }; });
  expect(result.status.mode).toBe("blocked"); expect(result.raw).toBe("broken JSON"); expect(result.backup).toBe("retained-backup");
});
test("death summary keeps new unlocks, cause and storage warning readable", async ({ page }, testInfo) => {
  test.setTimeout(30000);
  await page.goto("/sprite-browser.html");
  await page.evaluate(async () => {
    const paths = ["/tests/fixtures/phaser-runtime.ts", "/src/game/ui/run-end-overlay.ts", "/src/game/content/active-theme.ts", "/src/game/state/run-state.ts", "/src/game/config.ts"];
    const [{ default: Phaser }, { RunEndOverlay }, { activeTheme }, rules, { createGameConfig }] = await Promise.all(paths.map((path) => import(path)));
    const parent = document.createElement("div"); parent.id = "c6-death"; Object.assign(parent.style, { position: "fixed", inset: "0", zIndex: "9999" }); document.body.append(parent);
    let ready: () => void = () => {}; const shown = new Promise<void>((resolve) => { ready = resolve; });
    class Probe extends Phaser.Scene {
      constructor() { super("c6-death"); }
      create() {
        const state = rules.createRunState({ themeId: activeTheme.id, characterId: "character.starter", baseStats: activeTheme.characters[0].baseStats, xpCurve: activeTheme.tuning.progression.xpCurve });
        const dead = { ...state, status: "dead", deathCause: { sourceId: "enemy.slow_durable", elite: true, atMs: 1234 } };
        new RunEndOverlay(this, activeTheme).show(dead, () => {}, ["weapon.secondary", "upgrade.bloodlust"], activeTheme.copy.profile.memory);
        ready();
      }
    }
    const game = new Phaser.Game({ ...createGameConfig(parent.id), type: Phaser.CANVAS, scene: [Probe], audio: { noAudio: true } });
    await shown;
    const cleanup = () => { game.scene.stop("c6-death"); game.destroy(true); parent.remove(); };
    document.addEventListener("c6-cleanup", cleanup, { once: true });
  });
  await page.screenshot({ path: testInfo.outputPath("death-unlock-warning.png") });
  await page.evaluate(() => document.dispatchEvent(new Event("c6-cleanup")));
});
