# V0.4.3 — Performance Readiness and Selected Content Growth

This increment establishes browser performance readiness before selected content
growth from [`PLAN.md`](./PLAN.md), after V0.4.2 proved the tighter, slower,
real-world-tool baseline is worth growing.

This plan was originally V0.4.2. It had not started when the readability,
pacing, and real-world starter-weapon redirect was accepted, so that redirect
now owns V0.4.2 and content growth moves back one number intact.

Begin only after V0.4.2 has merged and its play-test gate has accepted the new
camera, pace, and cleanup-grabber baseline. Read [`BUILD_PLAN_V0.4.md`](./BUILD_PLAN_V0.4.md)
first. In particular: **never read a sprite from a system, and never derive a
radius, hitbox, or separation value from one.** New content added here renders
as a primitive until V0.4.4 sprites the reconciled roster, and that is correct.

## Execution status

**P0 complete on `codex/v0.4.3` (2026-10-12); Q1/Q2/Q3/Q4 and P1 gameplay/software gates verified; P2/P3/P4 verified; P5 lifecycle/startup affected gates verified, consolidated acceptance pending; Q5 CI/audit repair verified (REC-113/114).** The merged readable
baseline and V0.4.2.1 correction gate are satisfied (`103afa7`). The owner has
authorized performance P0–P6 from the autonomous roadmap, ahead of content
growth (REC-100, REC-102). C1–C7 below retain their order; F16 difficulty is
selected and delivered in Q1, and other optional content remains unselected. Historical status annotations supplied in the working tree
record the pre-session planning assessment; the execution status here is current.

## Q1 — Player presentation and selected difficulty presets

The owner requested these corrections after P0: correct player facing and smooth
walking, crisp world/background text, common tool-upgrade availability, and
Beginner / Normal / Experienced run difficulty. This explicitly selects F16 and
brings this small play-test correction ahead of P1 (REC-105/106); other optional
content and the P1–P6 order remain gated. Normal is slightly easier than the
current baseline; Experienced is harder. Difficulty never changes the gameplay
clock, visible world, actor radii or technical population caps.

**Commit:** `feat(v0.4.3): correct player presentation and add difficulty presets`

Ownership: this plan and V0.4 sequence; `PLAN.md`, `EDUCATION_PIVOT.md`,
`THEME_ARCHETYPES.md`, `SAVE_DATA.md`, README, autonomous roadmap/progress and
reconciliation; core sprite/difficulty contracts and validation; theme-owned
preset data/copy and eco sprite metadata/upgrade rarity; sprite animation/view
presentation, menu/run scenes, UI text/settings/HUD, settings/run state,
`systems/difficulty/**`, pacing simulator/format and `scripts/balance.ts`, test
bridge, alternate fixture and corresponding units/browser tests. Sprite bitmap,
raw generation, loader/packing and remaining roster claims are excluded.

- [x] Q1 — reproduce/correct authored facing and frame cadence; render world text
  at adequate texture resolution; select/snapshot three theme-owned presets;
  make tool upgrades commonly available; validate menu/run/restart, ledger,
  readable text, both themes, balance comparisons and per-preset stress.

Short gate: typecheck, targeted sprite/settings/difficulty/content/simulation
units, `npm run balance -- --difficulty all --build damage-rush`, lint/build,
focused sprite/difficulty/text/menu browsers, full units/Chromium and serial
stress for all presets. Inspect player-facing motion/text in the real browser;
do not infer correct facing from the mirrored boolean alone. Keep the supplied
seven status annotations outside this phase commit.

Q1 evidence (2026-10-12): 414 units / 48 files, typecheck/lint/build; full
Chromium regression (75 pass, one existing opt-in skip), four difficulty browser
cases including next-run settings, and all three serial stress cases pass.
Actual PNG/browser inspection confirms authored right-facing walks and left-facing
hit-pose correction; a 136-frame movement trace has no idle flashes/wrong flips.
World title/hint textures use resolution 4 at 2× camera zoom. See REC-105/106 and
`AUTONOMOUS_PROGRESS.md` for balance evidence and limitations.

## Q2 — Event readability, roster inspection, opening composition and spawn accounting

Owner-authorized follow-up before P1: crisp event name/prompt textures and spent
minimap removal; opening Microplastics with sporadic Plastic Bottles from 30 s
(timer time) ramping later; visible Glass Shards using the existing accepted
broken-glass frame; standalone sprite inspection/review tool; live/cumulative
spawn-origin counts. Bagged Waste composition remains unchanged pending owner
confirmation. This is a narrow exception to the sprite ownership gate: reuse
accepted art without bitmap edits, new generation or remaining roster claims.

Ownership: plans/progress/README/reconciliation, product/theme/education and
sprite plan/manifest notes; ShrineActor, EnemyActor, RunScene; theme director/enemy opening reward,
sprite aliases and copy; core sprite frame alias/role wave switch contracts and
validation; sprite resolver/runtime frame; spawn accounting and matching HUD/
pause statistics; standalone `sprite-browser.html`, `src/tools/sprite-browser*`,
Vite multi-entry configuration; corresponding unit/browser tests and fixtures.

Commit: `fix(v0.4.3): clarify site events and inspect the sprite roster`

- [x] Q2 — affected units/types/lint/build, balance, focused event/minimap/roster/
  sprite-browser/provenance browsers, serial stress and visual inspection pass.

Q2 gate: 416 units / 49 files, types/lint/build, all-preset balance, 13 focused
browsers, corrected full Chromium 78 pass / one opt-in skip, three serial stress
cases, and live event/roster/tool screenshots pass. See REC-107/108.

P1 also owns favicon metadata in `index.html` / `sprite-browser.html`: a
headed probe confirmed `/favicon.ico` 404s, so explicitly declare an empty icon
rather than hide resource failures. No bitmap/art generation is involved.

P1 additionally owns `scripts/performance.ts`, `scripts/check-production.ts`, its validation command
in `package.json`, measurement reports/config and
bench-only RunScene cap/load options for a sustained capacity sweep. Production
stays capped at 300; controlled 150/300/450/600 loads measure wall p95/p99/stalls,
update CPU, visible population, source counts and errors. Repeated software-GPU
results do not authorize a production cap increase or replace hardware evidence.

## Q3 — Wrap-up corrections and Session 3 handoff

Owner-requested before starting P2: investigate clipped/missing upgrade detail,
stationary aqua shards, slow timer and detached glass pixels; link sprite browser
back to the architecture atlas; reconcile documentation and prepare a new-session
prompt. P2 remains unstarted. Ownership: upgrade selection/description rules and
RunScene offer call site, level-up overlay layout and corresponding tests;
sprite browser navigation, architecture snapshot/status, Vite atlas entry,
production navigation/report-output check, manifest review notes,
plans/progress/README/reconciliation and `SESSION_3_PROMPT.md`. No bitmap changes,
clock/fragment tuning, cap increase or optional content is authorized by this correction.

Commit: `fix(v0.4.3): bound upgrade cards and close capped skill offers`

- [x] Q3 — focused upgrade/layout/navigation/roster/clock gate, types/units/lint/
  build, production check and browser regression; inspect live layout and record
  findings. Preserve existing status annotations and concurrent atlas/roadmap work.

Q3 gate (2026-10-12): final types/lint/build and **424 units / 50 files** pass;
13 focused browsers, full Chromium **81 pass / one existing opt-in skip**, final
strengthened per-card containment/pointer regression and **3 serial stress cases**
(34.9 s) pass. Built production diagnostics/boot/play/pause/tool/atlas navigation
passes with zero browser errors. Visual layout and accepted/packed art inspected.
See REC-111 and the new-session `SESSION_3_PROMPT.md`. No new sustained performance
comparison was required or claimed by this correction.

## Q4 — One-hit opening Microplastics and starting-stat inspection

Owner-requested 2026-10-13 before P2: compare lowering Microplastics health with
raising starter tool damage; make ordinary unmodified opening Microplastics die
to one non-critical hit in all presets, retaining later escalation. Add starting
stats to the sprite review tool and refresh the affected atlas definition.
Ownership: eco enemy health/data comments; standalone sprite browser and pure
stat-inspection helper; corresponding units/browser checks; balance assessment
script/report and production stat-view check; active plans, product/theme/education notes, progress, reconciliation,
README and Session 3 handoff, including the discovered audit/readiness blocker. No bitmap, other roster/tuning, clock or cap changes.
The owner explicitly requests pushing this verified branch and opening one PR
into main now; this review checkpoint does not mark P2–P6 or V0.4.3 complete.

Commit: `fix(v0.4.3): make opening Microplastics one-hit across difficulties`

- [x] Q4 — compare actual starting damage/armour/health and deterministic pacing;
  focused one-hit/later-scaling and stat-view checks; types/units/lint/build,
  full browser regression, serial stress and production exclusion/navigation.

Q4 gameplay gate (2026-10-13): **428 units / 51 files**, types/lint/build,
final **85 Chromium passes / one existing opt-in skip** (2.7 min), final seven
focused browser checks, **3 serial stress cases** (32.6 s), production
exclusion/boot/play/pause/starting stats/atlas navigation and visual review pass.
All reference builds/presets/counterfactuals are retained in the balance report.
The first full run was contaminated by live source edits; final code was frozen.
Death attribution is isolated from opening difficulty, and the stat panel's
native toggle-event race is fixed. **Audit fails** with 14 advisories on unchanged
dependencies (REC-113); this does not complete milestone/readiness or approve merge.
The owner-requested PR is a draft checkpoint. P2 stays next and unstarted.

## Q5 — PR #24 Actions repair

Owner explicitly requests fixing failed Actions checks in the existing PR.
The two captured failed runs stop at Chromium regressions: short movement,
bottle-unlock and Collection Sweep waits fail under the slower simulated clock;
the layout screenshot uses a macOS-only absolute directory. Two level-up paths
are also flaky on CI. The dependency audit is skipped behind that failure and
REC-113 still needs remediation. P2 remains unstarted.

Ownership: affected browser specs/helper and test-output handling; patched
package/lock versions, compatible test/lint/script configuration when necessary;
CI diagnostic artifacts/workflow handling if needed; active plans, progress,
README, Session 3 handoff and reconciliation. No gameplay tuning or optional
feature work. Keep assertions and simulation rate intact; fix bounded scheduling
assumptions and portable output, then remove audited dependency paths through
compatible tested updates. Preserve all original local edits.

Commit: `fix(v0.4.3): repair CI timing and dependency audit checks`

- [x] Q5 local — affected slow-runner browser cases, complete unit/type/lint/build,
  full Chromium and serial stress, simulator/production tooling and npm audit;
  normal clean install and zero advisories.
- [x] Q5 remote — repair head `28ecdba` passed [Actions run 38332255864](https://github.com/PDVersion/Arena-Survivor/actions/runs/38332255864):
  428 units, 85 browser cases / one existing skip, zero flaky/retried cases and
  zero audit vulnerabilities. P2 stays unstarted; latest PR head remains the
  publication verification authority.

## Performance prerequisites — P0–P6

Use one milestone branch, `codex/v0.4.3`, with the following phase commits and
ownership. Each phase also owns matching tests, its checklist, progress, and
material reconciliation updates. Add any newly profiled path to its ownership
before editing. Sprites, roster claims, product/content changes and persistence
are excluded from these performance phases.

| Phase | Ownership / permitted scope | Commit subject |
| --- | --- | --- |
| P0 | Active plans, `AGENTS.md`, `README.md`, `AUTONOMOUS_PROGRESS.md`, `RECONCILIATION.md`, roadmap status; known lint defect in `tests/unit/weapons/collection-sweep.test.ts`; `src/test-support/**`; frame sampling only in `src/game/scenes/run-scene.ts`; `tests/unit/performance/**`, `tests/e2e/frame-measurements.spec.ts`; opt-in `scripts/performance.ts`, measurement command only in `package.json`, measurement config/tests and `build/performance/**` reports | `build(v0.4.3): establish browser performance measurements` |
| P1 | Telemetry call sites in scenes, main boot failure, test-support bridge, architecture/production guard tests; measurement reports/script and bench-only load/cap options per Q2 | `perf(v0.4.3): avoid production telemetry work` |
| P2 | `src/game/ui/{minimap-ui,hud,ui-text}.ts`, corresponding scene presentation hooks, theme presentation tuning and UI tests; measured dependency: opt-in `scripts/performance.ts` and `build/performance/P2*` profiles/reports to compare visible/hidden/paused interface work without runtime diagnostics | `perf(v0.4.3): reduce repeated interface work` |
| P3 | Profiled existing spatial/separation/effects/events/weapons hot paths and scene call sites; exact measurement dependencies: `scripts/performance-p3.ts`, `scripts/performance.ts`, `src/game/systems/statistics/run-statistics.ts`, corresponding `tests/unit/statistics/**`, existing `tests/e2e/phase-{five,nine}-v03.spec.ts` and compound stress gates, and `build/performance/P3*`; measurement-only archived theme selection/fixture controls, no production content changes | `perf(v0.4.3): reduce measured simulation overhead` |
| P4 | Measured rendering/presentation hooks, config, settings/UI, theme presentation tuning, content validation and presentation tests; exact dependencies: `scripts/performance.ts`, `src/game/ui/{minimap-ui,pause-menu-ui}.ts`, setting dispatch in `src/game/scenes/{run,menu}-scene.ts`, `src/game/state/settings-state.ts`, `src/game/core/archetypes/tuning.ts`, both themes’ `view.ts`, `src/game/content/define-theme.ts`, matching settings/content/UI units, `tests/fixtures/alternate-theme.ts`, `tests/e2e/presentation-v043.spec.ts`, and `build/performance/P4*`. Repository testing policy in `AGENTS.md` follows owner’s limited-local-browser instruction | `feat(v0.4.3): add a lightweight presentation mode` |
| P5 | Entity/feedback/scene lifecycle cleanup, restart tests, measured boot/asset-loading improvements outside the sprite pipeline. Session 6 exact dependencies: `src/game/scenes/run-scene.ts`, `src/game/entities/pickup-actor.ts`, `tests/unit/lifecycle/**`, `tests/e2e/lifecycle-v043.spec.ts`, `tests/fixtures/phaser-runtime.ts`, `build/performance/P5_LIFECYCLE_REPORT.md`, progress/reconciliation. Session 7 exact dependencies: `scripts/performance-startup.ts`, `src/main.ts`, `src/style.css`, `src/game/start-game.ts`, `src/game/scenes/boot-scene.ts`, `src/game/systems/boot/**`, `src/game/core/archetypes/contracts.ts`, `src/game/content/define-theme.ts`, both themes’ `copy.ts`, `tests/fixtures/alternate-theme.ts`, `tests/unit/boot/**`, affected architecture tests, and `build/performance/P5_STARTUP*`. Existing sprite pipeline stays unchanged; startup changes require observed failure/cost | `fix(v0.4.3): bound lifecycle and startup costs` |
| P6 | Performance reports, browser harness, documentation and narrow regression fixes from the combined gate | `test(v0.4.3): verify browser performance readiness` |

- [x] P0 — explicit raw wall-frame versus simulation units, focused half-rate /
  hit-stop regression, lint repair, types/units/lint/build and browser boot/load
  baseline; bounded percentiles / update CPU / metadata reporting if time permits.
- [x] P1 — guard snapshot construction outside test mode; verify production
  interface exclusion and working test snapshots; compare equivalent profiles.
- [x] P2 — profile minimap/HUD, reduce confirmed repeated work; validate visibility,
  resize, opacity, pause/restart and prompt critical status updates.
- [x] P3 — improve measured simulation hotspot; preserve targets, causal order,
  exact rewards/ledger, caps and stress; skip speculative optimization.
- [x] P4 — measured Default/Low enemy minimap geometry; affected local gate accepted;
  simulation, visible world and telegraphs remain equivalent. Read `SAVE_DATA.md`
  before serializable settings; presentation budgets stay theme-owned.
- [ ] P5 — sustained play/restarts/focus and cold/warm startup evidence; fix only
  demonstrated lifecycle/boot issues, keeping cleanup bounded. Session 6's affected
  lifecycle gate is accepted below; this overall checkbox remains open.
- [x] P5 lifecycle slice / Session 6 — REC-117 overflow tracking, paid-collect-cue
  reward race and stopped-scene references; both-theme deterministic coverage and
  bounded serial Phaser collection/stop/start ownership checks (REC-119).
- [x] P5 startup affected gate / Session 7 — cold/warm transfer/render/upload/decode
  evidence; WebGL/Canvas, unsupported graphics and declared asset/module network
  failures with retry. See REC-010 continuation and `performance/P5_STARTUP_REPORT.md`.
- [ ] P5 remaining consolidated acceptance — authored/overtime/focus/resume/long
  lifecycle checks and broader browser compatibility remain deferred under the
  owner resource policy. Do not treat those as locally passed or start P6 yet.
- [ ] P6 — combined software gate, baseline/final reports and manual device
  checklist; representative older-device acceptance measured or explicitly pending.

P0's short gate is `npm run typecheck`, `npm test -- --run`, `npm run lint`,
`npm run build`, serial boot/load/frame-measurement browser tests and the existing
serial stress path. Run `npm run test:e2e:ci` before committing P0. A blocked
browser check has its actual reason and rerun command recorded; it does not become
a passing gate. Later phases use affected units/browser tests, production build
and serial stress where relevant; P6 runs the full roadmap verification suite.
Use `npm run balance` for actual pacing/tuning changes and audit for dependency
changes/milestone delivery. Hardware thresholds never enter required CI.

Performance reports state device/OS/browser/renderer, viewport, mode, build,
scenario, gameplay rate and sample exclusions. Warm up, sample sustained cases
for at least 60 seconds and repeat comparisons three times serially. Targets are
provisional: desktop p95 ≤20 ms, older device / worst supported 300-load p95
≤40 ms; intervals >100 ms below 1%, plus p99/max. Profile production separately
from test instrumentation. Throttled Chromium is comparative evidence only.
P0–P6's software gate precedes C1; missing physical hardware leaves acceptance
pending and must be reported before describing older-device readiness as complete.

P0 evidence: 408 units / 47 files, typecheck/lint/build, 72 Chromium regressions
(one opt-in skip), serial stress/cleanup/restarts, six warmed 60-second test /
production recordings and three short instrumented stress recordings all pass.
See [`performance/P0_BASELINE.md`](./performance/P0_BASELINE.md), REC-103/104.
These verify the measurement/software gate; provisional throughput and physical
older-device acceptance remain pending. Production diagnostic scans are P1.

P1 verified 2026-10-12: 420 units / 50 files, types/lint/build, production
emitted-code/boot/play/pause/tool check, 79 Chromium regressions (one opt-in
skip), and three serial stress cases pass. Six matched production windows,
12 software and six local Metal GPU capacity windows are recorded in
[`performance/P1_REPORT.md`](./performance/P1_REPORT.md) (REC-109/110).
Production diagnostic work is excluded; frame p95 in the default comparison
remains 17.2 ms. Local calm 600-live performance shows headroom, but supported
older-device/mixed-combat cap acceptance remains pending. Production stays 300.
P2 verified 2026-10-13: 438 units / 52 files, types/lint/build, 13 targeted
browsers, 88 full Chromium passes / one existing skip, production exclusion and
three serial stress cases pass. Twenty-four primary warmed ≥60 s windows plus
three retained exploratory baselines and six short probes establish reduced
interface calls/allocations, without a meaningful frame-rate gain. Visible-map
SwiftShader median p95 remains 41.7 ms; physical older-device readiness remains
pending and production cap stays 300. See [`performance/P2_REPORT.md`](./performance/P2_REPORT.md),
REC-115. P3 is next; no dependent phase has started.

P3 verified 2026-10-14 after owner pause/resume: 440 units / 52 files,
typecheck/lint/build, production exclusion/boot/tool check, seven targeted
browsers, 88 full Chromium passes / one existing opt-in skip, and three serial
stress cases pass with zero retries. Thirty primary warmed >=60 s windows
cover dense/distributed 300-live crowds, sustained replenished mixed bursts in
both production themes/delivery kinds, and matched production play. Six initial
production windows (including uncontrolled post-pause after data) remain separate.
Single-pass immutable kill-window construction reduces median active update p95
4.3→2.9 ms in eco melee and 3.8→2.4 ms in retained projectile bursts; frame p95
remains 33.4 ms. Ordinary production does not show a speedup (16.9→17.5 ms).
No global frame/device readiness is claimed. See REC-116 and
[`performance/P3_REPORT.md`](./performance/P3_REPORT.md). Pre-existing pickup
retention (250 active / 535 tracked) is REC-117, a P5 gate issue; no lifecycle fix
is pulled forward. P4–P6 and optional content remain unstarted.

## Content scope, from PLAN.md

| # | Item | Phase | Notes |
| --- | --- | --- | --- |
| 1 | Additional weapons | C1 | Needs weapon slots first — the delivery-kind union deferred in REC-051 |
| 2 | Weapon evolution | C2 | Depends on slots and on the upgrade tiers from REC-065 |
| 3 | Additional shrine types | C3 | The arrival scheduler from REC-059 already takes any number |
| 4 | Additional curses | C3 | New content category; the `world.modify` effect is the existing seam |
| 5 | Elite modifiers | C4 | Today there is one baseline elite (REC-037); this makes it a family |
| 6 | Mini-boss | C5 | Fires at a director milestone |
| 7 | Final boss | C5 | Replaces the timer as the run's climax |
| 8 | Unlockable weapons | C6 | Needs persistence |
| 9 | Unlockable upgrade pool | C6 | Needs persistence |
| 10 | Browser-local profile persistence | C6 | [`SAVE_DATA.md`](./SAVE_DATA.md) |
| 11 | Export progress as encoded text | C7 | `SAVE_DATA.md` |
| 12 | Import with validation, preview, backup, migration | C7 | `SAVE_DATA.md` |
| 13 | Advanced statistics | C6 | The session slice from REC-062 is the foundation |
| — | ~~Endless mode~~ | **Done** | Shipped early in V0.3.1 — REC-064, REC-068 |

## Phases

Ordered by dependency, and sized so each ends in something playable.

### C1 — Weapon slots and a second weapon
The delivery-kind union deliberately deferred in REC-051, because its shape
depended on decisions slots had not made yet. Slots make it decidable: a melee
weapon declares an arc and a target cap instead of a projectile speed and
lifetime.

V0.4.2 now lands that union early for the Cleanup Grabber. C1 must begin by
reading the shipped contract and extending it rather than creating a second
delivery abstraction. In the eco theme the second weapon—not the starter—is the
first candidate for reviving a parked projectile or area mechanic, and it must
still satisfy V0.4.2's simplicity/readability gate.

Splash lands here too, and needs an explicit boundary against the existing
on-kill detonation: **splash triggers on hit, detonation on kill**, and the
damage ledger has to keep them apart or the Processing Ledger stops reconciling.

Slots also decide what an upgrade offer is. Weapon-owned upgrades enter the pool
only when their weapon is equipped, which is the one change to upgrade selection
this phase makes — see "Decisions settled before C1" below.

*Verification:* two weapons fire independently; the ledger reconciles to the
same total it did with one; a weapon's own upgrades are absent from the draw
until it is equipped and present afterwards; the pacing simulator's build models
cover both.

### C2 — Weapon evolution
An evolved weapon is a new definition unlocked by a condition, not a mutated one.
Upgrade tiers (REC-065) are the natural trigger surface.

### C3 — Shrines and curses
A curse is the inverse of a shrine: pressure the player accepts for a reward,
but persistent and chosen at a different moment. Both resolve through the world
model from REC-035, which already takes any number of contributors.

### C4 — Elite modifiers
One baseline elite becomes a small family — an elite that splits, one that
shields, one that accelerates. REC-037's inheritance rules already say what
happens when an elite duplicates or fractures, and this must not break them.

### C5 — Mini-boss and final boss
A boss is an enemy with a health bar, a telegraphed pattern, and a director
milestone that spawns exactly one. The final boss replaces the end-of-timer
prompt: it spawns where the decision used to appear, and REC-064's choice moves
to after the kill rather than being removed. See "Decisions settled before C1".

### C6 — Persistence, unlocks, and advanced statistics
The first real slice of `SAVE_DATA.md`. The session statistics slice from REC-062
is already shaped for the payload's lifetime-statistics field, so this is mostly
adapter and migration work rather than new modelling.

### C7 — Save export and import
Encoded text export, import with validation, preview, backup, and migration.
`SAVE_DATA.md` §"Verification required when implemented" is the acceptance list.

## What this stream must not do

- Edit anything in V0.4.1's ownership block (`BUILD_PLAN_V0.4.md` §3)
- Read a sprite in a system, or size a hitbox from one. The seam gives new
  content this for free: an actor with no sheet renders its primitive, so
  nothing added here needs art to ship
- Assume every content id has a sprite — most will not, for a while
- Reuse reconciliation ids below REC-100. REC-090 is preserved as a V0.4.3
  implementation discovery even though it predates the renumbering; new V0.4.3
  entries begin at REC-100.

## Decisions settled before C1

These were the open questions. They remain the intended content-growth model,
but C1 must revalidate them after V0.4.2 rather than assuming the older
high-density direction survived unchanged.

### A weapon has both global upgrades and its own

Stat modifiers stay **global**: `WeaponStatModifiers` keeps its current shape and
its gains apply to every equipped weapon, so `upgrade.pierce` and
`upgrade.projectile_count` do not have to be re-authored per slot and do not
become dead cards when a slot is empty.

A weapon is **acquired from the normal level-up draw** — a weapon card fills an
empty slot — rather than through a separate selection step. The level-up UI is
unchanged.

On top of that, **each weapon carries its own upgrade entries**, which affect
only that weapon. They may raise its stats or change its mechanic slightly, and
they enter the pool **only once that weapon is equipped**, so the draw never
offers an upgrade for a weapon the player does not have. This is the part that
makes a second weapon a build decision rather than a second damage number: the
two weapons diverge through their own cards, not only through what they started
with.

Consequences for C1:

- `isUpgradeAvailable` gains an equipped-weapon condition alongside its existing
  cap check. That is the only change to `selectUpgradeChoices`' contract, and
  the category-spread rule keeps working unchanged.
- A weapon-owned upgrade needs somewhere to live in the theme. It belongs beside
  the weapon in `weapons.ts`, not in the general `upgrades.ts` pool, so a weapon
  and everything that improves it are read in one place.
- Weapon-owned mechanical changes are the seam that later makes evolution
  (C2) authorable, since an evolved weapon is a definition that a condition
  unlocks rather than a mutated one.
- The tier roll from REC-065 applies to weapon-owned upgrades exactly as it does
  to the shared pool. Integer targets still round and still floor at the
  authored value.

### Evolution replaces the weapon in its slot

An evolved weapon takes the place of the one it grew from. It does not consume a
second slot, and the slot count is unchanged by evolving.

### The final boss replaces the end-of-timer prompt

At the authored duration the final boss spawns **instead of** the `time_up`
decision. Defeating it ends the run as cleared.

The decision from REC-064 is not removed — it is **moved to after the kill**.
The player still chooses how the run resolves; they simply make that choice
having beaten the boss rather than instead of meeting one. Both options keep
their current meaning: `endless` lifts the limit and plays until death,
`clearing` stops new arrivals and ends on an empty field.

This preserves REC-064's principle, which is that the run's length and its
difficulty are things the player opts into. It also means `RunState` needs a
status for "the boss is up" that is distinct from `time_up`, since the timer
expiring no longer holds the simulation — the boss fight is live play.


P4 accepted 2026-10-15 under the owner's limited-local-browser policy (REC-118).
Default retains circular enemy minimap markers; Low uses direct theme-owned
rectangles, with unchanged centres/extents, cadence, essential markers and game
rules. Twenty-seven serial warmed >=60-second windows compare frozen baseline,
candidate Default and Low across visible 300-live map, combat bursts and
production. Low dense-map median wall p95 is 25.1 ms vs Default 41.7 ms (~40%
lower); baseline dense varies (median 35.4 ms). No universal or physical-device
speedup is claimed. Types/units/lint/build/production check and six affected
browser cases (three per theme), one worker/zero retries, pass. Full local
Chromium/stress is deferred to Actions or the combined multi-session gate per
owner; no current P4 CI pass is claimed. Report: `performance/P4_REPORT.md`.
P5 is next and must address REC-117; P5/content work has not started.


Session 6 / P5 lifecycle affected gate accepted 2026-10-15. REC-117 is resolved:
1,040 drops/790 merges retain exactly 250 tracked/live/group/enabled-body pickups,
then award all 1,040 XP once and release pickup ownership. Both production themes
pass three bounded stop/start reconstructions with engine/retained-reference
baselines restored. Paid collection cues retire early only under cap pressure;
nearest-pair/ties and retained-source attribution stay unchanged for unpaid rewards.
Types, all units, lint/build and two serial one-worker/zero-retry affected browser
cases pass. Full-app Chromium/stress, authored/overtime/focus/mode-switching/long
soaks, production boot/startup and hardware/browser acceptance remain deferred,
not passed. `performance/P5_LIFECYCLE_REPORT.md` records reproduction, checks and
limits. P5 overall stays open; Session 7 startup/compatibility is next, followed
by the combined P6 gate. No push/CI trigger, content, art or persistence work.


Session 7 / P5 startup affected gate accepted 2026-10-15. Two reproduced boot
failures now recover: unavailable canvas contexts fail before Phaser evaluation,
and a failed declared atlas stops transition instead of using missing art.
A dynamic Game-start boundary catches dependency fetch/initialization failures;
owned async loader failure schedules destruction and shows theme-owned safe-text
reload controls. Atlas/module recovery and actual reload-to-run paths pass.
This is a demonstrated error boundary, with no claimed loading-speed improvement.
Bounded production cold/warm/slow-network and separate decode evidence, existing
production guard, one affected test-mode boot/resize case, 474 units/56 files,
types/lint/build pass. Remaining P5 lifecycle/broader compatibility acceptance,
full Chromium/stress and device evidence stay pending; P5 overall remains open.
No P6/content, push or CI trigger. See `performance/P5_STARTUP_REPORT.md`.


## Q5 follow-up — PR #25 CI artifacts and bounded UI-test budgets (2026-10-16)

Owner reports failed Actions. Run `38670385486`, head `d9047c0`, fails two
P4 screenshot writes to macOS-only `/private/tmp`; the resize/settings/restart
case is flaky because its cumulative 30-second test budget expires during its
fourth click. This repair does not start P6 or alter gameplay. Current local
HEAD `3d1ee2f` also contains the two unpublished P5 slices.

Ownership: `tests/e2e/presentation-v043.spec.ts`, the first scenario in
`tests/e2e/interface-work.spec.ts`, this plan, `AUTONOMOUS_PROGRESS.md`, REC-114
and `build/performance/CI_REPAIR_20261016.md`. Use Playwright test-owned artifact
paths and bounded scenario budgets while retaining every state/cap/resize/XP
assertion, input action and simulation rate. No forced clicks, retries or runtime
tuning to mask the CI result. Verify only the three affected browser cases locally,
one worker/zero retries, plus units/types/lint/build and whitespace. Full CI/stress
remains deferred under the owner's resource budget. Preserve original plan edits.

- [x] Local CI repair gate — three affected serial cases pass without retries;
  474 units/56 files, types/lint/build/whitespace pass; five test-owned artifacts.
- [ ] Remote CI repair gate — only an Actions pass matching a published repair
  head verifies the PR; prior failed/successful heads are not current evidence.
