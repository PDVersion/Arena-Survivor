import type { ShrineId } from "../../core/archetypes/ids";
import { resolveModifiers } from "../modifiers/resolve-modifiers";

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
}

export function createWorldState(): WorldState {
  return Object.freeze({ chaos: 1, enemySpawnMultiplier: 1, xpMultiplier: 1, shrineActivations: Object.freeze({}) });
}

export function applyWorldChoice(
  state: WorldState,
  choice: Readonly<{ shrineId: ShrineId; chaosIncrease: number; enemySpawnMultiplier: number; xpMultiplier: number }>,
): WorldState {
  return Object.freeze({
    chaos: state.chaos + choice.chaosIncrease,
    enemySpawnMultiplier: state.enemySpawnMultiplier * choice.enemySpawnMultiplier,
    xpMultiplier: state.xpMultiplier * choice.xpMultiplier,
    shrineActivations: Object.freeze({
      ...state.shrineActivations,
      [choice.shrineId]: (state.shrineActivations[choice.shrineId] ?? 0) + 1,
    }),
  });
}

export function selectWorldModifiers(state: WorldState): WorldModifierSelection {
  const pressure = Math.max(0, state.chaos - 1);
  return Object.freeze({
    chaos: state.chaos,
    enemySpawnMultiplier: resolveModifiers(1, [
      { layer: "world", sourceId: "chaos.spawn", multiplicative: 1 + pressure * 0.25 },
      { layer: "world", sourceId: "shrine.spawn", multiplicative: state.enemySpawnMultiplier },
    ]).value,
    enemyHealthMultiplier: resolveModifiers(1, [
      { layer: "enemy", sourceId: "chaos.health", multiplicative: 1 + pressure * 0.2 },
    ]).value,
    enemyDamageMultiplier: resolveModifiers(1, [
      { layer: "enemy", sourceId: "chaos.damage", multiplicative: 1 + pressure * 0.15 },
    ]).value,
    xpMultiplier: resolveModifiers(1, [
      { layer: "world", sourceId: "chaos.xp", multiplicative: 1 + pressure * 0.25 },
      { layer: "reward", sourceId: "shrine.xp", multiplicative: state.xpMultiplier },
    ]).value,
    eliteChance: Math.min(0.4, pressure * 0.04),
    shrineRewardMultiplier: 1 + pressure * 0.2,
  });
}
