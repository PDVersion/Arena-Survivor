import type { DifficultyTuning } from "../../../core/archetypes/tuning";

/**
 * V0.3 Phase 1 holds the V0.2 Chaos coefficients recorded in REC-035, which
 * used to be literals inside `world-modifiers.ts`. Phase 6 adds the elapsed
 * time curves alongside them.
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
} as const satisfies DifficultyTuning;
