import Phaser from "phaser";
import type { EliteDefinition, EnemyDefinition, ThemeTokens } from "../core/archetypes/contracts";
import { applyDamage, type HitResult } from "../systems/combat";
import type { ContentId, ShrineId } from "../core/archetypes/ids";
import type { WaveMovement } from "../core/archetypes/tuning";

export type EnemySpawnSource = "ambient" | ShrineId | ContentId;

export class EnemyActor extends Phaser.GameObjects.Arc {
  readonly targetId: string;
  readonly definition: EnemyDefinition;
  readonly spawnSource: EnemySpawnSource;
  readonly rewardMultiplier: number;
  health: number;
  readonly moveSpeed: number;
  readonly contactDamage: number;
  readonly elite?: EliteDefinition;
  readonly movement: WaveMovement;
  defeated = false;
  private readonly baseColour: number;
  private launched = false;

  constructor(
    scene: Phaser.Scene,
    targetId: string,
    x: number,
    y: number,
    definition: EnemyDefinition,
    tokens: ThemeTokens,
    spawnSource: EnemySpawnSource = "ambient",
    rewardMultiplier = 1,
    modifiers: Readonly<{ healthMultiplier: number; damageMultiplier: number }> = {
      healthMultiplier: 1,
      damageMultiplier: 1,
    },
    elite?: EliteDefinition,
    movement: WaveMovement = "chase",
  ) {
    const colour = Phaser.Display.Color.HexStringToColor(
      tokens.palette[definition.presentationToken],
    ).color;
    const radius = definition.radius * (elite?.radiusMultiplier ?? 1);
    super(scene, x, y, radius, 0, 360, false, colour);
    this.targetId = targetId;
    this.definition = definition;
    this.health = definition.maxHealth * modifiers.healthMultiplier;
    this.moveSpeed = definition.moveSpeed;
    this.contactDamage = definition.contactDamage * modifiers.damageMultiplier;
    this.elite = elite;
    this.spawnSource = spawnSource;
    this.rewardMultiplier = rewardMultiplier;
    this.movement = movement;
    this.baseColour = colour;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.arcadeBody.setCircle(radius);
    if (definition.geometry === "triangle") this.setIterations(1 / 3).setAngle(-90);
    if (definition.geometry === "square") this.setIterations(1 / 4).setAngle(45);
    if (definition.geometry === "hexagon") {
      this.setIterations(1 / 6).setAngle(30).setStrokeStyle(5, 0xffffff, 0.45);
    }
    if (elite) {
      const eliteColour = Phaser.Display.Color.HexStringToColor(tokens.palette[elite.presentationToken]).color;
      this.setStrokeStyle(5, eliteColour, 1).setDepth(25);
    }
    if (!elite) this.setDepth(20);
  }

  get arcadeBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  /**
   * Advance one frame of movement.
   *
   * A chasing enemy re-aims every frame. A drifting one aims once at the
   * player's position when it first moves and then holds that heading, so it
   * sweeps past as an obstacle rather than pursuing.
   */
  advance(target: Phaser.Math.Vector2): void {
    if (this.movement === "drift") {
      if (this.launched) return;
      this.launched = true;
    }
    this.chase(target);
  }

  /** True once a drifting enemy has left the arena and can be reclaimed. */
  hasLeftArena(arena: Readonly<{ width: number; height: number }>, margin: number): boolean {
    return (
      this.x < -margin ||
      this.y < -margin ||
      this.x > arena.width + margin ||
      this.y > arena.height + margin
    );
  }

  chase(target: Phaser.Math.Vector2): void {
    const direction = target.clone().subtract(new Phaser.Math.Vector2(this.x, this.y));
    if (direction.lengthSq() === 0) {
      this.arcadeBody.setVelocity(0, 0);
      return;
    }
    direction.normalize().scale(this.moveSpeed);
    this.arcadeBody.setVelocity(direction.x, direction.y);
  }

  takeDamage(damage: number): HitResult {
    if (this.defeated) return { health: 0, killed: false, applied: false };
    const result = applyDamage(this.health, damage);
    this.health = result.health;
    if (result.killed) this.defeated = true;
    if (result.applied && !result.killed) {
      this.setFillStyle(0xffffff);
      this.scene.time.delayedCall(70, () => {
        if (this.active) this.setFillStyle(this.baseColour);
      });
    }
    return result;
  }
}
