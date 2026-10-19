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
  owned?: WeaponStatModifiers,
): WeaponDefinition {
  if (definition.deliveryKind === "melee") {
    return Object.freeze({
      ...definition,
      range: definition.range + (modifiers.range + (owned?.range ?? 0)),
      reach: definition.reach + (modifiers.range + (owned?.range ?? 0)),
    });
  }
  return Object.freeze({
    ...definition,
    pierce: definition.pierce + (modifiers.pierce + (owned?.pierce ?? 0)),
    projectileCount: definition.projectileCount + (modifiers.projectileCount + (owned?.projectileCount ?? 0)),
  });
}
