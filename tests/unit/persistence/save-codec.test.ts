import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { createInitialProfile, type ProfileState } from "../../../src/game/state/profile-state";
import { PROFILE_LIMITS } from "../../../src/game/systems/persistence/profile-validation";
import { decodeProfile, encodeProfile, MAX_SAVE_CODE_BYTES } from "../../../src/game/systems/persistence/save-codec";

const initial = () => createInitialProfile({ activeThemeId: "eco-guardian", contentSchemaVersion: 1, starterCharacterId: "character.starter" });
function envelope(bytes: Uint8Array | string, header = "ARENA-SURVIVOR-SAVE:1"): string {
  const payload = Buffer.from(typeof bytes === "string" ? new TextEncoder().encode(bytes) : bytes).toString("base64url");
  return withPayload(payload, header);
}
function withPayload(payload: string, header = "ARENA-SURVIVOR-SAVE:1"): string {
  return `${header}\n${payload}\n${createHash("sha256").update(payload, "ascii").digest("hex")}`;
}
const pack = (value: unknown) => envelope(JSON.stringify(value));
function reverseKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(reverseKeys);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).reverse().map(([key, entry]) => [key, reverseKeys(entry)]));
  return value;
}

describe("portable save codec", () => {
  it("round trips every persistent field without mutating the original", async () => {
    const profile: ProfileState = { ...initial(), activeThemeId: "future_theme", selectedCharacterId: "character.future",
      unlockedCharacterIds: ["character.starter", "character.future"], unlockedWeaponIds: ["weapon.starter", "weapon.secondary"], unlockedUpgradeIds: ["upgrade.bloodlust"],
      settings: { difficulty: "experienced", presentationQuality: "low", detailedUpgradeCards: false, showAttackRadius: true, reducedMotion: true, muted: true, minimapOpacity: 0.85 },
      completedRuns: 2, deaths: 3, bestDurationMs: 300000.125, createdAt: "2026-10-20T00:00:00.000Z", updatedAt: "2026-10-20T03:00:00.000Z",
      statistics: { runsPlayed: 5, totalKills: 123, totalDamage: 456.875, bestLevel: 12, bestKills: 99, bestDamage: 234.5, upgrades: { "upgrade.damage": { total: 9, bestInRun: 4 } } },
    };
    const before = structuredClone(profile); const code = await encodeProfile(profile); const decoded = await decodeProfile(code);
    expect(decoded).toEqual({ profile, warnings: [], sourceSchemaVersion: 2 });
    expect(profile).toEqual(before); expect(Object.isFrozen(decoded.profile.statistics)).toBe(true);
    expect(code.split("\n")).toHaveLength(3); expect(code.split("\n")[2]).toMatch(/^[a-f0-9]{64}$/);
  });
  it("imports pre-guide schema2 settings with the radius guide OFF", async () => {
    const old = JSON.parse(JSON.stringify(initial()));
    delete old.settings.showAttackRadius;
    const decoded = await decodeProfile(pack(old));
    expect(decoded.profile.schemaVersion).toBe(2);
    expect(decoded.profile.settings.showAttackRadius).toBe(false);
    const roundTrip = await decodeProfile(await encodeProfile(decoded.profile));
    expect(roundTrip.profile).toEqual(decoded.profile);
  });
  it.each([null, 1, "false", {}, []])("rejects invalid radius guide setting %j", async (value) => {
    const profile = initial();
    await expect(decodeProfile(pack({ ...profile, settings: { ...profile.settings, showAttackRadius: value } }))).rejects.toThrow();
  });
  it("canonicalizes nested object keys, preserving all array order", async () => {
    const profile = { ...initial(), unlockedWeaponIds: ["weapon.future", "weapon.starter"] };
    const code = await encodeProfile(profile);
    expect(await encodeProfile(reverseKeys(profile) as ProfileState)).toBe(code);
    expect((await decodeProfile(code)).profile.unlockedWeaponIds).toEqual(profile.unlockedWeaponIds);
    expect(await encodeProfile({ ...profile, unlockedWeaponIds: [...profile.unlockedWeaponIds].reverse() })).not.toBe(code);
    const raw = Buffer.from(code.split("\n")[1]!, "base64url").toString("utf8");
    expect(raw.startsWith('{"activeThemeId":')).toBe(true);
    expect(raw).toContain('"statistics":{"bestDamage":');
  });
  it("checksums the encoded payload bytes with independently calculated SHA-256", async () => {
    const [header, payload, checksum] = (await encodeProfile(initial())).split("\n");
    expect(header).toBe("ARENA-SURVIVOR-SAVE:1"); expect(payload).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(checksum).toBe(createHash("sha256").update(payload!, "ascii").digest("hex"));
  });
  it("migrates the one supported historical schema through the same profile migration", async () => {
    const schema1 = { schemaVersion: 1, activeThemeId: "eco-guardian", contentSchemaVersion: 1, selectedCharacterId: "character.starter", unlockedCharacterIds: ["character.starter"] };
    const first = await decodeProfile(pack(schema1));
    expect(first.sourceSchemaVersion).toBe(1); expect(first.profile).toEqual(initial());
    expect(first.profile.settings.difficulty).toBe("normal"); expect(first.warnings).toEqual(["Migrated schema 1 profile; new statistics and settings use defaults."]);
    expect(await decodeProfile(pack(schema1))).toEqual(first);
  });
  it("preserves unavailable IDs and selected references without importing theme copy", async () => {
    const profile = { ...initial(), activeThemeId: "future.theme", selectedCharacterId: "character.future", unlockedCharacterIds: ["character.future"],
      unlockedWeaponIds: ["weapon.future"], unlockedUpgradeIds: ["upgrade.future"] };
    expect((await decodeProfile(await encodeProfile(profile))).profile).toEqual(profile);
  });
  it("accepts CRLF and one optional terminal newline, but not extra lines", async () => {
    const code = await encodeProfile(initial());
    expect((await decodeProfile(`${code.replace(/\n/g, "\r\n")}\r\n`)).profile).toEqual(initial());
    await expect(decodeProfile(`${code}\n\n`)).rejects.toThrow("three lines");
    await expect(decodeProfile(`\n${code}`)).rejects.toThrow("three lines");
  });
  it.each(["", "ARENA-SURVIVOR-SAVE:1", "a\nb", "a\nb\nc\nd"])("rejects malformed or truncated envelope %j", async (code) => {
    await expect(decodeProfile(code)).rejects.toThrow("three lines");
  });
  it.each(["ARENA-SURVIVOR-SAVE:2", "ARENA-SURVIVOR-SAVE:0", "\uFEFFARENA-SURVIVOR-SAVE:1"])("rejects unsupported envelope header %s", async (header) => {
    await expect(decodeProfile(envelope("{}", header))).rejects.toThrow("envelope version");
  });
  it.each(["", "A", "e30=", "e30+", "e30/", "e3 0", "e3\r0"])("rejects malformed Base64URL %j", async (payload) => {
    await expect(decodeProfile(withPayload(payload))).rejects.toThrow("Base64URL");
  });
  it("rejects alternate pad bits even when their checksum is correct", async () => {
    // e30 and e31 decode to the same two bytes. Only e30 is canonical.
    await expect(decodeProfile(withPayload("e31"))).rejects.toThrow("noncanonical Base64URL");
  });
  it("rejects checksum mismatches and malformed checksum syntax", async () => {
    const code = await encodeProfile(initial()); const [header, payload, hash] = code.split("\n");
    await expect(decodeProfile(`${header}\n${payload}\n${hash![0] === "0" ? "1" : "0"}${hash!.slice(1)}`)).rejects.toThrow("checksum does not match");
    for (const invalid of [hash!.toUpperCase(), hash!.slice(1), `sha256:${hash}`, `${hash} `]) await expect(decodeProfile(`${header}\n${payload}\n${invalid}`)).rejects.toThrow("malformed checksum");
  });
  it.each([new Uint8Array([0xc0, 0xaf]), new Uint8Array([0xed, 0xa0, 0x80]), new Uint8Array([0xf0, 0x9f])])("rejects malformed UTF8 without replacement", async (bytes) => {
    await expect(decodeProfile(envelope(bytes))).rejects.toThrow("UTF-8 JSON");
  });
  it.each(["not JSON", "{} trailing", "{", "\uFEFF{}"])("rejects malformed JSON %j", async (text) => {
    await expect(decodeProfile(envelope(text))).rejects.toThrow("UTF-8 JSON");
  });
  it.each([null, [], 4, "profile", {}, { ...initial(), schemaVersion: 0 }, { ...initial(), schemaVersion: 3 }])("rejects unsupported profile shape/version %j", async (value) => {
    await expect(decodeProfile(pack(value))).rejects.toThrow("schema version");
  });
  it.each([-1, 1e16])("rejects out-of-range persisted numbers %s", async (bestDurationMs) => {
    await expect(decodeProfile(pack({ ...initial(), bestDurationMs }))).rejects.toThrow("invalid number");
  });
  it("rejects nonfinite numbers during export and parsed numeric overflow during import", async () => {
    for (const bestDurationMs of [NaN, Infinity, -Infinity]) await expect(encodeProfile({ ...initial(), bestDurationMs })).rejects.toThrow("invalid number");
    const raw = JSON.stringify(initial()).replace('"bestDurationMs":0', '"bestDurationMs":1e309');
    await expect(decodeProfile(envelope(raw))).rejects.toThrow("invalid number");
  });
  it("rejects duplicate IDs, locked selection and inconsistent aggregate cross references", async () => {
    for (const value of [
      { ...initial(), unlockedWeaponIds: ["weapon.starter", "weapon.starter"] },
      { ...initial(), selectedCharacterId: "character.locked" },
      { ...initial(), completedRuns: 1 },
      { ...initial(), statistics: { ...initial().statistics, bestKills: 1 } },
    ]) await expect(decodeProfile(pack(value))).rejects.toThrow("Invalid save:");
  });
  it("rejects forbidden prototype keys at any depth without prototype mutation", async () => {
    const base = JSON.stringify(initial());
    for (const key of ["__proto__", "constructor", "prototype"]) {
      const raw = base.replace('"upgrades":{}', `"upgrades":{"${key}":{}}`);
      await expect(decodeProfile(envelope(raw))).rejects.toThrow("unsafe key");
    }
    expect(Object.hasOwn(Object.prototype, "polluted")).toBe(false);
  });
  it("applies shared profile depth, ID length and collection limits", async () => {
    let deep: unknown = 0; for (let i = 0; i < PROFILE_LIMITS.depth + 2; i++) deep = { nested: deep };
    await expect(decodeProfile(pack({ ...initial(), deep }))).rejects.toThrow("deeply nested");
    await expect(decodeProfile(pack({ ...initial(), activeThemeId: "a".repeat(PROFILE_LIMITS.idLength + 1) }))).rejects.toThrow("stable ID");
    await expect(decodeProfile(pack({ ...initial(), unlockedWeaponIds: Array.from({ length: PROFILE_LIMITS.entries + 1 }, (_, i) => `weapon.${i}`) }))).rejects.toThrow("too many entries");
  });
  it("enforces envelope and decoded byte ceilings before parsing", async () => {
    await expect(decodeProfile("a".repeat(MAX_SAVE_CODE_BYTES + 1))).rejects.toThrow("too large");
    await expect(decodeProfile("é".repeat(MAX_SAVE_CODE_BYTES / 2 + 1))).rejects.toThrow("too large");
    await expect(decodeProfile(envelope(" ".repeat(PROFILE_LIMITS.textBytes + 1)))).rejects.toThrow("too large");
  });
  it("reports unavailable checksum support clearly", async () => {
    vi.stubGlobal("crypto", {});
    try { await expect(encodeProfile(initial())).rejects.toThrow("cannot calculate save checksums"); }
    finally { vi.unstubAllGlobals(); }
  });
  it("treats duplicate JSON object keys as standard JSON data and emits canonical output", async () => {
    // Duplicate object keys follow JSON.parse's last-value rule. Duplicate stable
    // IDs in arrays remain rejected by the shared semantic validator.
    const raw = JSON.stringify(initial()).replace('"completedRuns":0', '"completedRuns":1,"completedRuns":0');
    const decoded = await decodeProfile(envelope(raw));
    expect(decoded.profile).toEqual(initial()); expect(await encodeProfile(decoded.profile)).toBe(await encodeProfile(initial()));
  });
});
