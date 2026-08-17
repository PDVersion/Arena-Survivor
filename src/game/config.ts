import Phaser from "phaser";
import { BootScene } from "./scenes/boot-scene";
import { RunScene } from "./scenes/run-scene";

/**
 * The fixed logical view.
 *
 * Every window renders exactly this much world, scaled to fit and letterboxed
 * where the aspect does not match. A larger window must never show more of the
 * arena: that would mean more warning, more targets in range, and a different
 * game — and every balance value in V0.3 would become monitor-dependent.
 */
export const LOGICAL_VIEW = Object.freeze({ width: 1600, height: 900 });

export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#0a0f1b",
    scene: [BootScene, RunScene],
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scale: {
      // FIT keeps the game size constant and letterboxes the remainder, so the
      // visible world area is identical at every window size and preset.
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: LOGICAL_VIEW.width,
      height: LOGICAL_VIEW.height,
    },
    render: {
      antialias: true,
      pixelArt: false,
    },
  };
}
