# Arena Survivor V0.1 Build Plan

This is the implementation plan for the product vision in [`PLAN.md`](./PLAN.md). It deliberately turns the broad design into a small, testable first playable. Every work session must read this file and then [`../RECONCILIATION.md`](../RECONCILIATION.md) before making changes.

## Delivery contract

- Build all of V0.1 on `codex/v0.1` and deliver it as one pull request into `main`.
- Treat the planning/workflow commit as the branch baseline; the six numbered implementation phases follow it.
- Complete phases in order. Each numbered phase ends in one sizeable, reviewable commit.
- A phase includes its implementation, automated tests, documentation/status updates, and reconciliation notes.
- Run the phase's short verification before committing. Do not start the next phase while it is red.
- Prefer deterministic tests for game rules and a small browser smoke suite for Phaser integration.
- Defer V0.2/V0.3 features unless they are strictly required to keep the architecture extensible.

## Phase tracker

Update this tracker in the corresponding phase commit. Add the commit hash after the commit exists in the next phase's status update or in the pull request description.

- [ ] Phase 1 — Project foundation and browser boot
- [ ] Phase 2 — Arena, player movement, and run state
- [ ] Phase 3 — Grunt swarm and Needle combat
- [ ] Phase 4 — XP, levels, and data-driven upgrades
- [ ] Phase 5 — HUD, run completion, and restart loop
- [ ] Phase 6 — Horde shrine and V0.1 hardening

## Resolved V0.1 scope

The design document's V0.1 list does not mention shrines, while its First Milestone requires one. V0.1 therefore includes one minimal **Shrine of the Horde** so the first playable demonstrates the game's defining player-controlled difficulty spike. Other shrine types, Chaos progression, curses, overcrit, chain reactions, extra enemies, audio, and save data remain later work.

V0.1 is complete when a player can:

1. Start a five-minute browser run, move with WASD or arrow keys, and remain within the arena.
2. Be followed and damaged by Grunts, die, and restart without reloading the page.
3. Automatically target and shoot the nearest enemy with the Needle.
4. Deal normal or critical damage, pierce enemies, kill them, and collect their XP.
5. Level up, pause the action, choose one of three upgrades, and see the selected stat affect play.
6. Activate one Horde shrine with E or Space, create a visible spawn surge, and receive bonus XP from its spawned enemies.
7. Read health, XP, level, timer, kill count, and live enemy count from the HUD.
8. Reach either death or the five-minute completion state and start a fresh run with reset state.

## Technical baseline

- TypeScript, Phaser, and Vite, as selected by the design document.
- Vitest for deterministic unit tests of stats, damage, targeting rules, XP, upgrades, and run state.
- Playwright with Chromium for a thin end-to-end suite covering boot and the critical playable path.
- `npm run dev`, `npm run build`, `npm test -- --run`, and `npm run test:e2e` are the standard commands.
- Use simple generated geometry and placeholder effects in V0.1; external art and audio are not prerequisites.
- Expose a read-only, test-build-only telemetry seam (for example `window.__ARENA_TEST__`) so browser tests can assert player, enemy, run, and pause state without depending on pixels or timing guesses. It must not ship in production builds.

## Intended code shape

Keep Phaser objects thin and put reusable rules in framework-independent modules.

```text
src/
  main.ts
  game/
    config.ts
    scenes/       Boot, run, and overlay/end-state coordination
    entities/     Player, Grunt, Projectile, XP pickup, Shrine
    systems/      Spawning, targeting, combat, XP, upgrades, run lifecycle
    data/         Player, weapon, enemy, and upgrade definitions
    state/        Typed run state and statistics
    ui/           HUD and level-up choice UI
  test-support/   Browser telemetry/instrumentation, excluded from production
tests/
  unit/
  e2e/
```

Data definitions own tuning values. Systems own rules. Scenes coordinate systems and rendering. UI reads state and emits explicit choices; it does not contain combat or progression rules.

## Phase 1 — Project foundation and browser boot

**Commit:** `build(v0.1): bootstrap the Phaser game`

Deliver:

- Initialize the Vite + TypeScript project and pin required dependencies.
- Add Phaser game configuration, a boot/run scene, canvas sizing, and resize handling.
- Add Vitest, Playwright, lint/type-check scripts, and the test-only telemetry seam.
- Render a placeholder arena and a clear loading/boot failure rather than a blank page.
- Add a minimal CI workflow that runs type-check, unit tests, production build, and browser smoke test.

Short verification:

```text
npm run typecheck
npm test -- --run
npm run build
npm run test:e2e -- --grep "boots"
```

Manual smoke: open `npm run dev`, confirm one canvas appears and resizes without console errors.

Exit gate: a clean checkout can install, build, test, and display the arena in Chromium.

## Phase 2 — Arena, player movement, and run state

**Commit:** `feat(v0.1): add arena movement and run state`

Deliver:

- Add the large bounded arena, player body, eight-direction WASD/arrow movement, and normalized diagonal speed.
- Follow the player with the camera while keeping the player inside arena boundaries.
- Introduce typed, resettable run state with base player stats from the design plan.
- Start the five-minute timer and distinguish `playing`, `paused`, `dead`, and `complete` states.
- Ensure pause/end state stops movement and simulation time cleanly.

Short verification:

```text
npm test -- --run tests/unit/player tests/unit/run-state
npm run test:e2e -- --grep "movement|boundaries|pause"
npm run build
```

Manual smoke: move in every direction, press opposing inputs, hit each boundary, and confirm the camera follows smoothly.

Exit gate: movement is predictable, the player cannot leave the arena, and a new run always starts from the same clean state.

## Phase 3 — Grunt swarm and Needle combat

**Commit:** `feat(v0.1): add grunt swarm and projectile combat`

Deliver:

- Define the Grunt and Needle as typed data, then spawn Grunts outside the camera view and have them chase the player.
- Apply throttled contact damage with a visible invulnerability interval; reaching zero health enters `dead`.
- Auto-target the nearest valid enemy, fire projectiles, and handle projectile lifetime/collision.
- Implement deterministic damage, uncapped crit chance representation, V0.1 crit rolls, and basic pierce consumption.
- Kill and remove enemies safely, increment kill/live counters, and avoid double-hit/double-death accounting.
- Pool or otherwise cap high-churn projectiles/enemies so later swarm work has a stable base.

Short verification:

```text
npm test -- --run tests/unit/combat tests/unit/targeting tests/unit/spawning
npm run test:e2e -- --grep "combat|death"
npm run build
```

Manual smoke: let Grunts surround the player, confirm damage is throttled, watch the Needle retarget, and verify a piercing shot can hit multiple enemies once each.

Exit gate: enemies can spawn, chase, damage, be shot, crit, be pierced, die exactly once, and end the run by killing the player.

## Phase 4 — XP, levels, and data-driven upgrades

**Commit:** `feat(v0.1): add progression and upgrade choices`

Deliver:

- Drop one XP pickup per Grunt, support pickup radius, and magnet/collect it without duplicate awards.
- Add an explicit XP curve, multi-level overflow handling, player level, and XP progress.
- Pause gameplay on level-up and present three distinct valid choices.
- Add a small data-driven V0.1 pool covering damage, attack speed, crit chance, pierce, projectile count, move speed, health, and pickup radius.
- Apply choices through stat modifiers, resume safely, and queue another choice if one XP award crossed multiple levels.
- Make seeded/random selection injectable so unit and browser tests are repeatable.

Short verification:

```text
npm test -- --run tests/unit/xp tests/unit/upgrades tests/unit/stats
npm run test:e2e -- --grep "level up|upgrade"
npm run build
```

Manual smoke: collect XP, choose each upgrade category across short runs, and confirm the game remains frozen until a choice is made.

Exit gate: XP cannot be counted twice, level overflow is retained, three choices appear, and the chosen upgrade has an observable gameplay effect.

## Phase 5 — HUD, run completion, and restart loop

**Commit:** `feat(v0.1): complete the playable run loop`

Deliver:

- Add readable health, XP, level, timer, kill count, and live enemy count HUD elements.
- Add distinct death and five-minute completion overlays with a restart action.
- Reset all entities, timers, input, upgrades, counters, and transient scene state on restart without a page reload.
- Add restrained V0.1 feedback: hit flash, projectile trail, crit distinction, pickup cue, level-up emphasis, and damage/readability layering.
- Handle focus loss and browser resize without advancing or corrupting the run.

Short verification:

```text
npm test -- --run tests/unit/run-state tests/unit/statistics
npm run test:e2e -- --grep "HUD|restart|complete"
npm run build
```

Manual smoke: die and restart three times, use a shortened test timer to complete a run, and confirm every displayed value resets correctly.

Exit gate: both run endings are understandable and restart produces the same baseline as a fresh page load.

## Phase 6 — Horde shrine and V0.1 hardening

**Commit:** `feat(v0.1): add the Horde shrine and harden the milestone`

Deliver:

- Place a discoverable Horde shrine and show an interaction prompt in range.
- Activate it with E or Space only once, spawning 100 tagged enemies over 20 seconds.
- Award +50% XP only for enemies created by that shrine and make the source/modifier explicit in data.
- Add clear activation feedback and expose surge progress in debug telemetry.
- Tune only enough to make the base loop and shrine risk legible; record all tuning assumptions.
- Exercise entity cleanup, spawn caps/back-pressure, audio-free feedback density, and stable restart during/after a surge.
- Finish the V0.1 browser critical-path test and update README controls/run instructions.

Short verification:

```text
npm test -- --run
npm run typecheck
npm run build
npm run test:e2e
```

Manual smoke: activate the shrine early and late, verify exactly 100 scheduled spawns and bonus XP attribution, then die/restart during a surge and confirm no old timers or enemies leak into the new run.

Exit gate: all eight V0.1 acceptance points pass, the full short suite is green, and no open V0.1-blocking item remains in reconciliation.

## Pull request acceptance

The single V0.1 pull request is ready for review when:

- All six phase commits are present in order and individually understandable.
- CI and the Phase 6 verification suite pass from a clean checkout.
- The PR description lists scope, controls, verification commands, known limitations, and deferred V0.2 work.
- `RECONCILIATION.md` reflects what was actually built, including changed assumptions and unresolved non-blockers.
- No secrets, generated build output, test videos, or dependency directories are committed.

## Explicitly deferred

Runner, Tank, Broodmother, overcrit tiers, piercing momentum, explosions, fracture, bloodlust, chains, curses, non-Horde shrines, full Chaos scaling, elites, audio, damage breakdown, persistence, bosses, additional weapons, endless mode, and production deployment belong to later milestones.
