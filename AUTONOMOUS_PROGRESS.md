# Autonomous progress

Updated: 2026-10-12 (Australia/Sydney).

## Objective and current state

Smooth browser play on older hardware. **Session 1 / V0.4.3 P0 is complete and
verified** on `codex/v0.4.3` (`354d725`). The subsequent owner-requested **Q1
play-test correction is also verified**: player facing/walking, crisp world text,
common tool offer entries and selected F16 Beginner/Normal/Experienced. P1 is next
and unstarted. Content C1–C7 and other optional features have not started;
physical older-device acceptance remains pending. No performance improvement is claimed.

HEAD at branch creation / benchmark capture: `103afa7` (merged V0.4.2.1).
Delivery: the P0 phase commit `build(v0.4.3): establish browser performance measurements`.
Use `git log -1` for its resulting HEAD; this record is included in that commit.

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

**Next: Session 2 / P1**, guard production telemetry before diagnostic scans,
verify test-mode snapshots and production exclusion, and compare equivalent
before/after recordings. P2–P6 follow their verified gates; no later phase started.

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


## Session 2 with Q2 follow-up — in progress

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
