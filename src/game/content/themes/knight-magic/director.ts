import { archetypeIds } from "../../../core/archetypes/ids";
import type { DirectorTuning } from "../../../core/archetypes/tuning";

/**
 * Curves, not a phase list. Everything resolves from normalized run progress,
 * so a run of any length restretches without new authoring.
 *
 * Held in step with the production pack so this theme stays a real balance
 * regression target rather than a stale fixture. Derived shape at five minutes,
 * computed from these coefficients and asserted by `tests/unit/director`:
 *
 *   progress  interval  batch  composition                      elite
 *   0.0        900 ms     1    swarm 100%                        0%
 *   0.2        737 ms     1    swarm 74% · fast 26%              0%
 *   0.4        603 ms     2    swarm 64% · fast 26% · slow 10%   0%
 *   0.6        494 ms     2    + spawner 7%                      0%
 *   0.8        404 ms     3    swarm 43% · fast 27% · slow 17%   4%
 *   1.0        331 ms     4    swarm 33% · fast 28% · slow 22%   8%
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
