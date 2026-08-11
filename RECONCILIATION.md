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

## Open questions to reconcile during implementation

- The exact XP curve, upgrade magnitudes, Grunt spawn ramp, contact-damage cooldown, and five-minute balance are tuning assumptions, not settled design.
- The practical live-enemy/projectile budget must be measured on representative desktop browsers. The design's 300+ target is aspirational and not a V0.1 release gate.
- Phaser physics choice, pooling thresholds, and deterministic seeding details should be recorded after the foundation is exercised rather than guessed in advance.
- Accessibility details beyond alternate movement keys—reduced motion, colour independence, remapping, and readable scaling—need an explicit later decision.
