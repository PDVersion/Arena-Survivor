import type { ProgressionTuning } from "../../../core/archetypes/tuning";

/**
 * Banded geometric growth. Fast early so the opening minute is generous, then
 * compounding so late levels are milestones rather than a metronome.
 *
 *   level        1   2   3   4   5   8  10  12  15  20   25   30
 *   requirement  3   4   5   7   9  14  20  27  38  68  119  183
 *
 * Band four is open-ended, so a run of any length needs no new authoring.
 *
 * `toughnessRewardShare` adds half of an enemy's spawn-time health multiplier
 * to its reward, so a late-run swarm pays out more than an early one and the
 * compounding requirement stays fed without inflating the first minute.
 */
export const progression = {
  xpCurve: {
    kind: "banded",
    baseXp: 3,
    bands: [
      { fromLevel: 1, growth: 1.3 },
      { fromLevel: 5, growth: 1.18 },
      { fromLevel: 12, growth: 1.12 },
      { fromLevel: 25, growth: 1.09 },
    ],
  },
  toughnessRewardShare: 0.5,
} as const satisfies ProgressionTuning;
