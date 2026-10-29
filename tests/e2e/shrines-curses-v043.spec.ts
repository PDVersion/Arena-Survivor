import { expect, test } from "@playwright/test";

interface WorldSnapshot {
  status: string;
  elapsedMs: number;
  world: { chaos: number; enemySpawnMultiplier: number; xpMultiplier: number; acceptedCurseIds: readonly string[]; shrineActivations: Record<string, number> };
  resolved: { enemySpawnMultiplier: number; xpMultiplier: number };
  choices: readonly string[];
  cardTexts: readonly string[];
  pending: number;
  selected: readonly string[];
  descriptions: readonly { id: string; tier: string; lines: readonly { label: string; from?: string; to: string }[] }[];
  shrines: readonly { id: string; activated: boolean; x: number; y: number }[];
  guide: readonly { id: string; effects: readonly { display: string }[] }[];
  summary: readonly string[];
  enemies: number;
  cap: number;
  backlog: number;
}
interface WorldFixture {
  snapshot(): WorldSnapshot;
  offer(id: string): void;
  arrive(): void;
  claimProbe(): { actual: number; expected: number; duplicateDelta: number; raw: number; claimed: boolean; source: string };
  load(): void;
  resumeClock(): void;
  restart(): void;
  cleanup(): Promise<void>;
}
declare global { interface Window { __C3_WORLD__?: WorldFixture } }

for (const themeKey of ["eco-guardian", "knight-magic"]) test(`${themeKey} chooses run-local curses and activates the new scheduled shrine once`, async ({ page, browser }, testInfo) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto("/sprite-browser.html?noAmbient&noContact&noHazards");
    const environment = await page.evaluate(async (themeKey) => {
      const paths = ["/tests/fixtures/phaser-runtime.ts", "/src/game/scenes/run-scene.ts", "/src/game/content/theme-registry.ts",
        "/src/game/systems/upgrades.ts", "/src/game/systems/sprites/load-sprites.ts", "/src/game/config.ts"];
      const [{ default: Phaser }, { RunScene }, { themeRegistry }, upgrades, { loadThemeSprites }, { createGameConfig }] = await Promise.all(paths.map((path) => import(path)));
      const theme = themeRegistry.find((entry: { key: string }) => entry.key === themeKey).theme;
      const parent = document.createElement("div"); parent.id = "c3-world-root";
      Object.assign(parent.style, { position: "fixed", inset: "0", zIndex: "9999" }); document.body.append(parent);
      let scene: InstanceType<typeof RunScene>;
      let activePlay = false;
      let ready: (scene: InstanceType<typeof RunScene>) => void = () => {};
      class WorldRun extends RunScene {
        resetTransientRuntime() { this.runTheme = theme; super.resetTransientRuntime(); }
        create() { super.create(); this.physics.world.pause(); ready(this); }
        update(time: number, delta: number) {
          if (!activePlay) this.activeClock = undefined; // Fixed clock, live keyboard/UI.
          super.update(time, activePlay ? delta : 0);
        }
      }
      class Load extends Phaser.Scene {
        constructor() { super("load-c3"); }
        preload() { loadThemeSprites(this, theme); }
        create() { this.scene.start("run"); }
      }
      const started = new Promise<InstanceType<typeof RunScene>>((resolve) => { ready = resolve; });
      const game = new Phaser.Game({ ...createGameConfig(parent.id), type: Phaser.WEBGL, scene: [Load, WorldRun], audio: { noAudio: true } });
      let timeout: ReturnType<typeof setTimeout> | undefined;
      try { scene = await Promise.race([started, new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error("C3 scene failed to start")), 8000); })]); }
      finally { clearTimeout(timeout); }
      const snapshot = (): WorldSnapshot => ({
        status: scene.runState.status, elapsedMs: scene.runState.elapsedMs,
        world: scene.runState.world, resolved: scene.worldModifiers(),
        pending: scene.runState.progression.pendingChoices, selected: scene.runState.selectedUpgradeIds,
        cardTexts: (scene.levelUpUi.container?.list ?? []).filter((object: { text?: unknown }) => typeof object.text === "string").map((object: { text: string }) => object.text),
        choices: scene.currentChoices.map((c: { id: string }) => c.id), descriptions: scene.levelUpView().descriptions,
        shrines: scene.shrineActors.map((s: { definition: { id: string }; activated: boolean; x: number; y: number }) => ({ id: s.definition.id, activated: s.activated, x: s.x, y: s.y })),
        guide: scene.pauseMenuView().codex, summary: scene.pauseMenuView().upgrades,
        enemies: scene.enemies.size, cap: scene.enemyCapacity, backlog: scene.eventQueue.snapshot().backlog,
      });
      window.__C3_WORLD__ = {
        snapshot,
        offer(id) {
          if (scene.runState.status !== "playing") throw new Error("Offer fixture requires playing state");
          let chosen = -1;
          for (let seed = 1; seed <= 5000; seed++) {
            const choices = upgrades.selectUpgradeChoices(scene.runUpgradePool, 3, upgrades.createSeededRandom(seed),
              { ...scene.runState, luck: scene.runState.player.stats.luck, skills: theme.skills });
            if (choices.some((c: { id: string }) => c.id === id)) { chosen = seed; break; }
          }
          if (chosen < 0) throw new Error(`No offer seed for ${id}`);
          scene.upgradeRandom = upgrades.createSeededRandom(chosen);
          // Real collector/offer path; compensate current XP products to buy only one level.
          const required = scene.runState.progression.xpToNextLevel - scene.runState.progression.xp;
          const raw = required * 1.001 / (scene.worldModifiers().xpMultiplier * scene.runState.player.stats.xpMultiplier);
          scene.dropExperience(scene.player.x, scene.player.y, raw, "ambient");
          const pickup = [...scene.pickups].find((p) => !p.isClaimed); scene.collectPickup(pickup);
        },
        arrive() {
          const arrival = scene.shrineArrivals.find((s: { shrineId: string }) => s.shrineId === "shrine.escalation");
          scene.runState = { ...scene.runState, elapsedMs: arrival.appearAtMs };
          scene.updateShrine();
          const actor = scene.shrineActors.find((s: { definition: { id: string } }) => s.definition.id === "shrine.escalation");
          // Controlled travel after the actual scheduler creates the actor; activation still uses E.
          scene.player.setPosition(actor.x - 60, actor.y); scene.cameras.main.centerOn(scene.player.x, scene.player.y);
        },
        claimProbe() {
          const before = scene.xpEarnedTotal; const raw = 0.375;
          const expected = raw * scene.worldModifiers().xpMultiplier;
          scene.dropExperience(scene.player.x, scene.player.y, raw, "shrine.spawn_surge");
          const pickup = [...scene.pickups].find((p) => !p.isClaimed);
          const source = pickup.rewardSource;
          scene.collectPickup(pickup); const actual = scene.xpEarnedTotal - before;
          scene.collectPickup(pickup);
          return { raw, expected, actual, duplicateDelta: scene.xpEarnedTotal - before - actual, claimed: pickup.isClaimed, source };
        },
        load() {
          const url = new URL(location.href); url.searchParams.set("xpLevelCap", String(scene.runState.progression.level)); history.replaceState(null, "", url);
          for (let i = 0; i < 300; i++) scene.spawnEnemy("ambient", 1, theme.enemies[i % theme.enemies.length],
            { x: scene.player.x + 50 + i % 15 * 3, y: scene.player.y + (Math.floor(i / 15) - 10) * 3 }, false);
          scene.physics.world.resume(); activePlay = true;
        },
        resumeClock() { activePlay = true; },
        restart() { activePlay = false; scene.scene.stop("run"); scene.scene.start("run"); },
        async cleanup() {
          activePlay = false; if (game.scene.isActive("run")) game.scene.stop("run"); game.destroy(true);
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve())); parent.remove(); delete window.__C3_WORLD__;
        },
      };
      const gl = game.renderer.gl; const debug = gl.getExtension("WEBGL_debug_renderer_info");
      return { themeKey, mode: "test", rate: theme.tuning.pace.gameplayRate, dpr: devicePixelRatio,
        viewport: { width: innerWidth, height: innerHeight }, logical: { width: game.config.width, height: game.config.height },
        renderer: gl.getParameter(gl.RENDERER), unmaskedRenderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : null,
        userAgent: navigator.userAgent };
    }, themeKey);
    const accepted = [];
    for (const id of ["upgrade.accept_frenzy", "upgrade.accept_escalation"]) {
      await page.evaluate((id) => window.__C3_WORLD__!.offer(id), id);
      const offer = await page.evaluate(() => window.__C3_WORLD__!.snapshot());
      const index = offer.choices.indexOf(id); expect(index).toBeGreaterThanOrEqual(0);
      const description = offer.descriptions.find((d) => d.id === id)!;
      expect(description.tier).toBe("common");
      const reward = description.lines[0]!;
      expect(reward.to).toBe(id === "upgrade.accept_frenzy" ? "×1.2" : "×1.8");
      expect(offer.cardTexts.some((text) => text.startsWith(`${reward.label}   ${reward.from}  →  ${reward.to}`))).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`${id}-offer.png`) });
      await page.keyboard.press(String(index + 1), { delay: 80 });
      await expect.poll(() => page.evaluate(() => window.__C3_WORLD__!.snapshot().status)).toBe("playing");
      accepted.push(await page.evaluate(() => window.__C3_WORLD__!.snapshot()));
    }
    const cursed = accepted.at(-1)!;
    expect(cursed.world.acceptedCurseIds).toEqual(["curse.frenzy", "curse.escalation"]);
    expect(cursed.world.chaos).toBeCloseTo(1.8);
    expect(cursed.world.enemySpawnMultiplier).toBeCloseTo(1.3);
    expect(cursed.world.xpMultiplier).toBeCloseTo(1.5);
    expect(cursed.summary).toHaveLength(2);
    await page.evaluate(() => window.__C3_WORLD__!.arrive());
    const arrived = await page.evaluate(() => window.__C3_WORLD__!.snapshot());
    expect(arrived.elapsedMs).toBe(270000);
    expect(arrived.shrines).toHaveLength(5);
    const guide = arrived.guide.find((entry) => entry.id === "shrine.escalation")!;
    expect(guide.effects.map((line) => line.display)).toEqual(["+1.2", "×1.4"]);
    await page.screenshot({ path: testInfo.outputPath("new-shrine.png") });
    await page.keyboard.press("e", { delay: 80 });
    await expect.poll(() => page.evaluate(() => window.__C3_WORLD__!.snapshot().world.shrineActivations["shrine.escalation"])).toBe(1);
    const activated = await page.evaluate(() => window.__C3_WORLD__!.snapshot());
    await page.keyboard.press("e", { delay: 80 });
    expect((await page.evaluate(() => window.__C3_WORLD__!.snapshot())).world).toEqual(activated.world);
    expect(activated.world.chaos).toBeCloseTo(3);
    expect(activated.world.xpMultiplier).toBeCloseTo(2.1);
    const claim = await page.evaluate(() => window.__C3_WORLD__!.claimProbe());
    expect(claim.actual).toBeCloseTo(claim.expected, 10); expect(claim.duplicateDelta).toBe(0);
    expect(claim.claimed).toBe(true); expect(claim.source).toBe("shrine.spawn_surge");
    await page.keyboard.press("Escape", { delay: 80 });
    expect((await page.evaluate(() => window.__C3_WORLD__!.snapshot())).status).toBe("paused");
    await page.setViewportSize({ width: 1000, height: 700 });
    await page.screenshot({ path: testInfo.outputPath("cursed-pause.png") });
    await page.keyboard.press("Escape", { delay: 80 });
    await page.evaluate(() => window.__C3_WORLD__!.load());
    // Verify the same simulated work without assuming software-runner throughput.
    await expect.poll(() => page.evaluate(() => window.__C3_WORLD__!.snapshot().elapsedMs), { timeout: 90_000 }).toBeGreaterThan(259000);
    const load = await page.evaluate(() => window.__C3_WORLD__!.snapshot());
    expect(load.world).toEqual(activated.world); expect(load.enemies).toBeLessThanOrEqual(load.cap); expect(load.cap).toBe(300);
    await page.screenshot({ path: testInfo.outputPath("cursed-load.png") });
    await page.evaluate(() => window.__C3_WORLD__!.restart());
    const reset = await page.evaluate(() => window.__C3_WORLD__!.snapshot());
    expect(reset.world).toEqual({ chaos: 1, enemySpawnMultiplier: 1, xpMultiplier: 1, shrineActivations: {}, acceptedCurseIds: [] });
    expect(reset.selected).toEqual([]); expect(reset.shrines).toEqual([]);
    expect(errors).toEqual([]);
    await testInfo.attach("c3-observations", { body: JSON.stringify({ environment, actualBrowserVersion: browser.version(), accepted, arrived, activated, claim, load, reset, errors }, null, 2), contentType: "application/json" });
  } finally { await page.evaluate(() => window.__C3_WORLD__?.cleanup()); }
});
