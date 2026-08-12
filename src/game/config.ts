import Phaser from "phaser";
import { BootScene } from "./scenes/boot-scene";
import { RunScene } from "./scenes/run-scene";

export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#0a0f1b",
    scene: [BootScene, RunScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: "100%",
      height: "100%",
    },
    render: {
      antialias: true,
      pixelArt: false,
    },
  };
}
