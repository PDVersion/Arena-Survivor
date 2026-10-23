/* eslint-disable @typescript-eslint/no-explicit-any -- bounded test-only Phaser introspection */
import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 1000, height: 700 } });
async function setup(page: Page, low = false) {
  await page.goto("/sprite-browser.html?noAmbient&noContact&noHazards");
  await page.evaluate(async (low) => {
    const paths = ["/tests/fixtures/phaser-runtime.ts", "/src/game/scenes/run-scene.ts",
      "/src/game/scenes/menu-scene.ts", "/src/game/content/themes/eco-guardian/index.ts",
      "/src/game/systems/sprites/load-sprites.ts", "/src/game/state/settings-state.ts",
      "/src/game/systems/persistence/profile-service.ts", "/src/game/config.ts"];
    const [{ default: Phaser }, { RunScene }, { MenuScene }, { ecoGuardianTheme: theme },
      { loadThemeSprites }, settings, profile, { createGameConfig }] = await Promise.all(paths.map((p) => import(p)));
    const memory = new Map();
    profile.initializeProfile(theme, { getItem: (k: string) => memory.get(k) ?? null,
      setItem: (k: string, v: string) => memory.set(k, v), removeItem: (k: string) => memory.delete(k) });
    settings.updateSessionSettings(settings.createSettings({ reducedMotion: low, presentationQuality: low ? "low" : "default" }));
    const root = document.createElement("div"); root.id = "tool-review";
    Object.assign(root.style, { position: "fixed", inset: "0", zIndex: "9999" }); document.body.append(root);
    let ready: () => void;
    const started = new Promise<void>((resolve) => { ready = resolve; });
    class Run extends RunScene {
      resetTransientRuntime() { this.runTheme = theme; super.resetTransientRuntime(); }
      create() { super.create(); ready(); }
    }
    class Load extends Phaser.Scene {
      constructor() { super("tool-load"); }
      preload() { loadThemeSprites(this, theme); }
      create() { this.scene.start("run"); }
    }
    const game = new Phaser.Game({ ...createGameConfig(root.id), type: Phaser.CANVAS,
      scene: [Load, MenuScene, Run], audio: { noAudio: true } });
    await started;
    (window as any).__TOOL_REVIEW__ = { game, settings, profile, theme,
      run: () => game.scene.getScene("run"), menu: () => game.scene.getScene("menu"),
      async cleanup() { game.destroy(true); await new Promise<void>((r) => requestAnimationFrame(() => r())); root.remove(); } };
  }, low);
}
async function pause(page: Page) {
  await page.keyboard.down("Escape");
  await page.evaluate(() => new Promise<void>((resolve) => (window as any).__TOOL_REVIEW__.run().events.once("postupdate", () => resolve())));
  await page.keyboard.up("Escape");
  await expect.poll(() => page.evaluate(() => (window as any).__TOOL_REVIEW__.run().runState.status)).toBe("paused");
}
async function clickBounds(page: Page, kind: "settings" | "radius" | "quit") {
  const point = await page.evaluate((kind) => {
    const run = (window as any).__TOOL_REVIEW__.run(), ui = run.pauseMenu;
    const b = kind === "quit" ? ui.quitBounds : kind === "settings"
      ? ui.tabBounds.find((r: any) => r.tab === "settings").bounds
      : ui.settingBounds.find((r: any) => r.key === "showAttackRadius").bounds;
    return { x: run.scale.width / 2 + (b.centerX - run.scale.width / 2) * 1.25,
      y: run.scale.height / 2 + (b.centerY - run.scale.height / 2) * 1.25,
      width: run.scale.width, height: run.scale.height };
  }, kind);
  const canvas = await page.locator("#tool-review canvas").boundingBox();
  if (!canvas) throw new Error("Missing fixture canvas");
  await page.mouse.click(canvas.x + point.x * canvas.width / point.width, canvas.y + point.y * canvas.height / point.height);
}
for (const low of [false, true]) {
  test(`tool suction and optional guides ${low ? "Low reduced motion" : "Default"}`, async ({ page }, info) => {
    test.setTimeout(30_000);
    await setup(page, low);
    const result = await page.evaluate(async () => {
      const f = (window as any).__TOOL_REVIEW__, run = f.run();
      const conePath = "/src/game/entities/cone-attack-actor.ts", clawPath = "/src/game/entities/tool-effects.ts";
      const [{ ConeAttackActor }, { ClawSnapActor }] = await Promise.all([import(conePath), import(clawPath)]);
      const weapon = f.theme.weapons.find((w: any) => w.id === "weapon.secondary");
      const options = { effects: f.theme.tuning.view.toolEffects, ...f.settings.getSessionSettings(), quality: f.settings.getSessionSettings().presentationQuality };
      const first = new ConeAttackActor(run, run.player.x, run.player.y, 0, weapon, f.theme.tokens, () => {}, [], options);
      const guidesOff = !first.list[0].visible;
      const airDrawn = first.list[3].commandBuffer.length > 0;
      const airCommands = first.list[3].commandBuffer.length;
      const second = new ConeAttackActor(run, run.player.x, run.player.y - 90, 0, weapon, f.theme.tokens, () => {}, [], { ...options, showAttackRadius: true });
      const guidesOn = second.list[0].commandBuffer.length > 0;
      const claw = new ClawSnapActor(run, run.player.x + 80, run.player.y + 70, 24, f.theme.tokens, options);
      const clawDrawn = claw.list[0].commandBuffer.length > 0;
      run.time.timeScale = 0; run.tweens.timeScale = 0;
      f.cues = { first, second, claw, weapon };
      return { guidesOff, guidesOn, airDrawn, airCommands, clawDrawn };
    });
    expect(result.guidesOff).toBe(true); expect(result.guidesOn).toBe(true);
    expect(result.airDrawn).toBe(true); expect(result.clawDrawn).toBe(true);
    await page.screenshot({ path: info.outputPath("tool-effects.png") });
    const faded = await page.evaluate(async () => {
      const f = (window as any).__TOOL_REVIEW__, run = f.run();
      run.time.timeScale = 1; run.tweens.timeScale = 1;
      await new Promise<void>((r) => run.time.delayedCall(f.cues.weapon.extendMs + 5, () => r()));
      return { nozzle: f.cues.first.list[1].visible, air: f.cues.first.list[3].visible };
    });
    expect(faded).toEqual({ nozzle: false, air: false });
    await page.evaluate(() => (window as any).__TOOL_REVIEW__.cleanup());
  });
}

test("Escape menu toggles attack guide, quits by pointer and Q, starts clean run", async ({ page }, info) => {
  test.setTimeout(30_000);
  await setup(page);
  await pause(page); await page.screenshot({ path: info.outputPath("pause-before.png") }); await clickBounds(page, "settings");
  await expect.poll(() => page.evaluate(() => (window as any).__TOOL_REVIEW__.run().pauseMenu.activeTab)).toBe("settings");
  expect(await page.evaluate(() => (window as any).__TOOL_REVIEW__.settings.getSessionSettings().showAttackRadius)).toBe(false);
  await clickBounds(page, "radius");
  await expect.poll(() => page.evaluate(() => (window as any).__TOOL_REVIEW__.profile.getProfile().settings.showAttackRadius)).toBe(true);
  await page.setViewportSize({ width: 900, height: 600 });
  await page.screenshot({ path: info.outputPath("pause-settings.png") });
  await clickBounds(page, "quit");
  await expect.poll(() => page.evaluate(() => (window as any).__TOOL_REVIEW__.game.scene.isActive("menu"))).toBe(true);
  expect(await page.evaluate(() => (window as any).__TOOL_REVIEW__.profile.getProfile().statistics.runsPlayed)).toBe(0);
  await page.keyboard.press("Enter");
  await expect.poll(() => page.evaluate(() => (window as any).__TOOL_REVIEW__.game.scene.isActive("run"))).toBe(true);
  expect(await page.evaluate(() => (window as any).__TOOL_REVIEW__.settings.getSessionSettings().showAttackRadius)).toBe(true);
  await pause(page); await page.keyboard.press("q");
  await expect.poll(() => page.evaluate(() => (window as any).__TOOL_REVIEW__.game.scene.isActive("menu"))).toBe(true);
  expect(await page.evaluate(() => (window as any).__TOOL_REVIEW__.profile.getProfile().statistics.runsPlayed)).toBe(0);
  await page.screenshot({ path: info.outputPath("main-menu.png") });
  await page.evaluate(() => (window as any).__TOOL_REVIEW__.cleanup());
});
