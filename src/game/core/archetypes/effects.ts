export const upgradeStatTargets = [
  "player.armour",
  "player.luck",
  "player.maxHealth",
  "player.regeneration",
  "player.moveSpeed",
  "player.pickupRadius",
  "player.damageBonus",
  "player.attackSpeedBonus",
  "player.critChance",
  "weapon.pierce",
  "weapon.projectileCount",
  "weapon.range",
] as const;

export type UpgradeStatTarget = (typeof upgradeStatTargets)[number];

export interface AddStatEffect {
  readonly kind: "stat.add";
  readonly target: UpgradeStatTarget;
  readonly value: number;
}

/** Raises a skill by one level, capped by the skill's `maxLevel`. */
export interface LevelSkillEffect {
  readonly kind: "skill.level";
  readonly skillId: SkillId;
}

/**
 * A deliberately dangerous choice: raises world pressure in exchange for
 * reward. The clearest expression of "difficulty should be player-controlled".
 */
export interface WorldModifyEffect {
  readonly kind: "world.modify";
  readonly chaosIncrease?: number;
  readonly enemySpawnMultiplier?: number;
  readonly xpMultiplier?: number;
}

export interface EquipWeaponEffect {
  readonly kind: "weapon.equip";
  readonly weaponId: WeaponId;
}

/** A pick-count condition; quality gains never substitute for earned picks. */
export interface EvolveWeaponEffect {
  readonly kind: "weapon.evolve";
  readonly fromWeaponId: WeaponId;
  readonly weaponId: WeaponId;
  readonly requiredUpgradeId: UpgradeId;
  readonly requiredPicks: number;
}

export interface AcceptCurseEffect {
  readonly kind: "curse.accept";
  readonly curseId: CurseId;
}

export type UpgradeEffect = AddStatEffect | LevelSkillEffect | WorldModifyEffect | EquipWeaponEffect | EvolveWeaponEffect | AcceptCurseEffect;
import type { CurseId, SkillId, UpgradeId, WeaponId } from "./ids";
