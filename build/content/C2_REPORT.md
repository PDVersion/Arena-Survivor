# C2 — same-slot weapon evolution

Verified locally on2026-10-20 (Australia/Sydney), from clean10b7883 on existing
codex/v0.4.3. C2 is complete; C3 shrines/curses is next. Delivery stays local.

## Owner acceptance revision

The owner explicitly says “yes waive those checks for now and continue with
build for c2”. Outstanding actual Safari, missing selected desktop browser/OS
combinations and representative older physical integrated-GPU checks are
**temporarily waived/unverified**, never passed. This supersedes their previous
release-blocking classification for now. No older device is available and Safari
remote-automation access remains unconfirmed. Support evidence stays provisional;
this waiver creates no new device certification, campaign or publication.
Historical P5/P6 evidence and the portable kit remain tied to their frozen sources.
The kit must be regenerated if a later device check is selected.

## Delivered behavior

Acquire the second tool normally, then take its owned reach upgrade four times.
A new normal level-up choice can then replace Cleanup Vacuum with **Cyclone
Vacuum**, or Runic Fan with **Runic Tempest**. Earliest evolution is level7 if
the first six choices are used for acquisition/four reach picks/evolution; the
draw is weighted, so appearance at that level is not guaranteed. Tier quality
scales earned reach without substituting for actual pick count.

The new theme-owned definition replaces the source in the same ordered slot,
even when capacity is full. Preserve its next attack timestamp, other clocks,
slot capacity, shared modifiers, exact earned local gains and selected/tallied
upgrade history. Transfer local gains once to the new stable weapon ID; remove
the old modifier key and obsolete owner/acquisition/evolution offers. A stale
choice is a no-op and cannot consume pending XP choice credit. Restart restores
only the starting loadout/clocks/gains. Evolution grants no free attack or missed
attack replay. Existing launch-time projectile snapshots remain unchanged.

Both themes author9 damage,1200 simulation-ms cadence,105 base reach,1.5-radian
cone, four direct targets and32-radius splash at0.4 damage with three neighbours
per hit. Existing cone/disk/tie and non-recursive splash rules remain. The tool
has a distinct stable ID and primitive cone; no parallel delivery, paired-gear,
sprite, dependency or persistence system. Global bonuses remain shared. No XP,
reward provenance, cap, rate0.5, enemy tuning or Phaser teardown change.

Evolution is a standalone one-time unscaled choice. Manifest validation rejects
missing/same source and target, unattainable/non-integer/non-positive pick counts,
wrong/missing prerequisite ownership and mixed/repeatable acquisition effects.
The card previews actual old-to-new damage/cadence/reach, including earned gains;
pause rows name the evolved tool. Wider geometry/splash are described in theme
copy. No new environmental fact or material-effectiveness claim.

## Verification

Final typecheck, **527 units/60files**, lint, production build and diff check pass.
Eighteen new deterministic cases cover both themes' count-versus-tier condition,
full/reordered replacement, immutable state, independent clocks/no catch-up,
modifier/history carryover, serialization/reset, eligibility/idempotence/stale
choices, pending choice/tally, preview, authored caps/ties, validation and model
transition. Existing tier/description fixtures recognize unscaled evolution;
their other assertions remain intact. Initial typecheck found only missing test
parameter annotations and a union narrowing; lint found an inline type import.
Those are corrected. Two old max-level expectations needed evolution's0→1
choice convention rather than an already-equipped track's1→2 convention.

Browser checks use one worker, zero automatic retries, declared bounded runs:

- Initial eight affected cases: **7pass/1fixture failure in25.055s**, within the
  declared180s cap. Six existing cases cover second-tool acquisition/owner card/
  exact combat/reset, Default/Low short300-mixed load and both-theme independent
  clocks/in-flight ownership. The initial knight evolution also passes.
- Three eco targets are each ultimately killed directly, so the fixture's
  additional expectation of a splash kill is invalid. Add a fourth nearby target
  to both evolution probes; no runtime fix. Corrected two cases pass14.6s under
  a90s cap. Final review simplifies player copy, then only those two affected
  cases pass again in14.5s under the same bound. **Eight unique cases verified**,
  not twelve distinct cases or a single full-app pass. All attempts are retained.

Real XP collection opens actual three-choice offers; seeded randomness selects
eligible draws, then80ms keyboard holds acquire the tool, buy four reach picks
and choose evolution. Actual reach carryover is57.6; offer preview147.6→162.6.
Source clock1400 and other clock10000 survive replacement exactly. The subsequent
explicit-time combat probe resets scheduling separately to test the attack.

Four-target eco combat commits36 actual damage,19.8 splash,4kills/4XP; knight40
actual,21.8 splash,4kills/8XP. Direct and splash lethal events carry
weapon.secondary_evolved; no on-kill explosion. Intended floating damage48.6/
52.2 includes overkill and fully flushes, distinct from the capped ledger. The
manual fire probe leaves four queued death events at its immediate sample; the
following active-play samples drain backlog to0. Do not label the synchronous
probe as an already-drained queue.

Both-theme Low load probes spawn300 mixed actors, reset clocks for controlled
active play and exceed2000simulated ms at0.5 with both clocks firing, splash
advancing, exact ledger and peak300/current237eco/292knight in the final run.
Scripted positioning, noAmbient/noContact/noHazards, muted/no audio driver,
seeded offers and XP cap at the acquired level are explicit aids. These are
short affected-work checks, not survival, hazard soak, production throughput,
native-focus, audio release or hardware acceptance.

Observed final browser.version isChromium151.0.7922.34; renderer ANGLE Vulkan
SwiftShader WebGL, test/Normal,1600×900FIT displayed1280×720/DPR1. Actual OS
uname isDarwin25.5.0 arm64; M5Pro/48GiB is retained prior inventory, not newly
measured. Desktop preset still reports a Windows UA; it is not Windows hardware
coverage. Both-theme offer/cone/load screenshots were visually reviewed under
testInfo.outputPath. Final player-copy offer images were checked after shortening.
Exact source/build/image hashes and observations: [C2_RESULTS.json](C2_RESULTS.json).

## Pacing and deferred work

Both themes/ten models/three difficulties run balance with TTK:60 coarse
scenarios. [C2_BALANCE.json](C2_BALANCE.json) retains CLI output hashes/raw output
and rounded printed summaries. New single/packed evolution bands use authored
caps and earliest level7 transition. They omit movement, offer frequency, overkill,
additional damage purchases and survival; packed is ideal contact, not promised
DPS. Zero-crit secondary contact rises4.286→7.5 single,26.357→66 ideal packed.
Normal eco ends level19/27,391/771kills,415/1245printed XP; knight17/28,
289/679kills,312/1336XP, single/packed respectively. No global/enemy retuning.
A separate temporary structured-result collector could not load outside the Vite
root (both /tmp spellings); CLI balance had already passed, and its retained
output is the evidence. No dependency/config patch follows the collector failure.

Full app/stress/native/long/startup/production browser campaigns are deferred under
the resource policy; no affected startup boundary changed. Compiled JS/entry HTML
excludes test fixture/telemetry/alternate markers. Known Phaser chunk warning
remains (~1.624MB minified/379.11kB gzip). No dependency upgrade/audit rerun.
Owned browsers/servers closed;4173 has no listener, unknown processes/review4213
untouched. PR26 remains merged2806720 as c6daeb6, Actions39189877476 succeeds
only2806720; no later-head CI claim, push, PR, merge, deploy or dispatch.

Status/checklist/waiver/reconciliation/progress/master are recorded in the same
reviewed local C2 commit. [Session16 handoff](../SESSION_16_PROMPT.md) continues C3.
