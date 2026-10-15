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

export const BOOT_FAILURE_EVENT = "boot.failed";

export class BootScene extends Phaser.Scene {
  private failedAsset?: string;
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
    this.failedAsset = undefined;
    this.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      this.failedAsset = file.src;
    });
    loadThemeSprites(this, activeTheme);
  }

  create(): void {
    if (this.failedAsset) {
      this.game.events.emit(BOOT_FAILURE_EVENT, new Error(`Unable to load asset: ${this.failedAsset}`));
      return;
    }
    this.scene.start(testShowsMenu() ? "menu" : "run");
  }
}
