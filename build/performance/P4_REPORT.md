# P4 — Lightweight minimap presentation

Status: P4 affected local gate accepted on 2026-10-15 under the owner’s limited-local-browser policy. Full-app Chromium/stress regression is deferred to Actions or a consolidated multi-session gate, not reported passed. P5 and content have not started.

## Change and attribution

Pause/title Settings now expose Presentation: Default / Low. This is memory-only session state, retained through restart/next run and reset by a fresh page/session. Default preserves the existing circular enemy minimap markers. Low uses theme-owned square enemy minimap markers at exactly the same centres and extents, with the same per-frame cadence, colour and opacity. Both production themes provide/validate the mapping. Player, hazard and site markers, world/actor/UI art, essential telegraphs, bodies, targeting, damage, rewards/XP, causal queues, difficulty, production cap 300 and 0.5 simulation rate are unchanged. No persistence, automatic quality policy, framebuffer/text-resolution change, new sprites or P5 pickup fix.

A separate ten-second dense-map CDP probe identifies Phaser GraphicsWebGLRenderer, arc path construction/earcut triangulation and batching. Source inspection confirms Graphics fillCircle records an ARC and fills a path; fillRect uses the renderer's direct batchFillRect branch. An isolated measurement-only square-marker experiment drops wall p95 41.7→25.0 ms and script time 1.2771→0.6788 s despite capturing more frames. The sampled renderer functions decline sharply; see P4_PROFILE_| dense | 35.40 / 5.9967 | 41.70 / 6.1687 | 25.10 / 3.1860 |
| combat | 33.40 / 6.0645 | 33.40 / 6.0398 | 33.40 / 5.7804 |
| production | 16.90 / 1.1908 | 17.50 / 1.1873 | 17.00 / 1.0123 |.json for all top sampled self times, counts and environment. Diagnostic countCoincidentPairs remains a separate test cost, not simulation or renderer attribution. Probe wrappers/CPU/heap sampling add overhead and are never enabled in sustained comparisons. This evidence supports simplifying the optional overview geometry; slower redraw cadence alone would still render retained circular Graphics paths each frame, so cadence was not changed.

## Frozen comparison protocol

Starting source is actual HEAD `05c1d4e` on `codex/v0.4.3` (local remote-tracking branch one commit behind; no push/PR/merge). Original eight dirty plan files and two prompts were backed up in `/private/tmp/arena-p4-session-20261015T004113Z/initial` with initial.patch, then preserved outside the P4 commit. Baseline game source is an immutable git archive; candidate source is a separate frozen archive overlaid with P4 runtime deltas. Opt-in collector supports both revisions with an optional structural settings type. No live-source/HMR edits, builds, unit tests or browser suites overlap sustained windows. All repeats run serially on owned ports 4173/4174; review server 4213 is untouched. Full source and emitted bundle hashes: P4_SOURCE_DIGESTS.json. Delivered source is checked against the measured candidate. Only these runtime paths differ:

- `src/game/content/define-theme.ts`
- `src/game/content/themes/eco-guardian/view.ts`
- `src/game/content/themes/knight-magic/view.ts`
- `src/game/core/archetypes/tuning.ts`
- `src/game/scenes/menu-scene.ts`
- `src/game/scenes/run-scene.ts`
- `src/game/state/settings-state.ts`
- `src/game/ui/minimap-ui.ts`
- `src/game/ui/pause-menu-ui.ts`

Apple M5 Pro / 48 GiB, macOS 26.5.2 / Darwin 25.5.0, Node 20.20.2, Chromium 151.0.7922.34, headless ANGLE/Vulkan SwiftShader software WebGL. No throttling or physical GPU measurement in P4. Viewport 1280×720, DPR 1, logical canvas 1600×900, 0.5 gameplay rate, Normal. Each build/mode/scenario uses three fresh serial contexts, ten seconds warmup and >=60 seconds measured time: 27 primary windows total. Every repeat is retained, including stalls. Test fixtures are not representative physical-device acceptance.

Dense sustains 300 calm live mixed actors, weapon/contact/XP/hazards disabled, visible map. Combat uses P3's replenished compound melee burst fixture, mixed roles within 70 world units, crit 1.4, pierce 8 and attack bonus 3; no contact/XP/hazards. It exercises explosions/fragments and reconciles the exact damage ledger, but does not sustain 300 live combat actors. Production uses ordinary patrol/first-card input, without internal hooks or diagnostics; actual population/update CPU remain unavailable. Low is selected through the real scaled Settings pointer path before warmup, not a writable state hook.

Page rAF wall p95/p99/max/>100 ms covers the sustained window, including choice/feedback time; hidden-tab intervals and setup/warmup are excluded. CDP ScriptDuration is main-thread script seconds over that same window, not renderer/GPU time. Test update CPU is the rolling active RunScene sampler (4096 capacity) from scene creation, potentially including warmup; its maximum is lifetime active maximum. It excludes render/physics outside update and intentional pauses/hit-stop/focus interruption. These CPU columns are not exact per-window totals and must not be added to renderer costs. Production never substitutes fixture values. Heap endpoints in raw records are GC dependent, not leak evidence.

## Sustained results

Medians of all three repeats; each cell is wall p95 ms / CDP script seconds:

| Scenario | Baseline | Candidate Default | Candidate Low |
| --- | --- | --- | --- |
| dense | 35.40 / 5.9967 | 41.70 / 6.1687 | 25.10 / 3.1860 |
| combat | 33.40 / 6.0645 | 33.40 / 6.0398 | 33.40 / 5.7804 |
| production | 16.90 / 1.1908 | 17.50 / 1.1873 | 17.00 / 1.0123 |

Baseline dense p95 varies across repeats; candidate Default must be reported alongside it, rather than assuming the earlier 41.7 ms probe is the baseline. This sequential local comparison cannot eliminate host scheduling/software-renderer variation. Low's geometry reduction and the independent renderer probe support scoped presentation savings; ordinary production and combat observations do not establish a universal frame-rate win. No older-device readiness claim is made.

| Scenario / build-mode / repeat | Live / visible range | Wall p95 / p99 / max ms | >100 ms % | Update p95 / p99 / lifetime max ms | CDP script s |
| --- | --- | --- | ---: | --- | ---: |
| dense / baseline / 1 | 300–300 / 285–293 | 33.50 / 41.70 / 49.90 | 0.000 | 0.80 / 1.40 / 10.00 | 5.9967 |
| dense / baseline / 2 | 300–300 / 283–292 | 35.40 / 41.80 / 41.90 | 0.000 | 0.80 / 1.40 / 10.10 | 5.9827 |
| dense / baseline / 3 | 300–300 / 280–296 | 41.60 / 41.70 / 83.50 | 0.000 | 0.80 / 1.50 / 10.10 | 6.0405 |
| dense / Default / 1 | 300–300 / 284–294 | 41.70 / 41.80 / 42.40 | 0.000 | 0.80 / 1.50 / 10.90 | 6.1687 |
| dense / Default / 2 | 300–300 / 281–293 | 41.70 / 41.80 / 83.70 | 0.000 | 0.80 / 1.60 / 10.90 | 6.2462 |
| dense / Default / 3 | 300–300 / 288–294 | 41.70 / 41.80 / 42.50 | 0.000 | 0.80 / 1.50 / 10.80 | 6.1643 |
| dense / Low / 1 | 300–300 / 281–289 | 25.10 / 25.30 / 66.60 | 0.000 | 0.80 / 1.30 / 7.10 | 3.2504 |
| dense / Low / 2 | 300–300 / 284–292 | 25.10 / 25.10 / 33.30 | 0.000 | 0.80 / 1.30 / 6.60 | 3.1860 |
| dense / Low / 3 | 300–300 / 288–292 | 25.10 / 25.30 / 26.00 | 0.000 | 0.70 / 1.20 / 6.80 | 3.1535 |
| combat / baseline / 1 | 0–235 / 0–235 | 33.40 / 33.70 / 42.00 | 0.000 | 2.80 / 4.30 / 11.30 | 6.0645 |
| combat / baseline / 2 | 1–212 / 1–212 | 33.50 / 41.60 / 41.80 | 0.000 | 2.90 / 4.30 / 14.40 | 6.0747 |
| combat / baseline / 3 | 0–235 / 0–235 | 33.40 / 41.60 / 41.80 | 0.000 | 2.90 / 4.60 / 11.80 | 6.0427 |
| combat / Default / 1 | 1–219 / 1–219 | 33.40 / 41.60 / 41.80 | 0.000 | 2.90 / 4.30 / 11.10 | 6.0848 |
| combat / Default / 2 | 1–207 / 1–207 | 33.40 / 34.20 / 41.70 | 0.000 | 2.90 / 4.00 / 13.20 | 6.0398 |
| combat / Default / 3 | 0–215 / 0–215 | 33.40 / 41.60 / 41.70 | 0.000 | 2.90 / 4.40 / 12.20 | 5.9555 |
| combat / Low / 1 | 0–264 / 0–264 | 33.40 / 33.90 / 35.00 | 0.000 | 2.70 / 4.00 / 6.30 | 5.6837 |
| combat / Low / 2 | 1–226 / 1–226 | 33.30 / 33.80 / 36.40 | 0.000 | 2.90 / 4.20 / 6.30 | 5.7804 |
| combat / Low / 3 | 2–218 / 1–217 | 33.40 / 33.70 / 35.00 | 0.000 | 2.80 / 4.00 / 6.50 | 5.8065 |
| production / baseline / 1 | unavailable | 16.90 / 24.90 / 41.60 | 0.000 | unavailable | 1.1930 |
| production / baseline / 2 | unavailable | 17.00 / 22.20 / 33.40 | 0.000 | unavailable | 1.1759 |
| production / baseline / 3 | unavailable | 16.90 / 24.90 / 33.30 | 0.000 | unavailable | 1.1908 |
| production / Default / 1 | unavailable | 17.60 / 24.70 / 34.30 | 0.000 | unavailable | 1.1873 |
| production / Default / 2 | unavailable | 17.50 / 24.90 / 33.40 | 0.000 | unavailable | 1.1773 |
| production / Default / 3 | unavailable | 16.80 / 17.50 / 25.70 | 0.000 | unavailable | 1.1923 |
| production / Low / 1 | unavailable | 17.20 / 18.50 / 33.20 | 0.000 | unavailable | 1.0162 |
| production / Low / 2 | unavailable | 16.90 / 17.90 / 32.60 | 0.000 | unavailable | 1.0113 |
| production / Low / 3 | unavailable | 17.00 / 17.60 / 33.40 | 0.000 | unavailable | 1.0123 |

All primary recordings have >=60-second windows, zero browser errors; dense retains exactly 300 live, combat stays within cap and reconciles its ledger. Raw records are the nine P4_BEFORE/AFTER_{DEFAULT/LOW}_{DENSE/COMBAT/PRODUCTION}.json files next to this report.

## Verification and exclusions

P4_GATE_RESULTS.json contains exact commands, timestamps and exit codes; retained command output stays in the local scratch directory. Types, complete units, lint/build and production exclusion/boot/play/pause/tool checks must pass. Only three affected browser cases per production theme run, serially with one worker and zero retries: mode reversal and paused-state equivalence, resize/pointer/opacity/reduced motion/restart, title-to-next-run/upgrade overlay, and dense-map visual/cap checks. Both-theme units execute the actual minimap methods against frozen inputs, compare Default→Low→Default centres/extents/essential markers, validate mode data, and compare seeded spawn/kill/XP model reports. The actual scene setting dispatcher is exercised with gameplay/queue/physics accessors that throw, showing the setting dispatcher needs only settings/presentation collaborators; the normal pause-view/telemetry helpers still read gameplay for display. Existing gameplay suites remain unchanged.

The initial Low smoke clicked the wrong scaled row and timed out; it is retained in P4_FAILED_COORDINATE_SMOKE.json, not included in timings. The corrected three-second smoke passes. A temporary generated browser config then failed to parse before tests; its baseURL key was fixed. The initial primary browser run passed two cases and found an incorrect test expectation that physical display dimensions remain unchanged after resize. The test now asserts fixed logical/world dimensions and an actual 900-pixel display; only the failed case was rerun, with zero automatic retries. Earlier command attempts/logs are retained in the scratch directory. The first baseline build rejected the shared collector's newly typed quality property; an optional structural type fixed collector compatibility with no baseline runtime change. All primary comparisons start after those corrections; no retry hides a game assertion.

Full `test:e2e:ci` and `test:e2e:stress` were deliberately not run locally under the owner's 2026-10-15 instruction. CI has not run on this local P4 work. The updated AGENTS.md records that whole-app suites belong in Actions or a consolidated gate after several sessions. Physical older-device/additional-browser, sustained 300-live mixed combat and longer lifecycle/startup acceptance remain pending. REC-117 pickup tracking remains a P5 blocker. No dependency/gameplay tuning changed, so no audit/balance rerun was needed. Next eligible phase is P5; this session does not begin it.

Reproduction (same command in each frozen tree; baseline supports default only):

```sh
npm run build
npm run measure:performance -- --mode test --scenario capacity --loads 300 --p3 dense --interface visible --quality low --seconds 60 --warmup 10 --repeats 3 --source-revision 05c1d4e --source-state frozen-p4 --output /private/tmp/p4-low-dense.json
# Replace dense with combat; use default for the preserved presentation.
npm run measure:performance -- --mode production --quality low --seconds 60 --warmup 10 --repeats 3 --output /private/tmp/p4-low-production.json
```

Final recording checkpoint: 2026-10-15T02:10:39.074688+00:00; elapsed 89.43 minutes from the recorded start. Both-theme screenshot review is recorded in progress; source/build hashes and all repeats are retained.
