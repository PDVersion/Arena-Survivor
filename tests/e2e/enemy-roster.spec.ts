import { expect, test } from "@playwright/test";
import { activeTheme } from "../../src/game/content/active-theme";

const rosterIds = activeTheme.enemies.filter((enemy) => !("boss" in enemy && enemy.boss)).map((enemy) => enemy.id).sort();

test("enemy roster exposes every configured non-boss role", async ({ page }) => {
  await page.goto("/?enemyRoster=all&noWeapon&noContact&noXp");
  await expect.poll(async () => {
    const roster = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.rosterHighWater);
    return Object.keys(roster ?? {}).filter((id) => (roster?.[id] ?? 0) > 0).sort();
  }).toEqual(rosterIds);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.combat?.spriteFramesByRole?.["enemy.stationary_fragment"]).toBe(activeTheme.tokens.sprites!["enemy.stationary_fragment"]!.states.idle);
  expect(snapshot?.combat?.rosterHighWater).toEqual(Object.fromEntries(activeTheme.enemies.map((enemy) => [enemy.id, rosterIds.includes(enemy.id) ? 1 : 0])));
});

test("Bagged Waste pays its bounded nonrecursive material-fragment budget", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/sprite-browser.html?noAmbient&noContact&noHazards&noWeapon");
  const result = await page.evaluate(async () => {
    const paths = ["/tests/fixtures/phaser-runtime.ts", "/src/game/scenes/run-scene.ts", "/src/game/content/active-theme.ts", "/src/game/systems/sprites/load-sprites.ts", "/src/game/config.ts"];
    const [{ default: Phaser }, { RunScene }, { activeTheme: theme }, { loadThemeSprites }, { createGameConfig }] = await Promise.all(paths.map((p) => import(p)));
    const root = document.createElement("div"); root.id = "bag-fragment"; document.body.append(root);
    let scene: InstanceType<typeof RunScene>;
    const game = await new Promise<InstanceType<typeof Phaser.Game>>((resolve) => {
      class Run extends RunScene {
        // eslint-disable-next-line @typescript-eslint/no-this-alias -- bounded runtime fixture
        create() { super.create(); scene = this; this.physics.world.pause(); resolve(this.game); }
        update() { /* Isolated lethal/causal admission steps. */ }
      }
      class Load extends Phaser.Scene {
        constructor() { super("bag-load"); }
        preload() { loadThemeSprites(this, theme); }
        create() { this.scene.start("run"); }
      }
      new Phaser.Game({ ...createGameConfig(root.id), type: Phaser.CANVAS, scene: [Load, Run], audio: { noAudio: true } });
    });
    try {
      const definition = theme.enemies.find((e: { id: string }) => e.id === "enemy.death_spawner");
      scene!.spawnEnemy("ambient", 1, definition, { x: scene!.player.x + 70, y: scene!.player.y }, false);
      const parent = [...scene!.enemies][0];
      const reward = definition.xpReward * parent.rewardMultiplier;
      scene!.effectRandom = () => 0; // Aided downside roll, no recursive fragment drops.
      scene!.commitEnemyDamage(parent, 100000, "direct"); scene!.commitEnemyDamage(parent, 100000, "direct");
      const queued = scene!.eventQueue.pending.filter((e: { kind: string; payload: { reason?: string } }) => e.kind === "spawn.requested" && e.payload.reason === "fracture").length;
      scene!.processCausalEvents();
      const children = [...scene!.enemies];
      const money = () => [...scene!.pickups].filter((p) => (p.definition.kind ?? "money") === "money").reduce((sum, p) => sum + p.xpValue, 0);
      const parentMoney = money(), types = children.map((e) => e.definition.id);
      for (const child of children) { scene!.commitEnemyDamage(child, 100000, "direct"); scene!.commitEnemyDamage(child, 100000, "direct"); }
      scene!.processCausalEvents();
      return { queued, count: children.length, types, expectedType: definition.fragmentInto, reward, parentMoney,
        totalMoney: money(), kills: scene!.runState.statistics.kills, live: scene!.enemies.size,
        backlog: scene!.eventQueue.snapshot().backlog, policy: theme.economy.fragmentation };
    } finally { game.destroy(true); root.remove(); }
  });
  expect(result.queued).toBe(result.policy.childCount); expect(result.count).toBe(result.policy.childCount);
  expect(result.types).toEqual(Array(result.count).fill(result.expectedType));
  expect(result.parentMoney).toBeCloseTo(result.reward * result.policy.parentShare);
  expect(result.totalMoney).toBeCloseTo(result.reward * result.policy.totalShare);
  expect(result.kills).toBe(1 + result.count); expect(result.live).toBe(0); expect(result.backlog).toBe(0);
  expect(errors).toEqual([]);
});

interface G1Snapshot { x: number; elapsed: number; health: number; damage: number; breakdown: number; hits: number; clocks: number[]; backlog: number; bodies: number; }
interface G1Fixture { snapshot(): G1Snapshot; outside(): G1Snapshot; play(): void; contact(): number; cleanup(): Promise<void>; }
declare global { interface Window { __G1_CONTACT__?: G1Fixture } }

test("G1 bounded Normal contact band distinguishes in-reach combat, movement and incoming harm", async ({ page }, testInfo) => {
  test.setTimeout(30_000);
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/sprite-browser.html?noAmbient&noXp&noHazards&difficulty=normal");
  try {
    const initial = await page.evaluate(async () => {
      const paths = ["/tests/fixtures/phaser-runtime.ts", "/src/game/scenes/run-scene.ts", "/src/game/content/themes/eco-guardian/index.ts",
        "/src/game/systems/sprites/load-sprites.ts", "/src/game/systems/upgrades.ts", "/src/game/systems/difficulty/resolve-difficulty.ts", "/src/game/config.ts"];
      const [{ default: Phaser }, { RunScene }, { ecoGuardianTheme }, { loadThemeSprites }, { applyUpgrade }, { resolveDifficultyTheme }, { createGameConfig }] = await Promise.all(paths.map((p) => import(p)));
      const theme = resolveDifficultyTheme(ecoGuardianTheme, "normal");
      const root = document.createElement("div"); root.id = "g1-contact";
      Object.assign(root.style, { position: "fixed", inset: "0", zIndex: "9999" }); document.body.append(root);
      let scene: InstanceType<typeof RunScene>, activePlay = false;
      const game = await new Promise<InstanceType<typeof Phaser.Game>>((resolve) => {
        class Run extends RunScene {
          resetTransientRuntime() { this.runTheme = theme; super.resetTransientRuntime(); }
          // eslint-disable-next-line @typescript-eslint/no-this-alias -- test-only scene inspection
          create() { super.create(); scene = this; this.physics.world.pause(); resolve(this.game); }
          update(time: number, delta: number) { if (activePlay) super.update(time, delta); }
        }
        class Load extends Phaser.Scene {
          constructor() { super("g1-load"); }
          preload() { loadThemeSprites(this, theme); }
          create() { this.scene.start("run"); }
        }
        new Phaser.Game({ ...createGameConfig(root.id), type: Phaser.CANVAS,
          audio: { noAudio: true }, scene: [Load, Run] });
      });
      scene!.runState = applyUpgrade(scene!.runState, theme.upgrades.find((u: { id: string }) => u.id === "upgrade.equip_secondary"), undefined, 1, theme.weapons);
      scene!.runState = { ...scene!.runState, player: { ...scene!.runState.player, stats: { ...scene!.runState.player.stats, critChance: 0 } } };
      const glass = theme.enemies.find((e: { id: string }) => e.id === "enemy.slow_durable");
      scene!.spawnEnemy("ambient", 1, glass, { x: scene!.player.x + 70, y: scene!.player.y }, false);
      const enemy = [...scene!.enemies][0];
      const oldHealth = enemy.health;
      const snapshot = (): G1Snapshot => ({ x: scene!.player.x, elapsed: scene!.runState.elapsedMs, health: scene!.runState.player.health,
        damage: scene!.runState.statistics.totalDamage, breakdown: Object.values(scene!.runState.statistics.damageBreakdown).reduce((a: number, b) => a + Number(b), 0),
        hits: scene!.meleeHits, clocks: scene!.runState.weaponSlots.map((slot: { nextAttackAtMs: number }) => slot.nextAttackAtMs),
        backlog: scene!.eventQueue.snapshot().backlog, bodies: scene!.physics.world.bodies.size });
      scene!.fireIfReady();
      const auraWeapon = theme.weapons.find((w: { id: string }) => w.id === "weapon.secondary");
      const pulse = (at: number) => scene!.cleanupRuntime.update(at, scene!.player,
        [{ weapon: auraWeapon, tool: auraWeapon.cleanup, attackRate: 1 }], scene!.enemies);
      pulse(0);
      window.__G1_CONTACT__ = {
        snapshot,
        outside() {
          enemy.arcadeBody.reset(scene!.player.x + 250, scene!.player.y);
          scene!.runState = { ...scene!.runState, elapsedMs: 2000,
            weaponSlots: scene!.runState.weaponSlots.map((slot: { weaponId: string }) => ({ ...slot, nextAttackAtMs: 0 })) };
          scene!.fireIfReady(); pulse(2000); return snapshot();
        },
        play() { scene!.physics.world.resume(); activePlay = true; },
        contact() {
          for (const target of [...scene!.enemies]) { scene!.enemies.delete(target); target.destroy(); }
          scene!.runState = { ...scene!.runState, weaponSlots: scene!.runState.weaponSlots.map((slot: { weaponId: string }) => ({ ...slot, nextAttackAtMs: 1e9 })) };
          scene!.spawnEnemy("ambient", 1, glass, { x: scene!.player.x + 10, y: scene!.player.y }, false);
          return glass.contactDamage;
        },
        async cleanup() { activePlay = false; game.scene.stop("run"); game.destroy(true);
          await new Promise<void>((r) => requestAnimationFrame(() => r())); root.remove(); delete window.__G1_CONTACT__; },
      };
      return { snapshot: snapshot(), oldHealth, newHealth: enemy.health, expectedDamage: (theme.weapons[0].damage + theme.weapons[1].damage) / (1 + glass.armour / 100),
        rate: theme.tuning.pace.gameplayRate, viewport: [innerWidth, innerHeight], userAgent: navigator.userAgent };
    });
    expect(initial.snapshot.hits).toBe(1);
    expect(initial.snapshot.damage).toBeCloseTo(initial.expectedDamage, 8);
    expect(initial.oldHealth - initial.newHealth).toBeCloseTo(initial.expectedDamage, 8);
    expect(initial.snapshot.clocks).toEqual([1000, 0]);
    await page.screenshot({ path: testInfo.outputPath("g1-glass-in-reach.png") });
    const outside = await page.evaluate(() => window.__G1_CONTACT__!.outside());
    expect(outside.damage).toBe(initial.snapshot.damage);
    expect(outside.clocks).toEqual([0, 0]);
    await page.keyboard.down("a");
    await page.evaluate(() => window.__G1_CONTACT__!.play());
    await expect.poll(() => page.evaluate(() => window.__G1_CONTACT__!.snapshot().x)).toBeLessThan(outside.x - 30);
    await page.keyboard.up("a");
    const moving = await page.evaluate(() => window.__G1_CONTACT__!.snapshot());
    expect(moving.damage).toBe(initial.snapshot.damage);
    const contactDamage = await page.evaluate(() => window.__G1_CONTACT__!.contact());
    await expect.poll(() => page.evaluate(() => window.__G1_CONTACT__!.snapshot().health)).toBeLessThan(moving.health);
    const contact = await page.evaluate(() => window.__G1_CONTACT__!.snapshot());
    expect(moving.health - contact.health).toBeCloseTo(contactDamage, 8);
    expect(contact.breakdown).toBeCloseTo(contact.damage, 8);
    expect(contact.backlog).toBe(0);
    expect(errors).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath("g1-real-contact.png") });
    await testInfo.attach("g1-contact-observations", { body: JSON.stringify({ initial, outside, moving, contact, contactDamage, errors }, null, 2), contentType: "application/json" });
  } finally { await page.keyboard.up("a"); await page.evaluate(() => window.__G1_CONTACT__?.cleanup()); }
});
