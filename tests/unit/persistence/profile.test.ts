import { describe, expect, it } from "vitest";
import { ecoGuardianTheme as theme } from "../../../src/game/content/themes/eco-guardian";
import { createInitialProfile } from "../../../src/game/state/profile-state";
import { createRunStatistics } from "../../../src/game/systems/statistics/run-statistics";
import { getSessionStatistics } from "../../../src/game/state/session-statistics";
import { getSessionSettings, updateSessionSettings } from "../../../src/game/state/settings-state";
import { validateProfile, migrateProfile } from "../../../src/game/systems/persistence/profile-validation";
import { CURRENT_PROFILE_KEY, BACKUP_PROFILE_KEY, initializeProfile, getProfile, getProfileStatus, recordProfileFinishedRun, selectRunUpgradePool } from "../../../src/game/systems/persistence/profile-service";
function store(initial?: string) {
  const values = new Map<string, string>(initial ? [[CURRENT_PROFILE_KEY, initial]] : []);
  return { values, getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
}
const fresh = () => createInitialProfile({ activeThemeId: theme.id, contentSchemaVersion: 1, starterCharacterId: "character.starter" });
describe("durable profile", () => {
  it("validates round trips and preserves unknown stable content", () => {
    const p = { ...fresh(), unlockedWeaponIds: ["weapon.starter", "weapon.future"], activeThemeId: "future_theme" };
    expect(validateProfile(JSON.parse(JSON.stringify(p)))).toEqual(p);
  });
  it("migrates the historical schema deterministically", () => {
    const old = { schemaVersion: 1, activeThemeId: theme.id, contentSchemaVersion: 1, selectedCharacterId: "character.starter", unlockedCharacterIds: ["character.starter"] };
    expect(migrateProfile(old)).toEqual(migrateProfile(old)); expect(migrateProfile(old).profile.schemaVersion).toBe(3);
  });
  it.each([NaN, Infinity, -1, 1e16])("rejects invalid statistics %s", (value) => {
    expect(() => validateProfile({ ...fresh(), bestDurationMs: value })).toThrow();
  });
  it("rejects duplicates, future schema, unsafe keys and invalid settings", () => {
    expect(() => validateProfile({ ...fresh(), unlockedWeaponIds: ["weapon.starter", "weapon.starter"] })).toThrow();
    expect(() => migrateProfile({ ...fresh(), schemaVersion: 9 })).toThrow();
    expect(() => validateProfile(JSON.parse('{"__proto__":{}}'))).toThrow();
    expect(() => validateProfile({ ...fresh(), settings: { ...fresh().settings, difficulty: "impossible" } })).toThrow();
  });
  it("persists the explicit attack guide setting without changing completed run totals", () => {
    const storage = store(); initializeProfile(theme, storage);
    const before = getProfile().statistics.runsPlayed;
    expect(getSessionSettings().showAttackRadius).toBe(false);
    updateSessionSettings({ ...getSessionSettings(), showAttackRadius: true });
    initializeProfile(theme, storage);
    expect(getSessionSettings().showAttackRadius).toBe(true);
    expect(getProfile().statistics.runsPlayed).toBe(before);
  });
  it("persists settings and exact terminal totals, with immutable next-run pool", () => {
    const storage = store(); initializeProfile(theme, storage); const pool = selectRunUpgradePool(theme);
    expect(pool.some((entry) => entry.id === "upgrade.equip_secondary")).toBe(false);
    updateSessionSettings({ ...getSessionSettings(), muted: true, presentationQuality: "low" });
    const statistics = { ...createRunStatistics(), kills: 25, totalDamage: 123.25 };
    const unlocked = recordProfileFinishedRun(theme, { level: 5, statistics, status: "dead", elapsedMs: 1234 });
    expect(unlocked).toEqual(["weapon.secondary", "upgrade.bloodlust"]);
    expect(pool.some((entry) => entry.id === "upgrade.equip_secondary")).toBe(false);
    expect(selectRunUpgradePool(theme).some((entry) => entry.id === "upgrade.equip_secondary")).toBe(true);
    initializeProfile(theme, storage);
    expect(getSessionSettings()).toMatchObject({ muted: true, presentationQuality: "low" });
    expect(getSessionStatistics()).toMatchObject({ runsPlayed: 1, totalKills: 25, totalDamage: 123.25 });
    expect(getProfile()).toMatchObject({ deaths: 1, completedRuns: 0, bestDurationMs: 1234 });
    expect(storage.values.has(BACKUP_PROFILE_KEY)).toBe(true);
  });
  it("preserves corrupt source and a good backup while playing in memory", () => {
    const storage = store("not JSON"); storage.values.set(BACKUP_PROFILE_KEY, JSON.stringify(fresh()));
    const before = new Map(storage.values); initializeProfile(theme, storage);
    updateSessionSettings({ ...getSessionSettings(), muted: true });
    expect(getProfileStatus().mode).toBe("blocked"); expect(storage.values).toEqual(before); expect(getProfile().settings.muted).toBe(true);
  });
  it("handles denied reads and quota without losing in-memory progress", () => {
    const denied = { getItem() { throw Error("denied"); }, setItem() { throw Error("quota"); }, removeItem() {} };
    expect(() => initializeProfile(theme, denied)).not.toThrow();
    expect(() => updateSessionSettings({ ...getSessionSettings(), muted: true })).not.toThrow();
    expect(getProfileStatus().mode).toBe("memory"); expect(getProfile().settings.muted).toBe(true);
  });
  it("retains memory on write quota failure after a valid read", () => {
    const raw = JSON.stringify(fresh()); const storage = store(raw);
    storage.setItem = () => { throw new Error("quota"); };
    initializeProfile(theme, storage);
    updateSessionSettings({ ...getSessionSettings(), muted: true });
    recordProfileFinishedRun(theme, { level: 2, statistics: createRunStatistics(), status: "dead", elapsedMs: 20 });
    expect(getProfileStatus().mode).toBe("memory"); expect(getProfile().statistics.runsPlayed).toBe(1);
    expect(storage.getItem(CURRENT_PROFILE_KEY)).toBe(raw);
  });
  it("saturates durable aggregate ceilings without altering contributed run values", () => {
    const p = fresh(); const max = 1e15;
    const storage = store(JSON.stringify({ ...p, completedRuns: max, statistics: { ...p.statistics, runsPlayed: max, totalKills: max, totalDamage: max } }));
    initializeProfile(theme, storage); const statistics = { ...createRunStatistics(), kills: 3, totalDamage: 4 };
    expect(() => recordProfileFinishedRun(theme, { level: 2, statistics, status: "dead", elapsedMs: 20 })).not.toThrow();
    expect(getProfile().statistics).toMatchObject({ runsPlayed: max, totalKills: max, totalDamage: max });
    expect(statistics).toMatchObject({ kills: 3, totalDamage: 4 });
    expect(() => validateProfile(getProfile())).not.toThrow();
  });

});
