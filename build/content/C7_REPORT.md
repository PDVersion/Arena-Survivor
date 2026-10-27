> Historical evidence at its recorded revision/date. Old “current”, “next” and
> unchecked gates below are not the live work queue. See [current status](../BUILD_STATUS.md)
> and the remaining-work audit; later owner waivers/corrections supersede old status.

# C7 — portable saves and explicit recovery / 2026-10-20

Verified local phase on `codex/v0.4.3` from C6 `0776c95`. C4 `b0ff7e9`, C5
`5da2ed3` and C6 were verified and committed before their successors started.
C7 codec, UI and replacement service were implemented in parallel after that
gate. No push, PR, merge, deployment or workflow dispatch. Remote run39189877476
still covers2806720 only, not these local phases.

Title Settings → Manage Save provides text-file download, copyable code, file or
paste import, preview, explicit confirmation, backup restore and reset. The title
still has exactly three actions. Native dialog focus and disabled canvas controls
prevent editing from starting a run. Theme-owned copy/palette covers both packs;
candidate strings use textContent. Close/shutdown releases the dialog and owned
download URLs; there are no new wall timers or global listeners. Denied clipboard
access leaves the complete selected code for manual copying.

The exact three-line envelope is ARENA-SURVIVOR-SAVE:1, unpadded Base64URL of
canonical UTF-8 JSON, then bare64lowercasehex SHA-256 of the encoded payload line.
Object keys sort recursively; arrays retain order. CRLF and one final newline are
accepted on import. The350KiB envelope and256KiB decoded/profile bounds precede
decoding/validation; shared schema2 validation/migration owns depth12,512entries,
128character IDs and finite numeric ranges. Unsafe keys, malformed encoding/pad
bits/UTF-8/BOM/JSON, checksum failures and unsupported versions are rejected.
Duplicate ID lists fail; JSON duplicate object keys use standard last-value parse
semantics, explicitly tested and then strictly validated. No dependency, encryption
or anti-cheat mechanism is introduced.

Preview candidates are validated, cloned and frozen. Cancellation performs no
writes. Confirmation rejects stale local revisions and changed stored bytes,
writes a recoverable valid backup, replaces the current key once, then hydrates
memory/settings/statistics and publishes. localStorage has no multi-key transaction
or atomic cross-tab compare-and-swap. A failed current write can refresh the valid
backup but does not replace current progress or memory. Storage denial blocks
replacement while allowing export of the existing in-memory profile.

Review reproduced a data-loss path when another tab saved before preview: the
old implementation would snapshot those new bytes but back up stale memory.
Preparation now rejects bytes differing from the service cache. Confirmation also
checks changes after preview. Ordinary settings/terminal saves use the same guard,
retaining local changes in memory with a themed reload warning rather than
overwriting the other tab. Deterministic regressions cover both timing windows.

Explicit corrupt-source recovery quarantines the original bytes separately and
retains an existing valid backup; otherwise it backs up the validated memory
snapshot. Backup/reset each require their own preview and confirmation. Unknown
well-formed IDs survive unchanged with availability warnings; unavailable character
selection falls back only at runtime. Schema1 migration remains pure and supplies
deterministic schema2 defaults. Only implemented persistent profile fields travel;
no active-run objects, suspension, new progression system or optional content.

## Executed checks and evidence

- Typecheck, all655units/67files, lint, production build and diff --check pass.
  Sixty new deterministic cases:45codec and15replacement/failure tests.
- Five unique affected Chromium browser cases pass once in4.4s, one worker,
  zero automatic retries,30s per case/180s global bound. No page errors.
  Exported945byte file equals textarea and actual clipboard; denial collaborator
  selects equivalent manual code. Enter stays on menu; title retains three actions.
  Both themes give identical file/paste previews, cancel unchanged, confirm with
  exact backup, then reload the complete candidate including unknown weapon ID.
  Invalid/truncated/checksum/future/oversized input preserves both saved copies.
  Restore/reset are separately confirmed and keep a recoverable prior profile.
- Production marker exclusion passes across8emitted HTML/JS files, including
  C7 fixture marker exclusion. Existing Phaser chunk advisory remains:
  start-game1642.10kB minified/384.43kB gzip. No performance improvement claim.

Raw JSON, exported-text/source/compiled/image hashes and command metadata are
preserved in [C7_RESULTS.json](C7_RESULTS.json). Images/downloads remain under
testInfo.outputPath in test-results/c7-final. Both-theme preview screenshots were
visually reviewed and are readable with internal dialog scrolling; lower warnings
and confirmation require scrolling and were exercised by actual controls. The
export image is after the keyboard guard edits the selected code; exact export
equality is established by the retained download and assertions, not that image.
No cosmetic screenshot rerun was made.

Actual Chromium151.0.7922.34/test mode,1280×720/DPR1, title resized900×650;
title renderer SwiftShader Vulkan WebGL on retained M5Pro/48GiB/Darwin host.
Windows UA is preset metadata, not physical Windows evidence. Other cases instantiate
the actual native DOM dialog/service with each theme on an isolated test page;
they do not establish GPU behavior. Clipboard denial uses an explicit collaborator,
not native permission evidence. No native visibility, audio, heap, survival, long
soak, full-app/stress, production-throughput or older-device acceptance is claimed.

One initial codec unit used a CR-at-line-end fixture that was valid CRLF; its
assertion was corrected to an embedded CR (44/45 then45/45). The first combined
typecheck caught a test-only textarea type cast; corrected before browser launch.
No browser case failed or retried. Balance/audit were not repeated: C7 changes no
pacing or dependencies. Unchanged broad startup/production browsers and full/stress/
native/long campaigns remain deferred under the resource policy. Missing actual
Safari/browser-OS/older physical-device checks remain temporarily waived and
unverified. Prior P5/P6 measurements/device pack remain source-bound and need
regeneration before later current-source device evidence.

Owned browsers/server resources are cleaned;4173 has no listener, review4213 and
unknown processes were untouched. No gameplay rate, XP ledger, physics teardown,
sprite/content/save authority outside this phase was changed. C1–C7 local gates
are complete; remaining delivery/acceptance decisions are in the successor handoff.
