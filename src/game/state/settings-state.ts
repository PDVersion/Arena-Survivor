/** Serializable preferences hydrated by the C6 profile service before boot.
 * Module state supports existing scene consumers; subscribers persist explicit
 * changes through the adapter. No frame-level storage access lives here.
 */

import { difficultyIds, type DifficultyId } from "../core/archetypes/difficulty";

export interface RunSettings {
  /** Presentation only; persisted by the profile service, including restarts. */
  readonly presentationQuality: "default" | "low";
  /** Chosen before play; changing it during play affects the next run. */
  readonly difficulty: DifficultyId;
  /** Show before/after numbers on upgrade cards. Badges are always shown. */
  readonly detailedUpgradeCards: boolean;
  readonly reducedMotion: boolean;
  readonly muted: boolean;
  /** Screen-space minimap opacity. Zero hides it. */
  readonly minimapOpacity: 0 | 0.35 | 0.6 | 0.85;
}

export type SettingKey = keyof RunSettings;
export type BooleanSettingKey = Exclude<SettingKey, "minimapOpacity" | "difficulty" | "presentationQuality">;

export const settingKeys: readonly SettingKey[] = Object.freeze([
  "difficulty",
  "detailedUpgradeCards",
  "reducedMotion",
  "muted",
  "minimapOpacity",
  "presentationQuality",
]);

export function createSettings(overrides: Partial<RunSettings> = {}): RunSettings {
  return Object.freeze({
    difficulty: "normal",
    presentationQuality: "default",
    // Numbers on by default: strictly more information, and the toggle is there
    // for players who prefer clean cards.
    detailedUpgradeCards: true,
    reducedMotion: false,
    muted: false,
    minimapOpacity: 0.6,
    ...overrides,
  });
}

export function toggleSetting(settings: RunSettings, key: BooleanSettingKey): RunSettings {
  return Object.freeze({ ...settings, [key]: !settings[key] });
}

const minimapOpacities: readonly RunSettings["minimapOpacity"][] = [0, 0.35, 0.6, 0.85];

export function cycleMinimapOpacity(settings: RunSettings): RunSettings {
  const index = minimapOpacities.indexOf(settings.minimapOpacity);
  return Object.freeze({
    ...settings,
    minimapOpacity: minimapOpacities[(index + 1) % minimapOpacities.length]!,
  });
}

export function cycleDifficulty(settings: RunSettings, direction = 1): RunSettings {
  const index = difficultyIds.indexOf(settings.difficulty);
  return Object.freeze({
    ...settings,
    difficulty: difficultyIds[(index + direction + difficultyIds.length) % difficultyIds.length]!,
  });
}

export function cyclePresentationQuality(settings: RunSettings): RunSettings {
  return Object.freeze({ ...settings, presentationQuality: settings.presentationQuality === "default" ? "low" : "default" });
}

let sessionSettings = createSettings();

export function getSessionSettings(): RunSettings {
  return sessionSettings;
}

export function updateSessionSettings(next: RunSettings): RunSettings {
  sessionSettings = next;
  for (const listener of settingsListeners) listener();
  return sessionSettings;
}

/** Test-only reset so a spec never inherits another spec's choices. */
export function resetSessionSettings(overrides: Partial<RunSettings> = {}): RunSettings {
  sessionSettings = createSettings(overrides);
  return sessionSettings;
}

const settingsListeners = new Set<() => void>();
export function subscribeSettings(listener: () => void): () => void { settingsListeners.add(listener); return () => settingsListeners.delete(listener); }
export function hydrateSessionSettings(settings: RunSettings): void { sessionSettings = createSettings(settings); }
