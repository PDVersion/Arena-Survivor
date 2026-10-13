# P3 — Measured committed-kill window overhead

Status: **P3 software gate verified 2026-10-14.** P3 only; P4–P6 and content remain unstarted.

## Attribution and selected change

Frozen before game source is archived `64e77c4` at
`/private/tmp/arena-p3-session-20261013/before/`; after archives differ only in
`src/game/systems/statistics/run-statistics.ts`. Separate knight archives select
the retained production pack through its existing active-theme facade. Installed
lockfile/dependencies are shared, unchanged. No game source/HMR edits occur inside
measured game trees. Measurement tooling is opt-in, outside runtime bundles.

Short CPU/allocation probes trace dense crowd/index/separation and repeated mixed
combat, targeting/fire, effects, causal queues and fragment bursts. Dense test
telemetry dominates sampled work (`countCoincidentPairs`), and is excluded as
production simulation attribution. In the combat probe `recordCommittedKill`
has 218.2 ms sampled self CPU in ten seconds. Inclusive wrapped methods overlap:
causal processing is 411.6 ms, explosion handling 331.5 ms and committed damage
311.5 ms; they are not additive function costs. No queue/separation refactor or
object pool is justified by this evidence. Raw profiles stay local; summarized
executed paths are in [profile evidence](P3_PROFILE_SUMMARY.json).

Each kill previously filtered the entire immutable recent-kill window and copied
its survivors again with spread. One pass now builds one owned result array,
appends the new timestamp and freezes it. Timestamp iteration order, strict lower
expiry boundary, inclusive current-time boundary, exclusion of future values,
kill count and largest-chain high-water remain identical. Earlier statistics and
arrays stay immutable; damage breakdown/upgrade references remain unchanged.
No timestamp ordering/monotonic-clock assumption is introduced. No simulation
rate, tuning, target rules, causal/reward/capacity work, actor/body, sprite,
queue budget, theme contract or persistence schema changes.

Differential regressions compare every result with the previous algorithm across
3,000 events: same-time dense bursts, exact five-second gaps and non-monotonic
inputs, plus unsorted/future/duplicate timestamps and retained prior snapshots.
The existing event/effect/targeting/crowd/weapons/skills/content suites continue to
exercise both production themes, tie order, exact-once reward and ledger rules.

## Protocol and limits

Apple M5 Pro / 48 GiB, macOS 26.5.2 / Darwin 25.5.0, Node 20.20.2,
Chromium 151.0.7922.34. Renderer identity is recorded per window; headless ANGLE/
Vulkan SwiftShader software WebGL is comparative evidence, not older integrated
GPU acceptance. Fresh contexts, 1280×720 / DPR 1, logical canvas 1600×900,
theme-owned 0.5 gameplay rate, ten-second warmup and three serial >=60-second
windows per build/scenario. Ports 4173/4174 are owned by each recorder; review
server 4213 is not used/stopped. Browser suites/builds do not overlap sustained
measurements. Short CPU/wrapper/heap probes are separate and include overhead.

Dense holds a calm 300-live mixed crowd with no weapon/contact/XP/hazards.
Distributed holds the same count while its measurement-only controller places
bodies on a 100-unit grid before their ordinary chase/separation each frame;
controller time is included equally and reported, and this fixture is not ordinary
play. Combat replenishes vacant slots through existing retained causal spawn
requests once per 1,000 simulated ms, mixed roles at 70 units, compound skills,
crit 1.4, pierce 8, attack bonus 3, no contact/XP/hazards. It exercises repeated
explosions/fragment/offspring releases over the whole window, not a sustained
300-live combat population: actual live/visible ranges are reported. These test
fixtures are not human survival or full mixed-combat readiness acceptance.

Production is ordinary patrol/first-choice gameplay without writable hooks or
internal diagnostics. Its population and update CPU are **unavailable**; fixture
counts are never substituted. Page rAF records p95/p99/max and >100 ms intervals,
including choices/feedback, excluding hidden-tab intervals and setup/warmup.
CDP script time is browser main-thread seconds over that exact window. Test update
CPU is the rolling active RunScene sampler from scene creation (4096 capacity),
which may include warmup; it excludes physics/render outside update and intentional
pauses/hit-stop/focus interruption. The update maximum is the lifetime active
maximum, not an isolated window maximum; controller counters include their
setup/warmup. Heap endpoints/sampling are GC dependent;
short heap profiles represent sampled outstanding allocations, not total churn
or leak proof. No renderer cost is attributed to simulation.

Fixed-work complements browser timing: frozen windows of 0/300/3000 timestamps,
1,000 warmup calls then 10,000 calls, three serial repeats per size/build,
identical checksum. It is a Node microbenchmark, not a frame-rate claim. Initial
exploratory overlapping microbenchmarks were discarded and both builds rerun
serially. A first archived browser probe completed but could not write Git metadata
because archives lack `.git`; the corrected explicit archive metadata rerun passes.
Sandbox Chromium launch failed; permitted outside-sandbox retry passes.

The first eco combat before records inherited the older generic capacity note
("no weapon") and lack a pre-window kill snapshot. Their `p3=combat` options,
actual damage/effect counters and the archived recorder confirm weapons/compound
skills were active; final cumulative kills include setup/warmup. Later recorder
notes clarify fixture overrides and include window-start counters. Raw records
are retained unchanged; comparisons use actual measured frame/script windows.

Source identities: [full game-tree digests](P3_SOURCE_DIGESTS.json).
Fixed work: [before](P3_BEFORE_FIXED_WORK.json), [after](P3_AFTER_FIXED_WORK.json).

## Deferred pre-existing pickup retention

Baseline-only pressure probe drops 80 pickups every 500 simulated ms at a distant
point with weapons/contact/hazards disabled. It performs 800 wrapped cap checks
in ten seconds (~18.1 ms inclusive), so it does not displace the measured kill
hotspot. The confirmation probe reports **250 active / 535 tracked pickups**,
1,040 drops, 790 merges and no collections. Thus 285 inactive references remain
in the scene set, while the live actor cap is respected. This predates P3's only
runtime delta. In `dropExperience`, the destroy listener is registered *after*
`enforcePickupCap`; a newly dropped pickup can be absorbed/destroyed before its
set-removal listener exists. Record as a P5 lifecycle investigation/fix with a
focused exact-reward/restart/retained-reference regression. P3 does not change
this scene path or claim lifecycle readiness. See REC-117 once recorded.

The after ten-second combat probe samples `recordCommittedKill` at 68.9 ms self
CPU versus 218.2 ms before, while exercising 2,987 explosions / 11,586 damage
calls versus 2,869 / 10,871. These separate overhead-bearing probes support the
attribution and do not replace sustained windows or fixed-work timings.

## Pause and recovery

Owner paused after the last active checkpoint at 06:19:22 UTC on October 13 and
resumed at 22:32:28 UTC (October 14 AEDT). The inherited recorder continued after
the pause and exited at 06:32:56 UTC; no final verification or commit ran then.
Post-pause after-production results contain substantial stalls and cannot support
a quiet comparison: they remain in [uncontrolled after records](P3_AFTER_PRODUCTION_POST_PAUSE.json).
Original quiet before-production results remain in [initial before records](P3_BEFORE_PRODUCTION_INITIAL.json).
Both production builds are remeasured as a matched serial set during recovery,
without changing or selecting individual repeats. The paused gap is excluded from
active work accounting; background recorder completion is counted conservatively.
Source-tree digests and owner-file backups are rechecked before continuation.

## Measurements and final gate

The eco mixed-burst comparison already shows reproducible CPU savings: median
rolling update p95 **4.3→2.9 ms (-32.6%)**, CDP script **6.7505→5.7091 s (-15.4%)**,
with unchanged median wall p95 **33.4→33.4 ms**. Actual cumulative kills are
20,332–20,615 before and 20,601–20,821 after; timing/randomness/population variation
limits causal attribution, and no frame-rate or older-device win is claimed.
Fixed-work median 10,000-call CPU is **67.055→16.741 ms** (300 timestamps) and
**699.874→168.493 ms** (3,000), ~75% less, identical checksum 99,090,000.

All **30 primary warmed >=60 s windows** are recorded and checked: 24 test plus
six matched recovery production windows. Every primary calm test window retains
300 actors; every combat record reconciles its damage ledger and stays at/below
the enemy cap. Primary sampled >100 ms intervals are reported per row. Six initial
production windows remain separate (including three after-pause exploratory runs).
Final correctness gate passes: **440 units / 52 files**, types/lint/build,
production exclusion/boot/play/pause/tool paths, **7 targeted browsers**, **88 full
Chromium passes / one existing opt-in skip**, and **3 serial stress cases**, zero
retries. [Structured command results](P3_GATE_RESULTS.json),
[production check](P3_PRODUCTION_CHECK.json). Physical older-device
acceptance remains pending; cap remains 300. No dependency/tuning changes, so
balance/audit are not part of this phase; Q5 remains the dependency checkpoint.

Reproduction:

```sh
npm run measure:performance -- --mode test --scenario capacity --loads 300 --interface hidden --p3 combat --seconds 60 --warmup 10 --repeats 3 --source-revision 64e77c4 --source-state archived --output build/performance/P3_LOCAL_COMBAT.json
# Replace combat with dense or distributed for calm comparisons.
# In isolated archives only, select the existing knightMagicTheme for projectile comparison.
npm run build
npm run measure:performance -- --mode production --seconds 60 --warmup 10 --repeats 3 --output build/performance/P3_LOCAL_PRODUCTION.json
npx vite-node scripts/performance-p3.ts --output build/performance/P3_LOCAL_FIXED_WORK.json
# Short work/allocation trace, never used as sustained throughput evidence:
npm run measure:performance -- --mode test --scenario capacity --loads 300 --interface hidden --p3 combat --seconds 10 --warmup 2 --repeats 1 --profile --output build/performance/P3_LOCAL_PROBE.json
```


Ordinary production medians are **16.9→17.5 ms** wall p95 and
**1.1889→1.3000 s** CDP script (+9.3%). These runs do not establish an ordinary-play
speedup; population, random combat and other scheduling cannot be attributed
without internal production telemetry. Keep this observation alongside the scoped
burst savings rather than extrapolating them to all play or choosing faster runs.
Game bundle is 1,617.02→1,617.05 kB, gzip 377.19→377.19 kB; the existing chunk
advisory remains. Physical older-device, visible-map criterion and full sustained
300-live mixed-combat acceptance are separate pending readiness work.

## All-repeat sustained records

| Scenario / build / repeat | Actual live / visible range | Wall p95 / p99 / max ms | >100 ms % | Update p95 / p99 (rolling) / max (lifetime) ms | CDP script s | Final cumulative kills |
| --- | --- | --- | ---: | --- | ---: | ---: |
| combat / before / 1 | 0–239 / 0–239 | 33.30 / 34.10 / 43.70 | 0.000 | 4.30 / 8.70 / 13.50 | 6.7505 | 20332 |
| combat / before / 2 | 0–245 / 0–245 | 33.40 / 34.00 / 42.50 | 0.000 | 4.50 / 8.80 / 12.90 | 6.7374 | 20426 |
| combat / before / 3 | 1–221 / 1–221 | 33.40 / 33.90 / 42.50 | 0.000 | 4.30 / 8.80 / 15.40 | 6.7992 | 20615 |

| combat / after / 1 | 0–222 / 0–222 | 33.40 / 33.70 / 42.20 | 0.000 | 2.90 / 4.30 / 7.20 | 5.7091 | 20821 |
| combat / after / 2 | 1–199 / 1–199 | 33.30 / 33.50 / 43.70 | 0.000 | 2.90 / 4.20 / 6.90 | 5.7435 | 20601 |
| combat / after / 3 | 1–297 / 1–297 | 33.40 / 33.40 / 45.00 | 0.000 | 2.90 / 4.40 / 6.40 | 5.6002 | 20755 |

| dense / before / 1 | 300–300 / 280–291 | 25.00 / 25.30 / 25.90 | 0.000 | 0.80 / 1.30 / 6.60 | 2.9130 | 0 |
| dense / before / 2 | 300–300 / 280–289 | 24.60 / 25.10 / 41.00 | 0.000 | 0.80 / 1.30 / 6.60 | 2.9020 | 0 |
| dense / before / 3 | 300–300 / 281–288 | 24.70 / 25.30 / 55.90 | 0.000 | 0.80 / 1.30 / 6.90 | 2.9189 | 0 |

| dense / after / 1 | 300–300 / 286–291 | 24.60 / 24.90 / 46.00 | 0.000 | 0.70 / 1.30 / 6.50 | 2.8819 | 0 |
| dense / after / 2 | 300–300 / 284–291 | 25.10 / 25.20 / 26.00 | 0.000 | 0.80 / 1.30 / 6.70 | 2.9145 | 0 |
| dense / after / 3 | 300–300 / 277–290 | 25.10 / 25.30 / 49.70 | 0.000 | 0.80 / 1.30 / 8.00 | 2.9177 | 0 |

| distributed / before / 1 | 300–300 / 45–45 | 16.90 / 17.60 / 99.90 | 0.000 | 0.60 / 1.20 / 6.60 | 2.8833 | 0 |
| distributed / before / 2 | 300–300 / 45–45 | 17.10 / 17.70 / 33.50 | 0.000 | 0.60 / 1.30 / 6.50 | 2.8457 | 0 |
| distributed / before / 3 | 300–300 / 45–45 | 16.80 / 17.40 / 25.40 | 0.000 | 0.60 / 1.20 / 6.60 | 2.8440 | 0 |

| distributed / after / 1 | 300–300 / 45–45 | 16.80 / 17.60 / 25.10 | 0.000 | 0.60 / 1.20 / 6.60 | 2.9274 | 0 |
| distributed / after / 2 | 300–300 / 45–45 | 17.00 / 18.30 / 25.30 | 0.000 | 0.60 / 1.20 / 6.80 | 2.8687 | 0 |
| distributed / after / 3 | 300–300 / 45–45 | 17.00 / 18.30 / 26.10 | 0.000 | 0.60 / 1.20 / 6.60 | 2.8533 | 0 |

| knight_combat / before / 1 | 0–171 / 0–171 | 33.40 / 33.60 / 41.60 | 0.000 | 3.90 / 5.90 / 9.00 | 6.1054 | 19729 |
| knight_combat / before / 2 | 0–165 / 0–165 | 33.40 / 33.60 / 43.30 | 0.000 | 3.80 / 5.50 / 12.00 | 6.0311 | 19774 |
| knight_combat / before / 3 | 0–195 / 0–195 | 33.40 / 33.70 / 41.70 | 0.000 | 3.70 / 5.40 / 11.30 | 6.0179 | 19648 |

| knight_combat / after / 1 | 0–168 / 0–168 | 33.40 / 33.70 / 57.60 | 0.000 | 2.30 / 3.10 / 5.90 | 4.9613 | 19973 |
| knight_combat / after / 2 | 0–168 / 0–168 | 33.40 / 33.80 / 41.80 | 0.000 | 2.40 / 3.20 / 6.20 | 4.9820 | 19786 |
| knight_combat / after / 3 | 0–172 / 0–172 | 33.40 / 33.70 / 50.80 | 0.000 | 2.40 / 3.10 / 6.90 | 5.0584 | 19822 |

| production / before / 1 | unavailable | 16.80 / 17.40 / 25.10 | 0.000 | unavailable | 1.1889 | unavailable |
| production / before / 2 | unavailable | 16.90 / 17.80 / 25.90 | 0.000 | unavailable | 1.1643 | unavailable |
| production / before / 3 | unavailable | 17.40 / 25.00 / 33.30 | 0.000 | unavailable | 1.2345 | unavailable |

| production / after / 1 | unavailable | 17.60 / 25.10 / 41.50 | 0.000 | unavailable | 1.3303 | unavailable |
| production / after / 2 | unavailable | 17.40 / 25.00 / 34.20 | 0.000 | unavailable | 1.2725 | unavailable |
| production / after / 3 | unavailable | 17.50 / 25.00 / 33.30 | 0.000 | unavailable | 1.3000 | unavailable |


Medians of all three repeats, never fastest-only:

| Scenario | Wall p95 before → after ms | Rolling update p95 before → after ms | CDP script before → after s |
| --- | --- | --- | --- |
| combat | 33.40 → 33.40 | 4.30 → 2.90 | 6.7505 → 5.7091 |
| dense | 24.70 → 25.10 | 0.80 → 0.80 | 2.9130 → 2.9145 |
| distributed | 16.90 → 17.00 | 0.60 → 0.60 | 2.8457 → 2.8687 |
| knight_combat | 33.40 → 33.40 | 3.80 → 2.40 | 6.0311 → 4.9820 |
| production | 16.90 → 17.50 | unavailable | 1.1889 → 1.3000 |

Raw records: [P3_BEFORE_COMBAT.json](P3_BEFORE_COMBAT.json), [P3_AFTER_COMBAT.json](P3_AFTER_COMBAT.json), [P3_BEFORE_DENSE.json](P3_BEFORE_DENSE.json), [P3_AFTER_DENSE.json](P3_AFTER_DENSE.json), [P3_BEFORE_DISTRIBUTED.json](P3_BEFORE_DISTRIBUTED.json), [P3_AFTER_DISTRIBUTED.json](P3_AFTER_DISTRIBUTED.json), [P3_BEFORE_KNIGHT_COMBAT.json](P3_BEFORE_KNIGHT_COMBAT.json), [P3_AFTER_KNIGHT_COMBAT.json](P3_AFTER_KNIGHT_COMBAT.json), [P3_BEFORE_PRODUCTION.json](P3_BEFORE_PRODUCTION.json), [P3_AFTER_PRODUCTION.json](P3_AFTER_PRODUCTION.json).

Final recording: 2026-10-13 22:48:12 UTC; continuation 15 min 44 s; counted work 79 min 52 s including original recorder completion, excluding inactive pause. Local phase delivery only.
