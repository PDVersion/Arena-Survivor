import type { HazardDefinition } from "../../core/archetypes/contracts";
import type { HazardId } from "../../core/archetypes/ids";
import type { HazardsTuning } from "../../core/archetypes/tuning";

/**
 * Arena hazards.
 *
 * World content rather than enemies: they never count toward the enemy cap,
 * never award kills, and never enter the damage ledger as enemy damage. They
 * exist so positioning matters for reasons other than avoiding enemies.
 *
 * Everything here is pure. The scene owns actors and rendering; this owns
 * scheduling, lifecycle, and what a hazard does to whoever is standing in it.
 */

export type HazardPhase = "telegraphing" | "active" | "expired";

export interface HazardState {
  readonly id: string;
  readonly definitionId: HazardId;
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly spawnedAtMs: number;
  /** Health remaining for a destructible obstacle; `0` for other kinds. */
  health: number;
  /** Simulation time the next damage tick or burst is due. */
  nextTickAtMs: number;
}

/** How often a new hazard is placed, tightening with progress and Pollution. */
export function hazardIntervalMs(
  tuning: HazardsTuning,
  progress: number,
  chaosPressure = 0,
): number {
  const decayed = tuning.baseIntervalMs * Math.exp(-tuning.intervalDecayK * Math.max(0, progress));
  const pressured = decayed / (1 + Math.max(0, chaosPressure) * tuning.chaosIntervalBias);
  return Math.max(tuning.minIntervalMs, pressured);
}

/** Deterministic weighted choice of which hazard to place. */
export function selectHazard(
  tuning: HazardsTuning,
  random: () => number,
): HazardId | undefined {
  const total = tuning.weights.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
  if (total <= 0) return undefined;
  let roll = Math.min(Math.max(random(), 0), 1 - Number.EPSILON) * total;
  for (const entry of tuning.weights) {
    roll -= Math.max(0, entry.weight);
    if (roll < 0) return entry.hazardId;
  }
  return tuning.weights.at(-1)?.hazardId;
}

export function hazardPhase(
  definition: HazardDefinition,
  state: HazardState,
  nowMs: number,
): HazardPhase {
  const age = nowMs - state.spawnedAtMs;
  if (age < definition.telegraphMs) return "telegraphing";
  if (definition.kind === "obstacle") return state.health > 0 ? "active" : "expired";
  return age < definition.telegraphMs + definition.lifetimeMs ? "active" : "expired";
}

export function isInsideHazard(
  state: HazardState,
  point: Readonly<{ x: number; y: number }>,
  pointRadius = 0,
): boolean {
  const reach = state.radius + pointRadius;
  return (state.x - point.x) ** 2 + (state.y - point.y) ** 2 <= reach * reach;
}

export interface HazardEffect {
  readonly damage: number;
  /** Movement multiplier, `1` when nothing slows the target. */
  readonly moveMultiplier: number;
}

const NO_EFFECT: HazardEffect = Object.freeze({ damage: 0, moveMultiplier: 1 });

/**
 * What a single hazard does to a target this frame.
 *
 * Advances the hazard's tick clock, so a caller must invoke it once per frame
 * per hazard. A telegraphing hazard never harms anything — an untelegraphed
 * hazard inside a 300-enemy swarm is indistinguishable from a bug.
 */
export function resolveHazardEffect(
  definition: HazardDefinition,
  state: HazardState,
  target: Readonly<{ x: number; y: number; radius: number }>,
  nowMs: number,
): HazardEffect {
  if (hazardPhase(definition, state, nowMs) !== "active") return NO_EFFECT;
  if (definition.kind === "obstacle") return NO_EFFECT;
  if (!isInsideHazard(state, target, target.radius)) return NO_EFFECT;

  if (definition.kind === "damage_zone") {
    if (nowMs < state.nextTickAtMs) {
      return { damage: 0, moveMultiplier: definition.slowMultiplier };
    }
    state.nextTickAtMs = nowMs + definition.tickMs;
    return { damage: definition.damage, moveMultiplier: definition.slowMultiplier };
  }

  // periodic_burst: harmless between bursts, so the telegraph is the warning.
  if (nowMs < state.nextTickAtMs) return NO_EFFECT;
  state.nextTickAtMs = nowMs + definition.cycleMs;
  return { damage: definition.damage, moveMultiplier: 1 };
}

/**
 * A steering nudge that carries a chaser around an obstacle.
 *
 * One tangential vector adjustment, no pathfinding: enough to stop a crowd
 * piling permanently against a wall without paying for navigation.
 */
export function avoidObstacle(
  from: Readonly<{ x: number; y: number }>,
  desired: Readonly<{ x: number; y: number }>,
  obstacle: Readonly<{ x: number; y: number; radius: number }>,
  bodyRadius: number,
): Readonly<{ x: number; y: number }> {
  const toObstacleX = obstacle.x - from.x;
  const toObstacleY = obstacle.y - from.y;
  const distance = Math.hypot(toObstacleX, toObstacleY);
  const clearance = obstacle.radius + bodyRadius;
  if (distance === 0 || distance > clearance * 2) return desired;

  const speed = Math.hypot(desired.x, desired.y);
  if (speed === 0) return desired;

  // Only steer when actually heading into it.
  const normalX = toObstacleX / distance;
  const normalY = toObstacleY / distance;
  const approach = (desired.x * normalX + desired.y * normalY) / speed;
  if (approach <= 0) return desired;

  // Slide along whichever tangent keeps the current heading.
  const tangentX = -normalY;
  const tangentY = normalX;
  const side = desired.x * tangentX + desired.y * tangentY >= 0 ? 1 : -1;
  const blend = Math.min(1, clearance / distance - 0.5);
  const steerX = desired.x + tangentX * side * speed * blend;
  const steerY = desired.y + tangentY * side * speed * blend;
  const steerLength = Math.hypot(steerX, steerY);
  if (steerLength === 0) return desired;
  return { x: (steerX / steerLength) * speed, y: (steerY / steerLength) * speed };
}
