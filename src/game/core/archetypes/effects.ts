export const upgradeStatTargets = [
  "player.maxHealth",
  "player.moveSpeed",
  "player.pickupRadius",
  "player.damageBonus",
  "player.attackSpeedBonus",
  "player.critChance",
  "weapon.pierce",
  "weapon.projectileCount",
] as const;

export type UpgradeStatTarget = (typeof upgradeStatTargets)[number];

export interface AddStatEffect {
  readonly kind: "stat.add";
  readonly target: UpgradeStatTarget;
  readonly value: number;
}

export interface EnableSkillEffect {
  readonly kind: "skill.enable";
  readonly skillId: SkillId;
}

export type UpgradeEffect = AddStatEffect | EnableSkillEffect;
import type { SkillId } from "./ids";
