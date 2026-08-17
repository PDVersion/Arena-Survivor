# Reconciliation Log

Read this file immediately after the current milestone plan, `build/BUILD_PLAN_V0.3.md`, before beginning any work. It is the project's durable memory: record information here when it should change or constrain how later phases and features are built. Completed plans are preserved as `build/BUILD_PLAN_V0.1.md` and `build/BUILD_PLAN_V0.2.md`.

This is not a daily diary or a duplicate issue tracker. Add an entry when a decision, discovered constraint, failed approach, defect cause, workaround, measurement, or external dependency is likely to matter again.

- Current milestone: **V0.3**
- Active phase: **Phase 4 complete — Phase 5 next**
- Release-blocking open entries: **None**

## How to maintain this file

1. Search existing entries before creating a new one.
2. Give new entries the next `REC-NNN` identifier and one status: `Accepted`, `Provisional`, `Superseded`, `Resolved`, or `Open`.
3. State observed facts separately from decisions. Include enough evidence to reproduce a problem or validate a solution.
4. Link the affected phase, test, issue, commit, or file once it exists.
5. When a decision changes, mark the old entry `Superseded` and link the replacement; preserve the history.
6. Update this file within the same commit as the work that produced the learning.
7. An `Open` item blocks a phase only when its entry explicitly says `Blocks: Phase N`.

## Entry template

```markdown
### REC-NNN — Short title

- Status: Accepted | Provisional | Superseded | Resolved | Open
- Date: YYYY-MM-DD
- Affects: phase(s), system(s), or future feature(s)
- Blocks: None | Phase N | Release

Context / observation:
What was requested or observed. Include reproduction steps, measurements, or constraints when relevant.

Decision / solution:
What we will do, or the current best solution if the item remains provisional.

Why:
The trade-off and evidence behind the choice.

Future guardrail:
The specific rule, test, or check that prevents the same problem from recurring.

Revisit when:
The evidence or milestone that should trigger reconsideration.
```

## Current entries

### REC-001 — One Horde shrine is part of V0.1

- Status: Accepted
- Date: 2026-08-11
- Affects: Phase 6, V0.1 acceptance, later shrine/Chaos systems
- Blocks: None

Context / observation:
The product document's V0.1 section omits shrines, but its First Milestone says the player must activate a shrine, cause a large swarm, and survive or die from the resulting chaos. Player-controlled difficulty is also the central design identity.

Decision / solution:
V0.1 includes only the Shrine of the Horde: one activation, 100 enemies scheduled over 20 seconds, and +50% XP on those tagged enemies. Full Chaos progression and every other shrine remain deferred.

Why:
This is the smallest vertical slice that satisfies the stated milestone and tests the game's differentiating idea without importing the entire V0.2 world system.

Future guardrail:
Track enemy spawn source and reward modifiers in data rather than embedding shrine checks in enemy death code.

Revisit when:
V0.2 introduces global Chaos, stacking world modifiers, or multiple simultaneous shrine effects.

### REC-002 — Separate deterministic rules from Phaser integration

- Status: Accepted
- Date: 2026-08-11
- Affects: All V0.1 phases, testing, future content systems
- Blocks: None

Context / observation:
Combat, XP, upgrades, and modifier stacking will become interaction-heavy, while Phaser scenes and physics depend on frame timing and browser state.

Phase 2 evidence: movement normalization, arena clamping, run timing, status transitions, reset, and profile construction are deterministic modules with unit tests. The Phaser scene remains an input/render/physics coordinator, and the Chromium suite verifies the connection without duplicating those rules.

Decision / solution:
Keep stats and game rules in framework-independent TypeScript modules with injected randomness/time where needed. Use Vitest for those rules and a thin Playwright suite for the Phaser wiring and critical path.

Why:
This keeps most failures quick and reproducible while still checking that the actual browser game boots and connects its systems.

Future guardrail:
New mechanics require rule-level tests; browser tests should assert public/test telemetry rather than canvas pixels or arbitrary sleeps.

Revisit when:
Profiling or later mechanics show that the boundary creates excessive synchronization, allocation, or duplicated authority.

### REC-003 — V0.1 ships as one branch and one pull request

- Status: Accepted
- Date: 2026-08-11
- Affects: Git history, review, delivery
- Blocks: None

Context / observation:
V0.1 is a small greenfield vertical slice whose phases depend on the immediately preceding foundation.

Decision / solution:
Use `codex/v0.1`, one ordered commit per numbered phase, and one pull request into `main`. Later corrections to completed/shared phase commits use focused fix commits rather than hidden history rewrites.

Why:
One PR keeps the playable slice reviewable as a coherent outcome, while phase commits provide bounded checkpoints and make regressions easier to locate.

Future guardrail:
Every phase must pass its listed verification before its commit; unrelated and V0.2 work stays out of the branch.

Revisit when:
The PR becomes too large to review safely, a phase can ship independently, or more than one contributor needs isolated integration branches.

### REC-004 — V0.1 uses generated placeholders

- Status: Provisional
- Date: 2026-08-11
- Affects: Rendering, feedback, assets, repository size
- Blocks: None

Context / observation:
No art or audio direction/assets exist yet, but external asset production is not needed to prove the loop.

Decision / solution:
Use generated geometry, simple particles, colour, scale, and text for V0.1 feedback. Do not make external art or audio a release blocker.

Why:
This keeps V0.1 focused on mechanics and readability while avoiding throwaway asset-pipeline decisions.

Future guardrail:
Rendering code must not be the authority for combat state; later assets should be replaceable without changing rules.

Revisit when:
An art direction is approved or V0.2 feedback/audio work begins.

### REC-005 — Fiction is an interchangeable theme pack

- Status: Accepted
- Date: 2026-08-11
- Affects: All phases, every content category, UI, assets, testing, saves/telemetry
- Blocks: None

Context / observation:
The current design reads as knights and magic, but the project may pivot to another theme. If current names and assumptions enter class names, scene logic, UI, tests, and asset paths, a later pivot would require a fragile repository-wide search and refactor.

Decision / solution:
Build the knights-and-magic fiction as the first theme pack from Phase 1. Core uses stable theme-neutral archetype IDs/contracts. A root theme manifest assembles category definitions; one copy catalog owns every player-facing name/description; theme tokens own presentation references; and one active-theme facade is the only production selection point. Generic actors and systems consume definitions and never branch on themed strings. A small test-only alternate manifest proves the boundary without adding a second production theme.

Why:
This isolates rename-only, presentation-only, per-category mechanical, and full-theme changes to increasingly narrow and predictable files while keeping the current theme intact.

Future guardrail:
Manifest validation checks IDs, copy, references, and values. Import-boundary tests prevent concrete-theme imports outside the selection layer. Rule tests assert stable IDs/outcomes, and current names appear only in theme validation/presentation tests. Persisted data uses stable IDs plus theme/schema versions.

Revisit when:
Phase 1 implementation reveals that the proposed manifest is too broad, the first real alternate theme is designed, or a mechanic cannot be expressed through reusable contracts without theme-specific system logic.

### REC-006 — Complete progress is portable encoded text

- Status: Accepted
- Date: 2026-08-11
- Affects: State boundaries, stable IDs, persistence, progression, unlocks, statistics, settings, themes, V0.3
- Blocks: None

Context / observation:
Players need to export or import all save-game statistics, unlocks, progress, and persistent data using a text file. The format should support backup, transfer, restoration, and deliberate progress/unlock adjustment without a server.

Decision / solution:
Use one validated serializable profile model for both browser-local persistence and a portable encoded text representation. Plan a versioned UTF-8 envelope containing canonical JSON encoded with Base64URL plus an integrity checksum. Support `.txt` download/upload and equivalent copy/paste. Import decodes, migrates, validates, previews, backs up the current profile, and only then atomically replaces it after confirmation. The encoding is explicitly not encryption or anti-cheat.

Why:
One model prevents local and exported saves from diverging. Schema/envelope versions support migrations, stable IDs survive content renames and theme pivots, and validation/backup protects current progress from malformed or incompatible imports.

Future guardrail:
V0.1 keeps profile data serializable and separate from runtime objects. Save fixtures cover round trips and every supported migration. Failed/cancelled imports never mutate the current profile. Exact format, checksum, limits, and migration discoveries are recorded in [`build/SAVE_DATA.md`](build/SAVE_DATA.md) and this log.

Revisit when:
V0.3 persistence implementation begins, active-run suspension enters scope, cloud sync is considered, or imported saves participate in competitive/online systems requiring trust rules.

### REC-007 — Browser telemetry is test-mode-only and resize is viewport-anchored

- Status: Accepted
- Date: 2026-08-12
- Affects: Phase 1, browser testing, rendering, future scene telemetry
- Blocks: None

Context / observation:
The first Chromium smoke test booted one canvas successfully but caught that a percentage-sized child inside the centred CSS grid retained its original 1280×720 intrinsic size after the viewport changed. Phase 1 also requires browser state assertions without shipping a writable test hook in production.

Decision / solution:
Anchor `#game-container` to the viewport with fixed insets so Phaser's RESIZE scale mode receives the actual viewport dimensions. Install the read-only `window.__ARENA_TEST__` facade only when Vite runs in `test` mode; scenes publish through an inert bridge in other modes, and production output contains no test global or alternate fixture.

Why:
Viewport anchoring keeps the canvas independent of its own intrinsic dimensions. A mode-gated facade gives Playwright deterministic state without pixel guesses while keeping the production surface free of test controls.

Future guardrail:
The boot smoke test asserts one canvas, clean console output, theme/scene telemetry, and a 900×600 resize. Production verification checks that `dist` does not contain `__ARENA_TEST__` or `alternate_test`.

Revisit when:
The game introduces camera zoom, parent-embedded layouts, production diagnostics, or telemetry beyond read-only snapshots.

### REC-008 — Audit toolchain pins and refresh Playwright browsers together

- Status: Resolved
- Date: 2026-08-12
- Affects: Phase 1, dependency maintenance, CI, browser tests
- Blocks: None

Context / observation:
The first exact development-tool pins installed successfully but `npm audit` reported seven advisories, including a critical Vitest advisory and high-severity Vite and Playwright advisories. Advancing Playwright then made the previously downloaded Chromium build obsolete; the smoke test failed clearly because its new expected browser executable was absent.

Decision / solution:
Pin the patched releases recommended by the advisory data: Vite `6.4.3`, Vitest `3.2.7`, Playwright `1.62.1`, and ESLint packages `9.39.5`. Refresh `package-lock.json` and run `npx playwright install chromium` after changing Playwright. The resulting full install audit reported zero known vulnerabilities, and all Phase 1 gates passed again.

Why:
Exact pins preserve reproducible installs, while auditing before phase completion avoids establishing a vulnerable baseline. Playwright browser binaries are versioned external test assets, so a package upgrade and browser download must be treated as one maintenance operation even though only the package and lockfile belong in Git.

Future guardrail:
After dependency changes, run `npm audit`, the phase verification suite, and—whenever Playwright changes—`npx playwright install chromium` before the browser tests. CI continues to install its matching browser on every clean runner.

Revisit when:
A dependency advisory requires a major-version upgrade, Node support changes, or browser downloads become centrally cached in CI.

### REC-009 — Theme contracts grow with scheduled gameplay phases

- Status: Accepted
- Date: 2026-08-12
- Affects: Phases 1–6, content manifests, theme validation
- Blocks: None

Context / observation:
The intended repository shape lists contracts and category files for the complete game, but Phase 1 explicitly asks for only the V0.1 hooks needed initially. Creating tuning or effect descriptors before their owning systems exist would settle open balance and taxonomy questions without executable tests.

Decision / solution:
Phase 1 defines all stable V0.1 content IDs and centralized copy so names cannot leak into systems. It implements and validates only the starter-character behavioural definition needed by the boot scene. Add weapon/enemy definitions in Phase 3, upgrades in Phase 4, and shrine definitions in Phase 6 alongside their rules and deterministic tests.

Why:
This proves the active-theme boundary now while keeping tuning, reusable effects, and validation rules close to the phase that can exercise them. Missing future category directories are intentional, not unfinished Phase 1 work.

Future guardrail:
Each content-bearing phase extends the generic contracts, concrete manifest, alternate fixture, and validation tests together. Systems continue to import only the active-theme facade and branch only on stable capabilities/IDs.

Revisit when:
A scheduled phase cannot express its mechanic without a broader shared effect contract, or a second production theme is introduced.

### REC-010 — Phaser is the current production bundle baseline

- Status: Provisional
- Date: 2026-08-12
- Affects: Build output, loading performance, future deployment
- Blocks: None

Context / observation:
The final Phase 1 production build succeeds but Vite warns that the main minified JavaScript chunk is larger than 500 kB. The measured output is approximately 1,488 kB minified and 341 kB gzip; Phaser is the dominant dependency. Local Chromium boot and resize tests pass.

Phase 2 measurement: the main chunk is approximately 1,493 kB minified and 342 kB gzip, an increase of about 4.7 kB minified / 1.0 kB gzip from the Phase 1 baseline.

Phase 3 measurement: the main chunk is approximately 1,502 kB minified and 344 kB gzip, an increase of about 9.7 kB minified / 2.3 kB gzip from the Phase 2 baseline.

Phase 7 measurement: the completed V0.2 main chunk is approximately 1,566 kB minified and 360 kB gzip. The production output contains none of the test telemetry global, alternate-theme ID, or Phase 7 scenario query keys.

Decision / solution:
Accept this as the Phase 1 baseline and do not add speculative chunk splitting before gameplay exists. Track compressed size and real startup behavior as features are added, and separate optional/heavy systems only when measurement shows a useful boundary.

Why:
The warning is a performance signal rather than a correctness failure. Phaser is needed at initial game boot, so arbitrary splitting may add complexity without reducing time to first playable frame.

Future guardrail:
Keep production build-size output visible in phase verification. Avoid adding large asset blobs or unrelated libraries to the entry chunk without recording their cost.

Revisit when:
Compressed entry size grows materially beyond this baseline, deployment performance is measured on representative connections, or optional screens/assets provide a natural lazy-load boundary.

### REC-011 — Arcade Physics and a 2400×1600 arena are the initial runtime baseline

- Status: Provisional
- Date: 2026-08-12
- Affects: Phase 2, player entity, camera, Phase 3 collision/performance
- Blocks: None

Context / observation:
Phase 2 needs a physical player body, hard world boundaries, and a following camera, while Phase 3 will add many moving enemies and projectiles. The product plan does not settle a physics implementation or initial arena dimensions.

Manual acceptance on 2026-08-12 confirmed movement, boundaries, camera behavior, pause/resume, and localhost operation match the Phase 2 intent.

Decision / solution:
Use Phaser Arcade Physics with zero gravity, a 2400×1600 world, a 36-unit starter body, `collideWorldBounds`, and a bounded follow camera using 0.12 lerp. Keep input-vector normalization and clamp rules framework-independent. The generic `PlayerActor` receives its radius, movement speed, presentation token, and other base stats from the active theme definition.

Why:
Arcade Physics supplies inexpensive axis-aligned bodies and world bounds suited to a top-down swarm without introducing a general rigid-body solver. The arena is large enough for camera travel at the 200-unit base speed while keeping boundary smoke tests practical.

Future guardrail:
Unit tests cover cardinal/diagonal/opposing input and all-edge clamping. Chromium tests verify configured velocity, camera displacement, and the actual physics body stopping at the right edge. No system may read themed names to move or render the actor.

Revisit when:
Phase 3 measures enemy/projectile collision throughput, the arena feels cramped or empty during tuning, or body rotation/shape becomes mechanically meaningful.

### REC-012 — Run time is transient state; profile identity is separately versioned

- Status: Accepted
- Date: 2026-08-12
- Affects: Phase 2, run lifecycle, future persistence, save migrations
- Blocks: None

Context / observation:
The game needs resettable five-minute runs now and complete portable persistence later. Combining elapsed time, current health, and Phaser objects with unlock/profile data would make restart and future migrations unsafe.

Decision / solution:
Represent the active run as a plain versioned object containing stable theme/character IDs, status, elapsed/duration milliseconds, current health, and a cloned stat baseline. Pure functions create, advance, transition, and reset it. Represent the initial profile separately with its own schema version, content schema version, selected stable character ID, and unlocked stable IDs. No storage adapter is added in V0.1.

Why:
The scene can be discarded without losing the definition of persistent progress, and the future save codec receives data rather than runtime objects. Explicit elapsed time makes pause/completion deterministic and avoids wall-clock advancement while gameplay is stopped.

Future guardrail:
Run/profile unit tests require JSON round trips, clean reset, terminal-state immutability, paused-time freezing, and no elapsed run fields in the profile. Gameplay systems communicate profile-worthy results explicitly rather than retaining scene references.

Revisit when:
Phase 3 adds death/health mutation, Phase 5 adds restart and statistics, or suspended runs/persistence enter scope.

### REC-013 — Manifest validation must defend against malformed runtime data

- Status: Resolved
- Date: 2026-08-12
- Affects: Phase 2, theme validation, future imported/external content
- Blocks: None

Context / observation:
After character base stats became required, the malformed-manifest regression fixture omitted `baseStats`. The validator indexed the missing object and threw a `TypeError` instead of returning actionable validation issues. TypeScript contracts do not protect JSON, imported data, or deliberately malformed tests at runtime.

Decision / solution:
Check for the required stats object before validating individual finite/range constraints. Report `<character-id> baseStats are required` and continue validating the rest of the manifest rather than crashing.

Why:
A validator is an untrusted-input boundary. It must explain invalid shape even when callers bypass compile-time types, especially before themes or saves can be loaded from serialized data.

Future guardrail:
Every new manifest category includes malformed runtime fixtures for missing containers, values, duplicate IDs, and broken references; validation functions return issue lists and do not throw incidental property-access errors.

Revisit when:
Manifest validation moves to a shared schema library or external theme loading is introduced.

### REC-014 — Real-time browser traversals need CI headroom

- Status: Resolved
- Date: 2026-08-12
- Affects: Phase 2 browser tests, CI reliability, future real-time smoke tests
- Blocks: None

Context / observation:
The Phase 2 boundary test held Right from the 2400×1600 arena centre and allowed eight seconds to travel approximately 1,182 units at 200 units/second. Its ideal traversal was about 5.9 seconds and the local passing run already took 7.8 seconds. On the two-worker GitHub Actions runner, all three attempts exceeded the eight-second poll timeout even though movement, camera, pause, and local boundary behavior passed.

Decision / solution:
Keep the real Arcade Physics integration assertion, but traverse from the centre to the nearer top edge (approximately 782 units, 3.9 seconds ideally). Give the state-based poll 15 seconds inside a 25-second test budget, then assert the final centre remains at or below the body-radius boundary. The framework-independent unit suite continues to cover clamping at every edge.

Why:
The failure measured runner scheduling/performance rather than an eight-second gameplay requirement. Testing the nearer edge reduces wall time, and explicit headroom prevents shared-runner load from becoming a false gameplay regression without introducing a writable test hook or weakening the actual world-boundary check.

Future guardrail:
Derive real-time test budgets from the configured distance and speed, then leave substantial CI headroom. Prefer state-based polling and the shortest representative integration path; cover exhaustive geometry and edge cases in deterministic unit tests.

Revisit when:
Movement speed, spawn position, arena dimensions, Playwright worker count, or the browser timing model changes.

### REC-015 — Phase 3 uses capped destruction and provisional swarm tuning

- Status: Provisional
- Date: 2026-08-12
- Affects: Phase 3 combat/spawning, Phase 4 XP pacing, Phase 6 surge performance
- Blocks: None

Context / observation:
The product examples define the basic enemy and starter weapon stats but do not settle spawn cadence, spawn distance, player-wide contact immunity, or initial entity budgets. Phase 3 needs enough pressure to demonstrate targeting, kills, damage, and death without allowing unbounded high-churn objects.

Decision / solution:
Use the product baselines: enemy health 20, speed 70, damage 10, XP value 1; weapon damage 10, cooldown 1000 ms, speed 400, one projectile, base pierce 0; player crit 5% at 2×. Spawn one enemy every 400 ms on a deterministic golden-angle ring 360 units from the current player position. Cap live enemies at 80 and live projectiles at 64. Destroy defeated enemies and expired/spent projectiles, removing them from tracked sets. Apply a global 1000 ms player contact-immunity window using run simulation time.

Why:
The cadence reliably demonstrates both player kills and eventual death in a short smoke test, while fixed caps prevent leaks and give the Phase 6 surge work an explicit back-pressure boundary. A global immunity window avoids damage scaling directly with overlap callback count or frame rate.

Future guardrail:
Deterministic tests cover cap exclusivity and contact cooldown; Chromium telemetry exposes live counts, caps, shots, kills, contact hits, health, and immunity. Spawning must ask the cap rule before allocation, and destroy handlers must remove actors from tracked sets exactly once.

Revisit when:
Phase 4 tunes XP/level pacing, Phase 6 schedules 100 shrine enemies through back-pressure, or representative-browser profiling establishes a safe higher budget.

### REC-016 — Projectile damage and pierce are immutable per shot

- Status: Accepted
- Date: 2026-08-12
- Affects: Phase 3 combat, Phase 4 stat upgrades, future overcrit and on-hit effects
- Blocks: None

Context / observation:
Frame-based overlap callbacks can report the same projectile/enemy pair more than once. Crit chance must remain representable above 100% for future overcrit, but V0.1 has only normal versus critical damage and no tier conversion.

Decision / solution:
Roll each projectile's damage once at fire time using injected randomness in the rule function. V0.1 clamps only the roll probability to `[0, 1]`; it does not clamp the stored crit stat. A projectile owns an immutable damage/critical result plus a set of stable runtime target IDs and a remaining hit budget equal to `1 + pierce`. Duplicate target overlap consumes nothing and deals no damage. Enemy damage is idempotent after defeat, and only the first lethal result increments kills.

Why:
One roll per projectile makes multi-hit pierce consistent, target-ID tracking prevents physics callback duplication, and uncapped stat representation avoids a Phase 4/overcrit migration. Exact-once lethal accounting keeps statistics and later XP drops trustworthy.

Future guardrail:
Unit tests cover deterministic normal/crit rolls, crit chance above 100%, duplicate hits, pierce exhaustion, lethal damage, and already-dead targets. Runtime actors never compare player-facing names.

Revisit when:
Overcrit tiers, per-target rerolls, chain effects, or projectile-owned on-hit modifiers enter scope.

### REC-017 — Projectile launch follows physics-group enrollment

- Status: Resolved
- Date: 2026-08-12
- Affects: Phase 3 projectile runtime, browser telemetry, terminal cleanup
- Blocks: None

Context / observation:
Manual Phase 3 testing reported that the starter projectile appeared inside the player but seemed stuck rather than visibly targeting and firing. The actor assigned velocity before it was enrolled in its Arcade Physics group, leaving launch behavior dependent on whether group setup preserved the existing body velocity. Death then paused the physics world with the most recently created projectile still visible, making a center-spawned pellet look permanently stuck because Phase 5 has not added a death overlay yet. The original browser test proved eventual kills but did not prove that a particular projectile changed position.

Decision / solution:
Construct and enroll the projectile in the physics group first, then explicitly launch it at the computed target angle and configured speed. Give each projectile a stable runtime ID in test telemetry. On death, destroy all active projectiles before pausing physics. Strengthen the browser combat test to require the same projectile ID to report speed 400 and move more than 20 world units; strengthen the death test to require zero remaining projectiles and no sample.

Why:
Physics container setup should finish before motion is applied. Direct displacement coverage verifies the observed behavior rather than inferring firing from a later kill, and terminal cleanup prevents a correct frozen simulation from presenting a misleading projectile artifact.

Future guardrail:
Any pooled or group-managed moving actor must be activated/enrolled before its final velocity is assigned. Browser telemetry for motion-sensitive actors should include identity, position, and velocity, and tests should assert displacement when movement itself is the acceptance criterion.

Revisit when:
Projectile pooling, pause-resume projectile persistence, trails, or Phase 5 terminal presentation changes actor cleanup policy.

### REC-018 — CI serializes real-time Phaser browser simulations

- Status: Superseded by REC-021
- Date: 2026-08-12
- Affects: Browser tests, GitHub Actions, Phases 2–6
- Blocks: None

Context / observation:
After Phase 3 added long-running live combat and death paths, GitHub Actions ran seven tests with two Chromium workers. Three unrelated real-time paths slowed together: the kill test missed a 12-second poll once and passed on retry, the boundary test missed a 15-second poll twice and passed on retry, and the contact/death test never reached its first hit inside 18 seconds across all retries. Short movement tests also grew from sub-second local times to 3–4 seconds. The suite passed locally with two workers, showing the shared runner was CPU-starved by concurrent Phaser simulations rather than exposing a single rule defect.

Decision / solution:
Set Playwright `workers` to one only when `CI` is present; local runs retain automatic parallelism. Give the long state-based paths ceilings derived from their behavior plus shared-runner margin: 30 seconds for boundary arrival, 25 seconds for a kill, and 35 seconds each for first contact and subsequent death. Retain retries as diagnostic protection, not as the expected success path.

Why:
Each test controls an independent browser page whose Phaser loop, physics world, rendering, telemetry polling, and tracing compete for the same small hosted runner. Serial execution gives simulation time predictable CPU progress and is faster than repeated parallel failures. The higher ceilings are maximum waits; state polling still returns as soon as the condition is satisfied.

Future guardrail:
CI browser simulations remain serial until measured shared-runner headroom supports parallelism. Long tests use state polling rather than fixed sleeps and must pass on the first CI attempt. Deterministic unit tests carry exhaustive rule coverage; browser tests remain representative integration paths.

Revisit when:
The CI runner class changes, browser tests gain deterministic time controls, Phase 6 load tests need a separate job, or measured serial runtime becomes excessive.

### REC-019 — Phase 4 progression uses queued choices and additive stable stat targets

- Status: Accepted
- Date: 2026-08-12
- Affects: Phase 4 XP/upgrades, Phase 5 restart/HUD, Phase 6 reward modifiers, future balance
- Blocks: None

Context / observation:
The product plan requires explicit XP progression and eight observable upgrade categories but leaves the initial curve, magnitudes, offer randomness, and representation of weapon-affecting upgrades unsettled. With the Phase 3 combat baseline and the starter 80-unit pickup radius, an initial three-XP threshold was not reliably reached before death in parallel browser smoke runs.

Decision / solution:
Use successive V0.1 thresholds of 2, 4, 6, 8… XP. Retain overflow and queue one mandatory choice for every level crossed by an award. Model themed upgrades with reusable additive descriptors targeting stable player or weapon stat paths. Initial values are +25% damage, +20% attack speed, +10 percentage points crit chance, +1 pierce, +1 projectile, +30 move speed, +25 maximum/current health, and +40 pickup radius. Select three unique offers using an injected random source; the live run uses a fixed seed for repeatability.

Why:
The two-XP first threshold makes the progression loop reliably visible before the provisional swarm can kill an idle player without weakening combat or changing the established base pickup radius. Stable effect targets let systems apply the same mechanics regardless of theme copy, while queued choices ensure a large future reward cannot skip upgrade decisions.

Future guardrail:
Unit tests cover exact-once pickup identities, curve overflow, XP multipliers, seeded unique offers, every modifier target, health adjustment, and clean reset to base stats. Browser tests require a frozen `level_up` state, three distinct stable choice IDs, observable selected effects, safe resume, and continued reachability of death through later choices.

Revisit when:
Phase 6 adds +50% shrine XP, longer-run playtesting produces balance data, randomized run seeding becomes a product requirement, multiplicative modifiers enter scope, or weapon/loadout state needs its own richer runtime model.

### REC-020 — Restart reconstructs scene runtime and respects physics shutdown order

- Status: Accepted
- Date: 2026-08-12
- Affects: Phase 5 restart, future run setup, scene cleanup
- Blocks: None

Context / observation:
Phaser may reuse or reconstruct configured Scene instances depending on the start path, while a run owns actor sets, physics groups, input listeners, seeded randomness, timers, upgrade state, UI, and exact-once identity sets. During the first immediate restart implementation, shutdown cleanup attempted to resume `physics.world` after Phaser had nulled it and raised `Cannot read properties of null (reading 'resume')`.

Decision / solution:
Every `RunScene.create()` begins by resetting every transient runtime field before rebuilding the run. Terminal restart resumes Arcade Physics before synchronously stopping and starting the run scene; shutdown removes listeners and destroys UI but never accesses the already-torn-down physics world. Test-only run-generation telemetry spans scene instances so same-page reconstruction can be distinguished from a static terminal frame.

Why:
Explicit reconstruction makes restart equivalent to a fresh run without relying on Phaser instance reuse details. Respecting plugin shutdown order prevents cleanup from touching invalid framework state.

Future guardrail:
Unit tests require reset to discard modifiers and statistics. Browser coverage completes and restarts multiple consecutive runs, asserts baseline health/XP/level/upgrades/kills, checks no navigation occurred, and fails on page errors.

Revisit when:
Phase 6 adds shrine entities/schedulers, a scene-level run factory replaces field initialization, or suspended-run restoration enters scope.

### REC-021 — Real-time browser concurrency is bounded locally and serial in CI

- Status: Accepted
- Date: 2026-08-12
- Affects: Browser tests, local verification, CI, rendering feedback
- Blocks: None

Context / observation:
REC-018 serialized CI after two simultaneous Phaser simulations starved hosted runners. Phase 5 expanded the local suite to 12 tests and added transient rendering feedback. With Playwright's automatic local worker count, nine simultaneous canvases caused one level-up path to die before collecting enough XP; the other 11 tests passed. The same suite passed all 12 tests in 20.2 seconds with four workers.

Decision / solution:
Keep CI at one worker and cap local Playwright runs at four workers. Projectile trail markers are emitted at most once per projectile per 160 simulation milliseconds and self-destroy after 180 milliseconds.

Why:
Four workers retain useful parallel speed while giving live simulations enough CPU progress. Bounding trail churn keeps cosmetic feedback from becoming unbounded load as projectile count rises.

Future guardrail:
The full browser suite must pass without retries at the configured worker count. Exhaustive rules stay in unit tests; live smoke paths remain representative rather than multiplying long simulations.

Revisit when:
Runner hardware changes, browser tests gain deterministic time control, Phase 6 surge profiling establishes new limits, or the suite is split into isolated jobs.

### REC-022 — Camera-fixed container input uses explicit screen-space bounds

- Status: Accepted
- Date: 2026-08-12
- Affects: Level-up UI, terminal overlays, future fixed-camera controls
- Blocks: None

Context / observation:
Level-up and terminal container children rendered correctly after the camera followed the player, but their child object pointer hit tests did not align with visible screen positions. Setting scroll factor only on the container did not propagate it to children, and nested interactive rectangles remained unreliable in automated and manual smoke tests.

Decision / solution:
Propagate zero scroll factor to camera-fixed container children and handle choice/restart pointer actions through scene-level pointer events checked against explicit screen-space button rectangles. Remove those listeners whenever the overlay hides or the scene shuts down.

Why:
Screen-space bounds match what the player sees regardless of camera scroll and resize. Explicit listener cleanup prevents stale overlays from receiving later input.

Future guardrail:
Browser tests select a level-up card and restart through visible canvas coordinates after the camera has moved. Manual smoke confirms both controls and resize behavior.

Revisit when:
UI moves to DOM/accessibility overlays, cameras are split, gamepad focus navigation is added, or a shared screen-space button component replaces these overlays.

### REC-023 — Shrine surges retain due work under the shared enemy cap

- Status: Accepted
- Date: 2026-08-12
- Affects: Phase 6 shrine scheduling, XP attribution, entity load, restart
- Blocks: None

Context / observation:
The Horde shrine must schedule exactly 100 enemies over 20 seconds while the ambient swarm continues, but the established V0.1 arena destroys high-churn actors at an 80-live-enemy cap. A repeating wall-clock timer could lose spawns while full, outlive a restarted run, or diverge when level-up and pause freeze simulation.

Decision / solution:
Derive cumulative due slots from elapsed simulation time, retain due-but-unspawned work as back-pressure, and give shrine work first access to available capacity before ambient spawning each frame. Tag each shrine enemy with stable source `shrine.spawn_surge` and reward multiplier `1.5`; propagate that source into its XP pickup. Preserve fractional XP rather than rounding the bonus away. Reconstruct all scheduler and attribution state on restart.

Why:
Simulation-time derivation naturally respects pause and level-up freezes, exact cumulative scheduling avoids timer drift, and retained backlog guarantees all 100 slots without exceeding the measured V0.1 cap. Explicit data provenance keeps reward logic generic and makes shrine-only XP observable through collection.

Future guardrail:
Unit tests require zero immediate spawn, the 100th due slot at exactly 20 seconds, backlog retention, and no second activation. Browser tests require one feedback event after repeated inputs, 100 scheduled slots, tagged +50% XP collection, cap compliance, and clean restart during a live surge.

Revisit when:
Multiple simultaneous shrines, distinct enemy compositions, pooling, save/resume of active runs, multiplier stacking, or a higher measured live-entity budget enters scope.

### REC-024 — Milestone plans are versioned and V0.2 follows product scope

- Status: Accepted
- Date: 2026-08-12
- Affects: planning workflow, V0.2 scope, future milestone transitions
- Blocks: None

Context / observation:
V0.1 completed all six phases, but the generic `BUILD_PLAN.md` filename still looked current and repository instructions pointed every future session to it. The V0.1 deferred list deliberately grouped work from several later milestones, while `PLAN.md` defines a narrower authoritative V0.2 scope.

Decision / solution:
Preserve the completed milestone as `build/BUILD_PLAN_V0.1.md`, make `build/BUILD_PLAN_V0.2.md` the current implementation source, and update repository/README references. Derive V0.2 from the product plan's V0.2 section: expanded enemies; overcrit, piercing, and on-kill interactions; Chaos, multipliers, shrines, and baseline elites; scalable feedback; and the named statistics. Use V0.1's deferred list only as candidate context. Keep persistence/export, additional weapons, bosses, general curses, elite modifiers, endless mode, and other V0.3 work out.

Why:
Versioned plans retain the evidence and commit history of a completed milestone without making stale instructions appear active. Product scope prevents the broad deferred list from silently expanding V0.2, while seven dependency-ordered phases put provenance and load safety before recursive interaction mechanics.

Future guardrail:
`AGENTS.md`, README, and reconciliation point to one explicitly current versioned plan. Each milestone plan states its source scope, acceptance points, phase commits, and explicit exclusions; completed plans become immutable implementation records except for corrected links or factual errata.

Revisit when:
V0.2 scope is intentionally changed in `PLAN.md`, V0.2 completes, or V0.3 planning begins.

### REC-025 — Browser assertions separate deterministic outcomes from incidental collection timing

- Status: Accepted
- Date: 2026-08-12
- Affects: V0.1 Phase 5/6 browser tests, CI timing, future load tests
- Blocks: None

Context / observation:
The complete V0.1 suite passed locally with four workers, but the serial hosted runner failed the Phase 6 shrine path on all three attempts. Tagged enemies were defeated and each produced the correct `1.5` XP reward, while `shrineXpCollected` remained zero because those pickups fell outside the idle player's magnet radius. The same CPU-constrained run also took more than the default five-second poll to advance 700–900 simulation milliseconds, and one retry completed a newly restarted 700 ms run before the test inspected its transient `playing` state.

Decision / solution:
Assert shrine reward integration at the deterministic boundary: every defeated shrine enemy creates exactly `1.5` tagged XP and any collected shrine total remains a multiple of `1.5`; the existing XP unit test continues to prove exact fractional collection/award. Do not require an idle player to incidentally collect a spatial pickup. Give terminal polls explicit hosted-runner headroom. Immediately pause each short restarted run before inspecting reset state, then resume it for the next completion cycle.

Why:
Pickup collection depends on enemy death position, magnet radius, player movement, and CPU progress; it is not evidence for whether the tagged reward was calculated or propagated correctly. Pausing makes the reset snapshot stable, while simulation-state polling still verifies real completion rather than replacing it with a writable test shortcut.

Future guardrail:
Browser tests assert live integration at controllable deterministic boundaries and unit tests exhaustively cover pure reward claims. Tests that inspect a transient state after restart must stabilize it, and any deliberately shortened simulation deadline must specify CI headroom rather than inherit Playwright's five-second default.

Revisit when:
Browser tests gain deterministic player/pickup positioning, a simulation-step control, or V0.2's load harness replaces real-time waits with an explicit read-only scenario driver.

### REC-026 — Causal queues retain serializable work and own exact-once claims

- Status: Accepted
- Date: 2026-08-13
- Affects: V0.2 Phases 1–7, combat interactions, spawning, restart
- Blocks: None

Context / observation:
Later V0.2 mechanics need to compose deaths, spawns, rewards, and feedback without recursive physics callbacks or callback-bearing state. Duplicate overlap callbacks and capped spawning make exact-once ownership and retained back-pressure necessary before Broodmother and chain mechanics enter.

Decision / solution:
Use an iterative FIFO queue whose events are structured-cloned serializable data with stable event/entity IDs and explicit source, parent, and effect provenance. The queue rejects duplicate event IDs and owns per-entity lethal and per-entity/effect claims. A caller chooses a per-tick budget; unprocessed work remains queued. Restart reconstructs the queue.

Why:
Data-only events keep Phaser and callback objects out of simulation state, while central claims make duplicate deaths/effects testable independently of collision timing. Retained work allows later phases to apply measured budgets without silently losing gameplay.

Future guardrail:
Queue unit tests cover order, budgeting, duplicate IDs, exact-once claims, and a lossless 300-event run. Effects enqueue follow-up data rather than invoking collision handlers recursively.

Phase 2 integration evidence: the first full browser regression found that two consumers shared one FIFO; the offspring consumer drained Phase 1 load requests that it did not understand. The run scene now activates only the consumer matching the configured test scenario. Future general gameplay routing must use a single kind-aware dispatcher rather than multiple consumers that dequeue before checking ownership.

Revisit when:
Profiling shows FIFO shifting is material under representative compound interactions, persistence requires suspended queued work, or priority classes become necessary.

### REC-027 — Modifier resolution is additive then multiplicative across stable layers

- Status: Accepted
- Date: 2026-08-13
- Affects: V0.2 Phases 1, 3, 5–7; player, weapon, enemy, world, reward modifiers
- Blocks: None

Context / observation:
V0.2 will combine modifiers from several owners. Applying them ad hoc in scenes would make ordering dependent on call sites and risk rounding or double application.

Decision / solution:
Resolve `(base + sum(additive)) × product(multiplicative)` centrally. Order inputs deterministically by the stable player, weapon, enemy, world, and reward layers, then by source ID. Preserve fractional results; formatting and presentation may round only downstream.

Why:
This matches the existing additive upgrade model while giving Chaos, shrines, enemies, and rewards one deterministic multiplicative seam.

Future guardrail:
Modifier tests cover mixed input order, layer ordering, fractional products, and input immutability. Systems submit typed inputs rather than performing their own stacking.

Revisit when:
A named mechanic explicitly requires a different stage, caps/soft caps enter scope, or balance evidence requires multiplicative groups rather than one product.

### REC-028 — Load instrumentation is read-only and test-build initiated

- Status: Superseded by REC-040
- Date: 2026-08-13
- Affects: V0.2 Phases 1, 2, 4, 6, 7; performance testing, production surface
- Blocks: None

Context / observation:
The browser needs a reproducible spawn scenario without adding a writable production console hook. The established live enemy cap is 80, while the milestone's 300-work representative load also needs a fast deterministic headless proof.

Decision / solution:
Keep the production test global absent. In test mode only, a positive `loadHarness` query value (bounded to 300) preloads causal spawn requests; browser coverage uses 80 to prove live cap/back-pressure telemetry. A pure headless harness separately processes 300 events. Telemetry exposes backlog, processed work, dropped presentation cues, and live/tracked high-water marks as frozen snapshots.

Why:
The query is fixed before boot and cannot mutate a running simulation. Splitting live-cap and headless checks provides deterministic loss detection now without prematurely raising the V0.1 cap before representative profiling.

Future guardrail:
Production output contains no `__ARENA_TEST__` facade or alternate fixture. The browser load test asserts 80 exact scripted spawns and clean console output; the unit harness asserts 300 unique processed events.

Revisit when:
Phase 7 measures a safe higher live cap, a deterministic browser stepper replaces real-time execution, or the representative scenario needs mixed content and interactions.

### REC-029 — Expanded roster cadence and Broodmother offspring are provisional theme data

- Status: Provisional
- Date: 2026-08-13
- Affects: V0.2 Phase 2, enemy spawning, progression balance, swarm load
- Blocks: None

Context / observation:
The product plan specifies exact Runner and Tank stats and five Broodmother offspring, but it does not specify roster cadence/weights, Broodmother stats, offspring role/reward, or final fantasy geometry. Phase 2 needs all roles to become observable during a normal five-minute run without replacing the established ambient cadence.

Decision / solution:
Retain the 400 ms ambient cadence and select deterministically from unlocked theme definitions using injected seeded randomness. Unlock Grunt/Runner/Tank/Broodmother at 0/8/16/24 seconds with weights 56/24/14/6. Use the product Runner baseline (10 health, 140 speed, 8 damage, 1 XP) and Tank baseline (80 health, 45 speed, 20 damage, 4 XP). Provisionally give Broodmother 50 health, 55 speed, 12 damage, 3 XP and five zero-XP Runner offspring. Render the four roles as theme-owned circle, triangle, square, and outlined hexagon tokens through one generic actor.

Why:
Staged unlocks introduce threats legibly, weighted seeded selection keeps tests deterministic, and zero-XP offspring prevent one natural split from becoming an automatic reward multiplier before world/reward balance exists. Circular physics bodies remain inexpensive while generated geometry makes roles visually distinguishable pending assets.

Future guardrail:
Content tests lock product baselines and validate weights, unlocks, geometry, and death-spawn references. Spawn tests cover boundary rolls. Browser tests observe all four roles and exactly five eventually spawned children under the shared live cap.

Revisit when:
Combined Phase 1–2 playtesting provides cadence/readability feedback, Phase 4 adds Fracture, Phase 5 formalizes reward multipliers, or Phase 7 measures a higher live cap.

### REC-030 — Natural offspring use retained spawn events and do not inherit parent rewards

- Status: Accepted
- Date: 2026-08-13
- Affects: V0.2 Phases 2, 4, 5, 7; death spawning, rewards, statistics
- Blocks: None

Context / observation:
Broodmother death can occur at the live-enemy cap and physics may report duplicate lethal overlaps. Creating children directly in the collision callback would either drop them at capacity or risk duplicate offspring. Shrine-tagged Broodmothers also make reward inheritance ambiguous.

Decision / solution:
The first lethal claim commits a death event and the first `enemy.death_spawn` claim enqueues exactly five child spawn requests with parent event/entity IDs. Due children remain queued until capacity exists. The child definition carries an explicit configured reward multiplier and uses the Broodmother role as its spawn source; it does not inherit the parent's shrine reward multiplier.

Why:
This makes natural offspring count independent of callback duplication and current capacity. Explicit child reward provenance prevents a source bonus intended for one parent from multiplying a new generation implicitly.

Future guardrail:
Unit tests prove one lethal/effect claim and five retained requests. Chromium telemetry separately records queued and spawned offspring, role high-water counts, and cap compliance. Restart/terminal reconstruction clears the queue.

Revisit when:
Phase 4 defines Fracture inheritance, Phase 5 defines duplication/source stacking, or a design choice explicitly grants descendant rewards.

### REC-031 — Overcrit tiers double damage and Momentum scales from immutable shot damage

- Status: Provisional
- Date: 2026-08-14
- Affects: V0.2 Phase 3, crit, projectiles, statistics, feedback
- Blocks: None

Context / observation:
The product examples show 10/20/40/80/160 damage but leave exact higher-tier and custom crit-damage interaction open. Fractional decimal chances also produce binary floating-point residue at documented boundaries such as 247%.

Decision / solution:
Treat crit chance as an uncapped ratio where `2.47` means 247%. Resolve `floor(chance)` guaranteed tiers plus one roll against the fractional remainder, normalized to twelve decimal places. Each tier applies the configured crit-damage multiplier again; the current 2× base therefore yields the product's unbounded doubling sequence. Return tier, multiplier, modified base damage, bonus damage, and total damage explicitly. Piercing Momentum is a selectable stable-ID skill and adds 10% of a projectile's immutable rolled shot damage per prior unique target; duplicate overlaps do not advance it.

Why:
Repeated configured crit multiplication preserves the existing crit-damage stat while matching every product example. Shot-local immutable base damage keeps one projectile internally consistent, and unique target identity prevents physics overlap frequency from increasing Momentum.

Future guardrail:
Crit tests cover exact 0/100/200/300% boundaries, 247% high/low rolls, and uncapped multipliers. Piercing tests cover duplicate target rejection and monotonic projectile-local damage. Browser telemetry records highest tier, active skill IDs, longest pierce chain, and live next-hit damage.

Revisit when:
Balance testing changes overcrit multipliers, crit-damage upgrades enter scope, or presentation needs named tiers beyond numeric tier identity.

### REC-032 — Reusable mechanics are skills enabled by upgrade offers

- Status: Accepted
- Date: 2026-08-14
- Affects: V0.2 Phases 3–5, content taxonomy, run state, upgrade system
- Blocks: None

Context / observation:
The first non-stat mechanics need both a theme-owned reusable definition and a way to enter the existing three-choice level-up flow. Treating skill and upgrade IDs as interchangeable would make presentation, acquisition, and future unlock pools ambiguous.

Decision / solution:
A skill ID owns the reusable mechanic definition. A distinct upgrade ID owns the level-up offer and uses a generic `skill.enable` effect to add that skill ID to serializable per-run active skills. Re-selecting an offer records the choice but active skill identity remains set-like.

Why:
This keeps acquisition separate from mechanics while reusing the established upgrade UI and stable content boundary. Future shrines or unlocks can enable the same skill without pretending they are level-up offers.

Future guardrail:
Theme validation requires all skill and upgrade roles, validates skill references, and alternate-theme fixtures carry both categories. Upgrade tests cover stat effects and enabled skill identity separately.

Revisit when:
Skills gain ranks, mutually exclusive variants, weapon ownership, or acquisition outside the run upgrade pool.

### REC-033 — On-kill mechanics use a kind-aware dispatcher with retained capacity work

- Status: Accepted
- Date: 2026-08-14
- Affects: V0.2 Phase 4, causal events, explosions, Fracture, spawning, restart
- Blocks: None

Context / observation:
Phase 4 is the first point where death, explosion, and spawn work coexist. The Phase 2 scenario-specific consumer guard cannot safely scale to mixed event kinds, and a spawn at the live cap must not be removed merely so later work can run.

Decision / solution:
Use one budgeted, kind-aware gameplay dispatcher for committed deaths, explosion effects, and spawn requests. Keep the scripted load harness on its own queue. A queue consumer may explicitly defer its head event; deferred work is restored without incrementing processed metrics. Spawn requests at capacity therefore retain FIFO back-pressure. Terminal state and restart clear both queues and all exact-once claims.

Why:
One dispatcher prevents a consumer from claiming unknown work. Strict FIFO keeps causal order explainable, and explicit deferral proves the difference between processed and merely inspected work.

Future guardrail:
Queue tests assert deferral retains the head and does not increment processed totals. The compound browser path waits for zero live enemies and zero gameplay backlog, then proves every queued Fracture child eventually spawned. New event kinds must be routed in the dispatcher before they can be enqueued live.

Revisit when:
Profiling requires priority lanes, strict FIFO causes unacceptable head-of-line blocking, or suspended-run persistence serializes active queues.

### REC-034 — Phase 4 interaction tuning and inheritance are explicit theme data

- Status: Provisional
- Date: 2026-08-14
- Affects: V0.2 Phase 4, skills, balance, rewards, feedback
- Blocks: None

Context / observation:
The product specifies Fracture at 15% and Bloodlust at +1% per ten kills in the previous five seconds, but does not specify explosion tuning, fracture child rewards, or chain inheritance details.

Decision / solution:
Use a 96-unit, 15-damage on-kill explosion. Direct kills explode when Detonation is active; explosion kills only explode when Chain Reaction is also active. Every enemy claims the explosion effect at most once, so chains remain iterative and finite over committed deaths. Fracture rolls 15% once per death using seeded randomness and schedules two zero-XP Runner children at the death position; it does not inherit the parent's reward multiplier. Bloodlust retains committed kill timestamps strictly within the previous 5,000 simulation milliseconds and adds 0.01 attack-speed bonus per complete ten kills. Presentation uses a theme-owned explosion colour and is capped at 24 simultaneous cues; omitted cues increment telemetry without affecting simulation.

Why:
The explosion values are strong enough to compose in dense swarms without replacing direct damage. Zero-XP splits avoid reward multiplication before Phase 5 formalizes world rewards. Simulation-time windows naturally freeze during pause and level-up.

Future guardrail:
The interaction matrix covers direct, explosion, chained, enabled, and disabled combinations. Spatial, chance, rolling-window, damage-source, cue-drop, queue, terminal, and restart telemetry remain separate. Damage is attributed as direct, explosion, or chained explosion at commit time.

Revisit when:
Combined manual testing provides balance feedback, Phase 5 defines reward stacking, Phase 6 tunes presentation limits, or Phase 7 reconciles the final damage ledger.

### REC-035 — Chaos and shrine products resolve from one serializable world model

- Status: Provisional
- Date: 2026-08-14
- Affects: V0.2 Phases 5–7, Chaos, spawning, enemies, XP, elites, shrine rewards
- Blocks: None

Context / observation:
The product names systems affected by Chaos but gives only example Chaos progression, not exact curves or how permanent shrine products compose with it. V0.1 Horde rewards already carry a source multiplier that must remain distinguishable.

Decision / solution:
Store per-run Chaos, permanent enemy-spawn and XP products, and shrine activation counts in one serializable world state starting at `1.0`. Resolve all consumers from one selector. For pressure `p = Chaos - 1`, use `1 + 0.25p` spawn pressure, `1 + 0.20p` enemy health, `1 + 0.15p` enemy damage, `1 + 0.25p` XP, `min(0.4, 0.04p)` elite chance, and `1 + 0.20p` shrine rewards. Permanent shrine spawn/XP products multiply after their Chaos curves through the centralized modifier resolver. Source reward applies first, then Chaos shrine reward; world XP applies when the pickup is awarded. Preserve fractional values throughout.

Why:
One model prevents scattered Chaos conditionals and makes every declared output observable. Separating source reward from world XP keeps Horde/Duplication provenance intact while still rewarding dangerous world choices.

Future guardrail:
Unit tests cover the clean baseline, repeated Multiplicity products, fractional output, and JSON round trips. Browser telemetry exposes every selected multiplier and activation count. Restart reconstructs `1.0` world state.

Revisit when:
Combined balance testing evaluates the curves, Phase 7 measures 300-enemy pressure, or rarity/loot systems need additional Chaos outputs.

### REC-036 — Four shrine roles are exact-once actors; Multiplicity has two instances

- Status: Accepted
- Date: 2026-08-14
- Affects: V0.2 Phase 5, shrines, duplication, rewards, content
- Blocks: None

Context / observation:
V0.2 requires Horde, Greed, Multiplicity, and Duplication and explicitly requires multiplicative stacking. One actor per definition cannot demonstrate two activations of the same stackable role in a single run.

Decision / solution:
Instantiate one Horde, one Greed, two Multiplicity, and one Duplication actor from four theme definitions. Each actor activates once. Horde, Greed, each Multiplicity, and Duplication add `0.4`, `0.4`, `0.7`, and `1.0` Chaos respectively. Greed applies `1.5×` spawn and `1.25×` XP; Multiplicity applies `2×` spawn and `1.5×` XP per actor. Duplication snapshots living enemies at activation, queues one copy each through back-pressure, and gives copies its `1.5×` source reward multiplied by the resolved Chaos shrine-reward curve. Copies do not recursively inherit arbitrary parent reward multipliers.

Why:
Multiple generic actors prove stacking without permitting repeat activation or branching on display names. Snapshot-and-queue makes Duplication exact even at capacity.

Future guardrail:
Theme validation requires all four stable shrine IDs and effect values. Browser tests activate all five actors, prove two Multiplicity activations, exact products, exact duplicated copy counts, cap compliance, and clean restart.

Revisit when:
Shrine placement becomes procedural, repeated definitions need save identity, or duplication inheritance changes alongside elites/splits.

### REC-037 — Baseline elites preserve identity across descendant creation

- Status: Provisional
- Date: 2026-08-14
- Affects: V0.2 Phases 6–7, enemies, spawning, rewards, feedback
- Blocks: None

Context / observation:
The product requires one elite capability for every enemy role and preservation through splits, duplication, death, and rewards, but does not provide baseline multipliers or specify whether descendants reroll elite status.

Decision / solution:
Use one theme-owned baseline elite definition with `2×` health, `1.5×` contact damage, `2×` reward, and `1.3×` radius. New ambient enemies roll deterministically against the Chaos-resolved elite chance. Duplication copies, Broodmother offspring, and Fracture children inherit the parent's elite boolean without rerolling; each newly created elite applies the baseline multipliers once. Elite reward multiplies the spawn source reward, while the existing world XP multiplier remains applied when XP is awarded.

Why:
Explicit inheritance makes identity stable across causal work and avoids timing-dependent rerolls. Theme data keeps presentation and tuning outside generic enemy logic, while the boolean passed through spawn requests prevents stat multipliers themselves from compounding across generations.

Future guardrail:
Unit tests lock deterministic chance boundaries and inheritance precedence. Browser tests force all four roles through the generic path, duplicate them, and verify at least two elite instances per role. Telemetry separates spawned, defeated, live, and role counts.

Revisit when:
Elite variants, role-specific elite tuning, descendant mutation, or elite-exclusive drops enter scope.

### REC-038 — Combat feedback is bounded and never authoritative

- Status: Accepted
- Date: 2026-08-14
- Affects: V0.2 Phases 6–7, feedback, audio, accessibility, load behavior
- Blocks: None

Context / observation:
Dense crit, pierce, explosion, shrine, and elite events can create more simultaneous cues and oscillator voices than remain legible. Browser audio also cannot be initialized safely before a user gesture, and reduced motion must not change simulation.

Decision / solution:
Treat audiovisual feedback as a downstream consumer only. Limit transient text cues to 48, oscillator voices to eight, and repeated audio per feedback category to one cue per 45 simulation milliseconds. Keep sound frequency, duration, and gain in theme tokens. Unlock the session audio context on keyboard or pointer interaction, use `M` for session-only mute, suspend emission on focus loss, and replace moving feedback tweens and camera shake/flash with short static cues under reduced motion. Dropped cues increment presentation telemetry without changing damage, deaths, rewards, or statistics.

Why:
Category throttling preserves distinct simultaneous events better than one global audio cooldown. Hard presentation limits make dense chains measurable, while a one-way simulation-to-feedback boundary guarantees muted, reduced, unavailable, or saturated presentation cannot alter results.

Future guardrail:
Limiter tests cover caps and per-category aggregation. Browser tests cover gesture gating, mute, voice/visual high-water bounds, reduced motion, focus, resize, and scene reconstruction cleanup.

Revisit when:
Real audio assets replace oscillators, user settings become persistent, profiling justifies object pools, or accessibility review requires additional controls.

### REC-039 — The run ledger owns exact damage and a five-second kill chain

- Status: Accepted
- Date: 2026-08-14
- Affects: V0.2 Phase 7, statistics, terminal presentation, damage provenance
- Blocks: None

Context / observation:
Phase 7 requires total damage to reconcile exactly with direct base, critical bonus, Piercing Momentum, explosion, chained explosion, and remainder categories. Independently accumulating the total and categories during the first 300-enemy browser run produced a `6.4e-10` floating-point difference despite correct events.

Decision / solution:
Store one serializable run-statistics ledger fed only by committed gameplay results. Allocate overkill-adjusted direct damage in stable order—base, critical bonus, Momentum, then remainder—and assign explosion sources directly. Derive `totalDamage` from the ordered category ledger after every record instead of accumulating it independently. Use one central 5,000 simulation-millisecond window for largest kill chain and retain exact high-water observations for enemies, Chaos, crit chance/tier, and pierce chain. Terminal copy and telemetry format this ledger without becoming authoritative.

Why:
One sum has no second floating-point history to diverge from. Stable overkill allocation documents which contribution receives limited applied health, and committed-event updates prevent rendering, duplicate overlaps, or dropped feedback from changing statistics.

Future guardrail:
Unit tests require exact equality between total and the ordered breakdown, cover overkill/remainder allocation and the exclusive five-second boundary, and verify high-water behavior. The compound browser path compares the terminal ledger with telemetry and requires zero remainder for its known sources.

Revisit when:
Armour, damage-over-time, reflected damage, summons, or another source category enters scope.

### REC-040 — Representative Chromium evidence supports a 300/192 entity budget

- Status: Provisional
- Date: 2026-08-14
- Affects: V0.2 Phase 7, spawning, performance, feedback, CI
- Blocks: None

Context / observation:
The Phase 7 local headless Chromium scenario loaded 300 simultaneous mixed-role enemies with 60 initially scripted elites, activated all shrine roles after capacity was reached, and ran the complete Overcrit + Momentum + Detonation + Fracture + Bloodlust + Chain Reaction build for six simulation seconds. It processed all 300 load requests, reached 300 live enemies, 321 tracked gameplay objects, and a 300-event gameplay backlog without losing due work. Across 315 measured frames it averaged `19.03 ms` with a `24.16 ms` maximum on the development machine. The run committed 1,203 kills, 338 direct explosions, 114 chained explosions, and 336 Fracture requests. Visuals reached but did not exceed the 48-cue limit; 2,389 presentation requests were intentionally dropped while simulation queues and the damage ledger remained complete. Terminal cleanup left zero gameplay/load backlog, projectiles, voices, and active limited visuals; the path then restarted twice.

Decision / solution:
Raise the shared production budgets from 80/64 to 300 live enemies and 192 projectiles. Keep destruction and existing bounded presentation rather than add speculative pooling: the measured tracked high-water was well below the combined 492 actor budget, and no uncaught browser error occurred. Record frame measurements as evidence only; do not impose a hardware-sensitive CI FPS threshold.

Why:
The milestone explicitly targets 300 live enemies, and the representative compound path now exercises substantially more than isolated spawn objects. A threefold projectile budget accommodates high attack speed/projectile-count builds while remaining bounded. Current evidence does not show allocation pressure that justifies pooling complexity.

Future guardrail:
The browser acceptance path requires exactly 300 processed scripted spawns, all four roles, elites, a retained 300-item shrine backlog, capped tracked objects/effects/audio, exact terminal cleanup, and repeated restart. Telemetry records average/maximum frame delta without pass/fail thresholds. Production builds remain free of test seams and telemetry globals.

Revisit when:
Manual testing on lower-powered representative hardware exceeds acceptable frame times, richer assets materially raise object cost, entity caps grow, or profiling identifies allocation/GC pressure.

### REC-041 — CI load paths wait on simulation boundaries, not local wall time

- Status: Resolved
- Date: 2026-08-14
- Affects: V0.2 acceptance, Playwright CI, feedback and representative load scenarios
- Blocks: None

Context / observation:
GitHub Actions pull-request run `31773404032` and push run `31773376078` failed the same two Chromium paths on the serial hosted runner. The 300-enemy test reached capacity but its enemies had not traversed the 360-unit spawn ring before a 15-second wall-clock explosion poll expired. The feedback test used a default five-second poll before proving that its scripted 80-enemy load had advanced. Every deterministic/unit gate and the other 26 browser paths passed; local four-worker runs passed all 28. Retrying both failures three times reproduced the same state boundaries, so retries were not useful.

Decision / solution:
Make both test-build scenarios explicit about their prerequisites. Feedback coverage now waits for all 80 scripted spawns before inspecting the visual high-water mark. The representative acceptance URL uses a test-only 100-unit close-density layout, gates automatic fire and its shortened run clock until all 300 scripted enemies are simultaneously live, and then runs 1,500 simulation milliseconds with hosted-runner poll/test headroom. Production spawn geometry, cadence, combat, timing, and limits are unchanged; the production bundle continues to omit scenario query keys.

Why:
The acceptance requirement is simultaneous capacity and compound interaction correctness, not a fixed amount of wall-clock time for enemies to walk toward the player. Waiting on load completion proves the intended prerequisite, while gating fire prevents early kills from making a close-density test miss the 300-live high-water condition.

Future guardrail:
Run the two paths with `CI=1` before pushing browser-load changes. Long live tests poll authoritative telemetry with explicit hosted-runner budgets, and scripted scenarios order their prerequisites instead of relying on locally fast frame progression.

Revisit when:
Browser tests gain deterministic simulation stepping, CI hardware changes materially, or the representative scenario is replaced by a production replay format.

### REC-042 — Representative load is a manual release stress gate

- Status: Resolved
- Date: 2026-08-14
- Affects: V0.2 acceptance, GitHub Actions, browser regression coverage
- Blocks: None

Context / observation:
GitHub Actions pull-request run `31782554164` passed 27 browser paths but the combined 300-enemy scenario failed all three attempts while waiting for its first explosion. The assertion duplicated the dedicated Phase 4 explosion integration path and made a hardware-sensitive stress scenario block unrelated pull-request work. The workflow also ran the same verification for both a branch push and its pull request. A subsequent zero-retry audit found that the retained Horde reward regression could spend its bounded combat window defeating ambient enemies rather than the tagged shrine enemies whose provenance it asserts.

Decision / solution:
Tag the representative 300-enemy path `@stress` and run it without retries in a separate manually dispatched `Stress` workflow. Required pull-request CI retains type checking, all unit tests, lint, the production build, dependency audit, and every non-stress Chromium regression. Branch pushes run required CI only on `main`, avoiding duplicate feature-branch push and pull-request runs. Keep the stress path as a release gate and run it after changes to spawning, combat/effect queues, statistics, feedback limits, or restart cleanup. Remove its redundant wait for a first explosion; Phase 4 remains authoritative for explosion integration while the stress path continues to require reconciled direct/critical damage, pierce and kill chains, bounded presentation, complete queues, terminal cleanup, and repeated restart. Give the Horde reward path a test-build-only `noAmbient` scenario so its bounded combat window contains only enemies with the provenance under test; production spawning remains unchanged.

Why:
Fast deterministic regressions should block every pull request. The representative load remains important acceptance evidence, but hosted-runner throughput is not a product invariant and its broad compound scope makes it unsuitable as an always-on change gate.

Future guardrail:
Do not remove earlier unit or focused browser regressions when moving a hardware-sensitive scenario out of required CI. Manual stress runs must use zero retries, and V0.2 cannot be released without a passing representative-load run.

Revisit when:
The browser harness gains deterministic simulation stepping, the stress path becomes reliably bounded on hosted runners, or GitHub Actions provides a stable performance runner.

### REC-043 — V0.3 becomes the rebalancing milestone and prior V0.3 content moves to V0.4

- Status: Accepted
- Date: 2026-08-15
- Affects: planning workflow, `PLAN.md` scope sections, V0.3 and V0.4 milestone boundaries, `SAVE_DATA.md` timing
- Blocks: None

Context / observation:
V0.2 completed every named mechanic, but play testing showed the loop reads as flat: `xpRequiredForLevel` is linear (`src/game/systems/xp.ts:20`) while XP income is not; enemies share a physics group with no collider (`src/game/scenes/run-scene.ts:334`); `SPAWN_RADIUS` is 360 against a viewport half-extent of roughly 960, so spawns are visible; the roster fully unlocks within 24 seconds; enemy strength scales with Chaos but not elapsed time; upgrade cards state no values; and Detonation is one fixed 96/15 blast forever. Three defects surfaced alongside those: `eliteChance` is `min(0.4, 0.04p)` so a shrine-free run sees no elites; `selectUpgradeChoices` can re-offer an already-enabled skill, wasting a level-up; and `armour`, `regeneration`, and `luck` are declared and validated but read by no system. The prior `PLAN.md` V0.3 section listed content growth — weapons, bosses, unlocks, persistence, endless mode — none of which addresses these.

Decision / solution:
Re-sequence rather than expand. `PLAN.md` V0.3 now describes a rebalancing, escalation, and readability milestone; the previous V0.3 content list moves verbatim to a new V0.4 section, gaining weapon evolution. `build/BUILD_PLAN_V0.3.md` is the implementation plan for the new V0.3 in eight phases. `SAVE_DATA.md` moves its export/import UI expectation to V0.4 and records that V0.3 adds only a serializable settings slice behind a marked adapter seam. Completed milestone plans stay immutable except for forward-looking factual errata, so `BUILD_PLAN_V0.2.md` gains one corrected milestone reference and nothing else.

Why:
Every V0.4 item inherits whatever curve exists when it lands. Tuning four enemy roles, one weapon, and five skills is materially cheaper than tuning them after adding more weapons, bosses, and unlockable pools on top, and a wrong curve would be re-tuned twice. The three defects above are also cheapest to fix before content multiplies the surface they affect.

Future guardrail:
`PLAN.md` remains the authoritative scope source and one milestone plan is current at a time, as REC-024 requires. `AGENTS.md` and `README.md` must be repointed from V0.2 to V0.3 in the V0.3 Phase 1 commit, not before, so no session begins milestone work against an unapproved plan. Every balance value introduced by V0.3 lives in theme-owned tuning data and is asserted by the pacing simulator, so a later re-sequencing does not require another literal hunt through systems and scenes.

Revisit when:
V0.3 completes, `PLAN.md` scope is intentionally changed again, or the education pivot in `build/EDUCATION_PIVOT.md` is scheduled into a milestone.

### REC-044 — Milestone branches carry an agent prefix

- Status: Accepted
- Date: 2026-08-15
- Affects: git workflow, milestone branch naming, pull request creation
- Blocks: None

Context / observation:
V0.1 and V0.2 were built with ChatGPT Codex on `codex/v0.1` and `codex/v0.2`, and the `codex/` prefix was treated as a fixed part of the branch convention rather than as a record of which agent produced the work. V0.3 is being built with Claude Code, so the prefix no longer described reality. The V0.3 planning branch was opened as `codex/v0.3` and had to be renamed after its pull request already existed.

Decision / solution:
Name milestone branches `<agent>/<milestone>`, where the prefix records the coding agent doing the work: `codex/` for ChatGPT Codex, `claude/` for Claude Code. Decide the prefix when the branch is created. A milestone built by more than one agent keeps the prefix of the agent that created the branch and notes the split in the pull request description. The prefix is provenance only; it grants and withholds nothing, and any agent may read, review, or continue any branch. One branch per milestone, one pull request into `main`, and one reviewable commit per numbered phase are all unchanged.

Why:
Branch history is the cheapest available record of which tool produced which milestone, which matters when reviewing style differences, tracing an unfamiliar decision back to its author, or comparing how the two agents handle the same repository conventions. Encoding it in the branch name costs nothing and needs no separate log.

Future guardrail:
`AGENTS.md` carries the convention as a milestone-independent section, so it does not go stale when the current milestone plan is repointed. Renaming a branch on GitHub **closes** any pull request that used it as the head — the rename API retargets pull requests whose *base* was renamed, not their head — so the prefix must be chosen before the pull request is opened. V0.3 planning pull request #13 was closed this way and reopened as a new pull request from `claude/v0.3` with the same commit.

Revisit when:
A third coding agent is used, a milestone is genuinely co-built and the single-prefix rule becomes misleading, or branch protection rules start depending on the prefix.

### REC-045 — Balance values are theme tuning packs and pacing is answered headlessly

- Status: Accepted
- Date: 2026-08-17
- Affects: V0.3 all phases; theme contracts, XP, world modifiers, spawning, telemetry
- Blocks: None

Context / observation:
Every V0.3 phase is a numbers change, and the only way to evaluate one was to play a five-minute run. Balance literals were also scattered across systems and scenes — `SPAWN_INTERVAL_MS` and `SPAWN_RADIUS` in `run-scene.ts`, the linear curve inside `xp.ts`, and seven Chaos coefficients inside `world-modifiers.ts` — so a tuning change was a code change in three places rather than a theme-data edit.

Decision / solution:
Add a `TuningPack` to `ThemeManifest` covering progression, director, and difficulty, validated like every other manifest section. Systems take tuning as a parameter defaulting to the V0.2 values, so Phase 1 is behaviour-neutral and all 83 V0.2 tests pass untouched. `RunState` carries the theme's `XpCurve` so a run is self-describing and stays serializable. Add `systems/simulation/pacing-simulator.ts`, a deterministic Phaser-free model consuming the same tuning and pure selectors, plus `npm run balance` via `vite-node` (promoted from a vitest transitive dependency to an explicit devDependency).

Two deviations from the plan's Phase 1 list, both deliberate: `bodies.ts` and `hazards.ts` are not created, because no current values exist to preserve and empty files with no consumers are noise — they arrive with Phases 5 and 6. The `difficulty.ts` pack holds only the Chaos block for the same reason; Phase 6 adds the time block.

Why:
Tuning as validated theme data makes the Phase 2 theme swap a content operation rather than a code migration, and it is what lets two production themes hold different balance. The simulator turns a five-minute experiment into a sub-millisecond test, which is the difference between tuning ten times and tuning once.

Future guardrail:
`xpRequiredForLevel(level)` deliberately takes no optional curve parameter — it is passed to `Array.prototype.map` in existing code, which would supply the element index as a curve and reach the banded branch with a number. Curve-aware callers use `xpRequiredForLevelOn(curve, level)`; a regression test asserts the map case. The simulator models pacing only — not movement, positioning, damage taken, pickup travel, or build choice — so its output is a band, and a phase must not treat it as a substitute for the browser paths.

First measurement:
The knight-magic five-minute `damage-rush` run reaches level 28 with levels arriving every 10–11 seconds from level 3 onward, and 587 kills against 751 spawns with live enemies peaking at 171. That is the flat pacing and the DPS-versus-health divergence V0.3 Phases 3 and 6 exist to fix, now measurable before any change.

Revisit when:
Phase 4 replaces the director tuning shape with progress-driven curves, Phase 6 adds the time block, or the simulator's kill model needs positioning to answer a question.

### REC-046 — Environment is the production theme; enemy health is log-scaled persistence

- Status: Provisional
- Date: 2026-08-17
- Affects: V0.3 Phases 3–10; theme packs, enemy tuning, balance, education pivot
- Blocks: None

Context / observation:
The environment/nature fiction became the primary theme for both the pure-fun and any later education stream. Because every V0.3 balance value is theme-owned data, swapping after the tuning phases would have derived every number twice — the same "tune it twice" cost that motivated re-sequencing V0.3 ahead of V0.4 in REC-043. The swap therefore lands before any tuning phase.

Decision / solution:
Add `content/themes/eco-guardian/` as a complete production pack and select it in `active-theme.ts`. Retain `knight-magic` as a second complete production theme rather than deleting it: it is production-shaped content that must keep satisfying every contract, which is a stronger boundary regression target than the synthetic fixture alone. Add `theme-registry.ts` listing both packs for validation and tooling, deliberately excluded from the runtime path so the bundle never carries an unrendered theme.

Enemy health is derived from real persistence, log-scaled and normalized so the plastic bottle is the baseline: `health = 20 * 1.6 ^ (log10(years) - log10(450))`. Literal persistence is unplayable — glass outlasts food waste by roughly twenty million times — so the log scale preserves ordering and intuition inside a playable band. Resulting values: plastic bag 11 (~20 y), plastic bottle 20 (~450 y), bagged waste 24 (~1,000 y), glass bottle 96 (effectively permanent).

Health and harm are decoupled deliberately. Glass has the roster's highest health and the lowest contact damage of any large enemy, because it is effectively permanent and chemically inert. Phase 2 changes identity, health, and contact damage only; rewards, spawn weights, and unlock timing stay at V0.2 values because Phase 3 owns rewards and Phase 4 owns the director.

Why:
Deriving stats from data rather than inventing them and attaching a fact afterwards is the mechanics-as-lesson principle in `build/EDUCATION_PIVOT.md`, and it costs nothing extra in a theme that needed numbers regardless. It also produces better enemy design: separating persistence from harm creates a wall that does not hurt and a fast fragile item that does.

Consequence to watch:
The log band is narrow by construction, so the death-spawner role sits at 24 rather than V0.2's invented 50. Role identity for that enemy now comes from its brood, radius, and contact damage rather than durability. The simulator shows the pack is marginally harder than knight-magic overall — level 27 versus 28, peak live 201 versus 171 — driven by glass at 96 versus 80. Both are within tolerance and both are now visible instantly rather than after a five-minute run.

Future guardrail:
`theme.test.ts` asserts the modelled health formula directly, so changing a persistence figure without changing the model fails. Both production packs are iterated by content and tuning validation. The browser boot path resolves the expected theme id from the facade instead of a literal, which was the single test that hard-coded a theme name and the only e2e failure the swap produced. Any composite item that does not fit one material is a layered enemy, not a new stat fudge — see `EDUCATION_PIVOT.md`.

Revisit when:
Phase 3 retunes rewards, Phase 10's time-to-kill table evaluates the widened glass gap, real persistence sources are cited in a codex, or the type system arrives and enemy identity gains a material attribute.

### REC-047 — The XP curve was selected by simulation, not chosen

- Status: Provisional
- Date: 2026-08-17
- Affects: V0.3 Phases 3, 6, 7, 10; progression, rewards, early-game difficulty
- Blocks: None

Context / observation:
The Phase 3 plan proposed a banded curve of base 4 with growth 1.35/1.22/1.16/1.12. Implemented as written it made level 28 roughly five times more expensive than the linear curve it replaced, and every build model finished between level 10 and 23 against a declared band of 26-31. It also fed back on itself: slower levelling means lower damage, which means fewer kills, which means slower levelling still. The `passive` and `crit` models pinned the 300-enemy cap, confirming they were damage-constrained rather than supply-constrained.

Decision / solution:
Select the curve with the Phase 1 simulator instead of by hand. A five-candidate sweep took seconds and settled on base 3 with growth 1.30/1.18/1.12/1.09, which lands damage-rush at 26, crit at 25, and explosion at 30, with level 5 at 0:26 and level 25 at 4:29. Per-role rewards land as planned (1/2/7/5, offspring at half their own role, elite x2.5), and `toughnessRewardShare` is 0.5. Update the plan's curve table to the selected values, and add a simulator test asserting the band and the deceleration so drift fails in CI rather than in a manual run.

Note that the toughness share is inert at Chaos 1.0 until Phase 6 adds elapsed-time health scaling. It is a declared seam now and an income lever later; Phase 10 re-tunes with every income source live.

Why:
The plan's numbers were a reasonable hand estimate and were wrong by a factor of five. Phase 1 existed precisely so that being wrong costs a sweep rather than five five-minute runs. Recording the miss matters more than quietly correcting it: the same hand-estimation error is likely in the Phase 6 and Phase 7 tables, which should also be simulated before they are trusted.

Discovered defect:
The stress path asserted knight-magic vocabulary (`Peak Foes`, `Total Damage`) and so broke on the Phase 2 theme swap, but CI never caught it because `@stress` is excluded from the required suite. Both assertions now resolve from the active theme. Any assertion on themed copy outside a presentation test is a boundary violation under THEME_ARCHETYPES rule 6, and the excluded stress path is where such violations hide.

Early-game observation to re-check after Phase 4:
A completely stationary player now dies before reaching level 2, where under V0.2 it survived. Level 2 costs 3 experience rather than 2, which is one extra kill at roughly two seconds each. The level-up browser path uses the existing `noContact` seam so it tests the overlay rather than survival, following the REC-042 precedent. This should resolve on its own in Phase 4, whose director opens at a 900 ms cadence instead of 400 ms; verify it there rather than tuning for it now.

Future guardrail:
`tests/unit/simulation` asserts the level band, the front-loaded opening, the late-game deceleration, and parity between both production themes. Browser expectations derive requirements and reward products from theme tuning rather than pinning numbers, so a balance edit does not require a test edit.

Revisit when:
Phase 4 changes spawn cadence, Phase 6 activates the toughness share through time-based health scaling, Phase 7 adds skill scaling income, or Phase 10 re-tunes with every source live.

### REC-048 — The director is curves, and the view is fixed

- Status: Accepted
- Date: 2026-08-17
- Affects: V0.3 Phases 5-10; spawning, camera, arena, enemy contracts, browser expectations
- Blocks: None

Context / observation:
V0.2 spawned on a fixed 400 ms cadence at a fixed 360-unit radius, with roster gating as absolute `unlockAtMs` values on each enemy definition. Three consequences: a 1920x1080 window showed +/-960 x +/-540 of world so every spawn was visible; `pointOnSpawnRing` clamped candidates into the arena, which dragged edge spawns further on screen exactly when the player stood against a wall; and the roster fully unlocked within 24 seconds. Window size also silently changed difficulty, since a larger monitor meant more warning and more targets in range.

Decision / solution:
Resolve every director output from normalized progress `t = elapsedMs / durationMs`, with no value in the data naming a minute. Cadence decays `max(min, base * e^(-k*t))`, batch size ramps `1 + floor(t * ramp)`, roles unlock at progress fractions and ramp their weights, and elite chance ramps from a progress threshold. Chaos multiplies cadence and biases composition through a per-role `chaosWeightBias`, so danger sends worse things rather than only more. Milestone waves fire from the director's own unlock thresholds, so no milestone is tracked by hand. `spawnWeight` and `unlockAtMs` are removed from `EnemyDefinition` rather than left as dead data.

Elite chance is now `max(directorBaseline(t), chaosCurve)` rather than the Chaos curve alone, which fixes a V0.2 defect: a run without shrine activation never spawned a single elite.

Render a fixed 1600x900 logical view via `Phaser.Scale.FIT`, letterboxed. Every window renders exactly the same world area. Spawn radius derives from that view's half-diagonal plus a margin (~1020 versus 360), and the ring rejects candidates that are outside the arena or inside the view rather than clamping them, falling back to the farthest valid in-arena point. The arena grows to 3600x2400 so a full off-screen ring exists everywhere.

Why:
Curves make run length a parameter rather than an authoring task: the same coefficients produce a sensible five-minute run and a sensible ten-minute run, and endless needs only an escalation index. Compressed browser runs traverse every milestone for free, which removed the need for the `durationScale` workaround an authored table would have required. A fixed view is what makes every other balance value in V0.3 meaningful rather than monitor-dependent.

Measurement:
At five minutes the curves produce the intended shape and reach level 26 with 636 kills. At ten minutes, with no new data, level 36 with 1,523 kills and the same role progression. Cadence tightens 900 ms to 331 ms; composition moves from 100% baseline role to 33/28/22/17.

Future guardrail:
`tests/unit/director` asserts cadence, batching, gating, composition shares, Chaos bias, elite ramp, wave crossing, and run-length independence. The scene counts ambient spawns that land inside the view at the authoritative moment the point is chosen, and a browser path sweeps the player into all four walls and all four corners asserting that counter stays zero. Restart rewinds director progress and wave counters.

Pitfall for later phases:
Browser tests that click canvas CSS coordinates are now scale-dependent, because a letterboxed view maps logical points through a zoom factor. The stress path's restart click broke this way and moved to the keyboard control. Prefer keyboard input or large hit areas over pixel coordinates.

Revisit when:
Phase 6 adds time-based scaling on top of the same progress input, endless mode needs the `t > 1` escalation index, or a resolution preset menu lands in Phase 8 settings.

### REC-049 — Spawn radius, enemy speed, and projectile range are one coupled envelope

- Status: Accepted
- Date: 2026-08-17
- Affects: V0.3 Phases 4-10; enemy tuning, weapon range, browser test design
- Blocks: None

Context / observation:
Phase 4 derived the spawn ring from the visible view, taking it from a fixed 360 units to roughly 1,018. Enemy move speeds and weapon projectile lifetime had both been tuned against the old 360 ring and were left unchanged, which broke two things at once. Weapon range is `projectileSpeed * projectileLifetimeMs / 1000` = 960 units, so a shot fired the instant an enemy appeared **could not reach it at all**. Approach time for the opening role went from 5.1 s to 14.5 s, so kills happened far from the player and the experience they dropped was unreachable for anyone standing still.

Locally every browser path still passed, slowly. On a hosted runner six failed: the level-up paths never reached level 2 because no experience was collectible, and the contact-damage, piercing, and feedback paths never accumulated enough combat inside their windows. The suite took 1.2 minutes.

Decision / solution:
Treat spawn radius, enemy move speed, and weapon range as one envelope that must be re-derived together whenever any of them moves. Tighten `spawnMargin` from 100 to 40 (radius 958), rescale move speeds for the real ring (140 / 240 / 90 / 110 against a player speed of 200), and raise `projectileLifetimeMs` from 2,400 to 3,200 so weapon range is 1,280 with headroom over the ring. Exactly one role remains faster than the player, because that role exists to force movement; if everything outran the player, kiting would stop being a strategy.

Health and contact damage keep their product baselines. Only speed changed, and only because it is measured against a distance that changed.

Why:
The failure was not a slow runner, it was a real gameplay regression that a slow runner exposed. A player standing in an arena where enemies take fifteen seconds to arrive and die out of reach has no game to play. Fixing the envelope also cut the browser suite from 1.2 minutes to 55 seconds, because combat now starts when it should.

Future guardrail:
`tests/unit/director` asserts the envelope directly for both production themes: weapon range must exceed the spawn ring by at least 20 percent, every role must reach the player within 12 seconds, the opening role within 8, and exactly one role may outrun the player. A tuning edit that breaks the coupling now fails in milliseconds instead of on a hosted runner.

Test-design pitfalls found alongside:
A whole class of pitfalls surfaced afterwards, all the same shape. Since the ring is derived from the visible view it sits ~958 units out, so any path where a stationary player must accumulate kills now waits seconds for the first enemy and far longer for the tenth. Three separate CI runs failed on different members of that class -- feedback throttling, then level-up progression and contact death -- each passing locally with only a few seconds of margin. Patching them one at a time was treating symptoms.

Two test-only seams resolve the class. `closeLoad` places load-harness spawns beside the player and is no longer gated behind `representativeLoad`. `spawnRadius` overrides the ambient ring for a single path. Any browser path whose subject is combat, progression, feedback, or reward accounting should use one of them; the path that actually verifies off-screen spawning deliberately uses neither, and the in-view spawn counter is suppressed whenever the override is active so it cannot report a false violation. The four worst offenders went from roughly 31, 22, 30 and 23 seconds to 14.7 seconds combined, and the browser suite from 1.2 minutes to 50 seconds.

Two browser paths were wall-clock dependent in ways local runs never showed. One polled a progress threshold on a fixed 30-second timeout, which fails whenever simulation advances slower than real time — the case REC-041 already warned about. The other stalled indefinitely because the run entered `level_up` and waited for a choice the test never made; simulation time stops there, so no wall-clock timeout can ever help. Director paths now use the `noXp` seam to stay out of progression entirely, following the REC-042 precedent of isolating the path under test.

Revisit when:
The view size or camera zoom changes, weapon range becomes an upgrade, enemy speed scaling arrives in Phase 6, or a role is added whose speed approaches the player's.

### REC-050 — A wave the player cannot outrun must not chase

- Status: Accepted
- Date: 2026-08-17
- Affects: V0.3 Phases 4-10; director waves, enemy movement, theme validation
- Blocks: None

Context / observation:
Play testing found the first milestone wave killed the player every time. The wave releases `15 + 15t` enemies at once, and at its 0.2 unlock that is 18 of the fast role. REC-049 had set that role's speed to 240 against a player speed of 200 precisely so it could not be outrun, which is correct for one ambient enemy and fatal for eighteen simultaneous ones. The wave also arrives before the player has any crowd clearing: the starter weapon fires a single projectile with no pierce, so it cannot thin a pack.

Decision / solution:
Give each director role a declared `waveMovement` of `chase` or `drift`. A drifting enemy aims once at the player's position when it first moves and then holds that heading, so the wave sweeps through as an obstacle to dodge rather than a pursuit that cannot be broken. The fast role's wave drifts; the slower, heavier roles keep chasing, because being encircled by things you can outrun is the interesting version of that pressure. Ambient spawns always chase regardless of role.

Drifting enemies never turn back, so they are reclaimed once they pass the arena edge by a margin rather than piling up against a wall.

Why:
The wave is meant to be a spike the player reacts to, not a coin flip decided before it spawns. Aiming once at the player's position preserves the "they are running at us" read the design wants, while making position and timing the answer instead of raw speed. It also keeps REC-049's speed envelope intact, which the ambient game needs.

Future guardrail:
Theme validation rejects any role whose enemy is at least as fast as the player while declaring a chasing wave, so the combination cannot be reintroduced by a tuning edit. Unit tests assert it for both production packs and that the earliest wave is non-homing. A browser path crosses the first unlock and asserts drifting enemies are released, stay live, and are reclaimed after leaving.

Revisit when:
The starter weapon gains crowd clearing early, wave sizes change materially, or a role's speed crosses the player's.

## Open questions to reconcile during implementation

- The longer-run spawn ramp and five-minute balance are not settled; Phase 3's 400 ms spawn cadence and 1000 ms contact immunity remain provisional smoke-test baselines.
- The 300/192 enemy/projectile budget is supported by one local Chromium profile but remains provisional pending broader hardware testing; production randomness policy is also unsettled.
- Accessibility details beyond alternate movement keys and reduced-motion feedback—colour independence, remapping, and readable scaling—need an explicit later decision.
- The final current-theme names for the starter character, starter weapon, XP pickup, and several basic upgrades are intentionally TBD in `build/THEME_ARCHETYPES.md`; mechanics must not wait on those copy choices.
- The long-term distinction between a reusable “skill,” a level-up “upgrade,” and a weapon-owned effect should be settled when the first non-stat skill enters scope. Stable IDs keep that taxonomy migratable.
- The portable save checksum algorithm, import size limit, unknown-content policy details, and whether settings travel in every export remain provisional until persistence implementation.
