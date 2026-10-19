import Phaser from "phaser";
import type { MeleeWeaponDefinition, ThemeTokens } from "../core/archetypes/contracts";

/** Short sector cue; it follows authored geometry without owning any hits. */
export class ConeAttackActor extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, angle: number,
    definition: MeleeWeaponDefinition, tokens: ThemeTokens, onComplete: () => void) {
    super(scene, x, y);
    const colour = Phaser.Display.Color.HexStringToColor(tokens.palette[definition.presentationToken]).color;
    const half = (definition.arcRadians ?? 0) / 2;
    const sector = scene.add.graphics();
    sector.fillStyle(colour, 0.14).lineStyle(2, colour, 0.85);
    sector.slice(0, 0, definition.reach, -half, half, false).fillPath().strokePath();
    const nozzle = scene.add.rectangle(8, 0, 16, 10, colour);
    this.add([sector, nozzle]).setRotation(angle).setDepth(45);
    scene.add.existing(this);
    scene.tweens.add({ targets: this, alpha: 0, duration: definition.extendMs + definition.retractMs,
      onComplete: () => { this.destroy(); onComplete(); } });
  }
}
