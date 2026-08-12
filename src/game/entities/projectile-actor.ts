import Phaser from "phaser";
import type { ThemeTokens, WeaponDefinition } from "../core/archetypes/contracts";
import { consumePierce, createPierceState, type PierceState } from "../systems/combat";

export class ProjectileActor extends Phaser.GameObjects.Arc {
  readonly projectileId: string;
  readonly damage: number;
  readonly critical: boolean;
  private pierceState: PierceState;
  private expiresAtMs: number;

  constructor(
    scene: Phaser.Scene,
    projectileId: string,
    x: number,
    y: number,
    definition: WeaponDefinition,
    tokens: ThemeTokens,
    damage: number,
    critical: boolean,
    nowMs: number,
    pierce = definition.pierce,
  ) {
    const token = critical ? "critical" : definition.presentationToken;
    const colour = Phaser.Display.Color.HexStringToColor(tokens.palette[token]).color;
    super(scene, x, y, definition.projectileRadius, 0, 360, false, colour);
    this.projectileId = projectileId;
    this.damage = damage;
    this.critical = critical;
    this.pierceState = createPierceState(pierce);
    this.expiresAtMs = nowMs + definition.projectileLifetimeMs;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.arcadeBody.setCircle(definition.projectileRadius);
  }

  get arcadeBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  launch(angleRadians: number, speed: number): void {
    this.arcadeBody.setVelocity(Math.cos(angleRadians) * speed, Math.sin(angleRadians) * speed);
  }

  canHit(targetId: string): boolean {
    return this.active && this.pierceState.remainingHits > 0 && !this.pierceState.hitTargetIds.has(targetId);
  }

  registerHit(targetId: string): void {
    this.pierceState = consumePierce(this.pierceState, targetId);
    if (this.pierceState.remainingHits === 0) this.destroy();
  }

  hasExpired(nowMs: number): boolean {
    return nowMs >= this.expiresAtMs;
  }
}
