import type { CharacterId } from "../core/archetypes/ids";

export const PROFILE_SCHEMA_VERSION = 1 as const;

export interface ProfileState {
  readonly schemaVersion: typeof PROFILE_SCHEMA_VERSION;
  readonly activeThemeId: string;
  readonly contentSchemaVersion: number;
  readonly selectedCharacterId: CharacterId;
  readonly unlockedCharacterIds: readonly CharacterId[];
}

export interface InitialProfileOptions {
  readonly activeThemeId: string;
  readonly contentSchemaVersion: number;
  readonly starterCharacterId: CharacterId;
}

export function createInitialProfile(options: InitialProfileOptions): ProfileState {
  return {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    activeThemeId: options.activeThemeId,
    contentSchemaVersion: options.contentSchemaVersion,
    selectedCharacterId: options.starterCharacterId,
    unlockedCharacterIds: [options.starterCharacterId],
  };
}
