import type { RunState } from "./run-state";
import type { ThemeVocabulary } from "../core/archetypes/contracts";

export interface HudValues {
  readonly health: string;
  readonly experience: string;
  readonly level: string;
  readonly time: string;
  readonly kills: string;
  readonly enemies: string;
}

export function formatRunTime(remainingMs: number): string {
  if (!Number.isFinite(remainingMs)) throw new Error("Remaining time must be finite");
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function selectHudValues(state: RunState): HudValues {
  const formatXp = (value: number): string =>
    Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
  return {
    health: `${Math.ceil(state.player.health)} / ${Math.ceil(state.player.stats.maxHealth)}`,
    experience: `${formatXp(state.progression.xp)} / ${formatXp(state.progression.xpToNextLevel)}`,
    level: String(state.progression.level),
    time: formatRunTime(state.durationMs - state.elapsedMs),
    kills: String(state.statistics.kills),
    enemies: String(state.statistics.liveEnemies),
  };
}

function formatStatistic(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export interface RunSummaryValues {
  readonly title: string;
  readonly metrics: readonly string[];
  readonly damage: readonly string[];
}

export function selectRunSummaryValues(state: RunState, vocabulary: ThemeVocabulary): RunSummaryValues {
  const statistics = state.statistics;
  const breakdown = statistics.damageBreakdown;
  return Object.freeze({
    title: vocabulary.statisticsTitle,
    metrics: Object.freeze([
      `${vocabulary.kills}: ${statistics.kills}`,
      `${vocabulary.peakEnemiesAlive}: ${statistics.peakEnemiesAlive}`,
      `${vocabulary.highestChaos}: ${formatStatistic(statistics.highestChaos)}×`,
      `${vocabulary.highestCrit}: ${formatStatistic(statistics.highestCritChance * 100)}%`,
      `${vocabulary.highestCritTier}: ${statistics.highestCritTier}`,
      `${vocabulary.longestPierce}: ${statistics.longestPierceChain}`,
      `${vocabulary.largestKillChain}: ${statistics.largestKillChain}`,
    ]),
    damage: Object.freeze([
      `${vocabulary.totalDamage}: ${formatStatistic(statistics.totalDamage)}`,
      `${vocabulary.directDamage}: ${formatStatistic(breakdown.direct)}`,
      `${vocabulary.criticalBonusDamage}: ${formatStatistic(breakdown.criticalBonus)}`,
      `${vocabulary.piercingMomentumDamage}: ${formatStatistic(breakdown.piercingMomentum)}`,
      `${vocabulary.explosionDamage}: ${formatStatistic(breakdown.explosion)}`,
      `${vocabulary.chainedExplosionDamage}: ${formatStatistic(breakdown.chainedExplosion)}`,
      `${vocabulary.remainderDamage}: ${formatStatistic(breakdown.remainder)}`,
    ]),
  });
}
