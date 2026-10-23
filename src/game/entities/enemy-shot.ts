import Phaser from "phaser";
import type { RangedAttackDefinition, ThemeTokens } from "../core/archetypes/contracts";
import type { EnemyId } from "../core/archetypes/ids";

/** Hostile shots deliberately never join the player's projectile group. */
export class EnemyShot extends Phaser.GameObjects.Arc {
  ageMs = 0;
  constructor(scene: Phaser.Scene, x: number, y: number,
    readonly heading: Readonly<{ x: number; y: number }>, readonly attack: RangedAttackDefinition,
    readonly sourceId: EnemyId, readonly damage: number, readonly elite: boolean, tokens: ThemeTokens) {
    super(scene, x, y, attack.projectileRadius, 0, 360, false,
      Phaser.Display.Color.HexStringToColor(attack.projectileColour).color);
    scene.add.existing(this);
    this.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(tokens.palette[attack.cueToken]).color).setDepth(35);
  }
  advance(deltaMs: number): void {
    const remaining = Math.max(0, this.attack.projectileLifetimeMs - this.ageMs);
    const stepMs = Math.min(remaining, Math.max(0, deltaMs));
    this.ageMs += stepMs;
    this.x += this.heading.x * this.attack.projectileSpeed * stepMs / 1000;
    this.y += this.heading.y * this.attack.projectileSpeed * stepMs / 1000;
  }
  get expired(): boolean { return this.ageMs >= this.attack.projectileLifetimeMs; }
}
