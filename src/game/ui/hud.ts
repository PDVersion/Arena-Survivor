import Phaser from "phaser";
import type { ThemeManifest } from "../core/archetypes/contracts";
import type { RunState } from "../state/run-state";
import { selectHudValues } from "../state/statistics";
import { addUiText, configureUiContainer, uiViewport } from "./ui-text";

export interface HudExtras {
  /** Discrete elapsed-time escalation step. */
  readonly threatStep: number;
  /** Kills inside the rolling chain window. */
  readonly killChain: number;
  /** Fraction of the current level's requirement earned, `0` to `1`. */
  readonly levelProgress: number;
}

export class Hud {
  private readonly scene: Phaser.Scene;
  private readonly theme: ThemeManifest;
  private readonly healthLabel: Phaser.GameObjects.Text;
  private readonly experienceLabel: Phaser.GameObjects.Text;
  private readonly right: Phaser.GameObjects.Text;
  private readonly status: Phaser.GameObjects.Text;
  private readonly healthTrack: Phaser.GameObjects.Rectangle;
  private readonly healthFill: Phaser.GameObjects.Rectangle;
  private readonly xpTrack: Phaser.GameObjects.Rectangle;
  private readonly xpFill: Phaser.GameObjects.Rectangle;
  private readonly levelLabel: Phaser.GameObjects.Text;
  private readonly container: Phaser.GameObjects.Container;
  private readonly barLeft: number;
  private readonly uiTop: number;

  private static readonly BAR_WIDTH = 200;
  private static readonly BAR_HEIGHT = 14;
  private static readonly HEALTH_BAR_Y = 30;
  private static readonly XP_BAR_Y = 60;
  /** Text sits clear of the bar it belongs to, on the same line. */

  constructor(scene: Phaser.Scene, theme: ThemeManifest) {
    this.scene = scene;
    this.theme = theme;
    const viewport = uiViewport(scene);
    this.barLeft = viewport.left + 20;
    this.uiTop = viewport.top;
    const palette = theme.tokens.palette;
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      color: palette.text,
      fontFamily: "Georgia, serif",
      fontSize: "18px",
      stroke: palette.background,
      strokeThickness: 5,
      lineSpacing: 6,
    };
    // Bar first, number beside it: the bar is the glance and the number is the
    // detail, so they read left to right in that order on one line each.
    this.healthLabel = addUiText(scene, this.barLeft + Hud.BAR_WIDTH + 16, this.uiTop + Hud.HEALTH_BAR_Y, "", style)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(901);
    this.experienceLabel = addUiText(scene, this.barLeft + Hud.BAR_WIDTH + 16, this.uiTop + Hud.XP_BAR_Y, "", style)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(901);
    this.right = addUiText(scene, 0, this.uiTop + 18, "", { ...style, align: "right" })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(900);
    this.status = addUiText(scene, 0, this.uiTop + 18, "", {
      ...style,
      color: palette.accent,
      fontStyle: "bold",
      fontSize: "20px",
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(900);

    // Real bars rather than fractions: both are glanceable mid-fight, while the
    // exact numbers stay in the text above for when they are actually needed.
    const trackColour = Phaser.Display.Color.HexStringToColor(palette.grid).color;
    this.healthTrack = this.addTrack(this.uiTop + Hud.HEALTH_BAR_Y, trackColour);
    this.healthFill = this.addFill(
      this.uiTop + Hud.HEALTH_BAR_Y,
      Phaser.Display.Color.HexStringToColor(palette.health).color,
    );
    this.xpTrack = this.addTrack(this.uiTop + Hud.XP_BAR_Y, trackColour);
    this.xpFill = this.addFill(
      this.uiTop + Hud.XP_BAR_Y,
      Phaser.Display.Color.HexStringToColor(palette.pickup).color,
    );
    this.levelLabel = addUiText(scene, this.barLeft, this.uiTop + Hud.XP_BAR_Y + 22, "", {
      ...style,
      fontSize: "16px",
      fontStyle: "bold",
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(901);

    this.container = configureUiContainer(scene, scene.add.container(0, 0, [
      this.healthTrack,
      this.healthFill,
      this.xpTrack,
      this.xpFill,
      this.healthLabel,
      this.experienceLabel,
      this.levelLabel,
      this.right,
      this.status,
    ])).setDepth(900);
    this.resize();
  }

  private addTrack(y: number, colour: number): Phaser.GameObjects.Rectangle {
    return this.scene.add
      .rectangle(this.barLeft, y, Hud.BAR_WIDTH, Hud.BAR_HEIGHT, colour, 0.85)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(900);
  }

  private addFill(y: number, colour: number): Phaser.GameObjects.Rectangle {
    return this.scene.add
      .rectangle(this.barLeft, y, 0, Hud.BAR_HEIGHT, colour, 1)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(901);
  }

  update(state: RunState, extras: HudExtras): void {
    const values = selectHudValues(state);
    const vocabulary = this.theme.copy.vocabulary;
    this.healthLabel.setText(`${vocabulary.health}: ${values.health}`);
    this.experienceLabel.setText(`${vocabulary.experience}: ${values.experience}`);

    const right = [
      `${vocabulary.time}: ${values.time}`,
      `${vocabulary.kills}: ${values.kills}`,
      `${vocabulary.enemies}: ${values.enemies}`,
      `${vocabulary.chaos}: ×${state.world.chaos.toFixed(1)}`,
      `${this.theme.copy.world.threat}: ${extras.threatStep}`,
    ];
    // Only worth showing while a chain is actually running.
    if (extras.killChain > 1) {
      right.push(`${vocabulary.largestKillChain}: ${extras.killChain}`);
    }
    this.right.setText(right);

    const maxHealth = state.player.stats.maxHealth;
    const healthProgress = maxHealth > 0 ? state.player.health / maxHealth : 0;
    this.healthFill.width = Hud.BAR_WIDTH * Math.min(1, Math.max(0, healthProgress));
    this.xpFill.width = Hud.BAR_WIDTH * Math.min(1, Math.max(0, extras.levelProgress));
    this.levelLabel.setText(`${vocabulary.level} ${values.level}`);
    this.status.setText(state.status === "paused" ? vocabulary.paused : "");
  }

  resize(): void {
    const viewport = uiViewport(this.scene);
    this.right.setPosition(viewport.left + viewport.width - 20, viewport.top + 18);
    this.status.setPosition(this.scene.scale.width / 2, viewport.top + 18);
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
