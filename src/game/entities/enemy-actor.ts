import Phaser from "phaser";
import { advanceRangedAttack, createRangedAttackState } from "../systems/enemies/ranged-attack";
import { advanceCommittedMotion, createMotionState } from "../systems/enemies/committed-motion";
import { EnemyMotionCue } from "./enemy-motion-cue";
import { EnemyPrimitiveView } from "./enemy-primitive-view";
import type { EliteDefinition, EnemyDefinition, ThemeTokens } from "../core/archetypes/contracts";
import { applyDamage, type HitResult } from "../systems/combat";
import type { ContentId, ShrineId } from "../core/archetypes/ids";
import type { BodyRoleTuning, WaveMovement } from "../core/archetypes/tuning";
import { createSpriteView, type SpriteView } from "../systems/sprites/sprite-view";

import { eliteSpeedMultiplier } from "../systems/elites/elites";

export type EnemySpawnSource = "ambient" | ShrineId | ContentId;

export class EnemyActor extends Phaser.GameObjects.Arc {
  readonly targetId: string;
  readonly definition: EnemyDefinition;
  readonly spawnSource: EnemySpawnSource;
  readonly rewardMultiplier: number;
  health: number;
  /** Max health at spawn, after world and elite multipliers. */
  readonly maxHealth: number;
  private readonly baseMoveSpeed: number;
  get moveSpeed(): number { return this.baseMoveSpeed * eliteSpeedMultiplier(this.elite, this.ageMs); }
  readonly contactDamage: number;
  readonly elite?: EliteDefinition;
  readonly movement: WaveMovement;
  /** Personal space in the crowd, deliberately smaller than the drawn radius. */
  readonly separationRadius: number;
  readonly mass: number;
  readonly displayDiameter: number;
  defeated = false;
  /** Present only when this pack has a sprite for the role. */
  readonly view?: SpriteView;
  readonly primitiveView?: EnemyPrimitiveView;
  readonly eliteMarker?: Phaser.GameObjects.Text;
  private readonly baseColour: number;
  readonly motionCue?: EnemyMotionCue;
  motionState = createMotionState();
  private launched = false;
  private ageMs = 0;
  rangedState = createRangedAttackState();
  private pendingShot = false;
  readonly rangedCue?: Phaser.GameObjects.Graphics;
  private readonly rangedCueColour?: number;

  consumeRangedShot(): boolean {
    const pending = this.pendingShot;
    this.pendingShot = false;
    return pending;
  }
  eliteSplitDepth = 0;
  sourceRewardMultiplier = 1;

  constructor(
    scene: Phaser.Scene,
    targetId: string,
    x: number,
    y: number,
    definition: EnemyDefinition,
    tokens: ThemeTokens,
    spawnSource: EnemySpawnSource = "ambient",
    rewardMultiplier = 1,
    modifiers: Readonly<{
      healthMultiplier: number;
      damageMultiplier: number;
      moveSpeedMultiplier?: number;
      /** Optional authored size modifier (currently used by elites only). */
      radiusMultiplier?: number;
    }> = {
      healthMultiplier: 1,
      damageMultiplier: 1,
    },
    elite?: EliteDefinition,
    movement: WaveMovement = "chase",
    body?: Readonly<{ role: BodyRoleTuning; eliteMassMultiplier: number }>,
  ) {
    const colour = Phaser.Display.Color.HexStringToColor(
      tokens.palette[definition.presentationToken],
    ).color;
    const radius =
      definition.radius * (elite?.radiusMultiplier ?? 1) * (modifiers.radiusMultiplier ?? 1);
    super(scene, x, y, radius, 0, 360, false, colour);
    this.targetId = targetId;
    this.definition = definition;
    this.health = definition.maxHealth * modifiers.healthMultiplier;
    this.maxHealth = this.health;
    // World speed snapshots at spawn; only an authored elite acceleration ramps later.
    this.baseMoveSpeed = definition.moveSpeed * (modifiers.moveSpeedMultiplier ?? 1);
    this.contactDamage = definition.contactDamage * modifiers.damageMultiplier;
    this.elite = elite;
    this.spawnSource = spawnSource;
    this.rewardMultiplier = rewardMultiplier;
    this.movement = movement;
    this.separationRadius = radius * (body?.role.separationScale ?? 1);
    this.mass = (body?.role.mass ?? 1) * (elite ? (body?.eliteMassMultiplier ?? 1) : 1);
    this.displayDiameter = definition.displayDiameter *
      (elite?.radiusMultiplier ?? 1) * (modifiers.radiusMultiplier ?? 1);
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
    if (elite?.marker) {
      this.eliteMarker = scene.add.text(x, y - this.displayDiameter / 2, elite.marker,
        { fontSize: "12px", color: tokens.palette[elite.presentationToken], backgroundColor: tokens.palette.background, padding: { x: 2, y: 0 } }).setOrigin(0.5, 1).setDepth(45);
      const follow = () => {
        this.eliteMarker?.setPosition(this.x, this.y - this.displayDiameter / 2);
        if (elite.shield) this.eliteMarker?.setVisible(this.health > this.maxHealth * elite.shield.untilHealthFraction);
      };
      scene.events.on(Phaser.Scenes.Events.POST_UPDATE, follow);
      this.once(Phaser.GameObjects.Events.DESTROY, () => {
        scene.events.off(Phaser.Scenes.Events.POST_UPDATE, follow);
        this.eliteMarker?.destroy();
      });
    }
    // Display size is authored beside the radius; neither is inferred from art.
    this.view = createSpriteView(this, tokens, definition.id, {
      diameter: this.displayDiameter,
      animateMovement: true,
    });
    if (!this.view && definition.primitiveParts) this.primitiveView = new EnemyPrimitiveView(this, definition.primitiveParts, tokens);
    if (definition.rangedAttack) {
      this.rangedCueColour = Phaser.Display.Color.HexStringToColor(tokens.palette[definition.rangedAttack.cueToken]).color;
      this.rangedCue = scene.add.graphics().setDepth(19);
      this.once(Phaser.GameObjects.Events.DESTROY, () => this.rangedCue?.destroy());
    }
    if (definition.committedMotion) this.motionCue = new EnemyMotionCue(this, tokens);
  }

  /** Stable identity for the shared spatial index and targeting. */
  get id(): string {
    return this.targetId;
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
  advance(target: Phaser.Math.Vector2, deltaMs = 0): void {
    this.ageMs += Math.max(0, deltaMs);
    if (this.definition.rangedAttack) {
      const attack = this.definition.rangedAttack;
      const result = advanceRangedAttack(this.rangedState, attack, deltaMs, this, target);
      this.rangedState = result.state;
      this.pendingShot = result.fire;
      const { phase, headingX, headingY } = result.state;
      this.view?.setAttackPhase(phase === "approach" ? undefined : phase, headingX);
      this.rangedCue?.clear();
      if (phase === "prepare") {
        this.rangedCue?.lineStyle(attack.cueWidth, this.rangedCueColour!, 0.9)
          .lineBetween(this.x + headingX * attack.muzzleForward, this.y + headingY * attack.muzzleForward + attack.muzzleVertical,
            this.x + headingX * attack.triggerRange, this.y + headingY * attack.triggerRange + attack.muzzleVertical);
      }
      if (phase === "approach") this.chase(target);
      else this.arcadeBody.setVelocity(0, 0);
      return;
    }
    if (this.moveSpeed <= 0) {
      this.arcadeBody.setVelocity(0, 0);
      return;
    }
    if (this.definition.committedMotion) {
      this.motionState = advanceCommittedMotion(this.motionState, this.definition.committedMotion, deltaMs, this, target);
      const state = this.motionState;
      if (state.phase === "approach") this.chase(target);
      else if (state.phase === "travel") {
        const speed = this.moveSpeed * this.definition.committedMotion.speedMultiplier;
        this.arcadeBody.setVelocity(state.headingX * speed, state.headingY * speed);
      } else this.arcadeBody.setVelocity(0, 0);
      return;
    }
    if (this.movement === "drift") {
      if (this.launched) {
        this.arcadeBody.velocity.normalize().scale(this.moveSpeed);
        return;
      }
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
      // A fill colour does nothing to a texture, so a sprite tints instead.
      if (this.view) {
        this.view.flash(0xffffff, 70);
      } else if (this.primitiveView) {
        this.primitiveView.flash(0xffffff, 70);
      } else {
        this.setFillStyle(0xffffff);
        this.scene.time.delayedCall(70, () => {
          if (this.active) this.setFillStyle(this.baseColour);
        });
      }
    }
    return result;
  }

  /** Keep the death frame visible without keeping this gameplay actor alive. */
  releaseDeathView(): void {
    this.view?.releaseDeath();
  }
}
