import type { WeaponDefinition } from "../../core/archetypes/contracts";
import type { WeaponId } from "../../core/archetypes/ids";

/** Serializable run data. Array position is the slot; clocks use simulation ms. */
export interface WeaponSlotState {
  readonly weaponId: WeaponId;
  readonly nextAttackAtMs: number;
}

export function createWeaponSlots(weaponIds: readonly WeaponId[]): readonly WeaponSlotState[] {
  if (new Set(weaponIds).size !== weaponIds.length) {
    throw new Error("A weapon can occupy only one slot");
  }
  return Object.freeze(weaponIds.map((weaponId) => Object.freeze({ weaponId, nextAttackAtMs: 0 })));
}

/** Full/duplicate acquisition is a no-op; invalid content is a caller error. */
export function equipWeapon(
  slots: readonly WeaponSlotState[],
  weaponId: WeaponId,
  capacity: number,
  definitions: readonly WeaponDefinition[],
): readonly WeaponSlotState[] {
  if (!Number.isSafeInteger(capacity) || capacity < 1) throw new Error("Invalid weapon slot capacity");
  if (!definitions.some((weapon) => weapon.id === weaponId)) throw new Error(`Unknown weapon: ${weaponId}`);
  if (slots.length >= capacity || slots.some((slot) => slot.weaponId === weaponId)) return slots;
  return Object.freeze([...slots, ...createWeaponSlots([weaponId])]);
}

/** Commit one successful attack; never replay missed attacks after a long frame. */
export function recordWeaponAttack(
  slots: readonly WeaponSlotState[],
  weaponId: WeaponId,
  nowMs: number,
  cooldownMs: number,
): readonly WeaponSlotState[] {
  if (!Number.isFinite(nowMs) || nowMs < 0 || !Number.isFinite(cooldownMs) || cooldownMs <= 0 ||
    !Number.isFinite(nowMs + cooldownMs)) throw new Error("Invalid weapon attack time");
  const slot = slots.find((entry) => entry.weaponId === weaponId);
  if (!slot) throw new Error(`Weapon is not equipped: ${weaponId}`);
  if (nowMs < slot.nextAttackAtMs) return slots;
  return Object.freeze(slots.map((entry) => entry === slot
    ? Object.freeze({ ...entry, nextAttackAtMs: nowMs + cooldownMs })
    : entry));
}

/** Replacement keeps position and earned cooldown; it grants no free attack. */
export function replaceWeapon(
  slots: readonly WeaponSlotState[],
  fromWeaponId: WeaponId,
  weaponId: WeaponId,
  definitions: readonly WeaponDefinition[],
): readonly WeaponSlotState[] {
  if (!definitions.some((weapon) => weapon.id === weaponId)) throw new Error(`Unknown weapon: ${weaponId}`);
  if (!slots.some((slot) => slot.weaponId === fromWeaponId) || slots.some((slot) => slot.weaponId === weaponId)) return slots;
  return Object.freeze(slots.map((slot) => slot.weaponId === fromWeaponId
    ? Object.freeze({ ...slot, weaponId }) : slot));
}
