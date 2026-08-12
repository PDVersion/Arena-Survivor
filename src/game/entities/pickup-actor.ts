import Phaser from "phaser";
import type { PickupDefinition, ThemeTokens } from "../core/archetypes/contracts";
import type { EnemySpawnSource } from "./enemy-actor";

export class PickupActor extends Phaser.GameObjects.Arc {
  readonly pickupId: string;
  readonly definition: PickupDefinition;
  readonly xpValue: number;
  readonly rewardSource: EnemySpawnSource;
  private collected = false;

  constructor(
    scene: Phaser.Scene,
    pickupId: string,
    x: number,
    y: number,
    definition: PickupDefinition,
    tokens: ThemeTokens,
    xpValue: number,
    rewardSource: EnemySpawnSource = "ambient",
  ) {
    const colour = Phaser.Display.Color.HexStringToColor(
      tokens.palette[definition.presentationToken],
    ).color;
    super(scene, x, y, definition.radius, 0, 360, false, colour);
    this.pickupId = pickupId;
    this.definition = definition;
    this.xpValue = xpValue;
    this.rewardSource = rewardSource;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.arcadeBody.setCircle(definition.radius);
    this.setDepth(10);
  }

  get arcadeBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  magnetToward(target: Phaser.Math.Vector2): void {
    const direction = target.clone().subtract(new Phaser.Math.Vector2(this.x, this.y));
    if (direction.lengthSq() === 0) return;
    direction.normalize().scale(this.definition.magnetSpeed);
    this.arcadeBody.setVelocity(direction.x, direction.y);
  }

  stop(): void {
    this.arcadeBody.setVelocity(0, 0);
  }

  claim(): number | null {
    if (this.collected || !this.active) return null;
    this.collected = true;
    return this.xpValue;
  }

  playCollectCue(): void {
    this.arcadeBody.enable = false;
    this.setDepth(45);
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 2.2,
      duration: 180,
      ease: "Quad.Out",
      onComplete: () => this.destroy(),
    });
  }
}
