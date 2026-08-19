import Phaser from "phaser";
import { activeTheme } from "../content/active-theme";
import { loadThemeSprites } from "../systems/sprites/load-sprites";

/**
 * Test-only seam that keeps the title screen up.
 *
 * The game boots into the menu, but almost every browser path's subject is the
 * run, and making forty specs dismiss a title screen would buy nothing. Test
 * mode therefore goes straight to the run unless a path asks for the menu — the
 * same shape as `spawnRadius` and `shrineLayout`. The menu itself is covered by
 * the path that passes this flag, including the transition into a live run.
 */
function testShowsMenu(): boolean {
  if (import.meta.env.MODE !== "test") return true;
  return new URLSearchParams(window.location.search).has("menu");
}

export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  /**
   * Queue the active theme's sprite sheets.
   *
   * Loading lives here rather than in the sprite work itself because
   * `src/game/scenes/` is closed to that stream by the ownership table in
   * `build/BUILD_PLAN_V0.4.md` §3 — so the seam has to open the door. With no
   * sprites declared this queues nothing and boot is unchanged.
   */
  preload(): void {
    loadThemeSprites(this, activeTheme);
  }

  create(): void {
    this.scene.start(testShowsMenu() ? "menu" : "run");
  }
}
