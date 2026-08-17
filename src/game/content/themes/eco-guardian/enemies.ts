import { archetypeIds } from "../../../core/archetypes/ids";
import type { EnemyDefinition } from "../../../core/archetypes/contracts";

/**
 * Health is derived from how long each material persists in the environment,
 * log-scaled and normalized so the plastic bottle is the baseline:
 *
 *   health = 20 * 1.6 ^ ( log10(years) - log10(450) )
 *
 * Literal persistence is unplayable — glass outlasts food waste by roughly a
 * factor of twenty million — so the log scale keeps the ordering and the
 * intuition inside a playable band. The modelled number is the game's; the real
 * range belongs in the codex when the knowledge layer lands. Persistence
 * estimates vary widely between sources, so treat every figure below as the
 * midpoint of a range, not a measurement.
 *
 * Health and harm are deliberately decoupled. Glass is effectively permanent
 * and almost inert on contact; a light bag is fragile and fast. Role identity
 * comes from speed, harm, radius, and behaviour — the health band is narrow on
 * purpose.
 *
 * Rewards, spawn weights, and unlock timing are unchanged from V0.2 here.
 * Phase 3 owns reward scaling and Phase 4 owns the spawn director.
 */
export const enemies = [
  {
    // Plastic bottle — ~450 years. The baseline enemy, and the most prevalent
    // material in real litter counts.
    id: archetypeIds.enemy.swarmBasic,
    maxHealth: 20,
    moveSpeed: 70,
    contactDamage: 10,
    contactCooldownMs: 1000,
    radius: 14,
    xpReward: 1,
    spawnWeight: 56,
    unlockAtMs: 0,
    geometry: "circle",
    presentationToken: "enemy",
  },
  {
    // Plastic bag — ~20 years. Light, wind-blown, and fragile.
    id: archetypeIds.enemy.fastFragile,
    maxHealth: 11,
    moveSpeed: 140,
    contactDamage: 8,
    contactCooldownMs: 1000,
    radius: 10,
    xpReward: 2,
    spawnWeight: 24,
    unlockAtMs: 8_000,
    geometry: "triangle",
    presentationToken: "enemyFast",
  },
  {
    // Glass bottle — effectively permanent, and chemically inert. The wall
    // that barely hurts: the highest health in the roster with the lowest
    // contact harm of any large enemy.
    id: archetypeIds.enemy.slowDurable,
    maxHealth: 96,
    moveSpeed: 45,
    contactDamage: 9,
    contactCooldownMs: 1000,
    radius: 22,
    xpReward: 7,
    spawnWeight: 14,
    unlockAtMs: 16_000,
    geometry: "square",
    presentationToken: "enemyTank",
  },
  {
    // Bagged mixed waste — ~1,000 years. Compaction and the anaerobic
    // conditions inside a sealed bag slow breakdown well past the bag film
    // itself. Its threat is what it releases, not its own durability.
    id: archetypeIds.enemy.deathSpawner,
    maxHealth: 24,
    moveSpeed: 55,
    contactDamage: 12,
    contactCooldownMs: 1000,
    radius: 25,
    xpReward: 5,
    spawnWeight: 6,
    unlockAtMs: 24_000,
    geometry: "hexagon",
    presentationToken: "enemySpawner",
    deathSpawn: {
      enemyId: archetypeIds.enemy.fastFragile,
      count: 5,
      rewardMultiplier: 0.5,
    },
  },
] as const satisfies readonly EnemyDefinition[];
