import Phaser from "phaser";
import type { ThemeManifest } from "../core/archetypes/contracts";
import type { RunState } from "../state/run-state";
import { selectRunReview } from "../systems/mastery/run-review";
import { selectRunSummaryValues } from "../state/statistics";
import { addUiText, configureUiContainer, UI_SCALE, uiPointer } from "./ui-text";

export class RunEndOverlay {
  private readonly scene: Phaser.Scene;
  private readonly theme: ThemeManifest;
  private container?: Phaser.GameObjects.Container;
  private endingState?: RunState;
  private restartCallback?: () => void;
  private restartBounds?: Phaser.Geom.Rectangle;
  private shownTitle?: string;
  private newUnlocks: readonly string[] = [];
  private saveWarning?: string;
  private readonly togglePage = (event: KeyboardEvent) => {
    if (!this.endingState || !this.restartCallback) return;
    event.preventDefault();
    this.page = this.page === "review" ? "details" : "review";
    this.show(this.endingState, this.restartCallback);
  };
  private availableWeapons: readonly string[] = [];
  private page: "review" | "details" = "review";
  private pageBounds: { page: "review" | "details"; bounds: Phaser.Geom.Rectangle }[] = [];

  /** The heading currently on screen, so a test can read which ending it is. */
  get title(): string | undefined {
    return this.shownTitle;
  }

  constructor(scene: Phaser.Scene, theme: ThemeManifest) {
    this.scene = scene;
    this.theme = theme;
  }

  show(state: RunState, onRestart: () => void, newUnlocks: readonly string[] = this.newUnlocks, saveWarning: string | undefined = this.saveWarning, availableWeapons: readonly string[] = this.availableWeapons): void {
    this.availableWeapons = availableWeapons;
    this.saveWarning = saveWarning;
    this.newUnlocks = newUnlocks;
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
    const review = selectRunReview(state, this.theme, availableWeapons);
    const summary = selectRunSummaryValues(state, vocabulary, this.theme.copy.content);
    const background = Phaser.Display.Color.HexStringToColor(palette.background).color;
    const floor = Phaser.Display.Color.HexStringToColor(palette.floor).color;
    const accent = Phaser.Display.Color.HexStringToColor(palette.accent).color;
    const panelHeight = Math.min(680, height / UI_SCALE - 24);
    const panel = this.scene.add.rectangle(width / 2, height / 2, Math.min(900, width - 32), panelHeight, background, 1)
      .setStrokeStyle(4, accent);
    const top = height / 2 - panelHeight / 2;
    this.shownTitle = title;
    const heading = addUiText(this.scene, width / 2, top + 32, title, {
      color: palette.accent,
      fontFamily: "Georgia, serif",
      fontSize: "34px",
      fontStyle: "bold",
      align: "center",
    }).setOrigin(0.5);
    const detail = addUiText(this.scene, width / 2, top + 60, newUnlocks.length ? `${message}\n${this.theme.copy.profile.unlockedPrefix}: ${newUnlocks.map((id) => this.theme.copy.content[id as keyof typeof this.theme.copy.content]?.name ?? id).join(", ")}` : message, {
      color: palette.text,
      fontFamily: "Georgia, serif",
      fontSize: "17px",
      align: "center",
      wordWrap: { width: Math.min(780, width - 80) },
    }).setOrigin(0.5, 0);
    const causeText = summary.deathCause
      ? addUiText(this.scene, width / 2, detail.y + detail.height + 2, summary.deathCause, {
          color: palette.critical,
          fontFamily: "Georgia, serif",
          fontSize: "18px",
          fontStyle: "italic",
          align: "center",
          wordWrap: { width: Math.min(620, width - 80) },
        }).setOrigin(0.5, 0)
      : null;
    const tabY = Math.max(top + 148, (causeText ? causeText.y + causeText.height : detail.y + detail.height) + 22);
    const contentTop = tabY + 38;
    const summaryTitle = addUiText(this.scene, width / 2, top + 148, summary.title, {
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
    const metrics = addUiText(this.scene, left, contentTop, summary.metrics.join("\n"), columnStyle);
    const damage = addUiText(this.scene,
      left + columnWidth + 20,
      contentTop,
      `${vocabulary.damageBreakdown}\n${summary.damage.join("\n")}`,
      columnStyle,
    );

    const maxUpgradeRows = 12;
    let shown = summary.upgrades.slice(0, maxUpgradeRows);
    let hidden = summary.upgrades.length - shown.length;
    let upgradeLines = summary.upgrades.length === 0
      ? ["—"]
      : hidden > 0 ? [...shown, `+${hidden} more`] : shown;
    const upgrades = addUiText(this.scene,
      left + (columnWidth + 20) * 2,
      contentTop,
      `${summary.upgradesTitle}\n${upgradeLines.join("\n")}`,
      columnStyle,
    );
    while (upgrades.y + upgrades.height > top + panelHeight - 115 && shown.length > 1) {
      shown = shown.slice(0, -1); hidden = summary.upgrades.length - shown.length;
      upgradeLines = [...shown, `+${hidden} more`];
      upgrades.setText(`${summary.upgradesTitle}\n${upgradeLines.join("\n")}`);
    }
    const reviewParts: Phaser.GameObjects.GameObject[] = [];
    this.pageBounds = [];
    for (const [index, page] of (["review", "details"] as const).entries()) {
      const x = width / 2 + (index - .5) * 210;
      reviewParts.push(this.scene.add.rectangle(x, tabY, 196, 34, this.page === page ? accent : floor, 1));
      reviewParts.push(addUiText(this.scene, x, tabY, `${this.theme.copy.mastery[page]} · Tab`, {
        color: this.page === page ? palette.background : palette.text, fontFamily: "Georgia, serif", fontSize: "18px", fontStyle: "bold",
      }).setOrigin(.5));
      this.pageBounds.push({ page, bounds: new Phaser.Geom.Rectangle(x - 98, tabY - 17, 196, 34) });
    }
    if (this.page === "review") {
      metrics.setVisible(false); damage.setVisible(false); upgrades.setVisible(false);
      const reviewStyle = { ...columnStyle, fontSize: "16px", lineSpacing: 3, wordWrap: { width: 360 } };
      reviewParts.push(addUiText(this.scene, width / 2 - 390, contentTop,
        `${this.theme.copy.mastery.tools}\n${review.tools.join("\n")}`, reviewStyle));
      reviewParts.push(addUiText(this.scene, width / 2 + 10, contentTop,
        `${this.theme.copy.mastery.choices}\n${review.choices.join("\n")}`, reviewStyle));
      const next = `${review.bossDefeated ? this.theme.copy.mastery.bossDefeated + "\n" : ""}${this.theme.copy.mastery.nextExperiment}\n${review.next}`;
      reviewParts.push(addUiText(this.scene, width / 2 - 390, top + panelHeight - (saveWarning ? 235 : 205), next,
        { ...columnStyle, fontSize: "15px", lineSpacing: 3, color: palette.accent, wordWrap: { width: 780 } }));
    }
    const buttonY = top + panelHeight - 48;
    const button = this.scene.add.rectangle(width / 2, buttonY, 260, 56, floor, 1)
      .setStrokeStyle(2, accent)
      .setInteractive({ useHandCursor: true });
    const action = addUiText(this.scene, width / 2, buttonY, `${vocabulary.restartAction} · R / Enter`, {
      color: palette.text,
      fontFamily: "Georgia, serif",
      fontSize: "20px",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.restartBounds = new Phaser.Geom.Rectangle(width / 2 - 130, buttonY - 28, 260, 56);
    this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
    this.scene.input.keyboard?.on("keydown-TAB", this.togglePage);
    summaryTitle.setVisible(false);
    const parts = [panel, heading, detail, summaryTitle, metrics, damage, upgrades, ...reviewParts, button, action];
    if (saveWarning) parts.push(addUiText(this.scene, width / 2, buttonY - 68, saveWarning, {
      color: palette.text, fontFamily: "Georgia, serif", fontSize: "15px", align: "center", wordWrap: { width: Math.min(780, width - 96) },
    }).setOrigin(0.5));
    if (causeText) parts.splice(3, 0, causeText);
    this.container = configureUiContainer(this.scene, this.scene.add.container(0, 0, parts))
      .setDepth(1100);
  }

  resize(onRestart: () => void): void {
    if (this.endingState) this.show(this.endingState, onRestart);
  }

  hide(): void {
    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
    this.scene.input.keyboard?.off("keydown-TAB", this.togglePage);
    this.container?.destroy(true);
    this.container = undefined;
    this.endingState = undefined;
    this.restartCallback = undefined;
    this.restartBounds = undefined;
    this.shownTitle = undefined;
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const point = uiPointer(this.scene, pointer);
    const page = this.pageBounds.find((entry) => entry.bounds.contains(point.x, point.y));
    if (page && this.endingState && this.restartCallback) {
      this.page = page.page; this.show(this.endingState, this.restartCallback); return;
    }
    if (this.restartBounds?.contains(point.x, point.y)) this.restartCallback?.();
  }
}
