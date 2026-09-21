import type { SpriteState } from "../../core/archetypes/contracts";

/** Presentation timing only: no simulation reads these values. */
export const SPRITE_MOVE_FRAME_MS = 180;
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
 * Sixty world units is 300 ms at the player's current 200-unit base speed.
 * At most one pose advances per update, so a long frame or overlay resume can
 * never flash through several poses before the player sees one.
 */
export function advancePlayerMovementFrame(
  previous: Readonly<{ step: number; distance: number }>,
  movedDistance: number,
): PlayerMovementAnimation {
  if (movedDistance <= 0.01) return { step: 0, distance: 0, frame: 4 };
  const cycle = [0, 1, 2, 1] as const;
  const total = previous.distance + movedDistance;
  const advances = total >= SPRITE_PLAYER_FRAME_DISTANCE ? 1 : 0;
  const step = (previous.step + advances) % cycle.length;
  return {
    step,
    distance: advances ? Math.min(total - SPRITE_PLAYER_FRAME_DISTANCE, SPRITE_PLAYER_FRAME_DISTANCE) : total,
    frame: cycle[step]!,
  };
}
