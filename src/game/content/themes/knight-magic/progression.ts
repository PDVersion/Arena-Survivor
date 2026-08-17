import type { ProgressionTuning } from "../../../core/archetypes/tuning";

/**
 * V0.3 Phase 1 preserves the V0.2 linear curve exactly: 2, 4, 6, 8, ...
 * Phase 3 replaces `xpCurve` with the banded shape and raises
 * `toughnessRewardShare`.
 */
export const progression = {
  xpCurve: { kind: "linear", baseXp: 2, step: 2 },
  toughnessRewardShare: 0,
} as const satisfies ProgressionTuning;
