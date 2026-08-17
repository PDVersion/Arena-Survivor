import type {
  CharacterId,
  ContentId,
  EnemyId,
  HazardId,
  PickupId,
  ShrineId,
  SkillId,
  UpgradeId,
  WeaponId,
} from "./ids";
import type { UpgradeEffect } from "./effects";
import type { PlayerBaseStats } from "../stats/player-stats";
import type { EliteId, FeedbackCategory } from "./categories";
import type { TuningPack } from "./tuning";

export interface ContentCopy {
  readonly name: string;
  readonly description: string;
}

export interface ThemeVocabulary {
  readonly health: string;
  readonly experience: string;
  readonly level: string;
  readonly time: string;
  readonly kills: string;
  readonly enemies: string;
  readonly chaos: string;
  readonly paused: string;
  readonly deathTitle: string;
  readonly deathMessage: string;
  readonly completeTitle: string;
  readonly completeMessage: string;
  readonly restartAction: string;
  readonly shrinePrompt: string;
  readonly surgeActive: string;
  readonly statisticsTitle: string;
  readonly peakEnemiesAlive: string;
  readonly highestChaos: string;
  readonly highestCrit: string;
  readonly highestCritTier: string;
  readonly longestPierce: string;
  readonly largestKillChain: string;
  readonly totalDamage: string;
  readonly damageBreakdown: string;
  readonly directDamage: string;
  readonly criticalBonusDamage: string;
  readonly piercingMomentumDamage: string;
  readonly explosionDamage: string;
  readonly chainedExplosionDamage: string;
  readonly remainderDamage: string;
  readonly upgradesTaken: string;
}

export interface ThemeCopy {
  readonly gameTitle: string;
  readonly arenaName: string;
  readonly bootStatus: string;
  readonly bootFailure: string;
  readonly movementHint: string;
  readonly levelUpTitle: string;
  readonly vocabulary: ThemeVocabulary;
  readonly content: Readonly<Record<ContentId, ContentCopy>>;
}

export interface ThemePalette {
  readonly background: string;
  readonly floor: string;
  readonly grid: string;
  readonly accent: string;
  readonly text: string;
  readonly player: string;
  readonly enemy: string;
  readonly enemyFast: string;
  readonly enemyTank: string;
  readonly enemySpawner: string;
  readonly projectile: string;
  readonly critical: string;
  readonly overcritical: string;
  readonly pickup: string;
  readonly shrine: string;
  readonly explosion: string;
  readonly elite: string;
}

export interface ThemeTokens {
  readonly palette: ThemePalette;
  readonly playerShape: "circle" | "diamond" | "square";
  readonly feedback: Readonly<Record<FeedbackCategory, string>>;
  readonly sounds: Readonly<Record<FeedbackCategory, Readonly<{
    frequency: number;
    durationMs: number;
    gain: number;
  }>>>;
}

export interface SkillDefinition {
  readonly id: SkillId;
  /** Taking the upgrade again raises the level until this cap. */
  readonly maxLevel: number;
  readonly effects?: readonly SkillEffectDefinition[];
}

/**
 * Skill effects scale with level.
 *
 * Every `*PerLevel` field is the increment applied for each level past the
 * first, so level 1 always reads as the base value. Before V0.3 Phase 7 a skill
 * was a boolean and re-picking it was a completely wasted level-up.
 */
export type SkillEffectDefinition =
  | Readonly<{ kind: "piercing_momentum"; damagePerUniqueHit: number; perLevel: number }>
  | Readonly<{
      kind: "on_kill_explosion";
      baseRadius: number;
      radiusPerLevel: number;
      flatDamage: number;
      flatPerLevel: number;
      /** Share of the victim's effective max health added to the blast. */
      victimHealthShare: number;
      sharePerLevel: number;
      maxShare: number;
    }>
  | Readonly<{
      kind: "fracture";
      chance: number;
      chancePerLevel: number;
      childEnemyId: EnemyId;
      childCount: number;
      rewardMultiplier: number;
    }>
  | Readonly<{
      kind: "bloodlust";
      windowMs: number;
      killsPerStep: number;
      attackSpeedPerStep: number;
      attackSpeedPerLevel: number;
    }>
  | Readonly<{
      kind: "chain_reaction";
      /** Explicit depth limit, so a 300-enemy chain stays finite and measurable. */
      baseDepth: number;
      depthPerLevel: number;
      damageFalloff: number;
      falloffPerLevel: number;
      radiusFalloff: number;
      radiusFalloffPerLevel: number;
    }>;

export interface EliteDefinition {
  readonly id: EliteId;
  readonly healthMultiplier: number;
  readonly damageMultiplier: number;
  readonly rewardMultiplier: number;
  readonly radiusMultiplier: number;
  readonly presentationToken: keyof Pick<ThemePalette, "elite">;
}

export interface CharacterDefinition {
  readonly id: CharacterId;
  readonly radius: number;
  readonly presentationToken: keyof Pick<ThemePalette, "player">;
  readonly baseStats: PlayerBaseStats;
}

/**
 * A weapon's stats.
 *
 * The block above `presentationToken` is generic to any weapon and is the
 * surface later weapons are expected to share. The `projectile*` and `pierce`
 * fields below it describe how *this* weapon delivers its damage, and belong to
 * a projectile delivery specifically.
 *
 * Splitting delivery into a discriminated union — so a melee weapon can declare
 * an arc and target cap instead of a projectile speed — is deliberately parked
 * for V0.4, where weapon slots decide the shape. Until then every weapon is a
 * projectile and the fields sit flat.
 */
export interface WeaponDefinition {
  readonly id: WeaponId;
  readonly damage: number;
  readonly cooldownMs: number;
  /**
   * How far this weapon can engage, as design intent rather than a derived
   * number. Delivery must be able to cover it: for a projectile,
   * `projectileSpeed * projectileLifetimeMs / 1000` has to reach at least this
   * far. Keeping range implicit is what hid the REC-049 envelope break.
   */
  readonly range: number;
  /** Impulse applied to what it hits. `0` is no knockback. */
  readonly knockback: number;
  /** Portion of enemy armour ignored, `0` to `1`. Inert until armour exists. */
  readonly armourPierce: number;
  /** Overrides the player's crit chance for this weapon only. */
  readonly critChance?: number;
  /** Overrides the player's crit damage for this weapon only. */
  readonly critDamage?: number;

  // Projectile delivery.
  readonly projectileSpeed: number;
  readonly projectileLifetimeMs: number;
  readonly projectileRadius: number;
  readonly projectileCount: number;
  readonly pierce: number;

  readonly presentationToken: keyof Pick<ThemePalette, "projectile" | "critical" | "overcritical">;
}

export interface EnemyDefinition {
  readonly id: EnemyId;
  readonly maxHealth: number;
  readonly moveSpeed: number;
  readonly contactDamage: number;
  readonly contactCooldownMs: number;
  readonly radius: number;
  readonly xpReward: number;
  readonly geometry: "circle" | "triangle" | "square" | "hexagon";
  readonly presentationToken: keyof Pick<
    ThemePalette,
    "enemy" | "enemyFast" | "enemyTank" | "enemySpawner"
  >;
  readonly deathSpawn?: Readonly<{
    enemyId: EnemyId;
    count: number;
    rewardMultiplier: number;
  }>;
}

export interface PickupDefinition {
  readonly id: PickupId;
  readonly radius: number;
  readonly magnetSpeed: number;
  readonly presentationToken: keyof Pick<ThemePalette, "pickup">;
}

export const upgradeRarities = ["common", "rare", "epic"] as const;
export type UpgradeRarity = (typeof upgradeRarities)[number];

/** Used to keep one draw from being three of the same thing. */
export const upgradeCategories = [
  "offense",
  "critical",
  "projectile",
  "survival",
  "utility",
  "skill",
  "world",
] as const;
export type UpgradeCategory = (typeof upgradeCategories)[number];

export interface UpgradeDefinition {
  readonly id: UpgradeId;
  readonly effects: readonly UpgradeEffect[];
  /** A maxed upgrade leaves the pool, so it can never be offered as a no-op. */
  readonly maxLevel: number;
  readonly rarity: UpgradeRarity;
  readonly category: UpgradeCategory;
  readonly presentationToken: keyof Pick<ThemePalette, "accent" | "critical" | "overcritical" | "shrine">;
}

export interface ShrineDefinition {
  readonly id: ShrineId;
  readonly radius: number;
  readonly interactionRadius: number;
  readonly spawnCount: number;
  readonly spawnDurationMs: number;
  readonly rewardMultiplier: number;
  readonly effectKind: "spawn_surge" | "world_multiplier" | "duplicate_living";
  readonly chaosIncrease: number;
  readonly enemySpawnMultiplier: number;
  readonly xpMultiplier: number;
  readonly presentationToken: keyof Pick<ThemePalette, "shrine">;
}

export interface ThemeManifest {
  readonly id: string;
  readonly schemaVersion: 1;
  readonly copy: ThemeCopy;
  readonly tokens: ThemeTokens;
  readonly characters: readonly CharacterDefinition[];
  readonly weapons: readonly WeaponDefinition[];
  readonly enemies: readonly EnemyDefinition[];
  readonly pickups: readonly PickupDefinition[];
  readonly upgrades: readonly UpgradeDefinition[];
  readonly shrines: readonly ShrineDefinition[];
  readonly skills: readonly SkillDefinition[];
  readonly elites: readonly EliteDefinition[];
  readonly hazards: readonly HazardDefinition[];
  readonly tuning: TuningPack;
}

/**
 * Arena hazards: world content, not enemies.
 *
 * They never count toward the enemy cap, never award kills, and never enter the
 * damage ledger as enemy damage. They exist so positioning matters for reasons
 * beyond enemy avoidance.
 *
 * Unlike `WeaponDefinition`, the kinds are a discriminated union: there are
 * exactly three and their shapes are known now, so nothing is guessed by
 * declaring them.
 */
export type HazardDefinition =
  | Readonly<{
      id: HazardId;
      kind: "damage_zone";
      radius: number;
      /** Warning time before it can hurt anything. */
      telegraphMs: number;
      lifetimeMs: number;
      damage: number;
      tickMs: number;
      /** Movement multiplier applied inside, `1` for no slow. */
      slowMultiplier: number;
      presentationToken: HazardPresentationToken;
    }>
  | Readonly<{
      id: HazardId;
      kind: "obstacle";
      radius: number;
      telegraphMs: number;
      /** Destructible; clearing it is the reward. */
      health: number;
      presentationToken: HazardPresentationToken;
    }>
  | Readonly<{
      id: HazardId;
      kind: "periodic_burst";
      radius: number;
      telegraphMs: number;
      lifetimeMs: number;
      damage: number;
      /** Time between bursts, each preceded by its own telegraph. */
      cycleMs: number;
      presentationToken: HazardPresentationToken;
    }>;

export type HazardPresentationToken = keyof Pick<
  ThemePalette,
  "explosion" | "shrine" | "grid" | "enemyTank"
>;
