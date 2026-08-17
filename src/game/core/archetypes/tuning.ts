import type { EnemyId } from "./ids";

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

/**
 * How a milestone wave's enemies move.
 *
 * `chase` re-aims at the player every frame. `drift` aims once at the player's
 * position when it spawns and then holds that heading, so the wave sweeps
 * through as an obstacle to dodge rather than an inescapable pursuit. A wave of
 * enemies faster than the player must drift, or it cannot be survived with a
 * single-projectile starter weapon.
 */
export type WaveMovement = "chase" | "drift";

/**
 * One role's participation in the spawn director, expressed against normalized
 * run progress rather than wall-clock time.
 */
export interface DirectorRoleTuning {
  readonly enemyId: EnemyId;
  /** Movement used by this role's milestone wave. Ambient spawns always chase. */
  readonly waveMovement: WaveMovement;
  /** Progress at which the role starts spawning. `0.2` is one minute into a five-minute run. */
  readonly unlockAt: number;
  /** Selection weight at the moment of unlock. */
  readonly baseWeight: number;
  /** Fractional change in weight from unlock to the end of the run; may be negative. */
  readonly weightGrowth: number;
  /** Extra weight per point of Chaos pressure, so danger shifts composition, not just volume. */
  readonly chaosWeightBias: number;
}

/**
 * Spawn cadence, composition, and escalation as curves.
 *
 * Nothing here names a minute. Every output resolves from
 * `t = elapsedMs / durationMs`, so a five-minute run, a ten-minute run, and an
 * endless run (`t > 1`) all work from the same coefficients with no
 * hand-authored milestones.
 */
export interface DirectorTuning {
  /** Cadence at `t = 0`, before world multipliers. */
  readonly baseIntervalMs: number;
  /** Floor the cadence decays toward. */
  readonly minIntervalMs: number;
  /** Exponential decay rate: `interval = max(min, base * e^(-k*t))`. */
  readonly intervalDecayK: number;
  /** Batch size ramp: `1 + floor(t * batchRamp)`. */
  readonly batchRamp: number;
  /** Angular spread of a batch on the spawn ring, in radians. */
  readonly batchSpreadRadians: number;
  /** Progress at which elites begin appearing without any shrine activation. */
  readonly eliteUnlockAt: number;
  /** Elite chance at `t = 1`, before Chaos. */
  readonly maxBaselineEliteChance: number;
  /** Enemies released by a milestone wave: `waveBurstBase + waveBurstGrowth * t`. */
  readonly waveBurstBase: number;
  readonly waveBurstGrowth: number;
  /** Margin beyond the visible view's half-diagonal at which enemies appear. */
  readonly spawnMargin: number;
  readonly roles: readonly DirectorRoleTuning[];
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

/** One role's physical presence in the crowd. */
export interface BodyRoleTuning {
  readonly enemyId: EnemyId;
  /**
   * Personal space as a fraction of the drawn radius. Below `1` the role bunches
   * and overlaps a little, which is what makes a swarm of small things read as a
   * crowd rather than a grid.
   */
  readonly separationScale: number;
  /** Heavier bodies are displaced less by their neighbours. */
  readonly mass: number;
  /** Solid roles block the player instead of being walked through. */
  readonly solid: boolean;
}

export interface BodiesTuning {
  /** Spatial hash cell size; should exceed twice the largest separation radius. */
  readonly cellSize: number;
  /** Neighbour resolutions per body per frame, bounding worst-case cost. */
  readonly maxNeighbours: number;
  /** Ceiling on a single frame's displacement, so a dense pile cannot explode. */
  readonly maxDisplacement: number;
  /** Elite mass multiplier; elites are solid regardless of their role. */
  readonly eliteMassMultiplier: number;
  /** How far a solid enemy shoves the player when it damages them. */
  readonly contactKnockback: number;
  readonly roles: readonly BodyRoleTuning[];
}

export interface TuningPack {
  readonly progression: ProgressionTuning;
  readonly director: DirectorTuning;
  readonly difficulty: DifficultyTuning;
  readonly bodies: BodiesTuning;
}
