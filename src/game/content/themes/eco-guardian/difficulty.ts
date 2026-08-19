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
   *
   * The speed ramp was halved alongside the roster cut in REC-061. At 0.1 the
   * late run handed back most of what the base cut removed — a 0.9x roster at
   * 1.1x is 0.99x — which is where "too fast" was felt hardest. Health and
   * damage still carry the escalation; only the closing speed was pulled back.
   */
  time: {
    steps: 10,
    enemyHealthAtEnd: 0.5,
    enemyDamageAtEnd: 0.2,
    enemyMoveSpeedAtEnd: 0.05,
    /**
     * Overtime, at the same 30-second step cadence as the curve above.
     *
     *   overtime   steps   health   damage
     *   0:30           1    1.30x    1.08x
     *   1:00           2    1.69x    1.17x
     *   2:00           4    2.86x    1.36x
     *   3:00           6    4.83x    1.59x
     *   5:00          10   13.79x    2.16x
     *
     * Those are multiples of what the run already reached at its limit, so the
     * true figures are higher again. A strong build gets a couple of good
     * minutes of overtime and then loses, which is the intent: endless is a
     * victory lap with a timer on it, not a second game mode to farm.
     */
    endless: {
      enemyHealthGrowthPerStep: 0.3,
      enemyDamageGrowthPerStep: 0.08,
    },
  },
} as const satisfies DifficultyTuning;
