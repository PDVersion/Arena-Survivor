import { themeRegistry } from "../../src/game/content/theme-registry";
import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

for (const themeKey of ["eco-guardian", "knight-magic"]) for (const quality of ["default", "low"]) {
  test(`${themeKey} G4 review and optional guide ${quality}`, async ({ page, browser }, testInfo) => {
    test.setTimeout(30000);
    const errors: string[] = []; page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/sprite-browser.html?noAmbient&noContact&noHazards&noWeapon");
    try {
      const initial = await page.evaluate(async ({ themeKey, quality }) => {
        const paths = ["/tests/fixtures/phaser-runtime.ts", "/src/game/scenes/run-scene.ts", "/src/game/content/theme-registry.ts",
          "/src/game/systems/sprites/load-sprites.ts", "/src/game/config.ts", "/src/game/systems/persistence/profile-service.ts",
          "/src/game/state/run-state.ts", "/src/game/systems/mastery/run-review.ts", "/src/game/systems/difficulty/resolve-difficulty.ts"];
        const [{ default: Phaser }, { RunScene }, { themeRegistry }, { loadThemeSprites }, { createGameConfig }, service, rules, mastery, { resolveDifficultyTheme }] = await Promise.all(paths.map((p) => import(p)));
        const theme = resolveDifficultyTheme(themeRegistry.find((entry: { key: string }) => entry.key === themeKey).theme, "normal");
        const memory = new Map<string, string>(); let writes = 0;
        const adapter = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => { writes++; memory.set(key, value); }, removeItem: (key: string) => memory.delete(key) };
        service.initializeProfile(theme, adapter);
        const root = document.createElement("div"); root.id = "g4-root";
        Object.assign(root.style, { position: "fixed", inset: "0", zIndex: "9999" }); document.body.append(root);
        let scene: InstanceType<typeof RunScene>;
        const game = await new Promise<InstanceType<typeof Phaser.Game>>((resolve) => {
          class Run extends RunScene {
            resetTransientRuntime() { this.runTheme = theme; super.resetTransientRuntime(); }
            create() {
              super.create();
              // eslint-disable-next-line @typescript-eslint/no-this-alias -- bounded aided scene
              scene = this; this.physics.world.pause(); resolve(this.game);
            }
            update() { /* Actual damage/UI methods; scripted clocks/positions/build below. */ }
          }
          class Load extends Phaser.Scene {
            constructor() { super("g4-load"); }
            preload() { loadThemeSprites(this, theme); }
            create() { this.scene.start("run"); }
          }
          new Phaser.Game({ ...createGameConfig(root.id), type: Phaser.CANVAS, audio: { noAudio: true }, scene: [Load, Run] });
        });
        if (quality === "low") { scene!.applySetting("presentationQuality"); scene!.applySetting("reducedMotion"); }
        type UiNode = { text?: string; visible: boolean; list?: UiNode[] };
        const flatten = (nodes: UiNode[]): UiNode[] => nodes.flatMap((node) => [node, ...flatten(node.list ?? [])]);
        const text = (container: { list: UiNode[] } | undefined) => flatten(container?.list ?? []).filter((c) => c.visible && typeof c.text === "string").map((c) => c.text);
        const guide = (section: string) => {
          scene!.pauseMenu.codexSection = section;
          scene!.pauseMenu.show(scene!.pauseMenuView(), () => {}, { tab: "codex" });
          return { texts: text(scene!.pauseMenu.container), page: scene!.pauseMenu.enemyPage, writes, listeners: scene!.input.keyboard.listenerCount("keydown-PAGE_DOWN") };
        };
        const writesBefore = writes;
        const capabilities = guide("capabilities");
        const firstEnemy = guide("enemies");
        const guideSnapshot = () => {
          const body = scene!.pauseMenu.scrollBody?.list.find((c: { text?: string }) => c.text?.includes(theme.copy.mastery.gameValues));
          return { texts: text(scene!.pauseMenu.container), page: scene!.pauseMenu.enemyPage, writes,
            bodyBottom: body ? body.y + body.height : 0, navigationTop: scene!.pauseMenu.enemyPageBounds[0]?.bounds.top ?? 0,
            listeners: scene!.input.keyboard.listenerCount("keydown-PAGE_DOWN"), scroll: window.scrollY };
        };
        const clickPoint = (rect: { centerX: number; centerY: number }) => {
          const canvas = game.canvas.getBoundingClientRect();
          return { x: canvas.left + (scene!.scale.width / 2 + (rect.centerX - scene!.scale.width / 2) * 1.25) * canvas.width / scene!.scale.width,
            y: canvas.top + (scene!.scale.height / 2 + (rect.centerY - scene!.scale.height / 2) * 1.25) * canvas.height / scene!.scale.height };
        };
        const overlaySnapshot = () => ({ texts: text(scene!.runEndOverlay.container), page: scene!.runEndOverlay.page,
          profile: service.getProfile(), writes, statistics: scene!.runState.statistics,
          review: mastery.selectRunReview(scene!.runState, scene!.runTheme, service.getProfile().unlockedWeaponIds),
          tabPoints: scene!.runEndOverlay.pageBounds.map((entry: { page: string; bounds: { centerX: number; centerY: number } }) => ({ page: entry.page, ...clickPoint(entry.bounds) })),
          boxes: scene!.runEndOverlay.container.list.filter((c: { text?: string; visible: boolean }) => c.visible && typeof c.text === "string")
            .map((c: { x: number; y: number; width: number; height: number; originX: number; originY: number; text: string }) => ({ text: c.text, left: c.x - c.width * c.originX, top: c.y - c.height * c.originY, right: c.x + c.width * (1 - c.originX), bottom: c.y + c.height * (1 - c.originY) })),
        });
        Object.assign(window, { __G4__: {
          guideSnapshot,
          guideIndex(index: number) { scene!.pauseMenu.enemyPage = index; scene!.pauseMenu.refresh(scene!.pauseMenuView()); return guideSnapshot(); },
          finish() {
            scene!.pauseMenu.hide();
            const acquire = (id: string) => {
              scene!.runState = rules.applyRunUpgrade({ ...scene!.runState, status: "level_up", progression: { ...scene!.runState.progression, pendingChoices: 1 } },
                theme.upgrades.find((u: { id: string }) => u.id === id), undefined, 1, theme.weapons, theme.curses);
            };
            const attack = (weaponId: string) => {
              const definition = scene!.runTheme.enemies.find((e: { id: string }) => e.id === "enemy.cluster_fodder");
              scene!.spawnEnemy("ambient", 1, definition, { x: scene!.player.x + 45, y: scene!.player.y }, false);
              const enemy = [...scene!.enemies].find((e) => e.active);
              const health = enemy.health;
              scene!.runState = { ...scene!.runState, player: { ...scene!.runState.player, stats: { ...scene!.runState.player.stats, critChance: 0 } } };
              const weapon = scene!.runTheme.weapons.find((w: { id: string }) => w.id === weaponId);
              if (!weapon.cleanup) scene!.fireWeaponIfReady(weapon);
              if (weapon.deliveryKind === "projectile") scene!.handleProjectileEnemyOverlap([...scene!.projectiles][0], enemy);
              scene!.processCausalEvents();
              scene!.commitEnemyDamage(enemy, 99999, "direct", undefined, { weapon, directBase: 99999, criticalBonus: 0, piercingMomentum: 0 });
              scene!.processCausalEvents();
              return { health, defeated: enemy.defeated };
            };
            const hits = [attack("weapon.starter")];
            if (quality === "low") {
              scene!.revealAllShrines(); scene!.activateShrine(scene!.shrineActors.find((s: { definition: { id: string } }) => s.definition.id === "shrine.greed"));
              acquire("upgrade.accept_frenzy"); acquire("upgrade.equip_secondary"); hits.push(attack("weapon.secondary"));
              if (theme.economy) {
                for (let i = 0; i < 6; i++) acquire("upgrade.tool.aura_damage");
                const equip = theme.upgrades.find((u: { effects: { kind: string; weaponId?: string }[] }) => u.effects.some((e) => e.kind === "weapon.equip" && e.weaponId === "weapon.cleaning_bin"));
                acquire(equip.id); hits.push(attack("weapon.cleaning_bin"));
              } else {
                for (let i = 0; i < 4; i++) acquire("upgrade.secondary_range");
                acquire("upgrade.evolve_secondary"); hits.push(attack("weapon.secondary_evolved"));
              }
              scene!.runState = { ...scene!.runState, status: "complete", mode: "clearing", finalBossDefeated: true, elapsedMs: scene!.runState.durationMs + 1000 };
            } else {
              const endless = themeKey === "knight-magic";
              scene!.runState = { ...scene!.runState, elapsedMs: (endless ? scene!.runState.durationMs : 0) + 94000, mode: endless ? "endless" : "timed", finalBossDefeated: endless };
              scene!.runState = rules.damageRunPlayer(scene!.runState, 99999, { sourceId: "enemy.committed_charger", elite: false });
            }
            const beforeRuns = service.getProfile().statistics.runsPlayed;
            scene!.enterTerminalState();
            const first = overlaySnapshot(); scene!.enterTerminalState(); scene!.runEndOverlay.resize(() => scene!.restartRun());
            return { hits, beforeRuns, first, repeated: overlaySnapshot(), keyboardListenersAfterGuide: scene!.input.keyboard.listenerCount("keydown-PAGE_DOWN") };
          },
          snapshot: overlaySnapshot,
          resized() { scene!.runEndOverlay.resize(() => scene!.restartRun()); return overlaySnapshot(); },
          restart() { scene!.restartRun(); },
          resetSnapshot() { return { state: scene!.runState.statistics, profile: service.getProfile(), pool: service.selectRunUpgradePool(scene!.runTheme).map((u: { id: string }) => u.id) }; },
          reloadProfile() { const before = service.getProfile(); service.initializeProfile(theme, adapter); return { before, after: service.getProfile() }; },
          async cleanup() { game.scene.stop("run"); game.destroy(true); await new Promise<void>((r) => requestAnimationFrame(() => r())); root.remove(); },
        } });
        return { writesBefore, capabilities, firstEnemy, enemyCount: scene!.pauseMenuView().codexEnemies.length };
      }, { themeKey, quality });
      expect(initial.capabilities.texts.join("\n")).toContain("0/1"); expect(initial.capabilities.texts.join("\n")).toContain("0/25");
      expect(initial.firstEnemy.writes).toBe(initial.writesBefore); expect(initial.enemyCount).toBe(themeRegistry.find((entry) => entry.key === themeKey)!.theme.enemies.length);
      expect(initial.firstEnemy.listeners).toBe(1);
      await page.keyboard.press("PageDown");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bounded fixture
      const paged = await page.evaluate(() => (window as any).__G4__.guideSnapshot());
      expect(paged.page).toBe(1); expect(paged.listeners).toBe(1); expect(paged.scroll).toBe(0); expect(paged.writes).toBe(initial.writesBefore);
      const allPages = await page.evaluate((count) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bounded page/layout inspection
        return Array.from({ length: count }, (_, index) => (window as any).__G4__.guideIndex(index));
      }, initial.enemyCount);
      for (const entry of allPages) { expect(entry.bodyBottom).toBeLessThan(entry.navigationTop); expect(entry.texts.join("\n")).not.toMatch(/\d+\.\d{3,}/); expect(entry.writes).toBe(initial.writesBefore); }
      const canIndex = themeRegistry.find((entry) => entry.key === themeKey)!.theme.enemies.findIndex((enemy) => enemy.id === "enemy.committed_charger");
      const canPage = allPages[canIndex];
      expect(canPage.texts.join("\n")).toContain(themeKey === "eco-guardian" ? "Aluminium Can" : "Barrel Construct");
      await page.screenshot({ path: testInfo.outputPath("enemy-guide.png") });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bounded fixture
      const result = await page.evaluate(() => (window as any).__G4__.finish());
      expect(result.hits.every((h: { defeated: boolean }) => h.defeated)).toBe(true);
      expect(result.first.statistics.totalDamage).toBeCloseTo(result.hits.reduce((n: number, h: { health: number }) => n + h.health, 0), 8);
      expect(result.first.profile.statistics.runsPlayed).toBe(result.beforeRuns + 1); expect(result.first.profile).toEqual(result.repeated.profile);
      expect(result.first.writes).toBe(result.repeated.writes); expect(result.keyboardListenersAfterGuide).toBe(0);
      expect(JSON.stringify(result.first.profile)).not.toContain("damageByWeapon");
      expect(result.first.texts.join("\n")).toContain(themeKey === "eco-guardian" ? "Tool contributions" : "Weapon contributions");
      if (quality === "default") expect(result.first.texts.join("\n")).toContain(themeKey === "knight-magic" ? "6:34" : "1:34");
      else expect(Object.keys(result.first.statistics.damageByWeapon)).toHaveLength(3);
      await page.screenshot({ path: testInfo.outputPath("run-review.png") });
      const point = result.first.tabPoints.find((p: { page: string }) => p.page === "details");
      await page.mouse.click(point.x, point.y);
      await expect.poll(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- game input is delivered on its next frame
        return page.evaluate(() => (window as any).__G4__.snapshot().page);
      }).toBe("details");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bounded fixture
      const details = await page.evaluate(() => (window as any).__G4__.snapshot());
      expect(details.page).toBe("details"); expect(details.profile).toEqual(result.first.profile);
      await page.keyboard.press("Tab");
      await expect.poll(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bounded UI input
        return page.evaluate(() => (window as any).__G4__.snapshot().page);
      }).toBe("review");
      await page.keyboard.press("Tab");
      await expect.poll(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bounded UI input
        return page.evaluate(() => (window as any).__G4__.snapshot().page);
      }).toBe("details");
      await page.setViewportSize({ width: 1000, height: 700 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bounded fixture
      const resized = await page.evaluate(() => (window as any).__G4__.resized());
      expect(resized.page).toBe("details"); expect(resized.profile).toEqual(result.first.profile);
      await page.screenshot({ path: testInfo.outputPath("details-resized.png") });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bounded fixture
      const reload = await page.evaluate(() => (window as any).__G4__.reloadProfile());
      expect(reload.after).toEqual(reload.before);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bounded fixture
      await page.evaluate(() => (window as any).__G4__.restart());
      await page.waitForTimeout(80);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bounded fixture
      const reset = await page.evaluate(() => (window as any).__G4__.resetSnapshot());
      expect(reset.state.damageByWeapon).toEqual({}); expect(reset.state.totalDamage).toBe(0);
      expect(reset.profile).toEqual(result.first.profile); expect(reset.pool).toContain("upgrade.equip_secondary");
      expect(errors).toEqual([]);
      await writeFile(testInfo.outputPath("observations.json"), JSON.stringify({ themeKey, quality, browser: browser.version(), initial, paged, allPages, canPage, result, details, resized, reload, reset, errors }, null, 2));
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bounded fixture
      await page.evaluate(() => (window as any).__G4__?.cleanup());
    }
  });
}

test("title Info supports guide navigation without writing progress", async ({ page }, testInfo) => {
  await page.goto("/?menu=1");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().scene)).toBe("menu");
  const initial = await page.evaluate(() => localStorage.getItem("arena-survivor.profile"));
  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  // Same fixed-view Info position used by the existing title-menu smoke test.
  await canvas.click({ position: { x: 800 * box!.width / 1600, y: 585 * box!.width / 1600 } });
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().menu?.overlayTab)).toBe("codex");
  await page.keyboard.press("ArrowDown"); await page.keyboard.press("PageDown");
  await page.screenshot({ path: testInfo.outputPath("title-enemies.png") });
  await page.keyboard.press("ArrowDown"); await page.keyboard.press("ArrowDown");
  await page.screenshot({ path: testInfo.outputPath("title-capabilities.png") });
  await page.keyboard.press("Escape");
  await expect.poll(() => page.evaluate(() => window.__ARENA_TEST__?.getSnapshot().menu?.overlayOpen)).toBe(false);
  const final = await page.evaluate(() => localStorage.getItem("arena-survivor.profile"));
  expect(final).toBe(initial);
  // Section contents/paging are asserted in the four owned fixtures above;
  // this black-box smoke covers the ordinary title entry and keyboard route.
  await writeFile(testInfo.outputPath("observations.json"), JSON.stringify({ initial, final, note: "Title entry/exit and no durable write; section content verified visually and by owned fixtures." }, null, 2));
});
