import { emptyMetaEconomy, type MetaEconomy } from "../systems/economy/economy";
import type { CharacterId } from "../core/archetypes/ids";
import { createSettings, type RunSettings } from "./settings-state";
import { createSessionStatistics, type SessionStatistics } from "./session-statistics";

export const PROFILE_SCHEMA_VERSION = 3 as const;
export interface ProfileState {
  readonly economy: MetaEconomy;
  readonly schemaVersion: typeof PROFILE_SCHEMA_VERSION;
  readonly gameVersion: string;
  readonly activeThemeId: string;
  readonly contentSchemaVersion: number;
  readonly selectedCharacterId: string;
  readonly unlockedCharacterIds: readonly string[];
  readonly unlockedWeaponIds: readonly string[];
  readonly unlockedUpgradeIds: readonly string[];
  readonly settings: RunSettings;
  readonly statistics: SessionStatistics;
  readonly completedRuns: number;
  readonly deaths: number;
  readonly bestDurationMs: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}
export interface InitialProfileOptions {
  readonly activeThemeId: string;
  readonly contentSchemaVersion: number;
  readonly starterCharacterId: CharacterId;
  readonly now?: string;
}
export function createInitialProfile(options: InitialProfileOptions): ProfileState {
  const now = options.now ?? "1970-01-01T00:00:00.000Z";
  return { schemaVersion: PROFILE_SCHEMA_VERSION, economy: emptyMetaEconomy(), gameVersion: "0.4.5", activeThemeId: options.activeThemeId,
    contentSchemaVersion: options.contentSchemaVersion, selectedCharacterId: options.starterCharacterId,
    unlockedCharacterIds: [options.starterCharacterId], unlockedWeaponIds: ["weapon.starter"],
    unlockedUpgradeIds: [], settings: createSettings(), statistics: createSessionStatistics(),
    completedRuns: 0, deaths: 0, bestDurationMs: 0, createdAt: now, updatedAt: now };
}
