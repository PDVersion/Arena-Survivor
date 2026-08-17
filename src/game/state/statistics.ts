import type { RunState } from "./run-state";
import type { ThemeCopy, ThemeVocabulary } from "../core/archetypes/contracts";
import type { UpgradeId } from "../core/archetypes/ids";

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
  readonly upgradesTitle: string;
  readonly upgrades: readonly string[];
  /** Present only on a death, never on a completed run. */
  readonly deathCause?: string;
}

/** "Overwhelmed by an elite Glass Bottle at 4:12" */
export function selectDeathCause(
  state: RunState,
  vocabulary: ThemeVocabulary,
  content: ThemeCopy["content"],
): string | undefined {
  const cause = state.deathCause;
  if (!cause || state.status !== "dead") return undefined;
  const name = content[cause.sourceId as keyof typeof content]?.name ?? cause.sourceId;
  const elite = cause.elite ? "an elite " : "";
  return `${vocabulary.deathCause} ${elite}${name} at ${formatRunTime(state.durationMs - cause.atMs)}`;
}

/**
 * Upgrades taken, most-taken first, then by first-selection order so repeated
 * runs read consistently. Names come from the theme copy catalog; an unknown
 * ID falls back to the stable ID rather than being dropped, so a content gap is
 * visible instead of silent.
 */
export function selectUpgradeTally(
  state: RunState,
  content: ThemeCopy["content"],
): readonly string[] {
  const counts = state.statistics.upgradeCounts;
  const firstSelected = new Map<string, number>();
  state.selectedUpgradeIds.forEach((id, index) => {
    if (!firstSelected.has(id)) firstSelected.set(id, index);
  });

  return Object.freeze(
    (Object.keys(counts) as UpgradeId[])
      .sort((left, right) => {
        const byCount = (counts[right] ?? 0) - (counts[left] ?? 0);
        if (byCount !== 0) return byCount;
        return (firstSelected.get(left) ?? 0) - (firstSelected.get(right) ?? 0);
      })
      .map((id) => `${content[id]?.name ?? id} ×${counts[id] ?? 0}`),
  );
}

export function selectRunSummaryValues(
  state: RunState,
  vocabulary: ThemeVocabulary,
  content: ThemeCopy["content"] = {} as ThemeCopy["content"],
): RunSummaryValues {
  const statistics = state.statistics;
  const breakdown = statistics.damageBreakdown;
  return Object.freeze({
    deathCause: selectDeathCause(state, vocabulary, content),
    upgradesTitle: vocabulary.upgradesTaken,
    upgrades: selectUpgradeTally(state, content),
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
