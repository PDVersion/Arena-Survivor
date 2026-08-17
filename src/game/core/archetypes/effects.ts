export const upgradeStatTargets = [
  "player.luck",
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

export type UpgradeEffect = AddStatEffect | LevelSkillEffect | WorldModifyEffect;
import type { SkillId } from "./ids";
