import { archetypeIds } from "../../../core/archetypes/ids";
import type { ShrineDefinition } from "../../../core/archetypes/contracts";
import type { ShrinesTuning } from "../../../core/archetypes/tuning";

export const shrines = [
  {
    id: archetypeIds.shrine.spawnSurge,
    radius: 24,
    interactionRadius: 120,
    spawnCount: 100,
    spawnDurationMs: 20_000,
    rewardMultiplier: 1.5,
    effectKind: "spawn_surge",
    chaosIncrease: 0.4,
    enemySpawnMultiplier: 1,
    xpMultiplier: 1,
    presentationToken: "shrine",
  },
  {
    id: archetypeIds.shrine.greed,
    radius: 24, interactionRadius: 120,
    spawnCount: 0, spawnDurationMs: 0, rewardMultiplier: 1,
    effectKind: "world_multiplier", chaosIncrease: 0.4,
    enemySpawnMultiplier: 1.5, xpMultiplier: 1.25,
    presentationToken: "shrine",
  },
  {
    id: archetypeIds.shrine.multiplicity,
    radius: 24, interactionRadius: 120,
    spawnCount: 0, spawnDurationMs: 0, rewardMultiplier: 1,
    effectKind: "world_multiplier", chaosIncrease: 0.7,
    enemySpawnMultiplier: 2, xpMultiplier: 1.5,
    presentationToken: "shrine",
  },
  {
    id: archetypeIds.shrine.duplication,
    radius: 24, interactionRadius: 120,
    spawnCount: 0, spawnDurationMs: 0, rewardMultiplier: 1.5,
    effectKind: "duplicate_living", chaosIncrease: 1,
    enemySpawnMultiplier: 1, xpMultiplier: 1,
    presentationToken: "shrine",
  },
  {
    id: archetypeIds.shrine.escalation,
    radius: 24, interactionRadius: 120,
    spawnCount: 0, spawnDurationMs: 0, rewardMultiplier: 1,
    effectKind: "world_multiplier", chaosIncrease: 1.2,
    enemySpawnMultiplier: 1, xpMultiplier: 1.4,
    presentationToken: "shrine",
  },
] as const satisfies readonly ShrineDefinition[];

/** G3 optional destinations in the current800×450 world view at2×zoom.
 * Center distance480–800 costs2.4–4sim seconds at base speed before obstacles.
 * Placement remains bounded; corner/crowding fallback can relax the band.
 * One instance per definition avoids repeating a permanent doubling site.
 */
export const shrineTuning = {
  edgeMargin: 160,
  minSeparation: 360,
  minDistanceFromPlayer: 480,
  maxDistanceFromPlayer: 800,
  placementAttempts: 24,
  arrivals: [
    { shrineId: archetypeIds.shrine.spawnSurge, appearAt: 0.16 },
    { shrineId: archetypeIds.shrine.greed, appearAt: 0.40 },
    { shrineId: archetypeIds.shrine.multiplicity, appearAt: 0.66 },
    { shrineId: archetypeIds.shrine.duplication, appearAt: 0.84 },
    { shrineId: archetypeIds.shrine.escalation, appearAt: 0.90 },
  ],
} as const satisfies ShrinesTuning;
