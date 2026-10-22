import { archetypeIds } from "../../../core/archetypes/ids";
import type { DirectorTuning } from "../../../core/archetypes/tuning";

/** Normalized G3 teaching/combination cadence. Knight retains its Grunt opening
 * and Runner introduction at20%; new shared roles precede the72%mini-boss.
 * Baseline elites ramp from82%to the existing8%ceiling. Optional world pressure
 * can introduce elites earlier through the same resolved director selector.
 */
export const director = {
  baseIntervalMs: 900,
  minIntervalMs: 300,
  intervalDecayK: 1,
  batchRamp: 3,
  batchSpreadRadians: 0.5,
  eliteUnlockAt: 0.82,
  maxBaselineEliteChance: 0.08,
  waveBurstBase: 15,
  waveBurstGrowth: 15,
  spawnMargin: 40,
  roles: [
    { enemyId: archetypeIds.enemy.committedCharger, waveMovement: "chase", unlockAt: 0.60,
      introductionCount: 1, baseWeight: 2, weightGrowth: 0.4, chaosWeightBias: 0 },
    { enemyId: archetypeIds.enemy.gustDrifter, waveMovement: "chase", unlockAt: 0.34,
      introductionCount: 1, baseWeight: 3, weightGrowth: 0.5, chaosWeightBias: 0 },

    // The baseline swarm, thinning as a share as heavier roles arrive.
    {
      enemyId: archetypeIds.enemy.swarmBasic,
      waveMovement: "chase",
      unlockAt: 0,
      baseWeight: 100,
      weightGrowth: -0.65,
      chaosWeightBias: 0,
    },
    // Fast pressure remains below player speed; its milestone wave keeps a
    // fixed heading instead of turning the whole pack into pursuit (REC-050).
    {
      enemyId: archetypeIds.enemy.fastFragile,
      waveMovement: "drift",
      unlockAt: 0.2,
      baseWeight: 30,
      weightGrowth: 0,
      chaosWeightBias: 0.1,
    },
    {
      enemyId: archetypeIds.enemy.slowDurable,
      waveMovement: "chase",
      unlockAt: 0.44,
      introductionCount: 4,
      baseWeight: 12,
      weightGrowth: 0.9,
      chaosWeightBias: 0.35,
    },
    {
      enemyId: archetypeIds.enemy.deathSpawner,
      waveMovement: "chase",
      unlockAt: 0.52,
      introductionCount: 2,
      baseWeight: 5,
      weightGrowth: 2.6,
      chaosWeightBias: 0.5,
    },
    { enemyId: archetypeIds.enemy.clusterFodder, waveMovement: "chase", unlockAt: 0.25,
      introductionCount: 3, baseWeight: 2, weightGrowth: 0.5, chaosWeightBias: 0 },
  ],
} as const satisfies DirectorTuning;
