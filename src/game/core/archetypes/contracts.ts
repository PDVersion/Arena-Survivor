import type {
  CharacterId,
  ContentId,
  EnemyId,
  PickupId,
  ShrineId,
  SkillId,
  UpgradeId,
  WeaponId,
} from "./ids";
import type { UpgradeEffect } from "./effects";
import type { PlayerBaseStats } from "../stats/player-stats";
import type { EliteId, FeedbackCategory } from "./categories";

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
  readonly paused: string;
  readonly deathTitle: string;
  readonly deathMessage: string;
  readonly completeTitle: string;
  readonly completeMessage: string;
  readonly restartAction: string;
  readonly shrinePrompt: string;
  readonly surgeActive: string;
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
}

export interface ThemeTokens {
  readonly palette: ThemePalette;
  readonly playerShape: "circle" | "diamond" | "square";
  readonly feedback: Readonly<Record<FeedbackCategory, string>>;
}

export interface SkillDefinition {
  readonly id: SkillId;
  readonly effects?: readonly SkillEffectDefinition[];
}

export type SkillEffectDefinition =
  | Readonly<{ kind: "piercing_momentum"; damagePerUniqueHit: number }>
  | Readonly<{ kind: "on_kill_explosion"; radius: number; damage: number }>
  | Readonly<{ kind: "fracture"; chance: number; childEnemyId: EnemyId; childCount: number; rewardMultiplier: number }>
  | Readonly<{ kind: "bloodlust"; windowMs: number; killsPerStep: number; attackSpeedPerStep: number }>
  | Readonly<{ kind: "chain_reaction" }>;

export interface EliteDefinition {
  readonly id: EliteId;
}

export interface CharacterDefinition {
  readonly id: CharacterId;
  readonly radius: number;
  readonly presentationToken: keyof Pick<ThemePalette, "player">;
  readonly baseStats: PlayerBaseStats;
}

export interface WeaponDefinition {
  readonly id: WeaponId;
  readonly damage: number;
  readonly cooldownMs: number;
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
  readonly spawnWeight: number;
  readonly unlockAtMs: number;
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

export interface UpgradeDefinition {
  readonly id: UpgradeId;
  readonly effects: readonly UpgradeEffect[];
  readonly presentationToken: keyof Pick<ThemePalette, "accent">;
}

export interface ShrineDefinition {
  readonly id: ShrineId;
  readonly radius: number;
  readonly interactionRadius: number;
  readonly spawnCount: number;
  readonly spawnDurationMs: number;
  readonly rewardMultiplier: number;
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
}
