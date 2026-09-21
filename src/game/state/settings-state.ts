/**
 * Session settings.
 *
 * Shaped for `build/SAVE_DATA.md` so a persistence adapter can store it
 * unchanged, but held in memory for V0.3: the plan defers persistence to V0.4.
 * It lives at module scope rather than on the scene so a restart keeps the
 * player's choices, which is what "session" means to them.
 */

export interface RunSettings {
  /** Show before/after numbers on upgrade cards. Badges are always shown. */
  readonly detailedUpgradeCards: boolean;
  readonly reducedMotion: boolean;
  readonly muted: boolean;
  /** Screen-space minimap opacity. Zero hides it. */
  readonly minimapOpacity: 0 | 0.35 | 0.6 | 0.85;
}

export type SettingKey = keyof RunSettings;
export type BooleanSettingKey = Exclude<SettingKey, "minimapOpacity">;

export const settingKeys: readonly SettingKey[] = Object.freeze([
  "detailedUpgradeCards",
  "reducedMotion",
  "muted",
  "minimapOpacity",
]);

export function createSettings(overrides: Partial<RunSettings> = {}): RunSettings {
  return Object.freeze({
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

let sessionSettings = createSettings();

export function getSessionSettings(): RunSettings {
  return sessionSettings;
}

export function updateSessionSettings(next: RunSettings): RunSettings {
  sessionSettings = next;
  return sessionSettings;
}

/** Test-only reset so a spec never inherits another spec's choices. */
export function resetSessionSettings(overrides: Partial<RunSettings> = {}): RunSettings {
  sessionSettings = createSettings(overrides);
  return sessionSettings;
}
