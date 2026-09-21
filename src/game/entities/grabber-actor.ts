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
    const shaftColour = Phaser.Display.Color.HexStringToColor(tokens.palette.text).color;
    const accentColour = Phaser.Display.Color.HexStringToColor(tokens.palette.player).color;
    const outlineColour = Phaser.Display.Color.HexStringToColor(tokens.palette.background).color;
    const outline = scene.add.rectangle(definition.reach / 2, 0, definition.reach + 4, 11, outlineColour, 0.9);
    const shaft = scene.add.rectangle(definition.reach / 2, 0, definition.reach, 7, shaftColour);
    const handle = scene.add.rectangle(3, 0, 14, 13, accentColour, 0.95);
    const contact = scene.add.circle(definition.reach, 0, definition.width / 2, accentColour, 0.18)
      .setStrokeStyle(2, accentColour, 0.95)
      .setAlpha(0);
    const upperJaw = scene.add.rectangle(definition.reach, -6, 18, 5, accentColour).setRotation(-0.45);
    const lowerJaw = scene.add.rectangle(definition.reach, 6, 18, 5, accentColour).setRotation(0.45);
    this.add([outline, shaft, handle, contact, upperJaw, lowerJaw]);
    this.setRotation(angle).setDepth(45).setScale(0.08, 1);
    scene.add.existing(this);

    scene.tweens.add({
      targets: this,
      scaleX: 1,
      duration: definition.extendMs,
      ease: "Quad.Out",
      onComplete: () => {
        contact.setAlpha(1);
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
