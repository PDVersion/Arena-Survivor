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
 * Move speed has come down three times since V0.3 shipped, and this pass also
 * changed what the fast role is *for*. It used to sit just above the player so
 * it could not be outrun; it now sits just below, so standing still loses
 * ground while moving keeps you ahead. It forces movement without overrunning.
 *
 *   role            V0.3    now    ring crossing    vs player 200
 *   Plastic Bottle   140    104          9.2 s      0.52x
 *   Plastic Bag      240    190          5.0 s      0.95x
 *   Glass Bottle      90     70         13.7 s      0.35x
 *   Bagged Waste     110     80         12.0 s      0.40x
 *
 * Ring crossing is time to cross the 958-unit spawn ring from a standing start.
 * The floor that governs it is now shaped by role rather than being one number:
 * the opening role is the entire roster for the first minute, so its crossing
 * time is literally how long a run has nothing in it and it is held tightest.
 * The heavy roles unlock deep into the run, when the field already holds dozens
 * of enemies, so a long crossing is their identity rather than dead time. See
 * REC-066.
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
    // Plastic bag — ~20 years. Light, wind-blown, and fragile.
    id: archetypeIds.enemy.fastFragile,
    maxHealth: 11,
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
    // Glass bottle — effectively permanent, and chemically inert. The wall
    // that barely hurts: the highest health in the roster with the lowest
    // contact harm of any large enemy.
    id: archetypeIds.enemy.slowDurable,
    maxHealth: 96,
    moveSpeed: 70,
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
