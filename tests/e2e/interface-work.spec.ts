import { clickSettingControl } from "./settings-controls";
import { expect, test } from "@playwright/test";

test("minimap opacity, scaled settings pointer, resize, pause and restart stay coherent", async ({ page }, testInfo) => {
  // Includes four settings clicks, resize, terminal transition and reconstruction.
  test.setTimeout(90_000);
  await page.goto("/?noContact&noXp&noHazards&runDurationMs=2000&atTimeUp=complete");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status)).toBe("playing");
  const first = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(first?.ui?.minimapVisible).toBe(true);
  await page.keyboard.press("Escape");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status)).toBe("paused");
  expect(await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.minimapVisible)).toBe(false);
  for (let index = 0; index < 4; index += 1) {
    await page.keyboard.press("Tab");
    await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.pauseTab)).toBe(["upgrades", "world", "codex", "settings"][index]);
  }
  await page.setViewportSize({ width: 900, height: 600 });
  for (const opacity of [0.85, 0, 0.35, 0.6]) {
    await clickSettingControl(page, "minimapOpacity");
    await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.settings.minimapOpacity)).toBe(opacity);
    expect(await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.minimapVisible)).toBe(false);
  }
  await page.screenshot({ path: testInfo.outputPath("paused-resized.png") });
  const paused = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(paused?.run?.elapsedMs).toBeGreaterThanOrEqual(first?.run?.elapsedMs ?? 0);
  await page.keyboard.press("Escape");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.minimapVisible)).toBe(true);
  const resumed = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(resumed?.view?.worldWidth).toBe(first?.view?.worldWidth);
  expect(resumed?.view?.worldHeight).toBe(first?.view?.worldHeight);
  expect(resumed?.ui?.minimapBounds).toEqual(first?.ui?.minimapBounds);
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().run?.status), { timeout: 30_000 }).toBe("complete");
  expect(await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.minimapVisible)).toBe(false);
  await page.keyboard.press("r");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().lifecycle?.runGeneration)).toBe((first?.lifecycle?.runGeneration ?? 0) + 1);
  expect(await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.minimapVisible)).toBe(true);
  expect(await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().ui?.settings.minimapOpacity)).toBe(0.6);
});

for (const themeKey of ["eco-guardian", "knight-magic"]) test(`${themeKey} real HUD/minimap preserve critical updates and skip stable work`, async ({ page }, testInfo) => {
  await page.goto("/sprite-browser.html");
  const result = await page.evaluate(async (themeKey) => {
    const phaserPath = "/node_modules/phaser/dist/phaser.esm.js";
    const hudPath = "/src/game/ui/hud.ts";
    const minimapPath = "/src/game/ui/minimap-ui.ts";
    const registryPath = "/src/game/content/theme-registry.ts";
    const runPath = "/src/game/state/run-state.ts";
    const [Phaser, { Hud }, { MinimapUi }, { themeRegistry }, { createRunState }] = await Promise.all([
      import(phaserPath), import(hudPath), import(minimapPath), import(registryPath), import(runPath),
    ]);
    const theme = themeRegistry.find((entry: { key: string }) => entry.key === themeKey).theme;
    const parent = document.createElement("div");
    parent.style.cssText = "position:fixed;inset:0;z-index:9999";
    document.body.append(parent);
    return new Promise<{ stableTextCalls: number; health: string; experience: string; status: string; healthWidth: number; xpWidth: number; hiddenClears: number; visibleClears: number; playerMarker: boolean; visible: boolean; hidden: boolean; destroyed: boolean }>((resolve) => {
      class InterfaceScene extends Phaser.Scene {
        create() {
          this.cameras.main.setZoom(2);
          const hud = new Hud(this, theme);
          const minimap = new MinimapUi(this, theme, { width: 2400, height: 1600 }, 0.6);
          const run = createRunState({ themeId: theme.id, characterId: theme.characters[0].id, baseStats: theme.characters[0].baseStats });
          const extras = { spawnCounts: { natural: 0, fragmentation: 0, environment: 0, baggedWaste: 0, benchmark: 0 }, threatStep: 0, killChain: 0, levelProgress: 0 };
          hud.update(run, extras);
          let textCalls = 0;
          for (const text of [hud.healthLabel, hud.experienceLabel, hud.right, hud.levelLabel, hud.status]) {
            const original = text.setText;
            text.setText = function(...args: unknown[]) { textCalls += 1; return original.apply(this, args); };
          }
          for (let frame = 0; frame < 120; frame += 1) hud.update({ ...run, elapsedMs: frame }, extras);
          const stableTextCalls = textCalls;
          hud.update({ ...run, status: "paused", player: { ...run.player, health: 72.5 }, progression: { ...run.progression, xp: 1.5, xpToNextLevel: 8, level: 2 } }, { ...extras, levelProgress: 1.5 / 8 });
          const view = { player: { x: 1200, y: 800 }, enemies: [{ x: 1200, y: 800 }], shrines: [], hazards: [] };
          let clears = 0;
          let marker = false;
          const clear = minimap.graphics.clear;
          minimap.graphics.clear = function() { clears += 1; return clear.call(this); };
          const circle = minimap.graphics.fillCircle;
          minimap.graphics.fillCircle = function(x: number, y: number, radius: number) {
            if (radius === 3.4) marker = x > minimap.bounds.left && y > minimap.bounds.top;
            return circle.call(this, x, y, radius);
          };
          minimap.update(view);
          minimap.setOpacity(0);
          minimap.update(new Proxy({}, { get() { throw new Error("Hidden map read"); } }));
          minimap.setOpacity(0.85);
          minimap.setOverlayHidden(true);
          minimap.update(view);
          const hidden = !minimap.visible;
          const hiddenClears = clears - 1;
          minimap.resize(this);
          minimap.setOverlayHidden(false);
          minimap.update(view);
          const visible = minimap.visible;
          const response = { stableTextCalls, health: hud.healthLabel.text, experience: hud.experienceLabel.text, status: hud.status.text, healthWidth: hud.healthFill.width, xpWidth: hud.xpFill.width, hiddenClears, visibleClears: clears, playerMarker: marker, hidden, visible, destroyed: false };
          minimap.destroy();
          hud.destroy();
          response.destroyed = !minimap.container.scene && !hud.container.scene;
          // Render a fresh visible state for visual inspection.
          const shown = new Hud(this, theme);
          shown.update(run, extras);
          const map = new MinimapUi(this, theme, { width: 2400, height: 1600 }, 0.6);
          map.update(view);
          this.time.delayedCall(100, () => resolve(response));
        }
      }
      new Phaser.Game({ type: Phaser.CANVAS, width: 1600, height: 900, parent, scene: [InterfaceScene], scale: { mode: Phaser.Scale.FIT } });
    });
  }, themeKey);
  expect(result).toMatchObject({ stableTextCalls: 0, hiddenClears: 0, visibleClears: 2, playerMarker: true, hidden: true, visible: true, destroyed: true });
  expect(result.health).toContain("73 / 100");
  expect(result.experience).toContain("1.5 / 8");
  expect(result.status).not.toBe("");
  expect(result.healthWidth).toBe(145);
  expect(result.xpWidth).toBe(37.5);
  await page.screenshot({ path: testInfo.outputPath(`${themeKey}-interface.png`) });
});
