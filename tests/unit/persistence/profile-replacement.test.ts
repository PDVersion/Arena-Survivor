import { describe, expect, it } from "vitest";
import { ecoGuardianTheme as theme } from "../../../src/game/content/themes/eco-guardian";
import { createInitialProfile, type ProfileState } from "../../../src/game/state/profile-state";
import { getSessionSettings, updateSessionSettings } from "../../../src/game/state/settings-state";
import { getSessionStatistics } from "../../../src/game/state/session-statistics";
import {
  BACKUP_PROFILE_KEY, CURRENT_PROFILE_KEY, QUARANTINED_PROFILE_KEY,
  confirmProfileReplacement, getProfile, getProfileRevision, getProfileStatus, initializeProfile,
  prepareProfileBackupRestore, prepareProfileReplacement, prepareProfileReset,
  profileCompatibilityWarnings, subscribeProfile, type StorageAdapter,
} from "../../../src/game/systems/persistence/profile-service";

const fresh = () => createInitialProfile({ activeThemeId: theme.id, contentSchemaVersion: theme.schemaVersion, starterCharacterId: "character.starter" });
function adapter(raw = JSON.stringify(fresh())) {
  const values = new Map<string, string>([[CURRENT_PROFILE_KEY, raw]]);
  const writes: string[] = [];
  const fail = new Set<string>();
  const storage: StorageAdapter = {
    getItem: (key) => values.get(key) ?? null,
    setItem(key, value) { writes.push(key); if (fail.has(key)) throw Error("quota"); values.set(key, value); },
    removeItem(key) { values.delete(key); },
  };
  initializeProfile(theme, storage);
  return { storage, values, writes, fail };
}
function imported(): ProfileState {
  const initial = fresh();
  return { ...initial, settings: { ...initial.settings, muted: true, difficulty: "experienced" },
    unlockedWeaponIds: ["weapon.starter", "weapon.secondary", "weapon.future"],
    statistics: { ...initial.statistics, runsPlayed: 2, totalKills: 25, totalDamage: 123.25, bestKills: 20, bestDamage: 100, bestLevel: 5 },
    completedRuns: 1, deaths: 1, bestDurationMs: 300000 };
}

describe("explicit profile replacement", () => {
  it("prepares an immutable preview without changing current progress or bytes", () => {
    const store = adapter(); const before = getProfile(); const raw = new Map(store.values); const rev = getProfileRevision();
    const candidate = JSON.parse(JSON.stringify(imported()));
    const token = prepareProfileReplacement(candidate, ["example warning"]);
    candidate.settings.muted = false;
    expect(token.profile.settings.muted).toBe(true);
    expect(Object.isFrozen(token.profile.settings)).toBe(true);
    expect(token.warnings).toEqual(["example warning"]);
    expect(getProfile()).toBe(before); expect(getProfileRevision()).toBe(rev);
    expect(store.values).toEqual(raw); expect(store.writes).toEqual([]);
  });
  it("backs up before the current write and publishes fully installed state once", () => {
    const store = adapter(); const original = getProfile(); const token = prepareProfileReplacement(imported());
    let published = 0;
    const unsubscribe = subscribeProfile(() => {
      published++;
      expect(JSON.parse(store.values.get(CURRENT_PROFILE_KEY)!)).toEqual(token.profile);
      expect(JSON.parse(store.values.get(BACKUP_PROFILE_KEY)!)).toEqual(original);
    });
    try { expect(confirmProfileReplacement(token)).toEqual({ ok: true }); } finally { unsubscribe(); }
    expect(store.writes).toEqual([BACKUP_PROFILE_KEY, CURRENT_PROFILE_KEY]); expect(published).toBe(1);
    expect(getProfile()).toEqual(imported()); expect(getSessionSettings().muted).toBe(true);
    expect(getSessionStatistics().totalDamage).toBe(123.25);
    expect(confirmProfileReplacement(token).ok).toBe(false);
    initializeProfile(theme, store.storage); expect(getProfile()).toEqual(imported());
  });
  it.each([BACKUP_PROFILE_KEY, CURRENT_PROFILE_KEY])("retains memory and current bytes when %s cannot be written", (key) => {
    const store = adapter(); const before = getProfile(); const raw = store.values.get(CURRENT_PROFILE_KEY); const rev = getProfileRevision();
    const token = prepareProfileReplacement(imported()); store.fail.add(key);
    expect(confirmProfileReplacement(token).ok).toBe(false);
    expect(getProfile()).toBe(before); expect(getProfileRevision()).toBe(rev);
    expect(store.values.get(CURRENT_PROFILE_KEY)).toBe(raw);
    expect(getSessionSettings()).toEqual(before.settings); expect(getSessionStatistics()).toEqual(before.statistics);
  });
  it("rejects stale memory previews after a settings change", () => {
    const store = adapter(); const token = prepareProfileReplacement(imported());
    updateSessionSettings({ ...getSessionSettings(), reducedMotion: true });
    const before = getProfile(); const raw = new Map(store.values); const count = store.writes.length;
    expect(confirmProfileReplacement(token).ok).toBe(false);
    expect(getProfile()).toBe(before); expect(store.values).toEqual(raw); expect(store.writes).toHaveLength(count);
  });
  it("rejects a cross-tab storage change even if the local revision is unchanged", () => {
    const store = adapter(); const before = getProfile(); const token = prepareProfileReplacement(imported());
    const external = JSON.stringify({ ...fresh(), updatedAt: "2026-10-20T00:00:00.000Z" });
    store.values.set(CURRENT_PROFILE_KEY, external);
    expect(confirmProfileReplacement(token).ok).toBe(false);
    expect(store.values.get(CURRENT_PROFILE_KEY)).toBe(external); expect(getProfile()).toBe(before); expect(store.writes).toEqual([]);
  });
  it("does not overwrite another tab's progress already changed before preview", () => {
    const store = adapter(); const before = getProfile();
    const external = JSON.stringify(imported()); store.values.set(CURRENT_PROFILE_KEY, external);
    expect(() => prepareProfileReplacement(fresh())).toThrow("Another tab");
    expect(store.values.get(CURRENT_PROFILE_KEY)).toBe(external);
    expect(getProfile()).toBe(before); expect(store.writes).toEqual([]);
  });
  it("keeps later local settings in memory instead of overwriting another tab", () => {
    const store = adapter(); const external = JSON.stringify(imported());
    store.values.set(CURRENT_PROFILE_KEY, external);
    updateSessionSettings({ ...getSessionSettings(), reducedMotion: true });
    expect(getProfile().settings.reducedMotion).toBe(true);
    expect(getProfileStatus().mode).toBe("blocked");
    expect(store.values.get(CURRENT_PROFILE_KEY)).toBe(external); expect(store.writes).toEqual([]);
  });
  it("does not accept fabricated tokens or invalid profile candidates", () => {
    const store = adapter(); const before = new Map(store.values);
    expect(confirmProfileReplacement({ profile: imported(), warnings: [], action: "import" }).ok).toBe(false);
    expect(() => prepareProfileReplacement({ ...imported(), deaths: -1 })).toThrow();
    expect(store.values).toEqual(before);
  });
  it("quarantines corrupt current bytes and retains an existing good backup", () => {
    const store = adapter("broken current"); const good = JSON.stringify(imported()); store.values.set(BACKUP_PROFILE_KEY, good);
    const token = prepareProfileReplacement(fresh());
    expect(confirmProfileReplacement(token).ok).toBe(true);
    expect(store.values.get(QUARANTINED_PROFILE_KEY)).toBe("broken current");
    expect(store.values.get(BACKUP_PROFILE_KEY)).toBe(good);
    expect(store.writes).toEqual([QUARANTINED_PROFILE_KEY, CURRENT_PROFILE_KEY]);
  });
  it("cannot replace a corrupt source when quarantine fails", () => {
    const store = adapter("broken current"); const backup = JSON.stringify(imported()); store.values.set(BACKUP_PROFILE_KEY, backup);
    const before = getProfile(); store.fail.add(QUARANTINED_PROFILE_KEY);
    expect(confirmProfileReplacement(prepareProfileReplacement(fresh())).ok).toBe(false);
    expect(store.values.get(CURRENT_PROFILE_KEY)).toBe("broken current"); expect(store.values.get(BACKUP_PROFILE_KEY)).toBe(backup); expect(getProfile()).toBe(before);
  });
  it("provides a validated memory backup if corrupt storage has no usable backup", () => {
    const store = adapter("broken current"); const before = getProfile(); store.values.set(BACKUP_PROFILE_KEY, "broken backup");
    expect(confirmProfileReplacement(prepareProfileReplacement(imported())).ok).toBe(true);
    expect(JSON.parse(store.values.get(BACKUP_PROFILE_KEY)!)).toEqual(before);
  });
  it("previews backup restore and reset without mutation, then permits explicit confirmation", () => {
    const store = adapter(); store.values.set(BACKUP_PROFILE_KEY, JSON.stringify(imported()));
    const raw = new Map(store.values); const restore = prepareProfileBackupRestore();
    expect(restore.action).toBe("restore"); expect(store.values).toEqual(raw);
    expect(confirmProfileReplacement(restore).ok).toBe(true); expect(getProfile()).toEqual(imported());
    const reset = prepareProfileReset(theme); expect(reset.action).toBe("reset"); expect(getProfile()).toEqual(imported());
    expect(confirmProfileReplacement(reset).ok).toBe(true); expect(getProfile().statistics.runsPlayed).toBe(0);
    expect(JSON.parse(store.values.get(BACKUP_PROFILE_KEY)!)).toEqual(imported());
  });
  it("rejects missing or malformed backups without touching current progress", () => {
    const store = adapter(); const before = getProfile();
    expect(() => prepareProfileBackupRestore()).toThrow();
    store.values.set(BACKUP_PROFILE_KEY, "bad"); const raw = new Map(store.values);
    expect(() => prepareProfileBackupRestore()).toThrow(); expect(store.values).toEqual(raw); expect(getProfile()).toBe(before);
  });
  it("warns about unknown compatible IDs without rewriting their identity", () => {
    adapter(); const base = imported();
    const candidate = { ...base, activeThemeId: "future-theme", contentSchemaVersion: 99,
      selectedCharacterId: "character.future", unlockedCharacterIds: ["character.future"] };
    const warnings = profileCompatibilityWarnings(candidate, theme);
    expect(warnings).toHaveLength(4);
    expect(warnings.join(" ")).toContain("weapon.future");
    expect(prepareProfileReplacement(candidate).profile.selectedCharacterId).toBe("character.future");
  });
});
