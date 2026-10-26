import Phaser from "phaser";
import type { ContentId } from "../core/archetypes/ids";
import { resolveSprite } from "../systems/sprites/resolve-sprite";
import { runtimeFrame, runtimeTextureKey } from "../systems/sprites/runtime-sprite";
import type { ThemeTokens } from "../core/archetypes/contracts";
import type { ToolEffectsTuning } from "../core/archetypes/tuning";

export interface ToolEffectOptions {
  readonly effects?: ToolEffectsTuning;
  readonly showAttackRadius?: boolean;
  readonly reducedMotion?: boolean;
  readonly quality?: "default" | "low";
}

/** A short, presentation-only mechanical snap at an already resolved sweep. */
export class ClawSnapActor extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, radius: number,
    tokens: ThemeTokens, options: ToolEffectOptions) {
    super(scene, x, y);
    const tuning = options.effects!.claw;
    const colour = Phaser.Display.Color.HexStringToColor(tokens.palette.player).color;
    const graphics = scene.add.graphics();
    this.add(graphics).setDepth(44);
    scene.add.existing(this);
    const draw = (progress: number) => {
      const closed = Math.min(1, progress / tuning.closeFraction);
      const tip = radius * tuning.tipFraction * (1 - closed);
      graphics.clear().lineStyle(tuning.strokeWidth, colour, 1);
      for (let index = 0; index < tuning.prongs; index += 1) {
        const angle = index * Math.PI * 2 / tuning.prongs;
        const bend = angle + tuning.openingRadians * (1 - closed);
        graphics.beginPath().moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
          .lineTo(Math.cos(bend) * radius * tuning.tipFraction, Math.sin(bend) * radius * tuning.tipFraction)
          .lineTo(Math.cos(angle) * tip, Math.sin(angle) * tip).strokePath();
      }
      if (options.showAttackRadius) graphics.lineStyle(1, colour, tuning.tipFraction).strokeCircle(0, 0, radius);
    };
    draw(options.reducedMotion ? 1 : 0);
    const clock = { value: 0 };
    scene.tweens.add({ targets: clock, value: 1, duration: tuning.durationMs,
      onUpdate: () => {
        if (!this.active) return;
        if (!options.reducedMotion) draw(clock.value);
        this.setAlpha(1 - clock.value);
      },
      onComplete: () => this.destroy() });
  }
}

/** Tool artwork lives inside the already-resolved attack transform. */
export function addToolSprite(container: Phaser.GameObjects.Container, tokens: ThemeTokens,
  id: ContentId, width: number, state: "idle" | "hit" = "idle"): Phaser.GameObjects.Sprite | undefined {
  const sprite = resolveSprite(tokens, id);
  if (!sprite) return undefined;
  const anchor = sprite.frameAnchors?.[sprite.states[state]] ?? { x: 0, y: sprite.frameHeight / 2 };
  const image = container.scene.add.sprite(0, 0, runtimeTextureKey(sprite), runtimeFrame(sprite, sprite.states[state]))
    .setOrigin(anchor.x / sprite.frameWidth, anchor.y / sprite.frameHeight)
    .setScale(width / (sprite.toolSpan ?? sprite.frameWidth));
  container.add(image);
  return image;
}
