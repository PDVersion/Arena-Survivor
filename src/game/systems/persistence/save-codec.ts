import { PROFILE_SCHEMA_VERSION, type ProfileState } from "../../state/profile-state";
import { migrateProfile, PROFILE_LIMITS, validateProfile } from "./profile-validation";

export const MAX_SAVE_CODE_BYTES = 350 * 1024;
const HEADER = "ARENA-SURVIVOR-SAVE:1";
const encoder = new TextEncoder();

function fail(message: string): never { throw new Error(`Invalid save code: ${message}`); }

/** Object key order is canonical; ordered loadouts/unlock lists retain array order. */
function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson((value as Record<string, unknown>)[key])}`).join(",")}}`;
  }
  const serialized = JSON.stringify(value);
  if (serialized === undefined) fail("unsupported profile value");
  return serialized;
}

function base64Url(bytes: Uint8Array): string {
  // Keep spread arguments bounded even at the maximum supported profile size.
  const chunks: string[] = [];
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    chunks.push(String.fromCharCode(...bytes.subarray(offset, offset + 0x8000)));
  }
  return btoa(chunks.join("")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function checksum(encodedPayload: string): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error("This browser cannot calculate save checksums.");
  const digest = await globalThis.crypto.subtle.digest("SHA-256", encoder.encode(encodedPayload));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Export and local storage share the same validated schema; no storage is accessed here. */
export async function encodeProfile(profile: ProfileState): Promise<string> {
  const validated = validateProfile(profile);
  const bytes = encoder.encode(canonicalJson(validated));
  if (bytes.length > PROFILE_LIMITS.textBytes) fail("profile is too large");
  const payload = base64Url(bytes);
  return `${HEADER}\n${payload}\n${await checksum(payload)}`;
}

export interface DecodedProfile {
  readonly profile: ProfileState;
  readonly warnings: readonly string[];
  readonly sourceSchemaVersion: number;
}

/** Decode, migrate and validate data only. Confirmation/backup/install belong to the service. */
export async function decodeProfile(text: string): Promise<DecodedProfile> {
  if (typeof text !== "string" || text.length > MAX_SAVE_CODE_BYTES || encoder.encode(text).length > MAX_SAVE_CODE_BYTES) fail("save text is too large");
  // Windows text-file line endings are equivalent. One terminal newline is harmless.
  const normalized = text.replace(/\r\n/g, "\n").replace(/\n$/, "");
  const lines = normalized.split("\n");
  if (lines.length !== 3) fail("expected exactly three lines");
  const [header, payload, suppliedChecksum] = lines;
  if (header !== HEADER) fail("unsupported envelope version or missing save header");
  if (!payload || !/^[A-Za-z0-9_-]+$/.test(payload) || payload.length % 4 === 1) fail("malformed Base64URL payload");
  if (Math.floor(payload.length * 3 / 4) > PROFILE_LIMITS.textBytes) fail("profile is too large");
  if (!suppliedChecksum || !/^[a-f0-9]{64}$/.test(suppliedChecksum)) fail("malformed checksum");
  if (await checksum(payload) !== suppliedChecksum) fail("checksum does not match; the save may be damaged");
  let bytes: Uint8Array;
  try {
    const binary = atob(payload.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - payload.length % 4) % 4));
    bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch { return fail("malformed Base64URL payload"); }
  if (bytes.length > PROFILE_LIMITS.textBytes) fail("profile is too large");
  if (base64Url(bytes) !== payload) fail("noncanonical Base64URL payload");
  let parsed: unknown;
  try {
    // Preserve a BOM so JSON.parse rejects it; malformed UTF-8 never becomes replacement text.
    parsed = JSON.parse(new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes));
  } catch { return fail("payload must contain valid UTF-8 JSON"); }
  const sourceSchemaVersion = parsed && typeof parsed === "object" ? (parsed as { schemaVersion?: unknown }).schemaVersion : undefined;
  if (sourceSchemaVersion !== 1 && sourceSchemaVersion !== PROFILE_SCHEMA_VERSION) fail("unsupported profile schema version");
  const { profile, warnings } = migrateProfile(parsed);
  return Object.freeze({ profile, warnings: Object.freeze([...warnings]), sourceSchemaVersion });
}
