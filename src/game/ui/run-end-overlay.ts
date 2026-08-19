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
  private shownTitle?: string;

  /** The heading currently on screen, so a test can read which ending it is. */
  get title(): string | undefined {
    return this.shownTitle;
  }

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
    // A run can now end three ways, and the summary should say which. Clearing
    // outlives the timer, so "held the site for the full shift" would be wrong.
    const cleared = status === "complete" && state.mode === "clearing";
    const title = status === "dead"
      ? vocabulary.deathTitle
      : cleared ? vocabulary.clearedTitle : vocabulary.completeTitle;
    const message = status === "dead"
      ? vocabulary.deathMessage
      : cleared ? vocabulary.clearedMessage : vocabulary.completeMessage;
    const summary = selectRunSummaryValues(state, vocabulary, this.theme.copy.content);
    const background = Phaser.Display.Color.HexStringToColor(palette.background).color;
    const floor = Phaser.Display.Color.HexStringToColor(palette.floor).color;
    const accent = Phaser.Display.Color.HexStringToColor(palette.accent).color;
    const panelHeight = Math.min(650, height - 24);
    const panel = this.scene.add.rectangle(width / 2, height / 2, Math.min(900, width - 32), panelHeight, background, 1)
      .setStrokeStyle(4, accent);
    const top = height / 2 - panelHeight / 2;
    this.shownTitle = title;
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
    const causeText = summary.deathCause
      ? this.scene.add.text(width / 2, top + 116, summary.deathCause, {
          color: palette.critical,
          fontFamily: "Georgia, serif",
          fontSize: "18px",
          fontStyle: "italic",
          align: "center",
          wordWrap: { width: Math.min(620, width - 80) },
        }).setOrigin(0.5)
      : null;
    const summaryTitle = this.scene.add.text(width / 2, top + 148, summary.title, {
      color: palette.accent,
      fontFamily: "Georgia, serif",
      fontSize: "22px",
      fontStyle: "bold",
    }).setOrigin(0.5);
    // Three columns: metrics, damage ledger, and the upgrade tally. The tally
    // is capped and summarised rather than paged, so a long build never pushes
    // the restart button off the panel.
    const columnWidth = Math.min(270, (width - 110) / 3);
    const columnStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      color: palette.text,
      fontFamily: "Georgia, serif",
      fontSize: "16px",
      lineSpacing: 5,
      wordWrap: { width: columnWidth },
    };
    const left = width / 2 - columnWidth * 1.5 - 20;
    const metrics = this.scene.add.text(left, top + 182, summary.metrics.join("\n"), columnStyle);
    const damage = this.scene.add.text(
      left + columnWidth + 20,
      top + 182,
      `${vocabulary.damageBreakdown}\n${summary.damage.join("\n")}`,
      columnStyle,
    );

    const maxUpgradeRows = 12;
    const shown = summary.upgrades.slice(0, maxUpgradeRows);
    const hidden = summary.upgrades.length - shown.length;
    const upgradeLines = summary.upgrades.length === 0
      ? ["—"]
      : hidden > 0 ? [...shown, `+${hidden} more`] : shown;
    const upgrades = this.scene.add.text(
      left + (columnWidth + 20) * 2,
      top + 182,
      `${summary.upgradesTitle}\n${upgradeLines.join("\n")}`,
      columnStyle,
    );
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
    const parts = [panel, heading, detail, summaryTitle, metrics, damage, upgrades, button, action];
    if (causeText) parts.splice(3, 0, causeText);
    this.container = this.scene.add.container(0, 0, parts)
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
    this.shownTitle = undefined;
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.restartBounds?.contains(pointer.x, pointer.y)) this.restartCallback?.();
  }
}
