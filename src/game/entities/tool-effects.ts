import Phaser from "phaser";
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
