import type { ThemeManifest, UpgradeDefinition } from "../../core/archetypes/contracts";
import { createInitialProfile, type ProfileState } from "../../state/profile-state";
import { getSessionSettings, hydrateSessionSettings, subscribeSettings } from "../../state/settings-state";
import { hydrateSessionStatistics, recordFinishedRun, type RunContribution } from "../../state/session-statistics";
import { migrateProfile, validateProfile, PROFILE_LIMITS } from "./profile-validation";
export const CURRENT_PROFILE_KEY = "arena-survivor.profile";
export const BACKUP_PROFILE_KEY = "arena-survivor.profile.backup";
export interface StorageAdapter { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
export interface ProfileStatus { readonly mode: "saved" | "memory" | "blocked"; readonly message: string }
let profile: ProfileState | undefined;
let currentTheme: ThemeManifest;
let storage: StorageAdapter | undefined;
let currentRaw: string | null = null;
let revision = 0;
let status: ProfileStatus = { mode: "memory", message: "" };
let unsubscribe: (() => void) | undefined;
const listeners = new Set<() => void>();
function publish(): void { revision++; for (const listener of listeners) listener(); }
function save(next: ProfileState): void {
  profile = validateProfile(next);
  if (storage && status.mode !== "blocked") {
    try {
      const raw = JSON.stringify(profile);
      if (currentRaw !== null) storage.setItem(BACKUP_PROFILE_KEY, currentRaw);
      storage.setItem(CURRENT_PROFILE_KEY, raw); currentRaw = raw;
      status = { mode: "saved", message: currentTheme.copy.profile.saved };
    } catch { status = { mode: "memory", message: currentTheme.copy.profile.memory }; }
  }
  publish();
}
export function initializeProfile(theme: ThemeManifest, adapter?: StorageAdapter): ProfileStatus {
  currentTheme = theme;
  unsubscribe?.(); unsubscribe = undefined; storage = adapter; currentRaw = null;
  profile = validateProfile(createInitialProfile({ activeThemeId: theme.id, contentSchemaVersion: theme.schemaVersion, starterCharacterId: "character.starter", now: new Date().toISOString() }));
  status = { mode: "memory", message: currentTheme.copy.profile.memory };
  try {
    if (!storage && typeof window !== "undefined") storage = window.localStorage;
    if (storage) {
      currentRaw = storage.getItem(CURRENT_PROFILE_KEY);
      if (currentRaw !== null) {
        try {
          if (new TextEncoder().encode(currentRaw).length > PROFILE_LIMITS.textBytes) throw new Error("too large");
          profile = migrateProfile(JSON.parse(currentRaw)).profile;
          // Only validated source may become the last-known-good backup.

          status = { mode: "saved", message: currentTheme.copy.profile.saved };
        } catch { status = { mode: "blocked", message: currentTheme.copy.profile.blocked }; }
      } else {
        const raw = JSON.stringify(profile); storage.setItem(CURRENT_PROFILE_KEY, raw); currentRaw = raw;
        status = { mode: "saved", message: currentTheme.copy.profile.saved };
      }
    }
  } catch { storage = undefined; status = { mode: "memory", message: currentTheme.copy.profile.memory }; }
  hydrateSessionSettings(profile.settings); hydrateSessionStatistics(profile.statistics);
  unsubscribe = subscribeSettings(() => save({ ...getProfile(), settings: getSessionSettings(), updatedAt: new Date().toISOString() }));
  publish(); return status;
}
export function ensureProfile(theme: ThemeManifest): ProfileState { if (!profile) initializeProfile(theme); return getProfile(); }
export function getProfile(): ProfileState { if (!profile) throw new Error("Profile has not initialized"); return profile; }
export function getProfileStatus(): ProfileStatus { return status; }
export function getProfileRevision(): number { return revision; }
export function getProfileStorage(): { adapter?: StorageAdapter; currentRaw: string | null } { return { adapter: storage, currentRaw }; }
export function subscribeProfile(listener: () => void): () => void { listeners.add(listener); return () => listeners.delete(listener); }
export function recordProfileFinishedRun(theme: ThemeManifest, run: RunContribution & { readonly status: "dead" | "complete"; readonly elapsedMs: number }): readonly string[] {
  const before = ensureProfile(theme); const rawStatistics = recordFinishedRun(run);
  const cap = (value: number) => Math.min(PROFILE_LIMITS.number, value);
  const statistics = { ...rawStatistics, runsPlayed: cap(rawStatistics.runsPlayed), totalKills: cap(rawStatistics.totalKills), totalDamage: cap(rawStatistics.totalDamage), bestDamage: cap(rawStatistics.bestDamage), bestKills: cap(rawStatistics.bestKills), bestLevel: cap(rawStatistics.bestLevel), upgrades: Object.fromEntries(Object.entries(rawStatistics.upgrades).map(([key, record]) => [key, { total: cap(record!.total), bestInRun: cap(record!.bestInRun) }])) };
  hydrateSessionStatistics(statistics);
  const weapons = new Set(before.unlockedWeaponIds); const upgrades = new Set(before.unlockedUpgradeIds); const newly: string[] = [];
  for (const grant of theme.unlocks ?? []) {
    const earned = grant.metric === "runsPlayed" ? statistics.runsPlayed : statistics.totalKills;
    const target = grant.kind === "weapon" ? weapons : upgrades;
    if (earned >= grant.required && !target.has(grant.id)) { target.add(grant.id); newly.push(grant.id); }
  }
  save({ ...before, statistics, unlockedWeaponIds: [...weapons], unlockedUpgradeIds: [...upgrades],
    completedRuns: before.completedRuns + (run.status === "complete" && before.statistics.runsPlayed < PROFILE_LIMITS.number ? 1 : 0), deaths: before.deaths + (run.status === "dead" && before.statistics.runsPlayed < PROFILE_LIMITS.number ? 1 : 0),
    bestDurationMs: cap(Math.max(before.bestDurationMs, run.elapsedMs)), settings: getSessionSettings(), updatedAt: new Date().toISOString() });
  return Object.freeze(newly);
}
export function selectRunUpgradePool(theme: ThemeManifest): readonly UpgradeDefinition[] {
  const current = ensureProfile(theme);
  return Object.freeze(theme.upgrades.filter((upgrade) => {
    const locked = theme.unlocks?.find((grant) => grant.kind === "upgrade" && grant.id === upgrade.id);
    if (locked && !current.unlockedUpgradeIds.includes(upgrade.id)) return false;
    return upgrade.effects.every((effect) => effect.kind !== "weapon.equip" || current.unlockedWeaponIds.includes(effect.weaponId));
  }));
}
export function describeProfile(theme: ThemeManifest): readonly { label: string; display: string }[] {
  const p = ensureProfile(theme); const copy = theme.copy.profile;
  return [{ label: copy.browserSave, display: status.mode === "saved" ? "✓" : "!" }, { label: copy.completedRuns, display: String(p.completedRuns) },
    { label: copy.deaths, display: String(p.deaths) }, { label: copy.longestRun, display: `${(p.bestDurationMs / 1000).toFixed(1)}s` },
    ...(theme.unlocks ?? []).map((grant) => ({ label: theme.copy.content[grant.id]?.name ?? grant.id,
      display: (grant.kind === "weapon" ? p.unlockedWeaponIds : p.unlockedUpgradeIds).includes(grant.id) ? copy.unlocked : `${copy.locked} · ${grant.required} ${grant.metric === "runsPlayed" ? copy.finishedRuns : copy.lifetimeKills}` }))];
}
