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


test("Q6 seven-level aura ticks all nearby targets, follows player and gates late entrants", async ({ page }, testInfo) => {
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/sprite-browser.html?noAmbient&noContact&noHazards&noXp");
  const result = await page.evaluate(async () => {
    const paths = ["/tests/fixtures/phaser-runtime.ts", "/src/game/scenes/run-scene.ts", "/src/game/content/themes/eco-guardian/index.ts",
      "/src/game/systems/sprites/load-sprites.ts", "/src/game/systems/upgrades.ts", "/src/game/systems/weapons/cleanup-tools.ts"];
    const [{ default: Phaser }, { RunScene }, { ecoGuardianTheme: theme }, { loadThemeSprites }, { applyUpgrade }, { resolveCleanupTool }] = await Promise.all(paths.map((p) => import(p)));
    const root = document.createElement("div"); root.id = "q6-aura"; document.body.append(root);
    let scene: InstanceType<typeof RunScene>;
    const game = await new Promise<InstanceType<typeof Phaser.Game>>((resolve) => {
      class Run extends RunScene {
        create() { super.create(); scene = this; this.physics.world.pause(); resolve(this.game); }
        update() { /* Aided scheduler ticks; render timers remain real. */ }
      }
      class Load extends Phaser.Scene {
        constructor() { super("q6-aura-load"); }
        preload() { loadThemeSprites(this, theme); }
        create() { this.scene.start("run"); }
      }
      new Phaser.Game({ type: Phaser.CANVAS, width: 1000, height: 600, parent: root.id,
        physics: { default: "arcade" }, audio: { noAudio: true }, scene: [Load, Run] });
    });
    try {
      const runs = [], base = scene!.runState;
      const weapon = theme.weapons.find((w: { id: string }) => w.id === "weapon.secondary");
      const step = theme.upgrades.find((u: { id: string }) => u.id === weapon.cleanup.progression.id);
      for (let level = 1; level <= 7; level++) {
        for (const enemy of [...scene!.enemies]) enemy.destroy();
        scene!.player.arcadeBody.reset(2000, 2000);
        let state = { ...base, selectedUpgradeIds: [], ownedWeaponModifiers: {},
          weaponSlots: [{ weaponId: "weapon.starter", nextAttackAtMs: 10000 }, { weaponId: weapon.id, nextAttackAtMs: 0 }] };
        for (let pick = 1; pick < level; pick++) state = applyUpgrade(state, step, undefined, 1, theme.weapons);
        scene!.runState = { ...state, player: { ...state.player, stats: { ...state.player.stats, critChance: 0 } } };
        scene!.rebuildCleanupRuntime();
        const tool = resolveCleanupTool(weapon.cleanup, scene!.runState.selectedUpgradeIds);
        const tools = [{ weapon, tool, attackRate: 1 }];
        const definition = { ...theme.enemies.find((e: { id: string }) => e.id === "enemy.cluster_fodder"), maxHealth: 10000, armour: 0, moveSpeed: 0 };
        for (let i = 0; i < 10; i++) scene!.spawnEnemy("ambient", 1, definition,
          { x: scene!.player.x + tool.radius + definition.radius - 1, y: scene!.player.y }, false);
        const targets = [...scene!.enemies];
        const before = targets.map((e) => e.health);
        scene!.spawnEnemy("ambient", 1, definition, { x: scene!.player.x - tool.radius - definition.radius - 20, y: scene!.player.y }, false);
        const outside = [...scene!.enemies].at(-1), outsideBefore = outside.health;
        scene!.cleanupRuntime.update(0, scene!.player, tools, scene!.enemies);
        const first = targets.map((e, i) => before[i] - e.health);
        scene!.player.arcadeBody.reset(2600, 2000);
        scene!.spawnEnemy("ambient", 1, definition, { x: scene!.player.x, y: scene!.player.y }, false);
        const entrant = [...scene!.enemies].at(-1), entrantBefore = entrant.health;
        scene!.cleanupRuntime.update(tool.tickMs - 1, scene!.player, tools, scene!.enemies);
        const held = entrant.health;
        scene!.cleanupRuntime.update(tool.tickMs, scene!.player, tools, scene!.enemies);
        runs.push({ level, picks: scene!.runState.selectedUpgradeIds.filter((id: string) => id === step.id).length, damage: tool.damage, first, held, entrantBefore, next: entrantBefore - entrant.health,
          oldDamage: targets.map((e, i) => before[i] - e.health), outsideBefore, outsideAfter: outside.health,
          total: scene!.runState.statistics.totalDamage,
          breakdown: Object.values(scene!.runState.statistics.damageBreakdown).reduce((sum: number, n) => sum + Number(n), 0) });
      }
      return runs;
    } finally { game.destroy(true); root.remove(); }
  });
  expect(result.map((r) => r.level)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  for (const run of result) {
    expect(run.picks).toBe(run.level - 1);
    expect(run.first).toEqual(Array(10).fill(run.damage));
    expect(run.held).toBe(run.entrantBefore); expect(run.next).toBe(run.damage);
    expect(run.oldDamage).toEqual(run.first); expect(run.outsideAfter).toBe(run.outsideBefore);
    expect(run.total).toBeCloseTo(run.damage * 11); expect(run.breakdown).toBeCloseTo(run.total);
  }
  expect(errors).toEqual([]);
  await testInfo.attach("aura-observations", { body: JSON.stringify(result, null, 2), contentType: "application/json" });
});
