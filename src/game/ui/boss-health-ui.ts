import Phaser from "phaser";
import type { ThemeManifest } from "../core/archetypes/contracts";
import { addUiText, configureUiContainer, uiViewport } from "./ui-text";

export interface BossHealthValue { readonly id: string; readonly name: string; readonly health: number; readonly maxHealth: number }
/** At most the two authored unique encounters. No simulation data is inferred. */
export class BossHealthUi {
  private readonly container: Phaser.GameObjects.Container;
  private readonly rows: readonly { text: Phaser.GameObjects.Text; track: Phaser.GameObjects.Rectangle; fill: Phaser.GameObjects.Rectangle }[];
  constructor(private readonly scene: Phaser.Scene, theme: ThemeManifest) {
    const colour = (key: "grid" | "health") => Phaser.Display.Color.HexStringToColor(theme.tokens.palette[key]).color;
    this.rows = [0, 1].map((index) => ({
      text: addUiText(scene, 0, 90 + index * 46, "", { fontFamily: "Georgia, serif", fontSize: "16px", color: theme.tokens.palette.text, stroke: theme.tokens.palette.background, strokeThickness: 4 }).setOrigin(0.5),
      track: scene.add.rectangle(0, 109 + index * 46, 250, 8, colour("grid")).setOrigin(0, 0.5),
      fill: scene.add.rectangle(0, 109 + index * 46, 250, 8, colour("health")).setOrigin(0, 0.5),
    }));
    this.container = configureUiContainer(scene, scene.add.container(0, 0, this.rows.flatMap((row) => [row.text, row.track, row.fill]))).setDepth(910);
    this.update([]);
  }
  update(values: readonly BossHealthValue[]): void {
    const viewport = uiViewport(this.scene);
    this.rows.forEach((row, index) => {
      const value = values[index];
      row.text.setVisible(Boolean(value)); row.track.setVisible(Boolean(value)); row.fill.setVisible(Boolean(value));
      if (!value) return;
      const centre = viewport.left + viewport.width / 2;
      row.text.setPosition(centre, viewport.top + 90 + index * 46).setText(`${value.name}: ${Math.ceil(value.health)} / ${Math.ceil(value.maxHealth)}`);
      row.track.setPosition(centre - 125, viewport.top + 109 + index * 46);
      row.fill.setPosition(centre - 125, viewport.top + 109 + index * 46);
      row.fill.width = 250 * Math.max(0, Math.min(1, value.health / value.maxHealth));
    });
  }
  destroy(): void { this.container.destroy(true); }
}
