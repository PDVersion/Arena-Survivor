import type { CharacterId } from "../core/archetypes/ids";
import type { PlayerBaseStats } from "../core/stats/player-stats";

export const RUN_STATE_VERSION = 1 as const;
export const DEFAULT_RUN_DURATION_MS = 5 * 60 * 1000;

export type RunStatus = "playing" | "paused" | "dead" | "complete";

export interface RunPlayerState {
  readonly characterId: CharacterId;
  readonly health: number;
  readonly stats: PlayerBaseStats;
}

export interface RunState {
  readonly version: typeof RUN_STATE_VERSION;
  readonly themeId: string;
  readonly status: RunStatus;
  readonly elapsedMs: number;
  readonly durationMs: number;
  readonly player: RunPlayerState;
  readonly statistics: {
    readonly kills: number;
    readonly liveEnemies: number;
  };
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
      stats: cloneStats(options.baseStats),
    },
    statistics: { kills: 0, liveEnemies: 0 },
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
  return { ...state, statistics: { ...state.statistics, liveEnemies: Math.max(0, liveEnemies) } };
}

export function recordKill(state: RunState): RunState {
  return { ...state, statistics: { ...state.statistics, kills: state.statistics.kills + 1 } };
}

export function resetRunState(state: RunState): RunState {
  return createRunState({
    themeId: state.themeId,
    characterId: state.player.characterId,
    baseStats: state.player.stats,
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
