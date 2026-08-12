import { archetypeIds } from "../../../core/archetypes/ids";
import type { EnemyDefinition } from "../../../core/archetypes/contracts";

export const enemies = [
  {
    id: archetypeIds.enemy.swarmBasic,
    maxHealth: 20,
    moveSpeed: 70,
    contactDamage: 10,
    contactCooldownMs: 1000,
    radius: 14,
    xpReward: 1,
    presentationToken: "enemy",
  },
] as const satisfies readonly EnemyDefinition[];
