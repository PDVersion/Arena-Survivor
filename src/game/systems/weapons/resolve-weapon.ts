import type { WeaponDefinition } from "../../core/archetypes/contracts";
import type { WeaponStatModifiers } from "../upgrades";

/**
 * Resolve run-owned weapon progression without mutating theme data.
 *
 * Range and melee reach are the same authored promise for a stab weapon, so
 * both move together. Presentation and collision therefore cannot disagree.
 */
export function resolveWeaponDefinition(
  definition: WeaponDefinition,
  modifiers: WeaponStatModifiers,
): WeaponDefinition {
  if (definition.deliveryKind === "melee") {
    return Object.freeze({
      ...definition,
      range: definition.range + modifiers.range,
      reach: definition.reach + modifiers.range,
    });
  }
  return Object.freeze({
    ...definition,
    pierce: definition.pierce + modifiers.pierce,
    projectileCount: definition.projectileCount + modifiers.projectileCount,
  });
}
