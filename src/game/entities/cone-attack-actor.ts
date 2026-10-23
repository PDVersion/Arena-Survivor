import Phaser from "phaser";
import type { ToolEffectOptions } from "./tool-effects";
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
    let pulsing = true;
    if (suction) {
      const count = options.quality === "low" ? suction.lowStreams : suction.streams;
      const draw = (progress: number) => {
        air.clear().lineStyle(suction.strokeWidth, airColour, suction.opacity);
        for (let index = 0; index < count; index += 1) {
          const lane = (index + 0.5) / count;
          const travel = options.reducedMotion ? lane : (progress + lane) % 1;
          const distance = definition.reach * (1 - travel * (1 - suction.innerFraction));
          const spread = Phaser.Math.Clamp(-half + lane * half * 2 + Math.sin(progress * Math.PI * 2) * suction.twist, -half, half);
          const tail = Math.min(definition.reach, distance + definition.reach * suction.tailFraction);
          air.lineBetween(Math.cos(spread) * distance, Math.sin(spread) * distance,
            Math.cos(spread) * tail, Math.sin(spread) * tail);
          if (!options.reducedMotion) air.fillStyle(airColour, suction.opacity)
            .fillCircle(Math.cos(spread) * distance, Math.sin(spread) * distance, suction.dustRadius);
        }
      };
      draw(0);
      if (!options.reducedMotion) {
        const pulse = { value: 0 };
        scene.tweens.add({ targets: pulse, value: 1, duration: definition.extendMs,
          onUpdate: () => { if (this.active && pulsing) draw(pulse.value); } });
      }
    }
    scene.time.delayedCall(definition.extendMs, () => {
      if (!this.active) return;
      // Damage happened once. Only a faint outline/selected-hit trace lingers.
      pulsing = false;
      sector.clear();
      air.clear().setVisible(false);
      if (showGuide) {
        sector.lineStyle(1, colour, 0.25);
        sector.slice(0, 0, definition.reach, -half, half, false).strokePath();
      }
      nozzle.setVisible(false);
    });
    scene.add.existing(this);
    scene.tweens.add({ targets: this, alpha: 0, duration: definition.extendMs + definition.retractMs,
      onComplete: () => { this.destroy(); onComplete(); } });
  }
}
