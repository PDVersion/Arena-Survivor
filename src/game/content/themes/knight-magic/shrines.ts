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
    presentationToken: "shrine",
  },
] as const satisfies readonly ShrineDefinition[];
