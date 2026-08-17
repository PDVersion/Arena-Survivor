import { archetypeIds } from "../../../core/archetypes/ids";
import type { EnemyDefinition } from "../../../core/archetypes/contracts";

export const enemies = [
  {
    id: archetypeIds.enemy.swarmBasic,
    maxHealth: 20,
    moveSpeed: 140,
    contactDamage: 10,
    contactCooldownMs: 1000,
    radius: 14,
    xpReward: 1,
    geometry: "circle",
    presentationToken: "enemy",
  },
  {
    id: archetypeIds.enemy.fastFragile,
    maxHealth: 10,
    moveSpeed: 240,
    contactDamage: 8,
    contactCooldownMs: 1000,
    radius: 10,
    xpReward: 2,
    geometry: "triangle",
    presentationToken: "enemyFast",
  },
  {
    id: archetypeIds.enemy.slowDurable,
    maxHealth: 80,
    moveSpeed: 90,
    contactDamage: 20,
    contactCooldownMs: 1000,
    radius: 22,
    xpReward: 7,
    geometry: "square",
    presentationToken: "enemyTank",
  },
  {
    id: archetypeIds.enemy.deathSpawner,
    maxHealth: 50,
    moveSpeed: 110,
    contactDamage: 12,
    contactCooldownMs: 1000,
    radius: 25,
    xpReward: 5,
    geometry: "hexagon",
    presentationToken: "enemySpawner",
    deathSpawn: {
      enemyId: archetypeIds.enemy.fastFragile,
      count: 5,
      rewardMultiplier: 0.5,
    },
  },
] as const satisfies readonly EnemyDefinition[];
