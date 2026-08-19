import Phaser from "phaser";
import type { SpriteDefinition, SpriteState, ThemeTokens } from "../../core/archetypes/contracts";
import type { ContentId } from "../../core/archetypes/ids";
import { resolveSprite } from "./resolve-sprite";

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
   * The drawn diameter, derived from the definition's radius.
   *
   * The sprite is scaled to fit the simulation's size. The simulation is never
   * scaled to fit the sprite — that direction is the rule the whole split
   * depends on.
   */
  readonly diameter: number;
  /** Frame shown before any state is played. Defaults to `idle`. */
  readonly initialState?: SpriteState;
}

export class SpriteView {
  readonly image: Phaser.GameObjects.Sprite;
  private readonly source: SpriteViewSource;
  private readonly frameWidth: number;
  private readonly frameHeight: number;
  private baseScaleX: number;
  private baseScaleY: number;

  constructor(
    source: SpriteViewSource,
    definition: SpriteDefinition,
    options: SpriteViewOptions,
  ) {
    const scene = source.scene;
    const state = options.initialState ?? "idle";
    this.source = source;
    this.frameWidth = definition.frameWidth;
    this.frameHeight = definition.frameHeight;
    this.baseScaleX = options.diameter / definition.frameWidth;
    this.baseScaleY = options.diameter / definition.frameHeight;
    this.image = scene.add.sprite(source.x, source.y, definition.key, definition.states[state]);
    // The primitive stays alive and keeps its body; it simply stops drawing.
    source.setVisible(false);
    this.sync();
    register(scene, this);
    source.once(Phaser.GameObjects.Events.DESTROY, () => this.destroy());
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
  setState(definition: SpriteDefinition, state: SpriteState): void {
    if (this.image.active) this.image.setFrame(definition.states[state]);
  }

  /**
   * The damage flash, against a texture.
   *
   * The primitive version sets a fill colour, which does nothing to a sprite —
   * so a view tints instead. `SPRITE_PLAN_V0.4.1.md` §7.
   */
  flash(colour: number, durationMs: number): void {
    if (!this.image.active) return;
    this.image.setTintFill(colour);
    this.image.scene.time.delayedCall(durationMs, () => {
      if (this.image.active) this.image.clearTint();
    });
  }

  /** Copy the actor's transform. Called once per frame while the view lives. */
  sync(): void {
    const source = this.source;
    this.image.setPosition(source.x, source.y);
    this.image.setRotation(source.rotation);
    this.image.setScale(this.baseScaleX * source.scaleX, this.baseScaleY * source.scaleY);
    this.image.setAlpha(source.alpha);
    this.image.setDepth(source.depth);
  }

  destroy(): void {
    unregister(this.image.scene, this);
    this.image.destroy();
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
