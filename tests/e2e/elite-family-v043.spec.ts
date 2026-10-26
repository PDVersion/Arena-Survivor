import { expect, test } from "@playwright/test";

declare global { interface Window { __C4_CLEANUP__?: () => Promise<void> } }
for (const themeKey of ["eco-guardian", "knight-magic"]) test(`${themeKey} elite variants preserve bounded descendants and exact shield ledger`, async ({ page, browser }, testInfo) => {
  test.setTimeout(30_000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    await page.goto("/sprite-browser.html?noAmbient&noContact&noHazards");
    const result = await page.evaluate(async (themeKey) => {
      const paths = ["/tests/fixtures/phaser-runtime.ts", "/src/game/scenes/run-scene.ts", "/src/game/content/theme-registry.ts", "/src/game/systems/sprites/load-sprites.ts", "/src/game/config.ts", "/src/game/entities/shrine-actor.ts"];
      const [{ default: Phaser }, { RunScene }, { themeRegistry }, { loadThemeSprites }, { createGameConfig }, { ShrineActor }] = await Promise.all(paths.map((p) => import(p)));
      const theme = themeRegistry.find((t: { key: string }) => t.key === themeKey).theme;
      const parent = document.createElement("div"); parent.id = "c4-root"; Object.assign(parent.style, { position: "fixed", inset: "0", zIndex: "9999" }); document.body.append(parent);
      let ready: (s: InstanceType<typeof RunScene>) => void = () => {};
      class Probe extends RunScene {
        resetTransientRuntime() { this.runTheme = theme; super.resetTransientRuntime(); }
        create() { super.create(); this.physics.world.pause(); ready(this); }
        update(time: number) { super.update(time, 0); }
      }
      class Load extends Phaser.Scene {
        constructor() { super("c4-load"); }
        preload() { loadThemeSprites(this, theme); }
        create() { this.scene.start("run"); }
      }
      const started = new Promise<InstanceType<typeof RunScene>>((resolve) => { ready = resolve; });
      const game = new Phaser.Game({ ...createGameConfig(parent.id), type: Phaser.WEBGL, scene: [Load, Probe], audio: { noAudio: true } });
      window.__C4_CLEANUP__ = async () => { game.scene.stop("run"); game.destroy(true); await new Promise((r) => setTimeout(r, 30)); parent.remove(); };
      let timeout: ReturnType<typeof setTimeout> | undefined;
      const scene = await Promise.race([started, new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error("C4 startup timeout")), 8000); })]); clearTimeout(timeout);
      type Enemy = { elite?: { id: string }; targetId: string; health: number; maxHealth: number; moveSpeed: number; eliteSplitDepth: number; rewardMultiplier: number; sourceRewardMultiplier: number; movement: string; definition: { id: string }; eliteMarker?: { text: string; active: boolean }; advance(target: unknown, delta: number): void; destroy(): void };
      const actors = (): Enemy[] => Array.from(scene.enemies);
      const clear = () => { for (const enemy of actors()) enemy.destroy(); scene.eventQueue.clear(); };
      const baseRole = theme.enemies.find((e: { id: string }) => e.id === "enemy.swarm_basic");
      const spawn = (eliteId: string, role = baseRole, reward = 1, depth = 0) => {
        const before = new Set(actors()); scene.spawnEnemy("shrine.spawn_surge", reward, role, { x: scene.player.x + 70, y: scene.player.y }, eliteId, undefined, "chase", "environment", depth);
        return actors().find((e) => !before.has(e))!;
      };
      const observations: Record<string, unknown> = {};
      const shield = spawn("elite.shield");
      const before = scene.runState.statistics.totalDamage; const initial = shield.health;
      scene.commitEnemyDamage(shield, 2, "direct");
      observations.shield = { initial, lost: initial - shield.health, ledger: scene.runState.statistics.totalDamage - before };
      shield.health = shield.maxHealth / 2;
      const health = shield.health; const ledger = scene.runState.statistics.totalDamage;
      scene.commitEnemyDamage(shield, 2, "direct");
      observations.brokenShield = { lost: health - shield.health, ledger: scene.runState.statistics.totalDamage - ledger };
      clear();
      const parentEnemy = spawn("elite.split", baseRole, 1.5);
      const parentReward = parentEnemy.rewardMultiplier;
      const rawXpBefore = scene.shrineXpDropped;
      scene.commitEnemyDamage(parentEnemy, 1000000, "direct");
      const queued = scene.eventQueue.pending.filter((e: { kind: string; provenance: { effectId?: string } }) => e.kind === "spawn.requested" && e.provenance.effectId === "elite.split");
      scene.processCausalEvents();
      const children = actors();
      observations.split = { count: children.length, queued: queued.length, variants: children.map((e) => e.elite?.id), depth: children.map((e) => e.eliteSplitDepth), rewards: children.map((e) => e.rewardMultiplier), parentReward, parentXp: scene.shrineXpDropped - rawXpBefore, rawXp: baseRole.xpReward };
      for (const child of children) { scene.commitEnemyDamage(child, 1000000, "direct"); scene.commitEnemyDamage(child, 1000000, "direct"); }
      scene.processCausalEvents();
      observations.afterChildren = { live: actors().length, backlog: scene.eventQueue.snapshot().backlog, xp: scene.shrineXpDropped - rawXpBefore };
      clear();
      scene.enemyCapacity = 1;
      const capped = spawn("elite.split"); scene.commitEnemyDamage(capped, 1000000, "direct"); scene.processCausalEvents();
      observations.cap = { live: actors().length, pending: scene.eventQueue.snapshot().backlog };
      actors()[0]!.destroy(); scene.processCausalEvents();
      observations.capDrained = { live: actors().length, pending: scene.eventQueue.snapshot().backlog };
      clear(); scene.enemyCapacity = 300;
      const inherited: Record<string, unknown> = {};
      for (const variant of ["elite.split", "elite.shield", "elite.acceleration"]) {
        const enemy = spawn(variant, baseRole, 1, 1);
        const duplication = theme.shrines.find((s: { effectKind: string }) => s.effectKind === "duplicate_living");
        const shrine = new ShrineActor(scene, scene.player.x, scene.player.y, duplication, theme.tokens, "", "");
        scene.activateShrine(shrine); scene.processCausalEvents();
        inherited[variant] = actors().map((e) => ({ id: e.elite?.id, depth: e.eliteSplitDepth, movement: e.movement }));
        enemy.destroy(); shrine.destroy(); clear();
      }
      observations.duplication = inherited;
      const descendants: Record<string, unknown> = {};
      scene.effectRandom = () => 0;
      for (const variant of ["elite.split", "elite.shield", "elite.acceleration"]) {
        const spawnerRole = theme.enemies.find((e: { id: string }) => e.id === "enemy.death_spawner");
        const spawner = spawn(variant, spawnerRole, 1, 1);
        scene.commitEnemyDamage(spawner, 1000000, "direct"); scene.processCausalEvents();
        const offspring = actors().map((e) => ({ variant: e.elite?.id, depth: e.eliteSplitDepth }));
        clear();
        scene.runState = { ...scene.runState, skillLevels: { "skill.fracture": 1 } };
        const parent = spawn(variant, baseRole, 1, 1);
        scene.commitEnemyDamage(parent, 1000000, "direct"); scene.processCausalEvents();
        descendants[variant] = { offspring, expectedOffspring: spawnerRole.deathSpawns.reduce((n: number, d: { count: number }) => n + d.count, 0),
          fragments: actors().map((e) => ({ variant: e.elite?.id, depth: e.eliteSplitDepth, reward: e.rewardMultiplier })) };
        clear(); scene.runState = { ...scene.runState, skillLevels: {} };
      }
      observations.descendants = descendants;
      const acceleration = spawn("elite.acceleration");
      const speed = acceleration.moveSpeed;
      acceleration.advance(new Phaser.Math.Vector2(scene.player.x, scene.player.y), 1500);
      const half = acceleration.moveSpeed;
      scene.runState = { ...scene.runState, status: "paused" }; scene.update(0, 6000);
      const paused = acceleration.moveSpeed;
      scene.runState = { ...scene.runState, status: "playing" };
      acceleration.advance(new Phaser.Math.Vector2(scene.player.x, scene.player.y), 1500);
      observations.acceleration = { speed, half, paused, full: acceleration.moveSpeed };
      clear();
      const killsBefore = scene.runState.statistics.kills;
      for (let i = 0; i < 100; i++) spawn("elite.split");
      for (const enemy of actors()) scene.commitEnemyDamage(enemy, 1000000, "direct");
      let peak = 0;
      for (let i = 0; i < 30 && scene.eventQueue.snapshot().backlog > 0; i++) { scene.processCausalEvents(); peak = Math.max(peak, actors().length); }
      const childrenCount = actors().length;
      const depths = [...new Set(actors().map((e) => e.eliteSplitDepth))];
      for (const enemy of actors()) scene.commitEnemyDamage(enemy, 1000000, "direct");
      for (let i = 0; i < 30 && scene.eventQueue.snapshot().backlog > 0; i++) scene.processCausalEvents();
      observations.burst = { peak, childrenCount, depths, live: actors().length, backlog: scene.eventQueue.snapshot().backlog, kills: scene.runState.statistics.kills - killsBefore };
      clear();
      for (const [i, eliteId] of ["elite.split", "elite.shield", "elite.acceleration"].entries()) {
        const enemy = spawn(eliteId); const actor = Array.from(scene.enemies).find((e) => e === enemy); Object.assign(actor!, { x: scene.player.x + (i - 1) * 75, y: scene.player.y - 50 });
      }
      await new Promise((r) => setTimeout(r, 50));
      observations.markers = actors().map((e) => e.eliteMarker?.text);
      const canvas = document.querySelector("#c4-root canvas") as HTMLCanvasElement; const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl"); const debug = gl?.getExtension("WEBGL_debug_renderer_info");
      return { observations, environment: { themeKey, userAgent: navigator.userAgent, renderer: debug && gl?.getParameter(debug.UNMASKED_RENDERER_WEBGL), viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio }, mode: "test", rate: 0.5 } };
    }, themeKey);
    const o = result.observations as {
      shield: { lost: number; ledger: number }; brokenShield: { lost: number; ledger: number };
      split: { count: number; queued: number; variants: string[]; depth: number[]; rewards: number[]; parentReward: number; parentXp: number };
      afterChildren: { live: number; backlog: number; xp: number };
      cap: { live: number; pending: number }; capDrained: { live: number; pending: number };
      duplication: Record<string, { id: string; depth: number; movement: string }[]>;
      burst: { peak: number; childrenCount: number; depths: number[]; live: number; backlog: number; kills: number };
      descendants: Record<string, { offspring: { variant: string; depth: number }[]; expectedOffspring: number; fragments: { variant: string; depth: number; reward: number }[] }>;
      acceleration: { speed: number; half: number; paused: number; full: number }; markers: string[];
    };
    expect(o.shield.lost).toBe(1); expect(o.shield.ledger).toBe(1);
    expect(o.brokenShield.lost).toBe(2); expect(o.brokenShield.ledger).toBe(2);
    expect(o.split.count).toBe(2); expect(o.split.queued).toBe(2); expect(o.split.variants).toEqual(["elite.split", "elite.split"]); expect(o.split.depth).toEqual([1, 1]);
    for (const reward of o.split.rewards) expect(reward).toBeCloseTo(o.split.parentReward * 0.5);
    expect(o.afterChildren).toEqual({ live: 0, backlog: 0, xp: o.split.parentXp * 2 });
    expect(o.cap).toEqual({ live: 1, pending: 1 }); expect(o.capDrained).toEqual({ live: 1, pending: 0 });
    for (const [variant, descendants] of Object.entries(o.duplication)) expect(descendants).toEqual([{ id: variant, depth: 1, movement: "chase" }, { id: variant, depth: 1, movement: "chase" }]);
    for (const [variant, descendants] of Object.entries(o.descendants)) {
      expect(descendants.offspring).toHaveLength(descendants.expectedOffspring);
      for (const child of descendants.offspring) expect(child).toEqual({ variant, depth: 1 });
      expect(descendants.fragments).toEqual([{ variant, depth: 1, reward: 0 }, { variant, depth: 1, reward: 0 }]);
    }
    expect(o.acceleration.half).toBeCloseTo(o.acceleration.speed * 1.25); expect(o.acceleration.paused).toBe(o.acceleration.half); expect(o.acceleration.full).toBeCloseTo(o.acceleration.speed * 1.5);
    expect(o.burst).toEqual({ peak: 200, childrenCount: 200, depths: [1], live: 0, backlog: 0, kills: 300 });
    expect(o.markers).toEqual(["2", "◇", "»"]); expect(errors).toEqual([]);
    await page.waitForTimeout(650);
    await page.screenshot({ path: testInfo.outputPath("elite-family.png") });
    await testInfo.attach("C4 evidence", { body: JSON.stringify({ ...result, browser: browser.version(), errors }, null, 2), contentType: "application/json" });
  } finally { await page.evaluate(() => window.__C4_CLEANUP__?.()).catch(() => {}); }
});
