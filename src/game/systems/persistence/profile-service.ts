import { purchaseImpact, type ShopItem } from "../economy/economy";
import type { ThemeManifest, UpgradeDefinition } from "../../core/archetypes/contracts";
import { createInitialProfile, type ProfileState } from "../../state/profile-state";
import { getSessionSettings, hydrateSessionSettings, subscribeSettings } from "../../state/settings-state";
import { hydrateSessionStatistics, recordFinishedRun, type RunContribution } from "../../state/session-statistics";
import { migrateProfile, validateProfile, PROFILE_LIMITS } from "./profile-validation";
export const CURRENT_PROFILE_KEY = "arena-survivor.profile";
export const BACKUP_PROFILE_KEY = "arena-survivor.profile.backup";
export const QUARANTINED_PROFILE_KEY = "arena-survivor.profile.quarantine";
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
      if (storage.getItem(CURRENT_PROFILE_KEY) !== currentRaw) {
        status = { mode: "blocked", message: currentTheme.copy.profile.changedElsewhere };
      } else {
        const raw = JSON.stringify(profile);
        if (currentRaw !== null) storage.setItem(BACKUP_PROFILE_KEY, currentRaw);
        storage.setItem(CURRENT_PROFILE_KEY, raw); currentRaw = raw;
        status = { mode: "saved", message: currentTheme.copy.profile.saved };
      }
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

export type ProfileReplacementAction = "import" | "restore" | "reset";
export interface PreparedProfileReplacement {
  readonly profile: ProfileState;
  readonly warnings: readonly string[];
  readonly action: ProfileReplacementAction;
}
interface ReplacementSnapshot {
  readonly revision: number;
  readonly raw: string | null;
  readonly adapter?: StorageAdapter;
}
// Only a token produced by preparation can commit. The validated candidate is
// immutable, and neither preview nor cancellation touches storage or singletons.
const replacements = new WeakMap<PreparedProfileReplacement, ReplacementSnapshot>();

export function prepareProfileReplacement(candidate: ProfileState, warnings: readonly string[] = [], action: ProfileReplacementAction = "import"): PreparedProfileReplacement {
  getProfile();
  const validated = validateProfile(candidate);
  const token = Object.freeze({ profile: validated, warnings: Object.freeze([...warnings]), action });
  const raw = storage ? storage.getItem(CURRENT_PROFILE_KEY) : null;
  if (storage && raw !== currentRaw) throw new Error("Another tab changed saved progress. Reload before replacing it.");
  replacements.set(token, { revision, raw, adapter: storage });
  return token;
}

export function prepareProfileReset(theme: ThemeManifest): PreparedProfileReplacement {
  return prepareProfileReplacement(createInitialProfile({ activeThemeId: theme.id,
    contentSchemaVersion: theme.schemaVersion, starterCharacterId: "character.starter",
    now: new Date().toISOString() }), [], "reset");
}

function readValidatedRaw(raw: string): ReturnType<typeof migrateProfile> {
  if (raw.length > PROFILE_LIMITS.textBytes || new TextEncoder().encode(raw).length > PROFILE_LIMITS.textBytes) throw new Error("Saved profile is too large.");
  return migrateProfile(JSON.parse(raw));
}

export function prepareProfileBackupRestore(): PreparedProfileReplacement {
  if (!storage) throw new Error("Browser storage is unavailable. Export the current progress before closing this tab.");
  const raw = storage.getItem(BACKUP_PROFILE_KEY);
  if (raw === null) throw new Error("No saved backup is available.");
  const decoded = readValidatedRaw(raw);
  return prepareProfileReplacement(decoded.profile, decoded.warnings, "restore");
}

/** One atomic current-key write, preceded by a recoverable backup. localStorage
 * has no multi-key transaction; failures before that write never publish memory. */
export function confirmProfileReplacement(token: PreparedProfileReplacement): { ok: boolean; error?: string } {
  const expected = replacements.get(token);
  if (!expected) return { ok: false, error: "Prepare and review this save before confirming." };
  if (revision !== expected.revision || storage !== expected.adapter) return { ok: false, error: "Progress changed after the preview. Preview the save again." };
  if (!storage) return { ok: false, error: "Browser storage is unavailable. Current progress has not changed." };
  let next: ProfileState;
  let raw: string;
  try {
    next = validateProfile(token.profile);
    raw = JSON.stringify(next);
    const actualRaw = storage.getItem(CURRENT_PROFILE_KEY);
    if (actualRaw !== expected.raw) return { ok: false, error: "Another tab changed saved progress. Reload before replacing it." };
    let corrupt = false;
    if (actualRaw !== null) {
      try { readValidatedRaw(actualRaw); } catch { corrupt = true; }
    }
    if (corrupt) {
      // Recovery never promotes corrupt bytes over a good backup. Preserve the
      // original separately before the explicit replacement can overwrite it.
      storage.setItem(QUARANTINED_PROFILE_KEY, actualRaw!);
      const backup = storage.getItem(BACKUP_PROFILE_KEY);
      let goodBackup = false;
      if (backup !== null) { try { readValidatedRaw(backup); goodBackup = true; } catch { /* Replace an invalid backup with the validated memory snapshot. */ } }
      if (!goodBackup) storage.setItem(BACKUP_PROFILE_KEY, JSON.stringify(validateProfile(getProfile())));
    } else {
      storage.setItem(BACKUP_PROFILE_KEY, JSON.stringify(validateProfile(getProfile())));
    }
    storage.setItem(CURRENT_PROFILE_KEY, raw);
  } catch {
    return { ok: false, error: "The save could not be installed. Current progress is unchanged; check browser storage and try again." };
  }
  profile = next;
  currentRaw = raw;
  status = { mode: "saved", message: currentTheme.copy.profile.saved };
  hydrateSessionSettings(next.settings);
  hydrateSessionStatistics(next.statistics);
  replacements.delete(token);
  publish();
  return { ok: true };
}

export function profileCompatibilityWarnings(candidate: ProfileState, theme: ThemeManifest): readonly string[] {
  const copy = theme.copy.saveManager;
  const warnings: string[] = [];
  if (candidate.activeThemeId !== theme.id) warnings.push(`${copy.warnTheme}: ${candidate.activeThemeId}`);
  if (candidate.contentSchemaVersion > theme.schemaVersion) warnings.push(`${copy.warnContentVersion}: ${candidate.contentSchemaVersion}`);
  const unknown = [
    ...candidate.unlockedCharacterIds.filter((id) => !theme.characters.some((entry) => entry.id === id)),
    ...candidate.unlockedWeaponIds.filter((id) => !theme.weapons.some((entry) => entry.id === id)),
    ...candidate.unlockedUpgradeIds.filter((id) => !theme.upgrades.some((entry) => entry.id === id)),
    ...Object.keys(candidate.statistics.upgrades).filter((id) => !theme.upgrades.some((entry) => entry.id === id)),
  ];
  const unique = [...new Set(unknown)];
  if (unique.length) warnings.push(`${copy.warnUnavailable} (${unique.length}): ${unique.slice(0, 8).join(", ")}${unique.length > 8 ? "…" : ""}`);
  if (!theme.characters.some((entry) => entry.id === candidate.selectedCharacterId)) warnings.push(`${copy.warnCharacterFallback}: ${candidate.selectedCharacterId}`);
  return Object.freeze(warnings);
}

export function creditImpact(amount: number): void {
  if (!Number.isSafeInteger(amount) || amount < 0) throw new Error("Invalid Impact amount");
  const p = getProfile(); save({ ...p, economy: { ...p.economy, impact: Math.min(PROFILE_LIMITS.number, p.economy.impact + amount) }, updatedAt: new Date().toISOString() });
}
export function buyImpactUpgrade(id: string): boolean {
  const item: ShopItem | undefined = currentTheme.economy?.shop.find((entry) => entry.id === id);
  if (!item) return false;
  const p = getProfile(), next = purchaseImpact(p.economy, item);
  if (next === p.economy) return false;
  save({ ...p, economy: next, updatedAt: new Date().toISOString() }); return true;
}
export function setSandboxImpact(amount: number): void {
  if (!Number.isSafeInteger(amount) || amount < 0 || amount > PROFILE_LIMITS.number) throw new Error("Invalid Impact amount");
  const p = getProfile(); save({ ...p, economy: { ...p.economy, impact: amount } });
}
