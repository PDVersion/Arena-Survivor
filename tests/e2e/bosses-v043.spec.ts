import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
interface C5Observations extends Record<string, unknown> {
  hit: { health: number; pulses: number }; beforePulse: number;
  dodge: { before: number; after: number; pulses: number };
  pressure: { actual: number; hud: number; pause: string; progress: number };
  finalKill: { damage: number; expectedHealth: number; xp: number; expectedXp: number };
  end: { pressure: number };
}
declare global { interface Window { __C5__?: { finish(): unknown; reset?(): unknown; cleanup(): Promise<void> } } }

for (const themeKey of ["eco-guardian", "knight-magic"]) for (const ending of ["endless", "clearing"] as const) {
  test(`${themeKey} unique bosses telegraph and hand victory to ${ending}`, async ({ page, browser }, testInfo) => {
    test.setTimeout(30_000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      await page.goto("/sprite-browser.html?noAmbient&noContact&noHazards&noWeapon&xpLevelCap=2");
      const initial = await page.evaluate(async ({ themeKey, ending }) => {
        const paths = ["/tests/fixtures/phaser-runtime.ts", "/src/game/scenes/run-scene.ts", "/src/game/content/theme-registry.ts", "/src/game/systems/sprites/load-sprites.ts", "/src/game/config.ts", "/src/game/state/run-state.ts", "/src/game/entities/shrine-actor.ts"];
        const [{ default: Phaser }, { RunScene }, { themeRegistry }, { loadThemeSprites }, { createGameConfig }, rules, { ShrineActor }] = await Promise.all(paths.map((path) => import(path)));
        const theme = themeRegistry.find((entry: { key: string }) => entry.key === themeKey).theme;
        const parent = document.createElement("div"); parent.id = "c5-root"; Object.assign(parent.style, { position: "fixed", inset: "0", zIndex: "9999", background: "#0a0f1b" }); document.getElementById("sprite-browser")!.style.display = "none"; document.body.style.padding = "0"; document.body.append(parent);
        let ready: (scene: InstanceType<typeof RunScene>) => void = () => {};
        class Probe extends RunScene {
          resetTransientRuntime() { this.runTheme = theme; super.resetTransientRuntime(); }
          create() { super.create(); this.physics.world.pause(); ready(this); }
          update(time: number) { this.activeClock = undefined; super.update(time, 0); }
          tick(delta: number) {
            this.activeClock = { at: performance.now() - delta, active: ["playing", "boss_fight"].includes(this.runState.status) };
            super.update(performance.now(), delta); this.physics.world.pause();
          }
        }
        class Load extends Phaser.Scene {
          constructor() { super("c5-load"); }
          preload() { loadThemeSprites(this, theme); }
          create() { this.scene.start("run"); }
        }
        const started = new Promise<InstanceType<typeof RunScene>>((resolve) => { ready = resolve; });
        const game = new Phaser.Game({ ...createGameConfig(parent.id), type: Phaser.WEBGL, scene: [Load, Probe], audio: { noAudio: true } });
        const cleanup = async () => { game.scene.stop("run"); game.destroy(true); await new Promise((resolve) => setTimeout(resolve, 30)); parent.remove(); };
        window.__C5__ = { cleanup, finish: () => ({}) };
        let timeout: ReturnType<typeof setTimeout> | undefined;
        const scene = await Promise.race([started, new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error("C5 startup timeout")), 8000); })]); clearTimeout(timeout);
        const actors = (): { rewardMultiplier: number; definition: { id: string; xpReward: number; boss?: { kind: string; attack: { recoveryMs: number; telegraphMs: number; radius: number } } }; x: number; y: number; health: number; maxHealth: number; defeated: boolean; targetId: string; destroy(): void }[] => Array.from(scene.enemies);
        // Material shedding has its own changing-RNG runtime regression.
        scene.effectRandom = () => 1 - Number.EPSILON;
        const observations: Record<string, unknown> = {};
        const ordinary = theme.enemies.find((enemy: { id: string }) => enemy.id === "enemy.swarm_basic");
        scene.enemyCapacity = 1;
        scene.spawnEnemy("ambient", 1, ordinary, { x: scene.player.x + 200, y: scene.player.y }, false);
        scene.runState = rules.advanceRunState(scene.runState, scene.runState.durationMs * theme.enemies.find((enemy: { boss?: { kind: string } }) => enemy.boss?.kind === "mini").boss.appearAt);
        scene.releaseBossMilestones();
        observations.capacity = { live: actors().length, spawned: [...scene.spawnedBossIds] };
        actors()[0]!.destroy(); scene.releaseBossMilestones(); scene.releaseBossMilestones();
        const mini = actors().find((enemy) => enemy.definition.boss?.kind === "mini")!;
        observations.mini = { count: actors().length, ids: [...scene.spawnedBossIds], health: mini.health, max: mini.maxHealth };
        // Actual weapon path with a scripted high-damage build, not direct lethal calls.
        const killWithWeapon = (enemy: (ReturnType<typeof actors>)[number]) => {
          enemy.x = scene.player.x + 40; enemy.y = scene.player.y;
          scene.runState = { ...scene.runState, elapsedMs: scene.runState.elapsedMs + 2000,
            player: { ...scene.runState.player, stats: { ...scene.runState.player.stats, damageBonus: 1000, critChance: 0 } } };
          const kills = scene.runState.statistics.kills; const damage = scene.runState.statistics.totalDamage;
          scene.fireWeaponIfReady(theme.weapons[0]);
          if (theme.weapons[0].deliveryKind === "projectile") {
            const projectile = Array.from(scene.projectiles)[0];
            scene.handleProjectileEnemyOverlap(projectile, enemy);
          }
          return { kills: scene.runState.statistics.kills - kills, damage: scene.runState.statistics.totalDamage - damage, defeated: enemy.defeated };
        };
        observations.miniKill = killWithWeapon(mini);
        scene.eventQueue.process(1000, () => {});
        scene.enemyCapacity = 300;
        scene.runState = rules.advanceRunState(scene.runState, scene.runState.durationMs);
        scene.releaseBossMilestones(); scene.releaseBossMilestones();
        const final = actors().find((enemy) => enemy.definition.boss?.kind === "final")!;
        final.x = scene.player.x + 50; final.y = scene.player.y;
        observations.final = { count: actors().length, ids: [...scene.spawnedBossIds], status: scene.runState.status, decision: scene.overtimeUi.isOpen, health: final.health, max: final.maxHealth };
        const attack = final.definition.boss!.attack;
        scene.runState = { ...scene.runState, elapsedMs: scene.runState.elapsedMs + attack.recoveryMs };
        const health = scene.runState.player.health;
        scene.updateBossAttacks();
        const warning = scene.bossAttacks.get(final).warning;
        observations.warning = { ...warning, health, unchanged: scene.runState.player.health === health };
        scene.runState = { ...scene.runState, elapsedMs: warning.releaseAtMs - 1 };
        scene.updateBossAttacks();
        observations.beforePulse = scene.runState.player.health;
        scene.runState = { ...scene.runState, elapsedMs: warning.releaseAtMs };
        scene.updateBossAttacks();
        observations.hit = { health: scene.runState.player.health, pulses: scene.bossPulses, damage: scene.bossDamage };
        // Existing pause/focus handlers retain the live encounter intent.
        scene.togglePause(); const paused = scene.runState.elapsedMs; scene.tick(5000);
        observations.pause = { status: scene.runState.status, frozen: scene.runState.elapsedMs === paused };
        scene.togglePause(); scene.handleGameBlur(); scene.handleGameFocus();
        observations.resume = scene.runState.status;
        scene.runState = rules.awardRunExperience(scene.runState, 3); scene.beginLevelUpChoice();
        observations.levelUp = scene.runState.status;
        scene.chooseUpgrade(scene.currentChoices[0]);
        observations.afterChoice = scene.runState.status;
        // A second fixed warning; move player clear before release.
        scene.runState = { ...scene.runState, elapsedMs: scene.runState.elapsedMs + attack.recoveryMs };
        scene.updateBossAttacks(); const dodgeWarning = scene.bossAttacks.get(final).warning;
        const beforeDodge = scene.runState.player.health;
        scene.player.x += attack.radius + 200;
        scene.runState = { ...scene.runState, elapsedMs: dodgeWarning.releaseAtMs };
        scene.updateBossAttacks();
        observations.dodge = { before: beforeDodge, after: scene.runState.player.health, pulses: scene.bossPulses };
        scene.processCausalEvents();
        const summoned = actors().filter((enemy) => !enemy.definition.boss);
        observations.attackSummons = { count: summoned.length, expected: theme.economy
          ? theme.enemies.find((e: { id: string }) => e.id === final.definition.id).boss.summons.patterns.slice(0, 2).reduce((sum: number, p: { entries: { count: number }[] }) => sum + p.entries.reduce((n, e) => n + e.count, 0), 0) : 0 };
        for (const child of summoned) child.destroy();
        const duplication = theme.shrines.find((site: { effectKind: string }) => site.effectKind === "duplicate_living");
        const shrine = new ShrineActor(scene, scene.player.x, scene.player.y, duplication, theme.tokens, "", "");
        scene.activateShrine(shrine); shrine.destroy(); scene.processCausalEvents();
        observations.duplication = { count: actors().length, backlog: scene.eventQueue.snapshot().backlog };
        const world = scene.worldModifiers(); const extras = scene.hudExtras(); const pause = scene.pauseMenuView();
        observations.pressure = { actual: world.threatStep, hud: extras.threatStep, pause: pause.world.find((line: { label: string }) => line.label === theme.copy.world.threat)?.display,
          progress: rules.runEscalationProgress(scene.runState), elapsed: scene.runState.elapsedMs, duration: scene.runState.durationMs };
        scene.bossHealthUi.update(scene.bossHealthValues());
        // Retain a real warning and both current/max values for screenshot inspection.
        scene.runState = { ...scene.runState, elapsedMs: scene.runState.elapsedMs + attack.recoveryMs };
        scene.updateBossAttacks();
        scene.cameras.main.centerOn(final.x, final.y);
        window.__C5__ = { cleanup, reset: () => ({ elapsedMs: scene.runState?.elapsedMs, status: scene.runState?.status, spawnedIds: [...scene.spawnedBossIds], phase: scene.runState?.activePhase }), finish: () => {
          const rawXp = scene.ambientXpDropped; const expectedXp = final.definition.xpReward * final.rewardMultiplier;
          const lethal = killWithWeapon(final);
          const once = scene.runState.statistics.kills; scene.commitEnemyDamage(final, 1000000, "direct");
          observations.finalKill = { ...lethal, expectedHealth: final.maxHealth, xp: scene.ambientXpDropped - rawXp, expectedXp, duplicateAdded: scene.runState.statistics.kills - once,
            status: scene.runState.status, decision: scene.overtimeUi.isOpen, live: actors().length, warnings: scene.bossAttacks.size, cues: scene.bossCues.size };
          scene.enqueueSpawnRequest(ordinary.id, "ambient", 0.375, undefined, undefined, "wave", { x: scene.player.x + 40, y: scene.player.y }, false);
          const held = scene.runState.elapsedMs; scene.tick(2000);
          observations.held = scene.runState.elapsedMs === held;
          scene.resolveOvertimeChoice(ending);
          observations.chosen = { status: scene.runState.status, mode: scene.runState.mode };
          scene.tick(1000);
          observations.pending = { live: actors().length, status: scene.runState.status, backlog: scene.eventQueue.snapshot().backlog };
          if (ending === "clearing") { killWithWeapon(actors()[0]!); scene.tick(0); scene.tick(0); }
          else scene.tick(4000);
          observations.end = { status: scene.runState.status, mode: scene.runState.mode, live: actors().length, backlog: scene.eventQueue.snapshot().backlog, elapsed: scene.runState.elapsedMs, bossIds: [...scene.spawnedBossIds], pressure: rules.runEscalationProgress(scene.runState) };
          if (ending === "endless") { scene.runState = rules.damageRunPlayer(scene.runState, 100000, { sourceId: ordinary.id, elite: false }); scene.enterTerminalState(); }
          scene.restartRun();
          return observations;
        } };
        const canvas = game.canvas;
        const gl = canvas.getContext("webgl2") || canvas.getContext("webgl"); const extension = gl?.getExtension("WEBGL_debug_renderer_info");
        return { observations, environment: { browserUa: navigator.userAgent, viewport: { width: innerWidth, height: innerHeight }, dpr: devicePixelRatio,
          renderer: extension ? gl?.getParameter(extension.UNMASKED_RENDERER_WEBGL) : gl?.getParameter(gl.RENDERER), mode: "test", rate: theme.tuning.pace.gameplayRate } };
      }, { themeKey, ending });
      await page.setViewportSize({ width: 1000, height: 700 });
      await page.waitForTimeout(1300);
      await page.screenshot({ path: testInfo.outputPath("boss-warning-health.png") });
      const result = await page.evaluate(() => window.__C5__!.finish()) as C5Observations;
      expect(result.capacity).toEqual({ live: 1, spawned: [] });
      expect(result.mini).toMatchObject({ count: 1, ids: ["enemy.mini_boss"] });
      expect(result.miniKill).toMatchObject({ kills: 1, defeated: true });
      expect(result.final).toMatchObject({ count: 1, ids: ["enemy.mini_boss", "enemy.final_boss"], status: "boss_fight", decision: false });
      expect(result.warning).toMatchObject({ unchanged: true });
      expect(result.hit.health).toBeLessThan(result.beforePulse); expect(result.hit.pulses).toBe(1);
      expect(result.pause).toEqual({ status: "paused", frozen: true }); expect(result.resume).toBe("boss_fight");
      expect(result.levelUp).toBe("level_up"); expect(result.afterChoice).toBe("boss_fight");
      expect(result.dodge.after).toBe(result.dodge.before); expect(result.dodge.pulses).toBe(2);
      const summoned = result.attackSummons as { count: number; expected: number };
      expect(summoned.count).toBe(summoned.expected);
      expect(result.duplication).toEqual({ count: 1, backlog: 0 });
      expect(result.pressure.actual).toBe(result.pressure.hud); expect(Number(result.pressure.pause)).toBe(result.pressure.actual); expect(result.pressure.progress).toBe(1);
      expect(result.finalKill).toMatchObject({ kills: 1, defeated: true, duplicateAdded: 0, status: "time_up", decision: true, live: 0, warnings: 0, cues: 0 });
      expect(result.finalKill.damage).toBe(result.finalKill.expectedHealth); expect(result.finalKill.xp).toBe(result.finalKill.expectedXp);
      expect(result.held).toBe(true); expect(result.chosen).toEqual({ status: "playing", mode: ending });
      expect(result.pending).toMatchObject({ live: 1, status: "playing", backlog: 0 });
      expect(result.end).toMatchObject({ status: ending === "clearing" ? "complete" : "playing", mode: ending, backlog: 0, bossIds: ["enemy.mini_boss", "enemy.final_boss"] });
      if (ending === "endless") expect(result.end.pressure).toBeGreaterThan(1);
      await expect.poll(() => page.evaluate(() => window.__C5__?.reset?.())).toEqual({ elapsedMs: 0, status: "playing", spawnedIds: [], phase: "playing" });
      expect(errors).toEqual([]);
      const evidence = JSON.stringify({ ...initial, observations: result, browser: browser.version(), errors }, null, 2);
      await writeFile(testInfo.outputPath("evidence.json"), evidence);
      await testInfo.attach("C5 evidence", { body: evidence, contentType: "application/json" });
    } finally { await page.evaluate(() => window.__C5__?.cleanup()).catch(() => {}); }
  });
}
