import { archetypeIds } from "../../../core/archetypes/ids";
import type { ThemeCopy } from "../../../core/archetypes/contracts";

export const copy = {
  gameTitle: "Arena Survivor",
  arenaName: "The Overflow Site",
  bootStatus: "The site is being surveyed",
  bootFailure: "The site could not be reached.",
  movementHint: "Move with WASD or arrow keys · Pause with Escape",
  levelUpTitle: "Requisition new equipment",
  vocabulary: {
    health: "Health",
    experience: "Impact",
    level: "Level",
    time: "Time",
    kills: "Cleared",
    enemies: "On Site",
    chaos: "Pollution",
    paused: "The site is paused",
    deathTitle: "The Site Is Overwhelmed",
    deathMessage: "The waste outpaced the response effort.",
    completeTitle: "Shift Complete",
    completeMessage: "You held the site for the full shift.",
    restartAction: "New Shift",
    shrinePrompt: "Press E or Space to authorise",
    surgeActive: "The landfill gives way",
    statisticsTitle: "Shift Report",
    peakEnemiesAlive: "Peak Waste On Site",
    highestChaos: "Peak Pollution",
    highestCrit: "Highest Critical Chance",
    highestCritTier: "Highest Overcrit Tier",
    longestPierce: "Longest Pass-Through",
    largestKillChain: "Largest Clearance Chain",
    totalDamage: "Total Processed",
    damageBreakdown: "Processing Ledger",
    directDamage: "Direct",
    criticalBonusDamage: "Critical Bonus",
    piercingMomentumDamage: "Sorting Momentum",
    explosionDamage: "Compaction",
    chainedExplosionDamage: "Cascade",
    remainderDamage: "Other / Remainder",
    upgradesTaken: "Equipment Requisitioned",
  },
  stats: {
    health: "Health",
    damage: "Damage",
    attackRate: "Cycle rate",
    critChance: "Critical chance",
    critDamage: "Critical damage",
    projectiles: "Charges",
    pierce: "Pass-through",
    range: "Range",
    knockback: "Knockback",
    armourPierce: "Armour pierce",
    moveSpeed: "Move speed",
    pickupRadius: "Collection range",
    armour: "Armour",
    regeneration: "Recovery",
    luck: "Fortune",
    xpMultiplier: "Impact bonus",
  },
  world: {
    chaos: "Pollution",
    enemySpawn: "Waste arriving",
    enemyHealth: "Waste durability",
    enemyDamage: "Waste harm",
    xpGain: "Impact gain",
    eliteChance: "Illegal dumping",
    threat: "Threat level",
  },
  content: {
    [archetypeIds.character.starter]: {
      name: "Environment Protector",
      description: "A field operative sent to hold back an overflowing site.",
    },
    [archetypeIds.weapon.starterProjectile]: {
      name: "Sorting Pulse",
      description: "A guided reclaim charge that seeks the nearest waste.",
    },
    [archetypeIds.enemy.swarmBasic]: {
      name: "Plastic Bottle",
      description: "The most common thing on the ground, and it never truly goes away.",
    },
    [archetypeIds.enemy.fastFragile]: {
      name: "Plastic Bag",
      description: "Light enough to travel on the wind and reach almost anywhere.",
    },
    [archetypeIds.enemy.slowDurable]: {
      name: "Glass Bottle",
      description: "Slow, inert, and effectively permanent. It outlasts everything here.",
    },
    [archetypeIds.enemy.deathSpawner]: {
      name: "Bagged Waste",
      description: "A sealed bundle that spills its mixed contents the moment it opens.",
    },
    [archetypeIds.pickup.experience]: {
      name: "Impact Point",
      description: "Credit for waste that will not reach the waterway.",
    },
    [archetypeIds.shrine.spawnSurge]: {
      name: "Landfill Breach",
      description: "Open a buried cell for a surge of waste and a greater return.",
    },
    [archetypeIds.shrine.greed]: {
      name: "Fast Fashion Boom",
      description: "Accept a permanent rise in output for permanently better returns.",
    },
    [archetypeIds.shrine.multiplicity]: {
      name: "Single-Use Boom",
      description: "Double the incoming waste and the value of clearing it.",
    },
    [archetypeIds.shrine.duplication]: {
      name: "Overproduction Order",
      description: "Duplicate everything currently on site for a richer return.",
    },
    [archetypeIds.skill.piercingMomentum]: {
      name: "Sorting Momentum",
      description: "A charge gains force with every distinct item it passes through.",
    },
    [archetypeIds.skill.onKillExplosion]: {
      name: "Compaction Burst",
      description: "Cleared waste compacts hard enough to damage what is nearby.",
    },
    [archetypeIds.skill.fracture]: {
      name: "Fragmentation",
      description: "Some plastics break into smaller pieces instead of disappearing.",
    },
    [archetypeIds.skill.bloodlust]: {
      name: "Cleanup Streak",
      description: "A fast clearance rate speeds up your equipment.",
    },
    [archetypeIds.skill.chainReaction]: {
      name: "Cascade",
      description: "A compaction burst can set off the next one.",
    },
    [archetypeIds.hazard.damageZone]: {
      name: "Contamination Spill",
      description: "A lingering spill that burns and drags at anything wading through it.",
    },
    [archetypeIds.hazard.obstacle]: {
      name: "Debris Pile",
      description: "Heaped waste that blocks movement and shots until it is cleared.",
    },
    [archetypeIds.hazard.periodicBurst]: {
      name: "Methane Vent",
      description: "A vent that flares on a cycle. The warning is the only warning.",
    },
    [archetypeIds.upgrade.damage]: {
      name: "Reinforced Tools",
      description: "Process more waste with every charge.",
    },
    [archetypeIds.upgrade.attackSpeed]: {
      name: "Rapid Cycling",
      description: "Cycle the sorting pulse more frequently.",
    },
    [archetypeIds.upgrade.critChance]: {
      name: "Precision Sort",
      description: "Increase the chance of a critical separation.",
    },
    [archetypeIds.upgrade.pierce]: {
      name: "Deep Reach",
      description: "Charges pass through another item before stopping.",
    },
    [archetypeIds.upgrade.projectileCount]: {
      name: "Split Nozzle",
      description: "Release one additional charge with every cycle.",
    },
    [archetypeIds.upgrade.moveSpeed]: {
      name: "Field Boots",
      description: "Cover the site more quickly.",
    },
    [archetypeIds.upgrade.health]: {
      name: "Safety Gear",
      description: "Increase maximum health and recover by the same amount.",
    },
    [archetypeIds.upgrade.pickupRadius]: {
      name: "Collection Range",
      description: "Draw impact from farther away.",
    },
    [archetypeIds.upgrade.piercingMomentum]: {
      name: "Sorting Momentum",
      description: "Each distinct item passed through adds 10% of the charge's damage.",
    },
    [archetypeIds.upgrade.onKillExplosion]: {
      name: "Compaction Burst",
      description: "Cleared waste compacts and damages nearby items.",
    },
    [archetypeIds.upgrade.fracture]: {
      name: "Fragmentation",
      description: "Some cleared waste breaks into two smaller pieces.",
    },
    [archetypeIds.upgrade.bloodlust]: {
      name: "Cleanup Streak",
      description: "Recent clearances increase your cycling speed.",
    },
    [archetypeIds.upgrade.chainReaction]: {
      name: "Cascade",
      description: "Compaction clearances can trigger further compaction.",
    },
    [archetypeIds.upgrade.worldSurge]: {
      name: "Single-Use Surge",
      description: "Far more waste arrives, and clearing it is worth far more.",
    },
    [archetypeIds.upgrade.worldBrittle]: {
      name: "Brittle World",
      description: "Double your output, and let the site get much worse.",
    },
  },
} as const satisfies ThemeCopy;
