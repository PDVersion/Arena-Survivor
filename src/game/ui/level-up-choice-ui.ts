import Phaser from "phaser";
import type { ThemeManifest, UpgradeDefinition } from "../core/archetypes/contracts";

export class LevelUpChoiceUi {
  private readonly scene: Phaser.Scene;
  private readonly theme: ThemeManifest;
  private container?: Phaser.GameObjects.Container;
  private choices: readonly UpgradeDefinition[] = [];
  private choiceBounds: readonly Phaser.Geom.Rectangle[] = [];
  private choiceCallback?: (choice: UpgradeDefinition) => void;

  constructor(scene: Phaser.Scene, theme: ThemeManifest) {
    this.scene = scene;
    this.theme = theme;
  }

  show(choices: readonly UpgradeDefinition[], onSelect: (choice: UpgradeDefinition) => void): void {
    this.hide();
    this.choices = choices;
    this.choiceCallback = onSelect;
    const { width, height } = this.scene.scale;
    const palette = this.theme.tokens.palette;
    const backgroundColour = Phaser.Display.Color.HexStringToColor(palette.background).color;
    const floorColour = Phaser.Display.Color.HexStringToColor(palette.floor).color;
    const panel = this.scene.add
      .rectangle(
        width / 2,
        height / 2,
        Math.min(760, width - 32),
        Math.min(520, height - 32),
        backgroundColour,
        1,
      )
      .setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(palette.accent).color);
    const title = this.scene.add
      .text(width / 2, height / 2 - 205, this.theme.copy.levelUpTitle, {
        color: palette.accent,
        fontFamily: "Georgia, serif",
        fontSize: "32px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    title.setScale(0.85);
    this.scene.tweens.add({
      targets: title,
      scale: 1,
      duration: 220,
      ease: "Back.Out",
    });

    const children: Phaser.GameObjects.GameObject[] = [panel, title];
    const bounds: Phaser.Geom.Rectangle[] = [];
    choices.forEach((choice, index) => {
      const copy = this.theme.copy.content[choice.id];
      const y = height / 2 - 105 + index * 135;
      const button = this.scene.add
        .rectangle(width / 2, y, Math.min(680, width - 72), 105, floorColour, 1)
        .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(palette.grid).color)
        .setInteractive({ useHandCursor: true });
      const label = this.scene.add
        .text(width / 2, y, `${index + 1}. ${copy.name}\n${copy.description}`, {
          align: "center",
          color: palette.text,
          fontFamily: "Georgia, serif",
          fontSize: "19px",
          lineSpacing: 8,
          wordWrap: { width: Math.min(620, width - 110) },
        })
        .setOrigin(0.5);
      const buttonWidth = Math.min(680, width - 72);
      bounds.push(
        new Phaser.Geom.Rectangle(width / 2 - buttonWidth / 2, y - 52.5, buttonWidth, 105),
      );
      children.push(button, label);
    });

    this.choiceBounds = bounds;
    this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
    this.container = this.scene.add
      .container(0, 0, children)
      .setScrollFactor(0, 0, true)
      .setDepth(1000);
  }

  hide(): void {
    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
    this.container?.destroy(true);
    this.container = undefined;
    this.choices = [];
    this.choiceBounds = [];
    this.choiceCallback = undefined;
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const index = this.choiceBounds.findIndex((bounds) => bounds.contains(pointer.x, pointer.y));
    const choice = this.choices[index];
    if (choice) this.choiceCallback?.(choice);
  }
}
