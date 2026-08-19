import type { DifficultyTuning } from "../../../core/archetypes/tuning";

/**
 * Chaos coefficients are the V0.2 values recorded in REC-035. The time block
 * was added in Phase 6 and escalates a run even when the player never touches a
 * shrine, which V0.2 could not do.
 */
export const difficulty = {
  chaos: {
    spawnPerPoint: 0.25,
    enemyHealthPerPoint: 0.2,
    enemyDamagePerPoint: 0.15,
    xpPerPoint: 0.25,
    eliteChancePerPoint: 0.04,
    eliteChanceCap: 0.4,
    shrineRewardPerPoint: 0.2,
  },
  /**
   * Deliberately conservative starting values; Phase 10's time-to-kill table is
   * the instrument for raising them. Combined with Pollution 3 at the end of a
   * run this is 2.10x health and 1.56x contact damage.
   */
  time: {
    steps: 10,
    enemyHealthAtEnd: 0.5,
    enemyDamageAtEnd: 0.2,
    enemyMoveSpeedAtEnd: 0.1,
    // Compounding overtime, so endless ends rather than being farmed. See the
    // production pack for the derived table; this pack tracks it.
    endless: {
      enemyHealthGrowthPerStep: 0.3,
      enemyDamageGrowthPerStep: 0.08,
    },
  },
} as const satisfies DifficultyTuning;
