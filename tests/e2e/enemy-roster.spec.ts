import { expect, test } from "@playwright/test";

test("enemy roster exposes all five distinct configured roles", async ({ page }) => {
  await page.goto("/?enemyRoster=all");
  await expect.poll(async () => {
    const roster = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.rosterHighWater);
    return roster ? Object.values(roster).filter((count) => count > 0).length : 0;
  }).toBe(5);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.combat?.spriteFramesByRole?.["enemy.stationary_fragment"]).toBe(3);
  expect(snapshot?.combat?.rosterHighWater).toMatchObject({
    "enemy.swarm_basic": 1,
    "enemy.fast_fragile": 1,
    "enemy.slow_durable": 1,
    "enemy.death_spawner": 1,
    "enemy.stationary_fragment": 1,
  });
});

test("Bagged Waste queues and eventually spawns its finite five-child material mix", async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  // The subject is retained death-spawn work, not the time taken for a slow
  // Broodmother to cross the off-screen spawn ring on a throttled CI runner.
  await page.goto("/?enemyRoster=broodmother&spawnRadius=72&noContact&noXp&noHazards");
  await expect.poll(async () => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().combat?.offspringSpawned), { timeout: 90_000 }).toBe(5);
  const snapshot = await page.evaluate(() => window.__ARENA_TEST__?.getSnapshot());
  expect(snapshot?.combat?.offspringQueued).toBe(5);
  expect(snapshot?.spawnOrigins?.spawned.baggedWaste).toBe(5);
  expect(snapshot?.spawnOrigins?.spawned.benchmark).toBe(1);
  expect(snapshot?.combat?.rosterHighWater["enemy.death_spawner"]).toBe(1);
  expect(snapshot?.combat?.rosterHighWater["enemy.swarm_basic"]).toBe(2);
  expect(snapshot?.combat?.rosterHighWater["enemy.fast_fragile"]).toBe(2);
  expect(snapshot?.combat?.rosterHighWater["enemy.slow_durable"]).toBe(1);
  expect(snapshot?.run?.liveEnemies).toBeLessThanOrEqual(snapshot?.combat?.enemyCap ?? 0);
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
      window.__G1_CONTACT__ = {
        snapshot,
        outside() {
          enemy.arcadeBody.reset(scene!.player.x + 250, scene!.player.y);
          scene!.runState = { ...scene!.runState, elapsedMs: 2000,
            weaponSlots: scene!.runState.weaponSlots.map((slot: { weaponId: string }) => ({ ...slot, nextAttackAtMs: 0 })) };
          scene!.fireIfReady(); return snapshot();
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
    expect(initial.snapshot.hits).toBe(2);
    expect(initial.snapshot.damage).toBeCloseTo(initial.expectedDamage, 8);
    expect(initial.oldHealth - initial.newHealth).toBeCloseTo(initial.expectedDamage, 8);
    expect(initial.snapshot.clocks).toEqual([1000, 1400]);
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
