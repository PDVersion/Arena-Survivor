import { copy } from "./copy";
import { eliteIds } from "../../../core/archetypes/categories";
import type { EliteDefinition } from "../../../core/archetypes/contracts";

const baseline = {
  id: eliteIds.baseline,
  healthMultiplier: 2,
  damageMultiplier: 1.5,
  rewardMultiplier: 2.5,
  radiusMultiplier: 1.3,
  presentationToken: "elite",
} as const;

export const elites = [baseline,
  { ...baseline, id: eliteIds.split, marker: "2", ...copy.eliteVariants[eliteIds.split], split: { childCount: 2, maxDepth: 1, rewardMultiplier: 0.5 } },
  { ...baseline, id: eliteIds.shield, marker: "◇", ...copy.eliteVariants[eliteIds.shield], shield: { damageMultiplier: 0.5, untilHealthFraction: 0.5 } },
  { ...baseline, id: eliteIds.acceleration, marker: "»", ...copy.eliteVariants[eliteIds.acceleration], acceleration: { durationMs: 3000, maxSpeedMultiplier: 1.5 } },
] as const satisfies readonly EliteDefinition[];
