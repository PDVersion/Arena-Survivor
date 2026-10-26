import { createInitialProfile, type ProfileState } from "../../state/profile-state";
import { createSettings } from "../../state/settings-state";
import type { SessionStatistics } from "../../state/session-statistics";
export const PROFILE_LIMITS = Object.freeze({ textBytes: 262144, depth: 12, entries: 512, idLength: 128, number: 1e15 });
function fail(message: string): never { throw new Error(`Invalid save: ${message}`); }
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail("expected object");
  return value as Record<string, unknown>;
}
function keys(value: Record<string, unknown>, allowed: readonly string[]): void {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) fail(`unknown field ${key}`);
  for (const key of allowed) if (!Object.hasOwn(value, key)) fail(`missing ${key}`);
}
function safeTree(value: unknown, depth = 0): void {
  if (depth > PROFILE_LIMITS.depth) fail("too deeply nested");
  if (Array.isArray(value)) { if (value.length > PROFILE_LIMITS.entries) fail("too many entries"); value.forEach((entry) => safeTree(entry, depth + 1)); }
  else if (value && typeof value === "object") {
    const entries = Object.entries(value); if (entries.length > PROFILE_LIMITS.entries) fail("too many fields");
    for (const [key, entry] of entries) { if (["__proto__", "prototype", "constructor"].includes(key)) fail("unsafe key"); safeTree(entry, depth + 1); }
  }
}
function number(value: unknown, integer = false): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > PROFILE_LIMITS.number || (integer && !Number.isSafeInteger(value))) fail("invalid number");
  return value;
}
function id(value: unknown): string {
  if (typeof value !== "string" || value.length > PROFILE_LIMITS.idLength || !/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(value)) fail("invalid stable ID");
  return value;
}
function ids(value: unknown): readonly string[] {
  if (!Array.isArray(value)) fail("expected ID list");
  const result = value.map(id); if (new Set(result).size !== result.length) fail("duplicate IDs"); return Object.freeze(result);
}
function timestamp(value: unknown): string {
  if (typeof value !== "string" || value.length > 32 || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) fail("invalid timestamp"); return value;
}
export function validateProfile(input: unknown): ProfileState {
  safeTree(input);
  if (new TextEncoder().encode(JSON.stringify(input)).length > PROFILE_LIMITS.textBytes) fail("too large");
  const p = object(input);
  keys(p, ["schemaVersion", "gameVersion", "activeThemeId", "contentSchemaVersion", "selectedCharacterId", "unlockedCharacterIds", "unlockedWeaponIds", "unlockedUpgradeIds", "settings", "statistics", "completedRuns", "deaths", "bestDurationMs", "createdAt", "updatedAt"]);
  if (p.schemaVersion !== 2) fail("unsupported schema version");
  const settings = object(p.settings);
  // Additive schema2 preference: historical saves omit it and hydrate OFF.
  const requiredSettings = { ...settings }; delete requiredSettings.showAttackRadius;
  keys(requiredSettings, ["difficulty", "presentationQuality", "detailedUpgradeCards", "reducedMotion", "muted", "minimapOpacity"]);
  if (typeof settings.difficulty !== "string" || typeof settings.presentationQuality !== "string" || !["beginner", "normal", "experienced"].includes(settings.difficulty) || !["default", "low"].includes(String(settings.presentationQuality)) || ![0, 0.35, 0.6, 0.85].includes(settings.minimapOpacity as number)) fail("invalid setting");
  if (Object.hasOwn(settings, "showAttackRadius") && typeof settings.showAttackRadius !== "boolean") fail("invalid attack radius setting");
  for (const key of ["detailedUpgradeCards", "reducedMotion", "muted"]) if (typeof settings[key] !== "boolean") fail("invalid setting");
  const statistics = object(p.statistics); keys(statistics, ["runsPlayed", "totalKills", "totalDamage", "bestLevel", "bestKills", "bestDamage", "upgrades"]);
  for (const key of ["runsPlayed", "totalKills", "bestLevel", "bestKills"]) number(statistics[key], true);
  number(statistics.totalDamage); number(statistics.bestDamage);
  const upgrades = object(statistics.upgrades);
  for (const [key, entry] of Object.entries(upgrades)) { id(key); const record = object(entry); keys(record, ["total", "bestInRun"]); if (number(record.bestInRun, true) > number(record.total, true)) fail("upgrade best exceeds total"); }
  const characters = ids(p.unlockedCharacterIds); const selected = id(p.selectedCharacterId);
  if (!characters.includes(selected)) fail("selected character is locked");
  if (number(p.completedRuns, true) + number(p.deaths, true) !== statistics.runsPlayed) fail("run totals disagree");
  if ((statistics.bestKills as number) > (statistics.totalKills as number) || (statistics.bestDamage as number) > (statistics.totalDamage as number)) fail("best exceeds total");
  const result = { ...p, schemaVersion: 2, gameVersion: id(p.gameVersion), activeThemeId: id(p.activeThemeId), contentSchemaVersion: number(p.contentSchemaVersion, true), selectedCharacterId: selected,
    unlockedCharacterIds: characters, unlockedWeaponIds: ids(p.unlockedWeaponIds), unlockedUpgradeIds: ids(p.unlockedUpgradeIds), settings: createSettings(settings), statistics: statistics as unknown as SessionStatistics,
    bestDurationMs: number(p.bestDurationMs), createdAt: timestamp(p.createdAt), updatedAt: timestamp(p.updatedAt) } as ProfileState;
  const copy = JSON.parse(JSON.stringify(result)) as ProfileState;
  const freeze = (value: unknown): void => { if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); } };
  freeze(copy); return copy;
}
export function migrateProfile(input: unknown): { profile: ProfileState; warnings: readonly string[] } {
  const p = object(input); safeTree(p);
  if (p.schemaVersion !== 1) return { profile: validateProfile(p), warnings: [] };
  keys(p, ["schemaVersion", "activeThemeId", "contentSchemaVersion", "selectedCharacterId", "unlockedCharacterIds"]);
  const base = createInitialProfile({ activeThemeId: id(p.activeThemeId), contentSchemaVersion: number(p.contentSchemaVersion, true), starterCharacterId: "character.starter" });
  return { profile: validateProfile({ ...base, selectedCharacterId: p.selectedCharacterId, unlockedCharacterIds: p.unlockedCharacterIds }), warnings: ["Migrated schema 1 profile; new statistics and settings use defaults."] };
}
