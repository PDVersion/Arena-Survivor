# P1 — Production diagnostics and capacity measurements

Production avoids Run/Menu diagnostic snapshot construction and Run roster
high-water scans before any reads/selectors/allocations. Frame sampler construction
and boot-failure publication are also directly test-gated. The production checker
finds no test global or checked diagnostic fields and exercises normal play/pause
plus the separate sprite-browser entry. Test snapshots and the real gameplay
clock/ledgers remain intact. Production's enemy safety cap is **300**.

## Equivalent production comparison

Both builds use the verified Q2 gameplay (Normal, Microplastics first), Chrome
151.0.7922.34, Apple M5 Pro / 48 GiB, Darwin 25.5.0, WebGL through ANGLE/Vulkan
**SwiftShader software rendering**, 1280×720 / DPR 1, 1600×900 logical canvas.
Dedicated serial production preview on port 4174, 10 s warmup, 60 s page-rAF
sample, three fresh-context repeats per build. Ordinary rectangular patrol and
first-card selection; no combat overrides. The production comparison uses software WebGL; the later headed capacity probe
uses the local hardware GPU. Older-device performance remains unmeasured. Endpoint screenshots show actual live play, not a dead/paused
window. Page samples include level-up choices/feedback; internal production state
is deliberately unavailable. CDP durations are main-thread script work, not total
process CPU utilization or GPU time. Collection has ordinary scheduling noise;
the after collector additionally records optional population fields (unavailable
in production). This is a scoped comparison, not exact per-function attribution.

Before: Q2 `7ff8bbf`, game-DnwDOTK8.js plus unchanged shared chunk. After: local P1
delta over Q2, game-BtaybQCp.js plus unchanged shared chunk. Raw records include
production build SHA256 maps: [before](P1_BEFORE.json), [after](P1_AFTER.json).
Q1/P0 gameplay recordings are historical, not equivalent to this new opening.

| Build / repeat | Frames | p95 ms | p99 ms | Max ms | CDP ScriptDuration s / 60 s | >100 ms intervals |
| --- | --- | --- | --- | --- | --- | --- |
| Before 1 | 4068 | 16.9 | 17.7 | 33.3 | 1.4382 | 0.000% |
| Before 2 | 3965 | 17.3 | 25.0 | 28.2 | 1.6065 | 0.000% |
| Before 3 | 3933 | 17.2 | 25.0 | 25.9 | 1.5925 | 0.000% |
| After 1 | 4029 | 17.1 | 25.0 | 33.3 | 1.4028 | 0.000% |
| After 2 | 3985 | 17.3 | 25.0 | 33.4 | 1.3621 | 0.000% |
| After 3 | 3977 | 17.2 | 25.0 | 41.7 | 1.3815 | 0.000% |

Median p95 stays **17.2 ms** before and after: no observed frame-rate improvement.
Median ScriptDuration decreases from **1.5925 s to 1.3815 s** (about 13.2% in
these windows), but three software-rendered recordings do not isolate a causal
CPU saving or prove broader device gains. The confirmed result is diagnostic
work exclusion and a ~9.23 kB smaller game chunk (~2.11 kB gzip); throughput
claims await broader measurement. All six windows have zero browser errors and
zero sampled >100 ms intervals. The existing chunk-size advisory remains.

Reproduction (build the selected before/after source before each recording):

```bash
npm run build
npm run check:production
npm run measure:performance -- --mode production --seconds 60 --warmup 10 --repeats 3 --output build/performance/local-production.json
```

## Controlled capacity sweep

All 12 software-rendered windows completed without browser errors, held exactly
the requested live population, and reported zero sampled >100 ms intervals.
Production stays at 300; `enemyCap` is a validated
**test-only** option, capped at 1000. The sustained mixed fixture disables weapon,
contact, XP and hazards, waits for the population, then warms up and samples.
It includes diagnostic scans and crowd/physics/minimap/sprite work. Report both
live and actually visible populations. All creations here are benchmark origin;
natural/fragmentation/environmental counts belong to real combat fixtures/runs.
This tests calm crowd capacity, not sustained mixed combat or older-device safety.

```bash
npm run measure:performance -- --mode test --scenario capacity --loads 150,300,450,600 --seconds 60 --warmup 10 --repeats 3 --output build/performance/local-capacity.json
```

The command also accepts `--headed` to exercise visible Chromium on the target
machine; always inspect the recorded renderer rather than assume hardware WebGL.
The 12-window sweep above is headless/software rendered; the headed follow-up
records the local Metal GPU explicitly.

Software results ([all repeats](P1_CAPACITY.json)); each row is 60 seconds after
10 seconds of warmup. Live counts remain exactly the requested count throughout:

| Live / repeat | Actually visible range | Page p95 ms | p99 ms | Max ms | Instrumented update p95 ms | >100 ms intervals |
| --- | --- | --- | --- | --- | --- | --- |
| 150 / 1 | 149–149 | 25.6 | 33.3 | 41.9 | 0.40 | 0.000% |
| 150 / 2 | 149–150 | 25.7 | 33.3 | 41.1 | 0.40 | 0.000% |
| 150 / 3 | 149–149 | 25.8 | 33.3 | 34.2 | 0.40 | 0.000% |
| 300 / 1 | 287–292 | 41.6 | 42.2 | 50.0 | 0.80 | 0.000% |
| 300 / 2 | 285–293 | 41.4 | 41.6 | 47.2 | 0.80 | 0.000% |
| 300 / 3 | 289–295 | 40.6 | 41.7 | 49.6 | 0.80 | 0.000% |
| 450 / 1 | 418–429 | 50.0 | 50.1 | 50.8 | 1.40 | 0.000% |
| 450 / 2 | 419–429 | 50.1 | 50.4 | 57.2 | 1.40 | 0.000% |
| 450 / 3 | 417–428 | 50.1 | 50.5 | 83.4 | 1.40 | 0.000% |
| 600 / 1 | 526–554 | 58.4 | 59.0 | 66.6 | 2.20 | 0.000% |
| 600 / 2 | 527–544 | 58.5 | 59.1 | 74.6 | 2.30 | 0.000% |
| 600 / 3 | 525–550 | 58.5 | 59.1 | 66.6 | 2.30 | 0.000% |

At 300, p95 **40.6–41.6 ms** is already just above the provisional 40 ms
worst-load criterion on SwiftShader. At 450 it is **50.0–50.1 ms**; at 600
**58.4–58.5 ms**. These software results do not justify a cap increase. Update
p95 is only ~.8 / 1.4 / 2.2–2.3 ms at those counts: it excludes engine/physics/
rendering outside RunScene.update, so do not label this a GPU bottleneck without
further attribution. Above-300 fixture correctness passed; frame-budget
acceptance did not. Visible counts are lower than live counts as the crowd
spreads beyond the cropped view.

The first headed smoke failed on `/favicon.ico` (preserved in
[failed probe](P1_HEADED_SMOKE_FAILURE.json)); a follow-up pinpointed the URL.
Explicit empty favicon metadata removes this request rather than excluding the
error. Resource diagnostics now retain the failing URL.

### Actual local Metal GPU

Six headed 60-second windows after 10-second warmup use the **Apple M5 Pro Metal
renderer** (same 1280×720 / DPR 1 and logical canvas), three repeats at each
300/600 live count. [Every hardware repeat](P1_HARDWARE_CAPACITY.json) completed
with the exact live population and no browser errors. These calm instrumented
fixtures differ in renderer/mode from headless results, and the visible crowd
spreads differently; do not treat them as an isolated GPU-cost calculation.

| Live / repeat | Actually visible range | Page p95 ms | p99 ms | Max ms | Instrumented update p95 ms | >100 ms intervals |
| --- | --- | --- | --- | --- | --- | --- |
| 300 / 1 | 279–289 | 17.2 | 18.5 | 18.8 | 1.10 | 0.000% |
| 300 / 2 | 277–287 | 18.1 | 18.6 | 18.7 | 1.10 | 0.000% |
| 300 / 3 | 283–290 | 18.1 | 18.5 | 18.8 | 1.10 | 0.000% |
| 600 / 1 | 490–507 | 17.7 | 18.5 | 18.8 | 2.40 | 0.000% |
| 600 / 2 | 489–509 | 18.0 | 18.6 | 18.8 | 2.30 | 0.000% |
| 600 / 3 | 506–517 | 17.5 | 17.6 | 100.1 | 2.30 | 0.028% |

At 600 live, **489–517 actually visible**, p95 **17.5–18.0 ms** meets the
provisional calm-window target on this modern local device. The third repeat
includes one **100.1 ms** interval (0.028%); it is retained rather than excluded.
This is evidence of headroom for a higher-cap candidate on this GPU. It does not
establish sustained combat/effects/fragmentation/queued births at 600, operation
on older integrated GPUs, or a supported production cap. Keep production at 300
pending those gates. The global cap and visible count are different quantities.

Reproduce on the target machine by adding `--headed`, and inspect its recorded
renderer rather than assuming hardware WebGL. Physical **older-device**
acceptance remains pending. No other browser engine was profiled.

Capacity approval needs the existing provisional wall-frame criteria (worst-load
p95 ≤40 ms; >100 ms intervals below 1%, plus p99/max) on a supported physical
older device, sustained mixed combat/fragmentation/site effects at each candidate,
exact ledgers/queues/caps, and lifecycle/cleanup evidence. Above-300 calm-fixture
success is not permission to raise the production cap. Desktop default's ≤20 ms
target is a different workload. Never change simulation timing to improve a score.

## Validation and next task

Core: 420 units / 50 files, typecheck/lint/build, seven focused browsers and
production build/boot check pass. All six production and eighteen capacity windows are recorded. **79 full Chromium regressions pass / one existing opt-in skip; all three
serial stress cases pass**. Two short transition waits were corrected to the
existing bounded simulation-time convention after a parallel-load timeout.
Final production build/check also passes after the favicon metadata fix (the
measured game JavaScript chunks are unchanged). Next eligible phase is P2 HUD/minimap profiling;
P3–P6 and physical device acceptance remain gated. Bagged Waste composition is
unchanged pending the owner's confirmation.
