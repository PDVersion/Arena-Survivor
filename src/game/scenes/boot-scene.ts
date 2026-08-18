import Phaser from "phaser";

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

  create(): void {
    this.scene.start(testShowsMenu() ? "menu" : "run");
  }
}
