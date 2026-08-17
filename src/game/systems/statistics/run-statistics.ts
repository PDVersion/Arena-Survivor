export const KILL_CHAIN_WINDOW_MS = 5_000;

export const damageCategories = [
  "direct",
  "criticalBonus",
  "piercingMomentum",
  "explosion",
  "chainedExplosion",
  "remainder",
] as const;

export type DamageCategory = (typeof damageCategories)[number];
export type DamageBreakdown = Readonly<Record<DamageCategory, number>>;

import type { UpgradeId } from "../../core/archetypes/ids";

export interface RunStatistics {
  readonly kills: number;
  readonly liveEnemies: number;
  readonly peakEnemiesAlive: number;
  readonly highestChaos: number;
  readonly highestCritChance: number;
  readonly highestCritTier: number;
  readonly longestPierceChain: number;
  readonly largestKillChain: number;
  readonly recentKillTimesMs: readonly number[];
  readonly totalDamage: number;
  readonly damageBreakdown: DamageBreakdown;
  /** How many times each upgrade was taken, in selection order. */
  readonly upgradeCounts: Readonly<Partial<Record<UpgradeId, number>>>;
}

export interface DamageRecord {
  readonly amount: number;
  readonly source: "direct" | "explosion" | "chained_explosion";
  readonly directBase?: number;
  readonly criticalBonus?: number;
  readonly piercingMomentum?: number;
}

export function createRunStatistics(initialCritChance = 0): RunStatistics {
  return Object.freeze({
    kills: 0,
    liveEnemies: 0,
    peakEnemiesAlive: 0,
    highestChaos: 1,
    highestCritChance: Math.max(0, initialCritChance),
    highestCritTier: 0,
    longestPierceChain: 0,
    largestKillChain: 0,
    recentKillTimesMs: Object.freeze([]),
    totalDamage: 0,
    damageBreakdown: Object.freeze({
      direct: 0,
      criticalBonus: 0,
      piercingMomentum: 0,
      explosion: 0,
      chainedExplosion: 0,
      remainder: 0,
    }),
    upgradeCounts: Object.freeze({}),
  });
}

export function recordUpgradeSelection(
  statistics: RunStatistics,
  upgradeId: UpgradeId,
): RunStatistics {
  return {
    ...statistics,
    upgradeCounts: Object.freeze({
      ...statistics.upgradeCounts,
      [upgradeId]: (statistics.upgradeCounts[upgradeId] ?? 0) + 1,
    }),
  };
}

export function observeLiveEnemies(statistics: RunStatistics, liveEnemies: number): RunStatistics {
  const live = Math.max(0, Math.floor(liveEnemies));
  return { ...statistics, liveEnemies: live, peakEnemiesAlive: Math.max(statistics.peakEnemiesAlive, live) };
}

export function observeChaos(statistics: RunStatistics, chaos: number): RunStatistics {
  return { ...statistics, highestChaos: Math.max(statistics.highestChaos, chaos) };
}

export function observeCrit(statistics: RunStatistics, chance: number, tier = 0): RunStatistics {
  return {
    ...statistics,
    highestCritChance: Math.max(statistics.highestCritChance, chance),
    highestCritTier: Math.max(statistics.highestCritTier, Math.max(0, Math.floor(tier))),
  };
}

export function observePierceChain(statistics: RunStatistics, chain: number): RunStatistics {
  return { ...statistics, longestPierceChain: Math.max(statistics.longestPierceChain, Math.max(0, Math.floor(chain))) };
}

export function recordCommittedKill(statistics: RunStatistics, nowMs: number): RunStatistics {
  const retained = statistics.recentKillTimesMs.filter((time) => time > nowMs - KILL_CHAIN_WINDOW_MS && time <= nowMs);
  const recentKillTimesMs = Object.freeze([...retained, nowMs]);
  return {
    ...statistics,
    kills: statistics.kills + 1,
    largestKillChain: Math.max(statistics.largestKillChain, recentKillTimesMs.length),
    recentKillTimesMs,
  };
}

export function recordCommittedDamage(statistics: RunStatistics, record: DamageRecord): RunStatistics {
  const amount = Math.max(0, record.amount);
  if (amount === 0) return statistics;
  const additions: Record<DamageCategory, number> = {
    direct: 0,
    criticalBonus: 0,
    piercingMomentum: 0,
    explosion: 0,
    chainedExplosion: 0,
    remainder: 0,
  };
  if (record.source === "explosion") additions.explosion = amount;
  else if (record.source === "chained_explosion") additions.chainedExplosion = amount;
  else {
    let remaining = amount;
    const allocate = (category: "direct" | "criticalBonus" | "piercingMomentum", intended = 0): void => {
      const applied = Math.min(remaining, Math.max(0, intended));
      additions[category] = applied;
      remaining -= applied;
    };
    allocate("direct", record.directBase);
    allocate("criticalBonus", record.criticalBonus);
    allocate("piercingMomentum", record.piercingMomentum);
    additions.remainder = remaining;
  }
  const damageBreakdown = Object.fromEntries(
    damageCategories.map((category) => [category, statistics.damageBreakdown[category] + additions[category]]),
  ) as Record<DamageCategory, number>;
  const frozenBreakdown = Object.freeze(damageBreakdown);
  return { ...statistics, totalDamage: sumDamageBreakdown(frozenBreakdown), damageBreakdown: frozenBreakdown };
}

export function sumDamageBreakdown(breakdown: DamageBreakdown): number {
  return damageCategories.reduce((total, category) => total + breakdown[category], 0);
}
