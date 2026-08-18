import { archetypeIds } from "../../../core/archetypes/ids";
import type { EnemyDefinition } from "../../../core/archetypes/contracts";

/**
 * Move speed was cut twice after V0.3 play testing, in step with the production
 * pack: this theme shares the roster shape, the player speed, and REC-049's
 * spawn envelope, so the same band binds it identically. Health, contact harm,
 * and rewards are unchanged — only speed moved, and only because the crowd
 * closed faster than it could be read. See REC-058 and REC-061.
 *
 *   role         V0.3    now    ring crossing    vs player 200
 *   Grunt         140    112          8.6 s      0.56x
 *   Runner        240    204          4.7 s      1.02x
 *   Tank           90     76         12.6 s      0.38x
 *   Broodmother   110     88         10.9 s      0.44x
 */
export const enemies = [
  {
    id: archetypeIds.enemy.swarmBasic,
    maxHealth: 20,
    moveSpeed: 112,
    contactDamage: 10,
    contactCooldownMs: 1000,
    radius: 14,
    xpReward: 1,
    armour: 0,
    geometry: "circle",
    presentationToken: "enemy",
  },
  {
    id: archetypeIds.enemy.fastFragile,
    maxHealth: 10,
    moveSpeed: 204,
    contactDamage: 8,
    contactCooldownMs: 1000,
    radius: 10,
    xpReward: 2,
    armour: 0,
    geometry: "triangle",
    presentationToken: "enemyFast",
  },
  {
    id: archetypeIds.enemy.slowDurable,
    maxHealth: 80,
    moveSpeed: 76,
    contactDamage: 20,
    contactCooldownMs: 1000,
    radius: 22,
    xpReward: 7,
    armour: 40,
    geometry: "square",
    presentationToken: "enemyTank",
  },
  {
    id: archetypeIds.enemy.deathSpawner,
    maxHealth: 50,
    moveSpeed: 88,
    contactDamage: 12,
    contactCooldownMs: 1000,
    radius: 25,
    xpReward: 5,
    armour: 10,
    geometry: "hexagon",
    presentationToken: "enemySpawner",
    deathSpawn: {
      enemyId: archetypeIds.enemy.fastFragile,
      count: 5,
      rewardMultiplier: 0.5,
    },
  },
] as const satisfies readonly EnemyDefinition[];
