# Autonomous progress

Updated: 2026-10-15 (Australia/Sydney).

## Objective and current state

Smooth browser play on older hardware. **Session 1 / V0.4.3 P0 is complete and
verified** on `codex/v0.4.3` (`354d725`). The subsequent owner-requested **Q1
play-test correction is also verified**: player facing/walking, crisp world text,
common tool offer entries and selected F16 Beginner/Normal/Experienced. Q2, Q3 wrap-up, Q4 opening/stat inspection and
Session 2 / P1 are now verified; Session 3 / P2 is verified; Session 4 / P3 software gate is verified. Session 5 / P4 affected local gate is verified; Session 6 / P5 lifecycle and Session 7 / P5 startup affected gates are verified; consolidated lifecycle/compatibility acceptance remains pending. Content C1–C7 and other optional features have not started;
physical older-device acceptance remains pending. P3 establishes scoped burst CPU savings; no frame-rate/device improvement is claimed. Q5 Actions repair is verified; REC-113 audit is resolved. P5–P6 readiness remains gated.

HEAD at branch creation / benchmark capture: `103afa7` (merged V0.4.2.1).
Historical P0 delivery: `354d725 build(v0.4.3): establish browser performance measurements`.
Q1 is `8d142ed`; Q2 is `7ff8bbf`; verified P1 is `8cd149c`.

## Session 1 time budget

- Start: **2026-10-12 14:37:42 AEDT** / **03:37:42 UTC**.
- Deadline: **16:07:42 AEDT** / **05:07:42 UTC** (90 minutes maximum).
- Latest reserved validation start: **15:47:42 AEDT** / **04:47:42 UTC**.
- Final validation/review began early, about **15:07 AEDT** / **04:07 UTC**.
- Final recording checkpoint: **15:15:22 AEDT** /
  **04:15:22 UTC**; actual elapsed **37 min 40 s** at this checkpoint.
  P0 final response: **15:21:03 AEDT / 04:21:03 UTC**, actual session elapsed
  **43 min 21 s**. This budget applied to Session 1; Q1 is a separate follow-up.

## Completed cycles

1. Restore/promote: read required authorities, progress/roadmap, active plans and
   code. Safely created the milestone branch. P0–P6 ownership/subjects/gates now
   precede selected C1–C7; stale AGENTS/README status reconciled (REC-102).
2. Measurement core: fixed existing `prefer-const`; separated unsmoothed Phaser
   raw wall intervals from scaled simulation; focused half-rate/hit-stop,
   interruption and browser pause regressions pass. Core gate passed (REC-103).
3. Reporting: added bounded p50/p95/p99/stalls and synchronous update timing;
   `npm run measure:performance` records serial mode/scenario/device/renderer,
   page rAF and CDP counters. Recorder smoke, six 60-second warmed windows and
   three short 300-peak bursts passed. SwiftShader limits recorded (REC-104).
4. Final gate/review: final types/units/lint/build, full Chromium regression and
   serial canonical stress/cleanup pass. Reviewed phase ownership, production
   separation, report units/windows, original-edit preservation and commit contents.

## Executed checks and results

| Command / check | Final result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm test -- --run` | **408 tests / 47 files pass** |
| `npm run lint` | Pass |
| `npm run build` | Pass; entry 1,670.50 kB / 390.04 kB gzip; existing chunk advisory |
| serial boot/load/frame specs | 3 pass in the core gate |
| `npm run test:e2e:ci -- --retries=0` | **72 pass / 1 existing opt-in skip**, 2.6 min |
| `npm run test:e2e:stress -- --workers=1` | **1 pass**, 11.5 s, zero retries |
| 5-second recorder smoke, both modes | Pass, no browser errors; production screenshot inspected |
| warmed 60-second recorder, 3 repeats × both modes | All six ≥60 s windows pass, no browser errors |
| extended short stress recorder, 3 repeats | All reach 300 peak and complete, no browser errors |
| production inspection / boot | Test interface absent; sampler clock absent; actual live production play observed |
| doc links / original-edit preservation / whitespace | Pass; index checked before phase commit |
| read-only remote milestone branch check | No existing remote `codex/v0.4.3` |

Sandboxed browser binding failed before test execution (`EPERM`); permitted
execution outside the sandbox passed. A sandboxed GitHub DNS check was also
blocked; the permitted read-only retry succeeded. Neither remains a blocker.
No dependency/tuning/save changes; audit and balance commands were not executed
or required for P0. The two-simulated-minute opt-in readability run was not run.

## Baseline and evidence

- Apple M5 Pro / 48 GiB, macOS 26.5.2, headless Chromium 151.0.7922.34,
  **ANGLE/Vulkan SwiftShader software WebGL**, 1280×720 / DPR 1, default 0.5 rate.
- Production page p95 **17.7–24.9 ms** across three 60-second windows; two exceed
  the provisional 20 ms desktop target. No sampled >100 ms page intervals.
- Instrumented active update p95 ~**0.20 ms** in default play, **2.5–3.3 ms** in
  short stress bursts. Burst wall p95 **41.7 ms**; not sustained 300-live evidence.
- Production vs test / development windows cannot isolate telemetry cost.
  No function-level hotspot attribution or physical GPU acceptance is claimed.
- Full configuration/results/reproduction: [baseline report](build/performance/P0_BASELINE.md),
  [default records](build/performance/P0_SAMPLES.json), [burst records](build/performance/P0_STRESS.json).

## Preservation and delivery

Initial backup: `/private/tmp/arena-p0-session-20261012/initial/` and `initial.patch`.
The related assessment roadmap/progress and REC-100/101 are deliberately adopted
as P0 inputs. The **seven existing plan status annotations stay unstaged**, with
exact original text retained; five historical plans remain byte-for-byte unchanged.
No push, PR, merge, deployment, sprite/content generation or profile write.

## Remaining work / blockers / next task

**Current next: P5 consolidated lifecycle/compatibility acceptance, then P6.** Session 6 resolves REC-117 and Session 7 verifies the affected startup gate; P5 overall remains open. The historical P0 next task, Session 2 / P1,
has passed its gate at `8cd149c`; P2–P6 follow their verified gates.

Hardware acceptance is pending: no representative older integrated-GPU machine
was provided/measured, and an additional browser was not profiled. Full-run/overtime/10-restart soak, sustained mixed
60/150/300 loads, projectile-theme profiles and cold/network startup remain later
performance gates. F16 difficulty was subsequently selected and delivered in Q1; other optional
content selection remains pending and does not block P1.


## Q1 follow-up — verified 2026-10-12

Final validation/recording checkpoint: **16:15:37 AEDT / 05:15:37 UTC**.

The owner requested this after Session 1: fix backward/glitchy player walking,
add Beginner/Normal/Experienced, make tool upgrades common and sharpen background
text. Q1 ownership was recorded in the active plan before implementation. No
remaining optional features or P1 optimization were pulled forward.

Completed cycles:

1. Reproduce/promote: read theme, education, save and sprite authorities; inspect
   actual PNGs and timing; add the Q1 exception/ownership and select F16.
2. Implement: presentation metadata corrects walk/hit facing and shortens stride;
   high-resolution world labels; per-run theme difficulty resolution, title
   controls, next-run settings and HUD; Collection Sweep offer rarity common.
3. Validate/review: both production themes, deterministic balance, sprite/settings
   units and browser tests, visual motion/text QA, full regression and serial
   per-preset stress. Record REC-105/106 and preserve the seven initial annotations.

| Executed Q1 check | Result |
| --- | --- |
| `npm run typecheck` / `npm run lint` | Pass on final code |
| `npm test -- --run` | **414 tests / 48 files pass** |
| `npm run build` | Pass; 1,678.18 kB / 392.04 kB gzip entry, existing chunk-size advisory |
| `npm run balance -- --difficulty all --build damage-rush` | Pass; final levels 32 / 25 / 24, peak 86 / 300 / 300, XP 2173 / 1005 / 853 |
| Focused sprite/difficulty/menu browser gate | 9 pass before final settings refinement |
| `npm run test:e2e:ci -- --retries=0` | **75 pass / 1 existing opt-in skip**, 2.6 min |
| Final `difficulty-v043.spec.ts`, serial / zero retries | **4 pass**, including changing settings while paused only affecting the next run |
| `npm run test:e2e:stress -- --workers=1` | **3 pass**, 33.0 s, zero retries; each preset reaches 300 peak and reconciles ledger/restarts |
| Live PNG/browser motion and text review | Correct right/left facing and crisp title/hint; 136 moving render frames, zero idle flashes / wrong flips |
| Diff/ownership/preservation review | Phase files only; no bitmap/assets/generated sprites or dependency changes |

The first overlapping stress invocation passed Beginner then lost its reused
server when the non-stress suite shut that server down. The isolated serial
rerun above passed all presets. This is a recorded harness collision, not a
remaining game blocker. Browser QA captures/trace are under
`/private/tmp/arena-q1-qa/`; durable findings are REC-105/106. Tests validate
mechanics/ledgers and the balance model validates pacing, not human survival.
The original P0 performance recordings remain historical; Q1 changes gameplay
pressure, so refresh equivalent Normal recordings before P1 comparisons.

Delivery: `feat(v0.4.3): correct player presentation and add difficulty presets`
on `codex/v0.4.3`. No push/PR/merge. The initial seven status annotations remain
outside the phase commit. Difficulty remains a session setting, with no storage
adapter, migration or generated art.

Next: **Session 2 / P1**, production telemetry guards and equivalent comparison
recordings; then P2 HUD/minimap, P3 measured simulation hotspots, P4 lightweight
presentation only if measurements justify it, P5 lifecycle/startup and P6 readiness.
F16 is delivered; other optional content awaits selection. V0.4.4 remaining art
stays roster-gated. Human survival tuning and representative older-device
acceptance remain pending; neither is claimed by these checks.


## Session 2 with Q2 follow-up — completed

Start: **2026-10-12 16:47:43 AEDT / 05:47:43 UTC**. Working limit: 90 minutes;
deadline **18:17:43 AEDT / 07:17:43 UTC**, reserve final validation/review from
**17:57:43 AEDT / 06:57:43 UTC**. Resume `codex/v0.4.3` at `8d142ed` with the
seven original plan annotations intact. Owner-authorized Q2 correction precedes
P1's matched before/after recording. Bagged Waste confirmation is pending; its
fixed five-child composition is preserved while independent work proceeds.


Q2 completed-cycle checkpoint: **17:15:04 AEDT / 06:15:04 UTC**, elapsed
**27 min 21 s** from this session's start. Event text now renders at resolution 4
with camera compensation, spent minimap markers are removed, Glass Shards reuse
accepted art, and the standalone sprite review browser is built. Microplastics
open the eco run; bottles quietly unlock at .1 progress. Live/cumulative origin
accounting is event-driven. REC-107/108 record the findings and pending Bagged
Waste confirmation; its fixed five-child mix remains unchanged.

Q2 gate: types/lint/build pass; **416 units / 49 files**, **13 focused browsers**,
final **78 full Chromium passes / 1 existing opt-in skip**, **3 serial stress
passes** (32.8 s), final tool checks **2 pass**. An earlier full run exposed the
clearing test's monotonic-population assumption; it was corrected to assert
natural arrivals stop, and the final full rerun passed. All-preset damage-rush
balance: levels 31 / 26 / 25, peaks 43 / 300 / 300, XP 1954 / 1056 / 927.
Inspected live event/roster/tool screenshots at `/private/tmp/arena-q2-qa/`.
No bitmap generation/edits, remaining roster claims or profile writes.

P1 now begins after the Q2 gate: matched production before/after recordings,
early diagnostic guards, production exclusion and retained test snapshots,
plus an explicitly test-only sustained capacity sweep. Production cap stays 300.


P1 core checkpoint: `7ff8bbf` is the verified Q2 before-build source. Three warmed
60-second production before windows passed without browser errors. Added direct
mode guards before Run/Menu snapshot construction and Run roster high-water
scans, and guarded frame-sampler construction/boot-failure publication. Test
mode remains active. Core validation: **420 units / 50 files**, types/lint/build,
**7 focused browser checks** including 450-enemy benchmark/restart, and
`npm run check:production` pass. Emitted diagnostic markers/test interface are
absent; actual production play/pause and the standalone tool were exercised.
The after-recording/capacity comparison and final regression gate are pending.


P1 measurement cycle: six isolated 60-second production windows passed (3 before,
3 after; each warmed 10 s, no browser errors). Median page p95 remains 17.2 ms;
CDP script median 1.5925 s → 1.3815 s is a scoped observation, not function-level
attribution or a physical-device improvement claim. REC-109 and the P1 report
record guards, emitted-code/boot checks, digests and limitations. The independent
capacity sweep is running serially with actual live/visible counts.


Capacity measurement cycle: **12 × 60-second software-rendered windows** pass
correctness and exact live-population retention, with no browser errors/stalls
>100 ms. At 150/300/450/600 the page p95 ranges are 25.6–25.8 / 40.6–41.6 /
50.0–50.1 / 58.4–58.5 ms. Thus calm-fixture correctness above 300 is verified,
but software frame-budget acceptance is not. Actual visible ranges and CPU
update distributions are retained in the report/JSON. This does not raise the
production cap. A headed probe identifies the real Apple M5 Pro Metal GPU;
a confirmed favicon 404 was fixed in HTML metadata, retaining the failed probe.
The sustained headed 300/600 comparison is underway; older-device and mixed-combat
acceptance remain pending. Final validation/review began **17:43:13 AEDT /
06:43:13 UTC**, before the reserved latest start.


Headed capacity cycle: **6 × warmed 60-second windows** on Apple M5 Pro Metal
hardware pass exact population retention and browser-error checks. At 600 live,
489–517 visible, p95 17.5–18.0 ms; one 100.1 ms interval (0.028%) is retained.
This supports a higher-cap candidate on this modern GPU, not older-device or
sustained mixed-combat acceptance; production remains 300. REC-110 and raw
hardware/software reports preserve both renderers and every repeat.

Final production build/check passes after the favicon correction. An initial
P1 full regression run passed 77 cases, skipped the existing opt-in case, and
hit two five-second transition timeouts under parallel software rendering.
Those two waits now use the bounded 30-second simulation-transition convention
(REC-041), keeping their state/count assertions. The final rerun is in progress.

A concurrent design-review/architecture amendment appeared in the roadmap; it
is preserved outside the performance commit alongside the original seven plan
annotations. The session does not implement those optional recommendations.


## Session 2 final gate — verified

Final gate checkpoint: **18:07:16 AEDT / 07:07:16 UTC**, actual elapsed
**79 min 33 s**; recording/index review/commit follow within the 90-minute deadline.
Final validation/review began at 17:43:13 AEDT, ahead of the reserved latest start.

| Executed final check | Result |
| --- | --- |
| `npm run typecheck` / `npm run lint` | Pass |
| `npm test -- --run` | **420 tests / 50 files pass** |
| `npm run build` | Pass; game 1,616.84 kB / 377.12 kB gzip plus unchanged shared 54.80 kB / 14.42 kB; existing chunk advisory |
| `npm run check:production` | Pass; checked diagnostic fields/global absent, live boot/movement/pause and sprite entry exercised |
| P1 focused browsers | **7 pass**, including 450-live cap/restart origin reset |
| Final `npm run test:e2e:ci -- --retries=0` | **79 pass / 1 existing opt-in skip**, 2.6 min |
| Final `npm run test:e2e:stress -- --workers=1` | **3 pass**, 33.7 s, zero retries |
| Matched production before/after | **6 × warmed 60 s pass**, median page p95 17.2 ms unchanged; scoped CDP script reduction recorded |
| Software capacity 150/300/450/600 | **12 × warmed 60 s**, exact live populations/no browser errors; frame-budget acceptance above 300 fails on this software renderer |
| Actual M5 Pro Metal capacity 300/600 | **6 × warmed 60 s**, exact live populations/no browser errors; 600-live / 489–517-visible p95 17.5–18.0 ms; one 100.1 ms interval retained |
| Headed diagnostic probe | Initial favicon 404 failed; exact URL confirmed, metadata fixed; sustained headed rerun passed |

P1 commit: `perf(v0.4.3): avoid production telemetry work`, including guards,
measurement/capacity/prod-check tooling, regressions, reports and REC-109/110.
No push/PR/merge. The seven original annotations and concurrent roadmap/architecture
amendment stay outside the phase commit. The review tool remains separate from
game-profile storage; no sprites are generated/edited, new roster claimed or
production cap increased. Gameplay uses the same simulation clock.

Next: **Session 3 / P2**, measured minimap/HUD repeated-work reductions and the
visibility/resize/opacity/critical-update gate. P3–P6 remain unstarted. Capacity
approval needs sustained combat/effects/fragment/site births, ledger/queues and
lifecycle on supported physical devices, including older integrated GPUs. Human
survival tuning and another browser engine remain pending. Bagged Waste remains
fixed 2 bottles / 2 Microplastics / 1 glass at 50% normal rewards; confirmation
of a changed/random mix is pending and did not block independent work. Dedicated
fragment/event art and any rejected-sheet regeneration remain roster-gated.

Final recording/index preservation checkpoint: **18:11:17 AEDT / 07:11:17 UTC**,
elapsed **83 min 34 s**; the final response records the end after phase commit.
The dedicated local server on port 4213 serves the sprite browser for review.


## Q3 wrap-up — 2026-10-12

Start: **18:26:14 AEDT / 07:26:14 UTC**. This is the requested wrap-up, not
a new P2 execution session. P1 was delivered at `8cd149c`; its previous final
response was at 18:12:14 AEDT, **84 min 31 s** after Session 2 start.

Completed correction cycle: stronger skill rolls could reach the skill cap
before the upgrade pick-count cap, producing blank-detail/no-op offers. Selection
now checks current skill levels and theme caps, retaining mixed upgrades if
another effect can change state. Upgrade overlays keep their full measured
content, fit the scaled viewport together and convert pointer clicks consistently.
Summary and quality badge reserve separate horizontal space. Focused upgrade
units pass in both themes. No tuning/clock/bitmap changes.

The existing local architecture atlas is deliberately adopted as a reference
artifact for the owner's navigation/docs request, preserving its embedded
catalog/proposals. Its P1 snapshot is reconciled; atlas and sprite browser link
both ways and build as separate pages. The concurrent roadmap design-review
section and seven original status annotations remain outside this correction.

Inspection findings: aqua triangles are intentional stationary, clearable Glass
Shards; fresh-run browser coverage resolves accepted broken-glass frame 3. A
pre-Q2 run can retain its old primitive until restarted; that screenshot's exact
run provenance is unknown. Half-speed timing is authored: 5 simulated minutes
take about 10 active real minutes, plus pauses/feedback/load effects. Detached
intact-bottle pixels are baked into accepted/runtime art and absent from the
intact brief; flagged for future regeneration, with shattered-pose debris kept
distinct. REC-111 and the manifest record this.

Gate completed at **18:43:51 AEDT / 07:43:51 UTC**, elapsed **17 min 37 s**;
final documentation/index review and commit follow. Validation began about
18:36 AEDT; Q3's correction cycle and final validation cycle are complete.

| Executed Q3 check | Result |
| --- | --- |
| Final typecheck / lint / production build | Pass; game 1,617.45 kB / 377.33 kB gzip, existing chunk advisory; standalone atlas 117.88 kB / 29.29 kB at build checkpoint |
| Final full unit suite | **424 tests / 50 files pass** |
| Focused upgrade/layout/tool/roster/clock/overlay browser gate | **13 pass**, 37.7 s |
| Full Chromium regression, zero retries | **81 pass / 1 existing opt-in measurement skip**, 3.0 min |
| Strengthened actual per-card containment/pointer regression | **1 pass**, 2.0 s |
| Serial per-preset stress/ledger/restart | **3 pass**, 34.9 s, zero retries |
| Final production check, separate Q3 report | Pass; diagnostics/global absent, actual boot/play/pause and built atlas/tool navigation, zero browser errors |
| Live layout / accepted and packed PNG inspection | Completed; capture `/private/tmp/arena-q3-upgrade-layout.png` |
| Existing work preservation | Five historical plans byte-for-byte match initial backups; both active-plan annotations and full concurrent roadmap section preserved |

Report: `build/performance/Q3_PRODUCTION_CHECK.json`. Historical P1 reports stay
unchanged. No fresh sustained performance improvement claim, balance tuning,
dependency update, sprite generation or profile migration; balance/audit were
not rerun. The two-minute opt-in measurement remains unexecuted in Q3. Next remains
Session 3/P2, using `build/SESSION_3_PROMPT.md`; no automatic new thread is created.

Final recording/index review checkpoint: **18:45:40 AEDT / 07:45:40 UTC**,
actual wrap-up elapsed **19 min 26 s**. All Q3 gates pass; final index review
confirms only the requested correction/adopted atlas/handoff are staged. Commit:
`fix(v0.4.3): bound upgrade cards and close capped skill offers` on
`codex/v0.4.3`; no push/PR/merge. Original annotations/concurrent roadmap section
remain unstaged. The final response records elapsed time after commit.


## Q4 one-hit opening and starting-stat inspection — 2026-10-13

Owner-requested correction after Q3, with explicit push/PR authorization. Branch
resumed at `941a065`; original seven plan annotations and concurrent roadmap
section preserved. P2 remains next and unstarted.

Cycle 1: compared current 11 health / 10 damage with 9 health and a safe 12.2
global-damage alternative using actual combat rules and every pacing build.
Selected only Microplastics health 11→9; updated the historical formula test to
record that opening-role exception and retain ordering. All-preset regression
checks prove one unupgraded non-critical opening hit plus retained late scaling.
Added starting stats/difficulty selection to sprite inspection, refreshed atlas
base health and documented future stat-book data reuse without implementing it.
Seven focused browser cases pass, including actual one-hit combat in all presets.
Full units pass (428 / 51 files); final type/build/browser/stress/prod gate follows.

Evidence: `build/balance/Q4_OPENING_REPORT.md`, counterfactual JSON and actual
`npm run balance -- --difficulty all --build damage-rush` output. Selected model
levels 32/27/26, peak 24/300/300, XP 2040/1158/1044; these are pacing estimates.
An initial unit expected the old model-derived 11 HP; after recording the explicit
exception it passed. A subsequent compile check caught the test's optional lookup
used as a numeric bound; the helper now throws on missing definitions. Final
validation must pass before delivery. No bitmap, secondary-theme balance,
clock/cap, reward or dependency changes; no performance gain is claimed.

Cycle 2 validation findings: the initial full Chromium run passed 82 / skipped 1
and timed out death, timer and shrine checks. Source edits occurred while its
Vite server was active, making that run unsuitable as final evidence. The death
fixture also assumed old opening pressure; it now uses one known attacker with
weapons disabled and asserts its actual source ID. A frozen-source isolated run
passed those game paths (13 of 14); the new expandable stat view exposed a native
toggle-event race on difficulty changes. Read its live open state before replacing
the DOM; focused rerun and final full gate follow. One earlier isolated run was
deliberately interrupted before updating the death fixture, and is not counted
as a pass. Full units/types/lint/build pass after test lookup/compile corrections.

Publication audit: two executed audits return 14 advisories (11 high / 2 critical
/ 1 moderate) on the lockfile unchanged from main. REC-113 is an open release
blocker. No dependency upgrade is made in this balance phase; the requested PR
will be draft, with CI/readiness still subject to the audit and P2–P6 gates.

Final frozen-source full Chromium rerun: **85 pass / one existing opt-in skip**,
2.7 min, zero retries. Final focused inspector/combat rerun: **7 pass**, 2.8 s.
All **428 units / 51 files**, types/lint/build pass. The final production and
serial stress gate run follows; no source changes during the final regression.

Q4 final gameplay gate: **428 units / 51 files**, typecheck/lint/build, **85 full
Chromium passes / one existing opt-in skip** (2.7 min), final **7 focused browser
passes** (2.8 s), **3 serial stress cases** (32.6 s) and actual built production
boot/play/pause/diagnostic exclusion/stat display/atlas navigation all pass.
`build/performance/Q4_PRODUCTION_CHECK.json` retains final production evidence;
visual captures `/private/tmp/arena-q4-stats.png` and `arena-q4-overview.png` are
inspected. Stats expand without hiding the default sprite preview and remain
expanded across difficulty changes. No new performance comparison is claimed.

Audit remains failed (14 advisories, unchanged lockfile), documented in
`Q4_AUDIT.md` and REC-113. Other executed checks are green, and original local
annotations/concurrent roadmap content are preserved. Delivery uses
`fix(v0.4.3): make opening Microplastics one-hit across difficulties`, then the
owner-authorized push and draft PR into main; no merge is authorized/executed.
P2 remains the next gameplay/performance task; dependency maintenance must be
separately scoped and verified before release. No remaining sprite work or new
stat-book feature starts here.

Publication cycle completed **2026-10-13 10:00:04 AEDT / 2026-10-12 23:00:04 UTC**:
Q4 code/tests/docs committed as `dae5570`, pushed to `origin/codex/v0.4.3`.
[Draft PR #24](https://github.com/PDVersion/Arena-Survivor/pull/24) is open into
`main`, with the accumulated P0/P1/Q1–Q4 checkpoint scope and audit blocker
explicit. The PR is attached to this chat. GitHub CI is **in progress** at this
publication check; no remote pass is claimed. A focused documentation follow-up
records this actual delivery and updates the Session 3 handoff. No merge.
The seven original status annotations and concurrent roadmap section remain
uncommitted and unchanged.


## Q5 — PR #24 Actions repair, 2026-10-13

Resumed `233541e` with original local annotations/roadmap unchanged. The owner
explicitly requests fixing failed Actions; Q5 ownership recorded before edits.
P2 remains unstarted. Existing Code Review connector was not connected; GitHub
REST metadata/logs through the existing login identified both failed head runs.
Both 38319851611 and 38319758936 have four browser failures and two flaky
level-up cases. Audit is skipped in both.

Cycle 1: portable layout output, bounded movement/sweep waits, compressed
normalized bottle unlock, and a real-XP theme-derived level-up fixture. Added
failure artifact upload. Explicit patched Vitest 4.1.11 / typescript-eslint
8.71.2 and transitive brace-expansion/source-map-js updates remove all 14 audit
advisories, retaining game/Vite/TypeScript/vite-node versions. Normal clean
install, 428 units, types/lint/build and simulator/script equality pass.

Cycle 2: focused run passes 13 cases and exposes a separate crowd transient
(three near-coincident pairs versus a ceiling of two). Repeats reproduce it even
without weapons. Correct the check to bounded repeated recovery to zero, retain
all 200 actors and keep compound ledger assertions separate. Three final repeats
pass (23.9 s). No physics/tuning changes; failed exploratory runs are not counted
as verification. Full frozen-source `CI=1` regression with zero retries passes
**85 / one existing opt-in skip**, 8.5 min. Final stress/production gate follows.

The audit blocker is locally resolved (REC-113); Q5's pushed Actions verification
remains pending. `build/performance/Q5_CI_REPAIR.md` documents actual failures,
fixes, compatibility sources and before/after evidence; REC-114 prevents this
class of test from returning. No new optional content, clock or cap change.

Final local gate after normal clean install: **428 units / 51 files**, types,
lint, build, **85 browsers / one existing skip** in CI mode with one worker and
zero retries (8.5 min), and **3 serial stress cases** (33.9 s) pass. Full suite
source was frozen. The instrumented stress reports one 125.1 ms frame interval
in Beginner; it is retained in the report, with no device/performance claim.
The audit has zero advisories and accepted Q4 simulator/script outputs match
exactly. Final production check and publication verification are recorded next.

Final production gate passes: emitted diagnostic markers/global absent, actual
boot/play/pause, starting stats and atlas navigation, zero browser errors
(`Q5_PRODUCTION_CHECK.json`). Q5 implementation/test/docs are now ready for the
owner-authorized existing-PR update. Audit blocker resolved locally; no remote
success is claimed until the pushed head's Actions checks complete.

Remote gate: repair head `28ecdba91462fdf059f1deb3c75652fea09c4ca5` passes
[Actions run 38332255864](https://github.com/PDVersion/Arena-Survivor/actions/runs/38332255864),
started **2026-10-13 01:27:58 UTC**, completed **01:43:02 UTC** (15 min 4 s).
All verification steps pass: clean install, types, **428 units / 51 files**, lint,
build, **85 browsers / one existing skip** (14.0 min), and audit with **zero
vulnerabilities**. No browser flaky/retry results. Q5 is verified; P2 remains
unstarted, and the checkpoint PR remains draft pending P2–P6 readiness. The
verification-record follow-up must still pass its own latest-head Actions check.


## Session 3 / P2 — in progress

Start **2026-10-13 14:08:15 AEDT / 03:08:15 UTC**; deadline
**15:38:15 AEDT / 04:38:15 UTC** (90 minutes); reserve validation/review
from **15:18:15 AEDT / 04:18:15 UTC**. Resume `codex/v0.4.3` at
`6f9ec78`. Initial eight dirty plan files are backed up at
`/private/tmp/arena-p2-session-20261013/initial/` and `initial.patch`; their
seven annotations and concurrent roadmap section remain outside phase commits.

Checkpoint verified: latest head `6f9ec78` passes Actions run 38333614171
(completed 02:04:03 UTC); Q4 gameplay and Q5 audit/CI gates verified. PR #24
was merged at 02:22:37 UTC as `d721ac5`; owner requests a new draft PR for P2.
No previous-PR mutation completed. P2 alone is authorized; P3 remains gated.

P2 cycle 1 checkpoint (about **14:25 AEDT / 03:25 UTC**): baseline source
snapshot `6f9ec78` is isolated from edits. Short CDP CPU profiling captures
minimap filtering/colour/point work and HUD formatting; Phaser already skips
unchanged text texture updates. No cadence change is justified. Hidden minimap
preparation now guards before actor reads, map palette is instance-cached, scalar
drawing avoids coordinate tuples, and scene-owned bounded buffers are reused.
HUD text preparation is dependency-driven; health/XP bars remain full precision
each update and in-place source counts compare scalars. Ten targeted UI units
pass. Sustained before profiles and actual browser/production gates are pending.
First collector settings clicks missed the button/timing; corrected and verified
OFF in telemetry. A browser-side dynamic import was SSR-transformed by vite-node;
use native browser import in the opt-in probe. Failed/partial probes are retained
in `/private/tmp/arena-p2-session-20261013/`, not accepted measurements.

P2 cycle 2 checkpoint **14:34 AEDT / 03:34 UTC**: all **438 units / 52 files**,
types and lint pass; **13 serial focused browser cases** pass in 26.7 seconds
with zero retries, including both real theme HUD/minimap fixtures, all opacity
steps at resized viewport, pause/resume/restart, consumed sites, Bagged Waste
and scaled upgrade pointer selection. Three fixture screenshots were inspected.
Nine initial warmed ≥60-second before windows hold exactly 300 live actors and
have no browser errors or >100 ms sampled page intervals. Initial visible
windows overlapped short local checks, so they remain exploratory; a quiet
three-repeat visible baseline is being recorded. Hidden/paused before windows
were isolated. Final matching after/production profiles and regression/stress
remain pending. No new code changes are planned unless validation finds a defect.

Final validation/review starts **15:14 AEDT / 04:14 UTC**, ahead of the
04:18 latest reserved start. Two external execution-permission waits consumed
about 20 minutes each of the wall budget; deadline stays **04:38:15 UTC**.
Quiet before visible repeats and all short work probes pass. The after capacity,
production comparison and final browser/stress sequence is approved and serial.
No phase completion/commit or PR publication is claimed until actual gates pass.
Initial preservation review confirms all seven untouched plan/roadmap files
match their initial backups byte-for-byte; the active plan's initial annotation
is preserved while adding P2 measurement ownership.

P2 cycle 3 measurement checkpoint **15:25:22 AEDT / 04:25:22 UTC**:
18 primary warmed ≥60 s paired test windows (three repeats per visible/OFF/paused
state per build) pass exact 300-live retention and browser-error checks; the
three original exploratory visible windows remain retained separately. All have
zero sampled >100 ms page intervals. SwiftShader visible median p95 stays
41.7 ms; OFF 25.0→24.9 ms, paused 25.3→25.3 ms. Visible update p95 (rolling
active samples) is .9→.8 ms, with engine/render work excluded. CDP script
medians are 6.2340→6.2426 / 3.1439→3.0831 / 2.0939→2.0356 s/window.
These small/noisy differences do not establish a causal throughput improvement.
Visible-map software rendering remains above the provisional 40 ms criterion;
P2 removes confirmed work but does not pass older-device/readiness acceptance.
Production before/after, after work probes and final gate remain pending.


## Session 3 final P2 gate — verified

Final validation/review began **15:14 AEDT / 04:14 UTC**; no deadline extension.
P2 software gate passes: **438 units / 52 files**, types/lint/build, **13 targeted
serial browsers**, **88 full Chromium passes / one existing opt-in skip** (four
workers, zero retries), **three serial stress cases** (zero retries), and built
production exclusion/boot/tool checks. Both theme HUD/minimap fixtures and
resized pointer interaction are exercised; visual captures are inspected.

Measured source: archived `6f9ec78` before; P2 delta after, identified by source
and build digests. **24 primary serial warmed ≥60 s windows** (18 test, six
production), three retained exploratory visible windows and six short probes
pass. All test windows hold exactly 300 live actors; actual visible ranges and
every p95/p99/max/stall/update/CDP value are in `build/performance/P2_REPORT.md`.
Visible p95 median stays 41.7 ms; OFF 25.0→24.9, paused 25.3→25.3; production
16.8→16.8 ms. No meaningful frame-rate improvement is established.
Confirmed after work probes remove hidden-map preparation and stable paused HUD
setters; texture updates were already guarded by Phaser. Production population
and update CPU remain unavailable; test CPU is rolling active update only.

REC-115 accepted. Gate permits P3 next; no P3, optional content, cap increase,
cadence/tuning, bitmap or save change is implemented. Visible-map software
performance remains above the provisional 40 ms criterion; physical older-device
and mixed-combat acceptance stay pending. Audit/balance were not rerun: no
dependency/game tuning changed and Q5 remains the verified audit checkpoint.

Delivery uses `perf(v0.4.3): reduce repeated interface work` on `codex/v0.4.3`,
then the owner-requested new draft PR into main. PR #24 is already merged. The
initial seven plan annotations and concurrent roadmap section remain unstaged
and unchanged; the active plan is selectively staged without its annotation.
New-head Actions remains subject to the new PR's actual check result.

Final gate/document recording: **04:37:14 UTC**, elapsed **1:28:59**.
Full Chromium: 2.7 min; final serial stress: 32.6 s. Own browser servers
closed after checks; delivery/review follow before the original deadline.


## Session 4 / P3 — in progress

Start: **2026-10-13 16:28:48 AEDT / 05:28:48 UTC**. Deadline:
**17:58:48 AEDT / 06:58:48 UTC**, validation reserve begins by
**17:38:48 AEDT / 06:38:48 UTC**. Branch `codex/v0.4.3`, actual HEAD `64e77c4`.
P3 only, local delivery. Backed up all eight existing dirty plans and patch at
`/private/tmp/arena-p3-session-20261013/initial/`; Session 4 prompt remains an
untracked owner input. Before game source is archived separately from HEAD;
installed dependencies shared without alteration. Exact P3 measurement/spatial/
separation paths added to ownership before editing. P4–P6 remain unstarted.

Cycle 1 profile checkpoint **05:38:30 UTC**, elapsed **9 min 42 s**. Frozen
`64e77c4` dense and replenished mixed-combat CPU/allocation probes completed.
Dense test telemetry dominates (excluded as production evidence); separation
is ~26.3 ms across 274 wrapped updates. Combat's `recordCommittedKill` has
218.2 ms sampled self CPU, higher than separation/queue traversal; it filters
and copies the immutable kill window on every kill. Selected a single-pass
owned result buffer, preserving order/expiry/future exclusion and immutable
statistics. Added this newly profiled dependency/tests to ownership first.
Sandbox Chromium launch failed; permitted retry runs. First archived probe
completed but metadata failed because archives have no `.git`; explicit archive
revision/state arguments fix this, and corrected probes pass. Remote branch
read-only retry confirms `64e77c4`; no publication action. Before sustained
combat comparisons are running serially; no correctness suite overlaps them.

Cycle 2 checkpoint **05:51:52 UTC**, elapsed **23 min 04 s**. Single-pass
immutable committed-kill window implemented; 137 affected units pass, typecheck/
lint pass. Final serial fixed-work comparison (10,000 calls, three repeats)
reduces median CPU by ~75% for both 300 and 3,000 timestamp inputs, identical
checksum. Three >=60 s eco combat windows each before/after pass without browser
errors: median rolling update p95 **4.3→2.9 ms**, CDP script **6.7505→5.7091 s**
(~15% less); wall p95 stays **33.4→33.4 ms**. This is repeated burst work, with
actual fluctuating live ranges, not sustained 300-live combat/device acceptance.
The remaining calm dense/distributed, retained-theme projectile and production
comparisons/probes are serially running on immutable archives. No test/build
suite overlaps sustained windows. Read-only remote inspection confirms open
draft PR #25 at `64e77c4` and successful verify run `38347342750`; no push/PR
creation/merge/deployment is performed.

Cycle 3 calm-crowd checkpoint **05:59:54 UTC**, elapsed **31 min 06 s**.
Six serial >=60 s dense windows pass, each exactly 300 live actors. Median
rolling update p95 remains 0.8 ms; wall p95 24.7→25.1 ms and script
2.9130→2.9145 s show no useful calm-crowd/frame improvement. All actual renderer
metadata confirms SwiftShader; source-tree digests verify each theme pair differs
only in `run-statistics.ts`. Distributed and projectile/production windows are
still running; final software gate remains pending.

Cycle 4 distributed checkpoint **06:06:58 UTC**, elapsed **38 min 10 s**.
All six >=60 s distributed windows pass, each exactly 300 live / 45 visible
actors. Rolling update p95 remains 0.6 ms; wall medians 16.9→17.0 ms and script
2.8457→2.8687 s do not establish a useful difference. The fixture controller
is included and disclosed. Retained-theme projectile burst comparison has begun;
production windows, short pickup/after attribution probes and final gate remain.

Cycle 5 projectile/probe checkpoint **06:14:42 UTC**, elapsed **45 min 54 s**.
Six retained knight/projectile >=60 s windows pass cap/effects/fragments and
exact damage-ledger checks with zero browser errors. Median update p95
**3.8→2.4 ms**, CDP script **6.0311→4.9820 s** (~17% less); wall p95 unchanged
33.4 ms. Short before pickup-cap and after mixed-combat CPU/heap probes pass;
raw traces remain local, summary retained. Ordinary production comparison is
now running, followed by final correctness/production/stress checks.


## Session 4 / P3 continuation — 2026-10-14

Owner paused at the last recorded active checkpoint **2026-10-13 06:19:22 UTC**
(**50 min 34 s** since start), then explicitly resumed. Continuation start:
**2026-10-14 09:32:28 AEDT / 2026-10-13 22:32:28 UTC**. Original background
recorder unexpectedly remained running after the pause and exited successfully
at **06:32:56 UTC** (original elapsed **64 min 08 s**). No verification/commit
ran. Post-pause production after windows are retained separately as exploratory,
not the primary comparison. Conservatively reserve the remaining **25 min 52 s**
of the original 90-minute work allowance: continuation hard stop **22:58:20 UTC**
(**09:58:20 AEDT**); proceed directly to remaining validation/review. No new
phase or further optimization. Verify pickup active/tracked counts, rerun matched
production windows serially, then complete final software gate and recording.


## Session 4 / P3 final gate — verified 2026-10-14

Final recording checkpoint **22:48:12 UTC**, continuation elapsed **15 min 44 s**; conservatively counted work **79 min 52 s** including original background recorder completion, excluding the inactive paused gap. No deadline extension.

Types/lint/build and all **440 units / 52 files**, built production diagnostic
exclusion/boot/play/pause/tool checks, **7 targeted serial browsers**, **88 full
Chromium passes / one existing opt-in skip**, and **3 serial stress cases** pass
with zero retries. Full browser suite uses four workers for correctness; stress,
profiles and all sustained comparisons are serial on owned ports. Own servers
exit after each check; review server 4213 is untouched.

Thirty primary warmed >=60 s windows pass, with three repeats per build/scenario:
dense/distributed 300-live, active eco melee and retained knight projectile burst
work, plus matched recovery production. Six original production windows remain
separate, including three uncontrolled post-pause after windows. Report raw
p95/p99/max/stalls, actual population, rolling/lifetime update exclusions and
source/build digests in `build/performance/P3_REPORT.md`. Fixed work (~75% less)
and sustained burst update p95 **4.3→2.9 / 3.8→2.4 ms** establish useful scoped
CPU benefit; CDP script ~15%/~17% less, frame p95 unchanged 33.4 ms. Production
16.9→17.5 ms / script +9.3% does not establish ordinary-play improvement.

REC-116 accepted. REC-117 records pre-existing pickup overflow retention:
250 active / 535 tracked references, likely destroy-listener registration order.
P5 must reproduce/fix/test bounded tracking and exact rewards; no P5 code added.
P4/Default-Low remains next only if measured presentation evidence supports it.
Physical older-device, visible-map criterion, sustained 300-live mixed combat,
additional-browser and longer lifecycle/startup readiness remain pending. Content
C1–C7/other optional selections and V0.4.4 roster work remain gated. No dependency,
balance, sprite, cap/rate or persistence change; audit/balance not rerun.

Delivery: local `perf(v0.4.3): reduce measured simulation overhead` on
`codex/v0.4.3`, parent `64e77c4`; commit hash is resolved in Git history. No push,
PR creation/merge or deployment. PR #25 at the P2 head had successful Actions
38347342750 at the read-only inspection; P3 has only its recorded local gate.
All eight original owner plan edits and Session 4 prompt remain unstaged.
Implementation, regressions, phase checklist, report/evidence, progress and both
reconciliation entries belong to the same phase commit. Next eligible work is
Session 5 / P4; this session starts no further phase.


## Session 5 / P4 — budget and setup

Start: **2026-10-15 00:41:13 UTC**; deadline **2026-10-15 02:11:13 UTC** (90 minutes); reserve
validation/review from **2026-10-15 01:51:13 UTC**. Branch `codex/v0.4.3`, starting
HEAD `05c1d4e`; local remote-tracking branch is one commit behind. No remote
mutation authorized. Initial dirty files and patch backed up at `/private/tmp/arena-p4-session-20261015T004113Z`;
immutable HEAD archive at `/private/tmp/arena-p4-session-20261015T004113Z/before`. P4 only; REC-117 remains for P5.

Owner testing constraint (2026-10-15): limit heavy local Chromium/browser work
to necessary current-change tests and serial P4 attribution/comparison windows.
Defer whole-app browser/stress regression to GitHub Actions or a consolidated
check after several sessions. Do not launch background suites per build session.
Record deferred checks honestly; this overrides the older Session 5 blanket
local full-browser/stress command list. No push is authorized this session.

Cycle 1: required authorities, branch/history/status and prior P2/P3 evidence
reviewed; original edits preserved. Freeze baseline before measuring optional
presentation work; add exact dependencies before any runtime edits.

P4 cycle 2 checkpoint: 2026-10-15T01:07:41.020583+00:00. Short separate CDP probes: dense visible 300-circle map p95 41.7 ms; isolated square-marker probe p95 25.0 ms. Renderer triangulation samples fall sharply; diagnostic crowd scans remain separate. Added session Default/Low selecting theme-owned enemy minimap shapes only; unchanged cadence, positions/radii, player/site/hazard markers and gameplay. Types pass. After source frozen for serial comparisons; full suites deferred per owner.

Cycle 3: candidate Low smoke passes after scaled pointer correction. Frozen-baseline build initially rejected the shared collector's new settings type; collector now uses a compatible optional structural type. No game source change required. Both failed preflight attempts remain separate from sustained windows. Serial sustained measurement is validation work, begun before the reserved final 20 minutes. Added both-theme rendering/isolation/settings/seeded-model units and two affected browser flows; execution waits until measurements finish to avoid contention.

P4 final validation checkpoint 2026-10-15 02:08 UTC (about 87 minutes): all 27 sustained windows pass; dense Default→Low p95 41.7→25.1 ms, script 6.1687→3.1860 s; combat p95 unchanged 33.4 ms; production 17.5→17.0 ms. 450 units / 53 files, types/lint/build/production check pass. Temporary config syntax failed before browser execution, corrected separately. Two primary focused browsers pass; resize/restart case failed because its test incorrectly required physical display dimensions unchanged after resize. It now checks unchanged logical world and the resized 900-pixel display explicitly. Focused rerun and retained-theme checks are next; gate not yet accepted, no phase commit. Deadline is 02:11:13 UTC; preserve partial work rather than claim success if review cannot finish. Original edits remain preserved.


## Session 5 / P4 — affected local gate accepted

Final validation/recording checkpoint: 2026-10-15T02:10:39.074688+00:00; elapsed 89.43 minutes from
00:41:13 UTC. Validation began with frozen comparisons at 01:21 UTC, ahead of
the final 20-minute reserve. P4 only; P5/content never started.

Completed cycle 4: 27 warmed >=60-second windows, three serial repeats of
baseline/Default/Low × dense map/combat burst/ordinary production; no overlapping
suites, live-source edits or builds. All retained, zero browser errors; dense
retains 300 live and combat cap/ledger checks pass. Low visible-map p95 is
25.1 ms vs candidate Default 41.7 ms (~40% lower), baseline median 35.4 ms.
See P4_REPORT.md for every mode/scenario result, actual populations, all wall
percentiles/stalls, CPU exclusions, digests and software-renderer limits.

Completed cycle 5: full units/types/lint/build, production exclusion/boot/play/
pause/tool check, three focused serial browsers per theme, zero retries. Full
local Chromium/stress suites deliberately deferred to Actions or a consolidated
multi-session gate under the owner's newer resource policy; no P4 CI pass claimed.
Dense Default/Low and settings screenshots inspected for readable actor/map/UI
art and fitted controls in both themes. Seeded model reports and frozen-input/
live dispatch tests preserve gameplay/presentation isolation. Measured runtime
source matches delivered code. No dependencies, gameplay tuning or save storage.

Delivery is local on `codex/v0.4.3`, subject
`feat(v0.4.3): add a lightweight presentation mode`. Original eight dirty plan
files (including the active plan's historical annotation) and both prompts stay
unstaged; backups remain at /private/tmp/arena-p4-session-20261015T004113Z. No push/PR/merge/deploy. Owned browser/
recorder/server cleanup is verified; unrelated review server 4213 untouched.
Next eligible session: P5 lifecycle, first resolving REC-117 active/tracked pickup
retention; physical older-device, sustained 300-live mixed combat, another browser
and longer lifecycle/startup readiness remain pending.


## Session 6 / P5 lifecycle — affected gate verified

Start: **2026-10-15 13:25:18 AEDT / 02:25:18 UTC**. Maximum deadline:
**14:55:18 AEDT / 03:55:18 UTC**; reserve final verification/review from
**14:35:18 AEDT / 03:35:18 UTC**. Actual starting HEAD `d9047c0`,
`codex/v0.4.3`. Initial patch and prompts backed up at
`/private/tmp/arena-p5-session-20261015/`; eight pre-existing dirty plans and
three untracked session prompts remain outside this slice's staging.

Scope: reproduce/fix REC-117, inspect related retained resources and add bounded
regressions. Session 7 startup/compatibility, P6 and optional content stay pending.
Only affected serial one-worker/zero-retry browser evidence when engine ownership
requires it; no full local browser/stress, long soak, push or CI trigger.

Completed cycles:

1. Reproduction: actual scene methods reproduce REC-117 exactly (1,040 drops,
   535 tracked/250 active), plus a failing paid-cue merge/reward race. Install
   cleanup ownership before overflow and retire paid collect presentation at cap
   pressure. Every successful claim now schedules cleanup, including test XP caps.
2. Retained-resource inspection: Phaser source and a narrow real stop probe show
   engine teardown works, while scene collections still retain a hazard, feedback,
   map reference, 250 claims and two pending events. Named idempotent shutdown
   clears those owners without touching already-destroyed physics (REC-020/119).
3. Affected verification: deterministic both-theme overflow/ties/provenance,
   fractional/duplicate claims, repeated collection/reconstruction, shutdown/queue
   claim reset and audio-close ownership; two real serial Chromium Canvas cases,
   each with three stop/start reconstructions. At pressure: 250 tracked/active/
   group/enabled bodies, 790 merges, 1,040 XP; after collection zero pickups/bodies;
   after stop zero tested engine and retained resources. Default/Low fixtures are
   exercised across cycles; full settings UI/focus/overtime are deferred.

Final verification/review began early at **13:33:47 AEDT / 02:33:47 UTC**,
8 min 29 s from recorded start. This preserves the final 20-minute reserve.
Details, executed/deferred checks, fixture failures and limits are recorded in
`build/performance/P5_LIFECYCLE_REPORT.md`. No broad browser suite, performance
campaign, long soak or extra production browser run. P5 remains open for Session 7
startup/compatibility and broader acceptance; P6/optional content not started.

Final delivery recording checkpoint: **2026-10-15 03:17:08 UTC**, actual elapsed
**51 min 50 s** from the recorded start. Final gate:
**466 units / 55 files**, types/lint/build, **2 affected serial browser passes**
(5.3 s, zero retries) and whitespace checks. Original seven untouched plan files
match their backups; the active plan retains only its original two-line annotation
unstaged. All three prompts remain untracked. No owned browser/server remains on
4173; review server 4213 and unknown processes were not touched. Deliver locally
with the declared P5 subject; startup remains Session 7 and P5 stays open.


## Session 7 / P5 startup and compatibility — affected gate verified

Start **2026-10-15 15:06:48 AEDT / 04:06:48 UTC**; 90-minute working cap,
deadline **16:36:48 AEDT / 05:36:48 UTC**, final validation reserve from
**16:16:48 AEDT / 05:16:48 UTC**. Start HEAD `8b700d9`, `codex/v0.4.3`.
Initial diff and active plan/prompts backed up at
`/private/tmp/arena-p5-startup-session/`. Preserve all eight dirty plans and
three prompts outside this work's staging. User authorizes continuation to the
next section; this slice is startup/compatibility, with P6/content not started.

Use a bounded serial production startup/failure collector, deterministic boot
units, full units/types/lint/build and production exclusion checks. No full local
Chromium/stress, long soak, broad browser matrix, push or CI trigger. Measure
cold/warm resource/first-render/first-run timing and test a small renderer/asset
failure set before deciding on changes; no speculative Phaser splitting.

Completed cycles:

1. Bounded production reproduction: no canvas contexts cause two uncaught Phaser
   dependency errors before recovery; a blocked atlas image still reaches the menu.
   Existing WebGL→Canvas selection works. Initial collector attempts failed because
   production excludes the debug global and Phaser renders through drawArrays;
   use browser rendering/text/upload observers without shipping diagnostics.
2. Correction: preflight required 2D text canvases; await the Game-start module
   inside the existing error boundary; stop after declared asset load failure and
   schedule owned Game destruction. Theme-owned graphics instructions/reload action,
   safe text error details and native keyboard/pointer retry work. No sprite pipeline,
   content/balance, dependency or persistence change; no speedup claim.
3. Evidence: three serial HTTP-cache cold/warm pairs; forced Canvas, unsupported
   graphics, blocked atlas/module and both successful reload retries; one slower
   network case and separate decode probes. First title-draw markers 116–243 ms
   cold, 134–140 ms warm; slow-network title/run markers 2.580/2.724 s. Browser
   render markers include observer overhead and are not compositor or device
   acceptance. Primary samples retain measured bundle hashes; the final focus-style build is rechecked separately.
4. Verification: 474 units/56 files, types/lint/build; one affected serial test-mode
   boot/resize pass; existing production exclusion/boot/play/pause/tool check passes.
   Recovery screenshots at 900×600 inspected; retry controls fit. All startup/failure
   cases use one Chromium browser serially; no overlapping suites/servers.

Report and all scope/limitations: `build/performance/P5_STARTUP_REPORT.md`.
P5 stays open for consolidated authored/overtime/focus/resume/long lifecycle and
broader compatibility acceptance; P6 and optional content have not started.
Full local Chromium/stress and physical older-device/additional-browser evidence
remain deferred, not passed. Delivery remains local; no push/PR/CI trigger.

Continuation/handoff resumed at **2026-10-15 16:39:56 AEDT / 05:39:56 UTC**
after the user's “continue where you were stopped” request. The original 90-minute
wall checkpoint passed during interruption; elapsed wall time is not reported as
active work time. Startup implementation/tests had passed before the interruption.
Finish the report, final build/hash/preservation review and local commit only;
no new phase or expanded browser job. Final focus-ring CSS inherits currentColor
instead of introducing a theme colour literal; startup JS behavior is unchanged.

Final recording checkpoint: **2026-10-15 16:42:32 AEDT / 05:42:32 UTC**.
Wall elapsed **95 min 44 s**, including interruption; continuation since the
recorded resume is **2 min 36 s**. Final build and affected recovery recheck pass;
its JS hashes match current dist. Focus-only CSS uses inherited colour. No owned
listeners remain on 4173/4174; unknown processes and port 4213 are untouched.
All original untouched plan/prompt bytes match backups, and the active plan's
original annotation will remain unstaged. Commit the Session 7 continuation
locally with the P5 subject; P5 overall remains open as recorded above.


## PR #25 Actions repair — local gate verified 2026-10-16

Run `38670385486` tested `d9047c0`, before the two unpublished P5 commits.
Two P4 cases failed writing screenshots to macOS-only `/private/tmp`; the
resize/settings/restart scenario exhausted its cumulative 30-second budget.
REC-114 records trace evidence. Screenshots now use Playwright-owned output
paths; two long scenarios have bounded 90-second budgets, retaining all actions
and assertions. No runtime, dependency or workflow changes.

Three affected browser cases pass serially with one worker and zero retries
(33.2 seconds); five artifacts exist in test-owned directories. All 474 unit
tests in 56 files, types, lint, production build and whitespace checks pass.
Full local Chromium/stress remains deferred under the owner resource policy;
remote CI is pending publication and a pass matching the repair head. P5 remains
open; no P6 or content work begins. See `build/performance/CI_REPAIR_20261016.md`.

Initial edits are backed up in `/private/tmp/arena-ci-repair-20261016/initial.patch`.
The eight original plan edits and three untracked session prompts remain
unstaged. Session 6 required local-only delivery: no push or CI trigger has
been made. Publishing this repair also publishes the two local P5 commits
(`8b700d9`, `3d1ee2f`) and requires owner authorization to lift that constraint.
