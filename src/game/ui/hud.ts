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
  private readonly healthTrack: Phaser.GameObjects.Rectangle;
  private readonly healthFill: Phaser.GameObjects.Rectangle;
  private readonly xpTrack: Phaser.GameObjects.Rectangle;
  private readonly xpFill: Phaser.GameObjects.Rectangle;
  private readonly levelLabel: Phaser.GameObjects.Text;

  private static readonly BAR_WIDTH = 220;
  private static readonly BAR_HEIGHT = 12;
  private static readonly HEALTH_BAR_Y = 88;
  private static readonly XP_BAR_Y = 112;

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

    // Real bars rather than fractions: both are glanceable mid-fight, while the
    // exact numbers stay in the text above for when they are actually needed.
    const trackColour = Phaser.Display.Color.HexStringToColor(palette.grid).color;
    this.healthTrack = this.addTrack(Hud.HEALTH_BAR_Y, trackColour);
    this.healthFill = this.addFill(
      Hud.HEALTH_BAR_Y,
      Phaser.Display.Color.HexStringToColor(palette.health).color,
    );
    this.xpTrack = this.addTrack(Hud.XP_BAR_Y, trackColour);
    this.xpFill = this.addFill(
      Hud.XP_BAR_Y,
      Phaser.Display.Color.HexStringToColor(palette.pickup).color,
    );
    this.levelLabel = scene.add.text(20 + Hud.BAR_WIDTH + 12, Hud.XP_BAR_Y, "", {
      ...style,
      fontStyle: "bold",
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(901);

    this.resize();
  }

  private addTrack(y: number, colour: number): Phaser.GameObjects.Rectangle {
    return this.scene.add
      .rectangle(20, y, Hud.BAR_WIDTH, Hud.BAR_HEIGHT, colour, 0.85)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(900);
  }

  private addFill(y: number, colour: number): Phaser.GameObjects.Rectangle {
    return this.scene.add
      .rectangle(20, y, 0, Hud.BAR_HEIGHT, colour, 1)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(901);
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

    const maxHealth = state.player.stats.maxHealth;
    const healthProgress = maxHealth > 0 ? state.player.health / maxHealth : 0;
    this.healthFill.width = Hud.BAR_WIDTH * Math.min(1, Math.max(0, healthProgress));
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
    this.healthTrack.destroy();
    this.healthFill.destroy();
    this.xpTrack.destroy();
    this.xpFill.destroy();
    this.levelLabel.destroy();
  }
}
