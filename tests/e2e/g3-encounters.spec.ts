import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

// Bounded aided scene integration; forced clocks/positions are not natural play.
for (const themeKey of ["eco-guardian", "knight-magic"]) for (const quality of ["default", "low"]) {
  test(`${themeKey} G3 optional destination and mixed warnings ${quality}`, async ({ page, browser }, testInfo) => {
    test.setTimeout(30_000);
    const errors: string[] = []; page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/sprite-browser.html?noAmbient&noContact&noHazards&noWeapon");
    try {
      const initial = await page.evaluate(async ({ themeKey, quality }) => {
        const paths = ["/tests/fixtures/phaser-runtime.ts", "/src/game/scenes/run-scene.ts", "/src/game/content/theme-registry.ts",
          "/src/game/systems/sprites/load-sprites.ts", "/src/game/config.ts"];
        const [{ default: Phaser }, { RunScene }, { themeRegistry }, { loadThemeSprites }, { createGameConfig }] = await Promise.all(paths.map((p) => import(p)));
        const theme = themeRegistry.find((entry: { key: string }) => entry.key === themeKey).theme;
        const root = document.createElement("div"); root.id = "g3-root";
        Object.assign(root.style, { position: "fixed", inset: "0", zIndex: "9999" }); document.body.append(root);
        let scene: InstanceType<typeof RunScene>;
        const game = await new Promise<InstanceType<typeof Phaser.Game>>((resolve) => {
          class Run extends RunScene {
            resetTransientRuntime() { this.runTheme = theme; super.resetTransientRuntime(); }
            create() {
              super.create();
              // eslint-disable-next-line @typescript-eslint/no-this-alias -- bounded scene fixture
              scene = this; this.physics.world.pause(); resolve(this.game);
            }
            update(time: number) { super.update(time, 0); }
            tick(delta: number) { super.update(performance.now(), delta); this.physics.world.pause(); }
          }
          class Load extends Phaser.Scene {
            constructor() { super("g3-load"); }
            preload() { loadThemeSprites(this, theme); }
            create() { this.scene.start("run"); }
          }
          new Phaser.Game({ ...createGameConfig(root.id), type: Phaser.CANVAS, audio: { noAudio: true }, scene: [Load, Run] });
        });
        if (quality === "low") { scene!.applySetting("presentationQuality"); scene!.applySetting("reducedMotion"); }
        scene!.runState = { ...scene!.runState, elapsedMs: .4 * scene!.runState.durationMs };
        scene!.updateShrine(); scene!.updateMinimap();
        const greed = scene!.shrineActors.find((a: { definition: { id: string } }) => a.definition.id === "shrine.greed");
        const placedDistance = Phaser.Math.Distance.Between(greed.x, greed.y, scene!.player.x, scene!.player.y);
        const arrived = { count: scene!.shrinesRevealed, markers: scene!.shrineMarkers.size, minimap: scene!.minimap.visible, planned: scene!.shrineArrivals.length };
        greed.setPosition(scene!.player.x + 90, scene!.player.y); scene!.updateShrine();
        const snapshot = () => ({ world: scene!.runState.world, prompt: greed.prompt.text, promptVisible: greed.prompt.visible,
          activated: greed.activated, minimapSites: scene!.shrineActors.filter((a: { activated: boolean }) => !a.activated).length,
          promptBounds: { left: greed.prompt.x - greed.prompt.displayWidth / 2, right: greed.prompt.x + greed.prompt.displayWidth / 2,
            top: greed.prompt.y - greed.prompt.displayHeight / 2, bottom: greed.prompt.y + greed.prompt.displayHeight / 2 },
          view: { left: scene!.cameras.main.worldView.left, right: scene!.cameras.main.worldView.right,
            top: scene!.cameras.main.worldView.top, bottom: scene!.cameras.main.worldView.bottom },
        });
        const before = snapshot();
        Object.assign(window, { __G3__: {
          snapshot,
          ignore() { greed.setPosition(scene!.player.x + 450, scene!.player.y + 400); scene!.updateShrine(); return snapshot(); },
          near() { greed.setPosition(scene!.player.x + 90, scene!.player.y); scene!.updateShrine(); return snapshot(); },
          repeat() { scene!.activateShrine(greed); scene!.activateShrine(greed); return snapshot(); },
          heavyAndBoss() {
            const permit = (action: () => void) => {
              const url = new URL(location.href); url.searchParams.delete("noAmbient"); history.replaceState(null, "", url);
              try { action(); } finally { url.searchParams.set("noAmbient", ""); history.replaceState(null, "", url); }
            };
            const introductions = [];
            scene!.enemyCapacity = 1;
            for (const id of ["enemy.slow_durable", "enemy.death_spawner"]) {
              const role = theme.tuning.director.roles.find((r: { enemyId: string }) => r.enemyId === id);
              scene!.runState = { ...scene!.runState, elapsedMs: role.unlockAt * scene!.runState.durationMs };
              scene!.lastDirectorProgress = role.unlockAt - .001;
              permit(() => scene!.releaseMilestoneWaves());
              const queued = scene!.eventQueue.snapshot().backlog;
              let admitted = 0;
              for (let i = 0; i < queued; i++) { scene!.processCausalEvents(); for (const actor of scene!.enemies) { admitted++; actor.destroy(); } }
              scene!.processCausalEvents();
              introductions.push({ id, queued, admitted, backlog: scene!.eventQueue.snapshot().backlog });
            }
            scene!.enemyCapacity = 300;
            const miniDefinition = theme.enemies.find((e: { boss?: { kind: string } }) => e.boss?.kind === "mini");
            scene!.runState = { ...scene!.runState, elapsedMs: miniDefinition.boss.appearAt * scene!.runState.durationMs };
            scene!.releaseBossMilestones(); scene!.releaseBossMilestones();
            const mini = [...scene!.enemies].find((e) => e.definition.boss);
            mini.arcadeBody.reset(scene!.player.x + 100, scene!.player.y);
            scene!.runState = { ...scene!.runState, elapsedMs: scene!.bossAttacks.get(mini).nextAtMs };
            scene!.updateBossAttacks(); scene!.updateEnemies(16);
            const held = { velocity: [mini.arcadeBody.velocity.x, mini.arcadeBody.velocity.y], warning: scene!.bossAttacks.get(mini).warning,
              cueCommands: scene!.bossCues.get(mini).commandBuffer.length, count: scene!.bossAttacks.size, health: scene!.runState.player.health };
            scene!.player.arcadeBody.reset(scene!.player.x, scene!.player.y + 180);
            for (const [i, id] of ["enemy.gust_drifter", "enemy.committed_charger"].entries()) {
              scene!.spawnEnemy("ambient", 1, theme.enemies.find((e: { id: string }) => e.id === id),
                { x: scene!.player.x + (i ? -120 : 120), y: scene!.player.y }, false);
            }
            scene!.updateEnemies(16); scene!.events.emit(Phaser.Scenes.Events.POST_UPDATE);
            const directional = [...scene!.enemies].filter((e) => e.motionCue).map((e) => ({ id: e.definition.id, phase: e.motionState.phase, commands: e.motionCue.image.commandBuffer.length }));
            scene!.togglePause(); const pausedAt = scene!.runState.elapsedMs; scene!.tick(3000);
            const paused = { elapsed: scene!.runState.elapsedMs, expected: pausedAt, warning: scene!.bossAttacks.get(mini).warning };
            scene!.togglePause(); scene!.physics.world.pause();
            Object.assign(window, { __G3_RELEASE__: () => {
              scene!.runState = { ...scene!.runState, elapsedMs: held.warning.releaseAtMs };
              scene!.updateBossAttacks(); scene!.updateEnemies(16);
              return { health: scene!.runState.player.health, pulses: scene!.bossPulses,
                speed: mini.arcadeBody.velocity.length(), warning: scene!.bossAttacks.get(mini).warning ?? null,
                commands: scene!.bossCues.get(mini).commandBuffer.length };
            } });
            return { introductions, held, paused, directional };
          },
          async cleanup() { game.scene.stop("run"); game.destroy(true); await new Promise<void>((r) => requestAnimationFrame(() => r())); root.remove(); },
        } });
        return { themeKey, quality, placedDistance, arrived, before, rate: theme.tuning.pace.gameplayRate };
      }, { themeKey, quality });
      expect(initial.arrived).toMatchObject({ count: 2, planned: 5, minimap: true });
      expect(initial.arrived.markers).toBeGreaterThan(0); expect(initial.placedDistance).toBeGreaterThan(120);
      expect(initial.rate).toBe(.5); expect(initial.before.prompt).toContain("→"); expect(initial.before.prompt).toContain("ignore");
      expect(initial.before.promptBounds.left).toBeGreaterThanOrEqual(initial.before.view.left);
      expect(initial.before.promptBounds.right).toBeLessThanOrEqual(initial.before.view.right);
      expect(initial.before.promptBounds.top).toBeGreaterThanOrEqual(initial.before.view.top);
      expect(initial.before.promptBounds.bottom).toBeLessThanOrEqual(initial.before.view.bottom);
      await page.screenshot({ path: testInfo.outputPath("site-preview.png") });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bounded fixture
      const ignored = await page.evaluate(() => (window as any).__G3__.ignore());
      expect(ignored.world).toEqual(initial.before.world); expect(ignored.promptVisible).toBe(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bounded fixture
      await page.evaluate(() => (window as any).__G3__.near());
      await page.keyboard.press("Space", { delay: 100 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bounded fixture
      const accepted = await page.evaluate(() => (window as any).__G3__.snapshot());
      expect(accepted.activated).toBe(true); expect(accepted.promptVisible).toBe(false);
      expect(accepted.world.shrineActivations["shrine.greed"]).toBe(1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bounded fixture
      const repeated = await page.evaluate(() => (window as any).__G3__.repeat());
      expect(repeated.world).toEqual(accepted.world); expect(repeated.minimapSites).toBe(1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bounded fixture
      const encounter = await page.evaluate(() => (window as any).__G3__.heavyAndBoss());
      expect(encounter.introductions.map((a: { queued: number }) => a.queued)).toEqual([4, 2]);
      expect(encounter.introductions.map((a: { admitted: number }) => a.admitted)).toEqual([4, 2]);
      expect(encounter.introductions.map((a: { backlog: number }) => a.backlog)).toEqual([0, 0]);
      expect(encounter.held.velocity).toEqual([0, 0]); expect(encounter.held.count).toBe(1); expect(encounter.held.cueCommands).toBeGreaterThan(0);
      expect(encounter.paused.elapsed).toBe(encounter.paused.expected); expect(encounter.paused.warning).toEqual(encounter.held.warning);
      for (const cue of encounter.directional) { expect(cue.phase).toBe("telegraph"); expect(cue.commands).toBeGreaterThan(0); }
      await page.screenshot({ path: testInfo.outputPath("mixed-warnings.png") });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bounded fixture
      const release = await page.evaluate(() => (window as any).__G3_RELEASE__());
      expect(release.health).toBe(encounter.held.health); expect(release.pulses).toBe(1); expect(release.speed).toBeGreaterThan(0);
      expect(release.warning).toBe(null); expect(release.commands).toBe(0); expect(errors).toEqual([]);
      await writeFile(testInfo.outputPath("observations.json"), JSON.stringify({ browser: browser.version(), initial, ignored, accepted, repeated, encounter, release, errors }, null, 2));
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bounded fixture
      await page.evaluate(() => (window as any).__G3__?.cleanup());
    }
  });
}
