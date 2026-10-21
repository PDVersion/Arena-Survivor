import { archetypeIds } from "../../../core/archetypes/ids";
import type { DirectorTuning } from "../../../core/archetypes/tuning";

/**
 * Curves, not a phase list. Everything resolves from normalized run progress,
 * so a run of any length restretches without new authoring.
 *
 * Microplastics open the run. Bottles quietly enter at 10% progress (30 s on
 * the five-minute timer), with a low initial weight and a gradual ramp.
 * Heavier material arrivals retain their existing thresholds.
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
  spawnMargin: 40,
  roles: [
    { enemyId: archetypeIds.enemy.gustDrifter, waveMovement: "chase", unlockAt: 0.32,
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
    // Small opening enemy. Keep drift for any authored milestone burst;
    // ordinary spawns chase but remain below player movement speed.
    {
      enemyId: archetypeIds.enemy.fastFragile,
      waveMovement: "drift",
      unlockAt: 0,
      baseWeight: 100,
      weightGrowth: -0.6,
      chaosWeightBias: 0.1,
    },
    {
      enemyId: archetypeIds.enemy.slowDurable,
      waveMovement: "chase",
      unlockAt: 0.4,
      // G1 keeps Glass distinct without dominating retained combat work.
      baseWeight: 8,
      weightGrowth: 0.9,
      chaosWeightBias: 0.35,
    },
    {
      enemyId: archetypeIds.enemy.deathSpawner,
      waveMovement: "chase",
      unlockAt: 0.45,
      baseWeight: 5,
      weightGrowth: 2.6,
      chaosWeightBias: 0.5,
    },
    { enemyId: archetypeIds.enemy.clusterFodder, waveMovement: "chase", unlockAt: 0.25,
      introductionCount: 3, baseWeight: 2, weightGrowth: 0.5, chaosWeightBias: 0 },
  ],
} as const satisfies DirectorTuning;
