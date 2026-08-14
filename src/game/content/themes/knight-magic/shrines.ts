import { archetypeIds } from "../../../core/archetypes/ids";
import type { ShrineDefinition } from "../../../core/archetypes/contracts";

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
