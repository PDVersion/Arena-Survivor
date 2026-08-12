import Phaser from "phaser";
import type { ThemeManifest } from "../core/archetypes/contracts";
import type { RunStatus } from "../state/run-state";

export class RunEndOverlay {
  private readonly scene: Phaser.Scene;
  private readonly theme: ThemeManifest;
  private container?: Phaser.GameObjects.Container;
  private ending?: "dead" | "complete";
  private restartCallback?: () => void;
  private restartBounds?: Phaser.Geom.Rectangle;

  constructor(scene: Phaser.Scene, theme: ThemeManifest) {
    this.scene = scene;
    this.theme = theme;
  }

  show(status: RunStatus, onRestart: () => void): void {
    if (status !== "dead" && status !== "complete") return;
    this.hide();
    this.ending = status;
    this.restartCallback = onRestart;
    const { width, height } = this.scene.scale;
    const palette = this.theme.tokens.palette;
    const vocabulary = this.theme.copy.vocabulary;
    const title = status === "dead" ? vocabulary.deathTitle : vocabulary.completeTitle;
    const message = status === "dead" ? vocabulary.deathMessage : vocabulary.completeMessage;
    const background = Phaser.Display.Color.HexStringToColor(palette.background).color;
    const floor = Phaser.Display.Color.HexStringToColor(palette.floor).color;
    const accent = Phaser.Display.Color.HexStringToColor(palette.accent).color;
    const panel = this.scene.add.rectangle(width / 2, height / 2, Math.min(660, width - 32), 330, background, 1)
      .setStrokeStyle(4, accent);
    const heading = this.scene.add.text(width / 2, height / 2 - 95, title, {
      color: palette.accent,
      fontFamily: "Georgia, serif",
      fontSize: "34px",
      fontStyle: "bold",
      align: "center",
    }).setOrigin(0.5);
    const detail = this.scene.add.text(width / 2, height / 2 - 25, message, {
      color: palette.text,
      fontFamily: "Georgia, serif",
      fontSize: "20px",
      align: "center",
      wordWrap: { width: Math.min(580, width - 80) },
    }).setOrigin(0.5);
    const button = this.scene.add.rectangle(width / 2, height / 2 + 82, 260, 64, floor, 1)
      .setStrokeStyle(2, accent)
      .setInteractive({ useHandCursor: true });
    const action = this.scene.add.text(width / 2, height / 2 + 82, `${vocabulary.restartAction} · R / Enter`, {
      color: palette.text,
      fontFamily: "Georgia, serif",
      fontSize: "20px",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.restartBounds = new Phaser.Geom.Rectangle(width / 2 - 130, height / 2 + 50, 260, 64);
    this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
    this.container = this.scene.add.container(0, 0, [panel, heading, detail, button, action])
      .setScrollFactor(0, 0, true)
      .setDepth(1100);
  }

  resize(onRestart: () => void): void {
    if (this.ending) this.show(this.ending, onRestart);
  }

  hide(): void {
    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
    this.container?.destroy(true);
    this.container = undefined;
    this.restartCallback = undefined;
    this.restartBounds = undefined;
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.restartBounds?.contains(pointer.x, pointer.y)) this.restartCallback?.();
  }
}
