import Phaser from "phaser";
import { addToolSprite, type ToolEffectOptions } from "./tool-effects";
import { resolveSprite } from "../systems/sprites/resolve-sprite";
import { runtimeFrame } from "../systems/sprites/runtime-sprite";
import type { MeleeWeaponDefinition, ThemeTokens } from "../core/archetypes/contracts";

/** Tool pulse artwork and optional geometry guide; never owns hit selection. */
export class ConeAttackActor extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, angle: number,
    definition: MeleeWeaponDefinition, tokens: ThemeTokens, onComplete: () => void, selected: readonly Readonly<{ x: number; y: number }>[] = [], options: ToolEffectOptions = {}) {
    super(scene, x, y);
    const colour = Phaser.Display.Color.HexStringToColor(tokens.palette[definition.presentationToken]).color;
    const half = (definition.arcRadians ?? 0) / 2;
    const sector = scene.add.graphics();
    const showGuide = !options.effects || options.showAttackRadius;
    sector.setVisible(Boolean(showGuide));
    if (showGuide) {
      sector.fillStyle(colour, 0.14).lineStyle(2, colour, 0.85);
      sector.slice(0, 0, definition.reach, -half, half, false).fillPath().strokePath();
    }
    const suction = options.effects?.suction;
    const airColour = suction ? Phaser.Display.Color.HexStringToColor(tokens.palette.projectile).color : colour;
    const nozzle = scene.add.rectangle(suction ? suction.nozzleLength / 2 : 8, 0,
      suction?.nozzleLength ?? 16, suction?.nozzleWidth ?? 10, airColour);
    const marks = scene.add.graphics().lineStyle(2, colour, 1);
    for (const point of showGuide ? selected : []) {
      const dx = point.x - x, dy = point.y - y;
      // Freeze the pulse's selected world positions in the rotated container.
      marks.strokeCircle(dx * Math.cos(angle) + dy * Math.sin(angle), -dx * Math.sin(angle) + dy * Math.cos(angle), 4);
    }
    this.add([sector, nozzle, marks]).setRotation(angle).setDepth(45);
    const air = scene.add.graphics();
    this.add(air);
    const art = addToolSprite(this, tokens, definition.id, suction?.nozzleLength ?? nozzle.width, "hit");
    const sprite = resolveSprite(tokens, definition.id);
    if (art) nozzle.setVisible(false);
    const gustDuration = suction?.durationMs ?? definition.extendMs;
    const fadeDuration = suction?.fadeMs ?? definition.retractMs;
    if (suction) {
      const count = options.quality === "low" ? suction.lowStreams : suction.streams;
      const draw = (elapsedMs: number) => {
        air.clear();
        for (let index = 0; index < count; index += 1) {
          const lane = (index + 0.5) / count;
          const travel = options.reducedMotion ? lane : (elapsedMs / (suction.cycleMs ?? gustDuration) + lane) % 1;
          const envelope = Math.sin(travel * Math.PI);
          const distance = definition.reach * (1 - travel * (1 - suction.innerFraction));
          const spread = Math.sin(half) * distance;
          // Overlapping translucent air banks form a broad inward gust. No
          // bullet-like streaks or tiny dust points, and never a new hit area.
          air.fillStyle(airColour, suction.opacity * envelope)
            .fillEllipse(distance, 0, definition.reach * suction.tailFraction,
              Math.max(suction.strokeWidth, spread * 2));
          air.fillStyle(airColour, suction.opacity * envelope * 0.5)
            .fillEllipse(distance + definition.reach * suction.tailFraction / 4,
              Math.sin(travel * Math.PI * 2) * spread / 4,
              definition.reach * suction.tailFraction, Math.max(suction.strokeWidth, spread * 1.5));
        }
      };
      draw(0);
      if (!options.reducedMotion) {
        const clock = { elapsedMs: 0 };
        scene.tweens.add({ targets: clock, elapsedMs: gustDuration, duration: gustDuration,
          onUpdate: () => { if (this.active) draw(clock.elapsedMs); } });
      }
    }
    scene.time.delayedCall(definition.extendMs, () => {
      if (!this.active) return;
      // Damage happened once. Only a faint outline/selected-hit trace lingers.
      sector.clear();
      if (showGuide) {
        sector.lineStyle(1, colour, 0.25);
        sector.slice(0, 0, definition.reach, -half, half, false).strokePath();
      }
      nozzle.setVisible(false);
      if (art && sprite) art.setFrame(runtimeFrame(sprite, sprite.states.death));
    });
    scene.add.existing(this);
    scene.tweens.add({ targets: this, alpha: 0, delay: gustDuration, duration: fadeDuration,
      onComplete: () => { this.destroy(); onComplete(); } });
  }
}
