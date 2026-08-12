import type Phaser from "phaser";
import type { ThemeManifest } from "../core/archetypes/contracts";
import type { RunState } from "../state/run-state";
import { selectHudValues } from "../state/statistics";

export class Hud {
  private readonly scene: Phaser.Scene;
  private readonly theme: ThemeManifest;
  private readonly left: Phaser.GameObjects.Text;
  private readonly right: Phaser.GameObjects.Text;
  private readonly status: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, theme: ThemeManifest) {
    this.scene = scene;
    this.theme = theme;
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      color: theme.tokens.palette.text,
      fontFamily: "Georgia, serif",
      fontSize: "18px",
      stroke: theme.tokens.palette.background,
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
      color: theme.tokens.palette.accent,
      fontStyle: "bold",
      fontSize: "20px",
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(900);
    this.resize();
  }

  update(state: RunState): void {
    const values = selectHudValues(state);
    const vocabulary = this.theme.copy.vocabulary;
    this.left.setText([
      `${vocabulary.health}: ${values.health}`,
      `${vocabulary.experience}: ${values.experience}`,
      `${vocabulary.level}: ${values.level}`,
    ]);
    this.right.setText([
      `${vocabulary.time}: ${values.time}`,
      `${vocabulary.kills}: ${values.kills}`,
      `${vocabulary.enemies}: ${values.enemies}`,
    ]);
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
  }
}
