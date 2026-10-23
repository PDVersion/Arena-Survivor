/* eslint-disable @typescript-eslint/no-explicit-any -- bounded test-only Phaser introspection */
import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 1000, height: 700 } });
async function setup(page: Page, low = false) {
  await page.goto("/sprite-browser.html?noAmbient&noContact&noHazards&noWeapon");
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
    const root = document.createElement("div"); root.id = "ranged-review";
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
    (window as any).__RANGED_REVIEW__ = { game, settings, profile, theme,
      run: () => game.scene.getScene("run"), menu: () => game.scene.getScene("menu"),
      async cleanup() { game.destroy(true); await new Promise<void>((r) => requestAnimationFrame(() => r())); root.remove(); } };
  }, low);
}
for (const low of [false, true]) {
  test(`Takeaway Cup live frames, harm, dodge and cleanup ${low ? "Low reduced motion" : "Default"}`, async ({ page }, info) => {
    await setup(page, low);
    const warning = await page.evaluate(() => {
      const f = (window as any).__RANGED_REVIEW__, r = f.run();
      r.physics.world.pause(); r.runState.status = "paused";
      for (const e of r.enemies) e.destroy();
      f.definition = f.theme.enemies.find((e: any) => e.id === "enemy.ranged_attacker");
      f.spawn = () => {
        r.spawnEnemy("ambient", 1, f.definition, { x: r.player.x - 200, y: r.player.y }, false);
        return [...r.enemies].at(-1);
      };
      f.cup = f.spawn(); r.updateEnemies(16); f.cup.view.sync();
      f.health = r.runState.player.health;
      return { frame: f.cup.view.frame, phase: f.cup.rangedState.phase,
        width: f.cup.view.image.frame.width, radius: f.cup.arcadeBody.radius,
        diameter: f.cup.displayDiameter, shots: r.enemyShots.size, velocity: f.cup.arcadeBody.velocity.length() };
    });
    expect(warning).toEqual({ frame: 4, phase: "prepare", width: 64, radius: 14, diameter: 40, shots: 0, velocity: 0 });
    await page.screenshot({ path: info.outputPath("cup-warning.png") });
    const result = await page.evaluate(async () => {
      const f = (window as any).__RANGED_REVIEW__, r = f.run();
      const before = f.cup.rangedState.elapsedMs;
      await new Promise<void>((resolve) => r.events.once("postupdate", () => resolve()));
      const paused = before === f.cup.rangedState.elapsedMs && r.enemyShots.size === 0;
      r.updateEnemies(f.definition.rangedAttack.telegraphMs); f.cup.view.sync();
      const releaseFrame = f.cup.view.frame, shots = r.enemyShots.size;
      r.runState.status = "playing";
      r.updateEnemyShots(1000);
      const damage = f.health - r.runState.player.health, consumed = r.enemyShots.size;
      r.updateEnemies(f.definition.rangedAttack.releaseMs); f.cup.view.sync();
      const recoverFrame = f.cup.view.frame;
      r.runState.status = "paused";
      return { paused, releaseFrame, shots, damage, consumed, recoverFrame };
    });
    expect(result.paused).toBe(true); expect(result.releaseFrame).toBe(5); expect(result.shots).toBe(1);
    expect(result.damage).toBeGreaterThan(0); expect(result.damage).toBeLessThanOrEqual(8);
    expect(result.consumed).toBe(0); expect(result.recoverFrame).toBe(6);
    await page.screenshot({ path: info.outputPath("cup-recovery.png") });
    const dodge = await page.evaluate(() => {
      const f = (window as any).__RANGED_REVIEW__, r = f.run();
      f.cup.destroy(); f.cup = f.spawn();
      r.updateEnemies(16);
      r.player.y += 80; // aim must retain its old horizontal bearing
      r.updateEnemies(f.definition.rangedAttack.telegraphMs);
      const headingY = [...r.enemyShots][0].heading.y;
      r.runState.status = "playing"; r.runState.elapsedMs += 3000;
      const before = r.runState.player.health;
      r.updateEnemyShots(1000);
      const dodged = r.runState.player.health === before && r.enemyShots.size === 1;
      r.updateEnemyShots(800);
      const expired = r.enemyShots.size === 0;
      f.cup.destroy(); f.cup = f.spawn(); r.updateEnemies(16);
      f.cup.takeDamage(9999); r.updateEnemies(1000);
      const cancelled = r.enemyShots.size === 0;
      f.cup.destroy();
      for (let i = 0; i < 34; i++) f.spawn();
      r.updateEnemies(16); r.updateEnemies(1000);
      const bounded = r.enemyShots.size;
      r.runState.status = "playing";
      r.togglePause();
      return { headingY, dodged, expired, cancelled, bounded };
    });
    expect(dodge).toEqual({ headingY: 0, dodged: true, expired: true, cancelled: true, bounded: 32 });
    await page.evaluate(() => (window as any).__RANGED_REVIEW__.run().quitToMenu());
    await expect.poll(() => page.evaluate(() => (window as any).__RANGED_REVIEW__.game.scene.isActive("menu"))).toBe(true);
    expect(await page.evaluate(() => (window as any).__RANGED_REVIEW__.run().enemyShots.size)).toBe(0);
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => (window as any).__RANGED_REVIEW__.game.scene.isActive("run"))).toBe(true);
    expect(await page.evaluate(() => (window as any).__RANGED_REVIEW__.run().enemyShots.size)).toBe(0);
    await page.evaluate(() => (window as any).__RANGED_REVIEW__.cleanup());
  });
}
test("Takeaway Cup attacks on the ordinary playing update loop", async ({ page }, info) => {
  await setup(page);
  await page.evaluate(() => {
    const f = (window as any).__RANGED_REVIEW__, r = f.run();
    const definition = f.theme.enemies.find((e: any) => e.id === "enemy.ranged_attacker");
    r.spawnEnemy("ambient", 1, definition, { x: r.player.x - 200, y: r.player.y }, false);
  });
  await expect.poll(() => page.evaluate(() => [...(window as any).__RANGED_REVIEW__.run().enemies][0]?.view.frame)).toBe(4);
  expect(await page.evaluate(() => (window as any).__RANGED_REVIEW__.run().runState.player.health)).toBe(100);
  await expect.poll(() => page.evaluate(() => (window as any).__RANGED_REVIEW__.run().enemyShots.size), { timeout: 7000, intervals: [50] }).toBe(1);
  await page.screenshot({ path: info.outputPath("cup-live-shot.png") });
  await expect.poll(() => page.evaluate(() => (window as any).__RANGED_REVIEW__.run().runState.player.health), { timeout: 7000 }).toBeLessThan(100);
  await page.evaluate(() => (window as any).__RANGED_REVIEW__.cleanup());
});
