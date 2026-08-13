import Phaser from "phaser";
import type { EnemyDefinition, ThemeTokens } from "../core/archetypes/contracts";
import { applyDamage, type HitResult } from "../systems/combat";
import type { ContentId, ShrineId } from "../core/archetypes/ids";

export type EnemySpawnSource = "ambient" | ShrineId | ContentId;

export class EnemyActor extends Phaser.GameObjects.Arc {
  readonly targetId: string;
  readonly definition: EnemyDefinition;
  readonly spawnSource: EnemySpawnSource;
  readonly rewardMultiplier: number;
  health: number;
  defeated = false;
  private readonly baseColour: number;

  constructor(
    scene: Phaser.Scene,
    targetId: string,
    x: number,
    y: number,
    definition: EnemyDefinition,
    tokens: ThemeTokens,
    spawnSource: EnemySpawnSource = "ambient",
    rewardMultiplier = 1,
  ) {
    const colour = Phaser.Display.Color.HexStringToColor(
      tokens.palette[definition.presentationToken],
    ).color;
    super(scene, x, y, definition.radius, 0, 360, false, colour);
    this.targetId = targetId;
    this.definition = definition;
    this.health = definition.maxHealth;
    this.spawnSource = spawnSource;
    this.rewardMultiplier = rewardMultiplier;
    this.baseColour = colour;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.arcadeBody.setCircle(definition.radius);
    if (definition.geometry === "triangle") this.setIterations(1 / 3).setAngle(-90);
    if (definition.geometry === "square") this.setIterations(1 / 4).setAngle(45);
    if (definition.geometry === "hexagon") {
      this.setIterations(1 / 6).setAngle(30).setStrokeStyle(5, 0xffffff, 0.45);
    }
    this.setDepth(20);
  }

  get arcadeBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  chase(target: Phaser.Math.Vector2): void {
    const direction = target.clone().subtract(new Phaser.Math.Vector2(this.x, this.y));
    if (direction.lengthSq() === 0) {
      this.arcadeBody.setVelocity(0, 0);
      return;
    }
    direction.normalize().scale(this.definition.moveSpeed);
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
