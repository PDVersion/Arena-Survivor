import { expect, test } from "@playwright/test";
// The cone/splash campaign is preserved in build/history. Eco now owns aura tracks;
// generic cone/evolution contracts remain covered by existing unit fixtures.
test("normal offers equip one vacuum and advance its single seven-level path", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/sprite-browser.html?noAmbient&noContact&noHazards");
  await page.evaluate(async () => {
    const paths = ["/tests/fixtures/phaser-runtime.ts", "/src/game/scenes/run-scene.ts", "/src/game/content/active-theme.ts",
      "/src/game/systems/upgrades.ts", "/src/game/systems/sprites/load-sprites.ts", "/src/game/systems/persistence/profile-service.ts", "/src/game/systems/statistics/run-statistics.ts", "/src/game/config.ts"];
    const [{ default: Phaser }, { RunScene }, { activeTheme: theme }, upgrades, sprites, persistence, stats, config] = await Promise.all(paths.map((path) => import(path)));
    persistence.initializeProfile(theme);
    persistence.recordProfileFinishedRun(theme, { status: "complete", elapsedMs: 1000, level: 1, statistics: stats.createRunStatistics() });
    const parent = document.createElement("div"); parent.id = "offer-test"; Object.assign(parent.style, { position: "fixed", inset: "0", zIndex: "9999" }); document.body.append(parent);
    let ready: (value: InstanceType<typeof RunScene>) => void = () => {};
    const started = new Promise<InstanceType<typeof RunScene>>((resolve) => { ready = resolve; });
    class Run extends RunScene { create() { super.create(); ready(this); } }
    class Load extends Phaser.Scene { constructor() { super("offer-load"); } preload() { sprites.loadThemeSprites(this, theme); } create() { this.scene.start("run"); } }
    const game = new Phaser.Game({ ...config.createGameConfig(parent.id), scene: [Load, Run], audio: { noAudio: true } });
    const scene = await started;
    const offer = (id: string) => {
      for (let seed = 1; seed <= 1000; seed++) {
        const choices = upgrades.selectUpgradeChoices(scene.runUpgradePool, 3, upgrades.createSeededRandom(seed), { ...scene.runState, skills: theme.skills });
        if (!choices.some((choice: { id: string }) => choice.id === id)) continue;
        scene.upgradeRandom = upgrades.createSeededRandom(seed);
        scene.dropExperience(scene.player.x, scene.player.y, scene.runState.progression.xpToNextLevel, "ambient");
        scene.collectPickup([...scene.pickups].find((pickup) => !pickup.isClaimed));
        return scene.currentChoices.findIndex((choice: { id: string }) => choice.id === id);
      }
      throw new Error(`No valid offer for ${id}`);
    };
    const fixture = {
      offer,
      snapshot: () => ({ slots: scene.runState.weaponSlots.map((slot: { weaponId: string }) => slot.weaponId), selected: scene.runState.selectedUpgradeIds, status: scene.runState.status }),
      restart: () => scene.scene.restart(),
      cleanup: () => { game.destroy(true); parent.remove(); },
    };
    Object.assign(window, { __AURA_OFFER_FIXTURE__: fixture });
  });
  const snapshot = () => page.evaluate(() => (window as unknown as { __AURA_OFFER_FIXTURE__: { snapshot(): { slots: string[]; selected: string[]; status: string } } }).__AURA_OFFER_FIXTURE__.snapshot());
  try {
    for (const id of ["upgrade.equip_secondary", ...Array<string>(6).fill("upgrade.tool.aura_damage")]) {
      const index = await page.evaluate((id) => (window as unknown as { __AURA_OFFER_FIXTURE__: { offer(id: string): number } }).__AURA_OFFER_FIXTURE__.offer(id), id);
      expect(index).toBeGreaterThanOrEqual(0);
      await page.keyboard.press(String(index + 1), { delay: 50 });
      await expect.poll(async () => (await snapshot()).status).toBe("playing");
    }
    expect((await snapshot()).slots).toEqual(["weapon.starter", "weapon.secondary"]);
    expect((await snapshot()).selected.filter((id) => id === "upgrade.tool.aura_damage")).toHaveLength(6);
    await page.evaluate(() => (window as unknown as { __AURA_OFFER_FIXTURE__: { restart(): void } }).__AURA_OFFER_FIXTURE__.restart());
    await expect.poll(async () => (await snapshot()).slots).toEqual(["weapon.starter"]);
    expect(errors).toEqual([]);
  } finally { await page.evaluate(() => (window as unknown as { __AURA_OFFER_FIXTURE__: { cleanup(): void } }).__AURA_OFFER_FIXTURE__.cleanup()); }
});
