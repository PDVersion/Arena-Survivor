import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

interface ClusterSnapshot {
  enemies: number; backlog: number; xp: number; damage: number; breakdown: number; kills: number;
  views: number; settings: { presentationQuality: string; reducedMotion: boolean };
}
interface ClusterFixture { snapshot(): ClusterSnapshot; natural(): { count: number; backlog: number; width: number; radius: number; positions: number[][]; outsideHealth: number[]; speed: number; expectedSpeed: number }; pulse(): Promise<ClusterSnapshot & { outsideHealth: number[] }>; cleanup(): Promise<void>; }
declare global { interface Window { __G2_CLUSTER__?: ClusterFixture } }

for (const themeKey of ["eco-guardian", "knight-magic"]) for (const quality of ["default", "low"]) {
  test(`${themeKey} G2 group introduction retains work, shows ${quality} shapes and pays each lethal once`, async ({ page, browser }, testInfo) => {
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
        const root = document.createElement("div"); root.id = "g2-cluster";
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
            update() { /* Deterministic admission/combat; presentation timers stay real. */ }
          }
          class Load extends Phaser.Scene {
            constructor() { super("g2-load"); }
            preload() { loadThemeSprites(this, theme); }
            create() { this.scene.start("run"); }
          }
          new Phaser.Game({ ...createGameConfig(root.id), type: Phaser.CANVAS, audio: { noAudio: true }, scene: [Load, Run] });
        });
        if (quality === "low") scene!.applySetting("presentationQuality");
        if (quality === "low") scene!.applySetting("reducedMotion");
        const definition = theme.enemies.find((e: { arrivalCluster?: unknown }) => e.arrivalCluster);
        const role = theme.tuning.director.roles.find((r: { enemyId: string }) => r.enemyId === definition.id);
        scene!.runState = { ...scene!.runState, elapsedMs: scene!.runState.durationMs * role.unlockAt };
        scene!.lastDirectorProgress = role.unlockAt - .001;
        const permitAmbient = (action: () => void) => {
          const url = new URL(location.href); url.searchParams.delete("noAmbient"); history.replaceState(null, "", url);
          try { action(); } finally { url.searchParams.set("noAmbient", ""); history.replaceState(null, "", url); }
        };
        const snapshot = (): ClusterSnapshot => ({ enemies: scene!.enemies.size, backlog: scene!.eventQueue.snapshot().backlog,
          xp: [...scene!.pickups].filter((p) => !p.isClaimed).reduce((n, p) => n + p.xpValue, 0),
          damage: scene!.runState.statistics.totalDamage, kills: scene!.runState.statistics.kills,
          breakdown: Object.values(scene!.runState.statistics.damageBreakdown).reduce((a: number, b) => a + Number(b), 0),
          views: [...scene!.enemies].filter((e) => e.definition.id === definition.id && (e.view?.image ?? e.primitiveView?.image)?.active).length,
          settings: settings.getSessionSettings() });
        scene!.enemyCapacity = 1;
        permitAmbient(() => scene!.releaseMilestoneWaves());
        const queued = snapshot();
        permitAmbient(() => scene!.releaseMilestoneWaves());
        const repeated = snapshot();
        const admissions = [];
        for (let i = 0; i < 3; i++) {
          scene!.processCausalEvents();
          const enemy = [...scene!.enemies][0];
          const held = snapshot(); scene!.processCausalEvents();
          const stillHeld = snapshot();
          const health = enemy.health, reward = definition.xpReward * enemy.rewardMultiplier;
          scene!.commitEnemyDamage(enemy, 10000, "direct", undefined, { weapon: theme.weapons[0], directBase: 10000, criticalBonus: 0, piercingMomentum: 0 });
          const lethal = snapshot();
          scene!.commitEnemyDamage(enemy, 10000, "direct");
          if (enemy.view) {
            const path = "/src/game/systems/sprites/sprite-animation.ts";
            const { SPRITE_DEATH_FRAME_MS } = await import(path);
            await new Promise<void>((resolve) => scene!.time.delayedCall(SPRITE_DEATH_FRAME_MS + 30, resolve));
          }
          admissions.push({ held, stillHeld, health, reward, lethal, duplicate: snapshot(), viewDestroyed: !(enemy.view?.image ?? enemy.primitiveView!.image).active });
        }
        scene!.processCausalEvents();
        const cleared = snapshot();
        let outsideActors: { health: number }[] = [];
        window.__G2_CLUSTER__ = {
          snapshot,
          natural() {
            scene!.enemyCapacity = 300;
            scene!.enemyRandom = () => 1 - Number.EPSILON;
            scene!.nextSpawnAtMs = 0;
            permitAmbient(() => scene!.spawnIfReady());
            const actors = [...scene!.enemies];
            const positions = actors.map((e) => [e.x, e.y]);
            for (const [i, actor] of actors.entries()) actor.arcadeBody.reset(scene!.player.x + 70, scene!.player.y + (i - 1) * definition.arrivalCluster.spacing);
            actors[0].advance(new Phaser.Math.Vector2(scene!.player.x, scene!.player.y), 100);
            const speed = actors[0].arcadeBody.velocity.length(); actors[0].arcadeBody.setVelocity(0, 0);
            for (const [i, id] of ["enemy.swarm_basic", theme.economy ? "enemy.cluster_fodder" : "enemy.fast_fragile"].entries()) {
              scene!.spawnEnemy("ambient", 1, theme.enemies.find((e: { id: string }) => e.id === id),
                { x: scene!.player.x - (theme.economy ? 200 : 75), y: scene!.player.y + (i === 0 ? -35 : 35) }, false);
            }
            outsideActors = [...scene!.enemies].filter((e) => e.definition.id !== definition.id);
            return { count: actors.length, backlog: snapshot().backlog, positions, width: actors[0].arcadeBody.width, radius: actors[0].definition.radius,
              outsideHealth: outsideActors.map((e) => e.health), speed, expectedSpeed: definition.moveSpeed * scene!.worldModifiers().enemyMoveSpeedMultiplier };
          },
          async pulse() {
            scene!.runState = applyUpgrade(scene!.runState, theme.upgrades.find((u: { id: string }) => u.id === "upgrade.equip_secondary"), undefined, 1, theme.weapons);
            scene!.runState = { ...scene!.runState, player: { ...scene!.runState.player, stats: { ...scene!.runState.player.stats, critChance: 0 } },
              weaponSlots: scene!.runState.weaponSlots.map((slot: { weaponId: string }) => ({ ...slot, nextAttackAtMs: slot.weaponId === "weapon.starter" ? 1e9 : 0 })) };
            const weapon = theme.weapons.find((w: { id: string }) => w.id === "weapon.secondary");
            if (weapon.cleanup) {
              // Drive the real aura scheduler at authored tick times, not the retired cone.
              const health = Math.max(...[...scene!.enemies].filter((e) => e.definition.id === definition.id).map((e) => e.health));
              for (let i = 0; i <= Math.ceil(health / weapon.cleanup.damage); i++) {
                scene!.cleanupRuntime.update(scene!.runState.elapsedMs + i * weapon.cleanup.tickMs, scene!.player,
                  [{ weapon, tool: weapon.cleanup, attackRate: 1 }], scene!.enemies);
                scene!.processCausalEvents();
              }
            } else { scene!.fireIfReady(); scene!.processCausalEvents(); }
            return { ...snapshot(), outsideHealth: outsideActors.map((e) => e.health) };
          },
          async cleanup() { game.scene.stop("run"); game.destroy(true); await new Promise<void>((r) => requestAnimationFrame(() => r())); root.remove(); delete window.__G2_CLUSTER__; },
        };
        return { queued, repeated, admissions, cleared, rate: theme.tuning.pace.gameplayRate, userAgent: navigator.userAgent };
      }, { themeKey, quality });
      expect(initial.queued.backlog).toBe(3);
      expect(initial.repeated.backlog).toBe(3);
      expect(initial.admissions.map((a) => a.held.backlog)).toEqual([2, 1, 0]);
      for (const admission of initial.admissions) {
        expect(admission.held.enemies).toBe(1); expect(admission.held.views).toBe(1);
        expect(admission.stillHeld).toEqual(admission.held);
        expect(admission.duplicate).toEqual(admission.lethal);
        expect(admission.viewDestroyed).toBe(true);
      }
      expect(initial.cleared.enemies).toBe(0); expect(initial.cleared.kills).toBe(3);
      expect(initial.cleared.xp).toBeCloseTo(initial.admissions.reduce((sum, a) => sum + a.reward, 0), 8);
      expect(initial.cleared.damage).toBeCloseTo(initial.admissions.reduce((n, a) => n + a.health, 0), 8);
      const natural = await page.evaluate(() => window.__G2_CLUSTER__!.natural());
      expect(natural.count).toBe(3); expect(natural.backlog).toBe(0);
      expect(natural.width).toBe(natural.radius * 2);
      expect(natural.speed).toBeCloseTo(natural.expectedSpeed, 8);
      const visible = await page.evaluate(() => window.__G2_CLUSTER__!.snapshot());
      expect(visible.views).toBe(3);
      expect(visible.settings.presentationQuality).toBe(quality);
      expect(visible.settings.reducedMotion).toBe(quality === "low");
      await page.screenshot({ path: testInfo.outputPath("group-before.png") });
      const pulse = await page.evaluate(() => window.__G2_CLUSTER__!.pulse());
      expect(pulse.kills).toBe(6); expect(pulse.enemies).toBe(2);
      expect(pulse.outsideHealth).toEqual(natural.outsideHealth);
      expect(pulse.views).toBe(0);
      expect(pulse.xp).toBeCloseTo(initial.cleared.xp * 2, 8);
      expect(pulse.breakdown).toBeCloseTo(pulse.damage, 8);
      await page.screenshot({ path: testInfo.outputPath("group-after.png") });
      expect(errors).toEqual([]);
      const observations = { themeKey, quality, browser: browser.version(), initial, natural, visible, pulse, errors };
      await writeFile(testInfo.outputPath("observations.json"), JSON.stringify(observations, null, 2));
    } finally { await page.evaluate(() => window.__G2_CLUSTER__?.cleanup()); }
  });
}
