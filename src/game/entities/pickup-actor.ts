import Phaser from "phaser";
import type { PickupDefinition, ThemeTokens } from "../core/archetypes/contracts";
import type { EnemySpawnSource } from "./enemy-actor";
import { createSpriteView, type SpriteView } from "../systems/sprites/sprite-view";

export class PickupActor extends Phaser.GameObjects.Arc {
  readonly pickupId: string;
  readonly definition: PickupDefinition;
  readonly rewardSource: EnemySpawnSource;
  /** Present only when this pack has a sprite for the pickup. */
  readonly view?: SpriteView;
  /** Mutable so two pickups can merge into one worth the sum. */
  private value: number;
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
    this.value = xpValue;
    this.rewardSource = rewardSource;
    this.applyTier();
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.arcadeBody.setCircle(definition.radius);
    this.setDepth(10);
    // Built after `applyTier`, so it starts at whatever size this drop is
    // worth; later merges resize it through `setDiameter`.
    this.view = createSpriteView(this, tokens, definition.id, { diameter: this.radius * 2 });
  }

  get xpValue(): number {
    return this.value;
  }

  /**
   * Absorb another pickup's value.
   *
   * Merging keeps the reward exact while bounding how many actors exist, which
   * matters most in a chain where every kill drops one.
   */
  absorb(other: PickupActor): void {
    this.value += other.xpValue;
    this.applyTier();
  }

  /** Three visual tiers, so a durable enemy's drop is worth crossing for. */
  private applyTier(): void {
    const tier = this.value >= 12 ? 2 : this.value >= 4 ? 1 : 0;
    const radius = this.definition.radius * (1 + tier * 0.45);
    this.setRadius(radius);
    this.arcadeBody?.setCircle(radius);
    // Undefined on the constructor's own call, which is why the view is built
    // afterwards rather than before.
    this.view?.setDiameter(radius * 2);
    if (tier > 0) this.setStrokeStyle(2 + tier, 0xffffff, 0.55);
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
