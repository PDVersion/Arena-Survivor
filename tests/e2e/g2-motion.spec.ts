import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

// Explicitly aided integration: isolated RunScene, physics paused, movement stepped
// at20 simulated ms. This is deterministic cue/target/ledger evidence, not survival.
for (const candidate of ["gust", "roll"] as const) for (const themeKey of ["eco-guardian", "knight-magic"]) for (const quality of ["default", "low"]) {
  // Eco wrappers now float; their replacement coverage is below. Keep the
  // existing frozen-pack committed-gust contract without changing its content.
  if (themeKey === "eco-guardian" && candidate === "gust") continue;
  test(`${themeKey} G2 ${candidate} interception ${quality}`, async ({ page, browser }, testInfo) => {
    test.setTimeout(30_000);
    const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/sprite-browser.html?noAmbient&noContact&noHazards");
    try {
      const initial = await page.evaluate(async ({ themeKey, quality, candidate }) => {
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
        const id = candidate === "gust" ? "enemy.gust_drifter" : "enemy.committed_charger";
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
        const initialMotionPhase = actor.motionState.phase;
        const offscreenDistance = Phaser.Math.Distance.Between(actor.x, actor.y, scene!.player.x, scene!.player.y);
        actor.arcadeBody.reset(scene!.player.x + motion.triggerRange - 10, scene!.player.y);
        const view = (actor.view ?? actor.primitiveView).image, cue = actor.motionCue.image;
        const snapshot = () => ({ phase: actor.motionState.phase, heading: [actor.motionState.headingX, actor.motionState.headingY],
          velocity: actor.body ? [actor.arcadeBody.velocity.x, actor.arcadeBody.velocity.y] : [0, 0], position: [actor.x, actor.y],
          cueCommands: cue.commandBuffer?.length ?? 0, cueActive: cue.active, viewActive: view.active, bodyWidth: actor.body?.width ?? 0,
          health: actor.health, xp: [...scene!.pickups].reduce((n, p) => n + p.xpValue, 0), kills: scene!.runState.statistics.kills,
          damage: scene!.runState.statistics.totalDamage,
          breakdown: Object.values(scene!.runState.statistics.damageBreakdown).reduce((n: number, value) => n + Number(value), 0),
          backlog: scene!.eventQueue.snapshot().backlog, settings: settings.getSessionSettings() });
        actor.advance(new Phaser.Math.Vector2(scene!.player.x, scene!.player.y), 20);
        const warning = snapshot();
        const capturedPlayer = [scene!.player.x, scene!.player.y];
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
              theme.enemies.find((e: { id: string }) => e.id === oldId), { x: scene!.player.x - (theme.economy ? 200 : 75), y: scene!.player.y + (i ? -35 : 35) }, false);
            if (candidate === "roll") {
              scene!.spawnEnemy("ambient", 1, theme.enemies.find((e: { id: string }) => e.id === "enemy.cluster_fodder"),
                { x: scene!.player.x - (theme.economy ? 200 : 70), y: scene!.player.y - 100 }, false);
              scene!.spawnEnemy("ambient", 1, theme.enemies.find((e: { id: string }) => e.id === "enemy.gust_drifter"),
                { x: scene!.player.x + (theme.economy ? 200 : 90), y: scene!.player.y + 100 }, false);
              const wrapper = [...scene!.enemies].find((e) => e.definition.id === "enemy.gust_drifter");
              wrapper.advance(new Phaser.Math.Vector2(scene!.player.x, scene!.player.y), 20);
              cueSync();
            }
            outside = [...scene!.enemies].filter((e) => e !== actor);
            return outside.map((e) => e.health);
          },
          async pulse() {
            scene!.runState = applyUpgrade(scene!.runState, theme.upgrades.find((u: { id: string }) => u.id === "upgrade.equip_secondary"), undefined, 1, theme.weapons);
            const weapon = theme.weapons.find((w: { id: string }) => w.id === "weapon.secondary");
            const ticks = weapon.cleanup ? Math.ceil(actor.health / weapon.cleanup.damage) + 1 : 5;
            for (let i = 0; i < ticks && actor.active; i++) {
              scene!.runState = { ...scene!.runState, player: { ...scene!.runState.player, stats: { ...scene!.runState.player.stats, critChance: 0 } },
                weaponSlots: scene!.runState.weaponSlots.map((slot: { weaponId: string }) => ({ ...slot, nextAttackAtMs: slot.weaponId === "weapon.starter" ? 1e9 : 0 })) };
              if (weapon.cleanup) scene!.cleanupRuntime.update(scene!.runState.elapsedMs + i * weapon.cleanup.tickMs, scene!.player,
                [{ weapon, tool: weapon.cleanup, attackRate: 1 }], scene!.enemies);
              else scene!.fireIfReady();
              scene!.processCausalEvents();
            }
            const lethal = snapshot();
            scene!.commitEnemyDamage(actor, 1000, "direct"); scene!.processCausalEvents();
            const duplicate = snapshot();
            if (actor.view) {
              const path = "/src/game/systems/sprites/sprite-animation.ts";
              const { SPRITE_DEATH_FRAME_MS } = await import(path);
              await new Promise<void>((resolve) => scene!.time.delayedCall(SPRITE_DEATH_FRAME_MS + 30, resolve));
            }
            return { lethal, duplicate, outside: outside.map((e) => e.health), viewDestroyed: !view.active, cueDestroyed: !cue.active };
          },
          async cleanup() { game.scene.stop("run"); game.destroy(true); await new Promise<void>((r) => requestAnimationFrame(() => r())); root.remove(); delete (window as unknown as Record<string, unknown>).__G2_MOTION__; },
        } });
        return { retained, repeated, initialMotionPhase, offscreenDistance, warning, first, zeroDeltaFrozen, motion, capturedPlayer, playerRadius: scene!.player.definition.radius, enemyRadius: definition.radius, health: actor.health,
          expectedXp: definition.xpReward * actor.rewardMultiplier, speed: actor.moveSpeed, rate: theme.tuning.pace.gameplayRate };
      }, { themeKey, quality, candidate });
      expect(initial.initialMotionPhase).toBe("approach");
      expect(initial.retained).toBe(1); expect(initial.repeated).toBe(1);
      expect(initial.offscreenDistance).toBeGreaterThan(initial.motion.triggerRange);
      expect(initial.first.phase).toBe("telegraph"); expect(initial.first.velocity).toEqual([0, 0]);
      expect(initial.first.cueCommands).toBeGreaterThan(0); expect(initial.first.bodyWidth).toBe(initial.enemyRadius * 2);
      expect(initial.zeroDeltaFrozen).toBe(true); expect(initial.rate).toBe(.5);
      expect(initial.first.settings.presentationQuality).toBe(quality); expect(initial.first.settings.reducedMotion).toBe(quality === "low");
      await page.screenshot({ path: testInfo.outputPath("warning.png") });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- isolated test fixture
      const launch = await page.evaluate((duration) => (window as any).__G2_MOTION__.advance(duration), initial.motion.telegraphMs);
      expect(launch.phase).toBe("travel"); expect(launch.heading).toEqual(initial.first.heading);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- isolated test fixture
      const recovery = await page.evaluate((duration) => (window as any).__G2_MOTION__.advance(duration), initial.motion.travelMs);
      expect(recovery.phase).toBe("recover"); expect(recovery.heading).toEqual(initial.first.heading);
      if (candidate === "roll") {
        expect(initial.first.heading[1]).toBeCloseTo(0, 8);
        expect(recovery.position[0]).toBeLessThan(initial.capturedPlayer[0] - initial.enemyRadius);
        expect(recovery.position[1]).toBeCloseTo(initial.capturedPlayer[1], 8);
        expect(50).toBeGreaterThan(initial.playerRadius + initial.enemyRadius);
      }
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
      await writeFile(testInfo.outputPath("observations.json"), JSON.stringify({ candidate, themeKey, quality, browser: browser.version(), initial, launch, recovery, distance, pulse, errors }, null, 2));
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- isolated test fixture
      await page.evaluate(() => (window as any).__G2_MOTION__?.cleanup());
    }
  });
}

// Replacement for Eco's retired committed gust: live introduction, continuous
// retargeting and overlap use the active airborne contract in both display modes.
for (const quality of ["default", "low"]) {
  test(`eco-guardian G2 airborne wrapper pursuit ${quality}`, async ({ page }, info) => {
    await page.goto("/sprite-browser.html?noAmbient&noContact&noHazards");
    const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
    const result = await page.evaluate(async (quality) => {
      const paths = ["/tests/fixtures/phaser-runtime.ts", "/src/game/scenes/run-scene.ts",
        "/src/game/content/active-theme.ts", "/src/game/systems/sprites/load-sprites.ts", "/src/game/config.ts"];
      const [{ default: Phaser }, { RunScene }, { activeTheme: theme }, { loadThemeSprites }, { createGameConfig }] = await Promise.all(paths.map((p) => import(p)));
      const root = document.createElement("div"); root.id = "airborne-review"; document.body.append(root);
      let scene: InstanceType<typeof RunScene>;
      const game = await new Promise<InstanceType<typeof Phaser.Game>>((resolve) => {
        class Run extends RunScene {
          create() {
            super.create();
            // eslint-disable-next-line @typescript-eslint/no-this-alias -- bounded fixture inspection
            scene = this; this.physics.world.pause(); resolve(this.game);
          }
          update() { /* Aided fixed movement/causal steps below. */ }
        }
        class Load extends Phaser.Scene {
          constructor() { super("airborne-load"); }
          preload() { loadThemeSprites(this, theme); }
          create() { this.scene.start("run"); }
        }
        new Phaser.Game({ ...createGameConfig(root.id), type: Phaser.CANVAS, scene: [Load, Run], audio: { noAudio: true } });
      });
      try {
        if (quality === "low") { scene!.applySetting("presentationQuality"); scene!.applySetting("reducedMotion"); }
        const definition = theme.enemies.find((e: { id: string }) => e.id === "enemy.gust_drifter");
        const role = theme.tuning.director.roles.find((r: { enemyId: string }) => r.enemyId === definition.id);
        scene!.runState = { ...scene!.runState, elapsedMs: scene!.runState.durationMs * role.unlockAt };
        scene!.lastDirectorProgress = role.unlockAt - .001; scene!.enemyCapacity = 0;
        const url = new URL(location.href); url.searchParams.delete("noAmbient"); history.replaceState(null, "", url);
        scene!.releaseMilestoneWaves(); scene!.processCausalEvents();
        const retained = scene!.eventQueue.snapshot().backlog;
        scene!.releaseMilestoneWaves(); scene!.processCausalEvents();
        const repeated = scene!.eventQueue.snapshot().backlog;
        url.searchParams.set("noAmbient", ""); history.replaceState(null, "", url);
        scene!.enemyCapacity = 2; scene!.processCausalEvents();
        const wrapper = [...scene!.enemies][0];
        const point = { x: scene!.player.x + 120, y: scene!.player.y };
        wrapper.arcadeBody.reset(point.x, point.y);
        scene!.spawnEnemy("ambient", 1, theme.enemies.find((e: { id: string }) => e.id === "enemy.slow_durable"), point, false);
        const glass = [...scene!.enemies].find((e) => e !== wrapper);
        scene!.updateEnemies(20); scene!.rebuildEnemyIndex(); scene!.resolveCrowd();
        const first = { x: wrapper.x, y: wrapper.y, vx: wrapper.arcadeBody.velocity.x, vy: wrapper.arcadeBody.velocity.y };
        scene!.player.arcadeBody.reset(point.x, point.y + 120); scene!.updateEnemies(20);
        const next = { vx: wrapper.arcadeBody.velocity.x, vy: wrapper.arcadeBody.velocity.y };
        const view = wrapper.view.image;
        const health = wrapper.health, reward = definition.xpReward * wrapper.rewardMultiplier;
        // Isolate the lethal ledger from chance-driven material child production.
        scene!.effectRandom = () => 1 - Number.EPSILON;
        scene!.commitEnemyDamage(wrapper, 10000, "direct"); scene!.processCausalEvents();
        const ledger = () => ({ kills: scene!.runState.statistics.kills, damage: scene!.runState.statistics.totalDamage,
          money: [...scene!.pickups].filter((p) => (p.definition.kind ?? "money") === "money").reduce((sum, p) => sum + p.xpValue, 0) });
        const lethal = ledger(); scene!.commitEnemyDamage(wrapper, 10000, "direct");
        const animationPath = "/src/game/systems/sprites/sprite-animation.ts";
        const { SPRITE_DEATH_FRAME_MS } = await import(animationPath);
        await new Promise<void>((resolve) => scene!.time.delayedCall(SPRITE_DEATH_FRAME_MS + 30, resolve));
        return { retained, repeated, first, next, point, overlap: first.x === glass.x && first.y === glass.y,
          airborne: wrapper.airborne, cue: Boolean(wrapper.motionCue), destroyed: !view.active,
          health, reward, lethal, duplicate: ledger() };
      } finally { game.destroy(true); root.remove(); }
    }, quality);
    expect(result.retained).toBe(1); expect(result.repeated).toBe(1);
    expect(result.airborne).toBe(true); expect(result.cue).toBe(false); expect(result.overlap).toBe(true);
    expect(result.first.vx).toBeLessThan(0); expect(result.first.vy).toBeCloseTo(0);
    expect(result.next.vx).toBeCloseTo(0); expect(result.next.vy).toBeGreaterThan(0);
    expect(result.lethal.kills).toBe(1); expect(result.lethal.damage).toBeCloseTo(result.health);
    expect(result.lethal.money).toBeCloseTo(result.reward); expect(result.duplicate).toEqual(result.lethal);
    expect(result.destroyed).toBe(true); expect(errors).toEqual([]);
    await writeFile(info.outputPath("airborne-observations.json"), JSON.stringify(result, null, 2));
  });
}
