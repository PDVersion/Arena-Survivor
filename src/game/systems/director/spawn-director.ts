import type { EnemyId } from "../../core/archetypes/ids";
import type { DirectorRoleTuning, DirectorTuning } from "../../core/archetypes/tuning";

/**
 * The spawn director resolves cadence, composition, and escalation from
 * normalized run progress.
 *
 *   t = elapsedMs / durationMs
 *
 * `t` is 0 at the start, 1 at the end, and free to exceed 1 for endless runs.
 * Nothing here names a minute, so changing run length restretches every curve
 * with no new authoring. Every function is pure and deterministic.
 */

export function runProgress(elapsedMs: number, durationMs: number): number {
  if (!Number.isFinite(durationMs) || durationMs <= 0) return 0;
  return Math.max(0, elapsedMs / durationMs);
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** How far a role has ramped since unlocking, in `[0, 1]`. */
export function roleRamp(role: DirectorRoleTuning, progress: number): number {
  const span = 1 - role.unlockAt;
  if (span <= 0) return progress >= role.unlockAt ? 1 : 0;
  return clamp01((progress - role.unlockAt) / span);
}

export function spawnIntervalMs(tuning: DirectorTuning, progress: number): number {
  const decayed = tuning.baseIntervalMs * Math.exp(-tuning.intervalDecayK * progress);
  return Math.max(tuning.minIntervalMs, decayed);
}

export function batchSize(tuning: DirectorTuning, progress: number): number {
  return Math.max(1, 1 + Math.floor(progress * tuning.batchRamp));
}

/** Elite chance from run progress alone, before any Chaos contribution. */
export function baselineEliteChance(tuning: DirectorTuning, progress: number): number {
  const span = 1 - tuning.eliteUnlockAt;
  const ramp = span <= 0
    ? (progress >= tuning.eliteUnlockAt ? 1 : 0)
    : clamp01((progress - tuning.eliteUnlockAt) / span);
  return tuning.maxBaselineEliteChance * ramp;
}

/**
 * Elite chance actually in effect.
 *
 * The maximum of the two sources rather than a product, so a cautious run still
 * meets elites late and a Chaos-stacking run meets them early — under V0.2 a
 * shrine-free run never saw a single elite.
 */
export function resolveEliteChance(
  tuning: DirectorTuning,
  progress: number,
  chaosEliteChance: number,
): number {
  return Math.max(baselineEliteChance(tuning, progress), Math.max(0, chaosEliteChance));
}

export function enemiesInWave(tuning: DirectorTuning, progress: number): number {
  return Math.max(1, Math.round(tuning.waveBurstBase + tuning.waveBurstGrowth * progress));
}

export interface RoleWeight {
  readonly enemyId: EnemyId;
  readonly weight: number;
}

/**
 * Selection weights for every unlocked role.
 *
 * Chaos pressure biases composition as well as volume: heavy roles carry a
 * larger bias, so a dangerous world sends worse things rather than only more.
 */
export function roleWeights(
  tuning: DirectorTuning,
  progress: number,
  chaosPressure = 0,
): readonly RoleWeight[] {
  const pressure = Math.max(0, chaosPressure);
  return tuning.roles
    .filter((role) => progress >= role.unlockAt)
    .map((role) => ({
      enemyId: role.enemyId,
      weight: Math.max(
        0,
        role.baseWeight *
          (1 + role.weightGrowth * roleRamp(role, progress)) *
          (1 + pressure * role.chaosWeightBias),
      ),
    }))
    .filter((entry) => entry.weight > 0);
}

/** Deterministic weighted selection from an injected random source. */
export function selectRole(
  weights: readonly RoleWeight[],
  random: () => number,
): EnemyId | undefined {
  const total = weights.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) return undefined;
  let roll = Math.min(Math.max(random(), 0), 1 - Number.EPSILON) * total;
  for (const entry of weights) {
    roll -= entry.weight;
    if (roll < 0) return entry.enemyId;
  }
  return weights.at(-1)?.enemyId;
}

/**
 * Roles whose unlock threshold was crossed between two progress readings.
 *
 * Used to fire a telegraphed milestone wave exactly once per role, without the
 * scene tracking which milestones it has already announced.
 */
export function crossedUnlocks(
  tuning: DirectorTuning,
  previousProgress: number,
  progress: number,
): readonly DirectorRoleTuning[] {
  if (progress <= previousProgress) return [];
  return tuning.roles.filter(
    (role) => role.unlockAt > 0 && role.unlockAt > previousProgress && role.unlockAt <= progress,
  );
}

export interface DirectorPlan {
  readonly progress: number;
  readonly intervalMs: number;
  readonly batchSize: number;
  readonly eliteChance: number;
  readonly weights: readonly RoleWeight[];
}

/** Everything the scene needs for one spawn decision, resolved together. */
export function resolveDirectorPlan(
  tuning: DirectorTuning,
  progress: number,
  world: Readonly<{ enemySpawnMultiplier: number; eliteChance: number; chaos: number }>,
): DirectorPlan {
  const multiplier = world.enemySpawnMultiplier > 0 ? world.enemySpawnMultiplier : 1;
  return Object.freeze({
    progress,
    intervalMs: spawnIntervalMs(tuning, progress) / multiplier,
    batchSize: batchSize(tuning, progress),
    eliteChance: resolveEliteChance(tuning, progress, world.eliteChance),
    weights: roleWeights(tuning, progress, Math.max(0, world.chaos - 1)),
  });
}
