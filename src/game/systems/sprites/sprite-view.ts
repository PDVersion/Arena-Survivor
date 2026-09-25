import Phaser from "phaser";
import type { SpriteDefinition, SpriteState, ThemeTokens } from "../../core/archetypes/contracts";
import type { ContentId } from "../../core/archetypes/ids";
import {
  resolveAnimatedSpriteState,
  advancePlayerMovementFrame,
  resolveSpriteFlipX,
  SPRITE_DEATH_FRAME_MS,
  SPRITE_MOVE_FRAME_MS,
  type SpriteAnimationState,
} from "./sprite-animation";
import { resolveSprite } from "./resolve-sprite";
import { runtimeFrame, runtimeTextureKey } from "./runtime-sprite";

/**
 * The one branch between a primitive and a sprite.
 *
 * An actor keeps its shape class — `Arc`, `Star`, `Rectangle` — and gains a
 * sprite that follows it. Re-basing every actor on `Phaser.GameObjects.Sprite`
 * or a `Container` was the obvious alternative and was rejected: the scene
 * calls shape-specific methods on actors throughout (`setFillStyle`,
 * `setRadius`, `setStrokeStyle`, `setIterations`, `displayWidth`), so a re-base
 * would rewrite `run-scene.ts` and this seam would stop being reviewable as
 * "nothing changed". See REC-072.
 *
 * The view copies the actor's whole transform rather than only its position,
 * which is what lets every existing tween keep working untouched: the shrine's
 * activation spin and the pickup's collect cue both animate the actor and the
 * sprite follows for free.
 *
 * A view never feeds anything back. Radius, separation radius, mass, and the
 * physics body all still come from the definition and the `bodies` tuning.
 */

/** What a view needs from the actor it follows. */
export type SpriteViewSource = Phaser.GameObjects.GameObject &
  Phaser.GameObjects.Components.Transform &
  Phaser.GameObjects.Components.AlphaSingle &
  Phaser.GameObjects.Components.Depth &
  Phaser.GameObjects.Components.Visible;

export interface SpriteViewOptions {
  /**
   * The drawn diameter, authored beside the gameplay radius in theme data.
   *
   * The sprite is scaled to fit the simulation's size. The simulation is never
   * scaled to fit the sprite — that direction is the rule the whole split
   * depends on.
   */
  readonly diameter: number;
  /** Frame shown before any state is played. Defaults to `idle`. */
  readonly initialState?: SpriteState;
  /** Alternate idle/move while the actor lives. Presentation only. */
  readonly animateMovement?: boolean;
}

export class SpriteView {
  readonly image: Phaser.GameObjects.Sprite;
  private readonly source: SpriteViewSource;
  private readonly definition: SpriteDefinition;
  private readonly frameWidth: number;
  private readonly frameHeight: number;
  private readonly sourceDestroyHandler: () => void;
  private readonly animation: { moving: boolean; phaseMs: number; transient?: SpriteAnimationState["transient"] };
  private baseScaleX: number;
  private baseScaleY: number;
  private renderedFrame: number;
  private previousX: number;
  private previousY: number;
  private readonly animateMovement: boolean;
  private flipX = false;
  private playerStep = 0;
  private playerDistance = 0;
  private detached = false;

  /** Read-only presentation state used by the browser verification bridge. */
  get frame(): number {
    return this.renderedFrame;
  }

  /** True when the authored left-facing sheet is mirrored to face right. */
  get mirrored(): boolean {
    return this.flipX;
  }

  constructor(
    source: SpriteViewSource,
    definition: SpriteDefinition,
    options: SpriteViewOptions,
  ) {
    const scene = source.scene;
    const state = options.initialState ?? "idle";
    this.source = source;
    this.definition = definition;
    this.frameWidth = definition.frameWidth;
    this.frameHeight = definition.frameHeight;
    this.renderedFrame = definition.states[state];
    this.previousX = source.x;
    this.previousY = source.y;
    this.animateMovement = options.animateMovement ?? false;
    // Stable from the spawn position, but varied enough that a crowd does not
    // tumble in one synchronized wall.
    this.animation = {
      moving: false,
      phaseMs:
        Math.abs(Math.round(source.x * 31 + source.y * 17)) % (SPRITE_MOVE_FRAME_MS * 2),
    };
    this.baseScaleX = options.diameter / definition.frameWidth;
    this.baseScaleY = options.diameter / definition.frameHeight;
    this.image = scene.add.sprite(
      source.x,
      source.y,
      runtimeTextureKey(definition),
      runtimeFrame(definition, definition.states[state]),
    );
    // The primitive stays alive and keeps its body; it simply stops drawing.
    source.setVisible(false);
    this.sync();
    register(scene, this);
    this.sourceDestroyHandler = () => this.destroy();
    source.once(Phaser.GameObjects.Events.DESTROY, this.sourceDestroyHandler);
  }

  /**
   * Resize to a new drawn diameter.
   *
   * For actors whose drawn size changes during their life — an experience
   * pickup grows with what it is worth. Still one-way: the diameter comes from
   * the definition, never from the sheet.
   */
  setDiameter(diameter: number): void {
    this.baseScaleX = diameter / this.frameWidth;
    this.baseScaleY = diameter / this.frameHeight;
    this.sync();
  }

  /** Show a named frame. Callers name a state; frame indices stay in the data. */
  setState(state: SpriteState): void {
    this.setFrame(this.definition.states[state]);
  }

  /**
   * The damage flash, against a texture.
   *
   * The primitive version sets a fill colour, which does nothing to a sprite —
   * so a view tints instead. `SPRITE_PLAN_V0.4.1.md` §7.
   */
  flash(colour: number, durationMs: number): void {
    if (!this.image.active) return;
    this.animation.transient = {
      state: "hit",
      untilMs: this.image.scene.time.now + durationMs,
    };
    this.setState("hit");
    this.image.setTintFill(colour);
    this.image.scene.time.delayedCall(durationMs, () => {
      if (this.image.active) this.image.clearTint();
    });
  }

  /** Copy the actor's transform. Called once per frame while the view lives. */
  sync(): void {
    if (this.detached || !this.image.active) return;
    const source = this.source;
    const deltaX = source.x - this.previousX;
    const deltaY = source.y - this.previousY;
    const usesPlayerCycle = this.definition.frames >= 8;
    const body = (source as SpriteViewSource & {
      body?: Readonly<{ velocity?: Readonly<{ x: number; y: number }> }> | null;
    }).body;
    const velocityX = body?.velocity?.x ?? 0;
    const velocityY = body?.velocity?.y ?? 0;
    const movedDistance = Math.hypot(deltaX, deltaY);
    // Velocity supplies the movement state even on render ticks where the
    // physics position has not advanced. Distance remains the sole cadence
    // input, so animation can never affect simulation.
    const moving =
      movedDistance > 0.01 || Math.abs(velocityX) + Math.abs(velocityY) > 0.01;
    const horizontalMotion = Math.abs(velocityX) > 0.01 ? velocityX : deltaX;
    if (usesPlayerCycle || this.animateMovement) {
      this.flipX = resolveSpriteFlipX(this.flipX, horizontalMotion);
    }
    this.previousX = source.x;
    this.previousY = source.y;
    this.image.setPosition(source.x, source.y);
    this.image.setRotation(source.rotation);
    this.image.setScale(
      this.baseScaleX * source.scaleX,
      this.baseScaleY * source.scaleY,
    );
    this.image.setFlipX(this.flipX);
    this.image.setAlpha(source.alpha);
    this.image.setDepth(source.depth);
    if (usesPlayerCycle) {
      const next = advancePlayerMovementFrame(
        { step: this.playerStep, distance: this.playerDistance },
        movedDistance,
        moving,
      );
      this.playerStep = next.step;
      this.playerDistance = next.distance;
      const transient = this.animation.transient;
      if (transient && this.image.scene.time.now < transient.untilMs) {
        this.setState(transient.state);
      } else {
        this.setFrame(next.frame);
      }
    } else {
      this.animation.moving = this.animateMovement && moving;
      const state = resolveAnimatedSpriteState(this.image.scene.time.now, this.animation);
      this.setState(state);
    }
  }

  private setFrame(frame: number): void {
    if (!this.image.active || this.renderedFrame === frame) return;
    this.renderedFrame = frame;
    this.image.setFrame(runtimeFrame(this.definition, frame));
  }

  /**
   * Leave the broken frame behind briefly while gameplay destroys the actor.
   * The view is unregistered first, so it no longer follows or occupies any
   * simulation entity/capacity; Phaser owns only this short visual remnant.
   */
  releaseDeath(): void {
    if (this.detached || !this.image.active) return;
    this.sync();
    this.detached = true;
    this.source.off(Phaser.GameObjects.Events.DESTROY, this.sourceDestroyHandler);
    unregister(this.image.scene, this);
    this.setState("death");
    this.image.scene.time.delayedCall(SPRITE_DEATH_FRAME_MS, () => {
      if (this.image.active) this.image.destroy();
    });
  }

  destroy(): void {
    this.source.off(Phaser.GameObjects.Events.DESTROY, this.sourceDestroyHandler);
    unregister(this.image.scene, this);
    if (this.image.active) this.image.destroy();
  }
}

/**
 * Build a view if this pack has a sprite for the id, and nothing otherwise.
 *
 * `undefined` is the normal answer for most content most of the time: the
 * roster grows faster than the art does, and an actor with no sprite renders
 * its primitive, which is correct rather than missing.
 */
export function createSpriteView(
  source: SpriteViewSource,
  tokens: Pick<ThemeTokens, "sprites">,
  contentId: ContentId,
  options: SpriteViewOptions,
): SpriteView | undefined {
  const definition = resolveSprite(tokens, contentId);
  if (!definition) return undefined;
  return new SpriteView(source, definition, options);
}

/**
 * One sync pass per scene per frame.
 *
 * Installed by the first view a scene creates rather than by the scene itself,
 * so a scene with no sprites carries no handler and needs no wiring. With an
 * empty manifest nothing here ever runs.
 */
const registries = new WeakMap<Phaser.Scene, Set<SpriteView>>();

function register(scene: Phaser.Scene, view: SpriteView): void {
  const existing = registries.get(scene);
  if (existing) {
    existing.add(view);
    return;
  }

  const views = new Set<SpriteView>([view]);
  registries.set(scene, views);
  const sync = (): void => {
    for (const entry of views) entry.sync();
  };
  scene.events.on(Phaser.Scenes.Events.POST_UPDATE, sync);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.events.off(Phaser.Scenes.Events.POST_UPDATE, sync);
    views.clear();
    registries.delete(scene);
  });
}

function unregister(scene: Phaser.Scene, view: SpriteView): void {
  registries.get(scene)?.delete(view);
}
