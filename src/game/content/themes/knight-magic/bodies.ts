import { archetypeIds } from "../../../core/archetypes/ids";
import type { BodiesTuning } from "../../../core/archetypes/tuning";

/**
 * Physical presence in the crowd.
 *
 * Separation radius is deliberately smaller than the drawn radius, so small
 * enemies still bunch and overlap while heavy ones hold their ground:
 *
 *   role            draw   scale   effective   mass   solid
 *   Runner             10    0.55         5.5    0.6   no
 *   Grunt             14    0.70         9.8    1.0   no
 *   Tank              22    1.00        22.0    4.0   yes
 *   Broodmother       25    0.95        23.8    3.0   yes
 *
 * Held in step with the production pack so this theme stays a real regression
 * target rather than a stale fixture.
 */
export const bodies = {
  // Comfortably more than twice the largest separation radius (22 x 1.3 elite).
  cellSize: 64,
  maxNeighbours: 8,
  // Must exceed the per-frame distance chase covers (~2.3 units at 140/s and
  // 60fps) or a crowd converging on the player out-pulls separation and the
  // pile never resolves. Clamped on the frame total, not per neighbour.
  maxDisplacement: 6,
  eliteMassMultiplier: 2,
  contactKnockback: 26,
  roles: [
    { enemyId: archetypeIds.enemy.fastFragile, separationScale: 0.55, mass: 0.6, solid: false },
    { enemyId: archetypeIds.enemy.swarmBasic, separationScale: 0.7, mass: 1, solid: false },
    { enemyId: archetypeIds.enemy.slowDurable, separationScale: 1, mass: 4, solid: true },
    { enemyId: archetypeIds.enemy.deathSpawner, separationScale: 0.95, mass: 3, solid: true },
  ],
} as const satisfies BodiesTuning;
