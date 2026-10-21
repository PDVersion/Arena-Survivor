import { expect, test, type Page } from "@playwright/test";

interface ToolSnapshot {
  status: string;
  choiceIndex: number;
  slots: readonly string[];
  choices: readonly string[];
  clocks: readonly number[];
  elapsedMs: number;
  kills: number;
  total: number;
  splash: number;
  explosion: number;
  breakdownTotal: number;
  enemies: number;
  peak: number;
  backlog: number;
  xp: number;
  ownRange: number;
  starterOwnRange: number;
  globalRange: number;
  evolvedRange: number;
  selected: readonly string[];
  deathSources: readonly { sourceId: string; damageSource: string }[];
  damageAccumulated: number;
  damageFlushed: number;
  damagePending: number;
}
interface ToolFixture {
  snapshot(): ToolSnapshot;
  combat(): ToolSnapshot;
  offerOwned(): void;
  offerEvolution(): void;
  armClock(): void;
  deadPrimaryProbe(): { addedKills: number; remainingHealth: readonly number[]; addedDamage: number };
  restart(): void;
  stress(quality: string): void;
  cleanup(): Promise<void>;
}
declare global { interface Window { __C1_TOOL_FIXTURE__?: ToolFixture } }

test.use({ userAgent: undefined });

async function setup(page: Page, themeKey: string) {
  await page.goto("/sprite-browser.html?noAmbient&noContact&noHazards&xpLevelCap=2");
  return page.evaluate(async (themeKey) => {
    const paths = ["/tests/fixtures/phaser-runtime.ts", "/src/game/scenes/run-scene.ts",
      "/src/game/content/theme-registry.ts", "/src/game/systems/upgrades.ts",
      "/src/game/systems/sprites/load-sprites.ts", "/src/game/state/settings-state.ts", "/src/game/config.ts"];
    const [{ default: Phaser }, { RunScene }, { themeRegistry }, upgrades, { loadThemeSprites }, settings, { createGameConfig }] = await Promise.all(paths.map((path) => import(path)));
    const theme = themeRegistry.find((entry: { key: string }) => entry.key === themeKey).theme;
    const persistencePath = "/src/game/systems/persistence/profile-service.ts";
    const statsPath = "/src/game/systems/statistics/run-statistics.ts";
    const persistence = await import(persistencePath);
    const stats = await import(statsPath);
    persistence.initializeProfile(theme);
    persistence.recordProfileFinishedRun(theme, { status: "complete", elapsedMs: 1000, level: 1, statistics: stats.createRunStatistics() });
    const parent = document.createElement("div");
    Object.assign(parent.style, { position: "fixed", inset: "0", zIndex: "9999" });
    parent.id = "c1-tool-root";
    document.body.append(parent);
    let scene: InstanceType<typeof RunScene>;
    let activePlay = false;
    let ready: (value: InstanceType<typeof RunScene>) => void = () => {};
    class ToolRun extends RunScene {
      resetTransientRuntime() { this.runTheme = theme; super.resetTransientRuntime(); }
      create() { super.create(); this.physics.world.pause(); ready(this); }
      update(time: number, delta: number) {
        if (activePlay || this.runState?.status === "level_up") super.update(time, delta);
      }
    }
    class Load extends Phaser.Scene {
      constructor() { super("load-c1"); }
      preload() { loadThemeSprites(this, theme); }
      create() { this.scene.start("run"); }
    }
    const first = new Promise<InstanceType<typeof RunScene>>((resolve) => { ready = resolve; });
    const game = new Phaser.Game({ ...createGameConfig(parent.id), type: Phaser.WEBGL, scene: [Load, ToolRun], audio: { noAudio: true } });
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      scene = await Promise.race([first, new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error("C1 fixture failed to start")), 8000); })]);
    } finally { clearTimeout(timeout); }
    const deathSources: { sourceId: string; damageSource: string }[] = [];
    const enqueue = scene.eventQueue.enqueue.bind(scene.eventQueue);
    scene.eventQueue.enqueue = (event: { kind: string; provenance: { sourceId: string }; payload: { damageSource: string } }) => {
      if (event.kind === "death.committed") deathSources.push({ sourceId: event.provenance.sourceId, damageSource: event.payload.damageSource });
      return enqueue(event);
    };
    const offer = (upgradeId: string) => {
      let chosen = -1;
      for (let seed = 1; seed <= 1000; seed++) {
        const choices = upgrades.selectUpgradeChoices(scene.runUpgradePool, 3, upgrades.createSeededRandom(seed),
          { ...scene.runState, luck: scene.runState.player.stats.luck, skills: scene.runTheme.skills });
        if (choices.some((choice: { id: string }) => choice.id === upgradeId)) { chosen = seed; break; }
      }
      if (chosen < 0) throw new Error(`No offer seed for ${upgradeId}`);
      scene.upgradeRandom = upgrades.createSeededRandom(chosen);
      scene.dropExperience(scene.player.x, scene.player.y, scene.runState.progression.xpToNextLevel, "ambient");
      const pickup = [...scene.pickups].find((pickup) => !pickup.isClaimed);
      scene.collectPickup(pickup);
      return chosen;
    };
    const snapshot = (): ToolSnapshot => ({
      ownRange: scene.runState.ownedWeaponModifiers["weapon.secondary"]?.range ?? 0,
      starterOwnRange: scene.runState.ownedWeaponModifiers["weapon.starter"]?.range ?? 0,
      globalRange: scene.runState.weaponModifiers.range,
      evolvedRange: scene.runState.ownedWeaponModifiers["weapon.secondary_evolved"]?.range ?? 0,
      selected: scene.runState.selectedUpgradeIds,
      deathSources: [...deathSources],
      damageAccumulated: scene.damageNumbers.accumulated, damageFlushed: scene.damageNumbers.flushed,
      damagePending: scene.damageNumbers.pending.size,
      status: scene.runState.status,
      choiceIndex: scene.currentChoices.findIndex((choice: { id: string }) => choice.id === "upgrade.equip_secondary"),
      choices: scene.currentChoices.map((choice: { id: string }) => choice.id),
      slots: scene.runState.weaponSlots.map((slot: { weaponId: string }) => slot.weaponId),
      clocks: scene.runState.weaponSlots.map((slot: { nextAttackAtMs: number }) => slot.nextAttackAtMs),
      elapsedMs: scene.runState.elapsedMs, kills: scene.runState.statistics.kills,
      total: scene.runState.statistics.totalDamage, splash: scene.runState.statistics.damageBreakdown.splash,
      explosion: scene.runState.statistics.damageBreakdown.explosion,
      breakdownTotal: Object.values(scene.runState.statistics.damageBreakdown).reduce((sum: number, value) => sum + Number(value), 0),
      enemies: scene.enemies.size, peak: scene.runState.statistics.peakEnemiesAlive, backlog: scene.eventQueue.snapshot().backlog,
      xp: [...scene.pickups].filter((pickup) => !pickup.isClaimed).reduce((sum, pickup) => sum + pickup.xpValue, 0) });
    window.__C1_TOOL_FIXTURE__ = {
      snapshot,
      offerOwned() {
        const url = new URL(location.href); url.searchParams.delete("xpLevelCap"); history.replaceState(null, "", url);
        offer("upgrade.secondary_range");
      },
      offerEvolution() { offer("upgrade.evolve_secondary"); },
      armClock() {
        scene.runState = { ...scene.runState, weaponSlots: scene.runState.weaponSlots.map((slot: { weaponId: string; nextAttackAtMs: number }) => ({ ...slot,
          nextAttackAtMs: slot.weaponId === "weapon.secondary" ? 1400 : 10000 })) };
      },
      combat() {
        scene.physics.world.pause();
        scene.runState = { ...scene.runState, elapsedMs: 0, player: { ...scene.runState.player,
          stats: { ...scene.runState.player.stats, critChance: 0 } },
          weaponSlots: scene.runState.weaponSlots.map((slot: { weaponId: string }) => ({ ...slot,
            nextAttackAtMs: slot.weaponId === "weapon.starter" ? 10000 : 0 })) };
        const definition = theme.enemies.find((entry: { id: string }) => entry.id === "enemy.fast_fragile");
        const positions = [[60, 0], [61, 2], [62, -2]];
        if (scene.runState.weaponSlots.some((slot: { weaponId: string }) => slot.weaponId === "weapon.secondary_evolved")) positions.push([63, 1]);
        for (const [dx, dy] of positions) {
          scene.spawnEnemy("ambient", 1, definition, { x: scene.player.x + dx, y: scene.player.y + dy }, false);
        }
        scene.fireIfReady();
        return snapshot();
      },
      deadPrimaryProbe() {
        const before = snapshot();
        scene.runState = { ...scene.runState, elapsedMs: 1400 };
        const definition = theme.enemies.find((entry: { id: string }) => entry.id === "enemy.fast_fragile");
        const weapon = theme.weapons.find((entry: { id: string }) => entry.id === "weapon.secondary");
        const targets = [];
        for (const [i, health] of [1, 1, weapon.damage * (1 + weapon.splash.damageMultiplier) + 1].entries()) {
          scene.spawnEnemy("ambient", 1, definition, { x: scene.player.x + 70 + i, y: scene.player.y }, false);
          const enemy = [...scene.enemies].at(-1); enemy.health = health; targets.push(enemy);
        }
        scene.fireIfReady();
        return { addedKills: scene.runState.statistics.kills - before.kills,
          remainingHealth: targets.filter((target) => !target.defeated).map((target) => target.health),
          addedDamage: scene.runState.statistics.totalDamage - before.total };
      },
      restart() { activePlay = false; scene.scene.stop("run"); scene.scene.start("run"); },
      stress(quality) {
        const url = new URL(location.href); url.searchParams.set("xpLevelCap", String(scene.runState.progression.level)); history.replaceState(null, "", url);
        scene.runState = { ...scene.runState, weaponSlots: scene.runState.weaponSlots.map((slot: { weaponId: string; nextAttackAtMs: number }) => ({ ...slot, nextAttackAtMs: 0 })) };
        if (settings.getSessionSettings().presentationQuality !== quality) scene.applySetting("presentationQuality");
        for (let i = 0; i < 300; i++) {
          const definition = theme.enemies[i % theme.enemies.length];
          scene.spawnEnemy("ambient", 1, definition, { x: scene.player.x + 30 + (i % 20) * 4,
            y: scene.player.y + (Math.floor(i / 20) - 7) * 4 }, false);
        }
        scene.physics.world.resume(); activePlay = true;
      },
      async cleanup() {
        activePlay = false;
        if (game.scene.isActive("run")) game.scene.stop("run");
        game.destroy(true);
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        parent.remove(); delete window.__C1_TOOL_FIXTURE__;
      },
    };
    // Search only injected randomness; real XP/offer/keyboard path stays unchanged.
    const chosen = offer("upgrade.equip_secondary");
    const gl = game.renderer.gl;
    const debug = gl.getExtension("WEBGL_debug_renderer_info");
    return { themeKey, mode: "test", seed: chosen, renderer: gl.getParameter(gl.RENDERER),
      unmaskedRenderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : null,
      userAgent: navigator.userAgent, dpr: devicePixelRatio, width: innerWidth, height: innerHeight,
      logicalWidth: game.config.width, logicalHeight: game.config.height,
      rate: theme.tuning.pace.gameplayRate, before: snapshot() };
  }, themeKey);
}

async function equip(page: Page) {
  const before = await page.evaluate(() => window.__C1_TOOL_FIXTURE__!.snapshot());
  expect(before.status).toBe("level_up");
  expect(before.choiceIndex).toBeGreaterThanOrEqual(0);
  expect(before.choices).not.toContain("upgrade.secondary_range");
  await page.keyboard.press(String(before.choiceIndex + 1), { delay: 80 });
  await expect.poll(() => page.evaluate(() => window.__C1_TOOL_FIXTURE__!.snapshot().status)).toBe("playing");
  expect((await page.evaluate(() => window.__C1_TOOL_FIXTURE__!.snapshot())).slots).toEqual(["weapon.starter", "weapon.secondary"]);
}

for (const themeKey of ["eco-guardian", "knight-magic"]) test(`${themeKey} acquires the cone tool from a real offer and resets it on restart`, async ({ page }, testInfo) => {
  test.setTimeout(30_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    const environment = await setup(page, themeKey);
    await page.screenshot({ path: testInfo.outputPath("tool-offer.png") });
    await equip(page);
    await page.evaluate(() => window.__C1_TOOL_FIXTURE__!.offerOwned());
    const ownerOffer = await page.evaluate(() => window.__C1_TOOL_FIXTURE__!.snapshot());
    const ownerIndex = ownerOffer.choices.indexOf("upgrade.secondary_range");
    expect(ownerIndex).toBeGreaterThanOrEqual(0);
    await page.screenshot({ path: testInfo.outputPath("owner-range-offer.png") });
    await page.keyboard.press(String(ownerIndex + 1), { delay: 80 });
    await expect.poll(() => page.evaluate(() => window.__C1_TOOL_FIXTURE__!.snapshot().status)).toBe("playing");
    const owned = await page.evaluate(() => window.__C1_TOOL_FIXTURE__!.snapshot());
    expect(owned.ownRange).toBeGreaterThan(0);
    expect(owned.starterOwnRange).toBe(0);
    expect(owned.globalRange).toBe(0);
    const combat = await page.evaluate(() => window.__C1_TOOL_FIXTURE__!.combat());
    await page.screenshot({ path: testInfo.outputPath("cone-and-splash.png") });
    expect(combat.clocks).toEqual([10000, 1400]);
    expect(combat.splash).toBeGreaterThan(0);
    expect(combat.explosion).toBe(0);
    expect(combat.breakdownTotal).toBeCloseTo(combat.total, 10);
    if (themeKey === "eco-guardian") { expect(combat.kills).toBe(3); expect(combat.total).toBeCloseTo(27, 10); expect(combat.xp).toBe(3);
      expect(combat.damageAccumulated).toBeCloseTo(30.6, 10);
      expect(combat.damageFlushed).toBeCloseTo(combat.damageAccumulated, 10);
      expect(combat.damagePending).toBe(0); }
    const deadPrimary = themeKey === "eco-guardian" ? await page.evaluate(() => window.__C1_TOOL_FIXTURE__!.deadPrimaryProbe()) : null;
    if (deadPrimary) {
      expect(deadPrimary.addedKills).toBe(2);
      expect(deadPrimary.remainingHealth).toHaveLength(1);
      expect(deadPrimary.remainingHealth[0]).toBeCloseTo(1, 10);
      expect(deadPrimary.addedDamage).toBeCloseTo(10.1, 10);
    }
    await page.evaluate(() => window.__C1_TOOL_FIXTURE__!.restart());
    await expect.poll(() => page.evaluate(() => window.__C1_TOOL_FIXTURE__!.snapshot().slots)).toEqual(["weapon.starter"]);
    expect((await page.evaluate(() => window.__C1_TOOL_FIXTURE__!.snapshot())).clocks).toEqual([0]);
    expect(errors).toEqual([]);
    await testInfo.attach("tool-observations", { body: JSON.stringify({ environment, owned, combat, deadPrimary, errors }, null, 2), contentType: "application/json" });
  } finally { await page.evaluate(() => window.__C1_TOOL_FIXTURE__?.cleanup()); }
});

for (const quality of ["default", "low"]) test(`@stress C1 two tools at 300 mixed actors in ${quality}`, async ({ page }, testInfo) => {
  test.setTimeout(30_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    const environment = await setup(page, "eco-guardian");
    await equip(page);
    await page.evaluate((quality) => window.__C1_TOOL_FIXTURE__!.stress(quality), quality);
    await expect.poll(() => page.evaluate(() => window.__C1_TOOL_FIXTURE__!.snapshot().elapsedMs), { timeout: 15000 }).toBeGreaterThanOrEqual(2000);
    const final = await page.evaluate(() => window.__C1_TOOL_FIXTURE__!.snapshot());
    expect(final.status).toBe("playing");
    expect(final.peak).toBe(300);
    expect(final.enemies).toBeLessThanOrEqual(300);
    expect(final.clocks.every((clock) => clock > 0)).toBe(true);
    expect(final.splash).toBeGreaterThan(0);
    expect(final.breakdownTotal).toBeCloseTo(final.total, 8);
    expect(errors).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath("two-tools-300.png") });
    await testInfo.attach("stress-observations", { body: JSON.stringify({ environment, quality, final, errors }, null, 2), contentType: "application/json" });
  } finally { await page.evaluate(() => window.__C1_TOOL_FIXTURE__?.cleanup()); }
});


for (const themeKey of ["eco-guardian", "knight-magic"]) test(`${themeKey} evolves from ordinary offers in the same slot with exact hit ownership`, async ({ page, browser }, testInfo) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    const environment = { ...await setup(page, themeKey), actualBrowserVersion: browser.version() };
    await equip(page);
    for (let pick = 0; pick < 4; pick++) {
      await page.evaluate(() => window.__C1_TOOL_FIXTURE__!.offerOwned());
      const offered = await page.evaluate(() => window.__C1_TOOL_FIXTURE__!.snapshot());
      expect(offered.choices).not.toContain("upgrade.evolve_secondary");
      const index = offered.choices.indexOf("upgrade.secondary_range");
      expect(index).toBeGreaterThanOrEqual(0);
      await page.keyboard.press(String(index + 1), { delay: 80 });
      await expect.poll(() => page.evaluate(() => window.__C1_TOOL_FIXTURE__!.snapshot().status)).toBe("playing");
    }
    await page.evaluate(() => { window.__C1_TOOL_FIXTURE__!.armClock(); window.__C1_TOOL_FIXTURE__!.offerEvolution(); });
    const before = await page.evaluate(() => window.__C1_TOOL_FIXTURE__!.snapshot());
    const index = before.choices.indexOf("upgrade.evolve_secondary");
    expect(index).toBeGreaterThanOrEqual(0);
    expect(before.choices).not.toContain("upgrade.secondary_range");
    await page.screenshot({ path: testInfo.outputPath("evolution-offer.png") });
    await page.keyboard.press(String(index + 1), { delay: 80 });
    await expect.poll(() => page.evaluate(() => window.__C1_TOOL_FIXTURE__!.snapshot().status)).toBe("playing");
    const after = await page.evaluate(() => window.__C1_TOOL_FIXTURE__!.snapshot());
    expect(after.slots).toEqual(["weapon.starter", "weapon.secondary_evolved"]);
    expect(after.clocks).toEqual(before.clocks);
    expect(after.ownRange).toBe(0);
    expect(after.evolvedRange).toBe(before.ownRange);
    expect(after.globalRange).toBe(0);
    expect(after.selected.filter((id) => id === "upgrade.secondary_range")).toHaveLength(4);
    expect(after.selected.filter((id) => id === "upgrade.evolve_secondary")).toHaveLength(1);
    const combat = await page.evaluate(() => window.__C1_TOOL_FIXTURE__!.combat());
    expect(combat.clocks).toEqual([10000, 1200]);
    expect(combat.total).toBeCloseTo(themeKey === "eco-guardian" ? 36 : 40, 10);
    expect(combat.kills).toBe(4);
    expect(combat.xp).toBe(themeKey === "eco-guardian" ? 4 : 8);
    expect(combat.breakdownTotal).toBeCloseTo(combat.total, 10);
    expect(combat.explosion).toBe(0);
    expect(combat.deathSources).toHaveLength(4);
    expect(combat.deathSources.every((entry) => entry.sourceId === "weapon.secondary_evolved")).toBe(true);
    expect(combat.deathSources.some((entry) => entry.damageSource === "splash")).toBe(true);
    await page.screenshot({ path: testInfo.outputPath("evolved-cone.png") });
    // Short affected load only: actual evolved definition and both independent clocks.
    await page.evaluate(() => window.__C1_TOOL_FIXTURE__!.stress("low"));
    // The software-rendered CI runner needs a simulation-progress budget, not a throughput assertion.
    await expect.poll(() => page.evaluate(() => window.__C1_TOOL_FIXTURE__!.snapshot().elapsedMs), { timeout: 90_000 }).toBeGreaterThanOrEqual(2000);
    const load = await page.evaluate(() => window.__C1_TOOL_FIXTURE__!.snapshot());
    expect(load.peak).toBe(300);
    expect(load.enemies).toBeLessThanOrEqual(300);
    expect(load.splash).toBeGreaterThan(combat.splash);
    expect(load.breakdownTotal).toBeCloseTo(load.total, 8);
    expect(load.clocks.every((clock) => clock > 0)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath("evolved-load.png") });
    await page.evaluate(() => window.__C1_TOOL_FIXTURE__!.restart());
    await expect.poll(() => page.evaluate(() => window.__C1_TOOL_FIXTURE__!.snapshot().slots)).toEqual(["weapon.starter"]);
    const reset = await page.evaluate(() => window.__C1_TOOL_FIXTURE__!.snapshot());
    expect(reset.clocks).toEqual([0]);
    expect(reset.evolvedRange).toBe(0);
    expect(reset.selected).toEqual([]);
    expect(errors).toEqual([]);
    await testInfo.attach("evolution-observations", { body: JSON.stringify({ environment, before, after, combat, load, reset, errors }, null, 2), contentType: "application/json" });
  } finally { await page.evaluate(() => window.__C1_TOOL_FIXTURE__?.cleanup()); }
});
