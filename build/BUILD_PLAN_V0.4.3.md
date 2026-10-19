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

## Execution authority

[BUILD_STATUS.md](BUILD_STATUS.md) is the single date/status summary. Completed
Q1–Q5 and P0–P4 records, plus the verified P5 slices, are consolidated in
[MASTER_BUILD_PLAN.md](MASTER_BUILD_PLAN.md#v0-4-3-corrections). The active work is remaining P5 acceptance and owner-authorized P6 software preparation (2026-10-19). Physical/browser acceptance remains pending; preparation does not close P5 or start content. F16 was selected and delivered. Owner requests the remaining planned C1–C7; implementation waits for the gate-order decision. Other optional proposals remain unselected.

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
| P5 | Entity/feedback/scene lifecycle cleanup, restart tests, measured boot/asset-loading improvements outside the sprite pipeline. Session 6 exact dependencies: `src/game/scenes/run-scene.ts`, `src/game/entities/pickup-actor.ts`, `tests/unit/lifecycle/**`, `tests/e2e/lifecycle-v043.spec.ts`, `tests/fixtures/phaser-runtime.ts`, `build/performance/P5_LIFECYCLE_REPORT.md`, progress/reconciliation. Session 7 exact dependencies: `scripts/performance-startup.ts`, `src/main.ts`, `src/style.css`, `src/game/start-game.ts`, `src/game/scenes/boot-scene.ts`, `src/game/systems/boot/**`, `src/game/core/archetypes/contracts.ts`, `src/game/content/define-theme.ts`, both themes’ `copy.ts`, `tests/fixtures/alternate-theme.ts`, `tests/unit/boot/**`, affected architecture tests, and `build/performance/P5_STARTUP*`. Session 8 acceptance dependencies: `build/performance/P5_ACCEPTANCE_REPORT.md`, current/successor session handoffs, README handoff/status links, roadmap/status/master/progress and existing REC-119 continuation. Session 9 exact acceptance dependencies: `tests/e2e/native-visibility-v043.spec.ts`, `tests/unit/lifecycle/focus.test.ts`, `build/performance/P5_NATIVE_VISIBILITY.json`, acceptance report and current/successor handoffs. Session 10 owner-authorized consolidated campaign: `tests/e2e/lifecycle-campaign-v043.spec.ts`, `tests/fixtures/p5-campaign.{html,ts}`, `build/performance/P5_CAMPAIGN*`, acceptance/status/progress/master/reconciliation and successor handoff. Session 12 also owns `tests/native/firefox-compatibility.py`, `build/performance/P5_FIREFOX*` for two bounded unpatched Mozilla application smoke checks, without system installation/dependency changes. Session 12 P5 follow-up adds opt-in Edge executable/report selection in `tests/playwright.compatibility.config.ts`, native Safari driver support in `tests/native/safari-compatibility.py` and `build/performance/P5_{EDGE,SAFARI}*`. Session 11 owner-selected-by-delegation compatibility dependencies: `tests/playwright.compatibility.config.ts`, `tests/e2e/compatibility-environment-v043.spec.ts`, existing boot/phase-two/gameplay-rate/presentation/lifecycle specs (unchanged assertions), `build/performance/P5_COMPATIBILITY*` and acceptance/status/master/progress/reconciliation/handoffs. One bounded serial cross-engine run on available M5; no physical-device inference or P6. Session 10 authorization covered one serial M5 lifecycle campaign only. No runtime change without a reproduced defect. Existing sprite pipeline stays unchanged; startup changes require observed failure/cost | `fix(v0.4.3): bound lifecycle and startup costs` |
| P6 | Performance reports, browser harness, documentation and narrow regression fixes from the combined gate. Session 12 exact dependencies: `scripts/build-device-pack.ts`, `tests/device-pack/**`, `tests/e2e/device-pack-v043.spec.ts`, `tests/playwright.device-pack.config.ts`, `tests/e2e/phase-{five,eight-v03}.spec.ts`, `scripts/performance.ts` key-input holds, `tests/native/safari-compatibility.py`, `build/performance/P6*`, P5 acceptance/status/master/progress/reconciliation/handoffs. Owner explicitly requests starting P6 while finishing P5; software preparation may proceed, but no missing physical/browser evidence is marked passed and C1 stays gated. | `test(v0.4.3): verify browser performance readiness` |

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
- [x] P5 acceptance inventory / Session 8 — inspected scenario assertions and
  recorded covered/partial/pending evidence in `performance/P5_ACCEPTANCE_REPORT.md`.
  Native tab-switch probe did not reach hidden state; no runtime defect reproduced.
- [x] P5 native-event slice / Session 9 — actual same-window Chromium tabs with
  focus emulation absent, trusted events, frozen hidden clock/spawns/queues and
  7.493 ms first observed advancement; 14 both-theme deterministic state guards.
  This brief light case does not accept native overlays, pending work or long play.
- [x] P5 owner-authorized consolidated lifecycle / Session 10 — 20-minute M5
  ownership campaign, authored 300,000 ms at 0.5, five-minute endless extension,
  ten short terminal cycles, native overlays/pending spawn, ten presentation/
  resize changes, twelve clean create/stops, thirteen actual closed AudioContexts.
  Test-only survival/focus aids and measurement limits are explicit in
  `performance/P5_CAMPAIGN_REPORT.md`; no runtime fix or broader readiness claim.
- [x] P5 Session 11 available desktop-engine compatibility — owner delegates support selection; 52 serial focused checks pass in installed Chrome/pinned Chromium/Firefox/WebKit, with four final guard-only probes. Test input/resize readiness corrections only; no runtime defect. See `performance/P5_COMPATIBILITY_REPORT.md`.
- [x] P5 Session12 branded follow-up —26 Edge155/154 focused passes and two unpatched headed Firefox158/157.0.1 smokes. Safari session blocked by its setting; no runtime change. See `performance/P5_COMPATIBILITY_FOLLOWUP.md`.
- [ ] P5 remaining acceptance — selected current/previous-major desktop Chrome/Edge/Firefox/Safari policy; actual branded/platform combinations and representative older integrated-GPU access/evidence remain pending. Preserve all prior aided-campaign limits; no gate waiver. Session 12 stays P5; do not repeat accepted campaigns.
- [x] P6 software/readiness-tool slice —96 browser/stress passes/six explicit opt-in skips, zero retries;488units, types/lint/build/audit; portable device kit verified;18 warmed Default/Low windows at60/150/300, frozen sources. See `performance/P6_READINESS_REPORT.md`.
- [ ] P6 overall acceptance / content gate decision —missing browser/platform and physical older-device evidence stays open. Owner confirms no older machine; requested classification as release-blocking while content proceeds remains unanswered. No content started or acceptance waived.

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

## Next slice — remaining P5 acceptance

Sessions 8–11 evidence is in
[`performance/P5_ACCEPTANCE_REPORT.md`](performance/P5_ACCEPTANCE_REPORT.md).
The owner-authorized consolidated M5 lifecycle campaign passes within its
explicit test/measurement limits; see
[`performance/P5_CAMPAIGN_REPORT.md`](performance/P5_CAMPAIGN_REPORT.md).
Session 11 selects the desktop support policy and passes 52 focused engine checks; see
[`performance/P5_COMPATIBILITY_REPORT.md`](performance/P5_COMPATIBILITY_REPORT.md).
Actual branded/platform and physical older-device evidence remains pending. Obtain
access/captured results for the selected targets; support selection need not be repeated.
Owner authorizes P6 software preparation alongside open P5 acceptance. Its verified slice is in
[`performance/P6_READINESS_REPORT.md`](performance/P6_READINESS_REPORT.md).
The decision to let C1–C7 proceed with missing evidence remaining release-blocking
is pending. No accepted campaign is repeated to imply progress.
The next-session handoff is [SESSION_13_PROMPT.md](SESSION_13_PROMPT.md).
