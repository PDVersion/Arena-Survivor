import Phaser from "phaser";
import type { ThemeManifest, UpgradeDefinition } from "../core/archetypes/contracts";

export class LevelUpChoiceUi {
  private readonly scene: Phaser.Scene;
  private readonly theme: ThemeManifest;
  private container?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, theme: ThemeManifest) {
    this.scene = scene;
    this.theme = theme;
  }

  show(choices: readonly UpgradeDefinition[], onSelect: (choice: UpgradeDefinition) => void): void {
    this.hide();
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

    const children: Phaser.GameObjects.GameObject[] = [panel, title];
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
      button.on(Phaser.Input.Events.POINTER_DOWN, () => onSelect(choice));
      children.push(button, label);
    });

    this.container = this.scene.add.container(0, 0, children).setScrollFactor(0).setDepth(1000);
  }

  hide(): void {
    this.container?.destroy(true);
    this.container = undefined;
  }
}
