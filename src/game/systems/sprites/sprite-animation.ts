import type { SpriteState } from "../../core/archetypes/contracts";

/** Presentation timing only: no simulation reads these values. */
export const SPRITE_MOVE_FRAME_MS = 180;
export const SPRITE_PLAYER_MOVE_FRAME_MS = 120;
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

/** Frames 0–3 are the authored player walk cycle; frame 4 is idle. */
export function resolvePlayerMovementFrame(nowMs: number, moving: boolean): number {
  if (!moving) return 4;
  return Math.floor(Math.max(0, nowMs) / SPRITE_PLAYER_MOVE_FRAME_MS) % 4;
}
