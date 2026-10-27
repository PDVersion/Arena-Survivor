# Portable Save Data Plan

Arena Survivor will keep local browser progress while also allowing the complete persistent save to be exported as encoded text and restored by importing a text file or pasting the save code. This is a portability and player-control feature, not encryption or anti-cheat.

V0.4.3 C6 implements browser-local profiles, settings, terminal-only lifetime records and theme-owned unlocks. C7 implements the portable format and title-screen Settings → Manage Save flow below. Current schema2 includes every implemented persistent field; future currencies, achievements, suspended runs and additional unlock categories remain unimplemented. They require a later versioned schema rather than silently accepted extra fields.

## Player experience

Export:

1. The player selects **Export Save**.
2. The game serializes every persistent profile field into a versioned payload.
3. The player can download `arena-survivor-save.txt` and/or copy the same encoded text to the clipboard.
4. Export does not alter the active local save.

Import:

1. The player selects a `.txt` file or pastes an encoded save string.
2. The game decodes, migrates, and validates it without touching current progress.
3. A preview summarizes the imported profile, unlock count, progress, and important warnings.
4. After explicit confirmation, the game backs up the current save and atomically installs the imported save.
5. If any step fails, the current save remains unchanged and the player receives a useful error.

This enables backup, transfer between browsers/devices, restoration, and deliberate adjustment of progress or unlocks. Because this is a single-player game, imported data is not cryptographically signed. Advanced players or development tools may decode, edit, validate, and re-encode it; invalid or unsafe values are still rejected or normalized.

## Save contents

The payload represents all persistent data, including fields introduced in later versions:

- save schema version and originating game version;
- active theme ID and theme/content schema version;
- unlocked characters, weapons, skills, upgrades, shrines, modes, and other content by stable ID;
- progression, currencies/resources, achievements, milestones, and completed challenges;
- lifetime and best-run statistics;
- player preferences/settings that are intended to travel with the profile;
- timestamps and migration metadata;
- optional suspended-run data if run suspension is added later.

Transient runtime objects—Phaser instances, physics bodies, callbacks, timers, DOM nodes, and rendered effects—are never saved. A suspended run, if supported, stores reconstructable data such as stable content IDs, seed, elapsed time, stats/modifiers, and scheduled events.

## Implemented text envelope (V0.4.3 C7)

The format is a UTF-8 text envelope containing a Base64URL-encoded, canonical JSON payload plus an integrity checksum:

```text
ARENA-SURVIVOR-SAVE:1
<base64url-encoded canonical JSON>
<64 lowercase hexadecimal SHA-256 characters of the encoded payload line>
```

- Encoding is reversible and is not encryption.
- The envelope version identifies how to decode the text; the payload schema version identifies how to migrate the data.
- Canonical serialization sorts object keys recursively and preserves array order. Base64URL is unpadded. Exports contain exactly three lines and no terminal newline; imports also accept CRLF and one terminal newline.
- The checksum catches truncation and accidental corruption. It is not intended to prevent intentional edits.
- Native Web Crypto computes SHA-256 over the ASCII encoded-payload line. The checksum is integrity checking, not a signature.
- The envelope is limited to350KiB before decoding and the decoded profile to256KiB UTF-8. Schema validation caps depth12, each collection512entries, stable IDs128characters and nonnegative finite numeric totals at1e15 (integer counters). Lifetime aggregates saturate there without altering actual run damage or XP.
- Malformed Base64URL/padding bits, invalid UTF-8/BOM/JSON, checksum mismatch, future envelope/schema, unsafe keys, invalid settings/references and duplicate stable-ID lists are rejected. JSON object duplicate keys follow standard JSON.parse last-value semantics; the resulting object still undergoes strict validation.

## Planned state boundary

```text
Gameplay systems
      ↓ explicit events/results
Serializable profile model
      ↓ schema validation + canonical serialization
Browser persistence adapter (localStorage initially)
      ↓ same validated payload
Text export/import codec
```

Gameplay code does not read/write local storage or files directly. A persistence service owns storage, migration, backup, export, and import. The browser adapter and text codec operate on the same validated profile model so local and portable saves cannot drift into separate formats.

## Compatibility and theme rules

- Store stable, theme-neutral IDs—not display names—as required by [`THEME_ARCHETYPES.md`](./THEME_ARCHETYPES.md).
- Store the theme/content version so renamed or remapped content can migrate safely.
- A display-name change requires no save migration.
- When a valid save references content unavailable in the current build/theme, preserve the unknown IDs where possible, warn in the preview, and disable only the unavailable selection. Do not silently convert it to unrelated content.
- Migrations are ordered, pure transformations from one schema version to the next and have fixture tests.
- Never overwrite the only known-good save until decode, migration, validation, and backup all succeed.

## Validation and safety

Import is untrusted input even though the game is single-player.

- Apply a strict file/text size limit before decoding.
- Parse data only; never evaluate imported text as code.
- Validate object shape, allowed keys, finite numbers, ranges, collection sizes, unique IDs, and cross-references.
- Reject unsupported future envelope/schema versions with a clear message.
- Migrate supported older versions before semantic validation.
- Reject checksum failures unless a deliberate advanced recovery flow is provided later.
- Prevent prototype-pollution keys and excessive nesting.
- Maintain a recoverable last-known-good backup and provide a reset-to-new-profile option.

## Verification required when implemented

Unit tests:

- current profile round-trips through encode/decode without loss;
- the same profile produces deterministic canonical output;
- every supported historical fixture migrates to the current schema;
- malformed, oversized, truncated, wrong-checksum, non-finite, out-of-range, duplicate, and unknown-reference cases follow documented behaviour;
- current save remains untouched after every failed import;
- stable IDs survive theme display-name changes.

Browser tests:

- exporting produces a `.txt` file and copyable equivalent code;
- importing by both file and paste shows the same preview;
- confirmation replaces the profile and creates a backup;
- cancellation and invalid imports preserve current progress;
- a page reload restores the imported profile.

## Implementation acceptance

The feature is complete when a player can export all persistent progress, clear or change browsers, import the text save, and recover the same validated profile, statistics, progress, unlocks, and settings without server infrastructure.

## C7 replacement and recovery boundary

The native save dialog is available only from title Settings. Gameplay controls are disabled while it is open. File and paste use the same decoder and preview; imported text is never rendered as markup. Import, restore-backup and reset each need a separate confirmation. Closing or cancelling the preview makes no save writes. Clipboard denial leaves selectable code for manual copying; export never changes progress.

The service validates and freezes a candidate before preview, then rejects stale local revisions or changed stored bytes before confirmation. Ordinary settings/terminal writes also preserve a newer save from another tab and warn that this tab is using memory. Reload is required to adopt externally changed storage. These are compare-before-write checks, not a cross-tab atomic compare-and-swap.

Confirmation writes a validated backup before one atomic current-key replacement, then hydrates memory/settings/statistics and publishes the installed profile. localStorage has no multi-key transaction: a failed current write may have refreshed the recoverable backup, but current progress remains unchanged. Storage denial/quota errors do not install a memory-only replacement; export of existing memory progress remains available.

Explicit recovery of corrupt current storage first preserves those bytes under `arena-survivor.profile.quarantine`. An existing valid backup is retained. If no usable backup exists, the validated memory snapshot becomes the backup before installation. No corrupt bytes are promoted to the good backup. Unknown well-formed IDs survive import/export and preview warnings; unavailable character selections fall back only at runtime. Schema1 identity migrates purely to schema2 with deterministic defaults and a migration warning.

## Q1 difficulty setting seam

Session settings now include the stable `difficulty` value `beginner`, `normal`
or `experienced`, defaulting to `normal`. Active run state snapshots this ID at
creation; changing the session selection affects the next run. No storage adapter
or migration is introduced here. Future profile/import validation must allow
only those IDs and supply `normal` for older settings without the field, while
retaining the ordinary backup/confirmation requirements above.

## V0.4.3 C6 implementation checkpoint /2026-10-20

Browser-local schema2 now retains six settings, terminal-only lifetime statistics,
completed/death counts, longest run and stable identity/unlock IDs. Both themes
unlock the existing secondary tool after one finished run and bloodlust after25
finished-run kills, affecting the next run only. These are the planned mechanical
content unlocks, distinct from exploratory educational cosmetic feats. No permanent
stat bonus, active-run suspension, sprite or new factual content is added.
Corrupt storage is preserved; denied/quota storage falls back to memory with visible
warnings. Schema1 migration is deterministic. C7 portable export/import/preview/
explicit backup recovery remains next; use the same validated profile model.

## G2A compatibility note — 2026-10-22

New neutral enemy ID `enemy.cluster_fodder` adds content only. No existing ID,
schema2 field, profile adapter, unlock or discovery record is changed. Current
portable unknown-ID preservation remains; no migration is required for this
addition. G2A reruns affected profile/codec/replacement units as part of its278
unit gate. This does not imply implementation of saved discoveries or new fields.

## G2B compatibility — 2026-10-22

`enemy.gust_drifter` is an additive content ID with actor-local transient motion.
No saved ID remap, schema/field/migration/profile/unlock/discovery change. Existing
unknown-ID portable round trips still pass in the affected persistence suite.

## G2C compatibility / complete roster — 2026-10-22

`enemy.committed_charger` is additive content, with fresh actor-local transient
motion; no field/schema/profile/migration/import/export/unlock/discovery change.
Existing IDs and unknown-ID round trips retain their meanings. Final686unit suite
includes current persistence compatibility; no saved discovery system is implied.

## G4 compatibility — 2026-10-22

`RunStatistics.damageByWeapon` is transient run-local actual direct/splash damage.
Session/profile folding still selects existing aggregate fields explicitly; no
per-tool map enters schema2, exports, import previews or backups. No stable ID,
unlock rule, setting, adapter, migration or discovery field changes. Results use
the already-folded current profile for advice, and redraw/tab/resize/guide reads
never fold/grant/write. Reset clears the map. Existing persistence/portable-save/
replacement/unknown-ID units pass; browser fixtures demonstrate one terminal fold,
read-only redraws, exact memory-adapter reload and restart. No portable save UI
changed, so a new import/export browser campaign was not needed.


## Additive attack-guide preference — 2026-10-23

Schema2 settings now permit optional boolean showAttackRadius. Absent historical
schema2 values hydrate false through createSettings; schema1 migration inherits
that default. Present nonboolean values reject before hydration/storage replacement.
New profiles/settings writes/export include the boolean; the current canonical
codec round-trips it. Other unknown settings still reject and all prior required
settings remain required. No schema bump, adapter or stable-ID change. Earlier
strict binaries may reject exports containing the new setting; downgrade import
compatibility is not promised. Quitting to menu does not call finished-run folding
or grant finish-based unlocks; existing profile/settings remain authoritative.

## Optional ranged content —2026-10-23

`enemy.ranged_attacker` is an additive eco enemy ID with transient actor/shot state.
No persistent field, schema2 adapter/migration, unlock, discovery or import/export
change. Existing unknown-ID preservation remains; current full persistence units
pass. Frozen knight content does not acquire the new optional role.

## Owner-selected money and cleanup expansion —2026-10-27

[V0.4.5](BUILD_PLAN_V0.4.5.md) selects money as run leveling, separate saved Impact
and shop, rare magnet/food/Impact drops affected by Fortune, aura vacuum/bin/orbit
rakes, detrimental material fragmentation, opening Cigarette Butts, late natural
Microplastics, fleeing litter-carrying rat, real active-wall run clock, and an
isolated testing area with interactive equipment trees and currency editors.
Stable historical experience/statistic IDs retain their meaning as earned run
progress; schema3 adds Impact/shop with explicit migration. Game rewards are
fiction, not a claim that all waste qualifies for a real container refund.
Knights and Magic remains paused; no new educational disposal claims.


V0.4.5 implemented locally: `ProfileState.economy = { impact, upgrades }`, schema3.
`impact` is a nonnegative bounded integer; shop upgrades are stable string IDs
with bounded integer levels, unknown IDs preserved but not applied. Schema2 adds
empty economy; schema1 uses its existing migration into current defaults. Shop
purchases/save import/export/backup use the existing profile validation/storage
adapter. Old run XP/stat IDs remain unchanged; money is run-local. Impact pickup
credits save immediately; new-run bonuses read only known shop definitions and
clamp to authored caps. Testing area initializes its own memory adapter before
constructing the arena; its currency/shop/editor/reset never writes the normal
profile. Normal outside-run shop uses the real adapter. See REC-133–135 and the
[V0.4.5 report](content/MONEY_TOOLS_SANDBOX_REPORT.md).
