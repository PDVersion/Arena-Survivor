# Arena Survivor V0.2 Build Plan

This is the current implementation plan for the V0.2 scope in [`PLAN.md`](./PLAN.md). It starts from the completed [`BUILD_PLAN_V0.1.md`](./BUILD_PLAN_V0.1.md) milestone and turns the broader swarm-interaction scope into ordered, testable phases. Every work session must read this file and then [`../RECONCILIATION.md`](../RECONCILIATION.md) before changing code.

## Delivery contract

- Begin implementation only from `main` after the complete V0.1 milestone has landed.
- Build V0.2 on `codex/v0.2` and deliver it as one pull request into `main`.
- Treat the V0.2 planning/workflow commit as the branch baseline; the seven numbered implementation phases follow it.
- Complete phases in order. Each numbered phase ends in one reviewable commit using the listed subject.
- Keep implementation, tests, plan status, and material reconciliation findings in the same phase commit.
- Run a phase's short verification before marking it complete or starting the next phase.
- Preserve all V0.1 acceptance paths unless a changed V0.2 requirement is explicitly recorded in reconciliation.
- Keep themed content behind the contracts in [`THEME_ARCHETYPES.md`](./THEME_ARCHETYPES.md).
- Keep persistent profile shapes compatible with [`SAVE_DATA.md`](./SAVE_DATA.md), but do not implement persistence or portable import/export in V0.2.

## Phase tracker

Add a completed phase's commit hash in the next phase status update or the pull request description.

- [x] Phase 1 — Interaction contracts, causal events, and load harness (`a7f343d`)
- [x] Phase 2 — Runner, Tank, and Broodmother roster (`52a16ea`)
- [x] Phase 3 — Overcrit tiers and Piercing Momentum (`1c170fb`)
- [x] Phase 4 — Explosions, Fracture, Bloodlust, and chain reactions (`57a1126`)
- [x] Phase 5 — Chaos, world multipliers, and additional shrines (`77f072c`)
- [x] Phase 6 — Baseline elites and audiovisual feedback (`48c7fe8`)
- [x] Phase 7 — Statistics, performance hardening, and V0.2 acceptance

## Source scope and resolved boundaries

V0.2 is derived from the `V0.2 Scope` section of [`PLAN.md`](./PLAN.md), with V0.1's deferred list used only to identify candidates. The product scope is authoritative when the two differ.

V0.2 includes:

- Runner, Tank, and Broodmother enemy roles;
- uncapped crit chance expressed as overcrit tiers;
- Piercing Momentum;
- explosions, Fracture, Bloodlust, and chain reactions;
- Chaos, enemy/XP multipliers, additional shrines, and baseline elite enemies;
- crit/overcrit, pierce, shrine, and explosion audio cues;
- damage numbers, basic particles, and restrained screen feedback;
- peak enemies alive, highest Chaos, highest crit, longest pierce, largest kill chain, and damage breakdown statistics.

Resolved V0.2 limits:

- The existing Horde shrine remains supported. Add Greed, Multiplicity, and Duplication as the minimum additional shrine set described by the product plan.
- Blood Altar is deferred because its Legendary reward depends on rarity work not named in V0.2 scope.
- Fracture enters as a reusable on-kill skill/upgrade mechanic. A general curse acquisition and reward system remains deferred.
- V0.2 adds one theme-owned baseline elite treatment. Distinct elite modifiers remain V0.3 scope.
- V0.2 continues to deepen the starter weapon rather than adding weapons.
- Exact balance values not specified by the product plan are provisional, theme-owned, tested as data, and recorded in reconciliation when selected.

## V0.2 acceptance

V0.2 is complete when a player can:

1. Complete every V0.1 path without regression: movement, combat, XP, upgrades, Horde shrine, terminal states, and restart.
2. Encounter Runner, Tank, and Broodmother enemies with visibly and mechanically distinct roles; killing a Broodmother creates its configured offspring exactly once.
3. Raise crit chance beyond 100%, resolve the correct guaranteed and fractional overcrit tier, and distinguish tiers in damage, telemetry, visuals, and sound.
4. Select Piercing Momentum and observe one projectile increase damage as its unique pierce chain advances.
5. Select explosions, Fracture, Bloodlust, and chain reactions and observe their effects compose without duplicate deaths, dropped work, or runaway callbacks.
6. Increase Chaos through an explicit dangerous choice and see declared enemy, spawn, elite, XP, and shrine-reward multipliers resolve from one world-modifier model.
7. Activate the retained Horde shrine plus the Greed, Multiplicity, and Duplication shrine roles with exact-once, data-defined risk/reward outcomes.
8. Encounter baseline elites that are visually distinct, use explicit stat/reward multipliers, and remain compatible with every enemy role.
9. Hear and see readable, throttled feedback for crit tiers, piercing, shrine activation, explosions, damage, and elite appearance under representative swarm load.
10. End a run with accurate peak enemies, highest Chaos, highest crit/overcrit, longest pierce, largest kill chain, total damage, and source-level damage breakdown.
11. Sustain a scripted 300-enemy representative load in Chromium without uncaught errors, unbounded tracked objects, lost scheduled work, or audio/effect storms; record manual frame-time findings rather than imposing a hardware-sensitive CI FPS threshold.
12. Pass a rename-only alternate-theme test and architecture guard without simulation changes or current-theme behavioural keys.

## Architecture carried forward

V0.1's boundaries remain mandatory:

- stable IDs and reusable rule contracts belong to core;
- names, descriptions, tuning, effect composition, and presentation/audio tokens belong to the active theme;
- systems resolve rules without comparing player-facing strings;
- scenes coordinate systems and generic actors but do not deep-import a concrete theme;
- run and profile state remain serializable and contain no Phaser, DOM, timer, or callback objects;
- test telemetry is read-only, exists only in test builds, and never ships in production.

V0.2 extends that shape with four explicit seams.

### Causal combat events

Hits, deaths, spawns, explosions, splits, and reward awards carry stable runtime event/entity IDs plus source, parent, and effect IDs where relevant. An iterative event queue processes interactions; effects do not recursively call scene collision handlers. Each actor can claim a lethal transition and each configured on-kill effect at most once for the triggering death.

The queue may use a measured per-frame processing budget, but due work is retained as back-pressure rather than silently discarded. Technical entity/effect limits remain permitted for stability and must be observable in telemetry.

### Modifier resolution

Player, weapon, world, enemy, and reward modifiers are separate typed inputs. Additive and multiplicative stacking order is centralized and deterministic. Chaos is a value feeding declared multiplier curves; it is not a collection of scattered scene conditionals.

### Statistics provenance

Statistics consume committed simulation results, not rendered objects or physics callbacks. Damage records carry a stable source/effect category so totals and breakdowns reconcile exactly. High-water marks and chain counters update from the same authoritative events used by gameplay.

### Feedback consumers

Audio, particles, damage numbers, and camera effects consume committed events after simulation. They may aggregate, throttle, or omit presentation under load, but never alter or suppress simulation results. Audio begins only after a user gesture, respects mute/focus state, and limits concurrent voices.

## Intended code evolution

```text
src/game/
  core/
    archetypes/     Stable enemy, skill, shrine, feedback, and effect contracts
    combat/         Crit-tier, damage, provenance, and chain result types
    modifiers/      Deterministic player/world/enemy/reward resolution
  content/themes/knight-magic/
    enemies.ts      Grunt, Runner, Tank, Broodmother definitions
    skills.ts       Momentum and on-kill interaction definitions
    shrines.ts      Horde plus V0.2 shrine definitions
    tokens.ts       Theme-owned visual/audio/feedback tokens
  systems/
    events/         Iterative causal queue and exact-once claims
    chaos/          Chaos state and multiplier selectors
    effects/        Pierce, explosion, fracture, bloodlust, chain mechanics
    statistics/     Event-fed run statistics and damage ledger
    feedback/       Throttled audio and visual event consumers
  entities/         Generic configured enemy, projectile, shrine, and effect actors
tests/
  unit/             Exhaustive deterministic rules and malformed content cases
  e2e/              Representative live paths and restart/load regressions
```

This is directional rather than a requirement to create empty folders. Add a seam only when its owning phase needs it.

## Phase 1 — Interaction contracts, causal events, and load harness

**Commit:** `build(v0.2): establish interaction and load foundations`

Deliver:

- Add only the stable IDs/contracts needed by the V0.2 enemy, skill, shrine, elite, event-source, and feedback categories.
- Extend theme validation and the alternate fixture for those required roles without activating later-phase mechanics.
- Introduce serializable causal event/provenance types and an iterative exact-once processing queue.
- Extract centralized additive/multiplicative modifier resolution suitable for player, enemy, world, and reward inputs.
- Add telemetry for event backlog, processed effects, dropped presentation cues, and live/tracked high-water marks.
- Add a deterministic headless load harness and a browser-only scripted spawn seam that is unavailable in production.
- Preserve all 45 V0.1 unit tests and 14 browser paths.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/content tests/unit/architecture tests/unit/events tests/unit/modifiers
npm run build
npm run test:e2e -- --grep "boots|load harness"
```

Manual smoke: run the scripted representative load, inspect tracked/live/backlog telemetry and the browser console, then restart and confirm all queued work is gone.

Exit gate: later interaction phases can emit, queue, attribute, and observe work without theme-name branches, recursive scene callbacks, writable production hooks, or V0.1 regressions.

## Phase 2 — Runner, Tank, and Broodmother roster

**Commit:** `feat(v0.2): add the expanded enemy roster`

Deliver:

- Define `enemy.fast_fragile`, `enemy.slow_durable`, and `enemy.death_spawner` in the knight-magic theme using the product baselines where specified.
- Keep one generic enemy actor configured by capabilities; do not add themed runtime classes.
- Add data-driven spawn weighting/cadence and deterministic selection with an injected random source.
- Implement Broodmother exact-once offspring spawning through causal events, including cap/back-pressure and reward provenance.
- Give each role distinct theme-owned geometry/tokens/copy pending final assets.
- Exercise mixed-roster targeting, collision damage, XP rewards, terminal cleanup, and restart.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/content tests/unit/spawning tests/unit/enemies tests/unit/combat
npm run build
npm run test:e2e -- --grep "enemy roster|Broodmother|combat"
```

Manual smoke: identify all four enemy roles without telemetry, kite a Runner around a Tank, kill a Broodmother at high capacity, and verify exactly its configured offspring eventually spawn.

Exit gate: all three new roles are observable, theme-defined, cap-safe, exactly cleaned up, and coexist with the V0.1 Grunt loop.

## Phase 3 — Overcrit tiers and Piercing Momentum

**Commit:** `feat(v0.2): add overcrit and piercing momentum`

Deliver:

- Replace V0.1's binary crit resolution with uncapped deterministic tier resolution: guaranteed tiers plus the fractional chance for the next tier.
- Keep crit chance representable above 100% and return tier, multiplier, base damage, and bonus damage as explicit results.
- Select provisional exact tier multipliers from the product examples, define them centrally, and record any deviation in reconciliation.
- Implement `skill.piercing_momentum` as a data-defined per-unique-hit damage increase on the same projectile.
- Track a projectile's pierce-chain index and longest chain without counting duplicate overlaps.
- Add themed upgrade/copy/token entries and live telemetry for crit tier and pierce damage progression.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/combat tests/unit/crit tests/unit/piercing tests/unit/content
npm run build
npm run test:e2e -- --grep "overcrit|piercing momentum|level up"
```

Manual smoke: use a deterministic test build to cross 100%, 200%, and 300% crit, then fire through a dense line and confirm monotonically increasing unique-hit damage.

Exit gate: tier probabilities and damage are exact at boundaries, Momentum is projectile-local, statistics provenance is complete, and presentation does not influence rolls.

## Phase 4 — Explosions, Fracture, Bloodlust, and chain reactions

**Commit:** `feat(v0.2): add composable on-kill interactions`

Deliver:

- Add theme-owned reusable definitions for on-kill explosion, Fracture, Bloodlust, and explosion chain reaction.
- Resolve explosions with deterministic radius/damage rules and spatial queries; attribute direct, explosion, and chained damage separately.
- Allow explosion kills to enqueue their own configured effects exactly once.
- Implement Fracture as chance-based enemy splitting through the spawn queue, preserving parent/source identity and cap back-pressure.
- Calculate Bloodlust from kills committed in the rolling previous five simulation seconds, at +1% attack speed per ten kills as specified.
- Ensure pause, level-up, terminal states, and restart freeze or clear rolling windows and queued effects correctly.
- Add an interaction-matrix test covering the supported combinations rather than isolated happy paths only.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/events tests/unit/effects tests/unit/combat tests/unit/spawning
npm run build
npm run test:e2e -- --grep "explosion|Fracture|Bloodlust|chain reaction"
```

Manual smoke: build explosion + chain + Fracture under a dense swarm, confirm the chain is readable and finite, pause during queued work, then die/restart with no effects leaking.

Exit gate: all four mechanics compose through committed events, totals remain reconcilable, and load controls retain simulation work while bounding per-frame processing and presentation.

## Phase 5 — Chaos, world multipliers, and additional shrines

**Commit:** `feat(v0.2): add Chaos and world risk rewards`

Deliver:

- Add serializable per-run Chaos state starting at `1.0x`, a HUD selector, and a single data-defined multiplier curve.
- Route enemy spawn/count pressure, enemy modifiers, XP gain, elite frequency, and shrine rewards through explicit world/reward selectors.
- Preserve source-specific Horde rewards and define the stacking order between source rewards, Chaos, and shrine/world multipliers.
- Add stable theme-owned shrine definitions for Greed, Multiplicity, and Duplication while retaining Horde.
- Make each shrine discoverable, exact-once, and explicit about immediate/permanent effects; Duplication snapshots current living enemies and schedules copies with +50% source reward through back-pressure.
- Support multiplicative stacking without using display names or scene-specific branches.
- Surface active world modifiers and Chaos changes in telemetry and readable HUD/activation feedback.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/chaos tests/unit/modifiers tests/unit/shrine tests/unit/content
npm run build
npm run test:e2e -- --grep "Chaos|shrine|world multiplier"
```

Manual smoke: activate each shrine in isolation, then stack Multiplicity twice, verify the declared enemy and XP products, and restart to a clean `1.0x` world.

Exit gate: dangerous player choices visibly raise risk and reward through one deterministic model, all four shrine roles work, and no multiplier is rounded away or applied twice.

## Phase 6 — Baseline elites and audiovisual feedback

**Commit:** `feat(v0.2): add elites and scalable combat feedback`

Deliver:

- Add a baseline elite capability applicable to every enemy definition, with theme-owned visual/audio tokens and explicit stat/reward multipliers.
- Select elites deterministically from the Chaos-resolved frequency and preserve elite identity through splits, duplication, death, and rewards according to recorded rules.
- Add theme-owned sound tokens and a throttled audio service for crit, overcrit, pierce, shrine activation, explosions, and elite appearance.
- Initialize audio only after user interaction and add a session-only mute control; profile persistence remains deferred.
- Add pooled/limited damage numbers, explosion/impact particles, elite outlines, and tier-scaled screen feedback as downstream event consumers.
- Aggregate simultaneous sounds and effects so dense chains remain legible without affecting damage or statistics.
- Add focus, pause, resize, reduced-motion preference, and restart cleanup coverage for feedback resources.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/elites tests/unit/feedback tests/unit/content tests/unit/modifiers
npm run build
npm run test:e2e -- --grep "elite|feedback|focus|resize"
```

Manual smoke: encounter elite versions of multiple enemy roles, trigger every required cue, toggle mute/reduced motion, and inspect a dense chain for understandable audio, bounded effects, and no console warnings.

Exit gate: elites are mechanically and visually distinct, required feedback is perceivable and bounded under load, and simulation results are identical with feedback enabled, muted, reduced, or unavailable.

## Phase 7 — Statistics, performance hardening, and V0.2 acceptance

**Commit:** `feat(v0.2): complete the interaction milestone`

Deliver:

- Track peak enemies alive, highest Chaos, highest crit chance/tier, longest pierce chain, largest kill chain, total damage, and damage by stable source/effect category.
- Define kill-chain timing centrally and record its provisional window in reconciliation.
- Expand the run-complete/death presentation to show V0.2 statistics using theme-owned vocabulary and deterministic formatting.
- Prove damage breakdown sums exactly to total damage, including direct, crit bonus, explosions, chained explosions, and a documented remainder category.
- Raise or replace V0.1 entity limits only from measured evidence; add pooling where allocation profiling shows material benefit.
- Exercise 300 live enemies, mixed roles, elites, shrine backlog, interaction queues, audio/effect throttling, terminal cleanup, and repeated restart.
- Finish one critical browser path from movement through a compound build, Chaos/shrine activation, elite swarm, statistics, and restart.
- Update README controls, feedback settings, run instructions, known limitations, and verification commands.
- Update this tracker and reconciliation with final measurements and any deferred balance questions.

Short verification:

```text
npm test -- --run
npm run typecheck
npm run lint
npm run build
npm run test:e2e:ci
npm run test:e2e:stress
npm audit --audit-level=high
```

Manual smoke: complete a compound Overcrit + Momentum + explosion + Fracture + Bloodlust run, raise Chaos with multiple shrines, observe elites and all feedback, compare the terminal ledger with telemetry, and restart repeatedly after peak load.

Exit gate: all twelve V0.2 acceptance points pass, the full suite is green, the 300-enemy representative load meets invariant and cleanup gates, rename-only presentation changes require no simulation edits, and reconciliation has no V0.2 release blocker.

## Pull request acceptance

The V0.2 pull request is ready for review when:

- all seven phase commits are present in order and individually understandable;
- V0.1 regressions and every V0.2 short verification pass from a clean checkout;
- CI passes without relying on retries;
- the PR description lists scope, controls/settings, verification, performance findings, known limitations, and deferred V0.3 work;
- `RECONCILIATION.md` reflects actual stacking, provenance, chain, elite, audio, and load decisions;
- theme validation passes and no current themed name is used as a behavioural key;
- production contains no test hooks, fixtures, telemetry globals, secrets, generated build output, test artifacts, or dependency directories.

## Explicitly deferred beyond V0.2

The following are not part of this build plan: additional weapons; Blood Altar/Legendary rarity; a general curse acquisition system and additional curses; elite modifiers; mini-bosses and bosses; unlockable content pools; browser-local persistence; portable save export/import, codecs, migrations, and UI; suspended runs; endless mode; a second production theme; advanced statistics beyond the V0.2 list; production deployment; and final art/audio production.

Stable IDs, serializable models, provenance, and theme-owned tokens must keep those additions possible without implementing them early.
