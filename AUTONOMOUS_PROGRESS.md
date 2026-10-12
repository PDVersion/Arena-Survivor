# Autonomous progress

Updated: 2026-10-12 (Australia/Sydney).

## Objective and current state

Smooth browser play on older hardware. **Session 1 / V0.4.3 P0 is complete and
verified** on `codex/v0.4.3`; P1 is next and unstarted. Content C1–C7 has not
started, optional F1–F18 has no selections, and physical older-device acceptance
remains pending. No optimization or performance improvement is claimed.

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
  Phase commit/index verification follows; final response records the end time.

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
performance gates. Optional content selection remains pending and does not block P1.
