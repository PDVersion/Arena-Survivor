# Autonomous progress

Updated: 2026-10-13 (Australia/Sydney).

## Objective and current state

Smooth browser play on older hardware. **Session 1 / V0.4.3 P0 is complete and
verified** on `codex/v0.4.3` (`354d725`). The subsequent owner-requested **Q1
play-test correction is also verified**: player facing/walking, crisp world text,
common tool offer entries and selected F16 Beginner/Normal/Experienced. Q2, Q3 wrap-up, Q4 opening/stat inspection and
Session 2 / P1 are now verified; Session 3 / P2 is next and unstarted. Content C1–C7 and other optional features have not started;
physical older-device acceptance remains pending. No performance improvement is claimed. REC-113 now blocks release on dependency audit; P2 can proceed independently.

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

**Current next: Session 3 / P2.** The historical P0 next task, Session 2 / P1,
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
