# Portable Save Data Plan

Arena Survivor will keep local browser progress while also allowing the complete persistent save to be exported as encoded text and restored by importing a text file or pasting the save code. This is a portability and player-control feature, not encryption or anti-cheat.

The export/import UI is planned with the unlock/progression systems in V0.4. Completed V0.1 established stable IDs, schema-versioned profile state, and a serializable runtime boundary. Completed V0.2 preserved those constraints while adding statistics and modifiers. V0.3 introduces a serializable settings slice shaped for this document and leaves the persistence adapter as a marked seam; it does not implement persistence, codecs, migrations, or import/export UI.

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

## Proposed text envelope

The initial planned format is a UTF-8 text envelope containing a Base64URL-encoded, canonical JSON payload plus an integrity checksum:

```text
ARENA-SURVIVOR-SAVE:1
<base64url-encoded canonical JSON>
<checksum of the encoded payload>
```

- Encoding is reversible and is not encryption.
- The envelope version identifies how to decode the text; the payload schema version identifies how to migrate the data.
- Canonical serialization makes exports deterministic and checksums reproducible.
- The checksum catches truncation and accidental corruption. It is not intended to prevent intentional edits.
- Exact checksum algorithm and size limits will be selected during implementation and recorded in `RECONCILIATION.md`.

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
