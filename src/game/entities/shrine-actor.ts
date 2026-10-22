import Phaser from "phaser";
import { addWorldText } from "../ui/ui-text";
import type { ShrineDefinition, ThemeTokens } from "../core/archetypes/contracts";
import { createSpriteView, type SpriteView } from "../systems/sprites/sprite-view";

export class ShrineActor extends Phaser.GameObjects.Star {
  readonly definition: ShrineDefinition;
  activated = false;
  /** Present only when this pack has a sprite for the shrine. */
  readonly view?: SpriteView;
  private readonly interactionPrompt: string;
  private readonly label: Phaser.GameObjects.Text;
  private readonly prompt: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    definition: ShrineDefinition,
    tokens: ThemeTokens,
    label: string,
    interactionPrompt: string,
    labelScale = 1,
  ) {
    const colour = Phaser.Display.Color.HexStringToColor(
      tokens.palette[definition.presentationToken],
    ).color;
    super(scene, x, y, 6, definition.radius * 0.5, definition.radius, colour, 1);
    this.definition = definition;
    scene.add.existing(this);
    this.setDepth(15);
    this.interactionPrompt = interactionPrompt;
    this.label = addWorldText(scene, x, y - 48, label, {
      color: tokens.palette.text,
      fontFamily: "Georgia, serif",
      fontSize: "16px",
      stroke: tokens.palette.background,
      strokeThickness: 4,
    }).setOrigin(0.5).setScale(labelScale).setDepth(16);
    this.prompt = addWorldText(scene, x, y + 42, interactionPrompt, {
      color: tokens.palette.accent,
      fontFamily: "Georgia, serif",
      fontSize: "15px",
      backgroundColor: tokens.palette.background,
      padding: { x: 8, y: 4 },
      wordWrap: { width: 320 },
      fontStyle: "bold",
      stroke: tokens.palette.background,
      strokeThickness: 4,
    }).setOrigin(0.5).setScale(labelScale).setDepth(60).setVisible(false);
    this.view = createSpriteView(this, tokens, definition.id, { diameter: definition.radius * 2 });
    this.once(Phaser.GameObjects.Events.DESTROY, () => { this.label.destroy(); this.prompt.destroy(); });
  }

  get textResolution(): number { return this.prompt.style.resolution; }

  setInRange(inRange: boolean, detail?: string): void {
    const visible = inRange && !this.activated;
    this.prompt.setVisible(visible);
    if (!visible) return;
    const text = detail ? `${this.interactionPrompt}\n${detail}` : this.interactionPrompt;
    if (this.prompt.text !== text) this.prompt.setText(text);
    const view = this.scene.cameras.main.worldView;
    const halfWidth = this.prompt.displayWidth / 2, halfHeight = this.prompt.displayHeight / 2;
    this.prompt.setPosition(
      Phaser.Math.Clamp(this.x, view.left + halfWidth + 8, view.right - halfWidth - 8),
      Phaser.Math.Clamp(this.y + 42, view.top + halfHeight + 8, view.bottom - halfHeight - 8),
    );
  }

  activate(): void {
    if (this.activated) return;
    this.activated = true;
    this.prompt.setVisible(false);
    // The white fill is the primitive's "spent" cue. A sprite keeps its art
    // and reads the same event from the spin below, which the view mirrors
    // because it copies the whole transform rather than only the position.
    if (!this.view) this.setFillStyle(0xffffff);
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
