import { eliteIds } from "../../../core/archetypes/categories";
import type { EliteDefinition } from "../../../core/archetypes/contracts";

export const elites = [{
  id: eliteIds.baseline,
  healthMultiplier: 2,
  damageMultiplier: 1.5,
  rewardMultiplier: 2,
  radiusMultiplier: 1.3,
  presentationToken: "elite",
}] as const satisfies readonly EliteDefinition[];
