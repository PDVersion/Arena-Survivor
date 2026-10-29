import { expect, test } from "@playwright/test";

// No combat/soak: real Phaser ownership for one cap-pressure burst, collect
// tween, and three stop/start reconstructions per production theme.
for (const themeKey of ["eco-guardian", "knight-magic"]) test(`${themeKey} pickup overflow and stopped resources return to baseline`, async ({ page }) => {
  test.setTimeout(45_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/sprite-browser.html?noAmbient=1&noContact=1&noWeapon=1");
  const result = await page.evaluate(async (themeKey) => {
    const phaserPath = "/tests/fixtures/phaser-runtime.ts";
    const scenePath = "/src/game/scenes/run-scene.ts";
    const registryPath = "/src/game/content/theme-registry.ts";
    const loaderPath = "/src/game/systems/sprites/load-sprites.ts";
    const settingsPath = "/src/game/state/settings-state.ts";
    const [{ default: Phaser }, { RunScene }, { themeRegistry }, { loadThemeSprites }, settings] = await Promise.all([
      import(phaserPath), import(scenePath), import(registryPath), import(loaderPath), import(settingsPath),
    ]);
    const theme = themeRegistry.find((entry: { key: string }) => entry.key === themeKey).theme;
    const parent = document.createElement("div");
    document.body.append(parent);
    let ready: (scene: InstanceType<typeof RunScene>) => void = () => {};
    class LifecycleRun extends RunScene {
      resetTransientRuntime() { this.runTheme = theme; super.resetTransientRuntime(); }
      create() { super.create(); ready(this); }
      update() {} // isolate lifecycle; no arrivals/combat or gameplay-clock waits
    }
    class Load extends Phaser.Scene {
      constructor() { super("load-lifecycle"); }
      preload() { loadThemeSprites(this, theme); }
      create() { this.scene.start("run"); }
    }
    const first = new Promise<InstanceType<typeof RunScene>>((resolve) => { ready = resolve; });
    const game = new Phaser.Game({ type: Phaser.CANVAS, width: 800, height: 450, parent, scene: [Load, LifecycleRun], physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 } } }, audio: { noAudio: true } });
    const framesUntil = async (predicate: () => boolean) => {
      const deadline = performance.now() + 5000;
      do {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        if (predicate()) return;
      } while (performance.now() < deadline);
      throw new Error("Lifecycle resource cleanup exceeded five seconds");
    };
    const records = [];
    try {
      let scene = await Promise.race([first, new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Lifecycle game did not start")), 5000))]);
      for (let cycle = 0; cycle < 3; cycle++) {
        settings.updateSessionSettings({ ...settings.getSessionSettings(), presentationQuality: cycle % 2 ? "low" : "default" });
        scene.minimap.setPresentationQuality(settings.getSessionSettings().presentationQuality);
        const world = scene.physics.world;
        const baselineBodies = world.bodies.size;
        const baselineObjects = scene.children.length;
        const baselinePostUpdate = scene.events.listenerCount("postupdate");
        // Spread 260 unique sites beyond the authored merge radius, repeated
        // four times. This still pressures the250-actor cap with proactive merging.
        const spacing = (theme.economy?.mergeDistance ?? 0) + 10;
        for (let i = 0; i < 1040; i++) scene.dropExperience(100 + (i % 260 % 20) * spacing, 100 + Math.floor(i % 260 / 20) * spacing, 1, "ambient");
        await framesUntil(() => world.pendingDestroy.size === 0);
        const overflow = {
          tracked: scene.pickups.size,
          active: [...scene.pickups].filter((p) => p.active).length,
          group: scene.pickupGroup.getLength(),
          bodies: world.bodies.size - baselineBodies,
          enabled: world.bodies.entries.filter((body: { gameObject?: { pickupId?: string }; enable: boolean }) => body.gameObject?.pickupId && body.enable).length,
          xp: [...scene.pickups].reduce((sum, p) => sum + p.xpValue, 0),
          merged: scene.pickupsMerged,
        };
        for (const pickup of [...scene.pickups]) { scene.collectPickup(pickup); scene.collectPickup(pickup); }
        await framesUntil(() => scene.pickups.size === 0 && world.pendingDestroy.size === 0);
        const collected = { xp: scene.xpEarnedTotal, count: scene.pickupsCollected, group: scene.pickupGroup.getLength(), bodies: world.bodies.size - baselineBodies };
        // Deliberately stop with work still pending, rather than relying on the
        // terminal path to have drained everything before shutdown.
        scene.placeHazard(0);
        scene.emitFeedback("elite", 100, 100, "lifecycle");
        scene.eventQueue.enqueue({ eventId: "retained", kind: "feedback.requested", provenance: { sourceCategory: "world" }, payload: { marker: "pending" } });
        scene.loadEventQueue.enqueue({ eventId: "load-retained", kind: "spawn.requested", provenance: { sourceCategory: "world" }, payload: {} });
        scene.minimapView.hazards.push([...scene.hazards][0]);
        scene.player.view?.flash(0xffffff, 1000);
        const player = scene.player;
        const image = player.view?.image;
        game.scene.stop("run");
        const stopped = {
          hazards: scene.hazards.size, feedback: scene.feedbackObjects.size,
          backlog: scene.eventQueue.snapshot().backlog + scene.loadEventQueue.snapshot().backlog,
          mapReferences: scene.minimapView.hazards.length,
          claimedIds: scene.claimedPickupIds.size,
          display: scene.children.length, bodies: world.bodies.size,
          timers: scene.time._active.length + scene.time._pendingInsertion.length + scene.time._pendingRemoval.length, tweens: scene.tweens.getTweens().length,
          postUpdate: scene.events.listenerCount("postupdate"),
          playerDestroyed: !player.active, spriteDestroyed: !image || !image.active,
          blurHandler: game.events.listeners("blur").includes(scene.handleGameBlur),
          focusHandler: game.events.listeners("focus").includes(scene.handleGameFocus),
        };
        scene.shutdownRuntime(); // assert the event-driven stop above first
        records.push({ cycle, baselineBodies, baselineObjects, baselinePostUpdate, overflow, collected, stopped });
        if (cycle < 2) {
          const next = new Promise<InstanceType<typeof RunScene>>((resolve) => { ready = resolve; });
          game.scene.start("run");
          scene = await next;
        }
      }
    } finally {
      game.destroy(true);
      game.runDestroy();
      parent.remove();
    }
    return records;
  }, themeKey);
  for (const row of result) {
    expect(row.baselineBodies).toBe(1);
    expect(row.baselineObjects).toBe(result[0]!.baselineObjects);
    expect(row.baselinePostUpdate).toBe(result[0]!.baselinePostUpdate);
    expect(row.overflow).toEqual({ tracked: 250, active: 250, group: 250, bodies: 250, enabled: 250, xp: 1040, merged: 790 });
    expect(row.collected).toEqual({ xp: 1040, count: 250, group: 0, bodies: 0 });
    expect(row.stopped).toEqual({ hazards: 0, feedback: 0, backlog: 0, mapReferences: 0, claimedIds: 0, display: 0, bodies: 0, timers: 0, tweens: 0, postUpdate: 0, playerDestroyed: true, spriteDestroyed: true, blurHandler: false, focusHandler: false });
  }
  expect(errors).toEqual([]);
});
