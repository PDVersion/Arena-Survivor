> Historical evidence at its recorded revision/date. Old “current”, “next” and
> unchecked gates below are not the live work queue. See [current status](../BUILD_STATUS.md)
> and the remaining-work audit; later owner waivers/corrections supersede old status.

# G4 — useful run reviews and optional mastery reference

Local gate accepted 2026-10-22. Branch `codex/readable-gameplay-g4`, from verified
G3 `d8ae891`. The owner requested G4. Exact ownership and prompt self-review were
recorded in [BUILD_PLAN_G4](../MASTER_BUILD_PLAN.md#readable-gameplay-g4) before code; the completed slice
is consolidated in [the master](../MASTER_BUILD_PLAN.md#readable-gameplay-g4).
This report's owning commit is the final phase source, not a main merge.

## Result

Keep G4. Results default to tool contributions, accepted optional site/curse
pressure and one attainable next experiment. Details retains the existing
metrics, damage ledger and bounded upgrade tally. Click or Tab switches pages;
R/Enter restarts. Both themes have complete validated labels and advice.
Death text uses the actual elapsed final-hit time: overtime at6:34 remains6:34,
not0:00. Existing dead/complete/clearing headings remain authoritative; the
recorded final-boss flag can show an achievement beside a later endless death.
A single final-hit source does not explain the cause of the whole failed run.

Damage contribution enters at the existing health-clamped committed-damage seam,
after defeated/duplicate guards. Direct and splash carry their originating weapon
ID; critical/pierce portions belong to that same applied hit, not extra damage.
Base and evolved tools display separately under their actual names. Other skill/
unattributed effects are the remainder of the existing total. No kill attribution
or new total is inferred from equipment, requests or pending causal work.
`damageByWeapon` is transient only; session/profile folding still explicitly
selects old aggregate fields. Reset creates a fresh empty map. Schema2, stable
IDs, import/export/recovery, unlocks, settings and terminal fold ownership stay.

The current profile after its terminal fold determines whether to suggest looking
for the second-tool equip choice. Owned picks lead to the existing four-pick
evolution path; ready/evolved tools lead to its choice or an optional pressure/
recovery/comparison experiment. These are suggestions, not promised random
upgrade offers, natural acquisition timing or new permanent stat rewards.

The shared Info/pause Field Guide now exposes the existing ten-enemy catalogue,
one entry per page, with description, material relations and difficulty-resolved
health/speed/contact harm. Values are explicitly game values, rounded only for
display to two decimals; live time/world/elite modifiers are not represented as
catalogue base values. Previous/Next or PgUp/PgDn page; existing arrows/Tab switch
sections. The capability section reads progress toward the existing one-finished-
attempt and25-lifetime-kills unlocks. Viewing never grants, folds or writes.
No saved discoveries, precise environmental facts, Australian ranking or handling/
disposal surface was selected. Existing descriptive copy is reused without a new
factual review. There is no quiz, reading gate, extra economy, art or balance change.

## Verification

- Final focused suite: **283 tests /25 files**, covering content, upgrades,
  statistics, UI selectors, codex, persistence, architecture, weapons and run-state.
- Final full unit suite: **703 tests /74 files**. Both-theme pure tests cover
  direct/splash/evolved/skill partitions, zero damage, immutable read-only review,
  resets, existing durable aggregates, owned-pick advice, unlock progress, unknown
  saved IDs and required copy. Existing persistence/replacement/import/export and
  terminal suites pass. Added final-hit elapsed/overtime and completion-no-cause
  assertions. No persistence or save-manager UI changed; its browser campaign
  was not repeated.
- Final types and lint pass without warnings. Production build passes,147modules,
  largest chunk1,656.42kB /388.80kB gzip; the existing size advisory persists.
  Whole-phase/staged whitespace is checked before commit. No dependencies change.
- **Five final browser cases pass together /4.3s**, Chromium151.0.7922.34,
 1worker, zero retries. Four owned Canvas RunScene fixtures cover both themes ×
  Default /Low+reduced-motion; fifth uses ordinary title Info entry/exit. All ten
  enemy pages fit above navigation in all four fixtures. Keyboard paging has one
  listener during guide display and none after hide. Browser default scrolling
  is suppressed only while paging owns the input. Results pointer/keyboard tabs,
 1000×700 resize, terminal repeat/redraw, exact memory-adapter reload and real scene
  restart pass; profile folds once, remains unchanged on reads, omits the tool map
  and retains secondary availability after restart. No page errors in owned cases.
- [G4_BALANCE](G4_BALANCE.json) captures the existing120baseline/C3ambient cases
  through the existing G2 capture entry point after final runtime edits. The full
  `.cases` array is exactly equal to [G3_AFTER](G3_AFTER.json), including the
  existing108applicable and12parked diagnostic cases. Weapon/unlock/tuning/enemy/
  shrine/difficulty/ID/persistence sources are unchanged against G3; no new build
  or unlock mechanic requires a new scenario. Capture metadata and final source
  digests are separate from numerical equality. No new natural pacing claim.
- [G4_CHECKS](G4_CHECKS.json) records results, [G4_SOURCES](G4_SOURCES.json) binds
  source/capture/compiled/browser artifacts by SHA256. All14final screenshots
  were inspected: review/guide/resized Details in each owned case, and title
  enemies/capabilities. Final screenshots show readable numbers and reachable
  navigation/restart. Owned games are destroyed in fixture cleanup; Playwright
  contexts/server exit and port4173 has no remaining listener.

## Aids, corrections and limits

The four owned fixtures disable update simulation, pause physics, use Canvas and
no audio, and script target positions, terminal clocks/status/flags, pending choice
availability and build acquisition. Actual attacks/health clamping/duplicate-lethal
attempt/causal processing, choice application, terminal coordinator, overlay inputs,
profile service and scene restart execute real methods. Ordinary title input runs
the live app; its screenshot and existing telemetry verify entry/exit and read-only
storage, while section contents/layout are asserted by the owned fixtures. The
background HUD stays stale in frozen fixtures; it is not used as elapsed-time
proof. A scripted final-boss flag proves result wording, not a natural boss victory.
Memory-adapter reload proves profile round-trip, not a new native save UI campaign.

Initial paging checks failed because Phaser events use PAGE_UP/PAGE_DOWN, not
PAGEUP/PAGEDOWN. After fixing those, immediate frame-consumed click assertions and
the host page's default PageDown scrolling exposed input timing/ownership gaps.
Polling actual input delivery and preventing the owned paging default fixed them;
Tab switching was also checked. A supplemental title test then assumed an absent
Phaser.GAMES global: it was replaced with public canvas input/telemetry rather than
adding a production diagnostic API. A visual pass found floating decimal tails;
display rounding and a bounded numeric-text assertion fixed that. Early lint had
two unused suppressions, removed. A local optional image-contact-sheet helper
could not import PIL; direct image inspection was used. These failed attempts
are not passing evidence; the final five-case run uses the corrected source.

This is bounded UI/state verification, not natural survival, first-run/offer
frequency, educational retention, full WebGL/stress/soak or device acceptance.
The ambient model still omits movement, incoming harm, travel, offers, overkill,
children, elites, milestone waves, bosses and causal queues; C3 pressure is applied
at the start. Broad local regression/stress/soak remains deferred under the owner
resource budget. Actual Safari/missing browser-OS/older physical integrated-GPU
checks remain temporarily waived and unverified. No new remote CI or publication.

## Completion and next work

G1–G4 are locally complete. G4's session prompt is retired after this durable
record. [Sprite reconciliation](../SPRITE_PLAN_V0.4.4.md#settled-roster-checkpoint-after-g4--2026-10-22)
records current IDs/subjects/bodies/presentation and unresolved art frame choices;
no manifest claim, sprite generation or pipeline edit occurred. The
[next handoff](../NEXT_READABLE_GAMEPLAY_HANDOFF.md) preserves delivery and art
selection gates. No new phase begins automatically.
