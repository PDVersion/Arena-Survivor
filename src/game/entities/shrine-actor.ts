import Phaser from "phaser";
import type { ShrineDefinition, ThemeTokens } from "../core/archetypes/contracts";

export class ShrineActor extends Phaser.GameObjects.Star {
  readonly definition: ShrineDefinition;
  activated = false;
  private readonly prompt: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    definition: ShrineDefinition,
    tokens: ThemeTokens,
    label: string,
    interactionPrompt: string,
  ) {
    const colour = Phaser.Display.Color.HexStringToColor(
      tokens.palette[definition.presentationToken],
    ).color;
    super(scene, x, y, 6, definition.radius * 0.5, definition.radius, colour, 1);
    this.definition = definition;
    scene.add.existing(this);
    this.setDepth(15);
    scene.add.text(x, y - 48, label, {
      color: tokens.palette.text,
      fontFamily: "Georgia, serif",
      fontSize: "16px",
      stroke: tokens.palette.background,
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(16);
    this.prompt = scene.add.text(x, y + 42, interactionPrompt, {
      color: tokens.palette.accent,
      fontFamily: "Georgia, serif",
      fontSize: "17px",
      fontStyle: "bold",
      stroke: tokens.palette.background,
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(16).setVisible(false);
  }

  setInRange(inRange: boolean): void {
    this.prompt.setVisible(inRange && !this.activated);
  }

  activate(): void {
    if (this.activated) return;
    this.activated = true;
    this.prompt.setVisible(false);
    this.setFillStyle(0xffffff);
    this.scene.tweens.add({
      targets: this,
      angle: 180,
      scale: 1.5,
      duration: 260,
      yoyo: true,
      ease: "Quad.Out",
    });
  }
}
