import { archetypeIds, v02ContentIds } from "../core/archetypes/ids";
import { eliteIds, feedbackCategories } from "../core/archetypes/categories";
import type { ThemeManifest } from "../core/archetypes/contracts";
import { playerStatKeys, type PlayerBaseStats } from "../core/stats/player-stats";
import { upgradeStatTargets } from "../core/archetypes/effects";

const HEX_COLOUR = /^#[0-9a-f]{6}$/i;
const vocabularyKeys = [
  "health",
  "experience",
  "level",
  "time",
  "kills",
  "enemies",
  "paused",
  "deathTitle",
  "deathMessage",
  "completeTitle",
  "completeMessage",
  "restartAction",
  "shrinePrompt",
  "surgeActive",
] as const;

export class ThemeValidationError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Invalid theme manifest:\n- ${issues.join("\n- ")}`);
    this.name = "ThemeValidationError";
    this.issues = issues;
  }
}

export function validateTheme(theme: ThemeManifest): readonly string[] {
  const issues: string[] = [];

  if (!theme.id.trim()) issues.push("theme id is required");
  if (!theme.copy.gameTitle.trim()) issues.push("game title is required");
  if (!theme.copy.arenaName.trim()) issues.push("arena name is required");
  if (!theme.copy.bootStatus.trim()) issues.push("boot status copy is required");
  if (!theme.copy.bootFailure.trim()) issues.push("boot failure copy is required");
  if (!theme.copy.movementHint.trim()) issues.push("movement hint copy is required");
  if (!theme.copy.levelUpTitle.trim()) issues.push("level-up title copy is required");
  if (!theme.copy.vocabulary) {
    issues.push("HUD vocabulary is required");
  } else {
    for (const key of vocabularyKeys) {
      if (!theme.copy.vocabulary[key]?.trim()) issues.push(`vocabulary.${key} is required`);
    }
  }

  for (const id of v02ContentIds) {
    const copy = theme.copy.content[id];
    if (!copy?.name.trim()) issues.push(`${id} name is required`);
    if (!copy?.description.trim()) issues.push(`${id} description is required`);
  }

  for (const [token, colour] of Object.entries(theme.tokens.palette)) {
    if (!HEX_COLOUR.test(colour)) issues.push(`palette.${token} must be a six-digit hex colour`);
  }
  for (const category of feedbackCategories) {
    if (!theme.tokens.feedback?.[category]?.trim()) {
      issues.push(`feedback.${category} token is required`);
    }
  }

  const characterIds = new Set<string>();
  for (const character of theme.characters) {
    if (characterIds.has(character.id)) issues.push(`duplicate character id: ${character.id}`);
    characterIds.add(character.id);
    if (!Number.isFinite(character.radius) || character.radius <= 0) {
      issues.push(`${character.id} radius must be greater than zero`);
    }
    if (!(character.presentationToken in theme.tokens.palette)) {
      issues.push(`${character.id} references missing presentation token: ${character.presentationToken}`);
    }
    const baseStats = character.baseStats as PlayerBaseStats | undefined;
    if (!baseStats) {
      issues.push(`${character.id} baseStats are required`);
      continue;
    }
    for (const stat of playerStatKeys) {
      const value = baseStats[stat];
      if (!Number.isFinite(value)) issues.push(`${character.id} ${stat} must be finite`);
    }
    if (baseStats.maxHealth <= 0) {
      issues.push(`${character.id} maxHealth must be greater than zero`);
    }
    if (baseStats.moveSpeed <= 0) {
      issues.push(`${character.id} moveSpeed must be greater than zero`);
    }
    if (baseStats.pickupRadius < 0) {
      issues.push(`${character.id} pickupRadius cannot be negative`);
    }
    if (baseStats.critChance < 0) {
      issues.push(`${character.id} critChance cannot be negative`);
    }
    if (baseStats.critDamage < 1) {
      issues.push(`${character.id} critDamage must be at least one`);
    }
    if (baseStats.xpMultiplier <= 0) {
      issues.push(`${character.id} xpMultiplier must be greater than zero`);
    }
  }

  if (!characterIds.has(archetypeIds.character.starter)) {
    issues.push(`missing required character: ${archetypeIds.character.starter}`);
  }

  const weaponIds = new Set<string>();
  const weapons = Array.isArray(theme.weapons) ? theme.weapons : [];
  if (!Array.isArray(theme.weapons)) issues.push("weapons registry is required");
  for (const weapon of weapons) {
    if (weaponIds.has(weapon.id)) issues.push(`duplicate weapon id: ${weapon.id}`);
    weaponIds.add(weapon.id);
    if (!Number.isFinite(weapon.damage) || weapon.damage <= 0) {
      issues.push(`${weapon.id} damage must be greater than zero`);
    }
    if (!Number.isFinite(weapon.cooldownMs) || weapon.cooldownMs <= 0) {
      issues.push(`${weapon.id} cooldownMs must be greater than zero`);
    }
    if (!Number.isFinite(weapon.projectileSpeed) || weapon.projectileSpeed <= 0) {
      issues.push(`${weapon.id} projectileSpeed must be greater than zero`);
    }
    if (!Number.isFinite(weapon.projectileLifetimeMs) || weapon.projectileLifetimeMs <= 0) {
      issues.push(`${weapon.id} projectileLifetimeMs must be greater than zero`);
    }
    if (!Number.isFinite(weapon.projectileRadius) || weapon.projectileRadius <= 0) {
      issues.push(`${weapon.id} projectileRadius must be greater than zero`);
    }
    if (!Number.isInteger(weapon.projectileCount) || weapon.projectileCount < 1) {
      issues.push(`${weapon.id} projectileCount must be a positive integer`);
    }
    if (!Number.isInteger(weapon.pierce) || weapon.pierce < 0) {
      issues.push(`${weapon.id} pierce must be a non-negative integer`);
    }
    if (!(weapon.presentationToken in theme.tokens.palette)) {
      issues.push(`${weapon.id} references missing presentation token: ${weapon.presentationToken}`);
    }
  }
  if (!weaponIds.has(archetypeIds.weapon.starterProjectile)) {
    issues.push(`missing required weapon: ${archetypeIds.weapon.starterProjectile}`);
  }

  const enemyIds = new Set<string>();
  const enemies = Array.isArray(theme.enemies) ? theme.enemies : [];
  if (!Array.isArray(theme.enemies)) issues.push("enemies registry is required");
  for (const enemy of enemies) {
    if (enemyIds.has(enemy.id)) issues.push(`duplicate enemy id: ${enemy.id}`);
    enemyIds.add(enemy.id);
    if (!Number.isFinite(enemy.maxHealth) || enemy.maxHealth <= 0) {
      issues.push(`${enemy.id} maxHealth must be greater than zero`);
    }
    if (!Number.isFinite(enemy.moveSpeed) || enemy.moveSpeed <= 0) {
      issues.push(`${enemy.id} moveSpeed must be greater than zero`);
    }
    if (!Number.isFinite(enemy.contactDamage) || enemy.contactDamage <= 0) {
      issues.push(`${enemy.id} contactDamage must be greater than zero`);
    }
    if (!Number.isFinite(enemy.contactCooldownMs) || enemy.contactCooldownMs <= 0) {
      issues.push(`${enemy.id} contactCooldownMs must be greater than zero`);
    }
    if (!Number.isFinite(enemy.radius) || enemy.radius <= 0) {
      issues.push(`${enemy.id} radius must be greater than zero`);
    }
    if (!Number.isFinite(enemy.xpReward) || enemy.xpReward < 0) {
      issues.push(`${enemy.id} xpReward cannot be negative`);
    }
    if (!Number.isFinite(enemy.spawnWeight) || enemy.spawnWeight < 0) {
      issues.push(`${enemy.id} spawnWeight cannot be negative`);
    }
    if (!Number.isFinite(enemy.unlockAtMs) || enemy.unlockAtMs < 0) {
      issues.push(`${enemy.id} unlockAtMs cannot be negative`);
    }
    if (!(["circle", "triangle", "square", "hexagon"] as const).includes(enemy.geometry)) {
      issues.push(`${enemy.id} geometry is unsupported: ${String(enemy.geometry)}`);
    }
    if (enemy.deathSpawn) {
      if (!Number.isInteger(enemy.deathSpawn.count) || enemy.deathSpawn.count < 1) {
        issues.push(`${enemy.id} deathSpawn count must be a positive integer`);
      }
      if (!Number.isFinite(enemy.deathSpawn.rewardMultiplier) || enemy.deathSpawn.rewardMultiplier < 0) {
        issues.push(`${enemy.id} deathSpawn rewardMultiplier cannot be negative`);
      }
    }
    if (!(enemy.presentationToken in theme.tokens.palette)) {
      issues.push(`${enemy.id} references missing presentation token: ${enemy.presentationToken}`);
    }
  }
  if (!enemyIds.has(archetypeIds.enemy.swarmBasic)) {
    issues.push(`missing required enemy: ${archetypeIds.enemy.swarmBasic}`);
  }
  for (const requiredId of Object.values(archetypeIds.enemy)) {
    if (!enemyIds.has(requiredId)) issues.push(`missing required enemy: ${requiredId}`);
  }
  for (const enemy of enemies) {
    if (enemy.deathSpawn && !enemyIds.has(enemy.deathSpawn.enemyId)) {
      issues.push(`${enemy.id} references missing death-spawn enemy: ${enemy.deathSpawn.enemyId}`);
    }
  }

  const pickupIds = new Set<string>();
  const pickups = Array.isArray(theme.pickups) ? theme.pickups : [];
  if (!Array.isArray(theme.pickups)) issues.push("pickups registry is required");
  for (const pickup of pickups) {
    if (pickupIds.has(pickup.id)) issues.push(`duplicate pickup id: ${pickup.id}`);
    pickupIds.add(pickup.id);
    if (!Number.isFinite(pickup.radius) || pickup.radius <= 0) {
      issues.push(`${pickup.id} radius must be greater than zero`);
    }
    if (!Number.isFinite(pickup.magnetSpeed) || pickup.magnetSpeed <= 0) {
      issues.push(`${pickup.id} magnetSpeed must be greater than zero`);
    }
    if (!(pickup.presentationToken in theme.tokens.palette)) {
      issues.push(`${pickup.id} references missing presentation token: ${pickup.presentationToken}`);
    }
  }
  if (!pickupIds.has(archetypeIds.pickup.experience)) {
    issues.push(`missing required pickup: ${archetypeIds.pickup.experience}`);
  }

  const upgradeIds = new Set<string>();
  const upgrades = Array.isArray(theme.upgrades) ? theme.upgrades : [];
  if (!Array.isArray(theme.upgrades)) issues.push("upgrades registry is required");
  for (const upgrade of upgrades) {
    if (upgradeIds.has(upgrade.id)) issues.push(`duplicate upgrade id: ${upgrade.id}`);
    upgradeIds.add(upgrade.id);
    if (!Array.isArray(upgrade.effects) || upgrade.effects.length === 0) {
      issues.push(`${upgrade.id} must define at least one effect`);
    } else {
      for (const effect of upgrade.effects) {
        if (effect.kind === "skill.enable") {
          if (!Object.values(archetypeIds.skill).includes(effect.skillId)) {
            issues.push(`${upgrade.id} references unsupported skill: ${String(effect.skillId)}`);
          }
          continue;
        }
        if (effect.kind !== "stat.add") {
          issues.push(`${upgrade.id} has unsupported effect kind: ${String(effect.kind)}`);
          continue;
        }
        if (!upgradeStatTargets.includes(effect.target)) {
          issues.push(`${upgrade.id} has unsupported stat target: ${String(effect.target)}`);
        }
        if (!Number.isFinite(effect.value) || effect.value <= 0) {
          issues.push(`${upgrade.id} effect value must be greater than zero`);
        }
      }
    }
    if (!(upgrade.presentationToken in theme.tokens.palette)) {
      issues.push(`${upgrade.id} references missing presentation token: ${upgrade.presentationToken}`);
    }
  }
  for (const requiredId of Object.values(archetypeIds.upgrade)) {
    if (!upgradeIds.has(requiredId)) issues.push(`missing required upgrade: ${requiredId}`);
  }

  const shrineIds = new Set<string>();
  const shrines = Array.isArray(theme.shrines) ? theme.shrines : [];
  if (!Array.isArray(theme.shrines)) issues.push("shrines registry is required");
  for (const shrine of shrines) {
    if (shrineIds.has(shrine.id)) issues.push(`duplicate shrine id: ${shrine.id}`);
    shrineIds.add(shrine.id);
    if (!Number.isFinite(shrine.radius) || shrine.radius <= 0) {
      issues.push(`${shrine.id} radius must be greater than zero`);
    }
    if (!Number.isFinite(shrine.interactionRadius) || shrine.interactionRadius <= shrine.radius) {
      issues.push(`${shrine.id} interactionRadius must exceed its radius`);
    }
    if (!Number.isInteger(shrine.spawnCount) || shrine.spawnCount < 1) {
      issues.push(`${shrine.id} spawnCount must be a positive integer`);
    }
    if (!Number.isFinite(shrine.spawnDurationMs) || shrine.spawnDurationMs <= 0) {
      issues.push(`${shrine.id} spawnDurationMs must be greater than zero`);
    }
    if (!Number.isFinite(shrine.rewardMultiplier) || shrine.rewardMultiplier <= 1) {
      issues.push(`${shrine.id} rewardMultiplier must be greater than one`);
    }
    if (!(shrine.presentationToken in theme.tokens.palette)) {
      issues.push(`${shrine.id} references missing presentation token: ${shrine.presentationToken}`);
    }
  }
  if (!shrineIds.has(archetypeIds.shrine.spawnSurge)) {
    issues.push(`missing required shrine: ${archetypeIds.shrine.spawnSurge}`);
  }

  const skillIds = new Set<string>();
  const skills = Array.isArray(theme.skills) ? theme.skills : [];
  if (!Array.isArray(theme.skills)) issues.push("skills registry is required");
  for (const skill of skills) {
    if (skillIds.has(skill.id)) issues.push(`duplicate skill id: ${skill.id}`);
    skillIds.add(skill.id);
    for (const effect of skill.effects ?? []) {
      if (effect.kind === "piercing_momentum" && (!Number.isFinite(effect.damagePerUniqueHit) || effect.damagePerUniqueHit <= 0)) {
        issues.push(`${skill.id} damagePerUniqueHit must be greater than zero`);
      }
    }
  }
  for (const requiredId of Object.values(archetypeIds.skill)) {
    if (!skillIds.has(requiredId)) issues.push(`missing required skill: ${requiredId}`);
  }

  const eliteIdsFound = new Set<string>();
  const elites = Array.isArray(theme.elites) ? theme.elites : [];
  if (!Array.isArray(theme.elites)) issues.push("elites registry is required");
  for (const elite of elites) {
    if (eliteIdsFound.has(elite.id)) issues.push(`duplicate elite id: ${elite.id}`);
    eliteIdsFound.add(elite.id);
  }
  if (!eliteIdsFound.has(eliteIds.baseline)) {
    issues.push(`missing required elite: ${eliteIds.baseline}`);
  }

  return issues;
}

export function defineTheme<const T extends ThemeManifest>(theme: T): T {
  const issues = validateTheme(theme);
  if (issues.length > 0) throw new ThemeValidationError(issues);
  return theme;
}
