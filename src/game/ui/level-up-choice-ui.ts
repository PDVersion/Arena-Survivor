import Phaser from "phaser";
import type { ThemeManifest, UpgradeDefinition, UpgradeRarity } from "../core/archetypes/contracts";
import type { UpgradeDescription } from "../systems/upgrades/describe-upgrade";

export interface LevelUpView {
  readonly descriptions: readonly UpgradeDescription[];
  /** Choices still queued after this one, so stacked pauses are legible. */
  readonly pendingAfterThis: number;
  readonly showDetail: boolean;
}

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

  private rarityColour(rarity: UpgradeRarity): number {
    const palette = this.theme.tokens.palette;
    const hex = rarity === "epic"
      ? palette.overcritical
      : rarity === "rare" ? palette.critical : palette.grid;
    return Phaser.Display.Color.HexStringToColor(hex).color;
  }

  show(
    choices: readonly UpgradeDefinition[],
    view: LevelUpView,
    onSelect: (choice: UpgradeDefinition) => void,
  ): void {
    this.hide();
    this.choices = choices;
    this.choiceCallback = onSelect;
    const { width, height } = this.scene.scale;
    const palette = this.theme.tokens.palette;
    const backgroundColour = Phaser.Display.Color.HexStringToColor(palette.background).color;
    const floorColour = Phaser.Display.Color.HexStringToColor(palette.floor).color;

    const panelWidth = Math.min(820, width - 32);
    const panelHeight = Math.min(560, height - 32);
    const panel = this.scene.add
      .rectangle(width / 2, height / 2, panelWidth, panelHeight, backgroundColour, 1)
      .setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(palette.accent).color);
    const top = height / 2 - panelHeight / 2;

    const title = this.scene.add
      .text(width / 2, top + 38, this.theme.copy.levelUpTitle, {
        color: palette.accent,
        fontFamily: "Georgia, serif",
        fontSize: "32px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    title.setScale(0.85);
    this.scene.tweens.add({ targets: title, scale: 1, duration: 220, ease: "Back.Out" });

    const children: Phaser.GameObjects.GameObject[] = [panel, title];

    if (view.pendingAfterThis > 0) {
      children.push(
        this.scene.add
          .text(width / 2, top + 70, `+${view.pendingAfterThis} more`, {
            color: palette.text,
            fontFamily: "Georgia, serif",
            fontSize: "16px",
          })
          .setOrigin(0.5)
          .setAlpha(0.75),
      );
    }

    const bounds: Phaser.Geom.Rectangle[] = [];
    const cardWidth = Math.min(720, width - 72);
    const cardHeight = 128;

    choices.forEach((choice, index) => {
      const description = view.descriptions[index];
      const y = top + 118 + index * (cardHeight + 12) + cardHeight / 2;
      const button = this.scene.add
        .rectangle(width / 2, y, cardWidth, cardHeight, floorColour, 1)
        .setStrokeStyle(3, this.rarityColour(choice.rarity))
        .setInteractive({ useHandCursor: true });

      const left = width / 2 - cardWidth / 2 + 18;
      const heading = this.scene.add.text(left, y - cardHeight / 2 + 12, `${index + 1}. ${description?.name ?? choice.id}`, {
        color: palette.accent,
        fontFamily: "Georgia, serif",
        fontSize: "21px",
        fontStyle: "bold",
      });

      // Badges are identity, not detail, so they show regardless of the toggle.
      const badge = description?.isNew
        ? "NEW"
        : `Lv ${description?.level ?? 0}→${description?.nextLevel ?? 1}`;
      const badgeText = this.scene.add
        .text(width / 2 + cardWidth / 2 - 18, y - cardHeight / 2 + 14, badge, {
          color: description?.isNew ? palette.overcritical : palette.text,
          fontFamily: "Georgia, serif",
          fontSize: "17px",
          fontStyle: "bold",
        })
        .setOrigin(1, 0);

      const summary = this.scene.add.text(left, y - cardHeight / 2 + 44, description?.summary ?? "", {
        color: palette.text,
        fontFamily: "Georgia, serif",
        fontSize: "16px",
        wordWrap: { width: cardWidth - 36 },
      }).setAlpha(0.85);

      children.push(button, heading, badgeText, summary);

      if (view.showDetail && description && description.lines.length > 0) {
        const detail = description.lines
          .slice(0, 3)
          .map((line) => {
            const change = line.from === undefined ? line.to : `${line.from}  →  ${line.to}`;
            return `${line.label}   ${change}${line.delta ? `   (${line.delta})` : ""}`;
          })
          .join("\n");
        children.push(
          this.scene.add.text(left, y - cardHeight / 2 + 74, detail, {
            color: palette.pickup,
            fontFamily: "Georgia, serif",
            fontSize: "15px",
            lineSpacing: 3,
          }),
        );
      }

      bounds.push(new Phaser.Geom.Rectangle(width / 2 - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight));
    });

    this.choiceBounds = bounds;
    this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
    this.container = this.scene.add.container(0, 0, children).setScrollFactor(0, 0, true).setDepth(1000);
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
