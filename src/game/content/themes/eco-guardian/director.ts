import { archetypeIds } from "../../../core/archetypes/ids";
import type { DirectorTuning } from "../../../core/archetypes/tuning";

/**
 * Curves, not a phase list. Everything resolves from normalized run progress,
 * so a run of any length restretches without new authoring.
 *
 * Single Cigarette Butts open the run. Bottles quietly enter at 10% progress (30 s on
 * the five-minute timer), with a low initial weight and a gradual ramp.
 * G3 spaces heavier introductions before the later mini-boss.
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
    { enemyId: archetypeIds.enemy.scavenger, waveMovement: "chase", unlockAt: .20, milestoneWave: false, baseWeight: .25, weightGrowth: 0, chaosWeightBias: 0 },
    { enemyId: archetypeIds.enemy.rangedAttacker, waveMovement: "chase", unlockAt: 0.66,
      introductionCount: 1, baseWeight: 1, weightGrowth: 0.2, chaosWeightBias: 0 },
    { enemyId: archetypeIds.enemy.committedCharger, waveMovement: "chase", unlockAt: 0.60,
      introductionCount: 1, baseWeight: 2, weightGrowth: 0.4, chaosWeightBias: 0 },
    { enemyId: archetypeIds.enemy.gustDrifter, waveMovement: "chase", unlockAt: 0.34,
      introductionCount: 1, baseWeight: 3, weightGrowth: 0.5, chaosWeightBias: 0 },

    // Bottles start sporadically and become more prevalent.
    {
      enemyId: archetypeIds.enemy.swarmBasic,
      waveMovement: "chase",
      unlockAt: 0.1,
      milestoneWave: false,
      baseWeight: 6,
      weightGrowth: 9,
      chaosWeightBias: 0,
    },
    // Single opening enemy; Microplastics own natural three-piece groups later.
    {
      enemyId: archetypeIds.enemy.clusterFodder,
      waveMovement: "chase",
      unlockAt: 0,
      baseWeight: 100,
      weightGrowth: -0.6,
      chaosWeightBias: 0.1,
    },
    {
      enemyId: archetypeIds.enemy.slowDurable,
      waveMovement: "chase",
      unlockAt: 0.44,
      introductionCount: 4,
      // G1 keeps Glass distinct without dominating retained combat work.
      baseWeight: 8,
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
    { enemyId: archetypeIds.enemy.fastFragile, waveMovement: "drift", unlockAt: 0.28,
      introductionCount: 3, baseWeight: 2, weightGrowth: 0.5, chaosWeightBias: 0 },
  ],
} as const satisfies DirectorTuning;
