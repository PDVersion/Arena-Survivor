# Reconciliation Log

Read this file immediately after `build/BUILD_PLAN.md` before beginning any work. It is the project's durable memory: record information here when it should change or constrain how later phases and features are built.

This is not a daily diary or a duplicate issue tracker. Add an entry when a decision, discovered constraint, failed approach, defect cause, workaround, measurement, or external dependency is likely to matter again.

- Current milestone: **V0.1**
- Active phase: **Phase 3 complete — Phase 4 not started**
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

## Open questions to reconcile during implementation

- The exact XP curve, upgrade magnitudes, longer-run spawn ramp, and five-minute balance are not settled; Phase 3's 400 ms spawn cadence and 1000 ms contact immunity are provisional smoke-test baselines.
- The practical live-enemy/projectile cap above the current 80/64 baseline and whether Phase 6 requires pooling must be measured on representative desktop browsers; deterministic runtime seeding remains unsettled.
- Accessibility details beyond alternate movement keys—reduced motion, colour independence, remapping, and readable scaling—need an explicit later decision.
- The final current-theme names for the starter character, starter weapon, XP pickup, and several basic upgrades are intentionally TBD in `build/THEME_ARCHETYPES.md`; mechanics must not wait on those copy choices.
- The long-term distinction between a reusable “skill,” a level-up “upgrade,” and a weapon-owned effect should be settled when the first non-stat skill enters scope. Stable IDs keep that taxonomy migratable.
- The portable save checksum algorithm, import size limit, unknown-content policy details, and whether settings travel in every export remain provisional until persistence implementation.
