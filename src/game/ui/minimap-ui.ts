import Phaser from "phaser";
import type { ThemeManifest } from "../core/archetypes/contracts";
import type { RunSettings } from "../state/settings-state";
import { configureUiContainer, uiViewport } from "./ui-text";

export interface MinimapPoint {
  readonly x: number;
  readonly y: number;
}

export interface MinimapView {
  readonly player: MinimapPoint;
  readonly enemies: readonly MinimapPoint[];
  readonly shrines: readonly MinimapPoint[];
  readonly hazards: readonly MinimapPoint[];
}

/** A presentation-only overview; no game system reads from it. */
export class MinimapUi {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly container: Phaser.GameObjects.Container;
  private readonly worldWidth: number;
  private readonly worldHeight: number;
  private readonly theme: ThemeManifest;
  private opacity: RunSettings["minimapOpacity"];
  private readonly left: number;
  private readonly top: number;
  private readonly width = 196;
  private readonly height = 132;

  constructor(
    scene: Phaser.Scene,
    theme: ThemeManifest,
    world: { readonly width: number; readonly height: number },
    opacity: RunSettings["minimapOpacity"],
  ) {
    this.theme = theme;
    this.worldWidth = world.width;
    this.worldHeight = world.height;
    this.opacity = opacity;
    const viewport = uiViewport(scene);
    this.left = viewport.left + viewport.width - this.width - 18;
    this.top = viewport.top + 112;
    this.graphics = scene.add.graphics();
    this.container = configureUiContainer(scene, scene.add.container(0, 0, [this.graphics]))
      .setDepth(920);
  }

  setOpacity(opacity: RunSettings["minimapOpacity"]): void {
    this.opacity = opacity;
    this.container.setVisible(opacity > 0);
  }

  update(view: MinimapView): void {
    const graphics = this.graphics.clear();
    if (this.opacity === 0) {
      this.container.setVisible(false);
      return;
    }
    this.container.setVisible(true);
    const palette = this.theme.tokens.palette;
    const colour = (hex: string) => Phaser.Display.Color.HexStringToColor(hex).color;
    graphics.fillStyle(colour(palette.background), this.opacity * 0.82);
    graphics.fillRoundedRect(this.left, this.top, this.width, this.height, 8);
    graphics.lineStyle(2, colour(palette.text), this.opacity * 0.9);
    graphics.strokeRoundedRect(this.left, this.top, this.width, this.height, 8);

    const point = (entry: MinimapPoint): readonly [number, number] => [
      this.left + 5 + (entry.x / this.worldWidth) * (this.width - 10),
      this.top + 5 + (entry.y / this.worldHeight) * (this.height - 10),
    ];
    const dots = (entries: readonly MinimapPoint[], hex: string, radius: number) => {
      graphics.fillStyle(colour(hex), this.opacity);
      for (const entry of entries) {
        const [x, y] = point(entry);
        graphics.fillCircle(x, y, radius);
      }
    };

    // Enemy dots stay deliberately tiny: the map communicates pressure and
    // direction, not exact hitboxes or an alternate targeting surface.
    dots(view.enemies, palette.enemy, 1.4);
    dots(view.hazards, palette.critical, 2.2);
    dots(view.shrines, palette.shrine, 3);
    dots([view.player], palette.player, 3.4);
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
