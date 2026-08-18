import { archetypeIds } from "../../../core/archetypes/ids";
import type { EnemyDefinition } from "../../../core/archetypes/contracts";

/**
 * Move speed was cut roughly 10% across the roster after V0.3 play testing, in
 * step with the production pack: this theme shares the roster shape, the player
 * speed, and REC-049's spawn envelope, so the closing-speed ceiling binds it
 * identically. Health, contact harm, and rewards are unchanged — only speed
 * moved, and only because the crowd closed faster than it could be read.
 *
 *   role         was    now    ring crossing    vs player 200
 *   Grunt        140    124          7.7 s      0.62x
 *   Runner       240    210          4.6 s      1.05x
 *   Tank          90     84         11.4 s      0.42x
 *   Broodmother  110     98          9.8 s      0.49x
 */
export const enemies = [
  {
    id: archetypeIds.enemy.swarmBasic,
    maxHealth: 20,
    moveSpeed: 124,
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
    moveSpeed: 210,
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
    moveSpeed: 84,
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
    moveSpeed: 98,
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
