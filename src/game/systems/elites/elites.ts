import { eliteIds, type EliteId } from "../../core/archetypes/categories";
import type { EliteDefinition } from "../../core/archetypes/contracts";

export function shouldSpawnElite(
  chance: number,
  random: () => number,
  inherited?: boolean,
): boolean {
  if (inherited !== undefined) return inherited;
  return random() < Math.max(0, Math.min(1, chance));
}

/** Inherited identities never reroll or consume RNG; old boolean fixtures retain baseline meaning. */
export function selectElite(definitions: readonly EliteDefinition[], chance: number, random: () => number,
  inherited?: boolean | EliteId): EliteDefinition | undefined {
  if (inherited !== undefined) return inherited === false ? undefined : definitions.find((entry) => entry.id === (inherited === true ? eliteIds.baseline : inherited));
  if (!shouldSpawnElite(chance, random)) return undefined;
  return definitions[Math.min(definitions.length - 1, Math.floor(Math.max(0, random()) * definitions.length))];
}
export function eliteIncomingDamage(elite: EliteDefinition | undefined, health: number, maxHealth: number, damage: number): number {
  return Math.max(0, damage) * (elite?.shield && health > maxHealth * elite.shield.untilHealthFraction ? elite.shield.damageMultiplier : 1);
}
export function eliteSpeedMultiplier(elite: EliteDefinition | undefined, ageMs: number): number {
  if (!elite?.acceleration) return 1;
  return 1 + (elite.acceleration.maxSpeedMultiplier - 1) * Math.min(1, Math.max(0, ageMs) / elite.acceleration.durationMs);
}
export function eliteSplitCount(elite: EliteDefinition | undefined, depth: number): number {
  return elite?.split && depth < elite.split.maxDepth ? elite.split.childCount : 0;
}
