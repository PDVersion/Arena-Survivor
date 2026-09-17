import Phaser from "phaser";
import type { MeleeWeaponDefinition, ThemeTokens } from "../core/archetypes/contracts";

/** Primitive fallback for the future grabber sprite: shaft, handle, and open jaws. */
export class GrabberActor extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    angle: number,
    definition: MeleeWeaponDefinition,
    tokens: ThemeTokens,
    onComplete: () => void,
  ) {
    super(scene, x, y);
    const colour = Phaser.Display.Color.HexStringToColor(tokens.palette.projectile).color;
    const shaft = scene.add.rectangle(definition.reach / 2, 0, definition.reach, 5, colour);
    const handle = scene.add.rectangle(3, 0, 12, 11, colour, 0.85);
    const upperJaw = scene.add.rectangle(definition.reach, -5, 15, 4, colour).setRotation(-0.45);
    const lowerJaw = scene.add.rectangle(definition.reach, 5, 15, 4, colour).setRotation(0.45);
    this.add([shaft, handle, upperJaw, lowerJaw]);
    this.setRotation(angle).setDepth(45).setScale(0.08, 1);
    scene.add.existing(this);

    scene.tweens.add({
      targets: this,
      scaleX: 1,
      duration: definition.extendMs,
      ease: "Quad.Out",
      onComplete: () => {
        scene.tweens.add({
          targets: this,
          scaleX: 0.08,
          alpha: 0.65,
          duration: definition.retractMs,
          ease: "Quad.In",
          onComplete: () => {
            this.destroy();
            onComplete();
          },
        });
      },
    });
  }
}
