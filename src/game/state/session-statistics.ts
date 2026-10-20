import type { UpgradeId } from "../core/archetypes/ids";
import type { RunStatistics } from "../systems/statistics/run-statistics";

/** Lifetime statistics hydrated by the C6 profile service.
 * Only finished runs are folded into stored totals. A live contribution is a
 * computed read overlay, never a durable write; the terminal coordinator commits
 * once. The profile service owns storage and durable aggregate safety limits.
 */

export interface UpgradeSessionRecord {
  /** Times taken across every run this session, including the live one. */
  readonly total: number;
  /** The most this upgrade was taken within a single run. */
  readonly bestInRun: number;
}

export interface SessionStatistics {
  readonly runsPlayed: number;
  readonly totalKills: number;
  readonly totalDamage: number;
  readonly bestLevel: number;
  readonly bestKills: number;
  readonly bestDamage: number;
  readonly upgrades: Readonly<Partial<Record<UpgradeId, UpgradeSessionRecord>>>;
}

/** What one run contributes. Deliberately not `RunState`, so this stays pure. */
export interface RunContribution {
  readonly level: number;
  readonly statistics: Pick<RunStatistics, "kills" | "totalDamage" | "upgradeCounts">;
}

export function createSessionStatistics(): SessionStatistics {
  return Object.freeze({
    runsPlayed: 0,
    totalKills: 0,
    totalDamage: 0,
    bestLevel: 0,
    bestKills: 0,
    bestDamage: 0,
    upgrades: Object.freeze({}),
  });
}

function foldUpgrades(
  session: SessionStatistics,
  run: RunContribution,
): SessionStatistics["upgrades"] {
  const merged: Partial<Record<UpgradeId, UpgradeSessionRecord>> = { ...session.upgrades };
  for (const [id, count] of Object.entries(run.statistics.upgradeCounts) as [
    UpgradeId,
    number,
  ][]) {
    const previous = merged[id];
    merged[id] = Object.freeze({
      total: (previous?.total ?? 0) + count,
      bestInRun: Math.max(previous?.bestInRun ?? 0, count),
    });
  }
  return Object.freeze(merged);
}

/**
 * Fold a run into the session totals.
 *
 * `countRun` is false while a run is still in progress. Only `runsPlayed` is
 * gated by it: a run being played has not been played yet. Everything else is
 * safe to reflect live — the additive totals are what "collected this session"
 * means to a player mid-run, and the bests are `Math.max`, so folding the same
 * live run on every read is idempotent. A best-level record that refused to
 * move until the player died would simply look broken.
 */
export function foldRun(
  session: SessionStatistics,
  run: RunContribution,
  countRun = true,
): SessionStatistics {
  return Object.freeze({
    runsPlayed: session.runsPlayed + (countRun ? 1 : 0),
    totalKills: session.totalKills + run.statistics.kills,
    totalDamage: session.totalDamage + run.statistics.totalDamage,
    bestLevel: Math.max(session.bestLevel, run.level),
    bestKills: Math.max(session.bestKills, run.statistics.kills),
    bestDamage: Math.max(session.bestDamage, run.statistics.totalDamage),
    upgrades: foldUpgrades(session, run),
  });
}

let sessionStatistics = createSessionStatistics();

/** The session so far, optionally including the run currently being played. */
export function getSessionStatistics(liveRun?: RunContribution): SessionStatistics {
  return liveRun ? foldRun(sessionStatistics, liveRun, false) : sessionStatistics;
}

/** Called once when a run reaches its terminal state, never mid-run. */
export function recordFinishedRun(run: RunContribution): SessionStatistics {
  sessionStatistics = foldRun(sessionStatistics, run);
  return sessionStatistics;
}

/** Test-only reset, so a spec never inherits another spec's session. */
export function resetSessionStatistics(): SessionStatistics {
  sessionStatistics = createSessionStatistics();
  return sessionStatistics;
}

export function hydrateSessionStatistics(statistics: SessionStatistics): void { sessionStatistics = statistics; }
