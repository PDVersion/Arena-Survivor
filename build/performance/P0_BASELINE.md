# P0 browser measurement baseline — 2026-10-12

Status: **P0 complete and verified**, including the final combined software gate. No optimization or older-device acceptance is claimed.
See REC-100/102–104 and [session progress](../../AUTONOMOUS_PROGRESS.md).

## Build and device

- Branch: `codex/v0.4.3`; parent `103afa7`, P0 working source delivered with this report.
- Apple M5 Pro, 18 logical CPUs, 48 GiB RAM, arm64; macOS 26.5.2 (25F84).
- Node 20.20.2 / npm 10.8.2; Playwright 1.62.1 / headless Chromium 151.0.7922.34.
- Renderer: **ANGLE / Vulkan SwiftShader software WebGL**. This is not the host's
  integrated GPU. No CPU or network throttle was configured.
- Browser viewport 1280×720, DPR 1; logical canvas 1600×900, world zoom 2,
  gameplay rate 0.5; fresh default presentation, minimap 60%, reduced motion off.
- Instrumented: Vite development `MODE=test`, localhost 4173. Production:
  `npm run build` output via Vite preview, localhost 4174; test global absent.

## Executed checks

| Command | Result |
| --- | --- |
| `npm run typecheck` | Pass after extensions |
| `npm test -- --run` | Pass, 408 tests / 47 files |
| `npm run lint` | Pass after extensions; known `prefer-const` fixed |
| `npm run build` | Pass, 1,670.50 kB entry / 390.04 kB gzip; existing chunk advisory |
| serial boot/load/frame measurement specs | Core pass, 3 tests, 4.2 s |
| `npm run test:e2e:stress -- --workers=1` | Final pass, 1 test / 11.5 s, zero retries |
| `npm run test:e2e:ci -- --retries=0` | Final pass, 72 tests / 1 opt-in skip, 2.6 min, zero retries |
| recorder smoke, 5 s × test/production | Pass, no browser errors; production live-play screenshot inspected |
| sustained recorder, 60 s × 3 × test/production | Pass, all six ≥60 s windows; no browser errors |
| short extended stress recorder × 3 | Pass, all reach scripted 300 peak; no browser errors |

The first sandboxed browser attempt failed **before test execution** with
`listen EPERM 127.0.0.1:4173`. Permitted local server/browser execution outside
the sandbox succeeded. No failed test was hidden with retries.

## Reproduce

```sh
npm run build
npm run measure:performance -- --seconds 60 --warmup 10 --repeats 3 --output build/performance/P0_SAMPLES.json
npm run measure:performance -- --scenario stress --mode test --seconds 5 --warmup 0 --repeats 3 --output build/performance/P0_STRESS.json
npm run test:e2e:ci -- --retries=0
npm run test:e2e:stress -- --workers=1
```

The recorder owns its servers and refuses occupied 4173/4174 ports. Use one
measurement worker and a quiet browser/machine. Do not run builds/tests alongside
performance samples. Optional `--screenshots /absolute/path` captures endpoint
images; this session's images are outside Git under
`/private/tmp/arena-p0-session-20261012/sustained/`.

Machine-readable recordings: [default windows](P0_SAMPLES.json),
[short stress windows](P0_STRESS.json). They include device/browser/renderer,
mode, revision/dirty-state, scenario, units, controls and limitations.

## Sustained default page-frame windows

Each fresh context starts ordinary gameplay, warms up 10 real seconds, then
records 60 real seconds while patrolling right/down/left/up in 5-second legs
and pressing the first upgrade choice every 500 ms. No invulnerability,
shortened duration, tuned stats, suppressed XP or hazard override is used.
Test repeats 1/2 remain playing throughout the sampled page window; repeat 3
contains 19 level-up frames. Production's endpoint screenshot shows live play
(health 70/100, level 2, 38 on site, about 35 simulated seconds).

**Page rAF includes all page states**, separately from the active-play sampler.
Production has no test bridge to classify pauses/feedback from outside; its
active-gameplay distribution and per-scene update CPU are not inferred.
The external bounded window retains at most 8,192 intervals. All six runs fit.
Every page window records **zero intervals >100 ms**.

| Mode / repeat | Frames | Avg ms | p50 ms | p95 ms | p99 ms | Max ms | Main-thread script s |
| --- | --- | --- | --- | --- | --- | --- | --- |
| test 1 | 3859 | 15.55 | 16.70 | 17.40 | 25.00 | 26.60 | 1.935 |
| test 2 | 3763 | 15.95 | 16.70 | 17.60 | 25.10 | 33.30 | 1.994 |
| test 3 | 3786 | 15.85 | 16.70 | 17.60 | 25.00 | 32.50 | 1.971 |
| production 1 | 3713 | 16.16 | 16.70 | 17.70 | 25.00 | 28.30 | 1.835 |
| production 2 | 3692 | 16.25 | 16.70 | 24.90 | 25.10 | 41.70 | 1.845 |
| production 3 | 3729 | 16.09 | 16.70 | 22.80 | 25.10 | 25.80 | 1.813 |

Production p95 spans **17.7–24.9 ms**; two repeats exceed the proposed 20 ms
reference-desktop target. This software-rendered page baseline therefore does
not consistently pass that provisional target and does not establish real-GPU
or older-device readiness. Include the full spread when comparing later work.

Instrumented active rolling-window p95 is **17.3–17.6 ms**, update elapsed p95
**0.20 ms** and p99 **0.70–0.80 ms**. Its lifetime update averages are
**0.122–0.129 ms**. These internal metrics begin at scene creation, include warm-up
in lifetime totals, exclude non-playing/feedback interruptions, and retain the
latest 4,096 accepted intervals for quantiles; the ring can include some warm-up.
They are not identical windows to the external 60-second page metric.

Chromium `ScriptDuration` measures main-thread script work across the external
window, not RunScene alone. `TaskDuration` was about 60 s in these 60 s software
renderer windows; it is not a GPU timer or a process CPU-utilization result.
Development/minification, instrumentation and gameplay differences prevent
attributing the production/test spread to telemetry alone.

## Short scripted 300-enemy burst

Scenario:
`/?frameMeasure=1&representativeLoad=1&closeLoad=1&loadHarness=300&compoundBuild=1&critChance=3.4&pierce=12&attackSpeedBonus=9&worldScenario=all&runDurationMs=1500&noXp=1&noContact=1&atTimeUp=complete`

The fixture is invulnerable, suppresses XP, enables a compound build/world and
ends after **1,500 simulated ms**. Every repeat reaches a 300-enemy peak and
processes all 300 scripted load requests. Combat rapidly reduces/replaces that
population; these are **short burst samples, not sustained 300-live benchmarks**.
The canonical stress test independently checks ledger, queues, presentation caps,
cleanup and repeated restarts. No active interval in these three samples exceeds
100 ms; p95 exceeds the provisional 40 ms worst-load target.

| Repeat | Samples | Avg wall ms | p50 wall ms | p95 wall ms | p99 wall ms | Max wall ms | Avg update ms | p95 update ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 119 | 31.47 | 33.30 | 41.70 | 41.70 | 41.70 | 1.65 | 2.50 |
| 2 | 115 | 33.22 | 33.30 | 41.70 | 42.50 | 44.60 | 1.67 | 3.30 |
| 3 | 116 | 32.82 | 33.30 | 41.70 | 41.70 | 41.80 | 1.77 | 2.80 |

The core sample before reporting extensions was 118 active intervals at
31.6051 ms average / 42.3000 ms maximum, peak 288 visible. The final canonical
stress gate reports 116 intervals at 33.9172 ms average / 49.9000 ms maximum,
peak 295 visible, with ledger/cleanup/restarts passing. These runs are neither
an optimization comparison nor proof that added instrumentation is free.
Historical REC-093's scaled values remain unchanged and are not comparable.

## Clocks, bounded work and next priority

- `load.averageFrameMs` / `maxFrameMs`: `game.loop.rawDelta`, Phaser's
  unsmoothed, unscaled browser interval. Active stalls stay included.
- `averageSimulationDeltaMs`: separately recorded scaled scene delta. Gameplay
  still uses its existing smoothed/scaled clock; measurement never drives rules.
- `averageUpdateCpuMs` / distribution: `performance.now()` elapsed synchronous
  RunScene update, including snapshot work. Phaser physics/render work outside
  this function and the sampler's final recording operation are excluded. It is
  an estimate of update CPU work, not whole-frame CPU or GPU duration.
- Active sampling excludes load preparation, non-playing states, feedback
  slowdown, hidden/focus changes and the first returning interval. Reduced
  motion can remove feedback slowdown without excluding the base 0.5 rate.
- Detailed quantiles are nearest-rank, bounded to 4,096 samples, refreshed every
  60 accepted samples during play and flushed on pause/terminal. Lifetime
  averages/maxima and rolling quantiles have separate counts/units.

Production has no `__ARENA_TEST__` interface or active measurement sampler.
Existing `publishTelemetry` calls/diagnostic reads remain emitted; P1 owns their
removal. The inert test-helper argument `frameMeasure` may remain as text in
minified output and cannot activate sampling outside `MODE=test`.

**Next: P1 production telemetry guard and an equivalent before/after recording.**
Retained diagnostic work is confirmed by source/build inspection; these results
do not isolate its causal cost or identify a function-level rendering hotspot.
Profile remaining CPU/render work after that guard rather than infer a minimap,
spatial or pooling change from this baseline.

## Remaining acceptance / blockers

- Representative real integrated-GPU / older 4–8 GiB device and another browser
  were not measured in this session; hardware acceptance remains **pending**.
- Sustained 60/150/300 mixed live-load fixtures, projectile-theme profiles,
  full authored run/overtime/10-restart soak and cold/network startup profiles
  remain later P/P6 work. The retained opt-in two-simulated-minute readability
  measurement was skipped in ordinary CI and was not separately executed.
- No dependency changes, balance changes or save/profile writes. Audit and
  `npm run balance` were not executed or needed for this measurement phase.
- Localhost sandbox denial was resolved by permitted execution; no outstanding
  software-validation blocker remains.
