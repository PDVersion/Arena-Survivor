import type { CharacterId, UpgradeId } from "../core/archetypes/ids";
import type { SkillLevels } from "../systems/skills/resolve-skill";
import type { PlayerBaseStats } from "../core/stats/player-stats";
import type { UpgradeDefinition } from "../core/archetypes/contracts";
import type { SkillId } from "../core/archetypes/ids";
import {
  applyUpgrade,
  createWeaponStatModifiers,
  type WeaponStatModifiers,
} from "../systems/upgrades";
import {
  awardExperience,
  consumePendingChoice,
  createProgressionState,
  DEFAULT_XP_CURVE,
  type ProgressionState,
} from "../systems/xp";
import type { XpCurve } from "../core/archetypes/tuning";
import { createWorldState, type WorldState } from "../systems/chaos/world-modifiers";
import {
  createRunStatistics,
  observeChaos,
  observeCrit,
  observeLiveEnemies,
  observePierceChain,
  recordCommittedDamage,
  recordCommittedKill,
  recordUpgradeSelection,
  type DamageRecord,
  type RunStatistics,
} from "../systems/statistics/run-statistics";

export const RUN_STATE_VERSION = 1 as const;
export const DEFAULT_RUN_DURATION_MS = 5 * 60 * 1000;

export type RunStatus = "playing" | "paused" | "level_up" | "time_up" | "dead" | "complete";

/**
 * What the clock means for this run.
 *
 * `timed` is the authored duration. When it expires the run does not simply
 * end: it stops at `time_up` and the player decides how it finishes. `endless`
 * removes the limit entirely; `clearing` keeps the world running with no new
 * arrivals, so a run ends on an empty field rather than mid-fight.
 */
export type RunMode = "timed" | "endless" | "clearing";

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
  readonly mode: RunMode;
  readonly player: RunPlayerState;
  readonly progression: ProgressionState;
  readonly weaponModifiers: WeaponStatModifiers;
  readonly selectedUpgradeIds: readonly UpgradeId[];
  readonly skillLevels: SkillLevels;
  readonly world: WorldState;
  readonly statistics: RunStatistics;
  /**
   * The theme's XP curve, copied in so a run is self-describing and stays
   * serializable without reaching back into the active theme.
   */
  readonly xpCurve: XpCurve;
  /** What killed the player, recorded at the lethal transition. */
  readonly deathCause?: DeathCause;
}

export interface DeathCause {
  /** Stable content id of the killer, or a hazard id. */
  readonly sourceId: string;
  readonly elite: boolean;
  readonly atMs: number;
}

export interface CreateRunOptions {
  readonly themeId: string;
  readonly characterId: CharacterId;
  readonly baseStats: PlayerBaseStats;
  readonly durationMs?: number;
  readonly xpCurve?: XpCurve;
}

function cloneStats(stats: PlayerBaseStats): PlayerBaseStats {
  return { ...stats };
}

export function createRunState(options: CreateRunOptions): RunState {
  const durationMs = options.durationMs ?? DEFAULT_RUN_DURATION_MS;
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    throw new Error("Run duration must be a finite number greater than zero");
  }

  const xpCurve = options.xpCurve ?? DEFAULT_XP_CURVE;
  return {
    version: RUN_STATE_VERSION,
    themeId: options.themeId,
    status: "playing",
    elapsedMs: 0,
    durationMs,
    mode: "timed",
    xpCurve,
    player: {
      characterId: options.characterId,
      health: options.baseStats.maxHealth,
      baseStats: cloneStats(options.baseStats),
      stats: cloneStats(options.baseStats),
    },
    progression: createProgressionState(xpCurve),
    weaponModifiers: createWeaponStatModifiers(),
    selectedUpgradeIds: [],
    skillLevels: Object.freeze({}),
    world: createWorldState(),
    statistics: createRunStatistics(options.baseStats.critChance),
  };
}

export function advanceRunState(state: RunState, deltaMs: number): RunState {
  if (state.status !== "playing" || deltaMs <= 0) return state;
  if (!Number.isFinite(deltaMs)) throw new Error("Run delta must be finite");

  // Past the limit the clock keeps running rather than freezing, so overtime is
  // measurable and the director keeps escalating from `t > 1`.
  if (state.mode !== "timed") {
    return { ...state, elapsedMs: state.elapsedMs + deltaMs };
  }

  const elapsedMs = Math.min(state.durationMs, state.elapsedMs + deltaMs);
  return {
    ...state,
    elapsedMs,
    status: elapsedMs >= state.durationMs ? "time_up" : "playing",
  };
}

/**
 * Resolve the time-up decision.
 *
 * The run resumes in the chosen mode. `clearing` does not end the run here —
 * the scene owns whether the field is actually empty, and ends it through
 * `completeRun` when it is.
 */
export function chooseRunMode(state: RunState, mode: Exclude<RunMode, "timed">): RunState {
  if (state.status !== "time_up") return state;
  return { ...state, mode, status: "playing" };
}

/** End a run that has run out of things to do rather than out of time. */
export function completeRun(state: RunState): RunState {
  if (state.status === "dead" || state.status === "complete") return state;
  return { ...state, status: "complete" };
}

export function setRunStatus(state: RunState, status: RunStatus): RunState {
  if (state.status === "dead" || state.status === "complete") return state;
  if (state.status === "level_up") return state;
  if (status === state.status) return state;
  return { ...state, status };
}

export function damageRunPlayer(
  state: RunState,
  damage: number,
  cause?: Omit<DeathCause, "atMs">,
): RunState {
  if (state.status !== "playing" || damage <= 0) return state;
  const health = Math.max(0, state.player.health - damage);
  const died = health === 0;
  return {
    ...state,
    status: died ? "dead" : state.status,
    player: { ...state.player, health },
    deathCause: died && cause ? { ...cause, atMs: state.elapsedMs } : state.deathCause,
  };
}

/** Health per second on the simulation clock, so it pauses with the run. */
export function regenerateRunPlayer(state: RunState, deltaMs: number): RunState {
  if (state.status !== "playing") return state;
  const perSecond = state.player.stats.regeneration;
  if (perSecond <= 0 || state.player.health >= state.player.stats.maxHealth) return state;
  const health = Math.min(
    state.player.stats.maxHealth,
    state.player.health + (perSecond * deltaMs) / 1000,
  );
  return { ...state, player: { ...state.player, health } };
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
  const result = awardExperience(
    state.progression,
    amount,
    state.player.stats.xpMultiplier,
    state.xpCurve,
  );
  return {
    ...state,
    status: result.levelsGained > 0 ? "level_up" : state.status,
    progression: result.progression,
  };
}

export function applyRunUpgrade(
  state: RunState,
  upgrade: UpgradeDefinition,
  skillMaxLevel?: (skillId: SkillId) => number,
  /** The offer's rolled tier gain; `1` is a common roll. */
  tierMultiplier = 1,
): RunState {
  if (state.status !== "level_up" || state.progression.pendingChoices < 1) return state;
  const upgraded = applyUpgrade(state, upgrade, skillMaxLevel, tierMultiplier);
  const progression = consumePendingChoice(upgraded.progression);
  const next: RunState = {
    ...upgraded,
    progression,
    status: progression.pendingChoices > 0 ? "level_up" : "playing",
    // Tallied at the same commit point as `selectedUpgradeIds` so the two can
    // never disagree about what was taken.
    statistics: recordUpgradeSelection(upgraded.statistics, upgrade.id),
  };
  return observeRunCrit(next);
}

export function resetRunState(state: RunState): RunState {
  return createRunState({
    themeId: state.themeId,
    characterId: state.player.characterId,
    baseStats: state.player.baseStats,
    durationMs: state.durationMs,
    xpCurve: state.xpCurve,
  });
}

export function isRunStateSerializable(state: RunState): boolean {
  try {
    return JSON.stringify(state) === JSON.stringify(JSON.parse(JSON.stringify(state)));
  } catch {
    return false;
  }
}
