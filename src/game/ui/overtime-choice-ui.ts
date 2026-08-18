import Phaser from "phaser";
import type { ThemeManifest } from "../core/archetypes/contracts";
import type { RunMode } from "../state/run-state";

export type OvertimeChoice = Exclude<RunMode, "timed">;

/**
 * The decision at the end of the timer.
 *
 * The run used to stop dead on the last tick and show a summary, which cut off
 * a build at exactly the point it had finished assembling itself and ended a
 * fight mid-swing. Neither option here is "you lose": endless removes the limit
 * and plays until the player actually dies, while clearing stops new arrivals
 * so the run finishes on an empty field instead of a freeze-frame.
 *
 * Laid out with the same measure-then-place discipline as the level-up cards,
 * so themed copy of any length stays inside its button. See REC-060.
 */
export class OvertimeChoiceUi {
  private readonly scene: Phaser.Scene;
  private readonly theme: ThemeManifest;
  private container?: Phaser.GameObjects.Container;
  private bounds: { readonly choice: OvertimeChoice; readonly rect: Phaser.Geom.Rectangle }[] = [];
  private callback?: (choice: OvertimeChoice) => void;

  constructor(scene: Phaser.Scene, theme: ThemeManifest) {
    this.scene = scene;
    this.theme = theme;
  }

  get isOpen(): boolean {
    return this.container !== undefined;
  }

  show(liveEnemies: number, onChoose: (choice: OvertimeChoice) => void): void {
    this.hide();
    this.callback = onChoose;
    const { width, height } = this.scene.scale;
    const palette = this.theme.tokens.palette;
    const copy = this.theme.copy.vocabulary;
    const background = Phaser.Display.Color.HexStringToColor(palette.background).color;
    const accent = Phaser.Display.Color.HexStringToColor(palette.accent).color;
    const floor = Phaser.Display.Color.HexStringToColor(palette.floor).color;

    const panelWidth = Math.min(760, width - 32);
    const panelHeight = 330;
    const panel = this.scene.add
      .rectangle(width / 2, height / 2, panelWidth, panelHeight, background, 1)
      .setStrokeStyle(3, accent);
    const top = height / 2 - panelHeight / 2;

    const children: Phaser.GameObjects.GameObject[] = [
      panel,
      this.scene.add
        .text(width / 2, top + 40, copy.timeUpTitle, {
          color: palette.accent,
          fontFamily: "Georgia, serif",
          fontSize: "30px",
          fontStyle: "bold",
        })
        .setOrigin(0.5),
      this.scene.add
        .text(width / 2, top + 82, copy.timeUpMessage, {
          align: "center",
          color: palette.text,
          fontFamily: "Georgia, serif",
          fontSize: "17px",
          wordWrap: { width: panelWidth - 80 },
        })
        .setOrigin(0.5)
        .setAlpha(0.85),
    ];

    // The clearing option's cost is the crowd still on the field, so it says how
    // many rather than making the player guess whether it is a formality.
    const options: readonly { choice: OvertimeChoice; label: string; detail: string }[] = [
      { choice: "endless", label: copy.continueEndless, detail: copy.continueEndlessHint },
      {
        choice: "clearing",
        label: copy.clearTheField,
        detail: `${copy.clearTheFieldHint} · ${liveEnemies}`,
      },
    ];

    this.bounds = [];
    const buttonWidth = (panelWidth - 96) / 2;
    options.forEach((option, index) => {
      const centreX = width / 2 + (index === 0 ? -1 : 1) * (buttonWidth / 2 + 16);
      const centreY = top + 190;
      children.push(
        this.scene.add
          .rectangle(centreX, centreY, buttonWidth, 76, floor, 1)
          .setStrokeStyle(3, accent)
          .setInteractive({ useHandCursor: true }),
        this.scene.add
          .text(centreX, centreY - 14, `${index + 1}. ${option.label}`, {
            align: "center",
            color: palette.accent,
            fontFamily: "Georgia, serif",
            fontSize: "20px",
            fontStyle: "bold",
            wordWrap: { width: buttonWidth - 24 },
          })
          .setOrigin(0.5),
        this.scene.add
          .text(centreX, centreY + 20, option.detail, {
            align: "center",
            color: palette.text,
            fontFamily: "Georgia, serif",
            fontSize: "14px",
            wordWrap: { width: buttonWidth - 24 },
          })
          .setOrigin(0.5)
          .setAlpha(0.75),
      );
      this.bounds.push({
        choice: option.choice,
        rect: new Phaser.Geom.Rectangle(centreX - buttonWidth / 2, centreY - 38, buttonWidth, 76),
      });
    });

    children.push(
      this.scene.add
        .text(width / 2, top + panelHeight - 28, copy.timeUpHint, {
          color: palette.text,
          fontFamily: "Georgia, serif",
          fontSize: "15px",
        })
        .setOrigin(0.5)
        .setAlpha(0.7),
    );

    this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
    this.container = this.scene.add.container(0, 0, children).setScrollFactor(0, 0, true).setDepth(1080);
  }

  hide(): void {
    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
    this.container?.destroy(true);
    this.container = undefined;
    this.bounds = [];
    this.callback = undefined;
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const hit = this.bounds.find((entry) => entry.rect.contains(pointer.x, pointer.y));
    if (hit) this.callback?.(hit.choice);
  }
}
