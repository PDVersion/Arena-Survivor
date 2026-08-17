import Phaser from "phaser";
import type { ThemeManifest } from "../core/archetypes/contracts";
import type { RunState } from "../state/run-state";
import { selectHudValues } from "../state/statistics";

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
  private readonly left: Phaser.GameObjects.Text;
  private readonly right: Phaser.GameObjects.Text;
  private readonly status: Phaser.GameObjects.Text;
  private readonly xpTrack: Phaser.GameObjects.Rectangle;
  private readonly xpFill: Phaser.GameObjects.Rectangle;
  private readonly levelLabel: Phaser.GameObjects.Text;

  private static readonly BAR_WIDTH = 220;

  constructor(scene: Phaser.Scene, theme: ThemeManifest) {
    this.scene = scene;
    this.theme = theme;
    const palette = theme.tokens.palette;
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      color: palette.text,
      fontFamily: "Georgia, serif",
      fontSize: "18px",
      stroke: palette.background,
      strokeThickness: 5,
      lineSpacing: 6,
    };
    this.left = scene.add.text(20, 18, "", style).setScrollFactor(0).setDepth(900);
    this.right = scene.add.text(0, 18, "", { ...style, align: "right" })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(900);
    this.status = scene.add.text(0, 18, "", {
      ...style,
      color: palette.accent,
      fontStyle: "bold",
      fontSize: "20px",
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(900);

    // A real bar rather than a fraction: level progress is glanceable.
    const trackColour = Phaser.Display.Color.HexStringToColor(palette.grid).color;
    const fillColour = Phaser.Display.Color.HexStringToColor(palette.pickup).color;
    this.xpTrack = scene.add.rectangle(20, 92, Hud.BAR_WIDTH, 12, trackColour, 0.85)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(900);
    this.xpFill = scene.add.rectangle(20, 92, 0, 12, fillColour, 1)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(901);
    this.levelLabel = scene.add.text(20 + Hud.BAR_WIDTH + 12, 92, "", {
      ...style,
      fontStyle: "bold",
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(901);

    this.resize();
  }

  update(state: RunState, extras: HudExtras): void {
    const values = selectHudValues(state);
    const vocabulary = this.theme.copy.vocabulary;
    this.left.setText([
      `${vocabulary.health}: ${values.health}`,
      `${vocabulary.experience}: ${values.experience}`,
    ]);

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

    this.xpFill.width = Hud.BAR_WIDTH * Math.min(1, Math.max(0, extras.levelProgress));
    this.levelLabel.setText(`${vocabulary.level} ${values.level}`);
    this.status.setText(state.status === "paused" ? vocabulary.paused : "");
  }

  resize(): void {
    this.right.setPosition(this.scene.scale.width - 20, 18);
    this.status.setPosition(this.scene.scale.width / 2, 18);
  }

  destroy(): void {
    this.left.destroy();
    this.right.destroy();
    this.status.destroy();
    this.xpTrack.destroy();
    this.xpFill.destroy();
    this.levelLabel.destroy();
  }
}
