import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

// Explicitly aided integration: isolated RunScene, physics paused, movement stepped
// at20 simulated ms. This is deterministic cue/target/ledger evidence, not survival.
for (const themeKey of ["eco-guardian", "knight-magic"]) for (const quality of ["default", "low"]) {
  test(`${themeKey} G2 gust interception ${quality}`, async ({ page, browser }, testInfo) => {
    test.setTimeout(30_000);
    const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/sprite-browser.html?noAmbient&noContact&noHazards");
    try {
      const initial = await page.evaluate(async ({ themeKey, quality }) => {
        const paths = ["/tests/fixtures/phaser-runtime.ts", "/src/game/scenes/run-scene.ts", "/src/game/content/theme-registry.ts",
          "/src/game/systems/sprites/load-sprites.ts", "/src/game/systems/upgrades.ts", "/src/game/systems/difficulty/resolve-difficulty.ts",
          "/src/game/state/settings-state.ts", "/src/game/config.ts"];
        const [{ default: Phaser }, { RunScene }, { themeRegistry }, { loadThemeSprites }, { applyUpgrade }, { resolveDifficultyTheme }, settings, { createGameConfig }] = await Promise.all(paths.map((p) => import(p)));
        const theme = resolveDifficultyTheme(themeRegistry.find((entry: { key: string }) => entry.key === themeKey).theme, "normal");
        const root = document.createElement("div"); root.id = "g2-motion";
        Object.assign(root.style, { position: "fixed", inset: "0", zIndex: "9999" }); document.body.append(root);
        let scene: InstanceType<typeof RunScene>;
        const game = await new Promise<InstanceType<typeof Phaser.Game>>((resolve) => {
          class Run extends RunScene {
            resetTransientRuntime() { this.runTheme = theme; super.resetTransientRuntime(); }
            create() {
              super.create();
              // eslint-disable-next-line @typescript-eslint/no-this-alias -- bounded scene inspection
              scene = this; this.physics.world.pause(); resolve(this.game);
            }
            update() { /* Aided fixed steps below; presentation remains live. */ }
          }
          class Load extends Phaser.Scene {
            constructor() { super("g2-load"); }
            preload() { loadThemeSprites(this, theme); }
            create() { this.scene.start("run"); }
          }
          new Phaser.Game({ ...createGameConfig(root.id), type: Phaser.CANVAS, audio: { noAudio: true }, scene: [Load, Run] });
        });
        if (quality === "low") { scene!.applySetting("presentationQuality"); scene!.applySetting("reducedMotion"); }
        const id = "enemy.gust_drifter";
        const definition = theme.enemies.find((e: { id: string }) => e.id === id);
        const motion = definition.committedMotion;
        const role = theme.tuning.director.roles.find((r: { enemyId: string }) => r.enemyId === id);
        scene!.runState = { ...scene!.runState, elapsedMs: scene!.runState.durationMs * role.unlockAt };
        scene!.lastDirectorProgress = role.unlockAt - .001;
        const permitAmbient = (action: () => void) => {
          const url = new URL(location.href); url.searchParams.delete("noAmbient"); history.replaceState(null, "", url);
          try { action(); } finally { url.searchParams.set("noAmbient", ""); history.replaceState(null, "", url); }
        };
        scene!.enemyCapacity = 0;
        permitAmbient(() => scene!.releaseMilestoneWaves()); scene!.processCausalEvents();
        const retained = scene!.eventQueue.snapshot().backlog;
        permitAmbient(() => scene!.releaseMilestoneWaves()); scene!.processCausalEvents();
        const repeated = scene!.eventQueue.snapshot().backlog;
        scene!.enemyCapacity = 1; scene!.processCausalEvents();
        const actor = [...scene!.enemies][0];
        const offscreenDistance = Phaser.Math.Distance.Between(actor.x, actor.y, scene!.player.x, scene!.player.y);
        actor.arcadeBody.reset(scene!.player.x + motion.triggerRange - 10, scene!.player.y);
        const view = actor.primitiveView.image, cue = actor.motionCue.image;
        const snapshot = () => ({ phase: actor.motionState.phase, heading: [actor.motionState.headingX, actor.motionState.headingY],
          velocity: actor.body ? [actor.arcadeBody.velocity.x, actor.arcadeBody.velocity.y] : [0, 0], position: [actor.x, actor.y],
          cueCommands: cue.commandBuffer?.length ?? 0, cueActive: cue.active, viewActive: view.active, bodyWidth: actor.body?.width ?? 0,
          health: actor.health, xp: [...scene!.pickups].reduce((n, p) => n + p.xpValue, 0), kills: scene!.runState.statistics.kills,
          damage: scene!.runState.statistics.totalDamage,
          breakdown: Object.values(scene!.runState.statistics.damageBreakdown).reduce((n: number, value) => n + Number(value), 0),
          backlog: scene!.eventQueue.snapshot().backlog, settings: settings.getSessionSettings() });
        actor.advance(new Phaser.Math.Vector2(scene!.player.x, scene!.player.y), 20);
        const warning = snapshot();
        const cueSync = () => scene!.events.emit(Phaser.Scenes.Events.POST_UPDATE);
        cueSync();
        const first = snapshot();
        const advance = (duration: number) => {
          let remaining = duration;
          while (remaining > 0) {
            const delta = Math.min(20, remaining); remaining -= delta;
            actor.advance(new Phaser.Math.Vector2(scene!.player.x, scene!.player.y), delta);
            const v = actor.arcadeBody.velocity.clone();
            actor.arcadeBody.reset(actor.x + v.x * delta / 1000, actor.y + v.y * delta / 1000);
          }
          cueSync(); return snapshot();
        };
        // Move across the captured bearing before launch; heading must not follow.
        scene!.player.arcadeBody.reset(scene!.player.x, scene!.player.y + 50);
        const frozen = actor.motionState;
        actor.advance(new Phaser.Math.Vector2(scene!.player.x, scene!.player.y), 0);
        const zeroDeltaFrozen = actor.motionState === frozen;
        let outside: { health: number }[] = [];
        // Keep scene access private to this bounded fixture, not the product API.
        Object.assign(window, { __G2_MOTION__: {
          advance, snapshot,
          mixed() {
            scene!.enemyCapacity = 300;
            scene!.player.arcadeBody.reset(actor.x - 60, actor.y);
            for (const [i, oldId] of ["enemy.swarm_basic", "enemy.fast_fragile"].entries()) scene!.spawnEnemy("ambient", 1,
              theme.enemies.find((e: { id: string }) => e.id === oldId), { x: scene!.player.x - 75, y: scene!.player.y + (i ? -35 : 35) }, false);
            outside = [...scene!.enemies].filter((e) => e !== actor);
            return outside.map((e) => e.health);
          },
          pulse() {
            scene!.runState = applyUpgrade(scene!.runState, theme.upgrades.find((u: { id: string }) => u.id === "upgrade.equip_secondary"), undefined, 1, theme.weapons);
            for (let i = 0; i < 5 && actor.active; i++) {
              scene!.runState = { ...scene!.runState, player: { ...scene!.runState.player, stats: { ...scene!.runState.player.stats, critChance: 0 } },
                weaponSlots: scene!.runState.weaponSlots.map((slot: { weaponId: string }) => ({ ...slot, nextAttackAtMs: slot.weaponId === "weapon.starter" ? 1e9 : 0 })) };
              scene!.fireIfReady(); scene!.processCausalEvents();
            }
            const lethal = snapshot();
            scene!.commitEnemyDamage(actor, 1000, "direct"); scene!.processCausalEvents();
            return { lethal, duplicate: snapshot(), outside: outside.map((e) => e.health), viewDestroyed: !view.active, cueDestroyed: !cue.active };
          },
          async cleanup() { game.scene.stop("run"); game.destroy(true); await new Promise<void>((r) => requestAnimationFrame(() => r())); root.remove(); delete (window as unknown as Record<string, unknown>).__G2_MOTION__; },
        } });
        return { retained, repeated, offscreenDistance, warning, first, zeroDeltaFrozen, motion, health: actor.health,
          expectedXp: definition.xpReward * actor.rewardMultiplier, speed: actor.moveSpeed, rate: theme.tuning.pace.gameplayRate };
      }, { themeKey, quality });
      expect(initial.retained).toBe(1); expect(initial.repeated).toBe(1);
      expect(initial.offscreenDistance).toBeGreaterThan(initial.motion.triggerRange);
      expect(initial.first.phase).toBe("telegraph"); expect(initial.first.velocity).toEqual([0, 0]);
      expect(initial.first.cueCommands).toBeGreaterThan(0); expect(initial.first.bodyWidth).toBe(24);
      expect(initial.zeroDeltaFrozen).toBe(true); expect(initial.rate).toBe(.5);
      expect(initial.first.settings.presentationQuality).toBe(quality); expect(initial.first.settings.reducedMotion).toBe(quality === "low");
      await page.screenshot({ path: testInfo.outputPath("warning.png") });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- isolated test fixture
      const launch = await page.evaluate((duration) => (window as any).__G2_MOTION__.advance(duration), initial.motion.telegraphMs);
      expect(launch.phase).toBe("travel"); expect(launch.heading).toEqual(initial.first.heading);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- isolated test fixture
      const recovery = await page.evaluate((duration) => (window as any).__G2_MOTION__.advance(duration), initial.motion.travelMs);
      expect(recovery.phase).toBe("recover"); expect(recovery.heading).toEqual(initial.first.heading);
      const distance = Math.hypot(recovery.position[0] - initial.first.position[0], recovery.position[1] - initial.first.position[1]);
      expect(distance).toBeCloseTo(initial.speed * initial.motion.speedMultiplier * initial.motion.travelMs / 1000, 6);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- isolated test fixture
      const outside = await page.evaluate(() => (window as any).__G2_MOTION__.mixed());
      await page.screenshot({ path: testInfo.outputPath("interception.png") });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- isolated test fixture
      const pulse = await page.evaluate(() => (window as any).__G2_MOTION__.pulse());
      expect(pulse.lethal.kills).toBe(1); expect(pulse.lethal.xp).toBeCloseTo(initial.expectedXp, 8);
      expect(pulse.lethal.damage).toBeCloseTo(initial.health, 8); expect(pulse.lethal.breakdown).toBeCloseTo(pulse.lethal.damage, 8);
      expect(pulse.duplicate).toEqual(pulse.lethal); expect(pulse.outside).toEqual(outside);
      expect(pulse.viewDestroyed).toBe(true); expect(pulse.cueDestroyed).toBe(true); expect(pulse.lethal.backlog).toBe(0);
      expect(errors).toEqual([]);
      await writeFile(testInfo.outputPath("observations.json"), JSON.stringify({ themeKey, quality, browser: browser.version(), initial, launch, recovery, distance, pulse, errors }, null, 2));
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- isolated test fixture
      await page.evaluate(() => (window as any).__G2_MOTION__?.cleanup());
    }
  });
}
