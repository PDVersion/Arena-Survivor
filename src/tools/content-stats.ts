import type { ContentId } from "../game/core/archetypes/ids";
import type { ThemeManifest } from "../game/core/archetypes/contracts";
import { reduceByArmour } from "../game/systems/combat";

export interface ContentStatRow { readonly label: string; readonly value: number; readonly unit?: string }

/** Read definitions from the chosen resolved theme, never sprite dimensions. */
export function contentStatRows(theme: ThemeManifest, id: ContentId): readonly ContentStatRow[] {
  const labels = theme.copy.stats;
  const enemy = theme.enemies.find((entry) => entry.id === id);
  if (enemy) {
    const player = theme.characters[0]!.baseStats;
    const weapon = theme.weapons[0]!;
    const hit = reduceByArmour(weapon.damage * (1 + player.damageBonus), enemy.armour, weapon.armourPierce);
    return [
      { label: labels.health, value: enemy.maxHealth },
      { label: labels.armour, value: enemy.armour },
      { label: `Contact ${labels.damage.toLowerCase()}`, value: enemy.contactDamage },
      { label: labels.moveSpeed, value: enemy.moveSpeed, unit: "world units/s" },
      { label: "XP reward", value: enemy.xpReward },
      { label: "Body radius", value: enemy.radius, unit: "world units" },
      { label: "Starter hits (non-critical)", value: Math.ceil(enemy.maxHealth / hit) },
    ];
  }
  const character = theme.characters.find((entry) => entry.id === id);
  if (character) {
    const stats = character.baseStats;
    return [
      { label: labels.health, value: stats.maxHealth },
      { label: labels.armour, value: stats.armour },
      { label: labels.moveSpeed, value: stats.moveSpeed, unit: "world units/s" },
      { label: labels.regeneration, value: stats.regeneration, unit: "/s" },
      { label: labels.pickupRadius, value: stats.pickupRadius, unit: "world units" },
      { label: labels.critChance, value: stats.critChance * 100, unit: "%" },
      { label: labels.critDamage, value: stats.critDamage, unit: "×" },
    ];
  }
  const weapon = theme.weapons.find((entry) => entry.id === id);
  if (weapon) return [
    { label: labels.damage, value: weapon.damage },
    { label: labels.attackRate, value: 1000 / weapon.cooldownMs, unit: "/s" },
    { label: "Cooldown", value: weapon.cooldownMs, unit: "ms" },
    { label: labels.range, value: weapon.range, unit: "world units" },
    { label: labels.knockback, value: weapon.knockback },
    { label: labels.armourPierce, value: weapon.armourPierce * 100, unit: "%" },
  ];
  return [];
}
