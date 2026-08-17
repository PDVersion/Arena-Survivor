import { archetypeIds } from "../../../core/archetypes/ids";
import type { DirectorTuning } from "../../../core/archetypes/tuning";

/**
 * Curves, not a phase list. Everything resolves from normalized run progress,
 * so a run of any length restretches without new authoring.
 *
 * Derived shape at five minutes — computed from these coefficients, not
 * authored, and asserted by `tests/unit/director`:
 *
 *   remaining  interval  batch  composition                              elite
 *   5:00        900 ms     1    bottle 100%                               0%
 *   4:00        737 ms     1    bottle 74% · bag 26%                      0%
 *   3:00        603 ms     2    bottle 64% · bag 26% · glass 10%          0%
 *   2:00        494 ms     2    bottle 53% · bag 26% · glass 14% · bag 7% 0%
 *   1:00        404 ms     3    bottle 43% · bag 27% · glass 17% · 12%    4%
 *   0:00        331 ms     4    bottle 33% · bag 28% · glass 22% · 17%    8%
 */
export const director = {
  baseIntervalMs: 900,
  minIntervalMs: 300,
  intervalDecayK: 1,
  batchRamp: 3,
  batchSpreadRadians: 0.5,
  eliteUnlockAt: 0.6,
  maxBaselineEliteChance: 0.08,
  waveBurstBase: 15,
  waveBurstGrowth: 15,
  spawnMargin: 100,
  roles: [
    // The baseline swarm, thinning as a share as heavier roles arrive.
    {
      enemyId: archetypeIds.enemy.swarmBasic,
      unlockAt: 0,
      baseWeight: 100,
      weightGrowth: -0.65,
      chaosWeightBias: 0,
    },
    {
      enemyId: archetypeIds.enemy.fastFragile,
      unlockAt: 0.2,
      baseWeight: 30,
      weightGrowth: 0,
      chaosWeightBias: 0.1,
    },
    {
      enemyId: archetypeIds.enemy.slowDurable,
      unlockAt: 0.4,
      baseWeight: 12,
      weightGrowth: 0.9,
      chaosWeightBias: 0.35,
    },
    {
      enemyId: archetypeIds.enemy.deathSpawner,
      unlockAt: 0.45,
      baseWeight: 5,
      weightGrowth: 2.6,
      chaosWeightBias: 0.5,
    },
  ],
} as const satisfies DirectorTuning;
