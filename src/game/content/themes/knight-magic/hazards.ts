import { archetypeIds } from "../../../core/archetypes/ids";
import type { HazardDefinition } from "../../../core/archetypes/contracts";
import type { HazardsTuning } from "../../../core/archetypes/tuning";

/**
 * Three hazards, deliberately no more.
 *
 * Every one telegraphs before it can hurt anything: an untelegraphed hazard
 * inside a dense swarm is indistinguishable from a bug.
 */
export const hazards = [
  {
    // A spill that lingers and drags at anything wading through it.
    id: archetypeIds.hazard.damageZone,
    kind: "damage_zone",
    radius: 110,
    telegraphMs: 900,
    lifetimeMs: 9_000,
    damage: 4,
    tickMs: 500,
    slowMultiplier: 0.6,
    presentationToken: "explosion",
  },
  {
    // Solid cover that has to be cleared, and blocks shots until it is.
    id: archetypeIds.hazard.obstacle,
    kind: "obstacle",
    radius: 46,
    telegraphMs: 600,
    health: 120,
    presentationToken: "grid",
  },
  {
    // Harmless between bursts, so the telegraph is the whole warning.
    id: archetypeIds.hazard.periodicBurst,
    kind: "periodic_burst",
    radius: 96,
    telegraphMs: 800,
    lifetimeMs: 14_000,
    damage: 14,
    cycleMs: 2_400,
    presentationToken: "shrine",
  },
] as const satisfies readonly HazardDefinition[];

/** Placement cadence and mix, escalating with progress and Pollution. */
export const hazardTuning = {
  maxActive: 6,
  baseIntervalMs: 22_000,
  minIntervalMs: 7_000,
  intervalDecayK: 0.9,
  chaosIntervalBias: 0.25,
  minDistanceFromPlayer: 320,
  weights: [
    { hazardId: archetypeIds.hazard.damageZone, weight: 45 },
    { hazardId: archetypeIds.hazard.obstacle, weight: 35 },
    { hazardId: archetypeIds.hazard.periodicBurst, weight: 20 },
  ],
} as const satisfies HazardsTuning;
