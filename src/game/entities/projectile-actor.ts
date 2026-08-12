import Phaser from "phaser";
import type { ThemeTokens, WeaponDefinition } from "../core/archetypes/contracts";
import { consumePierce, createPierceState, type PierceState } from "../systems/combat";

export class ProjectileActor extends Phaser.GameObjects.Arc {
  readonly projectileId: string;
  readonly damage: number;
  readonly critical: boolean;
  private pierceState: PierceState;
  private expiresAtMs: number;
  private nextTrailAtMs: number;
  private readonly trailColour: number;

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
    this.nextTrailAtMs = nowMs;
    this.trailColour = colour;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.arcadeBody.setCircle(definition.projectileRadius);
    this.setDepth(40);
    if (critical) this.setScale(1.35);
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

  emitTrail(nowMs: number): boolean {
    if (!this.active || nowMs < this.nextTrailAtMs) return false;
    this.nextTrailAtMs = nowMs + 160;
    const marker = this.scene.add.circle(this.x, this.y, Math.max(2, this.displayWidth * 0.25), this.trailColour, 0.45)
      .setDepth(35);
    this.scene.tweens.add({
      targets: marker,
      alpha: 0,
      scale: 0.25,
      duration: 180,
      onComplete: () => marker.destroy(),
    });
    return true;
  }
}
