> Historical evidence at its recorded revision/date. Old “current”, “next” and
> unchecked gates below are not the live work queue. See [current status](../BUILD_STATUS.md)
> and the remaining-work audit; later owner waivers/corrections supersede old status.

# C3 — additional shrine and run-local curses

Verified locally2026-10-20 (Australia/Sydney) from clean d113617 on existing
codex/v0.4.3. C3 is complete; C4 elite modifiers is next. Local delivery only.
The owner's temporary waiver of missing actual Safari, selected browser/OS and
older physical integrated-GPU checks remains waived/unverified, never passed.
Historical P5/P6 measurements and portable kit do not certify this changed source.

## Delivered

Both themes add one sixth scheduled shrine at86% authored progress: **Unmanaged
Dump / Shrine of Defiance**. Its existing world-multiplier effect adds1.2
Pollution/Chaos and multiplies the run's XP product by1.4. No direct enemy wave,
new actor type or special reward queue; indirect arrivals/health/damage/elite/XP
changes come from the existing world selector. Existing placement, named marker,
E/Space interaction, spent cue, guide and restart paths handle it. Activation is
voluntary and once per actor. Original five schedule entries remain unchanged.

Both themes also add a curse category with two one-time normal level-up choices:

| Stable ID | Eco / Knight | Authored pressure and reward |
| --- | --- | --- |
| curse.frenzy | Overflow Contract / Frenzy Pact | ×1.3 arrival product, ×1.2 XP product |
| curse.escalation | Contamination Pact / Doom Pact | +0.8 Pollution/Chaos, ×1.25 XP product |

Theme `curses.ts` owns definitions and referring upgrade offers. `curse.accept`
resolves a known definition into the existing world products and records its
stable ID once. Accepted IDs are run-local serialized data, separate from shrine
activations and existing selected/tallied upgrade IDs. No actor/timer/queue or
profile/storage/migration is added. Curses last until restart/run end, not across
runs. Duplicate/stale acceptance consumes no pending choice; choice and tally
commit once. Aliased stale history cannot bypass the accepted-ID guard.

Offers are unscaled world bargains, regardless of rolled quality. Manifest
validation requires finite non-negative Chaos, spawn product≥1, an actual
pressure increase, XP product>1, known/unique curse IDs and valid presentation.
Curse offers must be standalone one-time effects referencing known definitions.
The optional new shrine does not retroactively become required in the tiny
alternate fixture; both production themes remain complete, fixture curses empty.

Existing dangerous upgrades and Fragmentation stay unchanged. This bounded C3
delivers these choices rather than every illustrative PLAN example; Blood Altar/
forced-legendary encounters, knowledge questions, bosses, persistence and sprites
remain outside this slice. No enemy tuning, rate0.5, exact XP/source claims,
causal budgets/caps or Phaser shutdown ownership change.

## Reproduced readability correction

Screenshots show that the existing card's three-line limit hides the second
curse's numeric XP reward behind Chaos/arrival/health changes. Reorder only
curse world descriptions to show resolved XP, Chaos and arrival changes first;
keep all remaining lines and every other upgrade's order. No UI layout or
simulated values change. Deterministic and actual rendered-text assertions now
require the visible numeric reward, with final both-theme screenshots reviewed.

After accepting arrival pressure, the second card correctly previews XP×1.2→1.8:
its XP product becomes1.2×1.25, then the existing +0.8 Chaos XP curve adds×1.2.
A first follow-up browser assertion expected1.5 and failed in both themes; it
omitted that existing curve. Correct the fixture and add deterministic composed
preview coverage; do not change runtime coefficients to satisfy that assertion.

## Verification

Final **547 units/61files**, typecheck, lint, production build and diff check pass.
Twenty new deterministic cases cover both themes' schedule/guide, immutable
exact-once acceptance, composition and separate IDs, offer/cap/tier/stale choice/
tally rules, visible preview ordering and combined XP, paused/terminal refusal,
missing registry, serialization/reset, fractional XP and invalid references/
pressure/rewards, plus an explicit immutable simulator world. Reverse multiplication
order differs at IEEE precision (~9e-16); assertions compare within tolerance,
without rounding or rewriting gameplay rewards. Old tests now include the empty
accepted-ID baseline, optional new shrine roster and curse tier exclusion.

Browser checks are all serial/one worker/zero automatic retries:

- Initial **seven pass in40.098s**, within150s declared bound. Five existing cases
  verify double Multiplicity, all shrine roles/retained Duplication, world restart,
  actual shortened six-shrine arrivals/placement and guide contents. The all-role
  scenario now expects Chaos5.4, reflecting the new shrine; restart uses80ms input.
- Initial new cases also pass, but visual review finds the hidden XP reward.
  After the selector correction, two follow-up cases fail only the incorrect
  ×1.5 fixture expectation (982/874ms; no retry). Preserve those attempts.
- Corrected final two cases **pass12.4s**, within90s declared bound. Seven unique
  affected cases are verified cumulatively, not eleven distinct cases or a single
  full-app pass. Final source hashes match the corrected C3 cases; the five older
  cases predate only curse description ordering and its test correction.

Each C3 case collects real XP into seeded eligible offers, chooses both curses
with80ms keyboard holds, and retains both selected names in its upgrade tally.
The fixture advances to258,000simulated ms, lets the actual arrival scheduler
create six actors, then positions the player near the new shrine and activates
with E. Repeated E does not change world state again. This scripted clock/travel
is distinct from the existing naturally advancing shortened-arrival case.

Combined world is Chaos3, arrival product1.3, XP product2.1; resolved arrival
pressure1.95 and XP3.15 at that moment. A raw0.375 pickup tagged
shrine.spawn_surge awards1.18125 (observed1.1812500000000004), with zero additional
credit on a second collection. That source tag is retained; it is a seeded
fractional pickup probe, not proof of an unassisted shrine kill/reward run.
Pause/1000×700 resize preserves state. Brief active play requests300 mixed actors;
final snapshots show278eco/300knight within cap300, backlog0, elapsed259,037/
259,523ms. No sampled peak/continuous throughput claim. Restart restores baseline
products/accepted IDs/picks and reschedules absent shrines.

Fixture aids: noAmbient/noContact/noHazards, scripted clock/travel/spawn/XP,
seeded offer randomness, XP cap during load, muted/no audio driver and initial
zero simulation delta until the affected active interval. No native visibility,
survival, audio-release, authored-duration or performance/hardware acceptance.
Actual browser.version Chromium151.0.7922.34, ANGLE Vulkan SwiftShader WebGL,
test/Normal/rate0.5, initial1600×900FIT at1280×720/DPR1. Pause/load screenshots
follow a1000×700 viewport request; no separate final canvas-size measurement.
OS uname Darwin25.5.0 arm64; M5Pro/48GiB retained prior inventory. Desktop Windows
UA is not physical Windows coverage. Images stay under testInfo.outputPath;
offer/shrine/pause visuals reviewed, final reward-row images checked in both themes.

[C3_RESULTS.json](C3_RESULTS.json) retains attempts, raw observations and exact
source/tree/build/image hashes. No new production test hook. Compiled JS/entry
HTML excludes C3/C1 fixtures, telemetry global and alternate fixture. No repeated
startup/production browser guard; those failure boundaries did not change.

## Balance, scope and delivery

`npm run balance -- --theme <eco-guardian|knight-magic> --build all --difficulty all
--ttk [--world c3]` runs120 coarse scenarios:60 baseline and60 with the new shrine
and both curses applied at start. **Baseline raw output matches C2 exactly.**
The C3 fixture is a pressure/reward composition band with no travel, offer
frequency or survival model; existing movement/overkill/build/tier limitations
remain. Full raw output and rounded summaries: [C3_BALANCE.json](C3_BALANCE.json).
Normal C3 single/packed evolution bands end eco levels29/40,422/761kills,
1598/4420printed XP; knight23/40,204/688kills,771/4562XP. All peak estimates≤300.
These model rewards are not a promise of attainable human survival/build power;
no global retuning or additional features follow them.

Full regression/stress/native/long/startup campaigns deferred under resource
policy. Missing external compatibility checks remain temporarily waived and
unverified. The changed-source portable kit is stale until regenerated for a
later selected device check. Known Phaser chunk warning remains (~1.625MB
minified/379.31kB gzip); no dependency change or audit rerun.
Owned browsers/servers closed;4173 no listener, unknowns/review4213 untouched.
PR26 remains merged2806720 as c6daeb6;39189877476 succeeds only2806720, no later
matching-head CI claim. No push/PR/merge/deploy/workflow dispatch.

Implementation/tests/checklist/status/reconciliation/progress/master belong to
one reviewed local C3 commit. [Completed C4 record](../MASTER_BUILD_PLAN.md#v0-4-3-c4) retains the successor result.
