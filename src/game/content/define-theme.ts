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
  "chaos",
  "paused",
  "deathTitle",
  "deathMessage",
  "completeTitle",
  "completeMessage",
  "restartAction",
  "shrinePrompt",
  "surgeActive",
  "statisticsTitle",
  "peakEnemiesAlive",
  "highestChaos",
  "highestCrit",
  "highestCritTier",
  "longestPierce",
  "largestKillChain",
  "totalDamage",
  "damageBreakdown",
  "directDamage",
  "criticalBonusDamage",
  "piercingMomentumDamage",
  "explosionDamage",
  "chainedExplosionDamage",
  "remainderDamage",
  "upgradesTaken",
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
    const sound = theme.tokens.sounds?.[category];
    if (!sound || !Number.isFinite(sound.frequency) || sound.frequency <= 0 ||
      !Number.isFinite(sound.durationMs) || sound.durationMs <= 0 ||
      !Number.isFinite(sound.gain) || sound.gain <= 0 || sound.gain > 1) {
      issues.push(`sounds.${category} must define positive frequency, duration, and gain at most one`);
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
    if (!Number.isFinite(weapon.range) || weapon.range <= 0) {
      issues.push(`${weapon.id} range must be greater than zero`);
    }
    if (!Number.isFinite(weapon.knockback) || weapon.knockback < 0) {
      issues.push(`${weapon.id} knockback cannot be negative`);
    }
    if (!Number.isFinite(weapon.armourPierce) || weapon.armourPierce < 0 || weapon.armourPierce > 1) {
      issues.push(`${weapon.id} armourPierce must be between zero and one`);
    }
    if (weapon.critChance !== undefined && (!Number.isFinite(weapon.critChance) || weapon.critChance < 0)) {
      issues.push(`${weapon.id} critChance cannot be negative`);
    }
    if (weapon.critDamage !== undefined && (!Number.isFinite(weapon.critDamage) || weapon.critDamage < 1)) {
      issues.push(`${weapon.id} critDamage must be at least one`);
    }
    // Delivery has to be able to cover the declared range. Leaving range
    // implicit in speed and lifetime is what let the REC-049 envelope break go
    // unnoticed until a hosted runner surfaced it.
    const projectileReach = (weapon.projectileSpeed * weapon.projectileLifetimeMs) / 1000;
    if (Number.isFinite(projectileReach) && Number.isFinite(weapon.range) && projectileReach < weapon.range) {
      issues.push(`${weapon.id} projectile flight cannot reach its declared range`);
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
    if (shrine.effectKind === "spawn_surge" && (!Number.isInteger(shrine.spawnCount) || shrine.spawnCount < 1)) issues.push(`${shrine.id} spawnCount must be a positive integer`);
    if (shrine.effectKind === "spawn_surge" && (!Number.isFinite(shrine.spawnDurationMs) || shrine.spawnDurationMs <= 0)) issues.push(`${shrine.id} spawnDurationMs must be greater than zero`);
    if ((shrine.effectKind === "spawn_surge" || shrine.effectKind === "duplicate_living") && (!Number.isFinite(shrine.rewardMultiplier) || shrine.rewardMultiplier <= 1)) issues.push(`${shrine.id} rewardMultiplier must be greater than one`);
    if (!Number.isFinite(shrine.chaosIncrease) || shrine.chaosIncrease <= 0) issues.push(`${shrine.id} chaosIncrease must be greater than zero`);
    if (!Number.isFinite(shrine.enemySpawnMultiplier) || shrine.enemySpawnMultiplier <= 0) issues.push(`${shrine.id} enemySpawnMultiplier must be greater than zero`);
    if (!Number.isFinite(shrine.xpMultiplier) || shrine.xpMultiplier <= 0) issues.push(`${shrine.id} xpMultiplier must be greater than zero`);
    if (!(shrine.presentationToken in theme.tokens.palette)) {
      issues.push(`${shrine.id} references missing presentation token: ${shrine.presentationToken}`);
    }
  }
  if (!shrineIds.has(archetypeIds.shrine.spawnSurge)) {
    issues.push(`missing required shrine: ${archetypeIds.shrine.spawnSurge}`);
  }
  for (const requiredId of Object.values(archetypeIds.shrine)) {
    if (!shrineIds.has(requiredId)) issues.push(`missing required shrine: ${requiredId}`);
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
      if (effect.kind === "on_kill_explosion" &&
        (!Number.isFinite(effect.radius) || effect.radius <= 0 || !Number.isFinite(effect.damage) || effect.damage <= 0)) {
        issues.push(`${skill.id} explosion radius and damage must be greater than zero`);
      }
      if (effect.kind === "fracture") {
        if (!Number.isFinite(effect.chance) || effect.chance < 0 || effect.chance > 1) issues.push(`${skill.id} fracture chance must be between zero and one`);
        if (!Number.isInteger(effect.childCount) || effect.childCount < 1) issues.push(`${skill.id} fracture childCount must be a positive integer`);
        if (!enemyIds.has(effect.childEnemyId)) issues.push(`${skill.id} references missing fracture enemy: ${effect.childEnemyId}`);
        if (!Number.isFinite(effect.rewardMultiplier) || effect.rewardMultiplier < 0) issues.push(`${skill.id} fracture rewardMultiplier cannot be negative`);
      }
      if (effect.kind === "bloodlust" &&
        (!Number.isFinite(effect.windowMs) || effect.windowMs <= 0 || !Number.isInteger(effect.killsPerStep) || effect.killsPerStep < 1 || !Number.isFinite(effect.attackSpeedPerStep) || effect.attackSpeedPerStep <= 0)) {
        issues.push(`${skill.id} Bloodlust values must be positive`);
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
    for (const [key, value] of Object.entries({
      healthMultiplier: elite.healthMultiplier,
      damageMultiplier: elite.damageMultiplier,
      rewardMultiplier: elite.rewardMultiplier,
      radiusMultiplier: elite.radiusMultiplier,
    })) {
      if (!Number.isFinite(value) || value <= 1) issues.push(`${elite.id} ${key} must be greater than one`);
    }
    if (!(elite.presentationToken in theme.tokens.palette)) issues.push(`${elite.id} references missing presentation token: ${elite.presentationToken}`);
  }
  if (!eliteIdsFound.has(eliteIds.baseline)) {
    issues.push(`missing required elite: ${eliteIds.baseline}`);
  }

  issues.push(...validateTuning(theme, enemyIds));

  return issues;
}

function validateTuning(
  theme: ThemeManifest,
  enemyIds: ReadonlySet<string>,
): readonly string[] {
  const issues: string[] = [];
  const tuning = theme.tuning;
  const enemies = Array.isArray(theme.enemies) ? theme.enemies : [];
  if (!tuning) {
    issues.push("tuning pack is required");
    return issues;
  }

  const curve = tuning.progression?.xpCurve;
  if (!curve) {
    issues.push("tuning.progression.xpCurve is required");
  } else if (!Number.isFinite(curve.baseXp) || curve.baseXp <= 0) {
    issues.push("tuning.progression.xpCurve baseXp must be greater than zero");
  } else if (curve.kind === "linear") {
    if (!Number.isFinite(curve.step) || curve.step <= 0) {
      issues.push("tuning.progression.xpCurve step must be greater than zero");
    }
  } else if (curve.kind === "banded") {
    if (curve.bands.length === 0) {
      issues.push("tuning.progression.xpCurve must declare at least one band");
    }
    if (curve.bands[0]?.fromLevel !== 1) {
      issues.push("tuning.progression.xpCurve must declare a band starting at level 1");
    }
    let previousLevel = 0;
    for (const band of curve.bands) {
      if (!Number.isInteger(band.fromLevel) || band.fromLevel <= previousLevel) {
        issues.push("tuning.progression.xpCurve bands must ascend by fromLevel");
      }
      previousLevel = band.fromLevel;
      if (!Number.isFinite(band.growth) || band.growth < 1) {
        issues.push("tuning.progression.xpCurve band growth cannot shrink a requirement");
      }
    }
  } else {
    issues.push(`tuning.progression.xpCurve has an unsupported kind: ${String((curve as { kind: unknown }).kind)}`);
  }

  const share = tuning.progression?.toughnessRewardShare;
  if (!Number.isFinite(share) || (share as number) < 0) {
    issues.push("tuning.progression.toughnessRewardShare cannot be negative");
  }

  const director = tuning.director;
  if (!director) {
    issues.push("tuning.director is required");
  } else {
    if (!Number.isFinite(director.baseIntervalMs) || director.baseIntervalMs <= 0) {
      issues.push("tuning.director.baseIntervalMs must be greater than zero");
    }
    if (!Number.isFinite(director.minIntervalMs) || director.minIntervalMs <= 0) {
      issues.push("tuning.director.minIntervalMs must be greater than zero");
    }
    if (director.minIntervalMs > director.baseIntervalMs) {
      issues.push("tuning.director.minIntervalMs cannot exceed baseIntervalMs");
    }
    if (!Number.isFinite(director.intervalDecayK) || director.intervalDecayK < 0) {
      issues.push("tuning.director.intervalDecayK cannot be negative");
    }
    if (!Number.isFinite(director.batchRamp) || director.batchRamp < 0) {
      issues.push("tuning.director.batchRamp cannot be negative");
    }
    if (!Number.isFinite(director.spawnMargin) || director.spawnMargin < 0) {
      issues.push("tuning.director.spawnMargin cannot be negative");
    }
    if (
      !Number.isFinite(director.maxBaselineEliteChance) ||
      director.maxBaselineEliteChance < 0 ||
      director.maxBaselineEliteChance > 1
    ) {
      issues.push("tuning.director.maxBaselineEliteChance must be between zero and one");
    }
    if (!Number.isFinite(director.eliteUnlockAt) || director.eliteUnlockAt < 0 || director.eliteUnlockAt > 1) {
      issues.push("tuning.director.eliteUnlockAt must be between zero and one");
    }
    if (!Array.isArray(director.roles) || director.roles.length === 0) {
      issues.push("tuning.director.roles must declare at least one role");
    } else {
      const seenRoles = new Set<string>();
      let hasOpeningRole = false;
      for (const role of director.roles) {
        if (seenRoles.has(role.enemyId)) issues.push(`duplicate director role: ${role.enemyId}`);
        seenRoles.add(role.enemyId);
        if (!enemyIds.has(role.enemyId)) {
          issues.push(`tuning.director references missing enemy: ${role.enemyId}`);
        }
        if (!Number.isFinite(role.unlockAt) || role.unlockAt < 0 || role.unlockAt >= 1) {
          issues.push(`${role.enemyId} director unlockAt must be within [0, 1)`);
        }
        if (role.unlockAt === 0) hasOpeningRole = true;
        if (!Number.isFinite(role.baseWeight) || role.baseWeight <= 0) {
          issues.push(`${role.enemyId} director baseWeight must be greater than zero`);
        }
        if (!Number.isFinite(role.weightGrowth) || role.weightGrowth <= -1) {
          issues.push(`${role.enemyId} director weightGrowth cannot remove a role entirely`);
        }
        if (!Number.isFinite(role.chaosWeightBias) || role.chaosWeightBias < 0) {
          issues.push(`${role.enemyId} director chaosWeightBias cannot be negative`);
        }
        if (role.waveMovement !== "chase" && role.waveMovement !== "drift") {
          issues.push(`${role.enemyId} director waveMovement must be chase or drift`);
        }
        // A wave of enemies the player cannot outrun has to be dodgeable.
        const roleEnemy = enemies.find((enemy) => enemy.id === role.enemyId);
        const playerSpeed = theme.characters.find(
          (character) => character.id === archetypeIds.character.starter,
        )?.baseStats.moveSpeed;
        if (
          role.waveMovement === "chase" &&
          roleEnemy &&
          playerSpeed !== undefined &&
          roleEnemy.moveSpeed >= playerSpeed
        ) {
          issues.push(`${role.enemyId} outruns the player, so its wave must drift`);
        }
      }
      // Without a role live at t=0 the run opens with nothing to shoot.
      if (!hasOpeningRole) issues.push("tuning.director must declare a role unlocked at zero");
    }
  }

  const chaos = tuning.difficulty?.chaos;
  if (!chaos) {
    issues.push("tuning.difficulty.chaos is required");
    return issues;
  }
  for (const [key, value] of Object.entries(chaos)) {
    if (!Number.isFinite(value) || value < 0) {
      issues.push(`tuning.difficulty.chaos.${key} cannot be negative`);
    }
  }
  if (chaos.eliteChanceCap > 1) {
    issues.push("tuning.difficulty.chaos.eliteChanceCap cannot exceed one");
  }

  return issues;
}

export function defineTheme<const T extends ThemeManifest>(theme: T): T {
  const issues = validateTheme(theme);
  if (issues.length > 0) throw new ThemeValidationError(issues);
  return theme;
}
