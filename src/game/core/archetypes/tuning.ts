/**
 * Theme-owned tuning contracts.
 *
 * Balance values are theme data, never literals inside systems or scenes. A
 * theme supplies one `TuningPack`; systems resolve behaviour from it.
 *
 * V0.3 Phase 1 introduces the seam holding the values that already existed.
 * Later phases change the values and, where declared, the curve shapes.
 */

/** One band of geometric growth in a banded XP curve. */
export interface XpBand {
  /** First player level this growth applies to when leaving it. */
  readonly fromLevel: number;
  /** Multiplier applied to the previous level's requirement. */
  readonly growth: number;
}

/**
 * How much experience each level costs.
 *
 * `linear` is the V0.1/V0.2 curve. `banded` is the V0.3 Phase 3 replacement.
 * Both shapes ship from Phase 1 so the change is a theme-data edit.
 */
export type XpCurve =
  | Readonly<{ kind: "linear"; baseXp: number; step: number }>
  | Readonly<{ kind: "banded"; baseXp: number; bands: readonly XpBand[] }>;

export interface ProgressionTuning {
  readonly xpCurve: XpCurve;
  /**
   * Share of an enemy's spawn-time health multiplier that is added to its
   * reward. `0` reproduces V0.2, where a buffed enemy paid the same as a fresh
   * one. Raised in Phase 3.
   */
  readonly toughnessRewardShare: number;
}

export interface DirectorTuning {
  /** Ambient spawn cadence before world multipliers. */
  readonly spawnIntervalMs: number;
  /** Distance from the player at which ambient enemies appear. */
  readonly spawnRadius: number;
}

/** Coefficients applied per point of Chaos pressure (`chaos - 1`). */
export interface ChaosTuning {
  readonly spawnPerPoint: number;
  readonly enemyHealthPerPoint: number;
  readonly enemyDamagePerPoint: number;
  readonly xpPerPoint: number;
  readonly eliteChancePerPoint: number;
  readonly eliteChanceCap: number;
  readonly shrineRewardPerPoint: number;
}

export interface DifficultyTuning {
  readonly chaos: ChaosTuning;
}

export interface TuningPack {
  readonly progression: ProgressionTuning;
  readonly director: DirectorTuning;
  readonly difficulty: DifficultyTuning;
}
