import type { ShrineDefinition, ThemeCopy, ThemeManifest } from "../../core/archetypes/contracts";
import type { ShrineId, UpgradeId } from "../../core/archetypes/ids";
import type { SessionStatistics } from "../../state/session-statistics";

/**
 * What a shrine does, in the player's words and the game's numbers.
 *
 * Same discipline as the upgrade cards (REC-055): every figure is read from the
 * definition the run actually resolves, never written a second time in prose.
 * Retuning a shrine retunes its codex page, and the two cannot drift apart.
 *
 * V0.3 had no reference surface at all, so a shrine's cost was discoverable
 * only by activating it — a permanent, one-way choice. Now that shrines arrive
 * scattered across the run rather than clustered at the start, walking to one
 * is itself a decision, and it needs to be an informed one.
 */

export interface CodexEffect {
  readonly label: string;
  readonly display: string;
}

export interface CodexEntry {
  readonly id: ShrineId;
  readonly name: string;
  readonly description: string;
  readonly effects: readonly CodexEffect[];
}

function round(value: number, places = 2): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function multiplier(value: number): string {
  return `×${round(value)}`;
}

function seconds(ms: number): string {
  return `${round(ms / 1000, 1)}s`;
}

function describeEffects(
  shrine: ShrineDefinition,
  copy: ThemeCopy,
): readonly CodexEffect[] {
  const effects: CodexEffect[] = [];
  if (shrine.chaosIncrease !== 0) {
    effects.push({ label: copy.world.chaos, display: `+${round(shrine.chaosIncrease)}` });
  }
  if (shrine.enemySpawnMultiplier !== 1) {
    effects.push({ label: copy.world.enemySpawn, display: multiplier(shrine.enemySpawnMultiplier) });
  }
  if (shrine.xpMultiplier !== 1) {
    effects.push({ label: copy.world.xpGain, display: multiplier(shrine.xpMultiplier) });
  }
  if (shrine.effectKind === "spawn_surge" && shrine.spawnCount > 0) {
    effects.push({
      label: copy.codex.released,
      display: `${shrine.spawnCount} over ${seconds(shrine.spawnDurationMs)}`,
    });
  }
  if (shrine.effectKind === "duplicate_living") {
    effects.push({ label: copy.codex.duplicates, display: copy.codex.duplicatesValue });
  }
  if (shrine.rewardMultiplier !== 1) {
    effects.push({ label: copy.codex.reward, display: multiplier(shrine.rewardMultiplier) });
  }
  return Object.freeze(effects);
}

/** Every shrine in the active theme, in definition order. */
export function selectShrineCodex(
  theme: Pick<ThemeManifest, "shrines" | "copy">,
): readonly CodexEntry[] {
  return Object.freeze(
    theme.shrines.map((shrine) =>
      Object.freeze({
        id: shrine.id,
        name: theme.copy.content[shrine.id]?.name ?? shrine.id,
        description: theme.copy.content[shrine.id]?.description ?? "",
        effects: describeEffects(shrine, theme.copy),
      }),
    ),
  );
}

export interface CodexUpgradeEntry {
  readonly id: UpgradeId;
  readonly name: string;
  readonly description: string;
  readonly rarity: string;
  /** Times taken across every run this session. */
  readonly sessionTotal: number;
  /** The most this upgrade was taken within one run. */
  readonly bestInRun: number;
  /** Times it can be taken in a single run, from the definition's cap. */
  readonly maxPerRun: number;
}

/**
 * Every upgrade the pool can offer, with what the player has done with it.
 *
 * The whole pool is listed, not only what has been taken — an entry the player
 * has never seen at zero is the useful part, because it says the upgrade exists
 * and how far it can be pushed. `maxPerRun` comes from the definition's cap, so
 * it is the real ceiling rather than a number written twice.
 */
export function selectUpgradeCodex(
  theme: Pick<ThemeManifest, "upgrades" | "copy">,
  session: SessionStatistics,
): readonly CodexUpgradeEntry[] {
  return Object.freeze(
    theme.upgrades.map((upgrade) => {
      const record = session.upgrades[upgrade.id];
      return Object.freeze({
        id: upgrade.id,
        name: theme.copy.content[upgrade.id]?.name ?? upgrade.id,
        description: theme.copy.content[upgrade.id]?.description ?? "",
        rarity: upgrade.rarity,
        sessionTotal: record?.total ?? 0,
        bestInRun: record?.bestInRun ?? 0,
        maxPerRun: upgrade.maxLevel,
      });
    }),
  );
}

export interface CodexSessionLine {
  readonly label: string;
  readonly display: string;
}

function statistic(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** The session totals shown alongside the catalogue. */
export function selectSessionCodex(
  theme: Pick<ThemeManifest, "copy">,
  session: SessionStatistics,
): readonly CodexSessionLine[] {
  const codex = theme.copy.codex;
  const vocabulary = theme.copy.vocabulary;
  return Object.freeze([
    { label: codex.runsPlayed, display: String(session.runsPlayed) },
    { label: vocabulary.kills, display: statistic(session.totalKills) },
    { label: vocabulary.totalDamage, display: statistic(session.totalDamage) },
    { label: `${codex.best} ${vocabulary.level}`, display: String(session.bestLevel) },
    { label: `${codex.best} ${vocabulary.kills}`, display: statistic(session.bestKills) },
    { label: `${codex.best} ${vocabulary.totalDamage}`, display: statistic(session.bestDamage) },
  ].map((line) => Object.freeze(line)));
}
