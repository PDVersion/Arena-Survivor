import type { SpriteDefinition, SpriteState } from "../../core/archetypes/contracts";

/** Presentation timing only: no simulation reads these values. */
export const SPRITE_MOVE_FRAME_MS = 320;
export const SPRITE_PLAYER_FRAME_DISTANCE = 60;
export const SPRITE_DEATH_FRAME_MS = 220;

export interface SpriteAnimationState {
  readonly moving: boolean;
  readonly phaseMs: number;
  readonly transient?: Readonly<{
    state: SpriteState;
    untilMs: number;
  }>;
}

/** Resolve a named state without exposing sheet indices to an actor. */
export function resolveAnimatedSpriteState(
  nowMs: number,
  animation: SpriteAnimationState,
): SpriteState {
  if (animation.transient && nowMs < animation.transient.untilMs) {
    return animation.transient.state;
  }
  if (!animation.moving) return "idle";
  const step = Math.floor((Math.max(0, nowMs) + animation.phaseMs) / SPRITE_MOVE_FRAME_MS);
  return step % 2 === 0 ? "idle" : "move";
}

export interface PlayerMovementAnimation {
  readonly step: number;
  readonly distance: number;
  readonly frame: number;
}

/**
 * Advance the authored 0→1→2→1 walk by travelled distance.
 *
 * The theme authors the stride for its sheet (the legacy default is 60 units).
 * At most one pose advances per update, so a long frame or overlay resume can
 * never flash through several poses before the player sees one.
 */
export function advancePlayerMovementFrame(
  previous: Readonly<{ step: number; distance: number }>,
  movedDistance: number,
  moving = movedDistance > 0.01,
  distancePerFrame = SPRITE_PLAYER_FRAME_DISTANCE,
  cycle: readonly number[] = [0, 1, 2, 1],
): PlayerMovementAnimation {
  if (!moving) return { step: 0, distance: 0, frame: 4 };
  if (movedDistance <= 0.01) {
    return { step: previous.step, distance: previous.distance, frame: cycle[previous.step]! };
  }
  const total = previous.distance + movedDistance;
  const advances = total >= distancePerFrame ? 1 : 0;
  const step = (previous.step + advances) % cycle.length;
  return {
    step,
    distance: advances ? Math.min(total - distancePerFrame, distancePerFrame) : total,
    frame: cycle[step]!,
  };
}

/**
 * Each sheet declares its authored facing; legacy sheets default to left.
 * Motion opposite that facing mirrors it; vertical/no motion preserves
 * the last facing so a sprite never jitters around zero.
 */
export function resolveSpriteFlipX(previous: boolean, horizontalMotion: number, authoredFacing: "left" | "right" = "left"): boolean {
  if (Math.abs(horizontalMotion) <= 0.01) return previous;
  return authoredFacing === "left" ? horizontalMotion > 0 : horizontalMotion < 0;
}

/** Keep an authored anatomical anchor fixed through a pose change or mirror. */
export function resolveFrameOrigin(definition: SpriteDefinition, frame: number, mirrored: boolean): Readonly<{ x: number; y: number }> {
  const anchor = definition.frameAnchors?.[frame];
  const x = anchor ? anchor.x / definition.frameWidth : 0.5;
  return { x: mirrored ? 1 - x : x, y: anchor ? anchor.y / definition.frameHeight : 0.5 };
}
