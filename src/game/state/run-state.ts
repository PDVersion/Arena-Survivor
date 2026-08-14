import type { CharacterId, SkillId, UpgradeId } from "../core/archetypes/ids";
import type { PlayerBaseStats } from "../core/stats/player-stats";
import type { UpgradeDefinition } from "../core/archetypes/contracts";
import {
  applyUpgrade,
  createWeaponStatModifiers,
  type WeaponStatModifiers,
} from "../systems/upgrades";
import {
  awardExperience,
  consumePendingChoice,
  createProgressionState,
  type ProgressionState,
} from "../systems/xp";
import { createWorldState, type WorldState } from "../systems/chaos/world-modifiers";
import {
  createRunStatistics,
  observeChaos,
  observeCrit,
  observeLiveEnemies,
  observePierceChain,
  recordCommittedDamage,
  recordCommittedKill,
  type DamageRecord,
  type RunStatistics,
} from "../systems/statistics/run-statistics";

export const RUN_STATE_VERSION = 1 as const;
export const DEFAULT_RUN_DURATION_MS = 5 * 60 * 1000;

export type RunStatus = "playing" | "paused" | "level_up" | "dead" | "complete";

export interface RunPlayerState {
  readonly characterId: CharacterId;
  readonly health: number;
  readonly baseStats: PlayerBaseStats;
  readonly stats: PlayerBaseStats;
}

export interface RunState {
  readonly version: typeof RUN_STATE_VERSION;
  readonly themeId: string;
  readonly status: RunStatus;
  readonly elapsedMs: number;
  readonly durationMs: number;
  readonly player: RunPlayerState;
  readonly progression: ProgressionState;
  readonly weaponModifiers: WeaponStatModifiers;
  readonly selectedUpgradeIds: readonly UpgradeId[];
  readonly activeSkillIds: readonly SkillId[];
  readonly world: WorldState;
  readonly statistics: RunStatistics;
}

export interface CreateRunOptions {
  readonly themeId: string;
  readonly characterId: CharacterId;
  readonly baseStats: PlayerBaseStats;
  readonly durationMs?: number;
}

function cloneStats(stats: PlayerBaseStats): PlayerBaseStats {
  return { ...stats };
}

export function createRunState(options: CreateRunOptions): RunState {
  const durationMs = options.durationMs ?? DEFAULT_RUN_DURATION_MS;
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    throw new Error("Run duration must be a finite number greater than zero");
  }

  return {
    version: RUN_STATE_VERSION,
    themeId: options.themeId,
    status: "playing",
    elapsedMs: 0,
    durationMs,
    player: {
      characterId: options.characterId,
      health: options.baseStats.maxHealth,
      baseStats: cloneStats(options.baseStats),
      stats: cloneStats(options.baseStats),
    },
    progression: createProgressionState(),
    weaponModifiers: createWeaponStatModifiers(),
    selectedUpgradeIds: [],
    activeSkillIds: [],
    world: createWorldState(),
    statistics: createRunStatistics(options.baseStats.critChance),
  };
}

export function advanceRunState(state: RunState, deltaMs: number): RunState {
  if (state.status !== "playing" || deltaMs <= 0) return state;
  if (!Number.isFinite(deltaMs)) throw new Error("Run delta must be finite");

  const elapsedMs = Math.min(state.durationMs, state.elapsedMs + deltaMs);
  return {
    ...state,
    elapsedMs,
    status: elapsedMs >= state.durationMs ? "complete" : "playing",
  };
}

export function setRunStatus(state: RunState, status: RunStatus): RunState {
  if (state.status === "dead" || state.status === "complete") return state;
  if (state.status === "level_up") return state;
  if (status === state.status) return state;
  return { ...state, status };
}

export function damageRunPlayer(state: RunState, damage: number): RunState {
  if (state.status !== "playing" || damage <= 0) return state;
  const health = Math.max(0, state.player.health - damage);
  return {
    ...state,
    status: health === 0 ? "dead" : state.status,
    player: { ...state.player, health },
  };
}

export function setLiveEnemyCount(state: RunState, liveEnemies: number): RunState {
  return { ...state, statistics: observeLiveEnemies(state.statistics, liveEnemies) };
}

export function recordKill(state: RunState): RunState {
  return { ...state, statistics: recordCommittedKill(state.statistics, state.elapsedMs) };
}

export function recordRunDamage(state: RunState, damage: DamageRecord): RunState {
  return { ...state, statistics: recordCommittedDamage(state.statistics, damage) };
}

export function observeRunChaos(state: RunState): RunState {
  return { ...state, statistics: observeChaos(state.statistics, state.world.chaos) };
}

export function observeRunCrit(state: RunState, tier = 0): RunState {
  return { ...state, statistics: observeCrit(state.statistics, state.player.stats.critChance, tier) };
}

export function observeRunPierce(state: RunState, chain: number): RunState {
  return { ...state, statistics: observePierceChain(state.statistics, chain) };
}

export function awardRunExperience(state: RunState, amount: number): RunState {
  if (state.status !== "playing") return state;
  const result = awardExperience(state.progression, amount, state.player.stats.xpMultiplier);
  return {
    ...state,
    status: result.levelsGained > 0 ? "level_up" : state.status,
    progression: result.progression,
  };
}

export function applyRunUpgrade(state: RunState, upgrade: UpgradeDefinition): RunState {
  if (state.status !== "level_up" || state.progression.pendingChoices < 1) return state;
  const upgraded = applyUpgrade(state, upgrade);
  const progression = consumePendingChoice(upgraded.progression);
  const next: RunState = {
    ...upgraded,
    progression,
    status: progression.pendingChoices > 0 ? "level_up" : "playing",
  };
  return observeRunCrit(next);
}

export function resetRunState(state: RunState): RunState {
  return createRunState({
    themeId: state.themeId,
    characterId: state.player.characterId,
    baseStats: state.player.baseStats,
    durationMs: state.durationMs,
  });
}

export function isRunStateSerializable(state: RunState): boolean {
  try {
    return JSON.stringify(state) === JSON.stringify(JSON.parse(JSON.stringify(state)));
  } catch {
    return false;
  }
}
