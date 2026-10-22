/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-this-alias -- bounded test-only Phaser introspection */
import { expect, test } from "@playwright/test";

test("Q6 fixed body anchor across player poses and directions", async ({ page }, testInfo) => {
  test.setTimeout(30_000);
  await page.goto("/sprite-browser.html");
  const result = await page.evaluate(async () => {
    const paths = ["/tests/fixtures/phaser-runtime.ts", "/src/game/content/themes/eco-guardian/index.ts",
      "/src/game/systems/sprites/load-sprites.ts", "/src/game/entities/player-actor.ts"];
    const [{ default: Phaser }, { ecoGuardianTheme: theme }, { loadThemeSprites }, { PlayerActor }] = await Promise.all(paths.map((p) => import(p)));
    const root = document.createElement("div"); root.id = "q6-root";
    Object.assign(root.style, { position: "fixed", inset: "0", zIndex: "9999", background: "#111827" }); document.body.append(root);
    let scene: InstanceType<typeof Phaser.Scene>;
    await new Promise<void>((resolve) => {
      class Board extends Phaser.Scene {
        preload() { loadThemeSprites(this, theme); }
        create() { scene = this; resolve(); }
      }
      const game = new Phaser.Game({ type: Phaser.CANVAS, width: 1000, height: 580, parent: root.id,
        backgroundColor: "#111827", physics: { default: "arcade" }, audio: { noAudio: true }, scene: Board });
      (window as unknown as { q6Game: unknown }).q6Game = game;
    });
    scene!.physics.world.pause();
    const rows: unknown[] = [];
    for (const [direction, vx, vy] of [["right", 1, 0], ["left", -1, 0], ["down-right", 1, 1], ["up-left", -1, -1]] as const) {
      for (const [column, frame] of [0, 1, 2, 4, 5].entries()) {
        const row = rows.length / 5 | 0;
        const x = 100 + column * 185, y = 70 + row * 135;
        const actor = new PlayerActor(scene!, x, y, { ...theme.characters[0], displayDiameter: 96 }, theme.tokens);
        actor.view.image.setScale(2);
        // Force an authored pose with fixed actor/body, using the real follower.
        actor.body.setVelocity(vx, vy);
        actor.view.playerStep = [0, 1, 2].includes(frame) ? frame : 0;
        if (frame === 4) actor.body.setVelocity(0, 0);
        if (frame === 5) actor.view.flash(0xffffff, 100000);
        actor.view.sync();
        actor.view.image.setScale(2);
        scene!.add.text(x - 65, y + 43, `${direction} / ${frame}`, { fontSize: "12px" });
        scene!.add.rectangle(x, y, 36, 36).setStrokeStyle(1, 0x60a5fa).setFillStyle(0, 0).setDepth(90);
        const cross = scene!.add.graphics().lineStyle(1, 0xff5555).setDepth(100);
        cross.lineBetween(x - 7, y, x + 7, y).lineBetween(x, y - 7, x, y + 7);
        rows.push({ direction, frame: actor.view.frame, actor: [actor.x, actor.y], body: [actor.body.width, actor.body.height],
          image: [actor.view.image.x, actor.view.image.y], origin: [actor.view.image.originX, actor.view.image.originY], flip: actor.view.mirrored });
      }
    }
    return rows;
  });
  await page.screenshot({ path: testInfo.outputPath("fixed-anchor-poses.png") });
  await testInfo.attach("anchors", { body: JSON.stringify(result, null, 2), contentType: "application/json" });
  expect(result).toHaveLength(20);
  for (const value of result as { actor: number[]; image: number[]; body: number[] }[]) {
    expect(value.image).toEqual(value.actor);
    expect(value.body).toEqual([36, 36]);
  }
  const motion = await page.evaluate(async () => {
    const game = (window as unknown as { q6Game: unknown }).q6Game as { scene: { getScenes(active: boolean): any[] } };
    const scene = game.scene.getScenes(true)[0];
    const actors = scene.children.list.filter((child: any) => child.constructor.name === "PlayerActor");
    const actor = actors[0];
    for (const other of actors.slice(1)) other.destroy();
    actor.setPosition(500, 300); actor.view.animation.transient = undefined;
    scene.physics.world.resume(); scene.physics.world.timeScale = 2;
    const samples = [];
    for (const input of [{ right: true }, { left: true }, { right: true, down: true }, { left: true, up: true }, {}]) {
      actor.move({ left: false, right: false, up: false, down: false, ...input }, 200);
      for (let frame = 0; frame < 35; frame++) {
        if (frame === 15) actor.flashDamage("#ffffff");
        await new Promise<void>((resolve) => scene.events.once("postupdate", () => resolve()));
        samples.push({ input, frame: actor.view.frame, flip: actor.view.mirrored, actor: [actor.x, actor.y],
          image: [actor.view.image.x, actor.view.image.y], body: [actor.body.width, actor.body.height] });
      }
    }
    return samples;
  });
  await testInfo.attach("motion", { body: JSON.stringify(motion, null, 2), contentType: "application/json" });
  expect(motion.filter((value) => value.image[0] !== value.actor[0] || value.image[1] !== value.actor[1])).toEqual([]);
  expect(motion.every((value) => value.body[0] === 36 && value.body[1] === 36)).toBe(true);
  expect(motion.some((value) => value.frame === 5)).toBe(true);
  expect(motion.some((value) => value.frame === 4)).toBe(true);
  expect(motion.filter((value) => "right" in value.input).every((value) => value.flip === (value.frame === 5))).toBe(true);
  expect(motion.filter((value) => "left" in value.input).every((value) => value.flip !== (value.frame === 5))).toBe(true);
  await testInfo.attach("motion", { body: JSON.stringify(motion, null, 2), contentType: "application/json" });
  await page.evaluate(async () => {
    const game = (window as unknown as { q6Game: { destroy: (remove: boolean) => void } }).q6Game;
    game.destroy(true); await new Promise<void>((r) => requestAnimationFrame(() => r())); document.getElementById("q6-root")?.remove();
  });
});


test("Q6 cone pulse marks selected hits, freezes origin and cannot hit a fade entrant", async ({ page }, testInfo) => {
  test.setTimeout(30_000);
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/sprite-browser.html?noAmbient&noContact&noHazards&noXp");
  await page.exposeFunction("q6Capture", async (name: string) => { await page.screenshot({ path: testInfo.outputPath(`${name}.png`) }); });
  const pulse = await page.evaluate(async () => {
    const paths = ["/tests/fixtures/phaser-runtime.ts", "/src/game/scenes/run-scene.ts", "/src/game/content/themes/eco-guardian/index.ts",
      "/src/game/systems/sprites/load-sprites.ts", "/src/game/systems/upgrades.ts"];
    const [{ default: Phaser }, { RunScene }, { ecoGuardianTheme: theme }, { loadThemeSprites }, { applyUpgrade }] = await Promise.all(paths.map((p) => import(p)));
    const root = document.createElement("div"); root.id = "q6-cone";
    Object.assign(root.style, { position: "fixed", inset: "0", zIndex: "9999" }); document.body.append(root);
    let scene: InstanceType<typeof RunScene>;
    const game = await new Promise<InstanceType<typeof Phaser.Game>>((resolve) => {
      class Run extends RunScene {
        resetTransientRuntime() { this.runTheme = theme; super.resetTransientRuntime(); }
        create() { super.create(); scene = this; this.physics.world.pause(); resolve(this.game); }
        update() { /* Frozen simulation; real presentation timers still advance. */ }
      }
      class Load extends Phaser.Scene {
        constructor() { super("q6-load"); }
        preload() { loadThemeSprites(this, theme); }
        create() { this.scene.start("run"); }
      }
      new Phaser.Game({ type: Phaser.CANVAS, width: 1000, height: 600, parent: root.id,
        physics: { default: "arcade" }, audio: { noAudio: true }, scene: [Load, Run] });
    });
    const runs = [];
    for (const picks of [0, 2, 4, 5]) {
      for (const enemy of [...scene!.enemies]) { scene!.enemies.delete(enemy); enemy.destroy(); }
      let state = scene!.runState;
      const acquire = theme.upgrades.find((u: { id: string }) => u.id === "upgrade.equip_secondary");
      state = applyUpgrade(state, acquire, undefined, 1, theme.weapons);
      // Each case starts a fresh history/loadout; its own actual track supplies growth.
      state = { ...state, selectedUpgradeIds: [], ownedWeaponModifiers: {},
        weaponSlots: [{ weaponId: "weapon.starter", nextAttackAtMs: 10000 }, { weaponId: "weapon.secondary", nextAttackAtMs: 0 }] };
      for (let i = 0; i < Math.min(4, picks); i++) state = applyUpgrade(state, theme.upgrades.find((u: { id: string }) => u.id === "upgrade.secondary_range"), undefined, 1, theme.weapons);
      if (picks === 5) state = applyUpgrade(state, theme.upgrades.find((u: { id: string }) => u.id === "upgrade.evolve_secondary"), undefined, 1, theme.weapons);
      scene!.runState = { ...state, elapsedMs: 0, player: { ...state.player, stats: { ...state.player.stats, critChance: 0 } } };
      const origin = { x: scene!.player.x, y: scene!.player.y };
      const definition = { ...theme.enemies[0], maxHealth: 10000, armour: 0, moveSpeed: 0 };
      for (let i = 0; i < 10; i++) scene!.spawnEnemy("ambient", 1, definition, { x: origin.x + 50 + i, y: origin.y }, false);
      const before = scene!.meleeHits;
      scene!.fireIfReady();
      const cue = scene!.children.list.find((child: { constructor: { name: string } }) => child.constructor.name === "ConeAttackActor");
      const hits = scene!.meleeHits - before;
      await (window as unknown as { q6Capture(name: string): Promise<void> }).q6Capture(`pulse-${picks}`);
      const entrantDefinition = { ...definition, id: "enemy.fast_fragile" };
      scene!.spawnEnemy("ambient", 1, entrantDefinition, { x: origin.x + 45, y: origin.y + 2 }, false);
      const entrant = [...scene!.enemies].at(-1);
      const health = entrant.health;
      scene!.player.setPosition(origin.x + 20, origin.y + 10);
      await new Promise<void>((r) => scene!.time.delayedCall(100, () => r()));
      const fade = { hits, cueOrigin: [cue.x, cue.y], origin: [origin.x, origin.y], nozzleVisible: cue.list[1].visible,
        entrantHealth: entrant.health, health, clocks: scene!.runState.weaponSlots.map((s: { nextAttackAtMs: number }) => s.nextAttackAtMs),
        total: scene!.runState.statistics.totalDamage,
        breakdown: Object.values(scene!.runState.statistics.damageBreakdown).reduce((a: number, b) => a + Number(b), 0) };
      await (window as unknown as { q6Capture(name: string): Promise<void> }).q6Capture(`fade-${picks}`);
      runs.push(fade);
      await new Promise<void>((r) => scene!.time.delayedCall(200, () => r()));
    }
    game.scene.stop("run"); game.destroy(true);
    await new Promise<void>((r) => requestAnimationFrame(() => r())); root.remove();
    return runs;
  });
  expect(pulse.map((value) => value.hits)).toEqual([3, 5, 7, 8]);
  for (const value of pulse) {
    expect(value.cueOrigin).toEqual(value.origin);
    expect(value.nozzleVisible).toBe(false);
    expect(value.entrantHealth).toBe(value.health);
    expect(value.clocks[0]).toBe(10000);
    expect(value.breakdown).toBeCloseTo(value.total, 8);
  }
  expect(errors).toEqual([]);
  await testInfo.attach("pulse-observations", { body: JSON.stringify(pulse, null, 2), contentType: "application/json" });
});
