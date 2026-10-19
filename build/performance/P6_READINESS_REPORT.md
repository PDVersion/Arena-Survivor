# P6 — combined software readiness and device follow-up

Work starts under the owner's 2026-10-19 request to finish P5, begin P6 and continue V0.4.3. This explicitly authorizes P6 software preparation alongside unresolved physical/browser evidence; it does not silently pass P5 or waive device acceptance. The owner confirmed no older device is available. At that checkpoint content remained behind the required gate; the dated owner revision below now governs implementation order.

## Baseline and final evidence to retain

| Area | Baseline / measured change | Practical limit |
| --- | --- | --- |
| Production diagnostics | P1 excludes telemetry construction/fixture controls from production | No universal frame-rate claim |
| Interface work | P2 reduces repeated HUD/minimap calls/allocations; software-renderer dense p95 unchanged around41.7ms | Work reduction is not a device acceptance pass |
| Simulation bursts | P3 matched eco combat update p95 4.3→2.9ms; retained projectile theme3.8→2.4ms; wall p95 remains33.4ms | Test fixtures, measured update scope; ordinary production shows no speedup |
| Default/Low | P4 matched300-live dense SwiftShader median wall p95 Default41.7/Low25.1ms; baseline35.4ms varies; combat33.4/33.4, production17.5/17.0 | Conditional geometry savings, not physical older-device performance or a global improvement |
| Lifecycle | P5 overflow1,040XP/790merges/250retained, exact awards, stopped ownership; accepted20-minute lifecycle/native/audio slices | All original aids/short-cycle/renderer and unassisted/hazard/direct-destruction limits remain |
| Startup | P5 actual dependency/atlas/graphics failures recover, bounded cold/warm/slow evidence | Recovery fix, not loading-speed improvement; no speculative Phaser splitting |
| Engine compatibility |52 focused engine checks, plus26 actual stable Edge checks and two unpatched Firefox application smokes in Session12 | Actual missing releases/platforms/older hardware still pending |

Sources: `P0_BASELINE.md`, `P1_REPORT.md`, `P2_REPORT.md`, `P3_REPORT.md`, `P3_COMPARISON_SUMMARY.json`, `P4_REPORT.md`, P5 lifecycle/startup/acceptance/campaign/compatibility reports. Historical measurements retain their original device, source, mode and scenario; do not rebrand them as current measurements or matched60/150 baselines.

## Matched-head remote inspection and test repair

PR26 merged head2806720 as c6daeb6 on2026-10-19 at03:11:29UTC. Actions39189877476 succeeds on2806720:488units/57files,91 browser passes/two flaky/four skips, zero audit findings. Raw targeted log extract in `P6_CI_CHECKPOINT.json`. It is not a clean zero-retry gate and cannot certify later local source.

Two demonstrated test failures are addressed without changing runtime or assertions: card selection used a distant natural-arrival/travel prerequisite and missed level-up within60s; restart's instantaneous Escape sometimes missed the paused state. The card helper now uses the existing theme-derived close fast-role arrival count, real combat/XP and ordinary choice resolution, matching the established phase-four convention. Frame-consumed keys in the affected specs and measurement collector hold80ms, matching the prior Phaser JustDown finding. Eight affected serial checks pass in14.9s, zero retries. No production correctness defect or dependency/tuning change.

## Portable device pack

`npx vite-node scripts/build-device-pack.ts` builds an explicitly instrumented test artifact under `test-results/p6-device-pack`, separate from `dist`. It includes loopback-only dependency-free Node serving, source/artifact identity, a browser UI for normal play and60/150/300 aided benchmarks, Default/Low chosen through real game Settings, bounded warmup/capture, exported actual renderer/DPR/telemetry and a manual checklist. Requires Node20+ on a target; no npm install/network after copying the folder. Downloads are unreviewed evidence, never automatic acceptance.

The recorder labels browser rAF wall spacing explicitly; CPU/GPU work is unmeasured and omitted. Differences between read-only simulation snapshots are not per-engine frame deltas. It retains interruptions/quality/state checkpoints and actual populations; no constant-memory or native-focus proof. Distributions hold at most16,384 samples; the window/accepted/excluded counts remain inspectable. Hardware/driver/power notes are manual and must be corroborated during review.

Test-support setup fixes: initial FrameMeasurements method name and nullable/const checks corrected before final compilation; the first portable server verification could not start because its config-relative path was wrong (no browser acceptance). After correction, an initial70-second capture/security check passed. Review then corrected the wrapper's clock label and removed unmeasured zero CPU fields; the final artifact is verified separately. These are test-support errors, not production defects. A local Python bytecode-cache sandbox denial is avoided by placing the cache under private/tmp; no system permission change.

Detailed procedure and explicit missing rows: [P6_DEVICE_CHECKLIST.md](P6_DEVICE_CHECKLIST.md).

## Executed final gate and comparison

Typecheck, **488units/57files**, lint, production build and whitespace pass.
Audit reports **zero vulnerabilities**. The consolidated local Chromium run
passes **96 cases / six explicit opt-in skips**, including all three short stress
cases, in566,412ms, one worker/zero retries/zero flaky cases. Skips are existing
long/readability/native/campaign opt-ins plus explicit environment/device-pack
verification; none is a new native/long acceptance pass. Raw:
[P6_BROWSER_RESULTS.json](P6_BROWSER_RESULTS.json), [audit](P6_AUDIT.json).

Final portable-pack verification passes **two cases in about1.2min**, including
a real60-second export and server-root refusal. Its final export labels browser
rAF correctly and omits unmeasured CPU. [Runner](P6_DEVICE_PACK_TEST.json),
[capture summary/hash](P6_DEVICE_PACK_SUMMARY.json), and initial server-path
[setup failure](P6_DEVICE_PACK_SETUP_FAILURE.json) are retained. This is tool
format/behavior verification on M5; companion software checks ran late in the
capture, so these sample timings are not used as a performance comparison.
The wrapper records its actual iframe viewport, not the monitor resolution.
Use the separate full-window game page for normal full-viewport manual play.

The final comparison uses **18 independent warmed60-second windows**, three
repeats of60/150/300 actors in Default/Low; total ownership1,297.8s, below26min.
Each window has ten-second warmup, a fresh context, test eco/Normal, rate0.5,
visible map, no weapon/contact/XP/hazards, fixed live counts and cap300. All
recorded window states are playing; the collector pauses afterward to flush
rolling statistics. This is a calm controlled crowd, not mixed combat, production,
continuous soak or older-device acceptance. No other tests/builds/browser jobs
ran during these measurements. No profiling wrappers, screenshots or throttling.

Actual environment: Apple M5 Pro/48GiB, Darwin25.5.0 arm64, Node20.20.2,
Chromium151.0.7922.34, headless WebGL ANGLE Vulkan **SwiftShader software**,
1280×720/DPR1, logical canvas1600×900. Normal automation focus behavior applies;
this is not native-event evidence. Heap endpoints are GC-dependent observations,
not leak conclusions. Active update CPU remains a rolling4096-sample statistic
from scene creation, not exact per-window whole-frame/GPU time.

| Quality | Live actors | Median wall p95 ms | Worst p99 ms | Max interval ms | Max >100ms % |
| --- | ---: | ---: | ---: | ---: | ---: |
| default | 60 | 25.1 | 25.7 | 33.3 | 0.000 |
| default | 150 | 25.5 | 33.4 | 50.5 | 0.000 |
| default | 300 | 41.7 | 42.0 | 66.6 | 0.000 |
| low | 60 | 17.6 | 25.3 | 41.8 | 0.000 |
| low | 150 | 24.3 | 25.6 | 45.3 | 0.000 |
| low | 300 | 25.0 | 26.8 | 65.7 | 0.000 |

At300, Low25.0 versus Default41.7ms reproduces the scoped presentation benefit;
60-actor Low is17.6ms,150-actor Low24.3ms. All eighteen actual sample durations
are at least60s, all populations remain exact, and browser errors/stalls>100ms
are zero. Historical P4's300-actor Default/Low41.7/25.1ms provides context, not
a new before-build causal comparison. No matched historical60/150 baseline is
invented. These software-renderer observations do not establish physical targets.

Raw [Default](P6_DEFAULT_FINAL.json), [Low](P6_LOW_FINAL.json),
[summary/integrity validation](P6_FINAL_SUMMARY.json) and
[frozen tool source hashes](P6_FROZEN_SOURCES.json). All original frozen tool
hashes and both recordings' runtime source maps match; production runtime,
assets, tuning and dependencies are unchanged. Later Firefox-only test support
is separately source-hashed with its application results.

## Acceptance still open

**The P6 software/readiness-tool slice is verified. P5 and overall device/browser
acceptance remain open.** Native Safari cannot create a driver session until its
own automation setting is enabled. Missing branded/platform combinations and
physical older integrated-GPU evidence remain pending; the owner confirms no
older device exists in the workspace. Do not rerun unchanged accepted campaigns.

Session12 ended with that decision pending. On 2026-10-20 the owner explicitly
replies “yes proceed”: planned C1–C7 may proceed in dependency order after the
verified software gate, while missing device/browser evidence remains
release-blocking. C1 foundation is the first implementation slice; no missing
acceptance is marked passed.
No phase/device gate is silently waived. This slice is local; no new push, PR,
merge, deployment or workflow dispatch. PR26's older matching-head CI remains
explicitly separate from the later local source.
