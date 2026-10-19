# Autonomous development plan — browser performance first

Current dates, statuses and gates: [BUILD_STATUS.md](BUILD_STATUS.md).
Assessment date: 2026-10-11 (Australia/Sydney).
Amended: 2026-10-11 with the owner's recycling-game ideation document.

## Resource policy for every future session

The owner's AGENTS.md limited-local-browser policy overrides older session
command lists below. Prefer deterministic/source checks and existing matching-
head Actions evidence. Run only necessary bounded affected browsers serially,
one worker/zero retries; clean up owned processes. Full local Chromium/stress,
long soaks and repeated performance campaigns require a separately scheduled
consolidated run. Deferred requirements remain pending. Historical Session 1–7
recipes are context, not permission to repeat those campaigns.

## Objective and authority

Make Arena Survivor run smoothly in a browser on older hardware while preserving
the slower, readable environmental game. Work autonomously in **60–120 minute
sessions**, measuring, implementing, testing, reviewing, and recording each
completed cycle. Offer optional features for the owner to select before building
them. The performance work below can proceed without another task-selection
question; F16 difficulty is selected/delivered in Q1, with other optional content pending selection.

This document is an execution roadmap, not a claim of completion. It does not
create a recurring automation or launch a timed session. Existing milestone
gates, ownership, theme contracts, and phase-commit rules still apply.

Read, in order, `BUILD_PLAN_V0.4.md`, `../RECONCILIATION.md`, and
`MASTER_BUILD_PLAN.md#v0-3` at the start of every development session. Then read
`../AUTONOMOUS_PROGRESS.md`, the active increment plan, and the relevant code.
Consult `PLAN.md`, `EDUCATION_PIVOT.md`, `THEME_ARCHETYPES.md`, and `SAVE_DATA.md`
when their corresponding product/content/save boundaries are involved.

## Verified starting point — 2026-10-11 assessment snapshot

- Checkout: `main`, HEAD `103afa7`, the merge of V0.4.2.1. V0.4.0, V0.4.1,
  V0.4.2, and V0.4.2.1 are merged; V0.4.3 is the next unbuilt increment.
- Existing stack: TypeScript, Phaser 3.90, Vite, Vitest, ESLint, Playwright,
  npm; no backend. Framework-independent rules feed Phaser scenes.
- Existing features include automatic Cleanup Grabber combat, Collection Sweep,
  progression, material-family death spawns, hazards, scheduled shrines,
  minimap, title/settings/reference screens, run statistics, and endless/clearing
  choices. Do not rebuild these.
- Two production theme packs are validated. Spatial hashing already reuses
  buckets; separation, causal queues, presentation cues, and audio have budgets.
  Existing ceilings are 300 enemies, 192 projectiles, and 250 XP pickups.
- Missing planned work: multiple weapon slots, a second weapon, evolution,
  additional shrine/curse content, elite variants, bosses, persistent profiles,
  unlocks, and portable save import/export. Remaining sprite work is V0.4.4.
- README and parts of AGENTS.md still call V0.4.2 the next increment. The current
  milestone plan, phase checklists, reconciliation, and Git history show otherwise.
- The original seven status annotations have been consolidated into
  `BUILD_STATUS.md`; the owner authorized their cleanup on 2026-10-16.

Assessment checks actually executed:

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm test -- --run` | 403 tests passed across 46 files |
| `npm run lint` | Failed: `prefer-const`, `tests/unit/weapons/collection-sweep.test.ts:56` |
| `npm run build` | Passed; entry JS 1,669.77 kB, gzip 389.77 kB; large-chunk advisory |
| `npm run test:e2e:ci` | Blocked before tests: localhost `127.0.0.1:4173` listener denied with `EPERM` |

No current browser, stress, real-device, or dependency-audit pass is claimed.

## Findings that determine the first tasks

1. **Fix performance measurement before optimizing.** `RunScene.update` multiplies
   frame delta by gameplay rate before storing `averageFrameMs`/`maxFrameMs`.
   Those measurements represent simulated delta, not wall-clock frame spacing.
   Historical 0.5-rate results cannot establish a 60 FPS hardware guarantee.
   Record raw frame intervals and CPU work separately; exclude intentional
   hit-stop, pauses, and hidden-tab intervals from active-play samples.
2. **Remove unnecessary diagnostic work from production.** `publishTelemetry()`
   runs every frame. The production build retains snapshot reads, array scans,
   and selector calls even though the telemetry updater is inert. Gate work
   before snapshot construction; prove that production has no test interface.
3. **Profile minimap and UI update costs.** The minimap rebuilds arrays, parses
   palette colours, and redraws graphics every frame, including allocation work
   before discovering that it is hidden. HUD updates format values every frame;
   text textures use resolution 4. These are candidates, not measured bottlenecks.
4. **Profile crowd and actor churn rather than installing speculative pools.**
   Spatial hashing and bounded separation already exist. Measure query visits,
   dense-stack behaviour, deaths/spawns, effects, and cleanup before changing them.
5. **Define older-device acceptance honestly.** Existing evidence comes from local
   Chromium and synthetic fixtures. CPU throttling is useful for comparison;
   it does not reproduce an old integrated GPU or prove real-device support.

See REC-100 for the timing and production-telemetry findings.

## Performance acceptance contract

Use these as **initial targets to validate**, not measured current results. Record
the exact device, OS, browser, renderer, viewport, quality setting, build/commit,
scenario, sample window, and measurement method with every result.

| Area | Proposed acceptance |
| --- | --- |
| Reference desktop | Typical play near 60 FPS; active-play p95 frame interval ≤20 ms |
| Older laptop/desktop | Supported integrated-graphics device, initially a 4–8 GB machine; typical play near 30 FPS or better, p95 ≤40 ms |
| Worst supported load | 300 mixed enemies plus representative pickups, hazards, and equipped weapons; p95 ≤40 ms in the supported presentation mode |
| Stalls | Active-play intervals over 100 ms below 1% of samples; report p99 and maximum too |
| Startup | Proposed cold first-playable target ≤5 seconds on a recorded 10 Mbps/100 ms network profile; report transfer and decode costs separately |
| Responsiveness | Movement and menus remain responsive, with no stuck input, missed choices, or catch-up burst after focus returns |
| Lifecycle | Full authored run (about 10 real minutes at 0.5 rate), overtime sample, and 10 restarts; no growing retained actor/listener/queue population |
| Correctness | Identical combat, XP, upgrade, and ledger outcomes across presentation modes; caps and causal exact-once rules hold |

Use a quiet browser and one performance worker. Warm up first, measure at least
60 seconds for sustained cases, and repeat comparisons three times on the same
device/configuration. Report spread; never select only the fastest run. Short
unit microbenchmarks cannot substitute for browser rendering measurements.

Record 60/150/300 enemy scenarios, default eco gameplay, the retained projectile
theme, pickup/fragment bursts, minimap on/off, pause/resize/focus, and restart.
Compare test-mode correctness runs with production-build profiles; instrumentation
overhead must not be mistaken for gameplay cost. Label scripted invulnerability
or automatic upgrade selection explicitly.

Hardware-sensitive FPS thresholds stay in the manual performance gate, following
REC-040–042 and REC-057. Required CI tests deterministic correctness and bounded
work, not the speed of a shared runner. Keep the 300-enemy ceiling unless evidence
and a recorded product decision justify a change. Slowing the gameplay clock is
not a performance fix; simulation/presentation timing must remain coherent.

When a representative older device is unavailable, complete useful local work
and publish a reproducible device checklist. Mark hardware acceptance **pending**;
do not describe throttled Chromium as real-device validation. Mobile controls
and mobile support are separate optional scope.

## Milestone and ownership integration

The performance prerequisite is **P0–P6 within V0.4.3, before C1**, now promoted
into the active plans by Session 1 (REC-102).
This is justified by the new primary objective: content growth must not multiply
work before browser performance is measured. At the beginning of Session 1,
reconcile this addition into `BUILD_PLAN_V0.4.md` and `BUILD_PLAN_V0.4.3.md`, update
stale entry-point status, and record phase gates/commit subjects. Preserve all
existing C1–C7 dependencies; do not silently mark an old gate complete.

Use `codex/v0.4.3`, one reviewable commit per completed numbered phase, one PR
into `main`. Extend an existing suitable milestone branch rather than creating a
duplicate. Do not push unrelated local edits. No merge, deployment, or production
service changes are part of these sessions. No sprite generation or changes to
the reserved sprite pipeline/roster are authorized by this performance plan.

| Phase | Owned paths / permitted scope | Proposed commit subject |
| --- | --- | --- |
| P0 | Active plans, README/AGENTS status, progress/reconciliation, existing lint defect, `src/test-support/**`, frame sampling in `run-scene.ts`, measurement tests/scripts | `build(v0.4.3): establish browser performance measurements` |
| P1 | Telemetry call sites in scenes, test-support bridge, architecture/production guard tests | `perf(v0.4.3): avoid production telemetry work` |
| P2 | `src/game/ui/{minimap-ui,hud,ui-text}.ts`, corresponding scene presentation hooks, theme presentation tuning and UI tests | `perf(v0.4.3): reduce repeated interface work` |
| P3 | Profiled hot paths in existing spatial/separation/effects/events/weapons systems and scene call sites, matching tests | `perf(v0.4.3): reduce measured simulation overhead` |
| P4 | Measured rendering/presentation hooks, config, settings/UI, theme presentation tuning, content validation and presentation tests | `feat(v0.4.3): add a lightweight presentation mode` |
| P5 | Entity/feedback/scene lifecycle cleanup, matching restart tests, measured boot/asset-loading improvements outside the reserved sprite pipeline | `fix(v0.4.3): bound lifecycle and startup costs` |
| P6 | Performance reports, browser harness, documentation and narrowly scoped regression fixes from the combined gate | `test(v0.4.3): verify browser performance readiness` |

Every phase owns its matching tests, plan status, progress file, and material
reconciliation entry. Exact additional files discovered by profiling must be
added to the phase ownership block before editing. Balance and presentation
budgets belong to theme-owned data; systems consume neutral contracts. Read
`SAVE_DATA.md` before P4 touches serializable settings; persistence still belongs
to selected C6 work. The new presentation mode initially remains session-only.

P3/P4 optimizations are evidence-dependent. If a proposed change has no useful
benefit, document the measurement and skip that implementation. Do not invent
busywork to fill a phase or weaken a gate to fit the session deadline.

## Session execution protocol

Default duration is **90 minutes**; a session request may set 60 or 120. At start,
read the available clock and write start/deadline into the progress file. Check
elapsed time after every cycle and before starting a browser soak. Tools can
measure time but cannot guarantee the host will keep a turn running. If execution
is interrupted, preserve state and report actual elapsed time; never claim a
full 1–2 hour run that did not occur.

Budget each session as follows:

| Duration | Restore/evaluate | Implement/profile/test cycles | Final validation, review, record |
| --- | --- | --- | --- |
| 60 min | 5–10 min | 35–40 min | 15 min |
| 90 min | 5–10 min | 60–65 min | 20 min |
| 120 min | 5–10 min | 85–90 min | 25 min |

After each meaningful change: run affected checks, self-review the diff, resolve
material defects, and update `AUTONOMOUS_PROGRESS.md`. Then evaluate the next
eligible task automatically. Reserve the final window before accepting another
large task. A task may span sessions; record partially implemented work accurately
and keep it out of a completed-phase commit until the phase gate passes.

The schedule below gives a 60-minute core and useful extensions for 90–120
minutes. Estimates include testing/review. If the core finishes early, select
from the extension or the next eligible phase; if it takes longer, carry its
remaining work forward. Do not enter a dependent phase before the current gate
passes. Do not stop after one small fix while useful authorized work remains.

## Selected interruption after Session 1

The owner selected F16 as Beginner / Normal / Experienced (Normal slightly
below the old baseline), plus player walk/facing, crisp background text and common
tool-upgrade corrections. Q1 in the active plan owns this before Session 2/P1.
This replaces F16's provisional Relaxed/Standard/Challenge naming and its
unchanged-Standard assumption. Other optional features are unselected. After Q1
verifies, resume P1, then P2–P6; refresh the P0 comparison scenario for the new
Normal baseline rather than claim that old gameplay recordings are equivalent.

## Performance session backlog — approximately 8–16 hours

### Session 1 — P0: recover a trustworthy baseline

**60-minute core:** reconcile milestone status/ownership; fix the known lint
defect; separate raw wall-frame delta from scaled gameplay delta; add a focused
0.5-rate/hit-stop timing regression; run types, units, lint, build, and a browser
boot/load smoke where permissions allow. Save the baseline configuration/results.

**90–120-minute extension:** add bounded p50/p95/p99 frame sampling and CPU
update timing in opt-in measurement tooling; add scenario metadata/report output;
run default gameplay and the existing 300-enemy stress fixture serially. Capture
production versus instrumented costs and prioritize the next measured hotspot.

**Exit:** measurement units are explicit and verified, production/test separation
is understood, and each blocked check has a concrete reason and rerun command.

Q2 event/roster inspection and immediate spawn accounting are verified in
`7ff8bbf` (REC-107/108). The owner also authorized a test-only capacity sweep at
150/300/450/600, reported with actual visible population and diagnostic overhead.
Keep production at 300 until sustained mixed-combat and representative hardware
results justify an increase. Bagged Waste's fixed composition awaits confirmation.

### Session 2 — P1: remove diagnostic work from the production loop

**60-minute core:** prevent telemetry construction before any snapshot reads,
selectors, or array scans outside test mode; inspect emitted production code;
verify test-mode snapshots still support the existing browser paths. Profile
before/after on the same build configuration.

**90–120-minute extension:** inspect other per-frame test-only hooks; guard
only confirmed unnecessary work; cover menu/run lifecycle and mode boundaries;
run focused browser tests, stress, and production boot checks.

**Exit:** production avoids diagnostic scans, test telemetry remains usable, and
simulation/ledger behaviour is unchanged. Record measured benefit, including zero.

### Session 3 — P2: reduce repeated minimap and HUD work

The completed Session 3 handoff was retired; see the completed master record. Q3 wraps
up card fitting/early skill caps and atlas navigation before P2; it does not
start this phase. Half-speed timing and stationary Glass Shards are deliberate.

**60-minute core:** profile minimap on/off and hidden overlays; skip hidden-map
view construction, cache stable palette values, and avoid unchanged text work
where Phaser does not already do so. Keep essential status/health/XP updates
correct and prompt. Add focused visibility/change tests.

**90–120-minute extension:** use a theme-owned minimap refresh cadence if
profiling justifies it; reuse bounded buffers; test resize, opacity changes,
pause, restart, and keyboard/pointer behaviour. Measure texture upload and CPU
cost under 300 enemies. Preserve legible text and crisp actor art.

**Exit:** less measured interface work with no stale critical HUD, altered
viewport, hidden-map processing, or interaction regression.

### Session 4 — P3: optimize the highest measured simulation hotspot

**60-minute core:** trace crowd/index, targeting, queue processing, pickup
merging, and fragment bursts; implement one measured improvement to repeated
queries, scans, or allocations. Preserve causal ordering, hit targets, rewards,
and damage accounting with relevant deterministic regressions.

**90–120-minute extension:** address the next confirmed hotspot only after the
first validates; compare dense versus distributed crowds and both weapon delivery
kinds. Run bounded-work tests and serial stress; remove an optimization if it
adds complexity without benefit.

**Exit:** reproducible benefit under relevant load and all exact-once/cap/ledger
invariants pass. Pool objects only if allocation traces justify reset complexity.

### Session 5 — P4: a lightweight presentation mode for older devices

**60-minute core:** based on traces, implement a small explicit Default/Low
presentation setting using existing settings and theme contracts. Reduce costly
optional cues, decorative work, or minimap frequency while preserving damage,
XP, spawn rates, hitboxes, the visible world, and essential attack telegraphs.

**90–120-minute extension:** assess safe backing-buffer/text-resolution options
only if GPU or texture upload is the bottleneck; verify pointer transforms,
resize, readability, reduced motion, and both themes. Compare identical scenarios
across modes. Avoid automatic oscillating quality policies until measured need.

**Exit:** Low improves measured cost, mode changes are reversible and session-safe,
and deterministic gameplay outcomes do not depend on presentation settings.
If no mode is needed, record why and spend the session on the next proven issue.

### Session 6 — P5, first slice: lifecycle and sustained-play reliability

**Completed slice reference:** inspect shutdown/restart for actors, sprite
followers, timers, listeners, physics registrations, graphics, audio and queue
retention. The affected slice is recorded in the master and P5 lifecycle report;
remaining acceptance belongs to Session 8 under the resource policy above.
Use available heap tools, explaining browser-specific measurement limits.

**Remaining evidence:** overtime, focus/visibility, pause/resize and mode
switching must show bounded retained ownership and no resumed-tab catch-up burst.
Long-soak execution remains deferred; it is not locally authorized by this recipe.
Add regressions for actual defects.

**Exit:** resources return to the expected baseline and gameplay is stable through
run endings and reconstruction. Do not call ordinary GC fluctuation a leak.

### Session 7 — P5, second slice: startup and browser compatibility

**60-minute core:** measure production cold/warm startup, transfer/decode,
initial textures, and first playable frame. Test existing WebGL/Canvas selection
where available. Improve only the demonstrated bottleneck using existing tools.

**90–120-minute extension:** test slow-network and smaller viewport cases;
cover asset failures and supported-renderer boot errors with actionable recovery;
lazy-load genuinely optional screens only if it improves first play. Run types,
build, production guards, browser smoke, and both-theme content validation.

**Exit:** startup/failure behaviour is measured and clear. Do not split Phaser
arbitrarily or add a service worker merely to silence the large-chunk warning.

### Session 8 — P5: remaining lifecycle/compatibility acceptance

The affected Session 6/7 gates do not complete P5. Session 8 completed the
[acceptance inventory](performance/P5_ACCEPTANCE_REPORT.md); the native visibility
probe could not reach hidden state. Sessions 9–10 subsequently verify native
overlays and the scoped consolidated lifecycle campaign. Continue with
[Session 15 / C2 continuation](SESSION_15_PROMPT.md) for remaining compatibility evidence. Prefer
existing evidence and deterministic checks; only a necessary bounded serial
browser fixture is allowed. Long soaks/full local suites remain deferred, not
passed. P6 must wait for the P5 gate or an explicit recorded owner gate change.

### Session 9 — P5 continuation: native events and remaining acceptance

Completed bounded slice: one trusted native same-window tab round trip passes
on Chromium/Metal, with 7.493 ms first observed advancement after 1.33 s hidden,
unchanged spawns/empty queues, and 14 deterministic focus-state checks. See the
[acceptance report](performance/P5_ACCEPTANCE_REPORT.md). No runtime defect or
change; authored/sustained/native-overlay/audio/device requirements remain open.

### Session 10 — P5: authorized consolidated lifecycle and device evidence

Owner explicitly authorized the consolidated M5 campaign on 2026-10-19. Its
20-minute ownership window passes within explicit test-only survival/focus aids:
authored clock, five-minute endless extension, ten short terminals, native
paused/level-up/time-up/pending work, quality/resize and actual audio closure.
See [campaign report](performance/P5_CAMPAIGN_REPORT.md). No runtime defect/fix.

### Session 11 — P5: selected desktop support and engine evidence

Owner delegated support selection and authorized testing. Selected desktop
Chrome/Edge/Firefox/Safari current/previous-major on vendor-supported OS; 52
focused checks pass serially across installed Chrome and pinned Chromium/Firefox/
WebKit. Test-only key-hold/resize-readiness corrections; no runtime fix. See
[compatibility report](performance/P5_COMPATIBILITY_REPORT.md). Actual branded/
platform/older physical-device coverage remains open.

### Session12 — P5 branded checks and P6 software slice

Owner requests P6 work alongside remaining P5.26 focused Edge155/154 checks
and two unpatched Firefox158/157 smokes pass. Safari access remains blocked;
owner confirms no older device. P6 software has96 browser/stress passes/six
opt-in skips/zero retries,488units/types/lint/build/audit, a verified portable
kit/manual checklist and18 frozen warmed Default/Low60/150/300 windows. See
[readiness report](performance/P6_READINESS_REPORT.md). Physical/Safari/other
release/platform acceptance remains pending, not passed.

### Session13 — owner-approved C1 foundation

On 2026-10-20 the owner explicitly approves planned C1–C7 after verified software
checks, with missing browser/device evidence release-blocking. C1 is verified locally, including the second tool, owner-only progression,
on-hit splash and the combined affected gate. Continue C2 evolution using
[SESSION_15_PROMPT.md](SESSION_15_PROMPT.md). The selected support
list and missing evidence remain unchanged. No optional/sprite scope is added.

### After P5 — P6: combined readiness gate and real-device report

**60-minute core:** inspect matching-head Actions evidence and the combined
software gate; full local browser/stress runs require a separately scheduled
consolidated run under the owner policy. Use affected serial checks only; compare baseline
versus final results across default/low and 60/150/300 loads. Inspect the combined
diff and fix regressions. Publish a reproducible manual device checklist.

**90–120-minute extension:** measure on an available older integrated-graphics
machine and an additional browser; repeat sustained/default and worst-load
cases, then a restart/focus smoke. Include an actual playable run, not only an
invulnerable harness. Record limitations and residual hotspots.

**Exit:** software verification passes; hardware targets have evidence or remain
explicitly pending. Summarize measured improvements, risks, and the next selected
feature. Do not claim the overall older-device objective complete without device
evidence. If hardware access is the only remaining blocker, stop and report it.

## Recycling ideation — assessed against the existing game

Source: the owner-supplied **Game Concept: Recycling-Themed Roguelite Survival
Game**, received 2026-10-11. It was written without repository context. The
assessment below preserves its useful ideas for subsequent sessions without
requiring future agents to recover the chat attachment. It is design input,
not a replacement for the active milestone/product authorities or approval to
implement every example. See REC-101.

| Ideation suggestion | Repository assessment | Treatment in this roadmap |
| --- | --- | --- |
| Movement, auto-attacks/aim, XP magnetism, level-up choices, escalating runs | Shipped | Maintain and validate; no new foundational implementation |
| Ordinary cleanup character, grabber, plastic/glass rubbish enemies | Shipped as Environment Protector, Cleanup Grabber, and existing material roles | Preserve identities and stable IDs; no automatic rename |
| Grabber range, speed, damage, wider attacks | Reach track, general stat picks, and Collection Sweep already exist | Extend only for a selected mechanic that current tracks cannot provide |
| Plastic fragments and glass hazards | Microplastics and stationary Glass Shards already exist; finite relationships are accepted | Preserve REC-099; shards are clearable enemy actors, not a new timed hazard system |
| Plastic Bag as the fast enemy | Historical identity explicitly replaced by Microplastics | Do not restore or relabel the retired role; any floating bag would be a separately selected new role |
| Contamination zones, obstacles, burst hazards | Existing spill, debris, and vent systems cover these capabilities | Reuse their contracts for new themed sources rather than duplicate hazards |
| Ten-minute runs and longer modes | Five authored minutes at 0.5 gameplay rate already take about ten real minutes; endless/clearing shipped | Do not double authored duration from this suggestion; reconsider length only with pacing evidence |
| Adjustable effects, minimal instructions, clear silhouettes | Reduced motion, bounded feedback, title/settings, hint dismissal, and accepted core sprites exist | Performance P4 plus accessibility F9; colour-independent cues remain useful work |
| New waste behaviours and recycling tools | Modular content exists, but suggested additional roles/tools are unbuilt | F13 and concrete candidates within F1; introduce one of each at a time |
| WasteDex, first-encounter unlocks, defeat counts, optional facts | Field Guide already exists for reference/session totals; enemy discovery and sourced facts are missing | Extend F10 inside the existing guide; no second encyclopedia framework |
| Material drops and recovery efficiency | XP drops exist; recyclable-resource economy does not | F14, optional; begin with aggregate counters and no extra actor population |
| Park restoration and facilities | No between-run restoration loop exists | F15, optional after resources/persistence; a small milestone screen, not a city builder |
| Bosses and evolution | Already planned in V0.4.3, unbuilt | Enrich F5/F2 candidates; preserve C5's post-boss endless/clearing choice |
| Relaxed/Standard/Challenge modes | World tuning and player-chosen risk exist; explicit difficulty presets do not | F16, separate from Default/Low graphics settings |
| Mobile/controller controls | Keyboard/pointer paths exist; dedicated touch/gamepad support is unbuilt | F11 and F18, separately scoped and tested |
| Material specialisation, contamination penalties, collection stations, challenges | Exploratory beyond the accepted simple loop | F12/F17 after selected foundations; no forced quizzes or early specialist-tool requirement |

### Concrete content candidates, still optional

- **Enemy variety / F13:** prototype one new behaviour, with Aluminium Can
  rolling, Cardboard Box releasing bounded child items, or Food Scraps creating
  a short telegraphed zone as initial candidates. Battery, electronic waste,
  cigarette-butt groups, a charging Tyre, and a separately defined drifting
  Plastic Bag remain later alternatives. Reuse the finite spawn graph and hazard
  seams; do not add the entire ten-enemy list. A new role needs a distinct
  silhouette and behaviour, not only another health value.
- **Second tool / F1:** a Vacuum with a short cone or a Compactor with one
  telegraphed area action are initial candidates for a readable contrast to the
  grabber. They must respect the shared event budget, cooldowns, hit queries,
  and damage ledger. Names, widths, reach, and effectiveness remain theme data.
  A Magnetic Collector needs an eligible material role and verified handling
  model before selection; it is not effective against every item labelled
  "metal" by default. Sorting Drone and Recycling Turret are later bounded
  companion/emitter candidates, with summon/projectile caps and no independent
  unbounded AI loops. Compost Launcher and E-Waste Containment Device need a
  convincing processing role and corresponding content before implementation.
- **Boss / F5:** shortlist a Scrap Machine with a readable wind-up/charge, or
  a Landfill Golem using bounded existing waste spawns. Plastic Tide, Battery
  Overload, Garbage Truck, Microplastic Swarm, and Waste Mountain remain
  alternative pitches, not seven scheduled bosses. All summons share the
  existing enemy budget and finite fragmentation rules; a growing visual must
  never define its own collision footprint.
- **Collection identity / F9 and selected presentation work:** prefer theme
  copy such as collected, contained, or processed where appropriate. Existing
  upgrade copy and Processing Ledger already use this language. Inspect surfaces
  before changing them; keep damage, crit, and stable internal semantics intact.
  Collection sounds and disappearance cues are downstream presentation, and
  reuse effect budgets. Do not imply that fragmenting or crushing every material
  is safe real-world recycling.

### Product and performance constraints for these ideas

Keep gameplay first and detailed learning optional. Unlock reference entries
through committed encounter/defeat events, but never lock normal upgrades behind
reading, quizzes, or educational achievement. Distinguish in-game behaviour,
mechanical hints, and sourced real-world guidance in every information surface.
Define an encounter as seeing or engaging an item; merely spawning it outside
the camera should not silently count as discovery. Record that rule in F10's
contract and test it before adding persistent encounter counts.

Start fact content with a small reviewed Australian set; NSW/council guidance is
a possible scope to select, not universal disposal advice. Before publishing
facts, research authoritative current sources, record geography/applicability,
source URL and review date, and validate those fields. Do not promote the
ideation's disposal examples or the game's persistence-health estimates into
verified fact cards. Educational content stays theme-owned and outside gameplay
code, following `EDUCATION_PIVOT.md`.

New content must preserve the P0–P6 performance targets, both production theme
contracts, the readable camera/pace, and simple early controls. A new family of
resources, a drone, a boss spawn, and an existing XP pickup cannot each create
an independent unbounded object population. Any new visual asset follows the
V0.4.4 roster/style gate; prototype mechanics with supported primitives first.

## Optional feature menu — select before implementation

These are local product proposals grounded in the existing architecture. Labels
and tool identities remain provisional until theme/design reconciliation. Session
counts are initial estimates for **60–120 minute sessions**, including validation;
larger features deliberately span sessions rather than promising a whole system
in one hour. Already shipped features such as endless mode are not on this list.

| ID | Feature and player benefit | Estimated sessions | Dependency / runtime impact |
| --- | --- | --- | --- |
| F1 | **Second cleanup tool and weapon slots:** a meaningful alternative build alongside the grabber | 3–4 | C1, after performance gate; medium/high combat/render cost |
| F2 | **One weapon evolution:** a visible reward for completing a weapon track | 2 | C2, F1; bounded replacement in the same slot |
| F3 | **One new shrine and one curse:** additional optional risk/reward choices | 2 | C3, C1–C2 order; may raise entity pressure |
| F4 | **Two elite behaviours:** a shielded or splitting threat with readable telegraphs | 2–3 | C4, prior content gates; bounded modifier work |
| F5 | **Mini-boss and final boss:** a readable climax before the existing endless/clearing choice | 3–4 | C5, preceding gates; cap summons and telegraphs |
| F6 | **Remember settings and best runs:** browser-local persistence and a small unlock pool | 3–4 | C6 and `SAVE_DATA.md`; write at safe boundaries, not every frame |
| F7 | **Save backup and transfer:** encoded text export, validated preview, backup, confirmed import | 2–3 | C7, F6; parsing/storage work outside active combat |
| F8 | **Seed display and repeatable challenge runs:** reproducible practice and bug reports | 1–2 | Later scoped phase; same seed alone is not deterministic replay |
| F9 | **Accessible controls and clearer role cues:** remapping, contrast, readable UI options | 2–3 | Later scoped phase; preserve silhouettes/telegraphs and low-mode budgets |
| F10 | **Field Guide / WasteDex expansion:** first encounters, per-material defeat counts, optional sourced facts and post-run explanations | 3–4 | Reuse the existing guide; Education E4/E5, F6 for persistent tracking; source/review facts before shipping |
| F11 | **Touch controls:** movement and interaction on phones/tablets | 2–3 | Separate mobile viewport/input/performance gate |
| F12 | **Material effectiveness and layered waste:** appropriate tools expose or clean different layers | 4–6 | Exploratory E2/E3, F1; highest complexity, independently abandonable |
| F13 | **One new waste behaviour:** a rolling can, unfolding box, or zone-producing food waste | 2–3 | New scoped content phase; F1 not required; finite spawn/hazard rules and stress gate |
| F14 | **Automatic recyclable-resource totals:** recover materials alongside XP, initially without extra pickups | 3–4 | New economy phase, F6 for storage; exact committed rewards and bounded counters |
| F15 | **Small park-restoration progression:** three visible milestones and equipment/cosmetic unlocks between runs | 3–4 | F14 + F6; new scoped phase; menu presentation first, no city simulation |
| F16 | **Beginner/Normal/Experienced presets (Q1 verified):** approachable or more demanding runs chosen before play | 2–3 | Theme-owned difficulty data; Normal gentler than old baseline; Q1 balance/browser/stress gate |
| F17 | **One optional collection-station objective:** deposit selected resources or safely clear a marked zone for a reward | 3–4 | F14 for deposits; education research if factual; later E6-style opt-in objective, no mandatory quiz |
| F18 | **Controller support:** movement, interaction, and complete menu navigation with a gamepad | 2–3 | Existing input/settings seam; disconnect/focus/deadzone/menu regression coverage |

Suggested initial shortlist: **F6, F1, F5, and F9** for retention, build variety,
a run climax, and accessibility. The owner can choose any subset. Preserve C1–C7
order unless a documented resequencing creates a smaller safe prerequisite; for
example, bringing a settings/statistics-only part of C6 earlier needs its own
phase boundary and rationale before code changes. The ideation also makes
**F13 and F10** useful next choices for recognisable variety and optional learning;
**F14/F15** are a later retention experiment rather than immediate prerequisites.
Selection does not authorize the entire feature menu or automatically promote
exploratory education scope.

V0.4.4 sprite completion stays gated until selected V0.4.3 content stabilizes.
Read the style/pipeline plans and claim manifest rows before any later art work.

## How selected content becomes hour-sized work

For each selected feature, add precise ownership, commit subjects, acceptance,
and short checks to the active build plan before implementation. Use these
session slices as the starting backlog:

| Existing phase | Session slices, each with an implementation plus tests/review |
| --- | --- |
| C1 / F1 | (1) slot state/resolution and contract tests; (2) independent scheduling and ledger provenance; (3) second tool, equip-conditioned upgrades, simulator; (4) combined browser, balance, readability, and stress gate |
| C2 / F2 | (1) pure evolution conditions/replacement and slot invariants; (2) theme definitions, descriptions, browser acquisition, simulator/stress |
| C3 / F3 | (1) curse contract and contributor rules; (2) bounded content, reward copy, choice availability, balance/browser integration |
| C4 / F4 | (1) modifier/inheritance rules; (2) two bounded behaviours and telegraphs; (3) fragmentation/duplication, queue, browser/stress integration if needed |
| C5 / F5 | (1) boss state/director exact-once spawn; (2) one mini-boss pattern and tests; (3) final boss and post-kill decision; (4) ledger, restart, balance and presentation-mode stress |
| C6 / F6 | (1) schema/validation and migration fixtures; (2) safe storage adapter and unavailable/quota/corrupt cases; (3) lifetime stats/unlock conditions and menu wiring; (4) reload, settings, double-count prevention, browser gate |
| C7 / F7 | (1) canonical codec, limits, checksum, malformed/hostile-input tests; (2) export and import-preview UI; (3) cancellation, backup, confirmation, migration/reload verification |

The same 60-minute core / 90–120-minute extension rule applies to these added
packages. Each numbered slice below is one session's work, with related tests
and review included; use profiling, edge cases, browser integration, and the next
eligible slice as extensions. Commit at the declared phase boundary, not simply
because a session ended.

| Optional package | Session slices and acceptance |
| --- | --- |
| F10 — Guide expansion | (1) encounter/defeat state and exact-once committed-event tests, then reference selectors; (2) enemy/material sections in the existing guide, discovered-state filtering, counts, keyboard/pointer navigation and resize; (3) a small sourced/reviewed fact set with distinct game/fact copy and validation; (4) reload/import compatibility, opt-in debrief, and complete guide/browser gate if selected |
| F13 — One enemy | (1) author one role's theme contract, reusable movement/spawn/hazard behaviour and deterministic tests; (2) director integration, readable primitive cues, offspring/cap/ledger browser checks and balance; (3) dense mixed-roster/default-low stress, edge cases and corrections if needed |
| F14 — Resources | (1) finite theme-owned resource definitions, reward provenance and exact-once run counters alongside XP; (2) run-end/session summary and storage/schema migration, with restart/double-count/import fixtures; (3) browser collection/reload/recovery and stress with no new collectible actors; (4) narrowly scoped eligibility/recovery rules only if selected, plus full economy gate |
| F15 — Restoration | (1) three milestone conditions, costs/unlocks and pure insufficient-resource/idempotence tests; (2) existing-menu progress screen and bounded before/after scene presentation; (3) persist spend/unlock safely, handle storage failure and import compatibility; (4) complete restore/reload/browser/low-mode gate and adjust the progression economy using evidence |
| F16 — Difficulty | (1) neutral preset contracts, theme tuning and ordering and baseline-comparison tests; (2) pre-run choice, clear copy, settings compatibility and browser lifecycle; (3) simulator comparisons, escape/telegraph/readability checks and per-preset stress; difficulty never changes implicitly with graphics quality |
| F17 — Station/objective | (1) one optional objective's state/reward/expiry rules and duplicate-completion tests; (2) bounded placement/telegraph and existing interaction prompt; (3) committed resource deposit or zone-clear reward, helpful failure feedback and factual-content review when applicable; (4) ignore/complete/restart/reload, balance and stress gate |
| F18 — Controller | (1) input adapter with deadzones, action mapping, repeat behaviour and disconnect tests; (2) title/pause/guide/level-up/overtime/end-screen navigation and device-switch browser checks; (3) focus/unplug/reconnect, remapping compatibility and real-controller smoke if hardware is available |

### Suggested subsequent iterations, conditional on feature selection

1. **Performance readiness:** the existing eight P0–P6 sessions stay first.
2. **Readable variety:** selected F1 and/or F13; one new tool/role, then balance
   and performance verification. No mandatory material matrix or resource economy.
3. **Progress and reference:** selected F6/F7 and F10; preserve progress and
   expand the current Field Guide. Bringing C6 earlier requires the documented
   small persistence prerequisite described above.
4. **Build depth and climax:** selected F2–F5, keeping approved C-phase order
   and the post-boss choice. Avoid introducing every boss/weapon pitch together.
5. **Restoration experiment:** selected F14 followed by F15; start with one park,
   three milestones, and cosmetic/sidegrade unlocks. Permanent numerical power
   increases need a separately selected design and renewed balance testing.
6. **Additional access or depth:** selected F9/F11/F16/F18 can be scoped once
   their seams are stable; F12/F17 remain later experiments with their own fun,
   accuracy, and performance gates.

These are dependency-aware groupings, not new approved milestones or a strict
feature-selection order. F13–F18 require named phases/ownership in an appropriate
future build plan; do not append them silently to C1–C7 or pull them into P0–P6.
Keep the established V0.4.4 roster gate when scheduling art after content choices.

If only a subset is selected, build its necessary foundations without adding
unselected content. Resolve substantial design choices from the selection and
existing authorities; ask only when those cannot determine a safe outcome.

## Design-review priorities and architecture index — 2026-10-12

Owner request: retain the repository-aware recommendations from the environmental
survivor prompt, place them beside the appropriate planned work, and provide a
single-file architecture map. This records prioritisation and proposed scope;
it does not select every optional feature, rename the game, reorder C1–C7,
or authorize content implementation inside a performance phase.

The [interactive architecture map](ARCHITECTURE_MAP.html) indexes current game
features, retained secondary-theme mechanics, technical foundations and future
packages. Every item has a stable reference identifier, related-item links,
implementation/design sources and an explanation. Future-phase filters only
change the documentation view; they never enable game code or mark a gate passed.
The map is a dated snapshot, not a replacement for active plans or live progress.

### Recommended priority, with existing phase placement

| Priority / reference | Recommendation | Placement and dependencies | Acceptance / boundary |
| --- | --- | --- | --- |
| R01 / P0–P6 | Finish performance readiness before multiplying tools, actors and effects | Existing P0–P6 sequence; Q1/Q2 remain delivered corrections; read live progress for P1 status | Preserve correctness/caps, measure production and report physical older-device acceptance separately |
| R02 / F19 | Sharpen identity and selectively polish existing copy/UI | New optional identity/presentation package after the performance gate, with explicit ownership before implementation; coordinate with F9/F10 and C1 copy | “Cleanup Shift” is a proposed name, hopeful/practical/playful tone; no automatic rename. Correct obsolete Sorting Pulse wording, make card hierarchy action → mechanical change → optional context, and lead the run report with outcome/build moment |
| R03 / F10 | Extend the existing Field Guide with encounters, per-material counts and reviewed optional facts; add a personalised run takeaway | F10's existing four slices, exploratory Education E4/E5; F6 for persistent discovery history. This is a high design priority, not an implicit move ahead of C1–C7 | Start with one relevant takeaway, at most two; use committed outcomes and a pure selection rule. Reading/quizzes never gate ordinary play; sources, region and review dates required |
| R04 / F1 | Add one contrasting auto-firing cleanup tool, initially a short-cone Vacuum prototype | C1 / F1 after P6; reuse shipped delivery contracts, scheduling, causal budgets and the ledger | Test positioning/build variety at current camera/pace before extra slots or a large tool roster. Existing Longer Grabber and Collection Sweep are not duplicate new features |
| R05 / F13 | Add one distinct enemy behaviour and a legible wave response | Existing F13 slices; a named future content phase is still required, independent of F1 | First candidate: Rolling Can aimed at the player's previous position then rolling past. Charging Tyre is an alternative, not a second simultaneous commitment. Leaking Waste Container is later, using bounded existing hazard contracts |
| R06 / F6–F7 | Remember settings/best runs and add modest unlocks; preserve portable saves | Existing C6 / F6, then C7 / F7. Any earlier settings-only prerequisite needs documented resequencing/ownership | Prefer sidegrades, discovery/cosmetics and best records over permanent numerical power; preserve SAVE_DATA validation/backup/import rules |
| R07 / F2–F5 | Add one qualitative tool evolution and a readable boss climax | C2–C5 in their existing dependency order; keep post-boss endless/clearing choice | Evolution changes a visible action and replaces its slot. New shrine/curse/elite choices must stay understandable and bounded |
| R08 / F9 and V0.4.4 | Improve role cues, interaction hierarchy and successful-collection feedback; finish art against the settled roster | F9 for accessibility; measured presentation work belongs to P2/P4 only within their existing ownership. Remaining sprites stay V0.4.4-gated | Player harm, attack geometry and hazard warnings have priority over decoration; preserve reduced motion and bounded audio/effects |

F16 has already shipped in Q1 as Beginner / Normal / Experienced. Do not
schedule difficulty presets or endless/clearing again from the generic prompt.
The roadmap's earlier assessment table remains a dated historical snapshot;
current status comes from the active plan/progress, including concurrent sessions.

### Suggested additions within the existing packages

- **F1 / C1:** consider a bounded Vacuum → Collection Sweep interaction only
  if the prototype's suction/action is immediately legible. Theme data owns
  reach, angle, force, limits and cadence; no manual weapon switching is needed.
- **F2 / C2:** evolve an action qualitatively rather than awarding another
  percentage. A future containment attachment may reduce eligible fragment or
  spill consequences, but needs supporting enemy content and a tested trade-off.
- **F10 / E4–E5:** keep upgrade copy mechanical first; optional explanations
  share the existing information surface. Replace floating facts with a brief
  discovery cue and a voluntarily opened entry. Start without special fact-orb
  actors. “Learn mode” means optional information depth initially, not a parallel
  game ruleset. Explain Fragmentation's gameplay bargain without presenting
  pollution fragmentation as successful recovery or safe handling advice.
- **F13:** make Bottle, Microplastics, Glass, Shards and Bagged Waste visually
  distinguishable before expanding count. Preserve Q2's Microplastics opening
  and quiet bottle unlock unless an owner-selected tuning change supersedes it.
  Wave candidates are scattered arrivals, crossing sweeps, durable groups and
  mixed releases, with telegraphs/recovery; prefer varied responses to density.
- **F8, then F20:** show seeds/repeatable presets first; an optional daily local
  challenge can reuse a versioned challenge configuration later. A seed alone
  is not deterministic replay. Online leaderboards/backend are not prerequisites.
- **F12 / E2–E3:** defer the full material-effectiveness matrix until a second
  readable tool proves useful. Layered waste remains an independently
  abandonable experiment, not a mandatory educational foundation.
- **F14 → F15:** a small restoration screen can reinforce hope later, after
  resource/profile foundations. Do not expand it into a city-management game.
- **Later setting experiments:** oil/contamination fits hazards; heat waves may
  become telegraphed arena events; invasive plants belong to an accurately
  identified habitat setting; deforestation/biodiversity loss suit habitat
  conditions, objectives and restoration. These are ideas, not new scheduled
  enemy identities, factual claims or approved phases.

### Additional optional and parked identifiers

| ID | Item | Proposed placement / state |
| --- | --- | --- |
| F19 | Identity, copy and existing-screen hierarchy pass | Optional, unselected. Two slices: (1) inventory stale copy and propose name/tone/labels against current theme; (2) selected copy/layout changes with content validation, keyboard/pointer/resize and visual checks. No menu/framework rebuild |
| F20 | Daily challenge built from repeatable presets | Optional, deferred after F8; requires a named phase. Version challenge seed/config/date policy and validate repeatability claims before release |
| ART-RES | Double native sprite resolution while preserving world display size | **Parked at the owner's request.** No current-phase or automatic V0.4.4 inclusion. If revisited, compare one newly authored higher-resolution baseline at identical display size, measure cost and update style/pipeline coherently; upscaling existing final pixels adds no detail |

Keep the existing pixel style, palette anchors and sprite presentation/simulation
boundary. Do not rebuild Phaser/TypeScript as single-file vanilla Canvas. New
functions extend the existing contracts, theme definitions, selectors and UI.

### Concurrent-work and identifier guardrails

This amendment owns this section and `build/ARCHITECTURE_MAP.html` only. It
does not edit active build checklists, source, manifests, progress, README or
the shared reconciliation log while the other performance session is writing
them. Preserve earlier roadmap edits and re-read changed authorities before
refreshing the map. Record any promoted implementation decision in reconciliation
with its owning phase later; this section is the durable design-review record.

Map identifiers reuse content IDs (`enemy.fast_fragile`, `upgrade.weapon_range`),
feature IDs F1–F20 and phase IDs P0–P6 where available. `SYS-*`, `UI-*`,
`ART-*`, `DATA-*` and `TOOL-*` are documentation references, not new saved IDs.
Never renumber/reuse an existing map ID; retain a retired identifier with a
replacement pointer. Preserve ID fragments when updating the single HTML file.
The map embeds its catalog to work offline and requires no library/build change.
Source links resolve relative to the repository; the map itself also remains
usable when copied elsewhere, although source links then need the repository.

Map verification at capture: **126 unique items / 381 linked relationships**,
90 current items including current-phase foundations. Every source path exists;
isolated Chromium checks pass for phase/search/area/status filtering, expandable
details, related-item navigation/history, ID deep links, reset/list/summary
controls, mobile width and light/dark layouts, with no page errors. Visual
inspection uses settled screenshots. No game suite or performance recording is
run by this amendment; the other session retains those resources. The previous
roadmap text is verified unchanged after removing this added section.

## Verification and reporting

Run the phase's targeted units/browser paths after meaningful changes. Before
marking a phase complete, verify the applicable gate. The following full
browser/stress commands are CI or separately scheduled consolidated-gate
references; they are not per-session local requirements:

```sh
npm run typecheck
npm test -- --run
npm run lint
npm run build
npm run test:e2e:ci
npm run test:e2e:stress -- --workers=1
```

Use `npm run balance` when combat, progression, spawning, or world tuning changes.
Run `npm audit --audit-level=high` for dependency changes and milestone delivery
where network access permits. Keep the long readability measurement opt-in:

```sh
ARENA_LONG_MEASURE=1 npm run test:e2e -- --grep @measurement --workers=1
```

Manual performance recordings complement these commands; the existing short
stress test is not a sustained real-device benchmark. Record commands, exit
status, failures, skips, and blocked checks accurately. Never disable a failing
test or add retries to disguise performance regressions. Fix related defects;
leave unrelated user edits intact.

Keep `AUTONOMOUS_PROGRESS.md` concise: objective; branch/HEAD; current phase;
session start/deadline/actual elapsed; completed and partial work; commands and
results; evidence links; decisions/reconciliation IDs; outstanding issues;
selected/pending feature IDs; next task; blockers. Update after every completed
cycle and at interruption/end. On recovery, inspect the diff and verify partial
work before resuming; do not trust a stale checkbox.

At session end, report objective status, implemented features, fixed bugs,
measured improvements, executed checks, unverified work, remaining features,
known risks/blockers, and the next priority. Stop at the real deadline, a fully
validated objective, or an actual inability to progress. Do not wait for another
instruction between safe tasks during a running session.

Work stays in this repository. No production deployment, cloud/billing changes,
secret edits, destructive migration, unrelated data access, or external messaging.
Use isolated fixtures for saves. Runtime save import must still require the
player's explicit confirmation and successful backup. If restricted permissions
block a check, document it and continue independent work without pretending it ran.


## Deferred scope retained from consolidated historical plans

These are historical design inputs, not new content selection. Later delivered
items (including endless/clearing and difficulty presets) must not be scheduled
again. Current C1–C7, F1–F20, SAVE_DATA and the active plans govern what remains.

### V0.4 candidates

1. **Weapon and equipment slots, and delivery kinds.** Rather than one deepening weapon, move to a small number of auto-firing weapon slots plus passive equipment slots. This is the natural home for the type system described in [`EDUCATION_PIVOT.md`](./EDUCATION_PIVOT.md), and it is where weapon level caps and evolution belong.

   It is also where `WeaponDefinition` splits delivery into a discriminated union, so a melee weapon can declare an arc and a target cap instead of a projectile speed and lifetime. V0.3 deliberately stops at the generic stat surface — `range`, `knockback`, `armourPierce`, and optional per-weapon crit — because the union's shape depends on decisions slots have not made yet. Splash also belongs here, and needs an explicit boundary against the existing on-kill detonation skill: splash triggers on hit, detonation on kill, and the damage ledger has to keep them apart.
2. **Type and effectiveness system.** Enemy and tool attributes with a small effectiveness matrix. Designed in `EDUCATION_PIVOT.md`; it needs the slot system first.
3. **Endless mode.** The director already supports `t > 1`; endless needs only the escalation index and a terminal condition.
4. **Mini-boss at the final milestone.** The run currently ends when the timer expires; a telegraphed climax is a better ending.
5. **Per-run seed display and seeded replay.** Nearly free given the existing seeded randoms, and it makes balance reports reproducible.
6. **Profile persistence** for settings, best-run statistics, and unlocks — the natural first slice of `SAVE_DATA.md`.
7. **Meta-progression.** Permanent unlocks between runs are why the reference games retain players past the first hour, but they should land only once the in-run curve is right.
8. **Layered composite enemies.** Multi-material enemies whose outer shell breaks to expose a different interior. Strong design and a natural fit for the environment theme; see `EDUCATION_PIVOT.md`.
9. **Colour-independent enemy identification.** Roles are distinguished by colour plus subtle geometry; distinct silhouettes would help both accessibility and split-second reads in a 300-enemy crowd.
10. **Per-enemy invulnerability windows**, revisited alongside the above.

---
