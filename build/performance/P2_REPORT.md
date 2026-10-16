# P2 — Repeated minimap and HUD work

Status: **P2 software gate verified 2026-10-13.** Confirmed repeated work is
removed; no meaningful frame-rate improvement or older-device acceptance is
claimed. P3 is next; P4–P6 readiness remains gated.

## Confirmed work and implementation

Before source: archived `6f9ec78`, the Q5 verification-record head, now merged
into main by PR #24 (`d721ac5`). The archive at
`/private/tmp/arena-p2-session-20261013/before/` isolates game source/assets from
working-tree edits; only the measurement script is extended there. Node tooling
is shared with the same installed lockfile. After source changes only P2's
presentation paths. Source/build digests are recorded with the final comparison.

The old scene prepares five collection arrays (spread + filter for two Sets,
one site filter) and a view object on every update, including OFF/overlay-hidden
maps. MinimapUi clears graphics before its visibility return. Visible draws
parse six colours, create three local helper closures and allocate one coordinate
tuple per point plus a player array. Under a 300-live fixture, that means 301
point tuples per draw. Short CDP profiles capture these executed paths; they do
not establish a dominant bottleneck or a per-function causal frame-time saving.

P2 guards before hidden-map collection reads, reuses three bounded actor-reference
buffers and one view/player point, resolves colours once per map, and draws
scalar coordinates. Hidden maps do no preparation/graphics work. Visible-map
refresh remains every frame; no cadence/tuning change is justified. The world
viewport, actor geometry and consumed-site exclusion stay unchanged. Borrowed
references are presentation-only, population-bounded and released on restart.

Phaser 3.90 Text.setText already joins arrays and compares the final string
before updateText. Stable HUD text therefore was not uploading a texture every
frame. The reduction is in selector/format/array preparation and unchanged setter
calls. P2 compares displayed health/clock boundaries and other scalar dependencies;
health/XP bars retain exact fractions and update on every call. Origin counts
are compared individually because their ledger mutates in place. Natural,
fragmentation, Bagged Waste and environment live/cumulative accounting remains
owned by the existing event-driven ledger. Pause/upgrade overlays already render
on show/change/resize; no per-frame overlay rebuild was observed or changed.

## Reproduction and scope

Run serially with no other browser suite on the owned ports. The ordinary review
server on 4213 is not reused or stopped. Recorder owns 4173 test / 4174 production,
fails if already served, and terminates its own servers. Fresh contexts, 1280×720
viewport / DPR 1, 1600×900 logical canvas, 0.5 gameplay rate, 10-second warmup,
three ≥60-second samples per variant and build. Asset boot, load preparation,
settings setup and warmup are outside the page-rAF/CDP window. Page samples retain
feedback/choices where present; hidden tabs are excluded. No CPU profiler or
call-count wrappers run in the sustained comparisons.

```sh
npm run measure:performance -- --mode test --scenario capacity --loads 300 --interface visible,hidden,paused --seconds 60 --warmup 10 --repeats 3 --output build/performance/P2_LOCAL_CAPACITY.json
npm run build
npm run measure:performance -- --mode production --interface visible --seconds 60 --warmup 10 --repeats 3 --screenshots /private/tmp/arena-p2-production --output build/performance/P2_LOCAL_PRODUCTION.json
npm run measure:performance -- --mode test --scenario capacity --loads 300 --interface visible,hidden,paused --seconds 5 --warmup 2 --repeats 1 --profile --output build/performance/P2_LOCAL_WORK.json
```

The test capacity fixture holds exactly 300 mixed live enemies, with weapons,
contact, XP and hazards disabled; all arrivals are benchmark origin. It measures
calm crowd/physics/UI work with test telemetry included, not combat acceptance.
Report actual visible counts separately from live counts. Paused-overlay samples
measure ongoing page/render/UI work with physics paused. Their active-update
sampler has zero samples here and is not paused-window CPU evidence.

Production uses ordinary patrol/first-choice input with no gameplay overrides,
and has no internal population/update CPU telemetry. Its population is explicitly
unavailable, never substituted with the test fixture's count. CDP ScriptDuration
is browser main-thread script seconds in the actual sampled window, not GPU time
or process CPU percentage. Test RunScene update distributions are rolling active
samples from scene creation, which can include warmup/pre-window play; they
exclude Phaser's physics/render work outside RunScene.update and intentional
pause/hit-stop/focus interruptions. They are reported separately from page wall
intervals and CDP windows. Heap endpoints are GC-dependent, not allocation/leak
proof. Short call-count/CPU probes include profiling overhead and establish work
execution, not sustained throughput.

## Measurements

Device/renderer verified in the before records: Apple M5 Pro, 48 GiB,
macOS 26.5.2 / Darwin 25.5.0 / arm64, Node 20.20.2, Chromium 151.0.7922.34, ANGLE/Vulkan
SwiftShader software WebGL. These are distinct from the historical P1 Metal
hardware recordings. No headed/hardware run is included in this P2 comparison.

Before records: [initial nine windows](P2_BEFORE_CAPACITY.json),
[quiet visible replacement](P2_BEFORE_VISIBLE_QUIET.json),
[short work probes](P2_BEFORE_WORK.json), [source digests](P2_SOURCE_DIGESTS.json).
The first visible set overlapped short local checks and remains exploratory;
all three quiet replacements are used, with no fastest-run selection. Before
hidden/paused windows were isolated. All 12 before sustained windows are ≥60 s,
hold exactly 300 live actors and have zero browser errors or sampled >100 ms
page intervals. Paused windows have zero active-update samples, so their update
CPU is unavailable, not zero-cost.

Short before work probes (5 s, 2 s warmup, profiler/wrapper overhead included):

| State | HUD update calls | HUD setText calls | Text texture updates | Map update calls | Hidden map calls | Enemy references prepared |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Visible | 151 | 755 | 2 | 151 | 0 | 45,300 |
| OFF | 265 | 1,325 | 2 | 265 | 265 | 79,500 |
| Paused | 231 | 1,155 | 0 | 231 | 231 | 69,300 |

The OFF/paused map inputs are prepared before MinimapUi receives them. Visible
source executes 301 point-tuple allocations and six colour conversions per map
draw. Text texture work is already change-only; report its retained count instead
of claiming every setter was an upload. Raw CPU traces are retained locally at
`/private/tmp/arena-p2-session-20261013/P2_BEFORE_WORK-*.cpuprofile`.

All paired records and all-repeat tables follow. Source hashes and production
bundle hashes identify the actual measured inputs; the after build is the P2
delta on `6f9ec78`. Production population/update CPU is unavailable by design.

## Validation and limits

Final types/lint/build pass; **438 units / 52 files**, **13 serial targeted
browsers**, **88 full Chromium passes / one existing opt-in skip**, and **three
serial stress cases** pass with zero retries. The built production check verifies
emitted diagnostic exclusion, boot/play/pause, stat/tool/atlas paths and no browser
errors. Both production themes' real HUD/minimap Canvas fixtures and rendered
screenshots are checked; sustained WebGL comparison uses the active eco pack.

**24 primary warmed ≥60 s windows** pass (18 test plus six production), with
three retained exploratory visible baselines and six short work probes. Every
primary test window retains exactly 300 live actors. Visible-map SwiftShader
p95 remains above the provisional 40 ms criterion, so readiness/hardware acceptance
is not implied by the software gate. Actual all-repeat values/exclusions follow.
The before/after production endpoint screenshots and the three targeted interface
captures were visually inspected. Raw CPU traces and visual captures remain local.

Full Chromium uses four workers for correctness; stress and every performance
window run serially without another browser suite. Build retains the existing
large-chunk advisory. Game entry: 1,615.38 kB / 376.70 kB gzip before;
1,617.02 kB / 377.19 kB gzip after. No dependency/balance change: audit/balance were not rerun
in P2; Q5's zero-vulnerability audit and latest merged-head Actions remain the
verified dependency checkpoint. New draft PR Actions must verify its new head.
The initial settings-button/timing and vite-node browser-import failures remain
failed setup probes, not passing recordings. Production cap remains 300. M5 Pro
Metal P1 headroom is historical and distinct from these software-rendered results.
Physical older-device and mixed-combat acceptance remain pending. P3 is gated
until P2's software gate passes; optional content and sprite work have not started.

<!-- P2 TABLES START -->
### Sustained test build, 300 live mixed actors

[After records](P2_AFTER_CAPACITY.json); every primary window is ≥60 s after 10 s warmup. Live count is exactly 300 throughout.

| Build / state / repeat | Visible range | Wall p95 / p99 / max ms | >100 ms % | Rolling update p95 ms | CDP script s / window |
| --- | --- | --- | ---: | ---: | ---: |
| Before / visible / 1 | 289–293 | 41.7 / 42.1 / 50.0 | 0.000 | 0.9 | 6.2340 |
| Before / visible / 2 | 290–293 | 41.7 / 41.8 / 50.0 | 0.000 | 0.9 | 6.2343 |
| Before / visible / 3 | 288–295 | 41.4 / 41.8 / 68.8 | 0.000 | 0.9 | 6.2090 |
| Before / hidden / 1 | 281–289 | 25.0 / 25.4 / 42.1 | 0.000 | 0.8 | 3.1078 |
| Before / hidden / 2 | 283–289 | 25.1 / 25.7 / 33.2 | 0.000 | 0.8 | 3.1652 |
| Before / hidden / 3 | 282–289 | 25.0 / 25.6 / 43.9 | 0.000 | 0.9 | 3.1439 |
| Before / paused / 1 | 300–300 | 25.4 / 25.9 / 34.0 | 0.000 | unavailable | 2.0958 |
| Before / paused / 2 | 300–300 | 25.2 / 25.9 / 33.6 | 0.000 | unavailable | 2.0939 |
| Before / paused / 3 | 300–300 | 25.3 / 25.8 / 33.9 | 0.000 | unavailable | 2.0761 |
| After / visible / 1 | 288–293 | 41.2 / 41.7 / 53.3 | 0.000 | 0.8 | 6.0760 |
| After / visible / 2 | 285–297 | 42.0 / 42.1 / 50.3 | 0.000 | 0.8 | 6.2426 |
| After / visible / 3 | 287–296 | 41.7 / 41.8 / 50.1 | 0.000 | 0.8 | 6.2540 |
| After / hidden / 1 | 283–289 | 24.8 / 25.4 / 53.8 | 0.000 | 0.8 | 3.0831 |
| After / hidden / 2 | 282–291 | 24.9 / 25.5 / 38.7 | 0.000 | 0.8 | 3.0480 |
| After / hidden / 3 | 284–290 | 25.0 / 25.8 / 42.5 | 0.000 | 0.8 | 3.1231 |
| After / paused / 1 | 300–300 | 25.3 / 26.6 / 34.9 | 0.000 | unavailable | 2.0356 |
| After / paused / 2 | 300–300 | 25.5 / 33.0 / 55.2 | 0.000 | unavailable | 2.0863 |
| After / paused / 3 | 300–300 | 25.1 / 32.6 / 48.0 | 0.000 | unavailable | 2.0314 |

Medians (three repeats, never fastest-only):

- visible: wall p95 41.7 → 41.7 ms; CDP script 6.2340 → 6.2426 s/window (+0.1%).
- hidden: wall p95 25.0 → 24.9 ms; CDP script 3.1439 → 3.0831 s/window (-1.9%).
- paused: wall p95 25.3 → 25.3 ms; CDP script 2.0939 → 2.0356 s/window (-2.8%).

These are scoped observations on one software renderer with scheduling and actual-visible-population spread, not isolated function costs or physical GPU acceptance. The work counters below establish which calls disappear.

### Production build, ordinary gameplay

[Before](P2_BEFORE_PRODUCTION.json), [after](P2_AFTER_PRODUCTION.json). Three serial ≥60 s windows each; map visible, ordinary patrol and first-choice input, 10 s warmup. No internal population or update CPU telemetry is available in production.

| Build / repeat | Wall p95 / p99 / max ms | >100 ms % | CDP script s / window |
| --- | --- | ---: | ---: |
| Before / 1 | 16.8 / 17.5 / 41.6 | 0.000 | 1.2807 |
| Before / 2 | 16.7 / 24.1 / 42.0 | 0.000 | 1.2878 |
| Before / 3 | 17.0 / 21.0 / 49.8 | 0.000 | 1.3031 |
| After / 1 | 16.8 / 24.6 / 41.9 | 0.000 | 1.2872 |
| After / 2 | 16.8 / 24.6 / 51.1 | 0.000 | 1.2971 |
| After / 3 | 17.0 / 20.8 / 33.2 | 0.000 | 1.3061 |

Production median p95: 16.8000 → 16.8000 ms (+0.0%).
Production median script: 1.2878 → 1.2971 s/window (+0.7%).

The production population is unavailable, rather than assumed equal to the fixture. Gameplay randomness/choices and scheduling limit attribution. No function-specific or older-device improvement is inferred from this small sample.

### Short after work probes

[After probe records](P2_AFTER_WORK.json), same 5 s / 2 s warmup protocol as before. Profiling overhead is included; these are work-count probes, not throughput windows.

| State | HUD updates | setText calls | Texture updates | Map calls | Hidden map calls | Enemy inputs |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| visible | 155 | 10 | 2 | 155 | 0 | 46500 |
| hidden | 274 | 10 | 2 | 0 | 0 | 0 |
| paused | 245 | 0 | 0 | 0 | 0 | 0 |

Texture updates remain change-driven in both builds. OFF/paused after probes must have zero map updates/inputs; stable paused HUD must have zero text setters. Probe frame counts differ, so compare per-update work, not raw frame totals. Visible palette parsing and point-tuple allocations are removed by the executed source; graphics still redraw every visible frame. Raw traces remain local under `/private/tmp/arena-p2-session-20261013/`.

<!-- P2 TABLES END -->

Serial stress passes all presets in 32.6 s. Short sampled maxima are
41.7 / 41.7 / 50.1 ms with peaks 288 / 296 / 296 visible; these short
correctness fixtures are separate from sustained comparisons.
