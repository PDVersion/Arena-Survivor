# Reconciliation Log

Read this file immediately after `build/BUILD_PLAN.md` before beginning any work. It is the project's durable memory: record information here when it should change or constrain how later phases and features are built.

This is not a daily diary or a duplicate issue tracker. Add an entry when a decision, discovered constraint, failed approach, defect cause, workaround, measurement, or external dependency is likely to matter again.

- Current milestone: **V0.1**
- Active phase: **Phase 1 — Project foundation and browser boot**
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

- Status: Provisional
- Date: 2026-08-11
- Affects: All V0.1 phases, testing, future content systems
- Blocks: None

Context / observation:
Combat, XP, upgrades, and modifier stacking will become interaction-heavy, while Phaser scenes and physics depend on frame timing and browser state.

Decision / solution:
Keep stats and game rules in framework-independent TypeScript modules with injected randomness/time where needed. Use Vitest for those rules and a thin Playwright suite for the Phaser wiring and critical path.

Why:
This keeps most failures quick and reproducible while still checking that the actual browser game boots and connects its systems.

Future guardrail:
New mechanics require rule-level tests; browser tests should assert public/test telemetry rather than canvas pixels or arbitrary sleeps.

Revisit when:
The first two implemented phases show that the boundary creates excessive synchronization or duplication.

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

## Open questions to reconcile during implementation

- The exact XP curve, upgrade magnitudes, Grunt spawn ramp, contact-damage cooldown, and five-minute balance are tuning assumptions, not settled design.
- The practical live-enemy/projectile budget must be measured on representative desktop browsers. The design's 300+ target is aspirational and not a V0.1 release gate.
- Phaser physics choice, pooling thresholds, and deterministic seeding details should be recorded after the foundation is exercised rather than guessed in advance.
- Accessibility details beyond alternate movement keys—reduced motion, colour independence, remapping, and readable scaling—need an explicit later decision.
- The final current-theme names for the starter character, starter weapon, XP pickup, and several basic upgrades are intentionally TBD in `build/THEME_ARCHETYPES.md`; mechanics must not wait on those copy choices.
- The long-term distinction between a reusable “skill,” a level-up “upgrade,” and a weapon-owned effect should be settled when the first non-stat skill enters scope. Stable IDs keep that taxonomy migratable.
- The portable save checksum algorithm, import size limit, unknown-content policy details, and whether settings travel in every export remain provisional until persistence implementation.
