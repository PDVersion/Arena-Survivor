import type { ShrineId } from "../../core/archetypes/ids";
import type { DifficultyTuning } from "../../core/archetypes/tuning";
import { resolveModifiers } from "../modifiers/resolve-modifiers";

/** The V0.2 coefficients recorded in REC-035, used when no theme tuning is supplied. */
export const DEFAULT_DIFFICULTY_TUNING: DifficultyTuning = Object.freeze({
  chaos: Object.freeze({
    spawnPerPoint: 0.25,
    enemyHealthPerPoint: 0.2,
    enemyDamagePerPoint: 0.15,
    xpPerPoint: 0.25,
    eliteChancePerPoint: 0.04,
    eliteChanceCap: 0.4,
    shrineRewardPerPoint: 0.2,
  }),
  time: Object.freeze({
    steps: 10,
    enemyHealthAtEnd: 0,
    enemyDamageAtEnd: 0,
    enemyMoveSpeedAtEnd: 0,
  }),
});

export interface WorldState {
  readonly chaos: number;
  readonly enemySpawnMultiplier: number;
  readonly xpMultiplier: number;
  readonly shrineActivations: Readonly<Partial<Record<ShrineId, number>>>;
}

export interface WorldModifierSelection {
  readonly chaos: number;
  readonly enemySpawnMultiplier: number;
  readonly enemyHealthMultiplier: number;
  readonly enemyDamageMultiplier: number;
  readonly xpMultiplier: number;
  readonly eliteChance: number;
  readonly shrineRewardMultiplier: number;
  readonly enemyMoveSpeedMultiplier: number;
  /** Which discrete escalation step the run is in, `0` to `steps`. */
  readonly threatStep: number;
}

export function createWorldState(): WorldState {
  return Object.freeze({ chaos: 1, enemySpawnMultiplier: 1, xpMultiplier: 1, shrineActivations: Object.freeze({}) });
}

/** World pressure from any source. Shrines and dangerous upgrades share it. */
export function applyWorldModifier(
  state: WorldState,
  choice: Readonly<{ chaosIncrease: number; enemySpawnMultiplier: number; xpMultiplier: number }>,
): WorldState {
  return Object.freeze({
    ...state,
    chaos: state.chaos + choice.chaosIncrease,
    enemySpawnMultiplier: state.enemySpawnMultiplier * choice.enemySpawnMultiplier,
    xpMultiplier: state.xpMultiplier * choice.xpMultiplier,
  });
}

export function applyWorldChoice(
  state: WorldState,
  choice: Readonly<{ shrineId: ShrineId; chaosIncrease: number; enemySpawnMultiplier: number; xpMultiplier: number }>,
): WorldState {
  const next = applyWorldModifier(state, choice);
  return Object.freeze({
    ...next,
    shrineActivations: Object.freeze({
      ...state.shrineActivations,
      [choice.shrineId]: (state.shrineActivations[choice.shrineId] ?? 0) + 1,
    }),
  });
}

/**
 * World pressure at a moment in the run.
 *
 * `progress` is normalized run progress. Elapsed-time escalation advances in
 * discrete steps rather than continuously, so it is perceptible and can be shown
 * as a threat level. Chaos and time compose multiplicatively, and every consumer
 * resolves from this one selector.
 */
export function selectWorldModifiers(
  state: WorldState,
  tuning: DifficultyTuning = DEFAULT_DIFFICULTY_TUNING,
  progress = 0,
): WorldModifierSelection {
  const pressure = Math.max(0, state.chaos - 1);
  const chaos = tuning.chaos;
  const time = tuning.time;
  const steps = Math.max(1, Math.floor(time.steps));
  const threatStep = Math.max(0, Math.floor(Math.max(0, progress) * steps));
  // Stepped rather than smooth, and never beyond the end of the run.
  const elapsed = Math.min(1, threatStep / steps);
  return Object.freeze({
    chaos: state.chaos,
    enemySpawnMultiplier: resolveModifiers(1, [
      { layer: "world", sourceId: "chaos.spawn", multiplicative: 1 + pressure * chaos.spawnPerPoint },
      { layer: "world", sourceId: "shrine.spawn", multiplicative: state.enemySpawnMultiplier },
    ]).value,
    enemyHealthMultiplier: resolveModifiers(1, [
      { layer: "enemy", sourceId: "chaos.health", multiplicative: 1 + pressure * chaos.enemyHealthPerPoint },
      { layer: "enemy", sourceId: "time.health", multiplicative: 1 + elapsed * time.enemyHealthAtEnd },
    ]).value,
    enemyDamageMultiplier: resolveModifiers(1, [
      { layer: "enemy", sourceId: "chaos.damage", multiplicative: 1 + pressure * chaos.enemyDamagePerPoint },
      { layer: "enemy", sourceId: "time.damage", multiplicative: 1 + elapsed * time.enemyDamageAtEnd },
    ]).value,
    enemyMoveSpeedMultiplier: resolveModifiers(1, [
      { layer: "enemy", sourceId: "time.speed", multiplicative: 1 + elapsed * time.enemyMoveSpeedAtEnd },
    ]).value,
    threatStep,
    xpMultiplier: resolveModifiers(1, [
      { layer: "world", sourceId: "chaos.xp", multiplicative: 1 + pressure * chaos.xpPerPoint },
      { layer: "reward", sourceId: "shrine.xp", multiplicative: state.xpMultiplier },
    ]).value,
    eliteChance: Math.min(chaos.eliteChanceCap, pressure * chaos.eliteChancePerPoint),
    shrineRewardMultiplier: 1 + pressure * chaos.shrineRewardPerPoint,
  });
}
