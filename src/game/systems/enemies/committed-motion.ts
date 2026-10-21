import type { CommittedMotionDefinition } from "../../core/archetypes/contracts";

export type MotionPhase = "approach" | "telegraph" | "travel" | "recover";
export interface MotionState {
  readonly phase: MotionPhase;
  readonly elapsedMs: number;
  readonly headingX: number;
  readonly headingY: number;
}
export const createMotionState = (): MotionState => ({ phase: "approach", elapsedMs: 0, headingX: 1, headingY: 0 });

/** One boundary per update: a stalled frame cannot erase a warning or recovery. */
export function advanceCommittedMotion(
  state: MotionState, definition: CommittedMotionDefinition, deltaMs: number,
  position: Readonly<{ x: number; y: number }>, target: Readonly<{ x: number; y: number }>,
): MotionState {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) return state;
  if (state.phase === "approach") {
    const dx = target.x - position.x, dy = target.y - position.y;
    if (Math.hypot(dx, dy) > definition.triggerRange) return state;
    const angle = Math.atan2(dy, dx) + definition.aimOffsetRadians;
    return { phase: "telegraph", elapsedMs: 0, headingX: Math.cos(angle), headingY: Math.sin(angle) };
  }
  const duration = state.phase === "telegraph" ? definition.telegraphMs : state.phase === "travel" ? definition.travelMs : definition.recoveryMs;
  const elapsedMs = state.elapsedMs + deltaMs;
  if (elapsedMs < duration) return { ...state, elapsedMs };
  const phase = state.phase === "telegraph" ? "travel" : state.phase === "travel" ? "recover" : "approach";
  return { ...state, phase, elapsedMs: 0 };
}
