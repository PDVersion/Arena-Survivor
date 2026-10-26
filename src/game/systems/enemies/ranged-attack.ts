import type { RangedAttackDefinition } from "../../core/archetypes/contracts";
export type AttackPhase = "approach" | "prepare" | "release" | "recover";
export interface RangedAttackState {
  readonly phase: AttackPhase;
  readonly elapsedMs: number;
  readonly headingX: number;
  readonly headingY: number;
}
export const createRangedAttackState = (): RangedAttackState => ({ phase: "approach", elapsedMs: 0, headingX: 1, headingY: 0 });

/** One boundary per tick preserves the full warning even after a stalled frame.
 * Aim locks at preparation, never tracks the player during warning or flight. */
export function advanceRangedAttack(state: RangedAttackState, attack: RangedAttackDefinition, deltaMs: number,
  origin: Readonly<{ x: number; y: number }>, target: Readonly<{ x: number; y: number }>,
): Readonly<{ state: RangedAttackState; fire: boolean }> {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) return { state, fire: false };
  if (state.phase === "approach") {
    const dx = target.x - origin.x, dy = target.y - origin.y, length = Math.hypot(dx, dy);
    if (length > attack.triggerRange) return { state, fire: false };
    return { state: { phase: "prepare", elapsedMs: 0, headingX: length ? dx / length : 1, headingY: length ? dy / length : 0 }, fire: false };
  }
  const duration = state.phase === "prepare" ? attack.telegraphMs : state.phase === "release" ? attack.releaseMs : attack.recoveryMs;
  const elapsedMs = state.elapsedMs + deltaMs;
  if (elapsedMs < duration) return { state: { ...state, elapsedMs }, fire: false };
  const phase = state.phase === "prepare" ? "release" : state.phase === "release" ? "recover" : "approach";
  return { state: { ...state, phase, elapsedMs: 0 }, fire: phase === "release" };
}

/** First swept-circle impact, or Infinity for a miss. Keeps obstacle order truthful. */
export function shotHitFraction(from: Readonly<{ x: number; y: number }>, to: Readonly<{ x: number; y: number }>,
  target: Readonly<{ x: number; y: number; radius: number }>, radius: number): number {
  const dx = to.x - from.x, dy = to.y - from.y;
  const ox = from.x - target.x, oy = from.y - target.y;
  const c = ox * ox + oy * oy - (target.radius + radius) ** 2;
  if (c <= 0) return 0;
  const a = dx * dx + dy * dy;
  if (a === 0) return Infinity;
  const b = 2 * (ox * dx + oy * dy), discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return Infinity;
  const t = (-b - Math.sqrt(discriminant)) / (2 * a);
  return t >= 0 && t <= 1 ? t : Infinity;
}
