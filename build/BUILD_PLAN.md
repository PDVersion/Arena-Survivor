# Arena Survivor V0.1 Build Plan

This is the implementation plan for the product vision in [`PLAN.md`](./PLAN.md). It deliberately turns the broad design into a small, testable first playable. Every work session must read this file and then [`../RECONCILIATION.md`](../RECONCILIATION.md) before making changes.

## Delivery contract

- Build all of V0.1 on `codex/v0.1` and deliver it as one pull request into `main`.
- Treat the planning/workflow commit as the branch baseline; the six numbered implementation phases follow it.
- Complete phases in order. Each numbered phase ends in one sizeable, reviewable commit.
- A phase includes its implementation, automated tests, documentation/status updates, and reconciliation notes.
- Run the phase's short verification before committing. Do not start the next phase while it is red.
- Prefer deterministic tests for game rules and a small browser smoke suite for Phaser integration.
- Build every content feature through the modular theme/archetype boundary in [`THEME_ARCHETYPES.md`](./THEME_ARCHETYPES.md); do not postpone that boundary until a later retheme.
- Defer V0.2/V0.3 features unless they are strictly required to keep the architecture extensible.

## Phase tracker

Update this tracker in the corresponding phase commit. Add the commit hash after the commit exists in the next phase's status update or in the pull request description.

- [x] Phase 1 — Project foundation and browser boot (`ed9dea2`)
- [x] Phase 2 — Arena, player movement, and run state (`d8a4ce6`; CI fix `73c6847`)
- [x] Phase 3 — Grunt swarm and Needle combat (`1a554e6`; runtime fix `3f4f39a`; CI fix `8a28568`)
- [x] Phase 4 — XP, levels, and data-driven upgrades
- [ ] Phase 5 — HUD, run completion, and restart loop
- [ ] Phase 6 — Horde shrine and V0.1 hardening

### Phase 1 outcome — 2026-08-12

Phase 1 is implemented and manually accepted. Type-checking, focused content/architecture tests, lint, the production build, the Chromium boot/resize smoke test, and the dependency audit pass. Manual verification confirmed one canvas loads and resizes without console errors.

Implementation notes relative to the original plan:

- The Phase 1 manifest establishes every stable V0.1 ID and its centralized presentation copy, but only the starter-character behavioural definition is active. Weapon, enemy, pickup, shrine, upgrade-effect, stats, entity, system, state, and UI implementations remain in their scheduled phases rather than being speculative placeholders.
- The browser telemetry facade is installed only in Vite `test` mode. Production scenes call an inert bridge, allowing the same scene code to run without shipping `window.__ARENA_TEST__` or the alternate theme fixture.
- The responsive canvas container is viewport-anchored after the first browser smoke test exposed intrinsic canvas sizing inside the original centred grid layout.
- Initial toolchain pins were advanced to patched releases after `npm audit` found advisories. The committed lockfile reports zero known vulnerabilities as of completion.
- Phaser currently produces a non-blocking large-chunk build warning. The measured bundle and the point at which it should be revisited are recorded in `RECONCILIATION.md`; Phase 1 load and browser checks pass.

### Phase 2 outcome — 2026-08-12

Phase 2 is implemented and manually accepted on 2026-08-12. Its automated and localhost smoke gates pass: cardinal and normalized diagonal movement, opposing-input cancellation, body containment at arena edges, camera follow, pause/resume, frozen paused time, deterministic completion, reset, profile separation, and the Phase 1 boot/resize regression.

Implementation notes relative to the original plan:

- The initial arena is 2400×1600 world units. Phaser Arcade Physics owns the runtime body/world bounds while framework-independent functions own direction normalization and position-clamp rules.
- The active theme's starter-character definition now owns the complete V0.1 base-stat baseline. The generic player actor receives that definition and contains no knight-magic identity or tuning.
- Escape toggles the Phase 2 pause state. The run clock advances only while `playing`; paused and terminal states stop velocity and simulation time.
- Ephemeral run state and the future persistent profile boundary are separate serializable models. Both use stable character/theme IDs, while the profile reserves explicit profile/content schema versions without implementing storage early.
- Theme validation now treats missing runtime `baseStats` as a reported manifest issue rather than assuming compile-time typing makes malformed data impossible.
- Phase 2 adds approximately 4.7 kB minified / 1.0 kB gzip to the Phase 1 JavaScript baseline. The existing Phaser large-chunk warning remains non-blocking.
- Post-acceptance CI correction: the boundary browser smoke now traverses the shorter centre-to-top path with shared-runner timing headroom. The original centre-to-right test had an 8-second budget despite taking 7.8 seconds locally and timed out under GitHub Actions load; the physics assertion itself was unchanged.

### Phase 3 outcome — 2026-08-12

Phase 3 is implemented and its automated gates pass: theme/content validation, nearest targeting, deterministic normal/critical damage, pierce accounting, spawn caps, live auto-fire and collisions, exact-once kills, throttled contact damage, visible immunity, death, all earlier browser regressions, type-check, lint, and production build.

Implementation notes relative to the original plan:

- The active theme now owns the `enemy.swarm_basic` and `weapon.starter_projectile` definitions and their presentation tokens. Generic `EnemyActor` and `ProjectileActor` classes receive definitions; runtime logic uses stable IDs only.
- V0.1 crit rolls cap probability at 100% while the stat model preserves values above 100% for later overcrit rules. Each projectile rolls damage once when fired.
- Projectile hit identity is tracked per projectile, so one projectile cannot damage the same enemy twice; its hit budget is one base target plus configured pierce.
- Player contact immunity is global and simulation-time based: one contact hit can land per 1000 ms regardless of how many enemies overlap. The player marker dims during that interval.
- The provisional swarm baseline spawns one enemy every 400 ms on a deterministic ring 360 units from the player, with caps of 80 live enemies and 64 live projectiles. High-churn actors are destroyed on expiry/death and cannot grow beyond those caps.
- Phase 3 adds approximately 9.7 kB minified / 2.3 kB gzip to the Phase 2 JavaScript baseline. The existing Phaser large-chunk warning remains non-blocking.
- Manual-test correction: projectile velocity is now applied only after Arcade Physics group enrollment, active projectiles are cleared on death, and the browser suite tracks one projectile's ID/velocity/displacement so creation cannot be mistaken for firing.
- CI correction: GitHub Actions runs the real-time Chromium suite with one worker. Two concurrent Phaser simulations on the shared runner slowed combat, death, and boundary paths together enough to exhaust otherwise generous state-poll budgets; local Playwright runs retain automatic parallelism.

### Phase 4 outcome — 2026-08-12

Phase 4 is implemented and its automated gates pass: exact-once XP pickup claims, magnet/collection behavior, the explicit XP curve, multi-level overflow, queued choices, seeded distinct offers, all eight modifier categories, themed content validation, frozen live level-up presentation, input-driven selection/resume, all earlier unit/browser regressions, type-check, lint, and production build.

Implementation notes relative to the original plan:

- Each defeated basic swarm enemy drops one `pickup.experience` actor carrying its definition's XP reward. Stable runtime pickup IDs guard awards exactly once; collected actors are destroyed and removed from tracking.
- V0.1 uses a deliberately short linear curve of 2, 4, 6, 8… XP for successive levels. One award can cross multiple thresholds, retains overflow, and queues one mandatory choice per gained level.
- The active theme owns eight upgrades covering damage, attack speed, crit chance, pierce, projectile count, move speed, maximum health, and pickup radius. Reusable `stat.add` descriptors target stable player/weapon stat paths; presentation copy and tokens remain theme-owned.
- Level-up is a distinct frozen run state. Offers contain three unique choices selected by an injected seeded generator; keyboard or pointer selection applies the modifier, advances any queued choice, and resumes physics only when the queue is empty.
- The full-screen choice panel was made opaque after manual canvas inspection showed underlying arena copy reducing title readability. Manual smoke confirmed three clear themed choices and no browser warnings/errors.
- Phase 4 adds approximately 12.3 kB minified / 3.3 kB gzip to the Phase 3 JavaScript baseline. The existing Phaser large-chunk warning remains non-blocking.

## Resolved V0.1 scope

The design document's V0.1 list does not mention shrines, while its First Milestone requires one. V0.1 therefore includes one minimal **Shrine of the Horde** so the first playable demonstrates the game's defining player-controlled difficulty spike. Other shrine types, Chaos progression, curses, overcrit, chain reactions, extra enemies, audio, and portable save import/export remain later work.

The current fiction is a **knights-and-magic theme**. V0.1 builds it as the first interchangeable theme pack. Basic stats and reusable rules stay in core; characters, weapons, enemies, skills, upgrades, pickups, shrines, curses, names, tuning, and presentation references enter the game through stable archetype contracts and an active theme manifest.

V0.1 is complete when a player can:

1. Start a five-minute browser run, move with WASD or arrow keys, and remain within the arena.
2. Be followed and damaged by Grunts, die, and restart without reloading the page.
3. Automatically target and shoot the nearest enemy with the Needle.
4. Deal normal or critical damage, pierce enemies, kill them, and collect their XP.
5. Level up, pause the action, choose one of three upgrades, and see the selected stat affect play.
6. Activate one Horde shrine with E or Space, create a visible spawn surge, and receive bonus XP from its spawned enemies.
7. Read health, XP, level, timer, kill count, and live enemy count from the HUD.
8. Reach either death or the five-minute completion state and start a fresh run with reset state.
9. Pass a theme-boundary test that swaps in alternate test labels/tokens without changing simulation code or outcomes.

## Technical baseline

- TypeScript, Phaser, and Vite, as selected by the design document.
- Vitest for deterministic unit tests of stats, damage, targeting rules, XP, upgrades, and run state.
- Playwright with Chromium for a thin end-to-end suite covering boot and the critical playable path.
- `npm run dev`, `npm run build`, `npm test -- --run`, and `npm run test:e2e` are the standard commands.
- Use simple generated geometry and placeholder effects in V0.1; external art and audio are not prerequisites.
- Validate the active theme manifest during tests/build and fail clearly on duplicate IDs, missing copy, broken content references, invalid values, or unsupported effects.
- Keep profile/progression data serializable and separate from Phaser runtime objects. Persisted references use stable IDs and explicit schema versions in preparation for the portable save system in [`SAVE_DATA.md`](./SAVE_DATA.md).
- Expose a read-only, test-build-only telemetry seam (for example `window.__ARENA_TEST__`) so browser tests can assert player, enemy, run, and pause state without depending on pixels or timing guesses. It must not ship in production builds.

## Intended code shape

Keep Phaser objects thin and put reusable rules in framework-independent modules.

```text
src/
  main.ts
  game/
    config.ts
    core/
      stats/        Theme-neutral stats, formulas, and modifiers
      archetypes/   Stable IDs, contracts, and reusable effect descriptors
    content/
      active-theme.ts
      define-theme.ts
      themes/
        knight-magic/  Manifest, copy, tokens, and category definitions
    scenes/       Boot, run, and overlay/end-state coordination
    entities/     Generic configured actors: player, enemy, projectile, pickup, shrine
    systems/      Spawning, targeting, combat, XP, upgrades, run lifecycle
    state/        Typed run state, profile boundary, and statistics
    ui/           HUD and level-up choice UI
  test-support/   Browser telemetry/instrumentation, excluded from production
tests/
  unit/
  e2e/
```

Core owns primitive stats, formulas, stable semantic IDs, and reusable effect contracts. The active theme owns content definitions, tuning, player-facing copy, and presentation references. Systems own rules. Scenes coordinate systems and rendering. UI resolves copy from the active theme, reads state, and emits explicit choices; it does not contain themed strings, combat, or progression rules.

Run state and future persistent profile state are distinct. Neither contains Phaser/DOM instances, and all cross-content references use stable IDs. V0.1 does not implement persistence or import/export UI; it avoids state shapes that would make the planned text-save codec and migrations invasive later.

### Theme boundary

- Stable IDs describe roles such as `enemy.swarm_basic` and `weapon.starter_projectile`; current labels such as “Grunt” and “Magic Bolt” are theme data.
- `content/active-theme.ts` is the only selection point. Systems, scenes, entities, and UI must not deep-import a concrete theme.
- `themes/knight-magic/index.ts` is the root source reference, while `copy.ts` centralizes all names/descriptions and category files isolate behavioural changes.
- Generic runtime actors receive definitions; avoid current-theme classes such as `Grunt` or `MagicBolt`.
- A tiny alternate test fixture proves replaceability without adding a second production theme.
- See [`THEME_ARCHETYPES.md`](./THEME_ARCHETYPES.md) for ownership, naming, validation, and retheme workflows.

## Phase 1 — Project foundation and browser boot

**Commit:** `build(v0.1): bootstrap the Phaser game`

Deliver:

- Initialize the Vite + TypeScript project and pin required dependencies.
- Add Phaser game configuration, a boot/run scene, canvas sizing, and resize handling.
- Add stable archetype ID/contracts, a typed theme constructor, active-theme facade, knight-magic root manifest, centralized copy/tokens, and only the V0.1 category hooks needed initially.
- Add manifest validation and a tiny alternate test fixture proving labels/tokens can change without changing engine behaviour.
- Enforce import boundaries so systems/scenes/UI cannot deep-import a concrete theme package.
- Add Vitest, Playwright, lint/type-check scripts, and the test-only telemetry seam.
- Render a placeholder arena and a clear loading/boot failure rather than a blank page.
- Add a minimal CI workflow that runs type-check, unit tests, production build, and browser smoke test.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/content tests/unit/architecture
npm run build
npm run test:e2e -- --grep "boots"
```

Manual smoke: open `npm run dev`, confirm one canvas appears and resizes without console errors.

Exit gate: a clean checkout can install, validate the knight-magic and test manifests, build, test, and display the themed arena in Chromium without a concrete-theme import outside the content selection layer.

## Phase 2 — Arena, player movement, and run state

**Commit:** `feat(v0.1): add arena movement and run state`

Deliver:

- Add the large bounded arena, player body, eight-direction WASD/arrow movement, and normalized diagonal speed.
- Follow the player with the camera while keeping the player inside arena boundaries.
- Introduce typed, resettable run state with theme-neutral base stats from the design plan and a starter-character definition resolved from the active theme.
- Separate ephemeral run state from the serializable profile/progression boundary; use stable IDs for content references and reserve explicit schema-version ownership for future persistence.
- Start the five-minute timer and distinguish `playing`, `paused`, `dead`, and `complete` states.
- Ensure pause/end state stops movement and simulation time cleanly.

Short verification:

```text
npm test -- --run tests/unit/player tests/unit/run-state
npm run test:e2e -- --grep "movement|boundaries|pause"
npm run build
```

Manual smoke: move in every direction, press opposing inputs, hit each boundary, and confirm the camera follows smoothly.

Exit gate: movement is predictable, the player cannot leave the arena, a new run always starts from the same clean state, and the generic player actor receives its current identity/presentation from the active theme.

## Phase 3 — Grunt swarm and Needle combat

**Commit:** `feat(v0.1): add grunt swarm and projectile combat`

Deliver:

- Define `enemy.swarm_basic` and `weapon.starter_projectile` inside the knight-magic pack (currently Grunt and Magic Bolt/Needle), then configure generic enemy/projectile actors from those definitions.
- Apply throttled contact damage with a visible invulnerability interval; reaching zero health enters `dead`.
- Auto-target the nearest valid enemy, fire projectiles, and handle projectile lifetime/collision.
- Implement deterministic damage, uncapped crit chance representation, V0.1 crit rolls, and basic pierce consumption.
- Kill and remove enemies safely, increment kill/live counters, and avoid double-hit/double-death accounting.
- Pool or otherwise cap high-churn projectiles/enemies so later swarm work has a stable base.

Short verification:

```text
npm test -- --run tests/unit/combat tests/unit/targeting tests/unit/spawning
npm test -- --run tests/unit/content
npm run test:e2e -- --grep "combat|death"
npm run build
```

Manual smoke: let Grunts surround the player, confirm damage is throttled, watch the Needle retarget, and verify a piercing shot can hit multiple enemies once each.

Exit gate: enemies can spawn, chase, damage, be shot, crit, be pierced, die exactly once, and end the run by killing the player; none of those rules branch on “Grunt,” “Needle,” or other themed strings.

## Phase 4 — XP, levels, and data-driven upgrades

**Commit:** `feat(v0.1): add progression and upgrade choices`

Deliver:

- Drop one XP pickup per Grunt, support pickup radius, and magnet/collect it without duplicate awards.
- Add an explicit XP curve, multi-level overflow handling, player level, and XP progress.
- Pause gameplay on level-up and present three distinct valid choices.
- Add a small V0.1 upgrade pool to the theme manifest covering damage, attack speed, crit chance, pierce, projectile count, move speed, health, and pickup radius; effects use reusable core modifier descriptors while names/descriptions come from theme copy.
- Apply choices through stat modifiers, resume safely, and queue another choice if one XP award crossed multiple levels.
- Make seeded/random selection injectable so unit and browser tests are repeatable.

Short verification:

```text
npm test -- --run tests/unit/xp tests/unit/upgrades tests/unit/stats
npm test -- --run tests/unit/content
npm run test:e2e -- --grep "level up|upgrade"
npm run build
```

Manual smoke: collect XP, choose each upgrade category across short runs, and confirm the game remains frozen until a choice is made.

Exit gate: XP cannot be counted twice, level overflow is retained, three themed choices appear, and the chosen upgrade has an observable gameplay effect independent of its display name.

## Phase 5 — HUD, run completion, and restart loop

**Commit:** `feat(v0.1): complete the playable run loop`

Deliver:

- Add readable health, XP, level, timer, kill count, and live enemy count HUD elements.
- Resolve all player-facing content names/descriptions and presentation tokens from the active theme; keep generic HUD labels in a theme-level vocabulary catalog where a future theme may rename them.
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
- Define it by the stable `shrine.spawn_surge` role in the knight-magic pack and configure a generic shrine actor from that definition.
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

Exit gate: all nine V0.1 acceptance points pass, the full short suite is green, a rename-only test changes presentation without simulation edits, and no open V0.1-blocking item remains in reconciliation.

## Pull request acceptance

The single V0.1 pull request is ready for review when:

- All six phase commits are present in order and individually understandable.
- CI and the Phase 6 verification suite pass from a clean checkout.
- The PR description lists scope, controls, verification commands, known limitations, and deferred V0.2 work.
- `RECONCILIATION.md` reflects what was actually built, including changed assumptions and unresolved non-blockers.
- Theme validation passes, the knight-magic manifest is the only production theme selection, and no current themed name is used as a behavioural key.
- No secrets, generated build output, test videos, or dependency directories are committed.

## Explicitly deferred

Runner, Tank, Broodmother, overcrit tiers, piercing momentum, explosions, fracture, bloodlust, chains, curses, non-Horde shrines, full Chaos scaling, elites, audio, damage breakdown, persistence and portable save import/export, bosses, additional weapons, endless mode, a second production theme, and production deployment belong to later milestones. The theme contracts, stable IDs, and serializable state boundary start in V0.1; the deferred persistence adapters, codec, migrations, and UI do not.
