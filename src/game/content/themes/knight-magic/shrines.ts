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
] as const satisfies readonly ShrineDefinition[];

/**
 * Shrine arrivals and placement.
 *
 * Five instances across the run rather than five laid out at the start: the
 * V0.3 layout put every risk/reward decision inside the opening seconds, so the
 * remaining four minutes had none. Arrivals are normalized progress, so a
 * ten-minute run spreads the same five decisions without re-authoring.
 *
 * Derived arrival times at five minutes:
 *
 *   0:12  Shrine of the Horde     0:54  Shrine of Greed
 *   1:42  Shrine of Multiplicity  2:36  Shrine of Multiplicity
 *   3:36  Shrine of Duplication
 *
 * The distance band is measured against the 1600x900 view: the near edge is
 * just beyond one screen height, so a shrine is never handed to a player
 * standing still, and the far edge keeps it inside about one screen of travel.
 */
export const shrineTuning = {
  edgeMargin: 160,
  minSeparation: 620,
  minDistanceFromPlayer: 560,
  maxDistanceFromPlayer: 1_320,
  placementAttempts: 24,
  arrivals: [
    { shrineId: archetypeIds.shrine.spawnSurge, appearAt: 0.04 },
    { shrineId: archetypeIds.shrine.greed, appearAt: 0.18 },
    { shrineId: archetypeIds.shrine.multiplicity, appearAt: 0.34 },
    { shrineId: archetypeIds.shrine.multiplicity, appearAt: 0.52 },
    { shrineId: archetypeIds.shrine.duplication, appearAt: 0.72 },
  ],
} as const satisfies ShrinesTuning;
