import { archetypeIds } from "../../../core/archetypes/ids";
import type { BodiesTuning } from "../../../core/archetypes/tuning";

/**
 * Physical presence in the crowd.
 *
 * Separation radius is deliberately smaller than the drawn radius, so light
 * litter still bunches while heavy items hold their ground:
 *
 *   role            draw   scale   effective   mass
 *   Microplastics     10    0.72         7.2    0.6
 *   Plastic Bottle    14    0.88        12.3    1.0
 *   Glass Bottle      22    1.00        22.0    4.0
 *   Bagged Waste      25    1.00        25.0    3.0
 *
 * The light roles were raised after play testing: a detonation clearing a large
 * pocket let the retained spawn backlog refill it all at once, and at the old
 * scales the arrivals read as one blob rather than a crowd. They still bunch —
 * every scale is at or below the drawn radius, so bodies touch — but they no
 * longer sit inside each other. See REC-067.
 *
 * Material fragments have their own authored role and footprint.
 */
export const bodies = {
  // Comfortably more than twice the largest separation radius (22 x 1.3 elite).
  cellSize: 72,
  maxNeighbours: 8,
  // Must exceed the per-frame distance chase covers (~1.7 units at 104/s and
  // 60fps) or a crowd converging on the player out-pulls separation and the
  // pile never resolves. Clamped on the frame total, not per neighbour, so in a
  // deep pile this is the binding constraint rather than the separation radius:
  // raised with the radii in REC-067 so the two work together. `maxNeighbours`
  // is deliberately untouched — it is the per-frame cost driver the 300-entity
  // budget in REC-040 was measured against.
  maxDisplacement: 8,
  eliteMassMultiplier: 2,
  contactKnockbackImpulse: 18,
  contactKnockbackCooldownMs: 350,
  roles: [
    { enemyId: archetypeIds.enemy.fastFragile, separationScale: 0.72, mass: 0.6 },
    { enemyId: archetypeIds.enemy.swarmBasic, separationScale: 0.88, mass: 1 },
    { enemyId: archetypeIds.enemy.slowDurable, separationScale: 1, mass: 4 },
    { enemyId: archetypeIds.enemy.deathSpawner, separationScale: 1, mass: 3 },
    { enemyId: archetypeIds.enemy.stationaryFragment, separationScale: 0.9, mass: 2 },
  ],
} as const satisfies BodiesTuning;
