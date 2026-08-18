import type { ShrineDefinition, ThemeCopy, ThemeManifest } from "../../core/archetypes/contracts";
import type { ShrineId } from "../../core/archetypes/ids";

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
