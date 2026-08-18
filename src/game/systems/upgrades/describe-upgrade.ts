import type {
  StatKey,
  ThemeManifest,
  UpgradeDefinition,
  UpgradeRarity,
  WorldKey,
} from "../../core/archetypes/contracts";
import type { UpgradeId } from "../../core/archetypes/ids";
import type { UpgradeTier } from "../../core/archetypes/tiers";
import { isTiered, tierMultiplier } from "./upgrade-tiers";
import { selectWorldModifiers } from "../chaos/world-modifiers";
import {
  findSkillEffect,
  resolveChain,
  resolveExplosion,
  resolveFractureChance,
  resolveMomentum,
  skillLevel,
  skillMaxLevel,
} from "../skills/resolve-skill";
import { applyUpgrade, upgradeLevel, type UpgradeableState } from "../upgrades";

/**
 * What a stat currently is, and what an upgrade would make it.
 *
 * The resolved values here are the ones the player actually experiences —
 * weapon damage after the damage bonus, shots per second after attack speed —
 * not the raw stored stat. The pause menu and the upgrade cards read the same
 * function, so a card can never claim a number the menu disagrees with.
 */

export interface StatLine {
  readonly key: StatKey;
  readonly label: string;
  readonly value: number;
  readonly display: string;
}

export interface WorldLine {
  readonly key: WorldKey;
  readonly label: string;
  readonly value: number;
  readonly display: string;
}

function round(value: number, places = 2): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function number(value: number): string {
  return Number.isInteger(value) ? String(value) : String(round(value));
}

function percent(value: number): string {
  return `${round(value * 100, 1)}%`;
}

function multiplier(value: number): string {
  return `×${round(value, 2)}`;
}

export interface StatContext {
  readonly player: { readonly health: number; readonly stats: UpgradeableState["player"]["stats"] };
  readonly weaponModifiers: UpgradeableState["weaponModifiers"];
}

/** The player's resolved stats, as shown in the pause menu and diffed by cards. */
export function selectPlayerStats(
  state: StatContext,
  theme: Pick<ThemeManifest, "weapons" | "copy">,
): readonly StatLine[] {
  const weapon = theme.weapons[0];
  const stats = state.player.stats;
  const labels = theme.copy.stats;
  const attackRate = weapon ? (1000 / weapon.cooldownMs) * (1 + stats.attackSpeedBonus) : 0;
  const damage = weapon ? weapon.damage * (1 + stats.damageBonus) : 0;

  const lines: readonly (readonly [StatKey, number, string])[] = [
    ["health", state.player.health, `${Math.ceil(state.player.health)} / ${Math.ceil(stats.maxHealth)}`],
    ["damage", damage, number(damage)],
    ["attackRate", attackRate, `${round(attackRate, 2)} /s`],
    ["critChance", stats.critChance, percent(stats.critChance)],
    ["critDamage", stats.critDamage, multiplier(stats.critDamage)],
    [
      "projectiles",
      (weapon?.projectileCount ?? 0) + state.weaponModifiers.projectileCount,
      number((weapon?.projectileCount ?? 0) + state.weaponModifiers.projectileCount),
    ],
    [
      "pierce",
      (weapon?.pierce ?? 0) + state.weaponModifiers.pierce,
      number((weapon?.pierce ?? 0) + state.weaponModifiers.pierce),
    ],
    ["range", weapon?.range ?? 0, number(weapon?.range ?? 0)],
    ["knockback", weapon?.knockback ?? 0, number(weapon?.knockback ?? 0)],
    ["armourPierce", weapon?.armourPierce ?? 0, percent(weapon?.armourPierce ?? 0)],
    ["moveSpeed", stats.moveSpeed, number(stats.moveSpeed)],
    ["pickupRadius", stats.pickupRadius, number(stats.pickupRadius)],
    ["armour", stats.armour, number(stats.armour)],
    ["regeneration", stats.regeneration, `${number(stats.regeneration)} /s`],
    ["luck", stats.luck, number(stats.luck)],
    ["xpMultiplier", stats.xpMultiplier, multiplier(stats.xpMultiplier)],
  ];

  return Object.freeze(
    lines.map(([key, value, display]) => Object.freeze({ key, label: labels[key], value, display })),
  );
}

/** World pressure, as shown in the pause menu. */
export function selectWorldLines(
  world: UpgradeableState["world"],
  theme: Pick<ThemeManifest, "copy" | "tuning">,
  progress = 0,
): readonly WorldLine[] {
  const modifiers = selectWorldModifiers(world, theme.tuning.difficulty, progress);
  const labels = theme.copy.world;
  const lines: readonly (readonly [WorldKey, number, string])[] = [
    ["chaos", modifiers.chaos, multiplier(modifiers.chaos)],
    ["enemySpawn", modifiers.enemySpawnMultiplier, multiplier(modifiers.enemySpawnMultiplier)],
    ["enemyHealth", modifiers.enemyHealthMultiplier, multiplier(modifiers.enemyHealthMultiplier)],
    ["enemyDamage", modifiers.enemyDamageMultiplier, multiplier(modifiers.enemyDamageMultiplier)],
    ["xpGain", modifiers.xpMultiplier, multiplier(modifiers.xpMultiplier)],
    ["eliteChance", modifiers.eliteChance, percent(modifiers.eliteChance)],
    ["threat", modifiers.threatStep, number(modifiers.threatStep)],
  ];
  return Object.freeze(
    lines.map(([key, value, display]) => Object.freeze({ key, label: labels[key], value, display })),
  );
}

export interface UpgradeChangeLine {
  readonly label: string;
  /** Absent when the upgrade introduces something the player does not have yet. */
  readonly from?: string;
  readonly to: string;
  /** Relative change, when it reads usefully. */
  readonly delta?: string;
}

export interface UpgradeDescription {
  readonly id: UpgradeId;
  readonly name: string;
  readonly summary: string;
  readonly rarity: UpgradeRarity;
  /** This offer's roll, which decides its colour and how much it gives. */
  readonly tier: UpgradeTier;
  /** Themed name for the tier, e.g. "Legendary". */
  readonly tierLabel: string;
  /** Gain over the authored value, `1` on a common roll. */
  readonly tierMultiplier: number;
  /** Times already taken. */
  readonly level: number;
  readonly nextLevel: number;
  readonly maxLevel: number;
  readonly isNew: boolean;
  readonly lines: readonly UpgradeChangeLine[];
}

/**
 * Describe what taking an upgrade would do, right now.
 *
 * The numbers come from applying the upgrade to a copy of the state and
 * diffing, so a card cannot claim something the upgrade does not do. Changing
 * an upgrade's effect changes its card automatically.
 */
export function describeUpgrade(
  state: UpgradeableState,
  upgrade: UpgradeDefinition,
  theme: Pick<ThemeManifest, "weapons" | "copy" | "skills" | "tuning">,
  tier: UpgradeTier = "common",
): UpgradeDescription {
  const level = upgradeLevel(state.selectedUpgradeIds, upgrade.id);
  // An untiered upgrade is described at its authored value however it rolled,
  // so the card can never promise a bonus the application will not deliver.
  const resolvedTier = isTiered(upgrade) ? tier : "common";
  const multiplier = tierMultiplier(theme.tuning.upgradeTiers, resolvedTier);
  const after = applyUpgrade(
    state,
    upgrade,
    (skillId) => skillMaxLevel(theme.skills, skillId),
    multiplier,
  );

  const beforeStats = selectPlayerStats(state, theme);
  const afterStats = selectPlayerStats(after, theme);
  const lines: UpgradeChangeLine[] = [];

  afterStats.forEach((next, index) => {
    const previous = beforeStats[index];
    if (!previous || previous.value === next.value) return;
    const delta = previous.value > 0 && next.value > previous.value
      ? `+${Math.round(((next.value - previous.value) / previous.value) * 100)}%`
      : undefined;
    lines.push(Object.freeze({ label: next.label, from: previous.display, to: next.display, delta }));
  });

  const beforeWorld = selectWorldLines(state.world, theme);
  const afterWorld = selectWorldLines(after.world, theme);
  afterWorld.forEach((next, index) => {
    const previous = beforeWorld[index];
    if (!previous || previous.value === next.value) return;
    lines.push(Object.freeze({ label: next.label, from: previous.display, to: next.display }));
  });

  lines.push(...describeSkillChange(state, after, upgrade, theme));

  return Object.freeze({
    id: upgrade.id,
    name: theme.copy.content[upgrade.id]?.name ?? upgrade.id,
    summary: theme.copy.content[upgrade.id]?.description ?? "",
    rarity: upgrade.rarity,
    tier: resolvedTier,
    tierLabel: theme.copy.tiers[resolvedTier],
    tierMultiplier: multiplier,
    level,
    nextLevel: level + 1,
    maxLevel: upgrade.maxLevel,
    isNew: level === 0,
    lines: Object.freeze(lines),
  });
}

function describeSkillChange(
  before: UpgradeableState,
  after: UpgradeableState,
  upgrade: UpgradeDefinition,
  theme: Pick<ThemeManifest, "copy" | "skills">,
): readonly UpgradeChangeLine[] {
  const lines: UpgradeChangeLine[] = [];

  for (const effect of upgrade.effects) {
    if (effect.kind !== "skill.level") continue;
    const previous = skillLevel(before.skillLevels, effect.skillId);
    const next = skillLevel(after.skillLevels, effect.skillId);
    if (previous === next) continue;
    const labels = theme.copy.stats;

    const explosion = findSkillEffect(theme.skills, effect.skillId, "on_kill_explosion");
    if (explosion) {
      const from = previous > 0 ? resolveExplosion(explosion, previous) : undefined;
      const to = resolveExplosion(explosion, next);
      lines.push(Object.freeze({
        label: labels.range,
        from: from ? number(from.radius) : undefined,
        to: number(to.radius),
      }));
      lines.push(Object.freeze({
        label: labels.damage,
        from: from ? percent(from.victimHealthShare) : undefined,
        to: percent(to.victimHealthShare),
      }));
      continue;
    }

    const chain = findSkillEffect(theme.skills, effect.skillId, "chain_reaction");
    if (chain) {
      const from = previous > 0 ? resolveChain(chain, previous) : undefined;
      const to = resolveChain(chain, next);
      lines.push(Object.freeze({
        label: labels.pierce,
        from: from ? number(from.maxDepth) : undefined,
        to: number(to.maxDepth),
      }));
      continue;
    }

    const momentum = findSkillEffect(theme.skills, effect.skillId, "piercing_momentum");
    if (momentum) {
      lines.push(Object.freeze({
        label: labels.damage,
        from: previous > 0 ? percent(resolveMomentum(momentum, previous)) : undefined,
        to: percent(resolveMomentum(momentum, next)),
      }));
      continue;
    }

    const fracture = findSkillEffect(theme.skills, effect.skillId, "fracture");
    if (fracture) {
      lines.push(Object.freeze({
        label: labels.luck,
        from: previous > 0 ? percent(resolveFractureChance(fracture, previous)) : undefined,
        to: percent(resolveFractureChance(fracture, next)),
      }));
      continue;
    }

    // Any other skill still reads as a level change rather than nothing.
    lines.push(Object.freeze({
      label: theme.copy.content[effect.skillId]?.name ?? effect.skillId,
      from: previous > 0 ? String(previous) : undefined,
      to: String(next),
    }));
  }

  return lines;
}
