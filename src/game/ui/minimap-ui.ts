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
  private readonly colours: { background: number; text: number; enemy: number; critical: number; shrine: number; player: number };
  private opacity: RunSettings["minimapOpacity"];
  private left = 0;
  private top = 0;
  private overlayHidden = false;
  private readonly width = 196;
  private readonly height = 132;

  constructor(
    scene: Phaser.Scene,
    theme: ThemeManifest,
    world: { readonly width: number; readonly height: number },
    opacity: RunSettings["minimapOpacity"],
  ) {
    const palette = theme.tokens.palette;
    const colour = (hex: string) => Phaser.Display.Color.HexStringToColor(hex).color;
    this.colours = {
      background: colour(palette.background), text: colour(palette.text),
      enemy: colour(palette.enemy), critical: colour(palette.critical),
      shrine: colour(palette.shrine), player: colour(palette.player),
    };
    this.worldWidth = world.width;
    this.worldHeight = world.height;
    this.opacity = opacity;
    this.anchor(scene);
    this.graphics = scene.add.graphics();
    this.container = configureUiContainer(scene, scene.add.container(0, 0, [this.graphics]))
      .setDepth(920).setVisible(opacity > 0);
  }

  setOpacity(opacity: RunSettings["minimapOpacity"]): void {
    this.opacity = opacity;
    this.container.setVisible(!this.overlayHidden && opacity > 0);
  }

  setOverlayHidden(hidden: boolean): void {
    this.overlayHidden = hidden;
    this.container.setVisible(!hidden && this.opacity > 0);
  }

  resize(scene: Phaser.Scene): void {
    this.anchor(scene);
  }

  get bounds(): Readonly<{ left: number; top: number; width: number; height: number }> {
    return { left: this.left, top: this.top, width: this.width, height: this.height };
  }

  get visible(): boolean {
    return this.container.visible;
  }

  update(view: MinimapView): void {
    // Hidden maps keep no changing command buffer and do no drawing work.
    if (!this.visible) return;
    const graphics = this.graphics.clear();
    const colours = this.colours;
    graphics.fillStyle(colours.background, this.opacity * 0.82);
    graphics.fillRoundedRect(this.left, this.top, this.width, this.height, 8);
    graphics.lineStyle(2, colours.text, this.opacity * 0.9);
    graphics.strokeRoundedRect(this.left, this.top, this.width, this.height, 8);

    // Enemy dots communicate pressure, never hitboxes or targeting geometry.
    this.drawDots(view.enemies, colours.enemy, 1.4);
    this.drawDots(view.hazards, colours.critical, 2.2);
    this.drawDots(view.shrines, colours.shrine, 3);
    graphics.fillStyle(colours.player, this.opacity);
    this.drawDot(view.player, 3.4);
  }

  private drawDots(entries: readonly MinimapPoint[], colour: number, radius: number): void {
    this.graphics.fillStyle(colour, this.opacity);
    for (const entry of entries) this.drawDot(entry, radius);
  }

  private drawDot(entry: MinimapPoint, radius: number): void {
    this.graphics.fillCircle(
      this.left + 5 + (entry.x / this.worldWidth) * (this.width - 10),
      this.top + 5 + (entry.y / this.worldHeight) * (this.height - 10),
      radius,
    );
  }

  destroy(): void {
    this.container.destroy(true);
  }

  private anchor(scene: Phaser.Scene): void {
    const viewport = uiViewport(scene);
    this.left = viewport.left + viewport.width - this.width - 18;
    this.top = viewport.top + viewport.height - this.height - 18;
  }
}
