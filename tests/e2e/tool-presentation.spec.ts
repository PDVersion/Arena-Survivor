/* eslint-disable @typescript-eslint/no-explicit-any -- bounded test-only Phaser introspection */
import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 1000, height: 700 } });
async function setup(page: Page, low = false, autoRenderer = false) {
  await page.goto("/sprite-browser.html?noAmbient&noContact&noHazards");
  await page.evaluate(async ({ low, autoRenderer }) => {
    const paths = ["/tests/fixtures/phaser-runtime.ts", "/src/game/scenes/run-scene.ts",
      "/src/game/scenes/menu-scene.ts", "/src/game/content/themes/eco-guardian/index.ts",
      "/src/game/systems/sprites/load-sprites.ts", "/src/game/state/settings-state.ts",
      "/src/game/systems/persistence/profile-service.ts", "/src/game/config.ts"];
    const [{ default: Phaser }, { RunScene }, { MenuScene }, { ecoGuardianTheme: theme },
      { loadThemeSprites }, settings, profile, { createGameConfig }] = await Promise.all(paths.map((p) => import(p)));
    const memory = new Map();
    profile.initializeProfile(theme, { getItem: (k: string) => memory.get(k) ?? null,
      setItem: (k: string, v: string) => memory.set(k, v), removeItem: (k: string) => memory.delete(k) });
    settings.updateSessionSettings(settings.createSettings({ reducedMotion: low, presentationQuality: low ? "low" : "default" }));
    const root = document.createElement("div"); root.id = "tool-review";
    Object.assign(root.style, { position: "fixed", inset: "0", zIndex: "9999" }); document.body.append(root);
    let ready: () => void;
    const started = new Promise<void>((resolve) => { ready = resolve; });
    class Run extends RunScene {
      resetTransientRuntime() { this.runTheme = theme; super.resetTransientRuntime(); }
      create() { super.create(); ready(); }
    }
    class Load extends Phaser.Scene {
      constructor() { super("tool-load"); }
      preload() { loadThemeSprites(this, theme); }
      create() { this.scene.start("run"); }
    }
    const game = new Phaser.Game({ ...createGameConfig(root.id), type: autoRenderer ? Phaser.AUTO : Phaser.CANVAS,
      scene: [Load, MenuScene, Run], audio: { noAudio: true } });
    await started;
    (window as any).__TOOL_REVIEW__ = { game, settings, profile, theme,
      run: () => game.scene.getScene("run"), menu: () => game.scene.getScene("menu"),
      async cleanup() { game.destroy(true); await new Promise<void>((r) => requestAnimationFrame(() => r())); root.remove(); } };
  }, { low, autoRenderer });
}
async function pause(page: Page) {
  await page.keyboard.down("Escape");
  await page.evaluate(() => new Promise<void>((resolve) => (window as any).__TOOL_REVIEW__.run().events.once("postupdate", () => resolve())));
  await page.keyboard.up("Escape");
  await expect.poll(() => page.evaluate(() => (window as any).__TOOL_REVIEW__.run().runState.status)).toBe("paused");
}
async function clickBounds(page: Page, kind: "settings" | "radius" | "quit") {
  const point = await page.evaluate((kind) => {
    const run = (window as any).__TOOL_REVIEW__.run(), ui = run.pauseMenu;
    const b = kind === "quit" ? ui.quitBounds : kind === "settings"
      ? ui.tabBounds.find((r: any) => r.tab === "settings").bounds
      : ui.settingBounds.find((r: any) => r.key === "showAttackRadius").bounds;
    return { x: run.scale.width / 2 + (b.centerX - run.scale.width / 2) * 1.25,
      y: run.scale.height / 2 + (b.centerY - run.scale.height / 2) * 1.25,
      width: run.scale.width, height: run.scale.height };
  }, kind);
  const canvas = await page.locator("#tool-review canvas").boundingBox();
  if (!canvas) throw new Error("Missing fixture canvas");
  await page.mouse.click(canvas.x + point.x * canvas.width / point.width, canvas.y + point.y * canvas.height / point.height);
}
for (const low of [false, true]) {
  test(`tool suction and optional guides ${low ? "Low reduced motion" : "Default"}`, async ({ page }, info) => {
    test.setTimeout(30_000);
    await setup(page, low);
    const result = await page.evaluate(async () => {
      const f = (window as any).__TOOL_REVIEW__, run = f.run();
      const conePath = "/src/game/entities/cone-attack-actor.ts", clawPath = "/src/game/entities/tool-effects.ts";
      const [{ ConeAttackActor }, { ClawSnapActor }] = await Promise.all([import(conePath), import(clawPath)]);
      const weapon = f.theme.weapons.find((w: any) => w.id === "weapon.secondary");
      const options = { effects: f.theme.tuning.view.toolEffects, ...f.settings.getSessionSettings(), quality: f.settings.getSessionSettings().presentationQuality };
      const first = new ConeAttackActor(run, run.player.x, run.player.y, 0, weapon, f.theme.tokens, () => {}, [], options);
      const guidesOff = !first.list[0].visible;
      const airDrawn = first.list[3].commandBuffer.length > 0;
      const airCommands = first.list[3].commandBuffer.length;
      const second = new ConeAttackActor(run, run.player.x, run.player.y - 90, 0, weapon, f.theme.tokens, () => {}, [], { ...options, showAttackRadius: true });
      const guidesOn = second.list[0].commandBuffer.length > 0;
      const claw = new ClawSnapActor(run, run.player.x + 80, run.player.y + 70, 24, f.theme.tokens, options);
      const clawDrawn = claw.list[0].commandBuffer.length > 0;
      run.time.timeScale = 0; run.tweens.timeScale = 0;
      f.cues = { first, second, claw, weapon };
      return { guidesOff, guidesOn, airDrawn, airCommands, clawDrawn };
    });
    expect(result.guidesOff).toBe(true); expect(result.guidesOn).toBe(true);
    expect(result.airDrawn).toBe(true); expect(result.clawDrawn).toBe(true);
    await page.screenshot({ path: info.outputPath("tool-effects.png") });
    const faded = await page.evaluate(async () => {
      const f = (window as any).__TOOL_REVIEW__, run = f.run();
      run.time.timeScale = 1; run.tweens.timeScale = 1;
      await new Promise<void>((r) => run.time.delayedCall(f.cues.weapon.extendMs + 5, () => r()));
      return { nozzle: f.cues.first.list[1].visible, air: f.cues.first.list[3].visible };
    });
    expect(faded).toEqual({ nozzle: false, air: true });
    const ended = await page.evaluate(async () => {
      const f = (window as any).__TOOL_REVIEW__, run = f.run();
      await new Promise<void>((resolve) => run.time.delayedCall(f.theme.tuning.view.toolEffects.suction.durationMs + f.theme.tuning.view.toolEffects.suction.fadeMs + 10, resolve));
      return f.cues.first.active;
    });
    expect(ended).toBe(false);
    await page.evaluate(() => (window as any).__TOOL_REVIEW__.cleanup());
  });
}

test("Escape menu toggles attack guide, quits by pointer and Q, starts clean run", async ({ page }, info) => {
  test.setTimeout(30_000);
  await setup(page);
  await pause(page); await page.screenshot({ path: info.outputPath("pause-before.png") }); await clickBounds(page, "settings");
  await expect.poll(() => page.evaluate(() => (window as any).__TOOL_REVIEW__.run().pauseMenu.activeTab)).toBe("settings");
  expect(await page.evaluate(() => (window as any).__TOOL_REVIEW__.settings.getSessionSettings().showAttackRadius)).toBe(false);
  await clickBounds(page, "radius");
  await expect.poll(() => page.evaluate(() => (window as any).__TOOL_REVIEW__.profile.getProfile().settings.showAttackRadius)).toBe(true);
  await page.setViewportSize({ width: 900, height: 600 });
  await page.screenshot({ path: info.outputPath("pause-settings.png") });
  await clickBounds(page, "quit");
  await expect.poll(() => page.evaluate(() => (window as any).__TOOL_REVIEW__.game.scene.isActive("menu"))).toBe(true);
  expect(await page.evaluate(() => (window as any).__TOOL_REVIEW__.profile.getProfile().statistics.runsPlayed)).toBe(0);
  await page.keyboard.press("Enter");
  await expect.poll(() => page.evaluate(() => (window as any).__TOOL_REVIEW__.game.scene.isActive("run"))).toBe(true);
  expect(await page.evaluate(() => (window as any).__TOOL_REVIEW__.settings.getSessionSettings().showAttackRadius)).toBe(true);
  await pause(page); await page.keyboard.press("q");
  await expect.poll(() => page.evaluate(() => (window as any).__TOOL_REVIEW__.game.scene.isActive("menu"))).toBe(true);
  expect(await page.evaluate(() => (window as any).__TOOL_REVIEW__.profile.getProfile().statistics.runsPlayed)).toBe(0);
  await page.screenshot({ path: info.outputPath("main-menu.png") });
  await page.evaluate(() => (window as any).__TOOL_REVIEW__.cleanup());
});

for (const low of [false, true]) {
  test(`full style2 eco world states and fallback ${low ? "Low reduced motion" : "Default"}`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await setup(page, low);
    const result = await page.evaluate(async () => {
      const f = (window as any).__TOOL_REVIEW__, r = f.run(), theme = f.theme;
      r.physics.world.pause(); r.runState.status = "paused";
      r.time.timeScale = 0; r.tweens.timeScale = 0;
      const paths = ["/src/game/entities/pickup-actor.ts", "/src/game/entities/shrine-actor.ts",
        "/src/game/entities/hazard-actor.ts", "/src/game/entities/grabber-actor.ts",
        "/src/game/entities/cone-attack-actor.ts"];
      const [{ PickupActor }, { ShrineActor }, { HazardActor }, { GrabberActor }, { ConeAttackActor }] = await Promise.all(paths.map((p) => import(p)));
      const x = r.player.x, y = r.player.y;
      const frame = (actor: any) => { actor.view.sync(); return actor.view.frame; };
      const enemies = theme.enemies.map((definition: any, i: number) => {
        r.spawnEnemy("ambient", 1, definition, { x: x - 180 + i % 6 * 65, y: y - 100 + Math.floor(i / 6) * 80 }, false);
        const actor = [...r.enemies].at(-1) as any;
        return { id: definition.id, frame: frame(actor), width: actor.view.image.frame.width,
          expectedWidth: theme.tokens.sprites[definition.id].frameWidth, radius: actor.arcadeBody.radius,
          expectedRadius: definition.radius };
      });
      const pickup = new PickupActor(r, "style2", x - 70, y + 100, theme.pickups[0], theme.tokens, 1);
      const pickupFrames = [frame(pickup)];
      pickup.magnetToward(r.player.arcadeBody.velocity.clone().set(x, y)); pickupFrames.push(frame(pickup));
      pickup.claim(); pickupFrames.push(frame(pickup));
      const sites = theme.shrines.map((definition: any, i: number) => {
        const actor = new ShrineActor(r, x - 160 + i * 80, y + 165, definition, theme.tokens,
          theme.copy.content[definition.id].name, "");
        const frames = [frame(actor)];
        actor.setInRange(true); frames.push(frame(actor));
        actor.activate(); frames.push(frame(actor));
        // Complete the actual activation tween and verify its persistent spent pose.
        r.tweens.getTweensOf(actor)[0].complete(); frames.push(frame(actor));
        return frames;
      });
      const hazards = theme.hazards.map((definition: any, i: number) => {
        const state = { id: `style2-${i}`, definitionId: definition.id, x: x - 150 + i * 145, y: y - 200,
          radius: definition.radius, spawnedAtMs: 0, health: definition.health ?? 0, nextTickAtMs: definition.telegraphMs };
        const actor = new HazardActor(r, definition, state, theme.tokens);
        actor.refresh(0); const warning = frame(actor);
        actor.refresh(definition.telegraphMs); const active = frame(actor);
        return { warning, active, primitive: actor.visible, radius: actor.radius,
          expectedRadius: definition.radius, tileWidth: actor.view.image.displayWidth };
      });
      const options = { effects: theme.tuning.view.toolEffects, ...f.settings.getSessionSettings() };
      f.style2tools = [];
      const tools = theme.weapons.map((definition: any, i: number) => {
        const Actor = definition.arcRadians ? ConeAttackActor : GrabberActor;
        const actor = definition.arcRadians
          ? new Actor(r, x + 60 + i * 30, y + 35, 0, definition, theme.tokens, () => {}, [], options)
          : new Actor(r, x + 60, y + 70, 0, definition, theme.tokens, () => {}, options);
        f.style2tools.push(actor);
        const sprite = actor.list.find((child: any) => child.type === "Sprite");
        return { id: definition.id, hasArt: Boolean(sprite), frame: sprite?.frame.name };
      });
      const fallback = new PickupActor(r, "fallback", x + 130, y + 100, theme.pickups[0], { ...theme.tokens, sprites: {} }, 1);
      f.style2 = { pickup, fallback };
      return { enemies, pickupFrames, sites, hazards, tools, fallback: !fallback.view && fallback.visible,
        icons: r.hud.toolIcons.map((icon: any) => icon.frame.name),
        textureKeys: [...new Set(Object.values(theme.tokens.sprites).map((s: any) => s.path))] };
    });
    for (const enemy of result.enemies) {
      expect(enemy.width).toBe(enemy.expectedWidth);
      expect(enemy.radius).toBe(enemy.expectedRadius);
    }
    expect(result.pickupFrames).toEqual([0, 1, 2]);
    for (const site of result.sites) expect(site).toEqual([0, 1, 2, 3]);
    for (const hazard of result.hazards) {
      expect(hazard.primitive).toBe(true);
      expect(hazard.radius).toBe(hazard.expectedRadius);
      expect(hazard.tileWidth).toBeLessThanOrEqual(hazard.radius);
      expect(hazard.active).not.toBe(hazard.warning);
    }
    expect(result.tools.every((tool: { hasArt: boolean }) => tool.hasArt)).toBe(true);
    expect(result.fallback).toBe(true);
    expect(result.icons).toEqual(["eco_guardian.weapon.starter/0"]);
    expect(result.textureKeys).toEqual(["sprites/eco-guardian/atlas.png"]);
    await page.screenshot({ path: info.outputPath("style2-world.png") });
    const phases = await page.evaluate(async () => {
      const f = (window as any).__TOOL_REVIEW__, r = f.run();
      const grabber = f.style2tools[0], vacuum = f.style2tools[1];
      const art = (actor: any) => actor.list.find((child: any) => child.type === "Sprite");
      r.tweens.getTweensOf(grabber)[0].complete();
      const contact = art(grabber).frame.name;
      r.time.timeScale = 1;
      await new Promise<void>((resolve) => r.time.delayedCall(f.theme.weapons[0].retractMs / 2 + 10, resolve));
      const recovery = art(grabber).frame.name;
      const vacuumRecovery = art(vacuum).frame.name;
      r.time.timeScale = 0;
      const extras = { spawnCounts: { natural: 0, fragmentation: 0, environment: 0, baggedWaste: 0 },
        threatStep: 0, killChain: 0, levelProgress: 0 };
      const icons = (id: string) => {
        r.hud.update({ ...r.runState, weaponSlots: [r.runState.weaponSlots[0], { weaponId: id, nextAttackAtMs: 0 }] }, extras);
        return r.hud.toolIcons.map((icon: any) => icon.frame.name);
      };
      const secondaryIcons = icons("weapon.secondary"), evolvedIcons = icons("weapon.secondary_evolved");
      return { contact, recovery, vacuumRecovery, secondaryIcons, evolvedIcons };
    });
    expect(phases.contact).toBe("eco_guardian.weapon.starter/1");
    expect(phases.recovery).toBe("eco_guardian.weapon.starter/2");
    expect(phases.vacuumRecovery).toBe("eco_guardian.weapon.secondary/2");
    expect(phases.secondaryIcons).toEqual(["eco_guardian.weapon.starter/0", "eco_guardian.weapon.secondary/0"]);
    expect(phases.evolvedIcons).toEqual(["eco_guardian.weapon.starter/0", "eco_guardian.weapon.secondary_evolved/0"]);
    await page.evaluate(() => (window as any).__TOOL_REVIEW__.cleanup());
    expect(errors).toEqual([]);
  });
}

for (const low of [false, true]) {
  test(`pause equipment scroll and fixed upgrade identity ${low ? "Low reduced motion" : "Default"}`, async ({ page }, info) => {
    await setup(page, low, true);
    await pause(page);
    const open = () => page.evaluate(() => {
      const r = (window as any).__TOOL_REVIEW__.run(), ui = r.pauseMenu;
      ui.codexSection = "equipment";
      ui.show(r.pauseMenuView(), () => {}, { tab: "codex", onQuit: () => {} });
      const area = ui.scrollArea, cx = r.scale.width / 2, cy = r.scale.height / 2;
      return { max: ui.maxScroll, offset: ui.scrollOffset, x: cx + (area.centerX - cx) * 1.25,
        y: cy + (area.centerY - cy) * 1.25, width: r.scale.width, height: r.scale.height,
        footer: ui.quitBounds.top, bottom: area.bottom, masked: Boolean(ui.scrollBody.mask), renderer: r.game.renderer.type };
    });
    const state = await open();
    expect(state.renderer).toBe(2);
    expect(state.max).toBeGreaterThan(0); expect(state.offset).toBe(0);
    expect(state.masked).toBe(true); expect(state.bottom).toBeLessThan(state.footer);
    const canvas = (await page.locator("#tool-review canvas").boundingBox())!;
    await page.mouse.move(canvas.x + state.x * canvas.width / state.width, canvas.y + state.y * canvas.height / state.height);
    await page.mouse.wheel(0, 260);
    await expect.poll(() => page.evaluate(() => (window as any).__TOOL_REVIEW__.run().pauseMenu.scrollOffset)).toBeGreaterThan(0);
    await page.keyboard.press("End");
    const end = await page.evaluate(() => {
      const ui = (window as any).__TOOL_REVIEW__.run().pauseMenu;
      return { offset: ui.scrollOffset, max: ui.maxScroll, bodyY: ui.scrollBody.y };
    });
    expect(end.offset).toBe(end.max); expect(end.bodyY).toBe(-end.max);
    await page.screenshot({ path: info.outputPath("equipment-scrolled-bottom.png") });
    await page.keyboard.press("Home");
    await expect.poll(() => page.evaluate(() => (window as any).__TOOL_REVIEW__.run().pauseMenu.scrollOffset)).toBe(0);
    await page.keyboard.press("PageDown");
    await expect.poll(() => page.evaluate(() => (window as any).__TOOL_REVIEW__.run().pauseMenu.scrollOffset)).toBeGreaterThan(0);
    await page.setViewportSize({ width: 800, height: 600 });
    const resized = await open();
    expect(resized.bottom).toBeLessThan(resized.footer);
    await page.keyboard.press("End");
    await page.screenshot({ path: info.outputPath("equipment-small-bottom.png") });
    const cards = await page.evaluate(async () => {
      const f = (window as any).__TOOL_REVIEW__, r = f.run(), theme = f.theme;
      r.pauseMenu.hide();
      const paths = ["/src/game/ui/level-up-choice-ui.ts", "/src/game/systems/upgrades/describe-upgrade.ts"];
      const [{ LevelUpChoiceUi }, { describeUpgrade }] = await Promise.all(paths.map((p) => import(p)));
      // Acquisition/evolution definitions are registered in the theme upgrade pool.
      const ids = ["upgrade.equip_secondary", "upgrade.evolve_secondary", "upgrade.damage"];
      const choices = ids.map((id) => theme.upgrades.find((entry: any) => entry.id === id));
      const descriptions = choices.map((entry: any) => describeUpgrade(r.runState, entry, theme, "legendary"));
      const ui = new LevelUpChoiceUi(r, theme);
      ui.show(choices, { descriptions, pendingAfterThis: 0, showDetail: true }, () => {});
      const texts = ui.container.list.filter((child: any) => child.type === "Text").map((child: any) => child.text);
      const colours = ui.container.list.filter((child: any) => child.type === "Rectangle").slice(1).map((child: any) => child.strokeColor);
      const listeners = r.input.listenerCount("wheel");
      f.levelReview = ui;
      return { texts, colours, descriptions: descriptions.map((d: any) => ({ relevant: d.qualityRelevant, association: d.association, multiplier: d.tierMultiplier })), listeners };
    });
    expect(cards.descriptions[0]).toEqual({ relevant: false, association: "Cleanup Vacuum", multiplier: 1 });
    expect(cards.descriptions[1]).toEqual({ relevant: false, association: "Cyclone Vacuum", multiplier: 1 });
    expect(cards.descriptions[2].relevant).toBe(true);
    expect(cards.texts.some((text: string) => text.startsWith("STAT ·"))).toBe(true);
    expect(cards.texts).toContain("Cleanup Vacuum"); expect(cards.texts).toContain("Cyclone Vacuum");
    expect(cards.texts.filter((text: string) => text.includes("Legendary"))).toHaveLength(1);
    expect(cards.colours[0]).toBe(cards.colours[1]); expect(cards.colours[2]).not.toBe(cards.colours[0]);
    expect(cards.listeners).toBe(0);
    await page.screenshot({ path: info.outputPath("fixed-and-stat-cards.png") });
    await page.evaluate(() => { const f = (window as any).__TOOL_REVIEW__; f.levelReview.hide(); return f.cleanup(); });
  });
}

test("weapon-frame HUD icons and slower handle-first rake reuse live art", async ({ page }, info) => {
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  await setup(page, false, true);
  try {
    const result = await page.evaluate(async () => {
      const f = (window as any).__TOOL_REVIEW__, run = f.run();
      const controller = run.openTestingArea(); controller.pause(true);
      const extras = { spawnCounts: { natural: 0, fragmentation: 0, environment: 0, baggedWaste: 0 }, threatStep: 0, killChain: 0, levelProgress: 0 };
      const load = (ids: string[]) => {
        controller.configure({ weapons: ids, upgrades: {}, level: 1, health: 100, money: 0, impact: 0 });
        run.hud.update(run.runState, extras);
        return run.hud.toolIcons.map((image: any) => ({ frame: image.frame.name, width: image.displayWidth, height: image.displayHeight,
          aspect: image.frame.width / image.frame.height, visible: image.visible && image.alpha > 0,
          belowInfo: image.getBounds().top > run.hud.levelLabel.getBounds().bottom }));
      };
      const ids = ["weapon.starter", "weapon.cleaning_bin", "weapon.orbiting_rake", "weapon.rake_beam"];
      const first = load(ids), old = [...run.hud.toolIcons];
      const swapped = load(["weapon.secondary", ...ids.slice(1)]);
      const oldDestroyed = old.every((image: any) => !image.scene);
      const path = "/src/game/entities/cleanup-tool-runtime.ts";
      const { CleanupToolRuntime } = await import(path);
      const weapon = f.theme.weapons.find((weapon: any) => weapon.id === "weapon.rake_beam");
      const runtime = new CleanupToolRuntime(run, f.theme.tokens, () => {});
      const tools = [{ weapon, tool: weapon.cleanup, attackRate: 1 }];
      const start = { x: run.player.x, y: run.player.y };
      runtime.update(0, start, tools, new Set(), { x: 1, y: 0 });
      runtime.update(200, start, tools, new Set(), { x: 0, y: 0 });
      const image = runtime.images[0];
      const rake = { travel: image.x - start.x, rotation: image.rotation, headAnchor: image.originX, frame: image.frame.name };
      const speed = weapon.cleanup.speed;
      const maxSpeed = weapon.cleanup.progression.levels[6].speed;
      f.hudRakeRuntime = runtime;
      return { first, swapped, oldDestroyed, rake, speed, maxSpeed };
    });
    expect(result.first.map((image: any) => image.frame)).toEqual(["eco_guardian.weapon.starter/0", "eco_guardian.weapon.cleaning_bin/0", "eco_guardian.weapon.orbiting_rake/0", "eco_guardian.weapon.rake_beam/0"]);
    expect(result.swapped[0].frame).toBe("eco_guardian.weapon.secondary/0");
    for (const image of [...result.first, ...result.swapped]) {
      expect(image.visible).toBe(true); expect(image.belowInfo).toBe(true);
      expect(Math.max(image.width, image.height)).toBe(40);
      expect(image.width / image.height).toBeCloseTo(image.aspect);
    }
    expect(result.oldDestroyed).toBe(true);
    expect(result.rake.frame).toBe("eco_guardian.weapon.rake_beam/0");
    expect(result.rake.travel).toBeCloseTo(110);
    expect(Math.cos(result.rake.rotation)).toBeCloseTo(-1);
    expect(result.rake.headAnchor).toBe(.85);
    expect(result.speed).toBe(550); expect(result.maxSpeed).toBe(720);
    await page.screenshot({ path: info.outputPath("hud-weapon-frames-and-pulled-rake.png") });
    expect(errors).toEqual([]);
  } finally {
    await page.evaluate(() => { const f = (window as any).__TOOL_REVIEW__; f.hudRakeRuntime?.destroy(); return f.cleanup(); });
  }
});

test("material rules, floating wrappers and independent boss summon rewards", async ({ page }, info) => {
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  await setup(page, false, true);
  try {
    const result = await page.evaluate(async () => {
      const f = (window as any).__TOOL_REVIEW__, run = f.run();
      const controller = run.openTestingArea(); controller.pause(true);
      const configure = () => controller.configure({ weapons: [], upgrades: {}, level: 1, health: 100, money: 0, impact: 0 });
      configure();
      controller.spawn("enemy.gust_drifter", 1, 180); controller.spawn("enemy.slow_durable", 1, 180);
      const wrapper = [...run.enemies].find((e: any) => e.definition.id === "enemy.gust_drifter") as any;
      const glass = [...run.enemies].find((e: any) => e.definition.id === "enemy.slow_durable") as any;
      const before = { x: wrapper.x, y: wrapper.y };
      run.updateEnemies(16); run.rebuildEnemyIndex(); run.resolveCrowd();
      const floating = { airborne: wrapper.airborne, hasOldCue: Boolean(wrapper.motionCue), vx: wrapper.arcadeBody.velocity.x, vy: wrapper.arcadeBody.velocity.y,
        samePlace: wrapper.x === before.x && wrapper.y === before.y && wrapper.x === glass.x && wrapper.y === glass.y };
      controller.clear(); configure();
      run.effectRandom = () => 0; // Deterministic fragmentation; rare-item rolls keep their real RNG.
      const materialKills: Record<string, string[]> = {};
      for (const id of ["enemy.cluster_fodder", "enemy.committed_charger", "enemy.slow_durable"]) {
        controller.clear(); controller.spawn(id, 1, 180);
        const target = [...run.enemies][0] as any;
        run.commitEnemyDamage(target, 1e6, "direct"); run.processCausalEvents();
        materialKills[id] = [...run.enemies].map((e: any) => e.definition.id);
      }
      controller.clear(); configure(); controller.spawn("enemy.mini_boss", 1, 150);
      const mini = [...run.enemies][0] as any;
      const cleanReward = mini.definition.xpReward * mini.rewardMultiplier;
      const pulse = (boss: any) => {
        run.runState = { ...run.runState, elapsedMs: run.bossAttacks.get(boss).nextAtMs };
        run.updateBossAttacks();
        const label = run.bossSummonLabels.get(boss).text;
        const release = run.bossAttacks.get(boss).warning.releaseAtMs;
        run.runState = { ...run.runState, elapsedMs: release };
        run.updateBossAttacks(); run.processCausalEvents();
        return label;
      };
      const miniLabel = pulse(mini);
      const miniChildren = [...run.enemies].filter((e: any) => e !== mini) as any[];
      const miniSummons = miniChildren.map((e: any) => e.definition.id);
      const miniRewardAfterAttack = mini.definition.xpReward * mini.rewardMultiplier;
      for (const child of miniChildren) child.destroy();
      run.commitEnemyDamage(mini, 1e6, "direct"); run.processCausalEvents();
      const fragments = [...run.enemies] as any[];
      const fragmentBudget = [...run.pickups].filter((p: any) => (p.definition.kind ?? "money") === "money").reduce((sum: number, p: any) => sum + p.xpValue, 0)
        + fragments.reduce((sum, e) => sum + e.definition.xpReward * e.rewardMultiplier, 0);
      const miniFragmentCount = fragments.length;
      const fragmentSources = fragments.map((e) => e.spawnSource);
      controller.clear(); configure(); controller.spawn("enemy.final_boss", 1, 140);
      const final = [...run.enemies][0] as any;
      final.health = final.maxHealth * .19;
      const finalReward = final.definition.xpReward * final.rewardMultiplier;
      const finalLabel = pulse(final);
      const finalChildren = [...run.enemies].filter((e: any) => e !== final) as any[];
      const finalSummons = finalChildren.map((e) => e.definition.id);
      const finalRewardAfterAttack = final.definition.xpReward * final.rewardMultiplier;
      // Leave an actual telegraph and the regenerated pulled rake visible for inspection.
      run.runState = { ...run.runState, elapsedMs: run.bossAttacks.get(final).nextAtMs };
      run.updateBossAttacks();
      const path = "/src/game/entities/cleanup-tool-runtime.ts";
      const { CleanupToolRuntime } = await import(path);
      const rake = f.theme.weapons.find((w: any) => w.id === "weapon.rake_beam");
      const runtime = new CleanupToolRuntime(run, f.theme.tokens, () => {});
      const at = { x: run.player.x - 170, y: run.player.y - 130 };
      runtime.update(0, at, [{ weapon: rake, tool: rake.cleanup, attackRate: 1 }], new Set(), { x: 1, y: 0 });
      runtime.update(180, at, [{ weapon: rake, tool: rake.cleanup, attackRate: 1 }], new Set());
      f.materialRakeRuntime = runtime;
      return { floating, materialKills, miniLabel, miniSummons, cleanReward, miniRewardAfterAttack, fragmentBudget, miniFragmentCount, fragmentSources,
        finalLabel, finalSummons, finalReward, finalRewardAfterAttack, expectedTypes: f.theme.enemies.filter((e: any) => !e.boss).map((e: any) => e.id) };
    });
    expect(result.floating).toMatchObject({ airborne: true, hasOldCue: false, samePlace: true });
    expect(result.floating.vx).toBeLessThan(0); expect(result.floating.vy).toBeCloseTo(0);
    expect(result.materialKills["enemy.cluster_fodder"]).toEqual([]);
    expect(result.materialKills["enemy.committed_charger"]).toEqual([]);
    expect(result.materialKills["enemy.slow_durable"]).toEqual(["enemy.stationary_fragment", "enemy.stationary_fragment"]);
    expect(result.miniLabel).toBe("Loose litter"); expect(result.miniSummons).toHaveLength(8);
    expect(result.miniSummons).not.toContain("enemy.death_spawner"); expect(result.miniSummons).not.toContain("enemy.slow_durable");
    expect(result.miniRewardAfterAttack).toBe(result.cleanReward);
    expect(result.miniFragmentCount).toBe(4); expect(new Set(result.fragmentSources)).toEqual(new Set(["skill.fracture"]));
    expect(result.fragmentBudget).toBeCloseTo(result.cleanReward * 1.1);
    expect(result.finalLabel).toBe("Last load — mixed release"); expect(result.finalSummons).toHaveLength(18);
    expect(new Set(result.finalSummons)).toEqual(new Set(result.expectedTypes));
    expect(result.finalRewardAfterAttack).toBe(result.finalReward);
    await page.screenshot({ path: info.outputPath("compact-rake-and-boss-mixed-release.png") });
    expect(errors).toEqual([]);
  } finally {
    await page.evaluate(() => { const f = (window as any).__TOOL_REVIEW__; f.materialRakeRuntime?.destroy(); return f.cleanup(); });
  }
});
