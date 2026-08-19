import { archetypeIds } from "../../../core/archetypes/ids";
import type { EnemyDefinition } from "../../../core/archetypes/contracts";

/**
 * Move speed has come down three times since V0.3 shipped, in step with the
 * production pack: this theme shares the roster shape, the player speed, and
 * REC-049's spawn envelope. The fast role also changed purpose — it now sits
 * just below the player rather than just above, so it forces movement without
 * overrunning. Health, contact harm, and rewards are unchanged.
 *
 *   role         V0.3    now    ring crossing    vs player 200
 *   Grunt         140    104          9.2 s      0.52x
 *   Runner        240    190          5.0 s      0.95x
 *   Tank           90     70         13.7 s      0.35x
 *   Broodmother   110     80         12.0 s      0.40x
 *
 * See REC-058, REC-061, and REC-066.
 */
export const enemies = [
  {
    id: archetypeIds.enemy.swarmBasic,
    maxHealth: 20,
    moveSpeed: 104,
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
    moveSpeed: 190,
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
    moveSpeed: 70,
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
    moveSpeed: 80,
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
