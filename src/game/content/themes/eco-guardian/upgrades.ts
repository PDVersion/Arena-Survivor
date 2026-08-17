import { archetypeIds } from "../../../core/archetypes/ids";
import type { UpgradeDefinition } from "../../../core/archetypes/contracts";

export const upgrades = [
  {
    id: archetypeIds.upgrade.damage,
    effects: [{ kind: "stat.add", target: "player.damageBonus", value: 0.25 }],
    presentationToken: "accent",
  },
  {
    id: archetypeIds.upgrade.attackSpeed,
    effects: [{ kind: "stat.add", target: "player.attackSpeedBonus", value: 0.2 }],
    presentationToken: "accent",
  },
  {
    id: archetypeIds.upgrade.critChance,
    effects: [{ kind: "stat.add", target: "player.critChance", value: 0.1 }],
    presentationToken: "accent",
  },
  {
    id: archetypeIds.upgrade.pierce,
    effects: [{ kind: "stat.add", target: "weapon.pierce", value: 1 }],
    presentationToken: "accent",
  },
  {
    id: archetypeIds.upgrade.projectileCount,
    effects: [{ kind: "stat.add", target: "weapon.projectileCount", value: 1 }],
    presentationToken: "accent",
  },
  {
    id: archetypeIds.upgrade.moveSpeed,
    effects: [{ kind: "stat.add", target: "player.moveSpeed", value: 30 }],
    presentationToken: "accent",
  },
  {
    id: archetypeIds.upgrade.health,
    effects: [{ kind: "stat.add", target: "player.maxHealth", value: 25 }],
    presentationToken: "accent",
  },
  {
    id: archetypeIds.upgrade.pickupRadius,
    effects: [{ kind: "stat.add", target: "player.pickupRadius", value: 40 }],
    presentationToken: "accent",
  },
  {
    id: archetypeIds.upgrade.piercingMomentum,
    effects: [{ kind: "skill.enable", skillId: archetypeIds.skill.piercingMomentum }],
    presentationToken: "accent",
  },
  { id: archetypeIds.upgrade.onKillExplosion, effects: [{ kind: "skill.enable", skillId: archetypeIds.skill.onKillExplosion }], presentationToken: "accent" },
  { id: archetypeIds.upgrade.fracture, effects: [{ kind: "skill.enable", skillId: archetypeIds.skill.fracture }], presentationToken: "accent" },
  { id: archetypeIds.upgrade.bloodlust, effects: [{ kind: "skill.enable", skillId: archetypeIds.skill.bloodlust }], presentationToken: "accent" },
  { id: archetypeIds.upgrade.chainReaction, effects: [{ kind: "skill.enable", skillId: archetypeIds.skill.chainReaction }], presentationToken: "accent" },
] as const satisfies readonly UpgradeDefinition[];
