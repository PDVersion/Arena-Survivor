import type { UpgradeCategory, UpgradeDefinition, UpgradeRarity } from "../core/archetypes/contracts";
import type { SkillId, UpgradeId } from "../core/archetypes/ids";
import type { PlayerBaseStats } from "../core/stats/player-stats";
import { applyWorldModifier, type WorldState } from "./chaos/world-modifiers";
import { raiseSkillLevel, type SkillLevels } from "./skills/resolve-skill";
import { scaleSkillLevels, scaleStatValue } from "./upgrades/upgrade-tiers";

export type RandomSource = () => number;

export interface WeaponStatModifiers {
  readonly pierce: number;
  readonly projectileCount: number;
}

export interface UpgradeableState {
  readonly player: {
    readonly health: number;
    readonly stats: PlayerBaseStats;
  };
  readonly weaponModifiers: WeaponStatModifiers;
  readonly selectedUpgradeIds: readonly UpgradeId[];
  readonly skillLevels: SkillLevels;
  readonly world: WorldState;
}

export function createWeaponStatModifiers(): WeaponStatModifiers {
  return { pierce: 0, projectileCount: 0 };
}

export function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** How many times an upgrade has already been taken. */
export function upgradeLevel(
  selectedUpgradeIds: readonly UpgradeId[],
  upgradeId: UpgradeId,
): number {
  return selectedUpgradeIds.filter((id) => id === upgradeId).length;
}

/** An upgrade at its cap can only ever be a no-op, so it leaves the pool. */
export function isUpgradeAvailable(
  upgrade: UpgradeDefinition,
  selectedUpgradeIds: readonly UpgradeId[],
): boolean {
  return upgradeLevel(selectedUpgradeIds, upgrade.id) < upgrade.maxLevel;
}

/**
 * How often each rarity class appears in a draw.
 *
 * This is about *which* upgrade shows up, not how good the card is — that is
 * the per-offer tier roll in `upgrades/upgrade-tiers`. The gap was narrowed
 * from 100/38/12 once tiers existed: rarity had been carrying both jobs, so the
 * only way to make an upgrade feel special was to make it scarce, and pierce
 * and the extra projectile — two picks that define a build — were scarce enough
 * to arrive after the run they were supposed to shape. Excitement now comes
 * from the tier, so appearance rates can be closer to even.
 */
const RARITY_WEIGHT: Readonly<Record<UpgradeRarity, number>> = Object.freeze({
  common: 100,
  rare: 60,
  epic: 25,
});

/** Luck shifts the draw toward rarer entries without ever excluding commons. */
export function rarityWeight(rarity: UpgradeRarity, luck = 0): number {
  const base = RARITY_WEIGHT[rarity];
  if (rarity === "common") return base;
  const bonus = 1 + Math.max(0, luck) / 100;
  return base * bonus;
}

export interface UpgradeSelectionContext {
  readonly selectedUpgradeIds: readonly UpgradeId[];
  readonly luck?: number;
}

/**
 * Draw distinct upgrade choices.
 *
 * Three rules, each fixing something V0.2 got wrong: maxed upgrades are
 * excluded so an offer is never a no-op, weights come from rarity and luck
 * rather than being uniform, and a draw avoids being three of the same category
 * so the player always has a real decision.
 */
export function selectUpgradeChoices(
  pool: readonly UpgradeDefinition[],
  count: number,
  random: RandomSource,
  context: UpgradeSelectionContext = { selectedUpgradeIds: [] },
): readonly UpgradeDefinition[] {
  if (!Number.isInteger(count) || count < 1) throw new Error("Choice count must be positive");

  const available = pool.filter((upgrade) => isUpgradeAvailable(upgrade, context.selectedUpgradeIds));
  if (available.length < count) {
    throw new Error("Upgrade pool cannot provide enough distinct choices");
  }

  const chosen: UpgradeDefinition[] = [];
  const categoryCounts = new Map<UpgradeCategory, number>();
  let candidates = [...available];

  while (chosen.length < count) {
    // Prefer categories not already twice represented, but never deadlock: if
    // the filter would leave nothing, fall back to the whole remaining pool.
    const preferred = candidates.filter(
      (upgrade) => (categoryCounts.get(upgrade.category) ?? 0) < 2,
    );
    const drawFrom = preferred.length > 0 ? preferred : candidates;

    const total = drawFrom.reduce(
      (sum, upgrade) => sum + rarityWeight(upgrade.rarity, context.luck),
      0,
    );
    const roll = random();
    if (!Number.isFinite(roll) || roll < 0 || roll >= 1) {
      throw new Error("Random source must return a value in [0, 1)");
    }

    let remaining = roll * total;
    let picked = drawFrom.at(-1)!;
    for (const upgrade of drawFrom) {
      remaining -= rarityWeight(upgrade.rarity, context.luck);
      if (remaining < 0) {
        picked = upgrade;
        break;
      }
    }

    chosen.push(picked);
    categoryCounts.set(picked.category, (categoryCounts.get(picked.category) ?? 0) + 1);
    candidates = candidates.filter((upgrade) => upgrade.id !== picked.id);
  }

  return chosen;
}

/**
 * Apply an upgrade at a rolled multiplier.
 *
 * `multiplier` is the offer's tier gain, `1` for a common roll and for every
 * caller that does not deal in tiers. World modifiers ignore it: see `isTiered`.
 */
export function applyUpgrade<T extends UpgradeableState>(
  state: T,
  upgrade: UpgradeDefinition,
  skillMaxLevel: (skillId: SkillId) => number = () => 1,
  multiplier = 1,
): T {
  const stats = { ...state.player.stats };
  let health = state.player.health;
  const weaponModifiers = { ...state.weaponModifiers };
  let skillLevels = state.skillLevels;
  let world = state.world;

  for (const effect of upgrade.effects) {
    if (effect.kind === "skill.level") {
      const steps = scaleSkillLevels(multiplier);
      for (let step = 0; step < steps; step += 1) {
        skillLevels = raiseSkillLevel(skillLevels, effect.skillId, skillMaxLevel(effect.skillId));
      }
      continue;
    }
    if (effect.kind === "world.modify") {
      world = applyWorldModifier(world, {
        chaosIncrease: effect.chaosIncrease ?? 0,
        enemySpawnMultiplier: effect.enemySpawnMultiplier ?? 1,
        xpMultiplier: effect.xpMultiplier ?? 1,
      });
      continue;
    }
    const value = scaleStatValue(effect.target, effect.value, multiplier);
    switch (effect.target) {
      case "player.maxHealth":
        stats.maxHealth += value;
        health += value;
        break;
      case "player.moveSpeed":
        stats.moveSpeed += value;
        break;
      case "player.pickupRadius":
        stats.pickupRadius += value;
        break;
      case "player.damageBonus":
        stats.damageBonus += value;
        break;
      case "player.attackSpeedBonus":
        stats.attackSpeedBonus += value;
        break;
      case "player.critChance":
        stats.critChance += value;
        break;
      case "player.luck":
        stats.luck += value;
        break;
      case "player.armour":
        stats.armour += value;
        break;
      case "player.regeneration":
        stats.regeneration += value;
        break;
      case "weapon.pierce":
        weaponModifiers.pierce += value;
        break;
      case "weapon.projectileCount":
        weaponModifiers.projectileCount += value;
        break;
    }
  }

  return {
    ...state,
    player: { ...state.player, health, stats },
    weaponModifiers,
    skillLevels,
    world,
    selectedUpgradeIds: [...state.selectedUpgradeIds, upgrade.id],
  };
}
