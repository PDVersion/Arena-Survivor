import Phaser from "phaser";
import type { ThemeManifest } from "../core/archetypes/contracts";
import type { RunState } from "../state/run-state";
import { selectRunSummaryValues } from "../state/statistics";

export class RunEndOverlay {
  private readonly scene: Phaser.Scene;
  private readonly theme: ThemeManifest;
  private container?: Phaser.GameObjects.Container;
  private endingState?: RunState;
  private restartCallback?: () => void;
  private restartBounds?: Phaser.Geom.Rectangle;

  constructor(scene: Phaser.Scene, theme: ThemeManifest) {
    this.scene = scene;
    this.theme = theme;
  }

  show(state: RunState, onRestart: () => void): void {
    const status = state.status;
    if (status !== "dead" && status !== "complete") return;
    this.hide();
    this.endingState = state;
    this.restartCallback = onRestart;
    const { width, height } = this.scene.scale;
    const palette = this.theme.tokens.palette;
    const vocabulary = this.theme.copy.vocabulary;
    const title = status === "dead" ? vocabulary.deathTitle : vocabulary.completeTitle;
    const message = status === "dead" ? vocabulary.deathMessage : vocabulary.completeMessage;
    const summary = selectRunSummaryValues(state, vocabulary);
    const background = Phaser.Display.Color.HexStringToColor(palette.background).color;
    const floor = Phaser.Display.Color.HexStringToColor(palette.floor).color;
    const accent = Phaser.Display.Color.HexStringToColor(palette.accent).color;
    const panelHeight = Math.min(650, height - 24);
    const panel = this.scene.add.rectangle(width / 2, height / 2, Math.min(900, width - 32), panelHeight, background, 1)
      .setStrokeStyle(4, accent);
    const top = height / 2 - panelHeight / 2;
    const heading = this.scene.add.text(width / 2, top + 45, title, {
      color: palette.accent,
      fontFamily: "Georgia, serif",
      fontSize: "34px",
      fontStyle: "bold",
      align: "center",
    }).setOrigin(0.5);
    const detail = this.scene.add.text(width / 2, top + 90, message, {
      color: palette.text,
      fontFamily: "Georgia, serif",
      fontSize: "20px",
      align: "center",
      wordWrap: { width: Math.min(580, width - 80) },
    }).setOrigin(0.5);
    const summaryTitle = this.scene.add.text(width / 2, top + 132, summary.title, {
      color: palette.accent,
      fontFamily: "Georgia, serif",
      fontSize: "22px",
      fontStyle: "bold",
    }).setOrigin(0.5);
    const columnWidth = Math.min(390, (width - 90) / 2);
    const metrics = this.scene.add.text(width / 2 - columnWidth - 10, top + 165, summary.metrics.join("\n"), {
      color: palette.text,
      fontFamily: "Georgia, serif",
      fontSize: "17px",
      lineSpacing: 7,
    });
    const damage = this.scene.add.text(width / 2 + 10, top + 165, `${vocabulary.damageBreakdown}\n${summary.damage.join("\n")}`, {
      color: palette.text,
      fontFamily: "Georgia, serif",
      fontSize: "17px",
      lineSpacing: 5,
    });
    const buttonY = top + panelHeight - 48;
    const button = this.scene.add.rectangle(width / 2, buttonY, 260, 56, floor, 1)
      .setStrokeStyle(2, accent)
      .setInteractive({ useHandCursor: true });
    const action = this.scene.add.text(width / 2, buttonY, `${vocabulary.restartAction} · R / Enter`, {
      color: palette.text,
      fontFamily: "Georgia, serif",
      fontSize: "20px",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.restartBounds = new Phaser.Geom.Rectangle(width / 2 - 130, buttonY - 28, 260, 56);
    this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
    this.container = this.scene.add.container(0, 0, [panel, heading, detail, summaryTitle, metrics, damage, button, action])
      .setScrollFactor(0, 0, true)
      .setDepth(1100);
  }

  resize(onRestart: () => void): void {
    if (this.endingState) this.show(this.endingState, onRestart);
  }

  hide(): void {
    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
    this.container?.destroy(true);
    this.container = undefined;
    this.endingState = undefined;
    this.restartCallback = undefined;
    this.restartBounds = undefined;
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.restartBounds?.contains(pointer.x, pointer.y)) this.restartCallback?.();
  }
}
