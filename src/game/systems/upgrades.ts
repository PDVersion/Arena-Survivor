import type { UpgradeDefinition } from "../core/archetypes/contracts";
import type { UpgradeId } from "../core/archetypes/ids";
import type { PlayerBaseStats } from "../core/stats/player-stats";

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

export function selectUpgradeChoices(
  pool: readonly UpgradeDefinition[],
  count: number,
  random: RandomSource,
): readonly UpgradeDefinition[] {
  if (!Number.isInteger(count) || count < 1) throw new Error("Choice count must be positive");
  if (pool.length < count) throw new Error("Upgrade pool cannot provide enough distinct choices");

  const candidates = [...pool];
  const choices: UpgradeDefinition[] = [];
  while (choices.length < count) {
    const roll = random();
    if (!Number.isFinite(roll) || roll < 0 || roll >= 1) {
      throw new Error("Random source must return a value in [0, 1)");
    }
    const index = Math.floor(roll * candidates.length);
    const [choice] = candidates.splice(index, 1);
    if (choice) choices.push(choice);
  }
  return choices;
}

export function applyUpgrade<T extends UpgradeableState>(state: T, upgrade: UpgradeDefinition): T {
  const stats = { ...state.player.stats };
  let health = state.player.health;
  const weaponModifiers = { ...state.weaponModifiers };

  for (const effect of upgrade.effects) {
    switch (effect.target) {
      case "player.maxHealth":
        stats.maxHealth += effect.value;
        health += effect.value;
        break;
      case "player.moveSpeed":
        stats.moveSpeed += effect.value;
        break;
      case "player.pickupRadius":
        stats.pickupRadius += effect.value;
        break;
      case "player.damageBonus":
        stats.damageBonus += effect.value;
        break;
      case "player.attackSpeedBonus":
        stats.attackSpeedBonus += effect.value;
        break;
      case "player.critChance":
        stats.critChance += effect.value;
        break;
      case "weapon.pierce":
        weaponModifiers.pierce += effect.value;
        break;
      case "weapon.projectileCount":
        weaponModifiers.projectileCount += effect.value;
        break;
    }
  }

  return {
    ...state,
    player: { ...state.player, health, stats },
    weaponModifiers,
    selectedUpgradeIds: [...state.selectedUpgradeIds, upgrade.id],
  };
}
