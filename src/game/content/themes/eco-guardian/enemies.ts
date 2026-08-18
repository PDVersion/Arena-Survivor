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
 * Move speed was cut roughly 10% across the roster after V0.3 play testing:
 * the whole crowd closed too fast to read, and kiting stopped being a decision.
 * The cut is not uniform, because REC-049's envelope binds the slow end — a
 * role must still cross the 958-unit spawn ring within twelve seconds, and the
 * opening role within eight — so the glass bottle takes the smallest cut and
 * the two fastest roles take the largest. Exactly one role still outruns the
 * player, which is the property REC-050 depends on.
 *
 *   role            was    now    ring crossing    vs player 200
 *   Plastic Bottle  140    124          7.7 s      0.62x
 *   Plastic Bag     240    210          4.6 s      1.05x
 *   Glass Bottle     90     84         11.4 s      0.42x
 *   Bagged Waste    110     98          9.8 s      0.49x
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
    // Plastic bag — ~20 years. Light, wind-blown, and fragile.
    id: archetypeIds.enemy.fastFragile,
    maxHealth: 11,
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
    // Glass bottle — effectively permanent, and chemically inert. The wall
    // that barely hurts: the highest health in the roster with the lowest
    // contact harm of any large enemy.
    id: archetypeIds.enemy.slowDurable,
    maxHealth: 96,
    moveSpeed: 84,
    contactDamage: 9,
    contactCooldownMs: 1000,
    radius: 22,
    xpReward: 7,
    armour: 40,
    geometry: "square",
    presentationToken: "enemyTank",
  },
  {
    // Bagged mixed waste — ~1,000 years. Compaction and the anaerobic
    // conditions inside a sealed bag slow breakdown well past the bag film
    // itself. Its threat is what it releases, not its own durability.
    id: archetypeIds.enemy.deathSpawner,
    maxHealth: 24,
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
