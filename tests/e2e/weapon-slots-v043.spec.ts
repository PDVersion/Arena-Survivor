import { expect, test } from "@playwright/test";

// Test-only second definition: prove real scene scheduling/hit ownership before
// authoring a new tool. No native focus, performance or long-play acceptance.
for (const themeKey of ["eco-guardian", "knight-magic"]) {
  test(`${themeKey} slots schedule independently and projectiles retain their weapon`, async ({ page }, testInfo) => {
    test.setTimeout(30_000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/sprite-browser.html?noAmbient=1&noContact=1&noXp=1&noHazards=1");
    const result = await page.evaluate(async (themeKey) => {
      const phaserPath = "/tests/fixtures/phaser-runtime.ts";
      const scenePath = "/src/game/scenes/run-scene.ts";
      const registryPath = "/src/game/content/theme-registry.ts";
      const slotsPath = "/src/game/systems/weapons/weapon-loadout.ts";
      const [{ default: Phaser }, { RunScene }, { themeRegistry }, { createWeaponSlots }] = await Promise.all([
        import(phaserPath), import(scenePath), import(registryPath), import(slotsPath),
      ]);
      const baseTheme = themeRegistry.find((entry: { key: string }) => entry.key === themeKey).theme;
      const projectileBase = themeRegistry.find((entry: { key: string }) => entry.key === "knight-magic").theme.weapons[0];
      const secondary = { ...projectileBase, id: "weapon.fixture_secondary", damage: 8, cooldownMs: 300,
        armourPierce: 1, knockback: 12, critChance: 0 };
      const theme = { ...baseTheme, weapons: [{ ...baseTheme.weapons[0], critChance: 0 }, secondary] };
      const parent = document.createElement("div");
      document.body.append(parent);
      let ready: (scene: InstanceType<typeof RunScene>) => void = () => {};
      class SlotsRun extends RunScene {
        resetTransientRuntime() { this.runTheme = theme; super.resetTransientRuntime(); }
        create() { super.create(); this.physics.world.pause(); ready(this); }
        update() {} // explicit simulation timestamps; actual Phaser actors/hit methods
      }
      const first = new Promise<InstanceType<typeof RunScene>>((resolve) => { ready = resolve; });
      const game = new Phaser.Game({ type: Phaser.CANVAS, width: 800, height: 450, parent, scene: [SlotsRun],
        physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 } } }, audio: { noAudio: true } });
      let timeout: ReturnType<typeof setTimeout> | undefined;
      try {
        const scene = await Promise.race([first, new Promise<never>((_, reject) => {
          timeout = setTimeout(() => reject(new Error("Slot fixture did not start")), 5000);
        })]);
        clearTimeout(timeout);
        scene.runState = { ...scene.runState, weaponSlots: createWeaponSlots(["weapon.starter", secondary.id]) };
        scene.fireIfReady();
        const noTargetClocks = scene.runState.weaponSlots.map((slot: { nextAttackAtMs: number }) => slot.nextAttackAtMs);
        const enemyDefinition = { ...theme.enemies[0], maxHealth: 1000, armour: 100 };
        scene.spawnEnemy("ambient", 1, enemyDefinition, { x: scene.player.x + 40, y: scene.player.y }, false);
        const enemy = [...scene.enemies][0];
        scene.runState = { ...scene.runState, status: "paused" };
        scene.fireIfReady();
        const pausedShots = scene.shotsFired;
        scene.runState = { ...scene.runState, status: "playing" };
        scene.fireIfReady();
        const firstClocks = scene.runState.weaponSlots.map((slot: { nextAttackAtMs: number }) => slot.nextAttackAtMs);
        const firstShots = scene.shotsFired;
        scene.runState = { ...scene.runState, elapsedMs: 299 };
        scene.fireIfReady();
        const heldShots = scene.shotsFired;
        scene.runState = { ...scene.runState, elapsedMs: 300 };
        scene.fireIfReady();
        const secondClocks = scene.runState.weaponSlots.map((slot: { nextAttackAtMs: number }) => slot.nextAttackAtMs);
        const secondShots = scene.shotsFired;
        const projectile = [...scene.projectiles].find((p) => p.weapon.id === secondary.id);
        // Change the current catalog after launch: the in-flight attack must
        // still use its own armour, knockback and stable source identity.
        scene.runTheme = { ...theme, weapons: theme.weapons.map((weapon: { id: string }) => weapon.id === secondary.id
          ? { ...weapon, armourPierce: 0, knockback: 0 } : weapon) };
        const beforeHealth = enemy.health;
        const beforeX = enemy.x;
        scene.handleProjectileEnemyOverlap(projectile, enemy);
        const hit = { damage: beforeHealth - enemy.health, knockback: enemy.x - beforeX };
        const killingProjectile = [...scene.projectiles].find((p) => p.weapon.id === secondary.id);
        enemy.health = 1;
        scene.handleProjectileEnemyOverlap(killingProjectile, enemy);
        const deaths: Array<{ provenance: { sourceId: string } }> = [];
        scene.eventQueue.processMatching(100, (event: { kind: string }) => event.kind === "death.committed",
          (event: { provenance: { sourceId: string } }) => { deaths.push(event); });
        const stats = scene.runState.statistics;
        const ledger = { total: stats.totalDamage,
          breakdown: Object.values(stats.damageBreakdown).reduce((sum: number, amount) => sum + Number(amount), 0) };
        scene.scene.stop("run");
        scene.scene.start("run");
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        const fresh = game.scene.getScene("run");
        return { environment: { userAgent: navigator.userAgent, dpr: window.devicePixelRatio,
          viewport: { width: window.innerWidth, height: window.innerHeight },
          renderer: game.renderer.type === Phaser.CANVAS ? "Canvas" : "other",
          gameSize: { width: game.config.width, height: game.config.height }, themeKey },
          noTargetClocks, pausedShots, firstClocks, firstShots, heldShots, secondClocks, secondShots, hit, deaths, ledger,
          freshSlots: fresh.runState.weaponSlots };
      } finally {
        clearTimeout(timeout);
        if (game.scene.isActive("run")) game.scene.stop("run");
        game.destroy(true);
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        parent.remove();
      }
    }, themeKey);
    await testInfo.attach("slot-observations", { body: JSON.stringify(result, null, 2), contentType: "application/json" });
    expect(result.environment.renderer).toBe("Canvas");
    expect(result.noTargetClocks).toEqual([0, 0]);
    expect(result.pausedShots).toBe(0);
    expect(result.ledger.total).toBe(themeKey === "eco-guardian" ? 14 : 9);
    expect(result.firstClocks).toEqual([1000, 300]);
    expect(result.firstShots).toBe(2);
    expect(result.heldShots).toBe(2);
    expect(result.secondClocks).toEqual([1000, 600]);
    expect(result.secondShots).toBe(3);
    expect(result.hit.damage).toBe(8);
    expect(result.hit.knockback).toBeGreaterThan(0);
    expect(result.deaths).toHaveLength(1);
    expect(result.deaths[0]?.provenance.sourceId).toBe("weapon.fixture_secondary");
    expect(result.ledger.total).toBeGreaterThan(0);
    expect(result.ledger.breakdown).toBeCloseTo(result.ledger.total, 10);
    expect(result.freshSlots).toEqual([{ weaponId: "weapon.starter", nextAttackAtMs: 0 }]);
    expect(errors).toEqual([]);
  });
}
