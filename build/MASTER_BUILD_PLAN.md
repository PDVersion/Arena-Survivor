# Master build plan — completed implementation record

## Owner direction — Knights and Magic paused indefinitely

Effective 2026-10-22: all further `knight-magic` theme development is paused
indefinitely. Only the owner explicitly reopening the theme can end this pause;
a new milestone, generic parity rule, old plan or failing themed test cannot.
Do not plan or implement its content, tuning, names/copy, sprites, features or
new dedicated acceptance campaigns. Preserve its existing files and historical
records. Existing generic contract tests may read the frozen pack; a change that
would require editing it must be recorded and deferred until explicit reopening,
rather than silently expanding this scope. Continue eco-guardian through stable
core contracts. This overrides older instructions to keep both packs in step.


This is the single build-plan record for work already delivered and verified.
[BUILD_STATUS.md](BUILD_STATUS.md) owns milestone dates, completion/merge state
and current acceptance limits. Completed V0.4.3 records are below; ongoing work remains in
[V0.4 sequence](BUILD_PLAN_V0.4.md), [V0.4.4 sprites](SPRITE_PLAN_V0.4.4.md) and
the [optional roadmap](AUTONOMOUS_DEVELOPMENT_PLAN.md). No unfinished content or
full-roster sprite target is promoted to completed work by this consolidation.

The historical phase specifications, ownership, outcomes and verification
conventions below are retained for traceability. Earlier values, theme names,
viewport assumptions and proposed APIs may have been superseded by later
sections, reconciliation and current code. Historical test commands are records,
not instructions to rerun full local browsers: AGENTS.md's resource policy
overrides them. No old device/performance result establishes current acceptance.
The former individual plans are recoverable in Git history before this
consolidation; duplicate plan files are removed rather than maintained in parallel.

## Current verified progress checkpoint —2026-10-23

**Sprite generation is complete:27/27 selected subjects,102 frames,31 preserved
style2 attempts.** Audit independently checks all27 native formats, recorded
source/output/reference hashes and deterministic rebuilds. Only Takeaway Cup is
live style2 draft;26 remain review-only and owner art acceptance remains open.
Five original style1 sheets still ship; Shards reuses old Glass death art.

| Work | Current disposition |
| --- | --- |
| P0–P6 software, C1–C7, Q6/G1–G4 |Completed scoped records below; external limits retained|
| All selected sprite generation |Complete;11enemies,1player,3tools,1pickup,5sites,3hazards,3icons|
| Vacuum suction/claws, attack-radius setting, Escape quit |Implemented and scoped verified|
| Takeaway Cup ranged enemy/sprite |Live draft/software verified; art and longer pacing review open|
| Remaining art approval/integration and V0.4.4 acceptance |Open; active plan owns next steps|
| Broad current-head CI/delivery and external device coverage |No new evidence in this audit; do not infer a pass|
| Knights and Magic |Paused indefinitely until explicit owner reopening|

[Audit report](sprites/review/style2/PROGRESS_REPORT.md) separates completed work,
known individual art issues and optional future proposals. [Active sprite plan](SPRITE_PLAN_V0.4.4.md)
owns remaining execution; [handoff](NEXT_READABLE_GAMEPLAY_HANDOFF.md) stays current.
This documentation/file audit changes no assets, runtime, tuning or save data.

## Contents

- [Sprite progress audit —27/27 generated](#sprite-progress-audit-2026-10-23)

- [V0.1 — First playable](#v0-1)
- [V0.2 — Interaction milestone](#v0-2)
- [V0.3 and V0.3.1 — Architecture, balance and corrections](#v0-3)
- [V0.4.0 — Optional-sprite seam](#v0-4-0)
- [V0.4.1 — Five-sheet sprite checkpoint and pipeline](#v0-4-1)
- [V0.4.2 — Readability, pace and Cleanup Grabber](#v0-4-2)
- [V0.4.2.1 — Contact and material families](#v0-4-2-1)
- [V0.4.3 — Completed Q1–Q5 corrections](#v0-4-3-corrections)
- [V0.4.3 — Completed P0–P4 performance slices](#v0-4-3-performance)
- [V0.4.3 — Verified P5 lifecycle and startup slices](#v0-4-3-p5-slices)
- [V0.4.3 — Verified PR #25 CI repair](#v0-4-3-ci-repair)
- [V0.4.3 — C2 same-slot evolution](#v0-4-3-c2)
- [V0.4.3 — C3 shrines and curses](#v0-4-3-c3)
- [V0.4.3 — C6 local profile and unlocks](#v0-4-3-c6)
- [Readable gameplay — completed Q6 and G1–G4](#readable-gameplay)
- [V0.4.3 original phase specification and delivery history](#v0-4-3-source-plan)
- [Readable gameplay design context and sources](#readable-gameplay-design-context)
- [Original performance session sequencing](#performance-original-sequencing)
- [Superseded sprite style1 / inventory](#sprite-style1-history)
- [Superseded content session estimates](#content-original-session-estimates)

<a id="v0-1"></a>
## V0.1 — First playable

<a id="v0-1-delivery-contract"></a>
### Delivery contract

- Build all of V0.1 on `codex/v0.1` and deliver it as one pull request into `main`.
- Treat the planning/workflow commit as the branch baseline; the six numbered implementation phases follow it.
- Complete phases in order. Each numbered phase ends in one sizeable, reviewable commit.
- A phase includes its implementation, automated tests, documentation/status updates, and reconciliation notes.
- Run the phase's short verification before committing. Do not start the next phase while it is red.
- Prefer deterministic tests for game rules and a small browser smoke suite for Phaser integration.
- Build every content feature through the modular theme/archetype boundary in [`THEME_ARCHETYPES.md`](./THEME_ARCHETYPES.md); do not postpone that boundary until a later retheme.
- Defer V0.2/V0.3 features unless they are strictly required to keep the architecture extensible.

<a id="v0-1-phase-tracker"></a>
### Phase tracker

Update this tracker in the corresponding phase commit. Add the commit hash after the commit exists in the next phase's status update or in the pull request description.

- [x] Phase 1 — Project foundation and browser boot (`ed9dea2`)
- [x] Phase 2 — Arena, player movement, and run state (`d8a4ce6`; CI fix `73c6847`)
- [x] Phase 3 — Grunt swarm and Needle combat (`1a554e6`; runtime fix `3f4f39a`; CI fix `8a28568`)
- [x] Phase 4 — XP, levels, and data-driven upgrades (`36c293c`)
- [x] Phase 5 — HUD, run completion, and restart loop (`c07dd5d`)
- [x] Phase 6 — Horde shrine and V0.1 hardening (`a96802c`)

<a id="v0-1-phase-1-outcome--2026-08-12"></a>
#### Phase 1 outcome — 2026-08-12

Phase 1 is implemented and manually accepted. Type-checking, focused content/architecture tests, lint, the production build, the Chromium boot/resize smoke test, and the dependency audit pass. Manual verification confirmed one canvas loads and resizes without console errors.

Implementation notes relative to the original plan:

- The Phase 1 manifest establishes every stable V0.1 ID and its centralized presentation copy, but only the starter-character behavioural definition is active. Weapon, enemy, pickup, shrine, upgrade-effect, stats, entity, system, state, and UI implementations remain in their scheduled phases rather than being speculative placeholders.
- The browser telemetry facade is installed only in Vite `test` mode. Production scenes call an inert bridge, allowing the same scene code to run without shipping `window.__ARENA_TEST__` or the alternate theme fixture.
- The responsive canvas container is viewport-anchored after the first browser smoke test exposed intrinsic canvas sizing inside the original centred grid layout.
- Initial toolchain pins were advanced to patched releases after `npm audit` found advisories. The committed lockfile reports zero known vulnerabilities as of completion.
- Phaser currently produces a non-blocking large-chunk build warning. The measured bundle and the point at which it should be revisited are recorded in `RECONCILIATION.md`; Phase 1 load and browser checks pass.

<a id="v0-1-phase-2-outcome--2026-08-12"></a>
#### Phase 2 outcome — 2026-08-12

Phase 2 is implemented and manually accepted on 2026-08-12. Its automated and localhost smoke gates pass: cardinal and normalized diagonal movement, opposing-input cancellation, body containment at arena edges, camera follow, pause/resume, frozen paused time, deterministic completion, reset, profile separation, and the Phase 1 boot/resize regression.

Implementation notes relative to the original plan:

- The initial arena is 2400×1600 world units. Phaser Arcade Physics owns the runtime body/world bounds while framework-independent functions own direction normalization and position-clamp rules.
- The active theme's starter-character definition now owns the complete V0.1 base-stat baseline. The generic player actor receives that definition and contains no knight-magic identity or tuning.
- Escape toggles the Phase 2 pause state. The run clock advances only while `playing`; paused and terminal states stop velocity and simulation time.
- Ephemeral run state and the future persistent profile boundary are separate serializable models. Both use stable character/theme IDs, while the profile reserves explicit profile/content schema versions without implementing storage early.
- Theme validation now treats missing runtime `baseStats` as a reported manifest issue rather than assuming compile-time typing makes malformed data impossible.
- Phase 2 adds approximately 4.7 kB minified / 1.0 kB gzip to the Phase 1 JavaScript baseline. The existing Phaser large-chunk warning remains non-blocking.
- Post-acceptance CI correction: the boundary browser smoke now traverses the shorter centre-to-top path with shared-runner timing headroom. The original centre-to-right test had an 8-second budget despite taking 7.8 seconds locally and timed out under GitHub Actions load; the physics assertion itself was unchanged.

<a id="v0-1-phase-3-outcome--2026-08-12"></a>
#### Phase 3 outcome — 2026-08-12

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

<a id="v0-1-phase-4-outcome--2026-08-12"></a>
#### Phase 4 outcome — 2026-08-12

Phase 4 is implemented and its automated gates pass: exact-once XP pickup claims, magnet/collection behavior, the explicit XP curve, multi-level overflow, queued choices, seeded distinct offers, all eight modifier categories, themed content validation, frozen live level-up presentation, input-driven selection/resume, all earlier unit/browser regressions, type-check, lint, and production build.

Implementation notes relative to the original plan:

- Each defeated basic swarm enemy drops one `pickup.experience` actor carrying its definition's XP reward. Stable runtime pickup IDs guard awards exactly once; collected actors are destroyed and removed from tracking.
- V0.1 uses a deliberately short linear curve of 2, 4, 6, 8… XP for successive levels. One award can cross multiple thresholds, retains overflow, and queues one mandatory choice per gained level.
- The active theme owns eight upgrades covering damage, attack speed, crit chance, pierce, projectile count, move speed, maximum health, and pickup radius. Reusable `stat.add` descriptors target stable player/weapon stat paths; presentation copy and tokens remain theme-owned.
- Level-up is a distinct frozen run state. Offers contain three unique choices selected by an injected seeded generator; keyboard or pointer selection applies the modifier, advances any queued choice, and resumes physics only when the queue is empty.
- The full-screen choice panel was made opaque after manual canvas inspection showed underlying arena copy reducing title readability. Manual smoke confirmed three clear themed choices and no browser warnings/errors.
- Phase 4 adds approximately 12.3 kB minified / 3.3 kB gzip to the Phase 3 JavaScript baseline. The existing Phaser large-chunk warning remains non-blocking.

<a id="v0-1-phase-5-outcome--2026-08-12"></a>
#### Phase 5 outcome — 2026-08-12

Phase 5 is implemented and its automated gates pass: deterministic HUD selection/formatting, complete theme-owned vocabulary, live HUD values, distinct death/completion overlays, pointer and keyboard restart actions, repeated same-page reset, test-shortened completion, focus-loss freezing/resume, resize coherence, feedback instrumentation, all earlier unit/browser regressions, type-check, lint, and production build.

Implementation notes relative to the original plan:

- A fixed-camera HUD shows themed labels for health, XP, level, remaining time, kills, and live enemies. Generic vocabulary and both ending messages live in the active theme copy catalog and are validated for alternate manifests.
- Death and completion share a generic overlay implementation but resolve distinct theme-owned titles/messages. R, Enter, and a visible pointer action reconstruct the run without page navigation.
- Restart explicitly rebuilds all Phaser actors/groups, input bindings, timers, counters, seeded offer randomness, modifiers, UI, feedback counters, and claimed pickup identities. Arcade Physics resumes before scene shutdown; accessing its world after shutdown is invalid.
- Test mode alone accepts a positive `runDurationMs` query for deterministic completion coverage. Production always retains the five-minute default.
- V0.1 feedback now includes enemy/player hit flashes, short capped projectile trails, critical projectile scaling, pickup collection tweens, and level-up title emphasis. Rendering remains downstream of simulation state.
- Focus loss pauses only an actively playing run and focus restores only that focus-created pause; manual Escape pauses are never auto-resumed. Camera-fixed overlay children use screen-space pointer bounds to remain interactive after camera travel and resize.
- Local Playwright concurrency is capped at four after nine simultaneous Phaser canvases starved the live level-up path once; CI remains serial. The complete 12-test Chromium suite passes with four workers.
- Phase 5 adds approximately 8.9 kB minified / 2.1 kB gzip to the Phase 4 JavaScript baseline. The existing Phaser large-chunk warning remains non-blocking.

<a id="v0-1-phase-6-outcome--2026-08-12"></a>
#### Phase 6 outcome — 2026-08-12

Phase 6 is implemented and the complete V0.1 gate passes: stable theme-owned shrine content, discoverable interaction, exact-once activation, 100 deterministic surge slots over 20 seconds, capped back-pressure, source-tagged +50% XP through collection, activation feedback, telemetry, active-surge restart cleanup, the rename-only theme boundary, all 45 unit tests, all 14 Chromium paths, type-check, lint, production build, and dependency audit.

Implementation notes relative to the original plan:

- The active theme defines `shrine.spawn_surge`; a generic star-shaped shrine actor receives its mechanics, token, label, and prompt without importing knight-magic content into simulation code.
- Surge slots are derived from elapsed simulation time instead of wall-clock timers. Capacity pressure retains due work rather than dropping it, shrine work gets first use of the existing 80-enemy cap each frame, and the scheduler finishes only after all 100 tagged enemies have spawned.
- Enemy and XP-pickup runtime data carry an explicit spawn/reward source. Shrine enemies use a `1.5` multiplier and fractional XP is preserved through award and statistics formatting, so small base rewards remain exactly 50% larger.
- Restart reconstructs the shrine actor, scheduler, tagged actors, counters, and input bindings with the rest of the run. Browser coverage restarts during a live surge and proves that no scheduled work or tagged reward state leaks into the next generation.
- The nearby shrine and range prompt were visually inspected in Chromium. Automated early and late activation, repeated-input rejection, exact scheduling, reward collection, high-density feedback, and active-surge restart cover the interaction paths that require precise telemetry.
- Phase 6 adds approximately 6.3 kB minified / 1.4 kB gzip to the Phase 5 JavaScript baseline. The existing Phaser large-chunk warning remains non-blocking.
- Post-acceptance CI correction: shrine reward integration asserts the deterministic tagged reward created per defeated shrine enemy instead of assuming a distant pickup reaches an idle player. Short test-mode completion paths pause immediately after restart before inspecting reset state, and hosted-runner completion polls include explicit simulation-time headroom.

<a id="v0-1-resolved-v01-scope"></a>
### Resolved V0.1 scope

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

<a id="v0-1-technical-baseline"></a>
### Technical baseline

- TypeScript, Phaser, and Vite, as selected by the design document.
- Vitest for deterministic unit tests of stats, damage, targeting rules, XP, upgrades, and run state.
- Playwright with Chromium for a thin end-to-end suite covering boot and the critical playable path.
- `npm run dev`, `npm run build`, `npm test -- --run`, and `npm run test:e2e` are the standard commands.
- Use simple generated geometry and placeholder effects in V0.1; external art and audio are not prerequisites.
- Validate the active theme manifest during tests/build and fail clearly on duplicate IDs, missing copy, broken content references, invalid values, or unsupported effects.
- Keep profile/progression data serializable and separate from Phaser runtime objects. Persisted references use stable IDs and explicit schema versions in preparation for the portable save system in [`SAVE_DATA.md`](./SAVE_DATA.md).
- Expose a read-only, test-build-only telemetry seam (for example `window.__ARENA_TEST__`) so browser tests can assert player, enemy, run, and pause state without depending on pixels or timing guesses. It must not ship in production builds.

<a id="v0-1-intended-code-shape"></a>
### Intended code shape

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

<a id="v0-1-theme-boundary"></a>
#### Theme boundary

- Stable IDs describe roles such as `enemy.swarm_basic` and `weapon.starter_projectile`; current labels such as “Grunt” and “Magic Bolt” are theme data.
- `content/active-theme.ts` is the only selection point. Systems, scenes, entities, and UI must not deep-import a concrete theme.
- `themes/knight-magic/index.ts` is the root source reference, while `copy.ts` centralizes all names/descriptions and category files isolate behavioural changes.
- Generic runtime actors receive definitions; avoid current-theme classes such as `Grunt` or `MagicBolt`.
- A tiny alternate test fixture proves replaceability without adding a second production theme.
- See [`THEME_ARCHETYPES.md`](./THEME_ARCHETYPES.md) for ownership, naming, validation, and retheme workflows.

<a id="v0-1-phase-1--project-foundation-and-browser-boot"></a>
### Phase 1 — Project foundation and browser boot

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

<a id="v0-1-phase-2--arena-player-movement-and-run-state"></a>
### Phase 2 — Arena, player movement, and run state

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

<a id="v0-1-phase-3--grunt-swarm-and-needle-combat"></a>
### Phase 3 — Grunt swarm and Needle combat

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

<a id="v0-1-phase-4--xp-levels-and-data-driven-upgrades"></a>
### Phase 4 — XP, levels, and data-driven upgrades

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

<a id="v0-1-phase-5--hud-run-completion-and-restart-loop"></a>
### Phase 5 — HUD, run completion, and restart loop

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

<a id="v0-1-phase-6--horde-shrine-and-v01-hardening"></a>
### Phase 6 — Horde shrine and V0.1 hardening

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

<a id="v0-1-pull-request-acceptance"></a>
### Pull request acceptance

The single V0.1 pull request is ready for review when:

- All six phase commits are present in order and individually understandable.
- CI and the Phase 6 verification suite pass from a clean checkout.
- The PR description lists scope, controls, verification commands, known limitations, and deferred V0.2 work.
- `RECONCILIATION.md` reflects what was actually built, including changed assumptions and unresolved non-blockers.
- Theme validation passes, the knight-magic manifest is the only production theme selection, and no current themed name is used as a behavioural key.
- No secrets, generated build output, test videos, or dependency directories are committed.


<a id="v0-2"></a>
## V0.2 — Interaction milestone

<a id="v0-2-delivery-contract"></a>
### Delivery contract

- Begin implementation only from `main` after the complete V0.1 milestone has landed.
- Build V0.2 on `codex/v0.2` and deliver it as one pull request into `main`.
- Treat the V0.2 planning/workflow commit as the branch baseline; the seven numbered implementation phases follow it.
- Complete phases in order. Each numbered phase ends in one reviewable commit using the listed subject.
- Keep implementation, tests, plan status, and material reconciliation findings in the same phase commit.
- Run a phase's short verification before marking it complete or starting the next phase.
- Preserve all V0.1 acceptance paths unless a changed V0.2 requirement is explicitly recorded in reconciliation.
- Keep themed content behind the contracts in [`THEME_ARCHETYPES.md`](./THEME_ARCHETYPES.md).
- Keep persistent profile shapes compatible with [`SAVE_DATA.md`](./SAVE_DATA.md), but do not implement persistence or portable import/export in V0.2.

<a id="v0-2-phase-tracker"></a>
### Phase tracker

Add a completed phase's commit hash in the next phase status update or the pull request description.

- [x] Phase 1 — Interaction contracts, causal events, and load harness (`a7f343d`)
- [x] Phase 2 — Runner, Tank, and Broodmother roster (`52a16ea`)
- [x] Phase 3 — Overcrit tiers and Piercing Momentum (`1c170fb`)
- [x] Phase 4 — Explosions, Fracture, Bloodlust, and chain reactions (`57a1126`)
- [x] Phase 5 — Chaos, world multipliers, and additional shrines (`77f072c`)
- [x] Phase 6 — Baseline elites and audiovisual feedback (`48c7fe8`)
- [x] Phase 7 — Statistics, performance hardening, and V0.2 acceptance

<a id="v0-2-source-scope-and-resolved-boundaries"></a>
### Source scope and resolved boundaries

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
- V0.2 adds one theme-owned baseline elite treatment. Distinct elite modifiers remain a later-milestone scope; they are V0.4 after the V0.3 re-sequencing recorded in REC-043.
- V0.2 continues to deepen the starter weapon rather than adding weapons.
- Exact balance values not specified by the product plan are provisional, theme-owned, tested as data, and recorded in reconciliation when selected.

<a id="v0-2-v02-acceptance"></a>
### V0.2 acceptance

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

<a id="v0-2-architecture-carried-forward"></a>
### Architecture carried forward

V0.1's boundaries remain mandatory:

- stable IDs and reusable rule contracts belong to core;
- names, descriptions, tuning, effect composition, and presentation/audio tokens belong to the active theme;
- systems resolve rules without comparing player-facing strings;
- scenes coordinate systems and generic actors but do not deep-import a concrete theme;
- run and profile state remain serializable and contain no Phaser, DOM, timer, or callback objects;
- test telemetry is read-only, exists only in test builds, and never ships in production.

V0.2 extends that shape with four explicit seams.

<a id="v0-2-causal-combat-events"></a>
#### Causal combat events

Hits, deaths, spawns, explosions, splits, and reward awards carry stable runtime event/entity IDs plus source, parent, and effect IDs where relevant. An iterative event queue processes interactions; effects do not recursively call scene collision handlers. Each actor can claim a lethal transition and each configured on-kill effect at most once for the triggering death.

The queue may use a measured per-frame processing budget, but due work is retained as back-pressure rather than silently discarded. Technical entity/effect limits remain permitted for stability and must be observable in telemetry.

<a id="v0-2-modifier-resolution"></a>
#### Modifier resolution

Player, weapon, world, enemy, and reward modifiers are separate typed inputs. Additive and multiplicative stacking order is centralized and deterministic. Chaos is a value feeding declared multiplier curves; it is not a collection of scattered scene conditionals.

<a id="v0-2-statistics-provenance"></a>
#### Statistics provenance

Statistics consume committed simulation results, not rendered objects or physics callbacks. Damage records carry a stable source/effect category so totals and breakdowns reconcile exactly. High-water marks and chain counters update from the same authoritative events used by gameplay.

<a id="v0-2-feedback-consumers"></a>
#### Feedback consumers

Audio, particles, damage numbers, and camera effects consume committed events after simulation. They may aggregate, throttle, or omit presentation under load, but never alter or suppress simulation results. Audio begins only after a user gesture, respects mute/focus state, and limits concurrent voices.

<a id="v0-2-intended-code-evolution"></a>
### Intended code evolution

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

<a id="v0-2-phase-1--interaction-contracts-causal-events-and-load-harness"></a>
### Phase 1 — Interaction contracts, causal events, and load harness

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

<a id="v0-2-phase-2--runner-tank-and-broodmother-roster"></a>
### Phase 2 — Runner, Tank, and Broodmother roster

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

<a id="v0-2-phase-3--overcrit-tiers-and-piercing-momentum"></a>
### Phase 3 — Overcrit tiers and Piercing Momentum

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

<a id="v0-2-phase-4--explosions-fracture-bloodlust-and-chain-reactions"></a>
### Phase 4 — Explosions, Fracture, Bloodlust, and chain reactions

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

<a id="v0-2-phase-5--chaos-world-multipliers-and-additional-shrines"></a>
### Phase 5 — Chaos, world multipliers, and additional shrines

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

<a id="v0-2-phase-6--baseline-elites-and-audiovisual-feedback"></a>
### Phase 6 — Baseline elites and audiovisual feedback

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

<a id="v0-2-phase-7--statistics-performance-hardening-and-v02-acceptance"></a>
### Phase 7 — Statistics, performance hardening, and V0.2 acceptance

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

<a id="v0-2-pull-request-acceptance"></a>
### Pull request acceptance

The V0.2 pull request is ready for review when:

- all seven phase commits are present in order and individually understandable;
- V0.1 regressions and every V0.2 short verification pass from a clean checkout;
- CI passes without relying on retries;
- the PR description lists scope, controls/settings, verification, performance findings, known limitations, and deferred V0.3 work;
- `RECONCILIATION.md` reflects actual stacking, provenance, chain, elite, audio, and load decisions;
- theme validation passes and no current themed name is used as a behavioural key;
- production contains no test hooks, fixtures, telemetry globals, secrets, generated build output, test artifacts, or dependency directories.


<a id="v0-3"></a>
## V0.3 and V0.3.1 — Architecture, balance and corrections

This is the implementation plan for the milestone after the completed V0.2 interaction milestone. Where [`MASTER_BUILD_PLAN.md#v0-2`](./MASTER_BUILD_PLAN.md#v0-2) added mechanics, V0.3 makes the existing mechanics **feel** like a modern bullet-heaven: a progression curve that keeps climbing, enemies with physical presence, a procedural spawn director that escalates on a schedule, upgrade cards that state exactly what they do, and on-kill effects that grow with investment.

It also swaps the production theme to **environment/nature**, which becomes the primary fiction for the game from this milestone onward.

<a id="v0-3-why-this-milestone-exists"></a>
### Why this milestone exists

The V0.2 build is mechanically complete but reads as flat during play:

- levels arrive at a constant pace because the XP requirement is linear while XP income is not;
- enemies occupy the same pixel and the swarm reads as one blob rather than a crowd;
- enemies appear inside the visible screen;
- every enemy is worth roughly the same, so killing a Tank feels identical to killing a Grunt;
- difficulty only rises when the player activates a shrine, so a cautious run has a flat five minutes;
- upgrade cards say "Increase damage dealt" and never say by how much, from what, to what;
- Detonation is one fixed 96-unit, 15-damage blast forever, no matter how invested the build is.

Reference points for the target feel: Vampire Survivors, Risk of Rain 2, HoloCure. All three share a property this build does not yet have — **the same action performed at minute four is visibly and numerically bigger than at minute one**, and the game tells you so.

<a id="v0-3-relationship-to-the-product-plan"></a>
### Relationship to the product plan

[`PLAN.md`](./PLAN.md) previously described V0.3 as content growth — additional weapons, bosses, unlocks, persistence, endless mode. That list is **re-sequenced, not cancelled**: it is now the V0.4 section of `PLAN.md`, and V0.3 is this rebalancing milestone. Balancing the loop before adding more content to it is the cheaper order — every new weapon, boss, and unlock inherits whatever curve exists when it lands, and re-tuning them later costs more than tuning the core now.

The re-sequencing is already recorded: `PLAN.md` carries the new V0.3 and V0.4 sections, `SAVE_DATA.md` moves its export/import expectation to V0.4, and [REC-043](../RECONCILIATION.md) states the decision and its evidence.

<a id="v0-3-why-the-theme-swap-is-inside-this-milestone"></a>
### Why the theme swap is inside this milestone

The environment theme is now the primary fiction for the game, including the pure-fun stream — see [`EDUCATION_PIVOT.md`](./EDUCATION_PIVOT.md). That decision interacts directly with this milestone, because **every balance value V0.3 introduces is theme-owned data.**

If the swap landed after V0.3, the XP curve, spawn director, difficulty curves, body masses, and skill scaling would all be derived against knight-magic and then re-derived against environment content — the exact "tune it twice" cost this milestone was re-sequenced to avoid. So the swap lands in **Phase 2**, before any tuning phase, and everything after it is tuned once against the content that ships.

The swap is deliberately bounded: it re-skins and re-tunes the existing four enemy roles, one weapon, four shrines, and five skills. It adds **no new roles, no type system, and no knowledge layer**. Those are V0.4 and later.

<a id="v0-3-delivery-contract"></a>
### Delivery contract

- Begin from `main` after the merged V0.2 milestone.
- Build V0.3 on `claude/v0.3` and deliver it as one pull request into `main`. The `claude/` prefix records that this milestone is built with Claude Code; see the branch-naming convention in [`../AGENTS.md`](../AGENTS.md).
- Complete phases in order. Each numbered phase ends in one reviewable commit using the listed subject.
- Keep implementation, tests, plan status, and material reconciliation findings in the same phase commit.
- Run a phase's short verification before marking it complete or starting the next.
- Preserve all V0.1 and V0.2 acceptance paths unless a changed V0.3 requirement is explicitly recorded in reconciliation.
- Keep themed content behind the contracts in [`THEME_ARCHETYPES.md`](./THEME_ARCHETYPES.md). Every balance value introduced here is theme-owned data, never a literal inside a system or scene.
- Keep persistent shapes compatible with [`SAVE_DATA.md`](./SAVE_DATA.md).

<a id="v0-3-phase-tracker"></a>
### Phase tracker

- [x] Phase 1 — Tuning seams, balance simulator, and plan re-pointing (REC-045)
- [x] Phase 2 — Environment theme as the primary content pack (REC-046)
- [x] Phase 3 — Progression curve, per-role rewards, and upgrade tallies (REC-047)
- [x] Phase 4 — Procedural spawn director, fixed view, and off-screen spawning (REC-048)
- [x] Phase 5 — Physical presence, spatial index, and crowd separation (REC-052)
- [x] Phase 6 — Time and Chaos scaling, and arena hazards (REC-053)
- [x] Phase 7 — Skill levels, scaling Detonation, and upgrade pool repair (REC-054)
- [x] Phase 8 — Informative upgrade cards, pause menu, and HUD (REC-055)
- [x] Phase 9 — Impact feedback and terminal polish (REC-056)
- [x] Phase 10 — Survivability stats, pickup pressure, and the balance pass (REC-057)

<a id="v0-3-milestone-status"></a>
### Milestone status

**All ten phases complete.** Delivered across pull requests #14 through #17 on `claude/v0.3`.

| Measure | Start of V0.3 | End of V0.3 |
| --- | --- | --- |
| Unit tests | 83 | 282 |
| Browser paths | 27 | 47 |
| Production themes | 1 | 2 |
| Reconciliation entries | REC-042 | REC-057 |
| Frame time at 300 enemies | 20.35 ms avg | 23.70 ms avg |

Five defects were found and fixed that were not part of the original request: elites never appeared without a shrine; re-picking a skill wasted a level-up; `armour`, `regeneration`, and `luck` were validated but unread; the stress path asserted themed copy and CI could not catch it; and the weapon could not reach its own spawn ring after the ring moved.

Four things in this plan were wrong when written and were corrected from measurement rather than assumption. Each is recorded with its evidence: the XP curve was out by roughly a factor of five (REC-047), the engagement envelope was three coupled numbers rather than one (REC-049), separation's displacement clamp belonged on the frame total rather than per neighbour (REC-052), and the DPS budget could not be evaluated at all until a multiplicative build model existed (REC-057).

---

<a id="v0-3-findings-from-the-v02-code"></a>
## Findings from the V0.2 code

Each requested change below is anchored to what the code does today. These are the facts the plan is built on.

| # | Observation | Location |
| --- | --- | --- |
| 1 | `xpRequiredForLevel(level) = 2 + (level - 1) * 2` — strictly linear, so level 30 costs 15× level 1 while XP income grows far faster than that | `src/game/systems/xp.ts:20` |
| 2 | `selectedUpgradeIds` is an append-only list; nothing counts repeats and the end screen never shows upgrades | `src/game/state/run-state.ts:49`, `src/game/state/statistics.ts:44` |
| 3 | Enemies are added to a physics group with **no collider** — only two overlaps exist (player↔enemy, projectile↔enemy), so enemies fully interpenetrate | `src/game/scenes/run-scene.ts:334` |
| 4 | `SPAWN_RADIUS = 360` while a 1920×1080 window shows ±960×±540 of world, so spawns are always on screen; `pointOnSpawnRing` then *clamps* into the arena, dragging edge spawns even closer | `src/game/scenes/run-scene.ts:66`, `src/game/systems/spawning.ts:18` |
| 5 | XP rewards are per-definition (1 / 1 / 4 / 3) but never scale with run time, enemy buffs, or role beyond that constant | `src/game/content/themes/knight-magic/enemies.ts` |
| 6 | Enemy health scales only with Chaos (`1 + 0.20p`); elapsed time contributes nothing | `src/game/systems/chaos/world-modifiers.ts:48` |
| 7 | Level-up cards render `name\ndescription` only; no numbers, no level, no new-vs-repeat indicator | `src/game/ui/level-up-choice-ui.ts:61` |
| 8 | Spawn cadence is a constant `SPAWN_INTERVAL_MS = 400` divided by the shrine/Chaos multiplier; roster gating is `unlockAtMs` at 8 s / 16 s / 24 s, so the full roster is present within half a minute | `src/game/scenes/run-scene.ts:65`, `enemies.ts` |
| 9 | Pause sets a status and prints one HUD string; there is no pause UI | `src/game/scenes/run-scene.ts:1394`, `src/game/ui/hud.ts:52` |
| 10 | Detonation is a boolean skill with one fixed `{ radius: 96, damage: 15 }`; damage is flat regardless of what died | `src/game/content/themes/knight-magic/skills.ts:9` |
| ★ | `eliteChance = min(0.4, (chaos - 1) * 0.04)` → **zero elites** in any run without shrine activation | `world-modifiers.ts:58` |
| ★ | `selectUpgradeChoices` draws uniformly from all 13 upgrades with no filtering; re-picking an already-enabled skill is a **completely wasted level-up** | `src/game/systems/upgrades.ts:36`, `upgrades.ts:65` |
| ★ | `armour`, `regeneration`, and `luck` exist in `PlayerBaseStats` and are validated, but **no system reads them** — contact damage is applied raw | `player-stats.ts`, `run-scene.ts:1276` |
| ★ | Invulnerability is one global `lastContactDamageAtMs`, so standing in a crowd of 40 costs the same health as touching one Grunt | `run-scene.ts:161` |
| ★ | Every kill drops a pickup actor with no cap, so a 300-enemy chain produces a pickup storm | `run-scene.ts:1187` |
| ★ | `targetsWithinRadius` and `findNearestTarget` are O(n) scans over all live enemies, called per explosion and per shot | `on-kill-effects.ts:14`, `targeting.ts` |

---

<a id="v0-3-v03-acceptance"></a>
## V0.3 acceptance

V0.3 is complete when a player can:

1. Complete every V0.1 and V0.2 path without regression, against the environment theme.
2. Play the environment theme as the production fiction, with knight-magic retained as a second real theme that still passes rename-only validation.
3. Watch level-ups start fast and visibly slow into deliberate milestones, while per-kill XP visibly grows, so late levels feel earned rather than automatic.
4. See a per-upgrade tally on the run-end screen showing each upgrade taken and how many times.
5. Push through a crowd where small enemies bunch and overlap slightly, large enemies block movement, and neither the player nor enemies pass through a durable enemy.
6. Never see an enemy appear inside the visible viewport during normal play, at any supported window size.
7. Earn clearly different rewards from each enemy role and from elites, with tougher late-run variants worth more than early ones.
8. Face enemies that get measurably tougher as the timer runs down and as Pollution rises, from one declared curve.
9. Watch the roster unlock on telegraphed milestones, with Pollution raising both rate and the share of dangerous roles — all derived from curves, so a run of any length needs no new authoring.
10. Encounter two or three arena hazards that create map variety and interact with movement and positioning.
11. Read exactly what an upgrade does before taking it — current value, resulting value, its level, and whether it is new — with a pause-menu toggle to hide the numbers.
12. Open the pause menu mid-run and read current stats, every upgrade owned with counts, active skills, and world modifiers.
13. Take the on-kill detonation early for a small blast and grow it into a large one, with blast damage scaling from the killed enemy's health rather than a flat number.
14. Never be offered an upgrade that does nothing, and never lose a level-up to a duplicate skill pick.
15. Feel big kills land — hit-stop, aggregated damage numbers, a rising kill-streak cue, and a readable death moment naming what killed them.
16. Sustain the 300-enemy representative load with separation, the director, hazards, and scaling effects all active, within the recorded frame budget.
17. Pass the two-theme validation and architecture guard with every new balance value living in theme data.

---

<a id="v0-3-measured-outcomes"></a>
### Measured outcomes

Recorded here rather than only in reconciliation, so the plan carries its own result.

**Pacing at five minutes** — final level per build model, against the declared 24–34 band:

| passive | damage-rush | crit | explosion | spread |
| --- | --- | --- | --- | --- |
| 13 | 25 | 24 | 30 | 38 |

`passive` is the do-nothing floor and `spread` is the multiplicative ceiling; the three in between are the representative band. A strong build overshooting is intended, not a defect — `PLAN.md` asks for runs that become temporarily ridiculous rather than being suppressed.

**Time to kill**, end of run, spread build: baseline role 0.04 s, fast role 0.02 s, durable role 0.25 s, spawner 0.05 s. No role is ever unkillable at any point in any build, which is the divergence the table exists to catch.

**DPS budget**: base 10 DPS reaches 809 on a spread build by the end of a five-minute run. The plan's written 400–600 target was too narrow and, more importantly, could not be evaluated at all until a multiplicative build model existed. Asserted now as 400–1500.

**Frame time at 300 live enemies**, same machine throughout:

| | average | worst |
| --- | --- | --- |
| V0.2 baseline | 20.35 ms | 26.67 ms |
| + crowd separation | 22.55 ms | 27.50 ms |
| + arena hazards | 23.70 ms | 29.17 ms |

Peak candidate visits for separation: 11,237 per frame, roughly 37 per enemy against 90,000 for a naive all-pairs scan. Coincident enemy pairs: zero.

**Run length independence**: the same director coefficients produce level 25 at five minutes and level 36 at ten, with no new authoring.

---

<a id="v0-3-architecture-additions"></a>
## Architecture additions

V0.3 adds six seams. Each exists because more than one phase needs it.

<a id="v0-3-theme-owned-tuning-packs"></a>
#### Theme-owned tuning packs

All numbers introduced by this milestone live in tuning files inside the **active theme**, not in systems or scenes:

```text
content/themes/<theme>/
  progression.ts   XP curve bands, per-role reward weights, toughness reward share
  director.ts      Director curve coefficients, unlock fractions, weight ramps
  difficulty.ts    Time and Pollution curves for enemy health/damage/speed/elite chance
  bodies.ts        Per-role separation radius scale, mass, and solidity
  hazards.ts       Arena hazard definitions
```

`SPAWN_INTERVAL_MS`, `SPAWN_RADIUS`, and the `unlockAtMs` fields move out of the scene and the enemy definitions into `director.ts`. The scene reads a resolved plan; it never holds a cadence literal.

Both themes carry a full tuning pack. Knight-magic's is kept in step so the second theme stays a real regression target, not a stale fixture.

<a id="v0-3-procedural-director-curves"></a>
#### Procedural director curves

The director resolves everything from **normalized run progress** rather than an authored phase list, so a 5-minute run, a 10-minute run, and an endless run all work from the same data. See Phase 4.

<a id="v0-3-spatial-index"></a>
#### Spatial index

One `systems/spatial/spatial-hash.ts` uniform grid, rebuilt once per frame from live enemies, consumed by crowd separation, explosion radius queries, nearest-target selection, hazard overlap, and pickup magnetism. It replaces four independent O(n) scans with one build plus bounded neighbourhood lookups, and it is the enabler for separation at 300 enemies rather than an optimisation added afterwards.

<a id="v0-3-skill-levels"></a>
#### Skill levels

`RunState` gains `skillLevels: Readonly<Partial<Record<SkillId, number>>>`. `skill.enable` becomes `skill.level` (+1, capped by the skill's `maxLevel`). Effect resolution takes a level and returns resolved values. This is what makes the detonation grow, and it is what removes wasted duplicate picks.

<a id="v0-3-upgrade-description-selectors"></a>
#### Upgrade description selectors

One pure module, `systems/upgrades/describe-upgrade.ts`, answers "what does taking this do to the current state?" and returns structured before/after lines. It is consumed by the level-up card, the pause menu, and the run-end tally — three surfaces, one source of truth, fully unit-testable without Phaser.

<a id="v0-3-settings-state"></a>
#### Settings state

`settings: { detailedUpgradeCards, reducedMotion, muted, viewScale }` in a serializable slice shaped for [`SAVE_DATA.md`](./SAVE_DATA.md). Session-only in this milestone; the localStorage adapter is a marked seam that V0.4 fills.

---

<a id="v0-3-phase-1--tuning-seams-balance-simulator-and-plan-re-pointing"></a>
## Phase 1 — Tuning seams, balance simulator, and plan re-pointing

**Commit:** `build(v0.3): establish balance instrumentation and tuning seams`

The reason this is first: a five-minute run takes five minutes to evaluate. Every later phase in this milestone is a numbers change, and iterating numbers by playing is the slowest possible loop. A headless simulator turns a tuning question into a sub-second test.

Deliver:

- Create the five theme tuning files above in knight-magic with the current values, so this phase is behaviour-neutral and reviewable as a pure move.
- Add `systems/simulation/pacing-simulator.ts`: a deterministic, Phaser-free model that steps a full run at a fixed timestep and reports, per 15-second bucket — enemies spawned by role, live enemy estimate, player DPS from a supplied build model, kills, XP earned, level, and cumulative XP. It consumes the same tuning data and the same pure selectors as the game.
- Add a `npm run balance` script that prints the pacing table for a named build model (`passive`, `damage-rush`, `crit`, `explosion`) and a named run length, as a readable text report.
- Add telemetry fields for pacing: resolved director progress, spawn interval in effect, live count by role, XP earned per bucket, level timestamps.
- Repoint `AGENTS.md` and `README.md` from the completed V0.2 plan to this one, including the `claude/v0.3` branch and delivery workflow. `PLAN.md`, `SAVE_DATA.md`, and REC-043 already carry the re-sequencing.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/content tests/unit/architecture tests/unit/simulation
npm run build
npm run test:e2e -- --grep "boots|load harness"
```

Manual smoke: run `npm run balance` and confirm the simulated level curve matches a real five-minute run within roughly one level at the 1, 3, and 5 minute marks.

Exit gate: no behaviour changed, every V0.2 test passes untouched, and a tuning question can be answered without opening a browser.

---

<a id="v0-3-phase-2--environment-theme-as-the-primary-content-pack"></a>
## Phase 2 — Environment theme as the primary content pack

**Commit:** `feat(v0.3): make the environment theme the production content pack`

The environment/nature theme becomes the game's primary fiction, for the pure-fun stream as well as any later education layer. Knight-magic is retained as a **second real theme** — a far better boundary regression target than the synthetic fixture, because it is production-shaped content that must keep passing every rule test.

<a id="v0-3-bounded-scope"></a>
#### Bounded scope

This phase re-skins and re-tunes **existing roles only**. It adds no enemy roles, no type/effectiveness system, no facts, and no codex. Those live in V0.4 and later, per [`EDUCATION_PIVOT.md`](./EDUCATION_PIVOT.md).

<a id="v0-3-content-mapping"></a>
#### Content mapping

| Stable ID | Environment identity | Notes |
| --- | --- | --- |
| `character.starter` | Environment Protector | Ranger/cleanup operative |
| `weapon.starter_projectile` | Sorting Pulse | Auto-targeting reclaim shot |
| `enemy.swarm_basic` | Plastic Bottle | **The baseline enemy.** Plastic dominates real litter counts, so the generic grunt being plastic is accurate as well as convenient |
| `enemy.fast_fragile` | Plastic Bag | Wind-blown, fast, fragile |
| `enemy.slow_durable` | Glass Bottle | Very high health, **high armour**, low contact damage — inert but effectively permanent |
| `enemy.death_spawner` | Rubbish Bag | Bursts into loose litter on death |
| `elite.baseline` | Illegal Dump variant | Existing elite treatment, re-skinned |
| `pickup.experience` | Impact Point | XP becomes "Impact" |
| `shrine.spawn_surge` | Landfill Breach | |
| `shrine.greed` | Fast Fashion Boom | |
| `shrine.multiplicity` | Single-Use Boom | |
| `shrine.duplication` | Overproduction Order | |
| `skill.piercing_momentum` | Sorting Momentum | |
| `skill.on_kill_explosion` | Compaction Burst | |
| `skill.fracture` | Fragmentation | Plastics fragment rather than decompose — the mechanic was already accurate |
| `skill.bloodlust` | Cleanup Streak | |
| `skill.chain_reaction` | Cascade | |
| Chaos | **Pollution Level** | HUD vocabulary change only |

`skill.fracture` deserves a note: the mechanic shipped in V0.2 already models what plastic actually does. That is the first evidence that the environment fiction fits these systems better than the fantasy one did.

<a id="v0-3-stats-derived-from-persistence"></a>
#### Stats derived from persistence

Enemy health is derived from real persistence, **log-scaled and normalized so the Plastic Bottle is the baseline**. Literal persistence would make glass 10,000× a banana peel and unplayable; log scaling keeps the ordering and the intuition while staying inside a playable band. This is a design decision to record, not a hidden fudge — the codex will later state the real figure alongside the modelled one.

Health and harm are deliberately decoupled: glass is a wall that barely hurts, and a small fast item can hurt disproportionately. That is both better enemy design and the actual lesson about what makes litter dangerous.

Deliver:

- Add `content/themes/eco-guardian/` implementing every required archetype, with its own copy, tokens, tuning pack, and derived stats.
- Switch `active-theme.ts` to the new pack; keep knight-magic complete and passing every rule and validation test.
- Extend theme validation and the architecture guard to require **both** production packs to satisfy every contract, and keep the synthetic alternate fixture for rename-only proof.
- Update `THEME_ARCHETYPES.md`: the primary theme, the stable-ID mapping table, and the two-production-theme workflow.
- Update the pacing simulator's build models to the new content.
- Record the log-scaling decision, the persistence sources used, and the resulting stat table in reconciliation.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/content tests/unit/architecture tests/unit/enemies tests/unit/simulation
npm run build
npm run test:e2e:ci
```

Manual smoke: play a full run in the environment theme, then flip `active-theme.ts` to knight-magic and confirm the same run plays with different names, colours, and tuning and no code changes.

Exit gate: two complete production themes pass every contract, no system or scene branches on a themed string, and the environment pack is the default.

---

<a id="v0-3-phase-3--progression-curve-per-role-rewards-and-upgrade-tallies"></a>
## Phase 3 — Progression curve, per-role rewards, and upgrade tallies

**Commit:** `feat(v0.3): rebuild the progression curve and reward scaling`

Covers requests 1, 2, and 5.

<a id="v0-3-the-xp-curve-request-1"></a>
#### The XP curve (request 1)

Replace the linear requirement with banded geometric growth. Growth is fast early so the opening minute is generous, then compounds so late levels are milestones.

```text
xpRequiredForLevel(1) = 3
band 1  levels  1–4    growth ×1.30
band 2  levels  5–11   growth ×1.18
band 3  levels 12–24   growth ×1.12
band 4  levels 25+     growth ×1.09
```

Resulting requirements (rounded):

| Level | 1 | 2 | 3 | 4 | 5 | 8 | 10 | 12 | 15 | 20 | 25 | 30 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Need | 3 | 4 | 5 | 7 | 9 | 14 | 20 | 27 | 38 | 68 | 119 | 183 |
| Cumulative | 3 | 7 | 12 | 19 | 28 | 64 | 101 | 151 | 254 | 527 | 1,008 | 1,784 |

The curve is data (`progression.ts`), the formula is pure, and both are covered by table-driven tests including the exact boundary levels. Band 4 is open-ended, so longer and endless runs need no new authoring.

Target pacing, asserted by the simulator: roughly level 8–10 at 1:00, 14–17 at 2:30, and 26–31 at 5:00 for an average build. That lands close to the `PLAN.md` example run-end screen (level 28) and gives ~30 upgrade choices per run.

**These growth rates were selected with the simulator, not chosen up front.** The first candidate (base 4, growth ×1.35/1.22/1.16/1.12) made level 28 roughly five times more expensive than the linear curve it replaced, and every build model finished between level 10 and 23 — well under the band. Worse, it fed back on itself: slower levelling means lower damage, which means fewer kills, which means slower levelling. Phase 1's simulator turned that into a five-candidate sweep instead of five five-minute runs. Recorded in REC-047.

<a id="v0-3-reward-scaling-request-5"></a>
#### Reward scaling (request 5)

Per-role base rewards, separated so a durable enemy is genuinely worth killing:

| Role | Environment identity | Current | Proposed | Rationale |
| --- | --- | --- | --- | --- |
| `enemy.swarm_basic` | Plastic Bottle | 1 | 1 | The unit of account |
| `enemy.fast_fragile` | Plastic Bag | 1 | 2 | Harder to hit, forces movement |
| `enemy.slow_durable` | Glass Bottle | 4 | 7 | Far more health and armour, and blocks space |
| `enemy.death_spawner` | Rubbish Bag | 3 | 5 | Plus its burst, see below |
| Death-spawn offspring | Loose litter | 0 | 1 | The burst is part of the package |
| Fracture children | Fragments | 0 | 0 | Unchanged — a player skill must not mint XP |
| Elite | Illegal Dump | ×2 | ×2.5 | Already a reward multiplier |

Add a **toughness share**: an enemy's reward is snapshotted at spawn as
`xpReward × (1 + (effectiveHealthMultiplier − 1) × 0.5)`.
A bottle spawned at minute four with a 1.5× health multiplier is worth 1.25; the same bottle at minute zero is worth 1. This is what keeps the exponential requirement fed without inflating the early game, and it makes the late-run swarm feel like a payday rather than a wall.

Giving death-spawn offspring non-zero reward changes the provisional data behind REC-030; update that entry rather than silently diverging. There is no reward loop because offspring are the fast-fragile role, which does not spawn on death.

<a id="v0-3-upgrade-tallies-request-2"></a>
#### Upgrade tallies (request 2)

- Add `upgradeCounts: Readonly<Partial<Record<UpgradeId, number>>>` to run statistics, incremented at the same commit point as `selectedUpgradeIds`.
- `selectRunSummaryValues` gains an `upgrades` section: theme display name, count, and — where meaningful — the resulting value.
- The run-end overlay grows a third column, or a second page when the list exceeds the panel; the same selector feeds the pause menu in Phase 8.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/xp tests/unit/statistics tests/unit/simulation tests/unit/enemies
npm run build
npm run test:e2e -- --grep "level up|statistics"
npm run balance
```

Manual smoke: play a full run and confirm level-ups slow down without stalling, that a Glass Bottle kill is visibly worth more than a Plastic Bottle kill, and that the end screen lists every upgrade with an accurate count.

Exit gate: the curve is data-driven and exactly tested at band boundaries, reward provenance still reconciles, and the simulator's predicted level at 1/3/5 minutes matches live play within one level.

---

<a id="v0-3-phase-4--procedural-spawn-director-fixed-view-and-off-screen-spawning"></a>
## Phase 4 — Procedural spawn director, fixed view, and off-screen spawning

**Commit:** `feat(v0.3): add the procedural spawn director and off-screen spawning`

Covers requests 4 and 8.

<a id="v0-3-the-director-is-a-set-of-curves-not-a-phase-list"></a>
### The director is a set of curves, not a phase list

The requirement is that longer and endless runs must work **without hand-authoring more phases**. So the director resolves everything from normalized run progress:

```text
t = elapsedMs / durationMs        // 0 at start, 1 at the end, and free to exceed 1
```

Every director output is a function of `t`. Nothing in the data names a minute.

| Output | Function | Coefficients (`director.ts`) |
| --- | --- | --- |
| Spawn interval | `max(minMs, baseMs × e^(−k·t))` | `baseMs 900`, `k 1.0`, `minMs 300` |
| Batch size | `1 + floor(t × batchRamp)` | `batchRamp 3` |
| Role availability | live when `t ≥ role.unlockAt` | per role, below |
| Role weight | `w₀ × (1 + growth × clamp01((t − unlockAt) / (1 − unlockAt)))` | per role, below |
| Baseline elite chance | `maxElite × clamp01((t − eliteUnlock) / (1 − eliteUnlock))` | `eliteUnlock 0.60`, `maxElite 0.08` |
| Milestone wave | fires once when `t` crosses any `role.unlockAt` | burst of `15 + 15·t` |

Per-role coefficients:

| Role | `unlockAt` | At 5:00 | `w₀` | `growth` |
| --- | --- | --- | --- | --- |
| `enemy.swarm_basic` | 0.00 | 0:00 | 100 | −0.65 |
| `enemy.fast_fragile` | 0.20 | 1:00 | 30 | 0.00 |
| `enemy.slow_durable` | 0.40 | 2:00 | 12 | +0.90 |
| `enemy.death_spawner` | 0.45 | 2:15 | 5 | +2.60 |

**Derived output at a 5-minute run** — this table is computed from the curves above, not authored. It exists to show the curves produce the requested milestone shape.

| Progress | Remaining | Interval | Batch | Role share | Elite baseline |
| --- | --- | --- | --- | --- | --- |
| 0.0 | 5:00 | 900 ms | 1 | Bottle 100% | 0% |
| 0.2 | 4:00 | 737 ms | 1 | Bottle 74% · Bag 26% | 0% |
| 0.4 | 3:00 | 603 ms | 2 | Bottle 64% · Bag 26% · Glass 10% | 0% |
| 0.6 | 2:00 | 494 ms | 2 | Bottle 53% · Bag 26% · Glass 14% · Rubbish 7% | 0% |
| 0.8 | 1:00 | 404 ms | 3 | Bottle 43% · Bag 27% · Glass 17% · Rubbish 12% | 4% |
| 1.0 | 0:00 | 331 ms | 4 | Bottle 33% · Bag 28% · Glass 22% · Rubbish 17% | 8% |

Change `durationMs` to ten minutes and the same curves stretch to it. The compressed test runs traverse every milestone for free, which also removes the `durationScale` workaround an authored table would have needed.

**Endless (V0.4) needs no new data.** For `t > 1` every curve clamps at its floor or ceiling and an escalation index `E = max(0, t − 1)` feeds additional health, damage, and count multipliers. The director hook exists in V0.3; endless mode itself remains V0.4.

<a id="v0-3-pollution-layers-on-top"></a>
#### Pollution layers on top

- **Rate:** `interval / worldSpawnMultiplier` — the existing `1 + 0.25p` curve plus shrine products, unchanged mechanism.
- **Composition:** each role carries a `chaosWeightBias`, and its weight becomes `weight × (1 + p × bias)`. Proposed biases — Bottle 0, Bag 0.10, Glass 0.35, Rubbish 0.50. High Pollution therefore shifts the swarm toward heavy roles, not just more of the same.
- **Elites:** `max(directorBaseline(t), min(0.4, 0.04p))`. This fixes the current situation where a shrine-free run never sees an elite at all.

Batch spawning matters more than it sounds: one enemy every 330 ms reads as a trickle, while three every 990 ms on a shared ring arc reads as a wave. Milestone waves are announced with a banner and cue, because the player should know the game just got harder and why.

<a id="v0-3-fixed-view-and-off-screen-spawning-request-4"></a>
### Fixed view and off-screen spawning (request 4)

<a id="v0-3-fixed-logical-view"></a>
#### Fixed logical view

The game renders a **fixed 1600×900 logical view**, scaled to fit the window and letterboxed with the theme background where the aspect does not match. A small set of presentation presets (720p / 900p / 1080p) changes rendered pixel density only.

The hard rule: **every preset shows the same world area.** If a preset showed more world, a bigger window would mean more warning, more targets in range, and a different game — and every balance number in this milestone would be monitor-dependent.

<a id="v0-3-spawn-ring"></a>
#### Spawn ring

Two changes, because a larger radius alone is not enough:

1. **Radius derives from the fixed view.** Half-diagonal of 1600×900 is ≈ 918, so `spawnRadius = 918 + margin ≈ 1020`, versus 360 today.
2. **Clamping is replaced with rejection.** `pointOnSpawnRing` currently clamps the candidate into the arena, which drags edge spawns on screen — precisely the reported bug when the player is near a wall. Replace with: sample the golden-angle ring, reject candidates outside the arena or inside the view rectangle, take the first valid candidate, and after N rejections fall back to the farthest in-arena point from the view centre.

The arena grows **2400×1600 → 3600×2400** so a full off-screen ring exists anywhere in the arena, and so shrine placement becomes a real traversal decision. Both changes touch existing e2e expectations that assert `ARENA_SIZE`; treat those updates as part of this phase.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/spawning tests/unit/director tests/unit/content tests/unit/simulation
npm run build
npm run test:e2e -- --grep "spawn|enemy roster|Chaos|view"
npm run test:e2e:stress
```

Manual smoke: play a shrine-free run and confirm no enemy ever appears on screen; confirm each milestone is announced and visibly changes the roster; resize the window across all presets and confirm the visible world area never changes; run the simulator at 5 and 10 minutes and confirm both produce sane curves from the same data.

Exit gate: zero on-screen spawns across a scripted sweep with the player at the centre, each edge, and each corner, at every preset; the director is pure, curve-driven, and unit-tested at several run lengths; the 300-enemy stress path still passes.

---

<a id="v0-3-phase-5--physical-presence-spatial-index-and-crowd-separation"></a>
## Phase 5 — Physical presence, spatial index, and crowd separation

**Commit:** `feat(v0.3): give enemies physical presence`

Covers request 3. This is the highest-risk phase in the milestone — it adds per-frame work proportional to the swarm — so it lands after the director but before the difficulty ramp, and it carries the strictest performance gate.

<a id="v0-3-approach"></a>
#### Approach

Full Arcade collider resolution between 300 enemies is the obvious approach and the wrong one: it fights `chase()`, which overwrites velocity every frame, and its cost is unbounded in a dense pile. Instead:

- **Enemy ↔ enemy: soft positional separation.** Build the spatial hash once per frame; for each enemy, examine its 3×3 cell neighbourhood, and for each overlapping neighbour apply a positional nudge of `overlap × 0.5 × otherMass / (mass + otherMass)`, clamped to a maximum displacement per frame. Velocity is untouched, so chasing is unaffected. Neighbour checks are capped (8 per enemy) so worst-case cost stays linear.
- **Player ↔ solid enemies: hard resolution.** Enemies flagged `solid` push the player out along the contact normal by the full overlap. Contact damage keeps flowing through the existing overlap handler, so damage semantics do not change. Guard against wedging the player outside arena bounds by preferring to displace the enemy when the player is against a wall.

<a id="v0-3-body-data-bodiests"></a>
#### Body data (`bodies.ts`)

Separation radius is deliberately smaller than the drawn radius so small enemies still bunch, exactly as requested:

| Role | Environment identity | Draw radius | Separation scale | Effective | Mass | Solid |
| --- | --- | --- | --- | --- | --- | --- |
| `enemy.fast_fragile` | Plastic Bag | 10 | 0.55 | 5.5 | 0.6 | no |
| `enemy.swarm_basic` | Plastic Bottle | 14 | 0.70 | 9.8 | 1.0 | no |
| `enemy.slow_durable` | Glass Bottle | 22 | 1.00 | 22 | 4.0 | **yes** |
| `enemy.death_spawner` | Rubbish Bag | 25 | 0.95 | 23.8 | 3.0 | **yes** |
| Elite (any role) | — | ×1.3 | inherits | ×1.3 | ×2 | **yes** |

Bags overlap heavily and read as wind-blown drift; bottles bunch with visible gaps; glass and rubbish hold their ground and are walls.

Also add **contact knockback**: a solid enemy that damages the player shoves them, which sells the mass difference and gives a moment of recovery.

The same impulse resolution serves the weapon's `knockback` stat, which V0.3 declares as generic weapon data but leaves at `0`. Wire it here so a weapon that declares knockback shoves what it hits, scaled by the enemy's mass so heavy roles shrug it off. Both production weapons keep `0`, so this phase changes no behaviour for them.

<a id="v0-3-performance-gate"></a>
#### Performance gate

This phase must not be merged on impression. Required evidence, recorded in reconciliation:

- average and worst frame time at 300 enemies, before and after, on the same machine;
- separation pair-check count per frame at the 300-enemy high-water mark;
- confirmation that explosions and targeting were migrated to the shared hash (they are net *savings* that partly pay for separation).

If the budget is exceeded, the documented fallback is half-rate separation (alternate frames, doubled displacement) before any reduction of the enemy cap.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/spatial tests/unit/separation tests/unit/effects tests/unit/targeting
npm run build
npm run test:e2e -- --grep "separation|presence|combat"
npm run test:e2e:stress
```

Manual smoke: walk into a Glass Bottle and confirm it blocks; walk through a drift of Plastic Bags and confirm it parts and reforms; stand in a corner under heavy load and confirm nothing tunnels through the player or the walls.

Exit gate: no enemy pair is fully coincident for more than one frame, solids are impassable for both player and enemies, the 300-enemy load stays within the recorded frame budget, and separation never alters damage, rewards, or statistics.

---

<a id="v0-3-phase-6--time-and-chaos-scaling-and-arena-hazards"></a>
## Phase 6 — Time and Chaos scaling, and arena hazards

**Commit:** `feat(v0.3): scale world pressure with time and add arena hazards`

Covers request 6, starting conservatively as requested, plus arena hazards for map variety.

<a id="v0-3-difficulty-scaling"></a>
#### Difficulty scaling

Add an elapsed-time curve alongside the existing Pollution curves, resolved through the same `selectWorldModifiers` selector so there is still exactly one place where world pressure is decided:

| Modifier | Pollution term (existing) | New time term | Combined at 5:00, Pollution 3 |
| --- | --- | --- | --- |
| Enemy health | `1 + 0.20p` | `1 + 0.50 × t` | 1.40 × 1.50 = **2.10×** |
| Enemy contact damage | `1 + 0.15p` | `1 + 0.20 × t` | 1.30 × 1.20 = **1.56×** |
| Enemy move speed | none | `1 + 0.10 × t` | **1.10×** |
| Elite chance | `min(0.4, 0.04p)` | director baseline from Phase 4 | max of the two |

Rules that keep this readable and safe:

- The time term advances in **steps of `1/10` of run progress**, not continuously — 30-second steps at five minutes, and correctly proportioned at any run length. A smooth ramp is imperceptible; a step is felt, and it lets the HUD show a threat level that changes at legible moments.
- Multipliers are **snapshotted at spawn**. Existing enemies never heal or accelerate mid-life, which would be both confusing and a statistics hazard.
- The snapshot is what feeds the Phase 3 toughness reward share and the Phase 7 victim-health explosion damage, so tougher enemies pay out more in both currencies.

Start at these values and expect to raise them. The simulator's TTK table (Phase 10) is the instrument for deciding.

<a id="v0-3-arena-hazards"></a>
#### Arena hazards

Three hazards, deliberately no more, each a stable-ID contract with theme-owned identity and tuning. They exist for map variety and to make positioning matter beyond enemy avoidance.

| Stable ID | Environment identity | Behaviour |
| --- | --- | --- |
| `hazard.damage_zone` | Contamination Spill | Telegraphed static area; damage-over-time and a slow to anything inside; expires after a lifetime |
| `hazard.obstacle` | Debris Pile | Solid for the player and projectiles; destructible with its own health; drops a reward when cleared |
| `hazard.periodic_burst` | Methane Vent | Fixed point that telegraphs and then bursts on a cycle |

Design rules:

- Hazards are **world content, not enemies**: they never count toward the enemy cap, never award kills, and never enter the damage ledger as enemy damage.
- Count and frequency scale with Pollution and run progress from `difficulty.ts`, so they are part of the same escalation model rather than a separate system.
- `hazard.obstacle` reuses Phase 5's solid-body resolution. Enemies get a cheap tangential avoidance steer — one vector adjustment, no pathfinding. **This is the risk in this phase**: direct-chase enemies can pile against an obstacle. Cap obstacle size and count, and verify under the 300-enemy load that no pile becomes a permanent stall.
- Everything is telegraphed before it hurts. An untelegraphed hazard in a 300-enemy swarm is indistinguishable from a bug.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/chaos tests/unit/modifiers tests/unit/difficulty tests/unit/hazards tests/unit/simulation
npm run build
npm run test:e2e -- --grep "Chaos|world multiplier|difficulty|hazard"
npm run balance
```

Manual smoke: compare a Plastic Bottle's time-to-kill at 0:30 and 4:30 with the same build; confirm the HUD threat step changes are noticeable but not punishing; walk into each hazard and confirm it is telegraphed, escapable, and cleaned up on restart.

Exit gate: every scaling term resolves from one selector, is exposed in telemetry, snapshots at spawn, and restarts clean; hazards never corrupt kill, reward, or damage accounting; no obstacle pile stalls the swarm under load.

---

<a id="v0-3-phase-7--skill-levels-scaling-detonation-and-upgrade-pool-repair"></a>
## Phase 7 — Skill levels, scaling Detonation, and upgrade pool repair

**Commit:** `feat(v0.3): make skills level and scale`

Covers request 10, plus the wasted-pick defect.

<a id="v0-3-skill-levels-1"></a>
#### Skill levels

`skill.enable` becomes `skill.level`: taking the upgrade increments the level, capped at the skill's `maxLevel`. Every skill effect resolver takes a level. This single change fixes the defect where re-picking a skill is a completely wasted level-up.

<a id="v0-3-scaling-compaction-burst-the-on-kill-detonation"></a>
#### Scaling Compaction Burst (the on-kill detonation)

Damage becomes a share of what died, as requested, rather than a flat number:

```text
damage = flat + victimEffectiveMaxHealth × share
radius = baseRadius + radiusPerLevel × (level − 1)
```

| Level | 1 | 2 | 3 | 4 | 6 | 8 (max) |
| --- | --- | --- | --- | --- | --- | --- |
| Radius | 44 | 56 | 68 | 80 | 104 | 128 |
| Victim health share | 30% | 38% | 46% | 54% | 70% | 86% |
| Flat damage | 3 | 5 | 7 | 9 | 13 | 17 |

Level 1 is deliberately weaker than today's fixed blast (44 vs 96 radius) so that investment has somewhere to go; level 8 is far stronger than today.

`victimEffectiveMaxHealth` is the enemy's max health *including* its spawn-time elite and difficulty multipliers, so a late-run elite Glass Bottle detonates for a great deal and a Plastic Bag barely pops. This is the interaction the design is asking for: killing the right target becomes the play, and Phase 6's health scaling feeds it automatically. `EnemyActor` must store `maxHealth` at construction — today only the mutable current `health` is retained.

<a id="v0-3-scaling-cascade-chain-reaction"></a>
#### Scaling Cascade (chain reaction)

| Level | 1 | 2 | 3 | 4 | 5 (max) |
| --- | --- | --- | --- | --- | --- |
| Max chain depth | 2 | 3 | 4 | 5 | 6 |
| Damage falloff per depth | ×0.70 | ×0.74 | ×0.78 | ×0.82 | ×0.86 |
| Radius falloff per depth | ×0.85 | ×0.87 | ×0.89 | ×0.91 | ×0.93 |

An explicit depth limit replaces "bounded only by exact-once claims", which keeps a 300-enemy chain finite, readable, and measurable. Falloff means chains stay spectacular without becoming the only thing that matters.

Sorting Momentum, Fragmentation, and Cleanup Streak all take the same treatment: Momentum +10% per level, Fragmentation +5 percentage points of split chance per level, Cleanup Streak +0.5% attack speed per step per level.

<a id="v0-3-upgrade-pool-repair"></a>
#### Upgrade pool repair

- `maxLevel` per upgrade; maxed upgrades leave the pool.
- Weighted rather than uniform selection, with rarity tiers (common / rare / epic) and `luck` feeding the weights (see Phase 10).
- Never offer three upgrades from the same category in one draw.
- Introduce the **dangerous third choice** that `PLAN.md` describes but the build never implemented — a world/curse upgrade such as Single-Use Surge (`enemy spawn ×1.5`, `+20 luck`) or Brittle World (`player damage ×2`, `enemy damage ×2`). These are the clearest expression of the "difficulty should be player-controlled" principle and they cost almost nothing now that the world model exists.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/upgrades tests/unit/effects tests/unit/skills tests/unit/content
npm run build
npm run test:e2e -- --grep "explosion|chain reaction|level up"
npm run test:e2e:stress
```

Manual smoke: take the detonation five times and confirm each pick visibly enlarges the blast; kill an elite Glass Bottle in a crowd and confirm the explosion is dramatically larger than a Plastic Bag's; confirm no offered upgrade is ever a no-op.

Exit gate: every skill level resolves from data, chains terminate at the declared depth, the damage ledger still reconciles exactly, and duplicate-pick waste is impossible.

---

<a id="v0-3-phase-8--informative-upgrade-cards-pause-menu-and-hud"></a>
## Phase 8 — Informative upgrade cards, pause menu, and HUD

**Commit:** `feat(v0.3): show the player what everything does`

Covers requests 7 and 9.

<a id="v0-3-upgrade-cards-request-7"></a>
#### Upgrade cards (request 7)

Each card renders through `describeUpgrade(state, upgrade)`:

```text
┌──────────────────────────────────────────────┐
│ 1.  REINFORCED TOOLS                  Lv 3→4 │
│     Increase damage dealt.                   │
│     Damage        15.0  →  17.5   (+25%)     │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│ 2.  SPLIT NOZZLE                      Lv 1→2 │
│     Launch one additional projectile.        │
│     Projectiles      1  →  2                 │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│ 3.  COMPACTION BURST                    NEW  │
│     Defeated waste bursts.                   │
│     Blast radius        44                   │
│     Blast damage        30% of target health │
└──────────────────────────────────────────────┘
```

- The **level badge** (`Lv 3→4`) and the **NEW** badge are always shown — they are identity, not detail.
- The **numeric before → after lines** are gated by the pause-menu toggle `Detailed upgrade cards`, **defaulting to on**.
- Multi-hit upgrades read as counts (`1 → 2 projectiles`, later `9 → 10`), stat upgrades read as resolved values plus the percentage, and skills read as their resolved effect values at the level being offered.
- Rarity is expressed by card border colour.
- A **level-up queue indicator** shows "2 more choices" when several levels land at once, so stacked pauses are legible.

<a id="v0-3-pause-menu-request-9"></a>
#### Pause menu (request 9)

`Esc` opens a four-tab overlay instead of a status string:

```text
STATS          UPGRADES          WORLD          SETTINGS

Health          86 / 125         Reinforced Tools      ×4
Damage          17.5             Split Nozzle          ×2
Attack rate     1.62 /s          Precision Sort        ×3
Crit chance     145%  (Tier 1)   Deep Reach            ×2
Crit damage     200%             Compaction Burst      ×3
Projectiles     3                Cascade               ×1
Pierce          2                Cleanup Streak        ×1
Move speed      260
Pickup radius   160              POLLUTION     ×2.8
Armour          4                Enemy spawn   ×1.90
Regeneration    0.5 /s           Enemy health  ×1.86
Impact bonus    ×1.50            Impact gain   ×2.25
```

Everything on this screen comes from the same selectors as the cards and the run-end tally. The Settings tab hosts `Detailed upgrade cards`, `Reduced motion`, `Mute`, and the view preset, replacing the current keyboard-only mute.

<a id="v0-3-hud"></a>
#### HUD

- Replace the XP text with a real progress bar plus `LVL n`.
- Timer shows the current director milestone marker.
- Add live kill-chain counter and threat step indicator.
- Milestone and wave banners from Phase 4 render here.

The Stats tab and the upgrade cards read the weapon's generic stats — damage, attack rate, range, knockback, armour pierce, and any per-weapon crit override — rather than only the player's. That keeps one description path when a second weapon arrives in V0.4.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/upgrades tests/unit/ui-selectors tests/unit/content tests/unit/settings
npm run build
npm run test:e2e -- --grep "level up|pause|hud|resize"
```

Manual smoke: confirm every card's stated "after" value matches the stat shown in the pause menu after taking it; toggle detail off and on; resize across presets during level-up and pause and confirm both overlays reflow.

Exit gate: card numbers are derived from the same code that applies the upgrade (so they cannot drift), the pause overlay never leaks input or resumes physics accidentally, and both overlays are resize- and restart-safe.

---

<a id="v0-3-phase-9--impact-feedback-and-terminal-polish"></a>
## Phase 9 — Impact feedback and terminal polish

**Commit:** `feat(v0.3): make big moments land`

The four presentation items that separate a game that is numerically correct from one that feels good. All four are downstream consumers of committed events and must never alter simulation results.

<a id="v0-3-hit-stop"></a>
#### Hit-stop

Two or three frames of freeze on an elite kill or a large chain. It is the cheapest possible "that felt good" and it is a large part of why the reference games land harder than their numbers suggest.

Implemented as a brief global time scale, so the run clock slows with it and simulation stays internally consistent. Because it does hand the player free real-world time, it is **budgeted**: a maximum total hit-stop per second, and no hit-stop at all while the frame budget is under pressure. Both are recorded in telemetry.

<a id="v0-3-damage-number-aggregation"></a>
#### Damage-number aggregation

With Phase 7's scaling explosions, per-hit numbers will become unreadable. Aggregate per enemy over a ~120 ms window and render one larger number. This also cuts feedback object churn under load, which partly pays for hit-stop.

<a id="v0-3-kill-streak-audio-ramp"></a>
#### Kill-streak audio ramp

The pierce system already ramps pitch per projectile. Extend the same treatment to kill chains so a good run is audible — which `PLAN.md` explicitly asks for and the current build only half-delivers.

<a id="v0-3-death-moment"></a>
#### Death moment

Brief slow-motion on death, then a cause-of-death line — "Overwhelmed by an elite Glass Bottle at 4:12" — above the existing statistics ledger. Requires recording the killing enemy's role, elite flag, and timestamp at the lethal transition.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/feedback tests/unit/statistics tests/unit/effects
npm run build
npm run test:e2e -- --grep "feedback|death|elite"
npm run test:e2e:stress
```

Manual smoke: trigger a large chain and confirm hit-stop reads as emphasis rather than lag; confirm damage numbers stay legible at 300 enemies; die deliberately to each role and confirm the cause line is correct.

Exit gate: simulation results are bit-identical with all four features enabled, muted, reduced, or disabled; hit-stop stays inside its budget under the 300-enemy load; aggregation never loses or double-counts damage.

---

<a id="v0-3-phase-10--survivability-stats-pickup-pressure-and-the-balance-pass"></a>
## Phase 10 — Survivability stats, pickup pressure, and the balance pass

**Commit:** `feat(v0.3): complete the rebalancing milestone`

<a id="v0-3-dead-stats"></a>
#### Dead stats

`armour`, `regeneration`, and `luck` are declared, validated, and unread. Implement all three, because a rebalancing milestone that only adds offense produces a game where the answer to every problem is more damage:

- **Armour:** multiplicative reduction `damage × 100 / (100 + armour)`, which never reaches immunity and never trivialises late contact damage. Also becomes an **enemy** stat — the Glass Bottle's defining trait. The weapon's `armourPierce` stat, declared in V0.3 and inert until now, ignores that share of the target's armour; both production weapons keep `0`.
- **Regeneration:** health per second, applied on the simulation clock, paused with the run.
- **Luck:** weights rare/epic upgrade offers and nudges the fragmentation and elite rolls.

Add one upgrade for each so they are reachable, which also broadens the pool that Phase 7 draws from.

The global invulnerability window stays as it is for this milestone, per the recorded decision; revisit in V0.4 with solid enemies, hazards, and the damage ramp all live.

<a id="v0-3-pickup-pressure"></a>
#### Pickup pressure

Every kill currently drops an uncapped pickup actor. At 300 enemies with chains, that is a second unbounded entity population competing for frame time and covering the arena.

- Cap live pickups (proposed 250); on overflow, merge the two nearest into one worth the sum.
- Three visual tiers by value, so a Glass Bottle's drop is visibly worth crossing the arena for.
- Route magnetism through the Phase 5 spatial hash.

<a id="v0-3-the-balance-pass"></a>
#### The balance pass

This is the phase where the numbers actually get decided, using the simulator plus real play:

- Publish a **time-to-kill table** — for each role, at ten evenly spaced points across the run, for four reference builds — and tune until TTK stays inside the declared band. The failure mode this catches is the one the current build has: player DPS scaling and enemy health scaling diverging quietly.
- Publish a **DPS budget**: base 10 DPS at level 1 must reach roughly 400–600 effective DPS by the end of the run through multiplicative stacking, or the Phase 6 health ramp becomes a wall.
- Re-run the full stress path with every V0.3 system active.
- Re-run the simulator at 5 and 10 minutes to confirm the procedural director degrades gracefully at a length nobody tuned by hand.
- Record every provisional value and its evidence in reconciliation.

Short verification:

```text
npm test -- --run
npm run typecheck
npm run lint
npm run build
npm run test:e2e:ci
npm run test:e2e:stress
npm run balance
npm audit --audit-level=high
```

Manual smoke: three full runs — a cautious shrine-free run, a Pollution-stacking run, and a detonation build — confirming each ends between roughly level 24 and 32, that death feels earned, and that the console stays clean. Then one run with `durationMs` set to ten minutes, confirming the director and curves hold up untuned.

Exit gate: all seventeen acceptance points pass, TTK stays in band across the reference builds, the stress path meets its budget, and reconciliation records the final tuning values with the evidence behind them.

---

<a id="v0-3-decisions-taken"></a>
## Decisions taken

Recorded here so later phases do not relitigate them.

| # | Decision | Resolution | Lands in |
| --- | --- | --- | --- |
| 1 | Viewport | **Fixed 1600×900 logical view**, scaled to fit with letterboxed background. A few presentation presets change pixel density only — every preset shows the same world area | Phase 4 |
| 2 | Run length | **Stays 5 minutes.** Longer and endless runs must be **procedural** — the director and curves resolve from normalized progress, so no milestone is ever hand-authored again | Phase 4 |
| 3 | Detailed cards | **Default on**, with a pause-menu toggle to hide the numbers | Phase 8 |
| 4 | Dangerous upgrades | **Yes**, plus **2–3 arena hazards** for map variety, kept deliberately simple | Phases 6, 7 |
| 5 | Settings persistence | **Deferred to V0.4.** Session-only, with the adapter seam left in place | — |
| 6 | Armour / regeneration / luck | **Implement all three**; armour also becomes an enemy stat | Phase 10 |
| 7 | Invulnerability window | **Leave as is.** Revisit in V0.4 once solid enemies, hazards, and the damage ramp are all live | — |
| 8 | Primary theme | **Environment**, replacing knight-magic, which is retained as a second real theme. Swap lands before any tuning phase so nothing is tuned twice | Phase 2 |

---

<a id="v0-3-additional-recommendations"></a>
## Additional recommendations

Where each recommendation from the original review ended up.

<a id="v0-3-scheduled-into-this-milestone"></a>
#### Scheduled into this milestone

| Recommendation | Phase |
| --- | --- |
| Fixed logical viewport — without it every balance number is monitor-dependent | 4 |
| Shared spatial hash — pays for separation by removing three existing O(n) scans | 5 |
| Pacing simulator — turns a five-minute experiment into a sub-second test | 1 |
| Upgrade pool repair — a wasted level-up is the most frustrating thing in the current build | 7 |
| Baseline elite chance from run progress — elites currently never appear without shrines | 4 |
| Hit-stop on big kills | 9 |
| Damage-number aggregation | 9 |
| Level-up queue indicator | 8 |
| Kill-streak audio ramp | 9 |
| Death slow-motion and cause-of-death line | 9 |

<a id="v0-3-post-milestone-corrections-v031"></a>
## Post-milestone corrections (V0.3.1)

Three things V0.3 shipped were wrong in play and were corrected on
`claude/v0.3.1` after the milestone merged. They change values and layout, not
scope, and each is recorded in full in [`../RECONCILIATION.md`](../RECONCILIATION.md):

| Correction | What changed | Entry |
| --- | --- | --- |
| Enemies closed too fast to read | Move speed cut ~10% across both packs; the REC-049 envelope gains a ceiling to match its floor | REC-058 |
| Every shrine was decided in the opening seconds | Shrines arrive on a schedule in run progress, placed around the player when they arrive, with an edge marker so they stay findable | REC-059 |
| Upgrade card text ran outside its box | Overlay text is measured and then placed; cards size to their content and the panel sizes to the cards | REC-060 |
| Enemies were still too fast | A second ~10% cut, the end-of-run speed ramp halved, and the ring-crossing floor re-derived rather than treated as fixed | REC-061 |
| Nothing outlived a run | A session statistics slice, shaped for `SAVE_DATA.md` and merged with the live run on read, feeding an upgrade catalogue and session totals in the Field Guide | REC-062 |
| The game dropped straight into a run | A title screen between boot and the run; test mode skips it and one path covers the transition | REC-063 |
| The timer ended the run mid-fight | The limit becomes a decision: continue endlessly, or stop arrivals and clear the field | REC-064 |
| Build-defining picks arrived too late, and luck never made anything stronger | Appearance rate and roll quality split apart; a six-rung tier ladder scales what each offer gives, and luck biases the roll | REC-065 |
| The roster was still too fast, and the fast role could not be escaped | A third cut, and the engagement floor reshaped per role; nothing reaches player speed, and the fast role sits just below it | REC-066 |
| Fragments were the fast role, and a cleared pocket refilled as one blob | A fragment is a smaller, quicker piece of whatever broke; light roles overlap less without standing apart | REC-067 |
| Endless plateaued, so a surviving build could farm it | Overtime compounds enemy health per step instead of approaching a limit, and a cleared run gets its own ending copy | REC-068 |

Smaller additions came with those. The HUD gained a health bar beside the
existing level bar — both now sit to the left of their numbers, one row each —
which needed a theme-owned `health` palette token. The Field Guide gained
sections, because a catalogue covering the eighteen-entry upgrade pool no longer
fits one page.

Two questions were answered from the code rather than changed on suspicion.
Upgrades have never been gated on elapsed time or Pollution; the only filter is
an upgrade's own per-run cap. Luck did work, but only on which upgrades appeared
and on the elite and fracture rolls — it never made an upgrade stronger. Both
findings are recorded in REC-065, which is what the tier split fixes.

The Field Guide remains a **reference surface only** — encounter tracking,
unlock gating, and the enemy and fact entries described in
[`EDUCATION_PIVOT.md`](./EDUCATION_PIVOT.md) remain V0.4 scope, as does any
persistence for the session statistics slice.

---


<a id="v0-4-0"></a>
## V0.4.0 — Optional-sprite seam

<a id="v0-4-0-historical-v040v041-contract"></a>
### Historical V0.4.0/V0.4.1 contract

V0.4.0 pre-landed the optional sprite contract, theme-owned sprite maps, loader,
primitive fallback, and follower view so V0.4.1 could add art without changing
simulation. Three rules remain permanent:

1. A sprite is presentation and nothing else. No system reads it, and no radius,
   hitbox, mass, range, or separation value is derived from it.
2. Nearest-neighbour filtering is applied per texture. The global Phaser
   `pixelArt` flag stays off while primitive fallbacks exist.
3. An actor keeps its authoritative primitive/body; an optional sprite view
   follows the full transform and may outlive a defeated actor only as a
   presentation remnant.


<a id="v0-4-1"></a>
## V0.4.1 — Five-sheet sprite checkpoint and pipeline

The completed checkpoint delivered five sheets and the shared pipeline; remaining
roster work is excluded here and retained in [the V0.4.4 plan](SPRITE_PLAN_V0.4.4.md).
The contract sketches below describe the original seam; current TypeScript
contracts and REC-071–073/105 govern extensions.

<a id="v0-4-1-delivered-checkpoint"></a>
### Delivered checkpoint

- Shared atlas and reproducible raw → accepted → processed build/check/status tools.
- Plastic Bottle, Plastic Bag, Glass Bottle, Bagged Waste and Environment Protector.
- Primitive fallback and presentation-only followers; later material replacements
  and pose reuse are recorded in the V0.4.2.1 and Q2 records.

<a id="v0-4-1-2-pipeline"></a>
### 2. Pipeline

```
  prompt (style lock + subject slot)
        ↓  image tool, seed recorded
  raw generation           build/sprites/raw/{id}.a{attempt}.png
        ↓  acceptance checklist, by eye
  accepted source          build/sprites/accepted/{id}.png
        ↓  palette snap + alpha clean + variant rotation
  processed sheet          public/sprites/{theme}/{id}.png  (+ .c2 .c3)
        ↓  atlas pack — from S1, see §6
  runtime texture          public/sprites/{theme}/atlas.png + atlas.json
```

**Palette snap** is the step that makes generated art usable. Image tools return
approximate colours and semi-transparent edges; the snap quantises every pixel to
the nearest colour in the sprite's declared 4-step ramp and forces alpha to 0 or
255. It is what turns "roughly the right blue, softly edged" into "exactly the
token blue, hard edged", and it is why the roster will match even though the
generator does not.

It also gives colour variants for free: snap to a hue-rotated ramp instead and the
same source produces `c2` and `c3`.

**Tooling:** one script, `scripts/sprites.ts`, with three commands:

| Command | Does |
| --- | --- |
| `npm run sprites -- check` | Validates every accepted sheet against the checklist bits a machine can verify: canvas size, strip width, alpha binarity, tonal step count, outline closure |
| `npm run sprites -- build` | Palette-snaps, generates variants, writes to `public/sprites/`, and repacks the atlas |
| `npm run sprites -- status` | Prints the manifest as a progress table — what is done, claimed, and outstanding |

`check` is the important one. It is the difference between a consistency policy
and a consistency *guarantee* for everything except the parts that need an eye.

---

<a id="v0-4-1-3-contract-changes"></a>
### 3. Contract changes

Small and additive. The theme boundary rules in `THEME_ARCHETYPES.md` hold: no
system learns a sprite's name, and application code keeps resolving through
`activeTheme`.

```ts
/** Where a sprite sheet lives and how it is cut. Optional per theme. */
export interface SpriteDefinition {
  readonly key: string;          // stable texture key, e.g. "enemy.swarm_basic"
  readonly path: string;         // public/ relative
  readonly frameWidth: number;
  readonly frameHeight: number;
  readonly frames: number;
  /** Frame index per named state, so systems never hard-code numbers. */
  readonly states: Readonly<Record<SpriteState, number>>;
}

export type SpriteState = "idle" | "move" | "hit" | "death";

export interface ThemeTokens {
  // ...existing
  /**
   * Sprites by content id. Optional: a pack without them renders the V0.3
   * primitives, which is what keeps a second production pack viable without a
   * second art roster.
   */
  readonly sprites?: Readonly<Partial<Record<ContentId, SpriteDefinition>>>;
}
```

Entities gain one branch, not two implementations:

```ts
// EnemyActor, PlayerActor, PickupActor, ShrineActor, HazardActor
const sprite = tokens.sprites?.[definition.id];
// A sprite replaces the primitive's fill; it never changes radius, body,
// separation, or anything the simulation reads. Presentation only.
```

**The rule that keeps this safe:** a sprite may change nothing a system reads.
Radius, separation radius, mass, and the physics body all continue to come from
the definition and `bodies` tuning. A sprite that looks bigger than its hitbox is
an art problem to fix in the art, never a reason to change the hitbox — the crowd
tuning in REC-052 and REC-067 was measured against those radii.

---

<a id="v0-4-1-phase-s1--pipeline-atlas-and-the-baseline-sprite"></a>
#### Phase S1 — Pipeline, atlas, and the baseline sprite
The loader, `scripts/sprites.ts` with all three commands, **atlas packing from
day one** (see §6), and **one** sprite: the Plastic Bottle. Ends with bottles
rendering as sprites in a live run while every other role stays a primitive.

The contract additions are not here — they land in V0.4.0 before this stream
starts, so S1 begins against a seam that already exists.

This phase is deliberately one sprite. Everything that can go wrong with the
pipeline — sizing, alpha, palette drift, frame cutting, depth sorting, the damage
flash against a texture — goes wrong here, once, on the sprite that is also the
yardstick for every later one.

*Verification:* `sprites -- check` passes; a run shows bottles as sprites; crowd
separation, hit flash, elite outline, and death all still behave; the atlas
contains the sprite and is loaded as one texture; frame time measured against the
300-enemy stress path and recorded, since it is the baseline every later phase is
compared to.

<a id="v0-4-1-5-file-naming"></a>
### 5. File naming

Exact, so nothing collides across sessions, agents, or streams. `{id}` is the
stable content id with dots replaced by underscores — `enemy.swarm_basic` becomes
`enemy_swarm_basic`.

| Stage | Path | Committed |
| --- | --- | --- |
| Raw generation | `build/sprites/raw/{id}.a{attempt}.png` | Yes |
| Accepted source | `build/sprites/accepted/{id}.png` | Yes |
| Built sheet | `public/sprites/{theme}/{id}.png` | Yes |
| Built variant | `public/sprites/{theme}/{id}.c2.png`, `.c3.png` | Yes |
| Packed atlas | `public/sprites/{theme}/atlas.png` + `atlas.json` | Yes |

The attempt number in the raw filename is what makes multi-session work safe:
nothing is ever overwritten, a rejected generation stays on disk as evidence of
what the prompt produced, and two agents generating the same sprite produce two
files rather than one corrupted one.

Everything is committed. These are small files — see §6 — and the raw generations
are the only record of what a prompt actually returned.

<a id="v0-4-1-6-sheet-format-and-browser-cost"></a>
### 6. Sheet format and browser cost

**The sheet model is exactly as expected:** one file per subject, containing that
subject's frames laid out left to right, and the engine cuts it into frames and
plays whichever it needs. Phaser loads it with `frameWidth`/`frameHeight` and
addresses frames by index; the `states` map in the contract turns
`idle`/`move`/`hit`/`death` into those indices so no system ever hard-codes a
frame number.

Size is not a concern, and it is worth being concrete about why:

| Sheet | Pixels | Decoded (RGBA) | On disk (PNG) |
| --- | --- | --- | --- |
| Small enemy, 24×24 × 4 | 96 × 24 | ~9 KB | ~1 KB |
| Standard enemy, 32×32 × 4 | 128 × 32 | ~16 KB | ~1–2 KB |
| Large enemy, 48×48 × 4 | 192 × 48 | ~37 KB | ~2–3 KB |
| Player, 48×48 × 8 | 384 × 48 | ~74 KB | ~4 KB |
| **Whole roster, 20 sheets** | — | **well under 1 MB** | **~40 KB** |

A four-colour sprite at these sizes compresses extremely well. The entire roster
is smaller than a single photograph, and 300 on-screen enemies share one texture
per role rather than holding 300 copies of anything.

<a id="v0-4-1-the-real-constraint-is-draw-batching-not-size"></a>
#### The real constraint is draw batching, not size

This is where the earlier draft of this plan was wrong, and it is worth stating
plainly rather than quietly fixing: it recommended individual PNGs through Phase
S4 with an atlas deferred to S5 "if load time justifies it". Load time was never
going to justify it — 40 KB never does — and that framing missed the actual cost.

Phaser's WebGL renderer batches quads and must flush the batch when it runs out
of bound texture units. It binds several textures at once (commonly up to 16,
GPU-dependent), so a roster of ~20 separate sheets sits right at that boundary.
Enemies are drawn in depth order with four roles interleaved, so in the worst
case the batch flushes far more often than it needs to — and that worst case is
exactly a 300-enemy crowd, which is the situation the whole build is tuned around.

**Packing every sprite into one atlas makes it one texture and one batch**, and
removes the GPU-dependent variable entirely. So:

| Decision | Was | Now |
| --- | --- | --- |
| Atlas | Deferred to S5 | **Phase S1**, before the roster grows |

The atlas is generated by `npm run sprites -- build` from the accepted sources,
so it is a build artefact rather than something maintained by hand, and adding a
sprite never means repacking anything manually.

<a id="v0-4-1-implemented-rendering-decisions"></a>
### Implemented rendering decisions

Per-texture nearest-neighbour filtering is used; the global `pixelArt` flag
stays off (REC-073). Sprite tint/follower presentation never changes the primitive
body. Animation is resolved through theme metadata and presentation drivers;
Q1's distance-driven walk correction supersedes the original proposed Phaser
animation-key approach. No unbuilt elite-overlay sheet is claimed.

<a id="v0-4-1-q2-inspection-and-accepted-pose-reuse-2026-10-12"></a>
### Q2 inspection and accepted-pose reuse (2026-10-12)

The owner requested a sprite browser and visible fragment presentation. The
standalone `/sprite-browser.html` entry inspects actual atlas crops/all poses,
compares game proportions, marks good/bad/review with notes and exports reviews.
Its tooling-only theme registry is excluded from the game selection path.
Glass Shards reuse the accepted Glass Bottle frame 3 via `atlasFrameKey`; this
adds no pixels/atlas edits and retains batching. It is a labelled reuse, not a
new accepted sheet. Rows #6–19 remain gated; future dedicated shard art replaces
this alias through the ordinary claim/generate/accept process.


<a id="v0-4-2"></a>
## V0.4.2 — Readability, pace and Cleanup Grabber

This is the design correction between the V0.4.1 sprite checkpoint and content
growth. The first five sprites proved the art direction, but also made the
remaining problem clearer: a wide camera, a fast simulation, and a projectile
starter make individual objects and actions too hard to read for the simple,
engaging environmental game this is becoming.

V0.4.2 changes the baseline before more content or more sprites are built:

1. show less of the arena through a camera zoom so existing actors occupy more
   screen space without changing their world size, bodies, or sprite files;
2. run the playable simulation at half speed as the first experiment; and
3. replace the eco theme's abstract Sorting Pulse with a short-range,
   auto-aimed cleanup grabber that stabs outward and retracts.

<a id="v0-4-2-readability-correction--2026-09-18"></a>
### Readability correction — 2026-09-18

The first integrated play test exposed a bad assumption in R1A: applying the
2× camera to camera-fixed UI made the UI larger only as a raster transform. It
did not give text, panels, or hit areas a higher-quality authored baseline. The
result was fuzzy type, clipped card copy, and menus laid out for the old view.
This correction remains part of V0.4.2 and supersedes any R1A statement that UI
scale should remain unchanged.

The corrected target is:

1. keep the accepted 2× cropped **world** view, but render all UI text at a
   high-resolution baseline with padding for font ascenders/descenders and
   layouts measured inside the visible screen;
2. slow the player walk presentation and omit the generated fourth walk pose,
   whose detached motion marks read as stray particles at the new view scale;
3. add a translucent minimap whose opacity can be changed from Settings;
4. make the Cleanup Grabber hit every enemy intersecting its narrow corridor;
5. give that weapon one dedicated reach track: base level 1 plus four reach
   upgrades, for a maximum weapon level of 5;
6. keep general stat upgrades repeatable without a per-run cap, and distinguish
   weapon upgrades from general upgrades on both choice cards and the catalogue;
7. replace the title screen's single action with exactly Start, Info, and
   Settings. Info and Settings open the same reusable information overlay that
   Escape opens during a run.

No generated sprite is edited by hand. The accepted sheet remains reproducible;
the runtime walk contract simply uses the three clean poses in a slower
0→1→2→1 sequence until a later sprite generation replaces the rejected pose.

<a id="v0-4-2-correction-phase-tracker"></a>
#### Correction phase tracker

- [x] C0 — Plan, UI-quality seam, and reusable menu overlay
- [x] C1 — Player animation cleanup and adjustable minimap
- [x] C2 — Multi-hit grabber and separated upgrade tracks
- [x] C3 — Three-action start menu, integration, and verification

<a id="v0-4-2-c0--plan-and-ui-quality-seam"></a>
#### C0 — Plan and UI-quality seam

**Commit:** `fix(v0.4.2): restore crisp scalable interface rendering`

- Add one UI text factory that applies a high-resolution text texture and safe
  glyph padding, then migrate every HUD/overlay/menu text surface to it.
- Centralise the screen-space UI scale so the world zoom never becomes the
  interface's raster scale.
- Keep all panels content-measured; no line may cross a border at 1600×900.
- Make the pause/info overlay reusable from both MenuScene and RunScene.

<a id="v0-4-2-c1--sprite-presentation-and-minimap"></a>
#### C1 — Sprite presentation and minimap

**Commit:** `feat(v0.4.2): add readable navigation and player motion`

- Use a slower 0→1→2→1 player walk cycle and never show the artifact-bearing
  fourth generated walk pose.
- Add a screen-space minimap showing arena bounds, player, enemies, shrines,
  and hazards without changing simulation or spawning.
- Add Off/Low/Medium/High minimap opacity to the session settings model; use a
  translucent default and expose it in the shared Settings page.

<a id="v0-4-2-c2--grabber-and-upgrade-structure"></a>
#### C2 — Grabber and upgrade structure

**Commit:** `feat(v0.4.2): deepen the cleanup grabber progression`

- Resolve every eligible enemy in the grabber corridor in deterministic
  near-to-far order. The melee weapon has no arbitrary target cap.
- Add a theme-owned reach increment and a capped four-pick weapon upgrade.
  Effective reach drives aim, hit selection, presentation, and stat copy.
- Mark upgrades as weapon or general tracks. General stat upgrades have no
  per-run cap; specialist skill/world definitions keep their authored caps.
- Split weapon and general upgrades visually on choice cards, run summaries,
  and the information catalogue. Catalogue entries include their descriptions.

<a id="v0-4-2-c3--start-menu-and-integration"></a>
#### C3 — Start menu and integration

**Commit:** `fix(v0.4.2): complete the readable menu and upgrade flow`

- Present exactly three title actions: Start, Info, Settings.
- Info opens the shared information overlay; Settings opens that overlay on its
  Settings tab. Escape/back returns to the title when opened outside a run.
- Add unit coverage for UI settings, walk frames, uncapped upgrades, reach
  levels, effective weapon range, and corridor multi-hit.
- Add browser coverage for title navigation, catalogue separation, minimap
  opacity, crisp text metadata, card containment, and multi-hit telemetry.
- Run `npm run typecheck`, `npm test -- --run`, `npm run build`, the focused
  browser suite, the full browser suite, `npm run balance`, and
  `npm run sprites -- check` before marking the correction complete.

The old V0.4.2 content-growth plan had not started. It is now
[`BUILD_PLAN_V0.4.3.md`](./MASTER_BUILD_PLAN.md#v0-4-3-source-plan). The remaining sprite roster is
V0.4.4 work, after this baseline and V0.4.3's content roster are settled.

<a id="v0-4-2-product-decisions"></a>
### Product decisions

<a id="v0-4-2-zoom-changes-the-view-not-the-world"></a>
#### Zoom changes the view, not the world

Start with **2.0× camera zoom**. The renderer remains 1600×900 and the arena,
actor radii, physics bodies, separation, movement distances, and native sprite
sizes remain unchanged. The camera therefore shows roughly 800×450 world units
and crops the surrounding play area. This is exactly the intended effect:
sprites become twice as large on screen because the player is closer to them,
not because their art or hitboxes were enlarged.

The 300-enemy and 192-projectile limits remain technical ceilings, not density
targets. At the tighter view, far fewer actors are needed before the screen
feels occupied. Do not lower either cap until a representative stress run shows
that doing so improves behaviour or performance.

The camera's live `worldView` stays authoritative for off-screen spawning,
shrine visibility, and edge markers. Never substitute the 1600×900 render size
for the zoomed world view.

<a id="v0-4-2-half-speed-is-one-coherent-clock"></a>
#### Half speed is one coherent clock

Start with a **0.5 gameplay rate**: one real second advances 0.5 seconds of
playable simulation. This is an experiment value, not a promise that 0.5 is the
final answer.

The rate applies to player and enemy motion, spawn and weapon cadence, hazard
timing, regeneration, projectiles, melee presentation, and the run clock. A
five-minute authored run therefore takes about ten real minutes at 0.5. UI input,
menus, and audio controls stay responsive at wall speed. Hit-stop and the death
slowdown multiply the base rate; reduced-motion disables those feedback effects,
not the base gameplay rate.

There must be one resolved clock. Do not independently halve move speeds,
double cooldowns, double spawn intervals, and retime animations: that produces
four balance changes which will drift apart when the experiment is adjusted.

<a id="v0-4-2-the-eco-starter-is-a-real-cleanup-tool"></a>
#### The eco starter is a real cleanup tool

The active eco theme starts with a **Cleanup Grabber**, visually based on a
long-handled rubbish pickup tool. It auto-aims at the nearest eligible enemy in
a short forward reach, extends in a narrow stab, damages at most one target,
then retracts. The first version has no projectile entity, splash, pass-through,
or multi-target sweep.

Initial values are deliberately conservative and theme-owned: approximately
72 world units of reach, a narrow contact width, one target, and a one-second
simulated cooldown. The build must tune these with the zoom and half-speed
baseline rather than treating them as engine constants.

Use a delivery union under the neutral stable role `weapon.starter`:

- `eco-guardian`: melee stab delivery, presented as the Cleanup Grabber;
- `knight-magic`: the existing projectile delivery, presented as Magic Needle.

The already-built projectile actor, collision path, and knight-theme content
are parked, not deleted. Persistence has not shipped, so V0.4.2 is the safe
point to replace the delivery-specific `weapon.starter_projectile` stable ID
with the theme-neutral `weapon.starter` role.

Projectile-only and burst-chain upgrade offers must not remain in the active eco
draw after the starter changes. Park pierce, projectile-count, Piercing Momentum,
Compaction Burst, and Cascade with the knight/projectile content for now; do not
silently relabel them as grabber mechanics. The underlying reusable systems may
remain. V0.4.3 decides which interactions return as real-world tools.

The gameplay phase uses a primitive grabber presentation with an animation hook.
V0.4.4 owns the generated sprite sheet after the mechanic, reach, pose, and
frame roles have survived play testing.

<a id="v0-4-2-delivery-model"></a>
### Delivery model

One core agent can build all three features sequentially, but that would hide
their separate effects and make the play-test evidence weaker. Use one short
seam phase, three equivalent parallel feature branches, and one integration
phase.

```text
main after V0.4.1
        |
        v
R0 integration seam on codex/v0.4.2
        |
        +-- codex/v0.4.2-view     (R1A)
        +-- codex/v0.4.2-pace     (R1B)
        +-- codex/v0.4.2-grabber  (R1C)
        |
        v
R2 merge, tune, play-test, and deliver codex/v0.4.2
```

The feature branches are temporary implementation branches. `codex/v0.4.2` is
the milestone branch and the only pull request into `main`.

<a id="v0-4-2-phase-tracker"></a>
### Phase tracker

- [x] R0 — Neutral camera, pace, and weapon-orchestration seams
- [x] R1A — Tighter camera and cropped play area
- [x] R1B — Half-speed gameplay experiment
- [x] R1C — Cleanup Grabber melee starter
- [x] R2 — Combined integration, measurement, and play-test gate

<a id="v0-4-2-phase-r0--land-the-three-seams"></a>
### Phase R0 — Land the three seams

**Commit:** `build(v0.4.2): isolate view pace and weapon delivery seams`

The core agent lands this before the parallel branches are created:

- Add theme-owned view tuning and pace tuning with behaviour-neutral values
  (`zoom: 1`, `gameplayRate: 1`) in separate files for both production themes.
- Add a camera configurator that owns zoom/follow setup and a frame-timing
  resolver that combines the base rate with hit-stop, death slowdown, pause,
  and reduced motion. Wire each into `RunScene` once.
- Route presentation timers, tweens, and sprite animation through a generic
  resolved gameplay-time input while its neutral value is still 1. R1B then
  changes rate data and focused timing logic without taking ownership of the
  completed sprite subsystem.
- Establish a weapon-delivery dispatch boundary while preserving projectile
  behaviour unchanged. The seam may extract orchestration, but it must not add
  the grabber yet.
- Add focused contract tests proving neutral tuning reproduces the current
  camera, clock, and projectile starter.
- Freeze the ownership blocks below. Parallel agents do not edit `RunScene`,
  theme indexes, shared contracts, or shared test fixtures unless R0 explicitly
  assigns that file to their block.

R0 is complete only when the existing unit and browser suites pass with no
observable gameplay change.

<a id="v0-4-2-phase-r1--three-parallel-features"></a>
### Phase R1 — Three parallel features

All three branches start from the R0 commit. Each ends in a playable, testable
feature on its own and reports measurements against the R0 baseline.

<a id="v0-4-2-r1a--tighter-camera-and-cropped-play-area"></a>
#### R1A — Tighter camera and cropped play area

**Branch:** `codex/v0.4.2-view`
**Commit:** `feat(v0.4.2): tighten the arena view`

Owned paths:

- `src/game/content/themes/*/view.ts`
- `src/game/systems/view/**`
- `tests/unit/view/**`
- `tests/e2e/view-scale.spec.ts`

Deliver:

- Set both production packs to 2.0× zoom through theme data.
- Keep the fixed 1600×900 render surface and UI scale unchanged.
- Prove camera `worldView` is approximately 800×450 at the arena centre.
- Prove ambient spawns and arriving shrines remain outside the cropped view,
  including near arena edges, and edge markers still point correctly.
- Capture a representative 1×/2× comparison using the same player position and
  enemy layout. Actors must occupy twice the screen dimension while their world
  radii and separation measurements are identical.

Do not retune speed, cadence, weapon range, hitboxes, actor scale, or sprite
files in this branch.

<a id="v0-4-2-r1b--half-speed-gameplay-experiment-"></a>
#### R1B — Half-speed gameplay experiment ✅

**Branch:** `codex/v0.4.2-pace`
**Commit:** `feat(v0.4.2): slow the playable simulation`

Owned paths:

- `src/game/content/themes/*/pace.ts`
- `src/game/systems/time/**`
- `tests/unit/time/**`
- `tests/e2e/gameplay-rate.spec.ts`

Deliver:

- Set both production packs to `gameplayRate: 0.5`.
- Drive simulation delta, Arcade physics, gameplay timers, tweens, sprite state
  timing, and later weapon presentation from the resolved rate or a documented
  presentation exception.
- Prove two wall-clock seconds advance approximately one simulated second and
  move an unobstructed actor approximately half as far as R0.
- Prove pause advances nothing; reduced motion still runs at 0.5; hit-stop and
  death slowdown multiply 0.5 instead of replacing it.
- Report authored duration and expected real duration together so the ten-minute
  wall-time consequence is visible rather than accidental.

Do not change any authored speed, health, damage, cooldown, director, or hazard
coefficient in this branch.

<a id="v0-4-2-r1c--cleanup-grabber-melee-starter-"></a>
#### R1C — Cleanup Grabber melee starter ✅

**Branch:** `codex/v0.4.2-grabber`
**Commit:** `feat(v0.4.2): replace the eco starter with a cleanup grabber`

Owned paths:

- `src/game/core/archetypes/{ids,contracts,effects}.ts`
- `src/game/content/define-theme.ts`
- `src/game/content/themes/*/{weapons,copy,upgrades,skills}.ts`
- `src/game/entities/**` files created for melee presentation
- `src/game/systems/weapons/**`
- the weapon-delivery section extracted from `RunScene` by R0
- weapon, combat, content, upgrade-pool, and delivery-specific tests

Deliver:

- Replace the flat projectile-only weapon contract with a discriminated
  projectile/melee delivery union and validate each shape independently.
- Migrate the required stable role to `weapon.starter`; keep the knight theme's
  existing values and projectile path under that neutral role.
- Make the eco starter a short, narrow, single-target stab. Targeting and hit
  resolution are pure/testable; the scene only coordinates actors and feedback.
- Add a primitive extend/contact/retract presentation whose timing can later
  select sprite frames without feeding any measurement back into simulation.
- Remove projectile-only and burst-chain offers from the eco level-up pool while
  retaining their knight-theme definitions and reusable systems.
- Update stat descriptions so the eco pause/card surfaces show reach and cycle
  rate, never charges, pass-through, or projectile count for the grabber.
- Prove no projectile actor or projectile-cap slot is created by a grabber stab,
  exactly one eligible target is damaged, targets outside reach are untouched,
  and the parked knight projectile still fires and pierces as before.

Do not generate or claim a grabber sprite in this branch.

<a id="v0-4-2-phase-r2--integrate-and-retune-the-combined-game-"></a>
### Phase R2 — Integrate and retune the combined game ✅

**Commit:** `fix(v0.4.2): reconcile the readable gameplay baseline`

The core agent merges R1A, R1B, and R1C into `codex/v0.4.2`, then evaluates the
combination rather than assuming three passing branches make a good game.

Required reconciliation:

- Update the balance simulator for delivery kinds and print simulated duration
  beside real duration at the active gameplay rate.
- Replace the projectile engagement-envelope assertion with delivery-specific
  guards. A projectile must cover its declared range; a melee weapon must never
  claim off-screen reach and must receive an enemy within a measured opening
  wait.
- Measure first contact, first successful grab, first kill, first level-up,
  enemies visible at 30/60/120 simulated seconds, and peak visible occupancy.
- Run the 300-enemy stress path at 2× zoom and record frame time. The cap remains
  300 unless measurement—not screen appearance—requires a change.
- Test the combined visual result: the tighter camera and 0.5 rate should make
  the Environment Protector and grabber action readable without making the
  opening empty or traversal tedious.
- Tune only through theme data. If the opening is too quiet, prefer arrival
  distance/cadence changes over undoing the readability goals.
- Update `THEME_ARCHETYPES.md`, the sprite manifest, and the V0.4.4 inventory.
  The old Sorting Pulse rows become parked knight-theme work; the unclaimed eco
  weapon row becomes the Cleanup Grabber only after its frame roles are known.

<a id="v0-4-2-play-test-gate"></a>
#### Play-test gate

Do not start V0.4.3 until a short play test answers yes to all five:

1. Can the player identify the four enemy sprites without pausing?
2. Can the player see the grabber extend, make contact, and retract?
3. Does the opening produce interaction soon enough despite half speed?
4. Does the screen feel occupied well below the 300-enemy ceiling?
5. Is the simpler single-target starter engaging for at least the first two
   simulated minutes without relying on pierce, splash, or chain effects?

If 0.5 is too slow, test 0.6 or 0.75 through the one pace value. If 2× is too
tight, test 1.75 through the one view value. Do not compensate by changing actor
size or scattering timing literals.

<a id="v0-4-2-verification"></a>
### Verification

Each branch runs its focused unit/browser paths plus:

```text
npm run typecheck
npm test -- --run tests/unit/content tests/unit/architecture
npm run build
```

R0 and R2 additionally run the full suite from V0.3's verification convention:

```text
npm test -- --run
npm run test:e2e:ci
npm run balance
npm run sprites -- check
```

<a id="v0-4-2-definition-of-done"></a>
### Definition of done

V0.4.2 is complete when the active eco game renders a cropped 2× world view
behind a crisp independently-scaled interface, runs its coherent simulation at
0.5 rate, and starts with a short path-based Cleanup Grabber whose full motion
is readable. Neither the zoom nor sprite
presentation changes simulation geometry; the knight theme still proves the
parked projectile path; the active eco upgrade pool offers no dead or
projectile-only cards; the full suite passes; and the play-test gate is recorded
before V0.4.3 begins.


<a id="v0-4-2-1"></a>
## V0.4.2.1 — Contact and material families

This is a corrective increment after the first V0.4.2 play test. It fixes what
the tighter view revealed, adds one optional Cleanup Grabber technique, and
turns the eco enemy roster into explicit material families before V0.4.3 grows
the game. It does not add a second weapon, persistence, or the remaining sprite
roster.

The player-facing content map is [`ECO_CONTENT_MAP.md`](./ECO_CONTENT_MAP.md).
Runtime definitions and theme copy remain the implementation authority; the map
is the editorial/design source that those definitions and the future in-game
catalogue must be checked against.

<a id="v0-4-2-1-decisions-locked-for-this-increment"></a>
### Decisions locked for this increment

- The player walk animation must read as deliberate movement, not flashing. It
  advances from accumulated movement distance (or equivalent movement-state
  timing), never raw render-frame time, holds a pose for at least 300 ms at the
  current walking speed, and shows the idle frame while stationary.
- The minimap is anchored to the bottom-right safe area and must not overlap the
  HUD or any full-screen information overlay.
- The opening movement hint disappears on the first meaningful movement input
  or after 20 seconds of active, unpaused real time, whichever happens first.
- Player and enemy contact circles are authored to match the intended visible
  footprint as closely as a circle can match irregular pixel art. Physics never
  measures a bitmap. Theme data owns both the gameplay radius and presentation
  diameter, and a debug overlay/visual test verifies their agreement.
- Every enemy is walk-through. Player/enemy contact applies a small, cooldown-
  limited, theme-owned knockback to the player. Enemy/enemy separation and
  obstacle collision remain unchanged.
- The Cleanup Grabber retains its owned reach track and gains a separately
  acquired, five-level weapon track named **Collection Sweep**.
- `enemy.fast_fragile` changes from Plastic Bag to **Microplastics**. Bagged
  Waste remains the large rubbish-bag/death-spawner role.

<a id="v0-4-2-1-phase-tracker"></a>
### Phase tracker

- [x] P0 — Contract, content IDs, tuning seams, and catalogue mapping
- [x] P1 — Walk animation, minimap anchor, and opening-hint lifetime
- [x] P2 — Contact footprints, walk-through enemies, and player knockback
- [x] P3 — Collection Sweep levels 1–5
- [x] P4 — Microplastics, Glass Shards, material spawn relations, and integration

Each phase is one reviewable commit and updates `RECONCILIATION.md` when it
discovers or changes a reusable rule.

<a id="v0-4-2-1-p0--contract-and-data-seam"></a>
### P0 — Contract and data seam

**Commit:** `plan(v0.4.2.1): define contact and material family contracts`

- Add a stable stationary-fragment enemy role and a stable Collection Sweep
  upgrade/skill ID. Do not encode eco names in core IDs.
- Extend theme-owned tuning for authored sprite display diameter, contact
  knockback impulse/cooldown, sweep cadence/area, and material child mappings.
- Model death children as a bounded list or tagged family, not one hard-coded
  child ID. Validate that a family cannot recursively spawn itself.
- Add catalogue descriptors that can be derived from runtime definitions plus
  theme copy. Do not create a second set of gameplay numbers in the catalogue.
- Update the accepted Plastic Bag manifest entry only as part of an explicit
  regeneration/migration phase; never rename its files and pretend the old art
  depicts Microplastics.

<a id="v0-4-2-1-p1--readable-presentation"></a>
### P1 — Readable presentation

**Commit:** `fix(v0.4.2.1): stabilise player motion and navigation UI`

- Replace the current clock-driven flashing with a movement-state animator.
  Reset to idle when stopped; accumulate distance/time without skipping through
  multiple visible poses after a long frame or overlay pause.
- Move the minimap to the bottom-right with UI-scale-aware margins. Hide it
  beneath Info/Settings and other full-screen overlays.
- Give the starting movement hint one run-local dismissal state. Dismiss it on
  the first non-trivial player displacement or at 20 seconds of active real
  play; fade once, then destroy it.
- Add focused browser captures at the supported viewport and UI scales.

<a id="v0-4-2-1-p2--contact-that-matches-what-the-player-sees"></a>
### P2 — Contact that matches what the player sees

**Commit:** `fix(v0.4.2.1): align contact footprints and allow traversal`

- Audit the player and every enemy with a physics debug overlay. Author body
  radii and sprite display diameters together from the intended footprint;
  irregular shapes keep a conservative circular approximation.
- Remove player displacement by solid enemy roles. All enemies may overlap the
  player path; retain enemy/enemy separation and heavy-role mass differences.
- On valid damaging contact, apply a small knockback to the player away from the
  enemy. Gate repeated pushes with contact cooldown so a crowd cannot vibrate or
  pin the player. Put every magnitude in theme tuning.
- Unit-test direction, cooldown, and zero-distance fallback; browser-test that a
  player can cross each role and that visible contact is credible.

<a id="v0-4-2-1-p3--collection-sweep-weapon-track"></a>
### P3 — Collection Sweep weapon track

**Commit:** `feat(v0.4.2.1): add the collection sweep grabber track`

Collection Sweep starts unowned and is offered separately from Longer Grabber
and general upgrades. A completed grabber attack increments its counter once,
regardless of targets hit. Level changes do not reset the counter.

| Level | Trigger | Effect |
| --- | --- | --- |
| 0 | — | Not owned; no sweep |
| 1 | Every 8 attacks | One circular sweep at maximum reach |
| 2 | Every 6 attacks | Same sweep, faster cadence |
| 3 | Every 4 attacks | Same sweep, faster cadence |
| 4 | Every 4 attacks | One sweep halfway through extension and one at maximum reach |
| 5 | New seeded interval of 2–4 attacks after each trigger | Keep the level-4 sweeps and add 1–3 seeded positions along the weapon path on extension and 1–3 on retraction |

- Roll cadence and extra positions once per trigger from the run's seeded RNG;
  never roll per render frame.
- Hit geometry is authored independently of animation. Each sweep hits every
  eligible enemy in its circle once per sweep and uses the attack's resolved
  damage/critical result. Radius and any damage multiplier are theme tuning and
  must be checked with `npm run balance` before acceptance.
- Present extension and retraction sweeps clearly without adding projectile
  entities. Add exact tests for levels 1–4 and bounded deterministic tests for
  level 5.

<a id="v0-4-2-1-p4--material-family-enemies"></a>
### P4 — Material-family enemies

**Commit:** `feat(v0.4.2.1): add microplastic and glass fragment families`

- Rename the eco presentation of `enemy.fast_fragile` from Plastic Bag to
  **Microplastics** and replace its sprite through the manifest claim/generate/
  accept/build workflow. Art is a readable cluster of typical multicolour waste
  shards/pieces, not glitter or detached motion particles.
- Add a stationary **Glass Shards** role. It does not chase, still deals
  cooldown-limited contact damage while the player remains on it, counts toward
  the enemy cap, can be cleared, and cannot fragment again.
- Change Fragmentation routing:
  - Plastic Bottle → Microplastics.
  - Glass Bottle → Glass Shards.
  - Microplastics and Glass Shards → no further fragments.
  - Bagged Waste → its all-material breakup below; do not also apply the generic
    two-child fragmentation path.
- Bagged Waste releases Plastic Bottle, Microplastics, and Glass Bottle when it
  breaks. It never releases another Bagged Waste, so the relationship is finite.
  Glass Shards remain a glass-fragment result rather than a primary bag child.
- Replace same-parent scaled fragments; no system may infer child identity from
  sprite art. Retained capacity-bound child spawns preserve causal ordering.

<a id="v0-4-2-1-verification-and-completion-gate"></a>
### Verification and completion gate

Run the V0.3 short suite plus:

```text
npm run typecheck
npm test -- --run
npm run build
npm run test:browser
npm run balance
npm run sprites -- check
```

Acceptance also requires one recorded visual/contact pass showing: stable walk
poses; bottom-right minimap; both hint dismissal paths; debug circles aligned
with player and all enemy silhouettes; traversal through every enemy role with
slight knockback; deterministic Collection Sweep behavior at every level; and
finite material-family spawning below the 300-enemy cap.

This was the prerequisite gate for V0.4.3; the completion record below
records its acceptance.

<a id="v0-4-2-1-completion-record--2026-09-21"></a>
### Completion record — 2026-09-21

The automated visual/contact path records the supported viewport with the
bottom-right minimap, both hint dismissal paths, debug body circles, traversal
through the five-role roster, cooldown-limited contact shove, and a live
Collection Sweep trigger. Levels 1–4 have exact cadence/position tests; level 5
has seeded bounded tests. The material graph is validation-tested as finite,
the five-child Bagged Waste breakup is browser-tested below the 300-enemy cap,
and the Microplastics replacement passed the manifest acceptance/build check.

Completion gate: `npm run typecheck`, the 403-test unit suite, production build,
73-test Chromium suite (one opt-in measurement skipped), Collection Sweep
balance model, and five-sheet sprite check all pass.

Post-completion animation correction (2026-09-21): recorded play exposed idle
flashes on render ticks with zero displacement but non-zero body velocity. The
player now holds its current distance-driven pose across those ticks, and every
moving player/enemy sprite keeps the accepted sheet's regular left-facing
orientation while mirroring for rightward motion. Pure animation coverage locks
both behaviours.


<a id="v0-4-3-corrections"></a>
## V0.4.3 — Completed Q1–Q5 corrections

<a id="v0-4-3-corrections-q1--player-presentation-and-selected-difficulty-presets"></a>
### Q1 — Player presentation and selected difficulty presets

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
do not infer correct facing from the mirrored boolean alone.

Q1 evidence (2026-10-12): 414 units / 48 files, typecheck/lint/build; full
Chromium regression (75 pass, one existing opt-in skip), four difficulty browser
cases including next-run settings, and all three serial stress cases pass.
Actual PNG/browser inspection confirms authored right-facing walks and left-facing
hit-pose correction; a 136-frame movement trace has no idle flashes/wrong flips.
World title/hint textures use resolution 4 at 2× camera zoom. See REC-105/106 and
`AUTONOMOUS_PROGRESS.md` for balance evidence and limitations.

<a id="v0-4-3-corrections-q2--event-readability-roster-inspection-opening-composition-and-spawn-accounting"></a>
### Q2 — Event readability, roster inspection, opening composition and spawn accounting

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

<a id="v0-4-3-corrections-q3--wrap-up-corrections-and-session-3-handoff"></a>
### Q3 — Wrap-up corrections and Session 3 handoff

Owner-requested before starting P2: investigate clipped/missing upgrade detail,
stationary aqua shards, slow timer and detached glass pixels; link sprite browser
back to the architecture atlas; reconcile documentation and prepare a new-session
prompt. At this historical checkpoint P2 had not started. Ownership: upgrade selection/description rules and
RunScene offer call site, level-up overlay layout and corresponding tests;
sprite browser navigation, architecture snapshot/status, Vite atlas entry,
production navigation/report-output check, manifest review notes,
plans/progress/README/reconciliation and `MASTER_BUILD_PLAN.md#v0-4-3-performance`. No bitmap changes,
clock/fragment tuning, cap increase or optional content is authorized by this correction.

Commit: `fix(v0.4.3): bound upgrade cards and close capped skill offers`

- [x] Q3 — focused upgrade/layout/navigation/roster/clock gate, types/units/lint/
  build, production check and browser regression; inspect live layout and record
  findings. The concurrent atlas/roadmap work was preserved at that checkpoint.

Q3 gate (2026-10-12): final types/lint/build and **424 units / 50 files** pass;
13 focused browsers, full Chromium **81 pass / one existing opt-in skip**, final
strengthened per-card containment/pointer regression and **3 serial stress cases**
(34.9 s) pass. Built production diagnostics/boot/play/pause/tool/atlas navigation
passes with zero browser errors. Visual layout and accepted/packed art inspected.
See REC-111 and the new-session `MASTER_BUILD_PLAN.md#v0-4-3-performance`. No new sustained performance
comparison was required or claimed by this correction.

<a id="v0-4-3-corrections-q4--one-hit-opening-microplastics-and-starting-stat-inspection"></a>
### Q4 — One-hit opening Microplastics and starting-stat inspection

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
The owner-requested PR was a draft checkpoint; P2 followed later.

<a id="v0-4-3-corrections-q5--pr-24-actions-repair"></a>
### Q5 — PR #24 Actions repair

Owner explicitly requests fixing failed Actions checks in the existing PR.
The two captured failed runs stop at Chromium regressions: short movement,
bottle-unlock and Collection Sweep waits fail under the slower simulated clock;
the layout screenshot uses a macOS-only absolute directory. Two level-up paths
are also flaky on CI. The dependency audit is skipped behind that failure and
REC-113 then needed remediation; P2 followed after this repair.

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
  zero audit vulnerabilities. P2 followed later; latest PR head remains the
  publication verification authority.


<a id="v0-4-3-performance"></a>
## V0.4.3 — Completed P0–P4 performance slices

<a id="v0-4-3-performance-historical-ownership"></a>
### Historical ownership

| Phase | Ownership / permitted scope | Commit subject |
| --- | --- | --- |
| P0 | Active plans, `AGENTS.md`, `README.md`, `AUTONOMOUS_PROGRESS.md`, `RECONCILIATION.md`, roadmap status; known lint defect in `tests/unit/weapons/collection-sweep.test.ts`; `src/test-support/**`; frame sampling only in `src/game/scenes/run-scene.ts`; `tests/unit/performance/**`, `tests/e2e/frame-measurements.spec.ts`; opt-in `scripts/performance.ts`, measurement command only in `package.json`, measurement config/tests and `build/performance/**` reports | `build(v0.4.3): establish browser performance measurements` |
| P1 | Telemetry call sites in scenes, main boot failure, test-support bridge, architecture/production guard tests; measurement reports/script and bench-only load/cap options per Q2 | `perf(v0.4.3): avoid production telemetry work` |
| P2 | `src/game/ui/{minimap-ui,hud,ui-text}.ts`, corresponding scene presentation hooks, theme presentation tuning and UI tests; measured dependency: opt-in `scripts/performance.ts` and `build/performance/P2*` profiles/reports to compare visible/hidden/paused interface work without runtime diagnostics | `perf(v0.4.3): reduce repeated interface work` |
| P3 | Profiled existing spatial/separation/effects/events/weapons hot paths and scene call sites; exact measurement dependencies: `scripts/performance-p3.ts`, `scripts/performance.ts`, `src/game/systems/statistics/run-statistics.ts`, corresponding `tests/unit/statistics/**`, existing `tests/e2e/phase-{five,nine}-v03.spec.ts` and compound stress gates, and `build/performance/P3*`; measurement-only archived theme selection/fixture controls, no production content changes | `perf(v0.4.3): reduce measured simulation overhead` |
| P4 | Measured rendering/presentation hooks, config, settings/UI, theme presentation tuning, content validation and presentation tests; exact dependencies: `scripts/performance.ts`, `src/game/ui/{minimap-ui,pause-menu-ui}.ts`, setting dispatch in `src/game/scenes/{run,menu}-scene.ts`, `src/game/state/settings-state.ts`, `src/game/core/archetypes/tuning.ts`, both themes’ `view.ts`, `src/game/content/define-theme.ts`, matching settings/content/UI units, `tests/fixtures/alternate-theme.ts`, `tests/e2e/presentation-v043.spec.ts`, and `build/performance/P4*`. Repository testing policy in `AGENTS.md` follows owner’s limited-local-browser instruction | `feat(v0.4.3): add a lightweight presentation mode` |

<a id="v0-4-3-performance-recorded-verification"></a>
### Recorded verification

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
REC-115. P3 followed after this checkpoint.

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
was pulled forward. P4 followed later; current gates are in BUILD_STATUS.md.

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
P5 followed after this checkpoint and resolved REC-117 in the lifecycle slice.


<a id="v0-4-3-p5-slices"></a>
## V0.4.3 — Verified P5 lifecycle and startup slices

These two slices are verified; **P5 as a whole remains incomplete**.
Remaining acceptance stays in the active plan, not this completed record.

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
limits. Startup followed in Session 7; remaining P5/P6 acceptance is recorded
in BUILD_STATUS.md. No content, art or persistence work was included.


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
No P6/content was included. Publication/CI evidence is now in BUILD_STATUS.md.
See `performance/P5_STARTUP_REPORT.md`.


<a id="v0-4-3-ci-repair"></a>
## V0.4.3 — Verified PR #25 CI repair

The repair uses Playwright-owned screenshot paths and bounded total scenario
budgets without changing input actions, assertions, retries or gameplay.
Local evidence: three affected serial browser cases, 474 units/56 files, types,
lint and build pass. Publication and matching-head Actions verification are
recorded in [BUILD_STATUS.md](BUILD_STATUS.md). Full evidence and reproduction:
[CI repair report](performance/CI_REPAIR_20261016.md), REC-114.


<a id="v0-4-3-p5-acceptance-inventory"></a>
## V0.4.3 — P5 acceptance inventory / Session 8

Session 8 (2026-10-16) completes the requirement/evidence inventory in
[`performance/P5_ACCEPTANCE_REPORT.md`](performance/P5_ACCEPTANCE_REPORT.md).
Inspected short-run decision/endless/clearing/death/restart, pause/resize,
Default/Low, engine shutdown, queue/XP and boot recovery tests support only their
bounded claims. Native visibility, authored/extended play, ten terminal cycles,
long soak, real audio release and broader compatibility remain in the active
P5 gate. No runtime defect was demonstrated; no runtime/test change is delivered.
A single headed native-tab probe fails its hidden-state precondition in 6.3 s,
so its temporary fixture is removed and native acceptance remains pending.
Final types, 474 units/56 files, lint/build and whitespace pass. No full browser/
stress/startup campaign is repeated. PR #25's merge is recorded in BUILD_STATUS;
this slice stays local. The next handoff is Session 9 / P5, not P6.


<a id="v0-4-3-p5-native-events"></a>
## V0.4.3 — P5 bounded native events / Session 9

Session 9 (2026-10-16) verifies one native same-window Chromium tab round trip
using a fresh owned browser attached with Playwright noDefaults. This avoids
its normal focus emulation; two setup failures remain recorded separately.
Trusted events, matching native window IDs, frozen hidden elapsed/spawns/empty
queues and a 7.493 ms first observed rAF advancement pass. The 30-second-bounded
case completes in 4.4 s (5.1 s runner total), one worker/zero automatic retries,
M5 Pro/48 GiB, native Metal WebGL, Chromium 151.0.7922.34, test/Default,
1280×657/DPR1. Fourteen deterministic actual-handler tests cover both themes'
focus ownership and retained paused/level_up/time_up/terminal intent. Final
488 units/57 files, types/lint/build and whitespace checks pass. No runtime fix,
production boundary, content, persistence or sprite change. Raw capture and
limits are in the [acceptance report](performance/P5_ACCEPTANCE_REPORT.md).
P5's long lifecycle, native overlays/pending work, real audio and broader device/
browser gate stays open. Session 10 requires an authorized consolidated gate/
available hardware; another identical light case cannot close it. P6 is not
started. Publication/merged-head Actions evidence remains in BUILD_STATUS.md.


<a id="v0-4-3-p5-consolidated-lifecycle"></a>
## V0.4.3 — P5 authorized consolidated lifecycle / Session 10

Owner approval on 2026-10-19 authorizes one serial M5 campaign. The accepted
case runs 1,200,458 ms, one worker/zero automatic retries, with frozen test-only
fixture sources and unchanged runtime/assets/dependencies. It reaches exactly
300,000 simulated ms at rate 0.5, extends endless for five wall-clock minutes,
then verifies ten short terminal cycles and fresh active play. Twelve create/
stop baselines, ten quality/resize dispatches, native manual-pause/level-up/time-up
intent and one pending arrival, ledger/source totals, and thirteen actual closed
AudioContexts (seven closures with active service voices) pass without page errors.

All 488 units/57 files, types/lint/build, production emitted-marker exclusion,
source/raw hash validation and whitespace/link review pass. Preflight errors,
actual M5/Metal/DPR2 environment, survival/focus controls, sampled counter scope,
short-cycle setup, explicit final stop before Game destruction, and unassisted/
hazard/physical-device limitations are documented in
[the campaign report](performance/P5_CAMPAIGN_REPORT.md). No production defect
or fix, no full local regression/stress, no publication or workflow trigger.
The scoped lifecycle slice passes; P5 overall remains open for broader browser/
device compatibility with owner-selected scope/hardware. Session 11 stays P5;
P6/content remain gated and the unchanged campaign is not repeated by default.


<a id="v0-4-3-p5-compatibility"></a>
## V0.4.3 — P5 available-engine compatibility / Session 11

Owner delegated desktop support selection and authorized the missing browser
checks on 2026-10-19. Selected current/previous-major desktop Chrome/Edge/Firefox/
Safari on vendor-supported OS, WebGL/WebAudio and keyboard/mouse; mobile/touch
outside this desktop contract. **52 focused checks pass in 4.9 minutes**, one
worker/zero retries, installed Chrome155 and pinned Chromium151/Firefox153/
WebKit26.5 on M5/macOS. Main WebGL and isolated both-theme Canvas lifecycle
checks cover movement/half-rate/pause, exact overflow rewards/stopped resources,
settings/resize/short terminal restart, overlays and 300-live map presentation.

Only tests/config/evidence changed: 80ms key holds prevent Phaser JustDown
loss, and a resize readiness assertion avoids stale canvas click coordinates.
Interrupted setup attempts remain recorded. Four final capability probes pass
after a TypeScript nullable guard correction; final 488 units/57files, types/
lint/build/whitespace pass. No runtime defect/fix, production boundary change,
long/native campaign repeat, dependency change or remote publication.
[Compatibility report](performance/P5_COMPATIBILITY_REPORT.md) preserves policy,
renderer/DPR/source/raw details, fixtures/limits and deferred evidence. Actual
Safari/Edge, missing branded-release/platform combinations and physical older
integrated-GPU hardware remain pending; WebKit/software rendering is not their
acceptance. P5 remains open; P6/content not started. Session12 remains P5.


<a id="v0-4-3-p5-branded"></a>
## V0.4.3 — P5 branded-browser follow-up / Session12

26 serial focused checks pass across native stable Edge155/154 applications;
two unpatched headed Firefox158/157.0.1 application smokes pass, on M5/WebGL,
with vendor checksum/signature verification and fresh owned profiles. Safari26.5.2
still blocks session creation before gameplay because automation is disabled.
No runtime/dependency change. [Follow-up report](performance/P5_COMPATIBILITY_FOLLOWUP.md)
retains exact scopes, raw records and cleanup. Owner confirms no older device;
P5 remains open for missing browser/platform/device evidence. Native/long accepted
campaigns were not repeated. P6 software preparation is explicitly authorized,
not a hardware pass or content gate waiver.

<a id="v0-4-3-p6-software"></a>
## V0.4.3 — P6 verified software/readiness-tool slice / Session12

The combined local gate passes96 Chromium/browser/stress cases, six explicit
opt-in skips, zero retries/flaky cases;488units/57files,types/lint/build/audit
and whitespace pass. Eight focused cases repair two evidenced CI fixture flakes
without runtime or assertion changes. The portable instrumented device kit is
built separately from production and verified with a real60-second export and
server-boundary case. Clock/CPU scope and manual target checklist are explicit.

18 independent warmed60-second Default/Low windows at60/150/300 actors complete
in1,297.8s on M5/SwiftShader, with exact populations, no errors or >100ms stalls.
Median p95 Default25.1/25.5/41.7ms; Low17.6/24.3/25.0ms. Tool/runtime source hashes
match. No production throughput, native event, continuous-soak or older-device
acceptance is inferred. [P6 report](performance/P6_READINESS_REPORT.md) retains
raw results/limits; P5 and overall acceptance remain open. Required owner reply
on release-versus-build gate classification is pending; C1–C7 has not started.


<a id="v0-4-3-c1-foundation"></a>
<a id="v0-4-3-c1-foundation"></a>
### V0.4.3 C1 foundation — automatic slots and attack ownership (2026-10-20)

Owner explicitly approves planned C1–C7 after verified software checks while
missing P5/P6 browser/device acceptance remains release-blocking. This is an
ordering revision, not missing evidence being accepted.

Completed local foundation: theme-owned two-slot capacity, serializable ordered
loadouts with independent successful-attack clocks and no catch-up bursts;
restart reconstructs starting slots/clocks and retains difficulty. Actual melee
and in-flight projectile hits carry their own weapon's armour, knockback and
lethal source identity. Existing ledger, XP, rate0.5 and shutdown ownership stay
intact. Normal play still has only its original starter.

Typecheck,495units/58files, lint/build/diff and11 unique affected serial browser
cases pass (one new-case fixture armour-points correction explicitly recorded).
No full/stress/native/long/startup campaign repeated or later-head CI inferred.
See [C1 foundation report](content/C1_FOUNDATION_REPORT.md). C1 second tool,
owned offers, splash, simulator and combined gate remain in the active plan;
C2–C7 are not started. No new publication or workflow dispatch.


<a id="v0-4-3-c1"></a>
### V0.4.3 C1 — second tool, owned upgrades and on-hit splash (2026-10-20)

Verified local phase on `codex/v0.4.3`, following foundation3b2b927. Ordinary
level-up offers equip Cleanup Vacuum / Runic Fan in the empty second slot.
Existing melee/projectile union extended with optional authored sector geometry;
no parallel delivery system. Both slots fire independently. Weapon-owned offers
live beside their definitions, require that owner equipped, and apply local
modifiers while shared upgrades remain shared. Acquisition is one-time/common;
tier scaling/rounding/floors remain for progression. Pause stats expose both tools.

Bounded non-recursive on-hit splash has its own capped applied-damage ledger
column, weapon source and floating-number aggregation; on-kill explosion stays
distinct. Skip primary-list entries already killed by prior splash. The exact
eco probe records27 actual damage /10.2 splash /three kills /3XP, and flushes
all30.6 intended display damage, overkill included. A controlled dead-primary
probe leaves one health rather than gaining a false splash. Theme definitions
own all ranges, angles, cadence, damage and limits. Rate0.5, XP, caps, sprites,
persistence/dependencies and Phaser physics shutdown ownership remain unchanged.

Typecheck,509units/59files,lint/build/diff pass.15 unique affected serial browser
cases verified across the14-case combined gate and final5-case feedback subset;
zero retries/failures. Both-theme real-XP/keyboard acquisition and owner-card
choices, restart, bounded300-mixed active combat in Default/Low, prior independent
clocks/in-flight provenance, cards/pause/resize/grabber/sweep and terminal damage
flush. Test/SwiftShader WebGL, not hardware compatibility. Actual logical/display
viewport, explicit fixture aids, partial/preliminary source distinctions, exact
observations/hash records and reviewed screenshot paths are in
[C1 report](content/C1_SECOND_TOOL_REPORT.md). Both themes/all eight models/three
difficulties run through balance; two new contact bands model the second tool.

C1's local gate passes; C2 evolution is next. P5/P6 missing browser/platform/older
physical integrated-GPU evidence remains release-blocking under owner approval,
not passed. Old frozen measurements/portable pack do not certify changed source.
No full/long/native/startup campaign, new publication, dependency or sprite work.


<a id="v0-4-3-c2"></a>
### V0.4.3 C2 — same-slot weapon evolution (2026-10-20)

Owner explicitly temporarily waives outstanding actual Safari, missing selected
browser/OS combinations and older physical integrated-GPU checks. They are waived/
unverified, never passed, superseding the earlier release-blocking classification
for now. Prior reports remain source/scenario-bound; no support certification or
new campaign/publication is inferred. C1/C2 local gates pass; C3 is next.

Theme-owned standalone evolution choice unlocks after four actual secondary reach
picks. Tier quality keeps earned gains without counting extra picks. New Cyclone
Vacuum/Runic Tempest definitions replace the source in its ordered slot, preserving
capacity, other slots and next attack clock. Transfer exact local modifiers once,
retain global gains/selected/tallied IDs, remove obsolete offers, reject stale or
duplicate choice without spending pending credit, and reset to the starting loadout.
Definitions/copy use the existing cone/splash presentation and bounded damage path;
no XP/rate0.5/enemy tuning, dependency, persistence, sprite or physics teardown edit.

Ownership: core ids/effects, theme validation and both themes' weapons/index/copy,
upgrade application/eligibility/tiers/description, weapon-loadout replacement,
build-models/pacing-simulator, deterministic evolution and affected selector/tier
units, existing second-tool browser fixture, reports and governing documentation.
No production test control is introduced. A replacement keeps immutable launch
snapshots and exact actual weapon provenance through the existing attack path.

527units/60files,typecheck/lint/build/diff pass;18 new deterministic cases.
Initial8 browsers:7pass/1fixture assertion failure in25.055s. Three-target eco
combat has no splash lethal; correct to four targets, no runtime fix. Two corrected
evolution cases pass14.6s; after final player-copy shortening only those two pass
14.5s. Eight unique affected cases verified, all serial/one worker/zero retries.
Both themes take actual XP/80ms keyboard offers into evolution, retain57.6 earned
reach and1400clock, record36/40actual damage with19.8/21.8splash,4kills and4/8XP,
direct/splash evolved provenance. Short Low300-mixed rounds keep cap/ledger and
drain queues; aided/test/software-renderer scope is explicit. Screenshots reviewed
under testInfo.outputPath. Ten models/both themes/three difficulties run balance,
with ideal contact/earliest level7 bands, no survival/offer-frequency inference.
See [C2 report](content/C2_REPORT.md) and exact source/result/build hashes.
Full/native/long/startup campaigns deferred; marker exclusion inspected without
repeating startup browsers. Owned server/browser resources cleaned,4213 untouched.
Session15 prompt retired after this durable record; Session16 continues C3.


<a id="v0-4-3-c3"></a>
### V0.4.3 C3 — additional shrine and run-local curses (2026-10-20)

Add Unmanaged Dump/Shrine of Defiance as sixth scheduled shrine at86% progress:
+1.2Chaos and×1.4XP product through the existing world-multiplier actor, placement,
interaction, guide and spent/reset paths. Two one-time normal-level-up curses:
Overflow Contract/Frenzy Pact (×1.3arrival/×1.2XP products) and Contamination Pact/
Doom Pact (+0.8Chaos/×1.25XP product). Both themes own definitions/offers/copy.
Curse acceptance records stable IDs separately from shrine activations, composes
existing world products exactly once, stays untiered, rejects stale choices without
spending pending credit, and clears on restart. No actors/timers/queues/profile
adapter, new enemy tuning, sprite/delivery or physics teardown change.

Screenshot review reproduces a hidden numeric reward: the existing three-row
card detail cap truncates XP after secondary pressure effects. Prioritize resolved
XP/Chaos/arrivals for curse descriptions only; retain all other lines/order.
Actual rendered-text and deterministic regression verify visible reward. A test
expected×1.5 after an accepted arrival curse but omitted the existing Chaos bonus;
correct expected×1.8, not gameplay coefficients. Reverse product-order tests use
floating tolerance, preserving fractional XP without artificial rounding.

Ownership: core IDs/contracts/effects; theme validation and both themes' shrines/
curses/index/copy; world-modifiers, upgrades/tiers/describer, run state and narrow
scene wiring; simulator initial-world fixture and balance CLI; alternate fixture,
world/content/tier units plus20 C3 rule cases and bounded browser fixture; reports
and governing records. Existing shrine/upgrade tests keep meaningful assertions
with new baseline metadata, optional role and all-role Chaos5.4.

547units/61files,typecheck/lint/build/diff pass. Initial7 browsers pass40.098s;
visual correction followed by2fixture expectation failures, corrected final2pass
12.4s. Seven unique affected cases verified, all serial/one worker/zero retries.
Both themes use real XP/seeded eligible draw/80ms keyboard and E activation,
repeat refusal, tagged0.375XP→1.18125once, pause/resize and reset. Short requested
300-mixed active intervals stay≤cap300/current278/300, backlog0; scripted clock/
travel/aids and software renderer limits explicit. Existing natural shortened
arrival/placement/guide and retained Duplication cases also pass.

120 coarse balance scenarios compare60 baseline (raw output identical to C2)
with60 all-C3-choices-at-start fixtures, not human survival/offer-frequency/
throughput evidence. See [C3 report](content/C3_REPORT.md) and exact source/result/
build/image hashes. External browser/device checks remain temporarily waived/
unverified under owner revision; old P5/P6 results/kit remain source-bound.
No full/native/long/startup campaign, publication or dependency change. Owned
resources cleaned and4213 untouched. Session16 retired after recording;
Session17 continues C4 elite modifiers; its completed record follows.


<a id="v0-4-3-c4"></a>
### V0.4.3 C4 — bounded elite family (2026-10-20)

Baseline elite chance remains; successful rolls choose baseline/split/shield/
acceleration. Both themes own tuning and copy; exact variant IDs inherit without
reroll across duplication, role offspring and Fragmentation. One split generation
(two same-role children) retains lineage depth and half source reward per child;
elite/world multipliers apply once. Shield halves damage above half health before
actual capped ledger; acceleration ramps×1→1.5 over3000 simulation-ms and freezes
outside playing. Theme markers2/◇/» follow sprite/primitive actors and clean up
on destruction; Phaser teardown remains engine-owned. Existing chase defaults for
non-split descendants remain, split movement inherits.

Reproduced capacity defect drops the second queued split when one slot is free.
Returnfalse from the existing causal lane at capacity, retaining work; deterministic
actual-method tests lock pending identity/reward/depth and24-event budget. Browser
probe records failedpending0 before fix and correctedpending1→0 after space frees.
No speculative lifecycle change.

`src/game/core/archetypes/{categories,contracts}.ts`, `src/game/content/define-theme.ts`, both themes’ `elites.ts`/`copy.ts`, `src/game/systems/elites/elites.ts`, `src/game/entities/enemy-actor.ts`, narrow spawn/death/damage/movement/telemetry wiring in `src/game/scenes/run-scene.ts`, `tests/unit/elites/**`, affected content fixtures/tests, `tests/e2e/elite-family-v043.spec.ts`, and C4 reports plus governing plan/status/master/progress/reconciliation/theme/content-map/handoff/README records. No later phase scope.

561units/63files,typecheck/lint/build/diff pass;14new deterministic cases. Six unique
affected serial browser cases verify rules/wiring/existing interactions, zero
retries. Final expanded both-theme probe includes100parent→200child burst, depth1,
300kills, cap≤300, empty queues. Shield ledger1then2, raw taggedXP7.5 exactly,
zero-reward fracture children, duplication/offspring IDs and paused acceleration.
Screenshots reviewed under testInfo.outputPath; source/build/image hashes in
[C4 results](content/C4_RESULTS.json), limits and attempts in [report](content/C4_REPORT.md).
60baseline balance scenarios complete; simulator does not model elite families.
Aided/test/software-renderer checks do not imply sustained throughput/survival.
Full/native/long/startup campaigns deferred, external checks temporarily waived/
unverified. Local only; remoteCI39189877476 covers2806720, never this source.
Session17 retired after recording; Session18 continues C5, C5–C7 remain unbuilt.


<a id="v0-4-3-c5"></a>
### V0.4.3 C5 — unique boss encounters and live final fight (2026-10-20)

Both themes author unique mini50%/final100% enemies, primitive presentation,
current/max health rows and fixed-circle simulation warnings/pulses. Real actors
share cap300/hash/targeting/armour/capped damage/lethal/on-kill/XP; no elite rolls,
children or duplication. Due capacity work remains due; commit spawn identity
only on success and reset it on reconstruction. No queued/live actor is deleted
to admit a boss. Attack state/cues at most two, one pulse per warning/no catch-up.

Production time limit enters live boss_fight with retained activePhase through
pause/focus/level-up; movement/combat/XP continue. Shared pressure selector caps
timed boss/clearing at1 consistently across world/director/hazards/elite chance/
HUD/pause. Only endless escalates further. Final lethal pays/removes normally,
then existing held decision offers endless or clearing, which still waits on
causal backlog. If a lethal commits during level_up, keep the earned choice and
open time_up immediately after it without one frame of resumed physics; actual
coordinator regressions lock this. Pure generic helpers opt in; normal production
and test scenes enable bosses; explicit atTimeUp legacy fixtures alone bypass.

Active Session18 ownership (claimed2026-10-20 before edits): core archetypes
ids/contracts; content define-theme validation; both themes enemies/bodies/copy;
state run-state/statistics; systems/bosses/**; systems/simulation/pacing-simulator/format-report; scenes/run-scene; ui/boss-health-ui/hud;
test-support/telemetry-bridge; deterministic bosses/run-state/focus/interface/content/separation/simulation/shutdown units;
tests/e2e/bosses-v043.spec.ts and affected overtime fixture; content C5 report/results,
PLAN/THEME_ARCHETYPES/EDUCATION_PIVOT/ECO_CONTENT_MAP, C3 report successor link, status/progress/master/
reconciliation and session successor. No persistence/dependencies/sprites.

583units/64files,typecheck/lint/build/diff pass;22 new deterministic cases. Four
real-scene both-theme×ending cases plus two legacy ending checks pass serially,
zero retries. Initial4 only fail final fixture global polling after prior game
assertions; corrected4pass8.5s. Legacy2pass12.7s, final durable4capturepass8.2s
in dedicated test output after list reporter discarded inline body. Six unique
cases, no new campaign. Mini300HP/300actual weapon damage; final1800/1800 and
50rawXPonce, pulse100→71.2 then dodge, exact ids/cue cleanup and queued clearing,
endless escalation and restart0. Readable resized health/warnings inspected.
60 coarse pacing/TTK scenarios include bosses only from authored milestones;
missing values are dashed. Simulator omits encounters/attacks/movement and is no
human survival/balance acceptance. [C5 report](content/C5_REPORT.md), source/build/
image hashes and raw evidence in [results](content/C5_RESULTS.json).

Full/stress/native/long/startup campaigns deferred; external actual Safari/browserOS/
older physical-device checks remain temporarily waived/unverified. Source-bound
P5/P6 evidence/kit does not certify this changed runtime. No dependencies/save/
sprite/global XP/rate or second physics teardown. Local-only; remote39189877476
covers2806720 only. Session18 retired after record; Session19 continues C6.

<a id="v0-4-3-c6"></a>
### V0.4.3 C6 — local profile, unlocks and lifetime records (2026-10-20)

Schema2 persists all six settings, stable theme/character identity, unknown compatible
unlock IDs, lifetime totals/bests/upgrade counts, completed/dead counts, longest run
and version/timestamps. Pure schema1 migration supplies deterministic epoch/defaults.
Strict bounded validation rejects unsafe keys, unsupported schemas, invalid numeric/
setting/reference shapes, duplicate IDs and excessive collections/nesting; immutable
validated snapshots are the storage and future portable-save model.

Boot restores before game construction. Browser-storage getter/read/write/quota failures
keep play available in memory with themed title/terminal warnings. Corrupt current data
and any known-good backup remain untouched. Ordinary successful writes preserve the
previous valid source as backup, then replace current; no active-frame or suspended-run
serialization. TerminalShown guards one finished contribution, live Field Guide overlays
are never persisted. Durable aggregates saturate at1e15 while actual run values remain exact.

Both themes grant the secondary tool after one finished run and bloodlust after25
finished-run kills. Runs snapshot their entitled offer pool; acquisition/evolution still
use existing conditions/caps/weighting and never gain a bypass query. New unlocks appear
on the terminal summary and next run; Field Guide shows lifetime labels/locked requirements.
Unknown IDs survive storage and unavailable selected characters use starter only at runtime.

Session19 ownership (2026-10-20, claimed before edits):
`src/main.ts`, `src/game/state/{profile-state,settings-state,session-statistics}.ts`,
`src/game/systems/persistence/**`, `src/game/core/archetypes/contracts.ts`,
`src/game/content/define-theme.ts`, both themes' `{index,unlocks,copy}.ts`,
`src/game/scenes/{menu-scene,run-scene}.ts`, `src/game/ui/{pause-menu-ui,run-end-overlay}.ts`,
`src/game/systems/codex/describe-shrine.ts`, `tests/fixtures/alternate-theme.ts`, affected profile/statistics/content units, `tests/unit/boot/boot-recovery.test.ts`,
`tests/unit/persistence/**`, `tests/e2e/{profile-persistence-v043,second-tool-v043}.spec.ts`,
active plan/status/master/progress/reconciliation, SAVE_DATA/PLAN/THEME_ARCHETYPES,
C6 report/results/current and successor handoffs. No C7 codec/import/export yet.

595units/65files,types/lint/build/diff and production marker exclusion pass.10unique
necessary serial browser cases verified cumulatively: both-theme profile/settings/reload,
denied/corrupt startup, actual short terminal exactly-once/reload, four acquisition/evolution
cases and death/new-unlock/warning layout. Initial two eco failures were fixture seed selection
using full theme pool rather than snapshotted entitled pool; corrected cases pass. A boot
recovery unit fixture also needed the new initialization dependency supplied. Final five
persistence cases pass8.0s; separate death layout1.2s. Raw/source/image hashes and exact
limits are in [C6 report](content/C6_REPORT.md)/[results](content/C6_RESULTS.json).

No C7 codec/import/export/recovery UI yet; no active-run save, new content art, global
combat/XP/rate or physics teardown. Broad/stress/native/long/hardware campaigns deferred;
missing actualSafari/browserOS/older physical-device checks remain temporarily waived and
unverified. Historical P5/P6 evidence/device pack stays source-bound. Local-only, remote
39189877476 covers2806720 only. Session19 retired after durable record; Session20 is C7.


<a id="v0-4-3-c7"></a>
## V0.4.3 C7 — portable saves and explicit recovery /2026-10-20

Session20 resumed ownership (2026-10-20, claimed before edits; C6 verified at
0776c95): root owns `src/game/systems/persistence/profile-service.ts`,
`tests/unit/persistence/profile-replacement.test.ts`, `README.md`,
`AUTONOMOUS_PROGRESS.md`, `RECONCILIATION.md`, `build/{BUILD_STATUS,MASTER_BUILD_PLAN,
AUTONOMOUS_DEVELOPMENT_PLAN,PLAN,SAVE_DATA,THEME_ARCHETYPES}.md`,
`build/content/C7_{REPORT,RESULTS}.*`, the C6 report successor-link correction and current/successor handoffs.
Codec agent owns `src/game/systems/persistence/save-codec.ts` and
`tests/unit/persistence/save-codec.test.ts`. UI agent owns
`src/game/ui/{save-manager-ui,pause-menu-ui}.ts`, `src/game/scenes/menu-scene.ts`,
`src/game/core/archetypes/contracts.ts`, `src/game/content/define-theme.ts`, both
themes' `copy.ts`, `tests/fixtures/alternate-theme.ts`, `src/style.css` and
`tests/e2e/save-portability-v043.spec.ts`. Parallel implementation follows the
verified C6 gate; one reviewed C7 commit follows combined verification.

Canonical three-line schema2 export, native SHA-256/Base64URL, strict shared
bounds/validation/schema1 migration and unknown stable-ID preservation. Title
Settings alone opens native save management; file/paste share preview and explicit
confirmation, backup/restore/reset. Native focus/input ownership, selectable clipboard
fallback, text-only rendering and download/dialog cleanup are verified. Candidate
snapshots are immutable; backup/quarantine precede one current-key write and only
then hydration/publication. Pre/post-preview and ordinary-save cross-tab guards
preserve newer external bytes; compare-before-write is not cross-tab CAS.

655units/67files (45codec+15transaction new cases), types/lint/build/diff and static
production marker exclusion pass. Five unique affected serial Chromium cases pass
once/4.4s, one worker/zero retries: title export/download/clipboard/input, both-theme
file/paste/cancel/import/reload, invalid/oversize preservation and confirmed restore/
reset. See [C7 report](content/C7_REPORT.md)/[results](content/C7_RESULTS.json) for
source/compiled/raw/image hashes, attempts, exact aid/environment limits and bounds.
No pacing/dependency change; balance/audit not repeated. Full/stress/native/long/
production campaigns deferred; actual Safari/browserOS/older physical GPU checks
remain temporarily waived/unverified. Historical P5/P6 reports/kit are source-bound.
No sprites/active-run save/second physics teardown or remote publication. C1–C7 local
implementation complete; Session20 retires after this durable record and Session21
retains local delivery/remaining acceptance decisions.


## V0.4.3 — PR27 CI repair local verification

Owner-authorized narrow repair of C3 seed-pool mismatch, frame-consumed input,
single-shrine versus global feedback assertions, and runner simulation-progress
budgets. Vite6.4.4 resolves the new audit finding.655units/67files, types/lint/
build/diff/audit0 and7unique affected serial browser cases pass cumulatively.
See [repair report](performance/PR27_CI_REPAIR.md) for retained failed attempts,
exact scope and limits. Full current-head remote CI is pending at this checkpoint;
no milestone/Q6 or missing external acceptance is marked complete.

<a id="readable-gameplay"></a>
## Readable gameplay — completed Q6 prerequisite and G1–G4 build log

Consolidated 2026-10-22 at the owner's request. All four scoped local phase
gates passed; no gameplay phase remains open in this series. This is the single
completed plan log. Detailed reports, raw captures, screenshots and source digests
remain separate evidence, not competing implementation plans. Historical claims
and intermediate “next/unstarted” wording below describe their original checkpoint;
the final disposition here supersedes them.

The clean checkout was `codex/readable-gameplay-g4` at **`a10e3eb`**, verified with
Git as the G4 report-owning commit; `d8ae891` is its G3 parent. Existing phase
commits are preserved. The consolidation changes documentation only and makes no
new runtime, full-app CI, remote publication or merge claim.

| Slice | Final phase commit | Accepted result | Recorded local gate / evidence |
| --- | --- | --- | --- |
| Q6 prerequisite | `44585dd` | Fixed player pose anchors, truthful pulse/fade feedback, finite owned Vacuum capacity growth | 146 tests/16 files, 2 bounded browser cases, 120 balance scenarios; [report](content/Q6_REPORT.md) |
| G1 | `54e9b2f` | Corrected pacing model; eco Glass armour 40→20 and base arrival weight 12→8 | 187 tests/21 files, 1 bounded browser case, before/after and sensitivity captures; [report](content/G1_REPORT.md) |
| G2A | `b4d61ae` | Keep independent weak litter groups | 278 tests/29 files, 4 bounded browser cases; [report](content/G2A_REPORT.md) |
| G2B | `7ce03c5` | Keep fixed-bearing wrapper interception | 282 tests/30 files, 4 bounded browser cases; [report](content/G2B_REPORT.md) |
| G2C / complete G2 | `5b50d7b` | Keep direct Can roll/recovery; all three candidates accepted | 686 full tests/72 files, 12 consolidated candidate browser cases; [report](content/G2C_REPORT.md) |
| G3 | `d8ae891` | Spaced teaching/boss schedule, five voluntary destinations, resolved site previews and fixed boss warnings | 696 full tests/73 files, 13 unique affected browser cases, ambient/timed comparisons; [report](content/G3_REPORT.md) |
| G4 | `a10e3eb` | Actual tool contribution review, next experiment, optional ten-enemy guide and existing unlock progress | 703 full tests/74 files, 283 focused tests/25 files, 5 final serial browser cases; [report](content/G4_REPORT.md) |

Types, lint, production build and whitespace pass at each recorded gate. Counts
above belong to their individual sources and must not be added into a cumulative
pass count. G4's [checks](content/G4_CHECKS.json) and
[source digest](content/G4_SOURCES.json) own final gameplay verification. Its 120
ambient cases exactly match G3. Models and aided browser fixtures do not establish
natural survival, offer frequency or retention. Broad current-app/browser/WebGL/
stress/soak checks remain deferred; actual Safari, missing browser/OS combinations
and older physical integrated-GPU evidence remain temporarily waived/unverified.
Historical P5/P6 and PR27 CI results do not certify this cumulative branch.

### Remaining work and handoff

1. Local four-phase build closure is complete. Delivery is a separate next step:
   inspect actual remote state, review cumulative Q6/G1–G4 against it, preserve
   phase commits and use one milestone PR. Choose one consolidated CI/browser
   campaign where needed, with heavy local work serial and owned resources cleaned.
   This documentation request does not publish, merge or dispatch remote CI.
2. V0.4.4 is the next planned implementation increment. Its
   [settled roster checkpoint](SPRITE_PLAN_V0.4.4.md#settled-roster-checkpoint-after-g4--2026-10-22)
   is ready for owner selection of a bounded inventory plus exact frame roles,
   canvas sizes and style review. No manifest claim, generation or resolution
   increase is selected. Preserve five accepted sheets, Glass Shards reuse and
   current primitive G2/boss actors until replacements are separately accepted.
3. No further gameplay phase is required by G1–G4. A newly observed issue needs
   its own bounded claim. New facts/rankings/handling claims or saved discoveries
   require separately selected sourced/persistence scope. V0.4 overall remains
   open while its remaining sprite/acceptance work is unresolved.

The [next handoff](NEXT_READABLE_GAMEPLAY_HANDOFF.md) remains current. The
[roadmap](#readable-gameplay-design-context) retains product priorities and Australian
source context; it no longer owns completed phase plans.

<a id="readable-gameplay-q6"></a>
### Q6 — completed prerequisite / 2026-10-21

Presentation-only per-frame mirrored hood anchors correct measured pose shifts.
Cone damage resolves once at firing; its filled cue ends at 80 simulation-ms,
with a faint outline/selected-hit feedback through 200 ms retraction. Capacity
comes from actual owned reach picks: base 3→7, evolved 4→8, four picks maximum;
unrelated levels/quality do not add targets and splash remains capped at three.
Body geometry, generated pixels, pipeline and save state stay independent.
[Q6_REPORT](content/Q6_REPORT.md) and [results](content/Q6/results.json) retain
trace, exact checks, initial fixture failures and model/platform limitations.

#### Original checklist and pre-code ownership (historical)

#### Next step — Q6 player motion, cone feedback and vacuum progression

Session21 documentation ownership (claimed before edits):
`build/{BUILD_PLAN_V0.4,BUILD_PLAN_V0.4.3,BUILD_STATUS,SESSION_21_PROMPT,PLAN,THEME_ARCHETYPES,EDUCATION_PIVOT,AUTONOMOUS_DEVELOPMENT_PLAN}.md`,
`AUTONOMOUS_PROGRESS.md` and `RECONCILIATION.md`. This cycle records review and
owner direction only; no runtime/assets/tests are edited. The subsequent owner
request to wrap up and create the V0.4.3 PR authorizes committing these selected
planning changes and publishing the existing branch. Claim exact runtime/test
ownership before implementing Q6.

C1–C7 local gates pass at C7 `88f220b`. Owner reports continuing player-sprite
jitter and enemies inside the visible vacuum cone receiving no hit. The next
local correction gate remains open. The later owner request authorizes a draft
PR for completed work before Q6; it does not complete Q6 or start V0.4.4:

- [x] Reproduce player movement against a fixed actor/body anchor. Inspect walk,
  idle and hit transitions in both horizontal directions and diagonal movement.
  Independent per-pose bounding-box centring is a candidate cause, not a proved
  live diagnosis. Correct presentation without changing physics or hand-editing
  generated art; preserve facing, rate0.5 and Phaser shutdown ownership.
- [x] Reconcile the visible cone with actual pulse timing, origin and hit selection.
  Current drawing and collision share resolved reach/angle; no separate-radius
  defect was established. Damage resolves once at firing, while a stationary cone
  fades for280ms. A target entering the fade is not a new hit. Verify base/upgraded/
  evolved boundaries and make actual affected targets/pulse timing readable.
- [x] Implement owner-selected vacuum primary-target growth with its own weapon
  upgrade progression. A small early target limit is accepted; it must increase
  at later weapon levels rather than stay at three until evolution. Use the
  existing owner-track model, not automatic growth with unrelated player levels.
  Exact thresholds/increments/ceiling and evolution carryover need theme-owned
  tuning and balance verification; they are not settled or implemented here.
  Keep finite integer caps and deterministic target ordering. Preserve independent
  clocks, direct/splash provenance and exact XP; growth does not remove caps or
  automatically increase splash targets. Both production themes must satisfy the
  generic contract. Evolution must retain earned growth without reducing it.
- [x] Add affected deterministic coverage for cap steps, boundaries, evolution/
  reset and attack ownership; run typecheck, affected units, lint, build and diff
  checks. Use `npm run balance` for the changed pacing, including packed targets.
  Run only necessary serial browser cases, one worker/zero automatic retries,
  with declared bounds and images under testInfo.outputPath; inspect motion and
  cone-hit correspondence. Record deferred broad/stress/native/long checks.
- [x] Record implementation, actual verification, remaining limits and reconciliation
  together in one reviewed local correction commit. Keep C1–C7 historical passes
  intact; Q6 is open until its own gate passes.

Read-only Session21 review reran25 animation/melee/second-tool units across3files:
all pass. This does not verify the reported motion/cone behavior or the proposed
cap progression. No new browser campaign or runtime fix occurred.


#### Q6 implementation claim — 2026-10-21

On `codex/readable-gameplay-g1` from main `c200b21`, claim the exact prerequisite
paths before edits: `src/game/core/archetypes/contracts.ts`,
`src/game/content/define-theme.ts`, both themes' `{weapons,copy}.ts`, eco
`sprites.ts`, `src/game/systems/sprites/{sprite-view,sprite-animation}.ts`,
`src/game/systems/weapons/resolve-weapon.ts`,
`src/game/systems/upgrades/describe-upgrade.ts`, `src/game/scenes/run-scene.ts`,
`src/game/entities/cone-attack-actor.ts`,
`src/game/systems/simulation/{build-models,pacing-simulator}.ts`,
`tests/unit/weapons/{weapon-target-growth,weapon-evolution,second-tool}.test.ts`,
`tests/unit/sprites/sprite-animation.test.ts`, `tests/unit/content/theme.test.ts`,
`tests/e2e/q6-readability.spec.ts`, `tests/fixtures/alternate-theme.ts` only if a
required copy contract changes, `build/content/Q6*`, this plan,
`build/{BUILD_STATUS,PLAN,THEME_ARCHETYPES,EDUCATION_PIVOT,ECO_CONTENT_MAP}.md`,
`AUTONOMOUS_PROGRESS.md`, `RECONCILIATION.md`.
No generated pixels, pipeline/atlas, bodies or save state changes. Diagnose the
fixed-anchor trace first. Capacity will resolve from actual owned-track pick
history, with finite theme-authored steps; unrelated levels/tiers cannot add
capacity. Record evidence before accepting the precise growth values.

##### Q6 local gate accepted — 2026-10-21

The implementation claim above is complete. [Q6_REPORT](content/Q6_REPORT.md)
records fixed-anchor diagnosis/correction, truthful one-shot cue and3→7→8 owned
capacity.146units/16files, typecheck/lint/build/diff and2bounded serial Canvas
browser cases pass;120balance scenarios recorded. Full/browser-device campaigns
remain deferred; external checks waived/unverified. Q6 is closed locally; G1
is next on the same branch, with its own claim, report and verified commit.
The unchecked/open language in Session21/delivery sections is historical.

<a id="readable-gameplay-g1"></a>
#### Phase G1 — reliable power growth and existing-roster rebalance

Claim: **Codex**, `codex/readable-gameplay-g1`; status **verified locally**,
after Q6 prerequisite44585dd. See [G1_REPORT](content/G1_REPORT.md). No parallel roster or sprite
work is claimed. The [start prompt](#readable-gameplay-g1) includes prerequisite
recovery, ownership, implementation and verification.

| G1 ownership | Paths permitted when needed |
| --- | --- |
| Theme-owned enemy/tool/director tuning | `src/game/content/themes/{eco-guardian,knight-magic}/{enemies,director,progression,difficulty,difficulty-presets,weapons,skills,upgrades,elites,copy}.ts` |
| Actual implemented-build simulation | `src/game/systems/simulation/{build-models,pacing-simulator,format-report}.ts`, `scripts/balance.ts` |
| Contract validation, only for a demonstrated required seam | `src/game/core/archetypes/{contracts,tuning}.ts`, `src/game/content/define-theme.ts`; record the dependency before editing |
| Affected deterministic verification | `tests/unit/{content,architecture,enemies,director,difficulty,weapons,simulation,elites,events}/**` |
| Necessary bounded integration | `tests/e2e/{enemy-roster,opening-microplastics,second-tool-v043,elite-family-v043,difficulty-v043}.spec.ts`; Q6 cases keep separate ownership |
| Evidence and durable decisions | `build/content/G1*`, this roadmap, `build/{BUILD_STATUS,PLAN,EDUCATION_PIVOT,THEME_ARCHETYPES,ECO_CONTENT_MAP,PHASE_G1_PROMPT}.md`, `AUTONOMOUS_PROGRESS.md`, `RECONCILIATION.md` |

No G1 production scene/entity/sprite/save/dependency edits are implied. If measured
work needs another path, record its exact bounded dependency in this claim first.

Prerequisite: Q6 verified. Claim theme-owned enemy/director/progression/difficulty/
weapon tuning and corresponding simulation/tests before runtime work. Keep both
production themes contract-valid; do not copy eco tuning into knight-magic blindly.

- [x] Re-run the [captured baseline](content/READABLE_ROSTER_BASELINE.md) against
  corrected tools. Extend the simulator only where a real capability is missing;
  exclude parked projectile/kill-explosion models from eco acceptance decisions.
- [x] Evaluate each current role's health, armour, speed, contact harm, XP,
  arrival share and interaction with the corrected Vacuum capacity and Sweep.
  Change theme values only where the comparison demonstrates a pacing problem;
  keep unchanged values explicitly where they already serve their role.
- [x] Microplastics: preserve the opening one-hit exception across all three
  presets; do not use surveyed >5 mm fragment counts as their natural spawn rate.
  Plastic Bottles: preserve the familiar baseline, without claiming they dominate
  litter item counts. Review common-role proportions as gameplay composition.
- [x] Glass: review compounded health/armour and arrival share so a durable
  commitment does not crowd out all other choices. Preserve greater material
  durability than plastic, stationary clearable Shards, and finite fragmentation.
  Bagged Waste: budget parent plus released children, their half rewards, elite
  descendants and retained spawn work; never create recursive bag families.
- [x] Measure level milestones, kills/XP, role mix, backlog/cap dwell and TTK
  before/after, with isolated-contact and packed-target bands. Do not call a peak
  population alone a demonstrated balance defect or a performance result.
- [x] Give owned upgrades/evolution an observable benefit and a chance to enjoy
  it; do not automatically cancel each power gain with enemy scaling. Preserve a
  viable generalist fallback and assess early economy choices for snowballing.

Gate: themed content/architecture, director, material-family, difficulty, melee,
evolution and simulation units; `npm run typecheck`, `npm run lint`,
`npm run build`, `git diff --check`; `npm run balance` baseline/C3 fixtures across
both themes and all presets, with applicable models identified. One necessary
bounded serial play/readability check validates the model's contact assumptions.
Record values, source state, actual acceptance and deferred checks in a G1 report.
No fixed new stat or target population is accepted by this planning document.


#### G1 exact implementation claim — 2026-10-21

Q6 gate passes in44585dd ([report](content/Q6_REPORT.md)); G1 starts from that
commit. Claim before edits: `src/game/content/themes/eco-guardian/{enemies,director}.ts`
only if measured changes warrant them; retained knight theme tuning is assessed
but not pre-emptively copied. Applicable simulation support:
`src/game/systems/simulation/{pacing-simulator,format-report}.ts`, `scripts/balance.ts`;
`tests/unit/simulation/pacing-simulator.test.ts`,
`tests/unit/{content/theme,enemies/g1-role-balance}.test.ts`,
`tests/e2e/enemy-roster.spec.ts` (bounded contact/readability fixture only).
Evidence/docs: `build/content/G1*`, this roadmap,
`build/{BUILD_STATUS,PLAN,EDUCATION_PIVOT,THEME_ARCHETYPES,ECO_CONTENT_MAP,PHASE_G1_PROMPT}.md`,
`AUTONOMOUS_PROGRESS.md`, `RECONCILIATION.md`.
The Q6-corrected simulator still omits armour from kill spending, retains the
first spawn's health for later same-role arrivals, banks damage while empty and
catches up natural arrivals unlike the runtime's cadence. Capture its fresh
output first, then label model corrections separately from tuning effects.
No G2/art/scene/body/save changes are selected by G1.

G1 narrow verification dependency: `tests/unit/director/spawn-director.test.ts`
contains the old rounded late composition table. Update its expected documented
shares for the selected Glass weight; keep opening/unlock behavior assertions.

#### G1 accepted local outcome — 2026-10-21

Q6 prerequisite44585dd and G1's own gate pass. Eco Glass armour40→20 and director
base weight12→8 are the only runtime tuning changes; all other roles and knight
values are retained with reasons in [G1_REPORT](content/G1_REPORT.md). Model
corrections are separated from tuning: fresh Q6 baseline120, corrected before120,
after120 and36step-size sensitivity scenarios.187units/21files, types/lint/build/
diff and one bounded serial contact browser case pass. Full stress/soak/native/
device checks deferred; external checks waived/unverified. No publication/merge
or new roster/art authorization follows from this local acceptance. G2–G4 remain
unstarted; owner-selected G2 is the next planning handoff.

G1 handoff-only documentation dependency: `build/BUILD_PLAN_V0.4.md` and
`build/BUILD_PLAN_V0.4.3.md` receive current outcome links so their earlier open-Q6/
next-G1 checkpoints cannot be mistaken for the final handoff. No phase is reopened.

G1 final evidence-only dependency: normalize trailing spaces/terminal blank lines
in `build/content/Q6/*.txt` while reviewing generated report whitespace. This
preserves every Q6 captured value and source identity; no prerequisite code changes.

<a id="readable-gameplay-g2"></a>
### G2 — one outdoor candidate at a time

Date2026-10-22. Owner authorizes starting G2. Branch `codex/readable-gameplay-g2`
is stacked on local G1 `54e9b2f`, not a merged-main claim. Current result: all
three candidates locally kept; G2 complete, G3 ready/unstarted. G3/G4 and new art
remain unimplemented. The claims below retain their before-edit chronology.

#### G2A scope and exact ownership, claimed before code edits

- Contracts/validation: `src/game/core/archetypes/{ids,contracts,tuning}.ts`,
  `src/game/content/define-theme.ts`.
- Both themes' `{enemies,director,bodies,copy}.ts`; no edits to old saved IDs.
- Pure formation/admission helper: `src/game/systems/director/arrival-cluster.ts`;
  integration limited to `run-scene.ts` natural arrivals and milestone size.
- Primitive-only view: `src/game/entities/{enemy-actor,enemy-primitive-view}.ts`.
  Sprite seam/pipeline/generated art and collision geometry stay independent.
- `src/game/systems/simulation/pacing-simulator.ts`; reuse G1 models/reporter.
- `tests/fixtures/alternate-theme.ts`, `tests/unit/{content/theme,director/spawn-director,simulation/pacing-simulator}.test.ts`,
  `tests/unit/{enemies/cluster-fodder,director/arrival-cluster}.test.ts`,
  `tests/e2e/g2-cluster-v044.spec.ts`; existing roster test only if its explicit
  old five-role fixture is genuinely affected (do not broaden historical claims).
- Evidence `build/content/G2*`, this plan/prompt/roadmap, BUILD_STATUS/BUILD_PLAN_V0.4/
  BUILD_PLAN_V0.4.3/PLAN/THEME_ARCHETYPES/EDUCATION_PIVOT/ECO_CONTENT_MAP/SAVE_DATA,
  AUTONOMOUS_PROGRESS and RECONCILIATION. Save doc is compatibility note only.

G2A candidate: slow individual weak litter in a group of three, each visibly
clearable and independently targetable/rewarded. Trial theme data:6HP/0armour,
64speed/3contact harm/1XP, radius10/display28; group3, spacing34world units.
Sparse roll weight2 with0.5 growth, unlock0.25, first introduction3. These are
trial game numbers, never environmental facts, and require measured acceptance.
Existing material values, weapon tuning, timing/rate0.5 and caps stay unchanged.

#### Prompt self-review before implementation

Reviewed PHASE_G2_PROMPT on2026-10-22. Accept with these explicit resolutions:

- A group consists of separate actors, not three painted items paying triple XP
  from one lethal. Formation only applies to natural arrival selection. Duplication,
  elite splitting and causal offspring spawn exactly their requested actors.
- A generic small milestone-count override is necessary: the existing burst
  would introduce about19 actors at25%, contradicting a low-pressure first view.
  Queue the three introduction requests through existing retention, never drop
  causal work. Do not multiply a milestone introduction by group size again.
- Form off-screen on the same ring with world-unit spacing converted to angle;
  do not place unavoidable enemies on-screen or derive spawn/body sizes from art.
- Natural grouping raises arrivals per selection. Measure actual actor shares,
  not just roll weights, and parent/elite budgets. Do not enlarge caps or silently
  label the old per-roll model a valid comparison.
- Primitive two-part shapes are presentation only, with a shared transform/flash/
  destruction lifecycle. Use data, never theme-name branches. A declined art
  silhouette cannot be repaired by changing hitboxes.
- Fresh neutral IDs are content additions, not a save schema migration. Verify
  current unknown-ID compatibility; no saved discovery/unlock field is selected.
- This is a candidate trial. The local gate must explicitly keep/revise/drop;
  a prototype or aided fixture is not natural survival/performance acceptance.

#### Ordered checklist and gate

- [x] Fresh G1 identity/baseline captured; prompt reviewed and scope claimed.
- [x] Definition/formation/intro/presentation and both-theme fixture implemented.
- [x] Deterministic admission, retained causal introduction, targets/XP/reset pass.
- [x] Both-theme/all-preset before/after balance and reward/mix review complete.
- [x] Necessary bounded serial browser evidence inspected in Default/Low and
  reduced-motion, with independent body/visual and source/XP assertions.
- [x] G2 short suite + types/lint/build + whole-branch whitespace pass.
- [x] Keep/revise/drop, actual source/checks/limits and next handoff durable.

G2 recipe: `npm test -- --run tests/unit/content tests/unit/architecture tests/unit/enemies tests/unit/director tests/unit/spawning tests/unit/targeting tests/unit/combat tests/unit/elites tests/unit/events tests/unit/simulation`.
Also run affected difficulty/weapons/persistence units for new ID compatibility.
Four balance commands are recorded in content/READABLE_ROSTER_BASELINE.json.
Browser cases: new g2-cluster-v044 only, each bounded30s (retention45s if needed),
one worker/zero retries, owned cleanup. Full app/stress/soak/native/device gates
remain deferred; actual Safari/browser-OS/older-device evidence waived/unverified.

Initial deterministic review revises trial speed50→64: the legacy maximum-ring
approach guard would take19.16s at50, above its16s band;64 reaches in14.97s while
remaining far slower than Microplastics. Keep the existing envelope assertion.
Append the new role to catalogs to preserve existing fixture/roster ordering.

#### G2A accepted local gate — 2026-10-22

Keep the candidate: [G2A_REPORT](content/G2A_REPORT.md).278units/29files,
types/lint/build,240before/after scenario summaries and4serial browser cases pass.
Each case now includes old/new mixed roles and exact source/XP/view destruction.
Broad/native/device checks deferred/waived as recorded; no human survival claim.
The first candidate is complete; G2 remains in progress. Next is G2B wrapper
interception, which needs a fresh exact claim/prompt review before implementation.
The `v044` suffix in the bounded test filename is only a fixture filename; it
neither starts nor accepts the V0.4.4 sprite milestone. No generated art is owned.

#### G2B scope and prompt review — claimed 2026-10-22 before code

Owner now requests completing the G2 plan, then reporting G3 readiness. Implement
G2B and verify/commit it before claiming G2C. Exact additional ownership:
`src/game/systems/enemies/committed-motion.ts`, `src/game/entities/enemy-motion-cue.ts`,
`tests/unit/enemies/committed-motion.test.ts`, `tests/e2e/g2-motion.spec.ts`;
reuse G2A contracts/validation, both-theme enemies/director/bodies/copy, actor,
run-scene enemy movement/avoidance only, alternate fixture/content tests and
G2 evidence/planning/status/reconciliation paths. No simulator algorithm change.

Reviewed prompt: add neutral `enemy.gust_drifter` (Packets / Wrappers; Paper Wisp).
Approach at80, enter a stationary900ms directional warning within150world units,
commit to a heading offset0.8radians from the captured player bearing, travel900ms
at2.5×base speed, stop1300ms, then approach/repeat. Reusable motion capability
contains all thresholds/timing/offset/speed in theme data. Presentation observes
state; a persistent essential arrow/ring survives Low/reduced-motion. Stats trial:
12HP/0armour,5harm,2XP,radius12/display34. Introduce one at0.32, natural weight3,
growth0.5. Approach trigger is inside the camera's225world-unit vertical half-view;
no off-screen launch. First hint uses existing wave announcement/catalog copy.

Self-review: this is intermittent crossing/interception, not continuous pursuit;
heading locks at warning entry (never tracks during warning/travel). Zero delta
freezes motion; large deltas advance at most one phase so warning/recovery cannot
be skipped. Existing target/contact/XP/cap/causal semantics remain. Actor-local
state resets on construction. Skip obstacle steering during commitment so it
cannot silently re-aim; recovery remains contactable/targetable. Existing drift
waves keep their behaviour for roles without the capability. No save fields or
sprites. Balance model does not simulate these movement or interception costs.

Gate: deterministic phase/heading/reset/invalid-definition checks; current G2
short suite + difficulty/weapons/persistence, types/lint/build/whitespace;120
before/after ambient cases and four balance CLI commands; four bounded serial
both-theme Default/Low+reduced-motion browser cases for phase cue, mixed target,
exact-once XP/death and clean destruction. Keep/revise/drop then phase commit.

- [x] G2B implementation and deterministic motion checks.
- [x] G2B balance, bounded visual evidence and software gate.
- [x] G2B decision/report/status/reconciliation and phase commit.

G2B accepted **keep**: [report](content/G2B_REPORT.md). Ready for the separately
claimed/reviewed G2C Can candidate; G2 overall remains open.

#### G2C scope and prompt self-review — claimed before code 2026-10-22

G2B verified/committed7ce03c5. Now claim the same both-theme ID/definition/copy/
director/body/validator-fixture/content/director/enemies test paths and
`tests/e2e/g2-motion.spec.ts`; existing committed-motion/cue/actor integration is
read/reused, not extended unless an evidenced defect requires a recorded claim.
Evidence `build/content/G2C*`, this plan/prompt/current authority/status/reconciliation
paths. Also claim `build/PHASE_G3_PROMPT.md` for the final reviewed handoff only.
No G3 implementation, boss/site/world/weapon/save/sprite code is owned.

Reviewed G2C prompt: neutral `enemy.committed_charger`, eco Aluminium Can / knight
Barrel Construct. Reuse fixed-bearing capability with zero aim offset: approach90,
trigger150, warning1000ms aimed at the player's captured prior position, travel
1000ms at3.5×base (315units), stationary recovery1400ms.18HP/0armour,7contact harm,
3XP,radius14/display38. One introduction at55%, sparse weight2/growth0.4/bias0.
Aimed line crosses the old player position and passes beyond it; moving sideways
leaves the committed route. Unlike the oblique180-unit wrapper gust, this is a
longer fast direct pass followed by a larger recovery opportunity. Primitive can
body/label/end caps provide a separate silhouette; no new sprite or body inference.

Self-review: keep the same phase logic rather than adding a parallel AI system.
Preserve both old behaviours and all finite cap/XP/causal rules. No retargeting
at launch, predictive tracking, invulnerability or extra attack hitbox. New role
must prove the old-position pass and sideways miss, not just share the wrapper's
phase test. Intro at55% is a trial, not natural encounter acceptance; G3 owns
encounter sequencing around the existing mini-boss. Pacing model still omits
movement/survival/offspring/intro/bosses. Compare actual role shares and both-theme
weak/strong build work/XP/cap trade-offs before keep. No numerical survey ranking.

- [x] G2C implementation, content/motion and sidestep/target/XP checks.
- [x] G2C120before+120after/fourCLI, bounded serial browser/software gate.
- [x] G2C keep/revise/drop, complete G2 disposition, reviewed G3 handoff/commit.

##### Final verification discovery / narrow ownership extension

The consolidated full unit suite finds one pre-existing Q6 expectation in
`tests/unit/ui-selectors/describe-upgrade.test.ts`: the starter stats must cover
all keys except projectiles/pierce, but Q6 added `primaryTargets` only for a capped
melee tool. The actual starter has no such cap. Test and selector are unchanged
since G1 (empty diff against54e9b2f; selector's last relevant change44585dd).
Claim this test only before correction: exclude the inapplicable capacity from
starter keys and explicitly verify both themes' finite secondary capacity and
knight projectile delivery stats. No selector/weapon/UI runtime change. Rerun the
full unit suite once; record the initial684pass/1fail honestly in the G2C report.

#### G2 complete local gate / G3 readiness — 2026-10-22

All three candidates kept individually: G2Ab4d61ae, G2B7ce03c5, G2C in this plan's
owning final candidate commit. [G2C_REPORT](content/G2C_REPORT.md) records the full
disposition.288targeted units, final686units/72files, types/lint/build/whitespace,
12serial candidate browser cases and120before+120after model cases/fourCLI for
G2C pass. Earlier G2A/G2B gates retain their own evidence. Broad/native/device
limits remain as recorded, never silently passed. No push/PR/merge/art.

[PHASE_G3_PROMPT](#readable-gameplay-g3) is written and reviewed. G3 remains unstarted;
its exact implementation ownership will be claimed at the next owner instruction.

<a id="readable-gameplay-g3"></a>
### G3 — encounter rhythm, optional destinations and readable bosses

Owner explicitly requests execution of PHASE_G3_PROMPT. Date2026-10-22.
Branch `codex/readable-gameplay-g3` from verified G2C `5b50d7b`; clean at claim.
One verified local G3 phase commit; no publication/merge/G4/art implied.

#### Exact ownership claimed before code

- Both themes' `director.ts`, `shrines.ts`, boss entries in `enemies.ts`, `copy.ts`.
  Keep existing role stats/weights, weapons, rate/camera/caps and all saved IDs.
- `src/game/core/archetypes/contracts.ts`, `src/game/content/define-theme.ts` for
  optional theme-authored boss warning hold; no tuning literal in scene/systems.
- `src/game/systems/bosses/bosses.ts`, `src/game/scenes/run-scene.ts` only boss
  movement hold and current in-range site preview integration.
- `src/game/systems/codex/describe-shrine.ts`, `src/game/entities/shrine-actor.ts`,
  `src/game/ui/minimap-ui.ts` for current-world preview/destination diamond.
- `src/game/systems/simulation/pacing-simulator.ts` for explicit timed world-only
  choices; `build/content/G3_CAPTURE.ts`, `build/content/G3*` evidence/report.
- `tests/unit/{director/spawn-director,bosses/bosses,shrine/shrine-placement,
  codex/describe-shrine,simulation/pacing-simulator,ui/presentation-quality}.test.ts`,
  new `tests/unit/director/encounter-rhythm.test.ts`, `tests/e2e/g3-encounters.spec.ts`;
  existing `tests/e2e/bosses-v043.spec.ts` only its authored mini threshold fixture.
  Other tests require an explicit extension if a real affected contract emerges.
- This plan/prompt, roadmap, BUILD_STATUS, BUILD_PLAN_V0.4/V0.4.3, PLAN,
  EDUCATION_PIVOT, THEME_ARCHETYPES, ECO_CONTENT_MAP, AUTONOMOUS_PROGRESS and
  RECONCILIATION. SAVE_DATA read; no saved state/adapter/schema changes selected.

#### Reviewed implementation decisions

Prefer data and existing machinery. Natural milestone arrival is offscreen and
capacity-sensitive; fractions below are due times, not guaranteed first contact.
Five authored minutes / rate0.5 remains ten nominal wall minutes before pauses.

|Event|Old fraction|Trial fraction|Sim seconds|Nominal wall seconds|
|---|---|---|---|---|
|Microplastics / Runner|0|0|0|0|
|Bottle / Grunt|.10|.10|30|60|
|First optional surge site|.04|.16|48|96|
|Weak group|.25|.25|75|150|
|Wrapper gust|.32|.34|102|204|
|Optional Greed site|.18|.40|120|240|
|Glass / Tank|.40|.44|132|264|
|Bag / Broodmother|.45|.52|156|312|
|Can roll|.55|.60|180|360|
|Optional Multiplicity site|.34 / .52|.66 (one)|198|396|
|Mini-boss|.50|.72|216|432|
|Baseline elite ramp begins|.60|.82|246|492|
|Optional Duplication site|.72|.84|252|504|
|Optional Escalation site|.86|.90|270|540|
|Final boss|1|1|300|600|

Removing only the repeated Multiplicity arrival avoids compulsory scheduling of
two identical permanent doubling choices; the one existing definition remains
unchanged. Every site can still be ignored, and deliberate different-site stacks
remain possible. No fake guaranteed upgrade/evolution minute. Earlier taught
roles get18–30sim-second gaps; Can precedes mini by36sim seconds. Optional late
escalation leaves30sim seconds before final, but travel/kill/build may consume it.

Placement band trial560–1320→480–800, min separation620→360, same24attempts/160edge.
At base200 move speed, center-to-site travel is2.4–4sim seconds,4.8–8nominal wall
seconds before obstacles/route choice; reaching interaction range is shorter.
Minimum480 exceeds current view half-height225 and interaction120; a diagonal or
horizontal site can still be visible. Do not assert fully offscreen for all bearings.
Existing finite fallback remains unchanged and must be measured at corners.

Preview is read-only from current world + selected site at current threat step:
resolved arrivals/durability/harm/XP and elite chance, plus finite surge/duplication
source reward. Display existing themed labels, no new fact surface. Refresh only
when text changes; ignore keeps world unchanged. Existing input/activation guard
stays the owner of acceptance. Minimap site diamond differs from enemy dots.

Bosses hold movement during their already-fixed circular warning (theme boolean),
then resume pursuit during existing recovery. Keep health/damage/radius, pulse
rules and recovery durations; longer rest/cost changes require measured evidence.
Hold prevents body/circle divergence and gives a clear safe-space/return choice.
No new attack, tracking circle, counter, invulnerability or body derived from art.

Timed pacing choices apply only existing world-multiplier shrine and curse
contracts at explicit simulation times. Preserve spawn-time cohorts and exact-once
curse handling. Reject surge/duplication simulation rather than pretending to
model their actors/rewards. Before/after timed scenarios supplement the four
baseline/C3 CLI comparisons; never infer movement/offers/travel/survival/boss passes.

#### Gate / execution checklist

- [x] Fresh120ambient/fourCLI baseline and timed ignored/accepted comparison.
- [x] Both-theme schedule/placement, resolved preview and warning hold implemented.
- [x] Deterministic ordering/restretch, no-change ignored, repeated acceptance,
  cap/retention/ledger/terminal/reset and timed cohort boundaries verified.
- [x] G3 short suite: content/architecture/director/shrine/chaos/bosses/codex/
  simulation/events/statistics/run-state/weapons plus affected UI tests; full units
  once for cross-cutting selectors. Types/lint/build/whole-branch whitespace.
- [x] Both-theme/all-preset before/after baseline/C3 plus weak/generalist/evolved
  timed choices; record XP/work/dwell/level trade-offs, model and timing limits.
- [x] Necessary bounded serial both-theme Default/Low+reduced-motion site-preview/
  ignore/accept/repeat and mixed boss/directional cue cases; relevant existing
  boss terminal/reset regression.1worker/0retries, screenshots/cleanup inspected.
- [x] Report/status/product/reconciliation and current next handoff in phase commit.

No natural first-contact/upgrade claim from forced clocks or positioned actors.
No broad browser/stress/soak campaign; external device/browser checks remain
waived/unverified. Gate failures must be fixed/recorded before completion.

##### First-heavy introduction review, before theme edits

Use existing introductionCount overrides: Glass/Tank4 and Bag/Broodmother2 in
both themes, rather than their general21–23-member waves. Four walls teach a
route; two releasers expose finite offspring without a bulk first-encounter spike.
Later natural weights remain unchanged. Ambient balance omits milestone actors;
record this separately and test actual retained requests at capacity in browser.

##### Verification fixture extension / themed opening distinction

Claim `tests/unit/chaos/curses.test.ts` to update its authored258000ms/6site
expectations to the new270000ms/5site schedule; no world-choice runtime change.
Knight retains its historical Grunt opening at0 and Runner unlock.20 (eco uses
Microplastics0/Bottle.10). Do not silently homogenize that pack. Its original
Runner→weak-group gap is15sim seconds; subsequent new teaching gaps stay≥18.
The table's eco opening labels/times are not a claim about knight's original pair.

##### Affected historical fixtures / review refinements

Claim `tests/unit/enemies/g1-role-balance.test.ts` for its pre-unlock.40 Glass
sample to use the actual authored unlock, preserving its G1 armour/share assertions.
Claim `tests/e2e/{phase-five-v02,shrines-curses-v043}.spec.ts` for natural5-site/
270000ms expectations and affected focused checks. Preserve the deliberately named
`worldScenario=multiplicity2` synthetic two-instance fixture in planShrineArrivals;
it remains an explicit stress/world-composition aid, not a natural second site.
`worldScenario=all` uses the actual five-site schedule and new expected composition.
No test helper may silently change a benchmark's requested two-site load to one.

Visual review: lift the site detail above actors so the player cannot cover the
accept/ignore instruction, increase its text15px, and name the site inside the
panel (the aided fixture relocates actors, so the original static world label
cannot serve as the relocated panel's identity). Clamp details to the live view.

##### Final handoff claim and review

Claim `build/PHASE_G4_PROMPT.md` for a reviewed next-session handoff only; G4
runtime work remains unstarted. Preserve all waived/deferred external evidence.
The final short recipe also includes enemies/G1 family assertions because role
unlock changes affect those fixtures. Preserve the synthetic multiplicity2 load;
all-site duplication now derives eight eligible roles, never hardcodes the old five.
No natural encounter timing or full-run survival acceptance is inferred.

#### Accepted local gate — 2026-10-22

[Report](content/G3_REPORT.md) owns complete decisions/evidence/limits. Final short
342tests/35files; full696tests/73files; types/lint/build/whole-branch whitespace,
13unique affected serial browser cases,120before+120after ambient and90before+
90after timed scenarios pass. One old duplication fixture failed5vsactual8; its
roster-derived correction passes. Initial typed/schedule/G1 fixture failures are
recorded honestly in the report. Production emitted-marker static scan passes;
no extra production/full browser or device campaign was run. G3 complete locally,
G4 ready/unstarted with [reviewed handoff](#readable-gameplay-g4). No push/PR/merge/art.

<a id="readable-gameplay-g4"></a>
## Readable gameplay G4 — useful reviews and optional mastery reference /2026-10-22

Owner-requested implementation on `codex/readable-gameplay-g4` from verified
G3 `d8ae891`. Exact pre-code ownership/self-review is in BUILD_PLAN_G4; this is
the consolidated completed implementation record. No push/PR/merge/new art.

The actual committed-damage seam records an originating weapon's health-clamped
direct/splash damage in transient `RunStatistics.damageByWeapon`. It partitions
existing totals; skill/unattributed effects remain the difference, with no new
kill/source totals or durable fields. Explicit session/profile folds remain.
Results default to tool/pressure/next-experiment review, retaining the full old
ledger/tally in Details. Pointer/Tab switching, resize and restart preserve the
terminal's one durable fold. Elapsed final-hit time fixes overtime0:00; final-boss
flag and subsequent death/clearing headings remain honest. Advice uses current
entitlement and owned evolution picks, without guaranteeing random offers.

The existing shared optional guide gains ten bounded enemy pages and progress
toward the two existing capability unlocks. Both themes supply complete validated
mastery copy. Enemy descriptions/relations and difficulty-resolved game stats come
from live theme definitions, with display-only decimal rounding. PgUp/PgDn and
pointer paging clean up stable listeners and suppress host scrolling only while
active. Reading never grants/writes, introduces no new saved discovery, sourced
fact/ranking/handling surface or mandatory learning gate. No tuning, IDs, art,
weapon/unlock definitions, save schema or adapter change.

703units/74files,283focused/25files, types/lint/build/whitespace and final5serial
Chromium cases4.3s/one worker/zero retries pass. Both themes Default/Low+reduced-
motion cover actual damage/overkill guards, all10pages, result pointer/keyboard/
resize/restart, exact-once fold and memory-adapter reload. Ordinary title Info
entry/exit is checked separately within those5cases. All14screenshots inspected.
120ambient cases exactly match G3. Source/artifact hashes, initial input/test-
global/decimal-display corrections, aids and limits are in [G4_REPORT](content/G4_REPORT.md),
[G4_CHECKS](content/G4_CHECKS.json), [G4_SOURCES](content/G4_SOURCES.json).
No natural first-run/offer-frequency/retention, full app/WebGL/stress/soak/device
claim; external checks remain waived/unverified. Owned runtime resources exited.

G1–G4 are locally complete. G4 prompt retired; [next handoff](NEXT_READABLE_GAMEPLAY_HANDOFF.md)
records delivery and owner-selected V0.4.4 work. The settled sprite roster/roles
are reconciled in SPRITE_PLAN_V0.4.4; remaining canvas/frame selections and all
new generation are unstarted. Five accepted sheets/current shard reuse remain.

### G4 original ownership, self-review and completed checklist (historical)

### G4 — useful run reviews and optional mastery reference

Owner requests implementation2026-10-22. Branch `codex/readable-gameplay-g4` from
verified G3`d8ae891`; clean at claim. One verified local phase commit; no push/
merge/new art. Read PHASE_G4_PROMPT and required authorities before this claim.

#### Exact ownership before code

- `src/game/systems/statistics/run-statistics.ts` for transient actual weapon
  attribution; `src/game/scenes/run-scene.ts` only damage provenance, end-review
  context and Field Guide data. No HP/reward/attack/clock/cap changes.
- New pure `src/game/systems/mastery/run-review.ts`; existing state/statistics.ts
  only truthful elapsed death-clock correction if verified necessary.
- `src/game/ui/{run-end-overlay,pause-menu-ui}.ts`, `src/game/scenes/menu-scene.ts`
  for bounded summary/details and paged optional enemy/capability guide.
- `src/game/core/archetypes/contracts.ts`, `src/game/content/define-theme.ts`,
  both themes' copy.ts and `tests/fixtures/alternate-theme.ts` for required themed
  labels/advice. Existing enemy/weapon/unlock definitions stay unchanged.
- `tests/unit/{statistics/run-statistics,statistics/statistics,content/theme}.test.ts`,
  new `tests/unit/ui-selectors/run-review.test.ts`, `tests/e2e/g4-mastery.spec.ts`;
  affected UI fixtures only with a fresh exact claim if discovered.
- Build plan/prompt, G4 evidence/report, roadmap/status/current V0.4/V0.4.3 plans,
  PLAN/EDUCATION_PIVOT/THEME_ARCHETYPES/ECO_CONTENT_MAP/SAVE_DATA compatibility note,
  AUTONOMOUS_PROGRESS/RECONCILIATION; SPRITE_PLAN_V0.4.4 documentation reconciliation
  and a next handoff only. No sprite manifests/claims/generation or pipeline edit.

#### Design and prompt self-review

Use existing recorded run/profile data. Add `damageByWeapon` to transient run
statistics only, with optional weaponId on actual committed damage records.
Direct/splash retain their originating weapon; skill/unattributed damage is the
remaining partition of the existing total. Group evolved/base weapon IDs by their
actual names, never infer damage from equipped items or assign kills to a tool.
No pending request, overkill, duplicate lethal or source category double-count.
Profile/session folding already selects explicit aggregate fields and must not
persist this transient map. No schema/migration/IDs/unlocks/settings change.

Results default to a concise review: actual tool contributions, accepted site/
curse choices and one attainable next experiment. Preserve the existing full
metrics/damage/upgrade ledger behind a Details tab. Keep restart reachable and
resize-safe; use measured text/paging where needed. Do not assert why a player
failed from a single death source. Death time must be elapsed time, not remaining.
Final-boss victory is only a recorded result when finalBossDefeated is true;
clearing/death/endless stay distinct. Existing terminal coordinator still owns
one durable fold, unchanged by tab switching/resizing/read-only review.

Expose the existing enemy catalog in the same optional Field Guide: one bounded
paged entry, description/behaviour/health/speed/contact harm/material relations
from the active theme, no discovery persistence/facts/handling claims. Add existing
capability unlock progress from current profile values/IDs; viewing never grants
or writes anything. Suggestions respect actual availability, random offer choice,
owned capacity picks and same-slot evolution. No new unlock or permanent grind.
No Australian ranking surface is selected, so no unsourced ranking is displayed.

Baseline/new unlock mechanics are identical: verify unchanged weapon/unlock/tuning
sources and compare the existing120ambient cases against G3, not invent a new
build. Existing first finished attempt unlocks the second tool;25lifetime kills
unlock the current recovery upgrade. Use these to suggest variety, not new stats.

#### Gate

- [x] Pure actual source partition, zero/duplicate/unknown/evolved/reset coverage.
- [x] Terminal-aware review/advice, accurate elapsed death time, read-only unlock
  progress/unknown IDs, complete both-theme copy and optional guide paging.
- [x] G4 short suite: content/upgrades/statistics/ui-selectors/codex; affected
  persistence/terminal/reset and architecture/weapons; types/lint/build/diff.
- [x] One full unit run for cross-cutting state/UI; unchanged combat balance and
  comparison to G3 baselines, no new mechanic/tuning claimed.
- [x] Necessary bounded serial both-theme Default/Low+reduced-motion result/guide
  and terminal lifetime-once/resize/restart cases; affected existing save UI if
  actually changed. One worker/zero retries, images inspected, owned cleanup.
- [x] Report/product/status/reconciliation and settled V0.4.4 planning handoff in
  the same verified phase commit. No art or broad browser/stress/device campaign.

Natural first-attempt/offer frequency and environmental facts are not inferred
from aided browser fixtures. External checks remain waived/unverified.

Ownership extension before completion documentation: `build/MASTER_BUILD_PLAN.md`
for the required consolidated G4 implementation/verification record. No additional
runtime scope. Final visual inspection rounds displayed enemy game values to two
decimal places without changing authored/difficulty-resolved values.

Completed 2026-10-22: see [consolidated master record](MASTER_BUILD_PLAN.md#readable-gameplay-g4)
and [G4_REPORT](content/G4_REPORT.md). Final283focused/25files,703full/74files,
5serial browser passes/4.3s/no retries, types/lint/build/whitespace and120identical
G3ambient cases satisfy the selected gate. Prompt retired after durable record.
Next handoff is delivery/selected sprite planning; no new phase or art starts.

### Historical delivery, PR27 repair and follow-on claim context

The following records retain their original checkpoint state; the completed
Q6/G1–G4 disposition above and BUILD_STATUS own current status.

#### Delivery and remaining acceptance disposition

No unrelated content, dependencies, new sprites or optional work is selected.
[Session21 handoff](#readable-gameplay-q6) preserves current source and
authorized draft PR delivery. Q6 and the newly observed high-severity Vite audit
finding remain open; no merge or deployment is authorized. External actual
Safari/browserOS/older physical-device checks
remain temporarily waived/unverified, not passed. No current-head remote CI is
inferred from run39189877476 on2806720 or merge CI39193504359 on c6daeb6.
A later owner-approved delivery/check campaign
must use these changed sources; regenerate the historical device pack if needed.

Session21 delivery ownership extends the same10 documentation paths plus Git/PR
metadata. Owner explicitly requests “wrap this up and create PR for t4.3”, resolved
as existing `codex/v0.4.3`. Commit the selected planning decisions separately from
the completed phase commits and publish a draft PR into main. Local delivery
checks:655units/67files, typecheck, lint and build pass; audit fails with one high
Vite finding (GHSA-698v-4r3x-3vcv, GHSA-r825-w8mm-5pxw,
GHSA-587h-7wmj-h5pm). Vite remains6.4.3; suggested6.4.4 is outside its exact pin.
No dependency change or audit bypass is made. Full browser regression is deferred
to PR Actions; report its actual matching head/status, never a historical pass.

#### Planned follow-on after Q6 — readable gameplay and rubbish roster

Owner direction2026-10-21 is recorded in
[READABLE_GAMEPLAY_ROADMAP.md](#readable-gameplay-design-context). Q6 remains first and
unchanged. Follow-on G1 measures/rebalances current enemies against corrected
tools, G2 trials outdoor litter behaviour, G3 refines encounters/sites, G4 adds
mastery goals using existing surfaces. New candidates are not current runtime
content. Assign the appropriate milestone/branch and exact phase ownership before
implementation; do not silently expand this increment or reopen completed C1–C7.

The [planning baseline](content/READABLE_ROSTER_BASELINE.md) executes120 model
scenarios with no tuning changes. Parked eco projectile/explosion builds are
labelled nonrepresentative. This does not pass Q6/G1 or certify new balance,
browser/device performance or current-head CI. Existing acceptance/delivery
restrictions remain; the owner request authorizes planning and necessary measured
roster rebalancing in its proper phase, not wholesale optional content/art.


#### PR27 CI repair — owner-authorized scope

Owner requests fixing failed Actions checks. Start2026-10-21T01:32:46UTC
/12:32:46AEDT; deadline03:02:46UTC /14:02:46AEDT; final20reserve02:42:46UTC.
Claim before edits: package.json/package-lock.json; tests/e2e/{frame-measurements,
phase-six,profile-persistence-v043,second-tool-v043,shrines-curses-v043}.spec.ts;
build/performance/PR27_CI_REPAIR.md and repair-only appended sections of this plan,
BUILD_STATUS, MASTER_BUILD_PLAN, AUTONOMOUS_PROGRESS and RECONCILIATION. Preserve
all pre-existing genre/roster roadmap edits and untracked reports unstaged.
No production gameplay, Q6, sprites or tuning changes are selected. Run affected
browsers serially/one worker/zero retries with bounded waits and owned cleanup;
full regression stays in Actions. Apply only the necessary Vite audit patch.

Local repair gate passes as recorded in performance/PR27_CI_REPAIR.md:655units/
67files, types/lint/build/diff/audit0, seven unique affected serial browser cases
verified cumulatively/zero retries. Full current-head PR Actions must confirm
after push. Q6 stays open; pre-existing roadmap edits remain unstaged.


PR27 repair continuation: run39528406842 on a87f57f passes116browser cases/6skips/
no flaky tests; only both C3 cases fail a later dense-load wall-time assumption
(258–275simulation-ms/10s, target1000ms). Use the same bounded90s progress/120s
test budget there, preserving all assertions. Two affected serial cases pass12.5s
locally/zero retries; types/affected lint/diff pass. Remote confirmation pending.


PR27 second continuation ownership: add tests/e2e/{capacity-probe,phase-four-v02}.spec.ts
for newly observed slow-runner failures in39531764460; retain original exact actor/
clock/reset assertions. Existing phase-six ownership covers spawn-time reward
isolation after another valid adjacent-shrine interaction. No runtime/tuning change.


PR27 second continuation:39531764460 on df75471 passes both C3 cases but has
115passes/6skips/1flaky/2failures. Newly affected benchmark and short terminal
need bounded simulation-completion waits. Horde Space interaction changes world
modifiers after tagged enemies spawn; move it after exact spawn-time reward
assertions, then assert surge activation1/scheduled100. Three affected cases
pass17.9s locally, one worker/zero retries; types/affected lint/diff pass. Final
current-head full Actions remains unverified until its own run completes.

#### Post-merge correction handoff and G1 claim

PR27 merged the completed checkpoint as9837158. The owner now requests the
readable-gameplay plan/claim on main plus a G1 start prompt. Q6 remains open with
its existing checklist; the next implementation uses the follow-on
`codex/readable-gameplay-g1` branch and separate Q6/G1 verified commits rather
than reopening the merged milestone branch. [G1 ownership](#readable-gameplay-design-context)
and [start prompt](#readable-gameplay-g1) own continuation. Old draft/local-only
statements above describe historical delivery checkpoints, not this new request.

## PR28 roster CI repair — local verification / 2026-10-22

Failed39705612316 on dd30186 has138browser passes/6skips/four failures: old
five-role checks observe eight after G2. Four browser tests now derive exact
non-boss IDs/counts from activeTheme, including zero-count bosses in the roster
map and one elite per role. Sprite/contact/feedback semantics remain asserted;
five-child family rules stay five. No runtime/retry/skip/timeout/dependency change.
Final703units/74files, types/lint/build/whitespace and four affected serial
Chromium cases3.8s/zero retries pass; port4173 clean. Initial typing/zero-boss
expectation corrections are recorded in [repair report](performance/PR28_CI_REPAIR.md).
Matching-head automatic full Actions remains pending until its actual result.
Existing external waiver/unverified state remains; no merge or art selection.


<a id="v0-4-3-source-plan"></a>
## V0.4.3 — original phase specification and delivery history

Consolidated 2026-10-22. P0–P6 software and C1–C7 are delivered; Q6/G1–G4
results above supersede future-tense checkpoints below. External checks remain
waived/unverified. This is historical evidence, not authority to restart phases.

<a id="v043-source-v043--performance-readiness-and-selected-content-growth"></a>
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

<a id="v043-source-execution-authority"></a>
## Execution authority

[BUILD_STATUS.md](BUILD_STATUS.md) is the single date/status summary. Completed
Q1–Q5 and P0–P4 records, plus the verified P5 slices, are consolidated in
[MASTER_BUILD_PLAN.md](MASTER_BUILD_PLAN.md#v0-4-3-corrections). On 2026-10-20 the owner explicitly approves planned C1–C7 in dependency order after the verified software gate, with missing browser/device acceptance initially release-blocking rather than build-blocking. Session15 explicitly temporarily waives those outstanding external checks; they remain unverified, never passed. C1–C7 local gates are verified; Session21 identifies player-motion/cone-feedback corrections and selects vacuum target-cap growth for the next bounded correction gate below. Q6 subsequently passed in `44585dd`; G1–G4 then passed through `a10e3eb`. See the [completed log](MASTER_BUILD_PLAN.md#readable-gameplay); earlier future-tense sections below are historical. F16 is delivered and other optional proposals remain unselected.

<a id="v043-source-performance-prerequisites--p0p6"></a>
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
| P3 | Profiled existing spatial/separation/effects/events/weapons hot paths and scene call sites; exact measurement dependencies: `scripts/performance-p3.ts`, `scripts/performance.ts`, `src/game/systems/statistics/run-statistics.ts`, `src/game/systems/effects/on-kill-effects.ts`, corresponding `tests/unit/statistics/**`, existing `tests/e2e/phase-{five,nine}-v03.spec.ts` and compound stress gates, and `build/performance/P3*`; measurement-only archived theme selection/fixture controls, no production content changes | `perf(v0.4.3): reduce measured simulation overhead` |
| P4 | Measured rendering/presentation hooks, config, settings/UI, theme presentation tuning, content validation and presentation tests; exact dependencies: `scripts/performance.ts`, `src/game/ui/{minimap-ui,pause-menu-ui}.ts`, setting dispatch in `src/game/scenes/{run,menu}-scene.ts`, `src/game/state/settings-state.ts`, `src/game/core/archetypes/tuning.ts`, both themes’ `view.ts`, `src/game/content/define-theme.ts`, matching settings/content/UI units, `tests/fixtures/alternate-theme.ts`, `tests/e2e/presentation-v043.spec.ts`, and `build/performance/P4*`. Repository testing policy in `AGENTS.md` follows owner’s limited-local-browser instruction | `feat(v0.4.3): add a lightweight presentation mode` |
| P5 | Entity/feedback/scene lifecycle cleanup, restart tests, measured boot/asset-loading improvements outside the sprite pipeline. Session 6 exact dependencies: `src/game/scenes/run-scene.ts`, `src/game/entities/pickup-actor.ts`, `tests/unit/lifecycle/**`, `tests/e2e/lifecycle-v043.spec.ts`, `tests/fixtures/phaser-runtime.ts`, `build/performance/P5_LIFECYCLE_REPORT.md`, progress/reconciliation. Session 7 exact dependencies: `scripts/performance-startup.ts`, `src/main.ts`, `src/style.css`, `src/game/start-game.ts`, `src/game/scenes/boot-scene.ts`, `src/game/systems/boot/**`, `src/game/core/archetypes/contracts.ts`, `src/game/content/define-theme.ts`, both themes’ `copy.ts`, `tests/fixtures/alternate-theme.ts`, `tests/unit/boot/**`, affected architecture tests, and `build/performance/P5_STARTUP*`. Session 8 acceptance dependencies: `build/performance/P5_ACCEPTANCE_REPORT.md`, current/successor session handoffs, README handoff/status links, roadmap/status/master/progress and existing REC-119 continuation. Session 9 exact acceptance dependencies: `tests/e2e/native-visibility-v043.spec.ts`, `tests/unit/lifecycle/focus.test.ts`, `build/performance/P5_NATIVE_VISIBILITY.json`, acceptance report and current/successor handoffs. Session 10 owner-authorized consolidated campaign: `tests/e2e/lifecycle-campaign-v043.spec.ts`, `tests/fixtures/p5-campaign.{html,ts}`, `build/performance/P5_CAMPAIGN*`, acceptance/status/progress/master/reconciliation and successor handoff. Session 12 also owns `tests/native/firefox-compatibility.py`, `build/performance/P5_FIREFOX*` for two bounded unpatched Mozilla application smoke checks, without system installation/dependency changes. Session 12 P5 follow-up adds opt-in Edge executable/report selection in `tests/playwright.compatibility.config.ts`, native Safari driver support in `tests/native/safari-compatibility.py` and `build/performance/P5_{EDGE,SAFARI}*`. Session 11 owner-selected-by-delegation compatibility dependencies: `tests/playwright.compatibility.config.ts`, `tests/e2e/compatibility-environment-v043.spec.ts`, existing boot/phase-two/gameplay-rate/presentation/lifecycle specs (unchanged assertions), `build/performance/P5_COMPATIBILITY*` and acceptance/status/master/progress/reconciliation/handoffs. One bounded serial cross-engine run on available M5; no physical-device inference or P6. Session 10 authorization covered one serial M5 lifecycle campaign only. No runtime change without a reproduced defect. Existing sprite pipeline stays unchanged; startup changes require observed failure/cost | `fix(v0.4.3): bound lifecycle and startup costs` |
| P6 | Performance reports, browser harness, documentation and narrow regression fixes from the combined gate. Session 12 exact dependencies: `scripts/build-device-pack.ts`, `tests/device-pack/**`, `tests/e2e/device-pack-v043.spec.ts`, `tests/playwright.device-pack.config.ts`, `tests/e2e/phase-{five,eight-v03}.spec.ts`, `scripts/performance.ts` key-input holds, `tests/native/safari-compatibility.py`, `build/performance/P6*`, P5 acceptance/status/master/progress/reconciliation/handoffs. Owner explicitly requests starting P6 while finishing P5; software preparation may proceed, but no missing physical/browser evidence is marked passed and missing acceptance stays open (the later 2026-10-20 content-order revision is below). | `test(v0.4.3): verify browser performance readiness` |

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
- [x] P5 — recorded lifecycle/startup/software slices verified; outstanding external checks temporarily waived by owner in Session15. This closes the current gate by explicit disposition, not by new physical/browser evidence.
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
- [x] P5 remaining external check disposition — Session15 owner temporarily waives missing actual Safari, selected browser/OS combinations and representative older integrated-GPU checks. Waived/unverified, never passed; prior source/aided-campaign limits remain. No repeated campaign.
- [x] P6 software/readiness-tool slice —96 browser/stress passes/six explicit opt-in skips, zero retries;488units, types/lint/build/audit; portable device kit verified;18 warmed Default/Low windows at60/150/300, frozen sources. See `performance/P6_READINESS_REPORT.md`.
- [x] P6 external check disposition — Session15 owner temporarily waives the same missing browser/platform/physical checks. Software verified; external checks waived, not accepted evidence. No older machine is available.
- [x] Owner content-order revision (2026-10-20) — explicit “yes proceed” permits C1–C7 after verified software checks while missing acceptance remains release-blocking. No evidence was waived by that initial revision; the later explicit Session15
  temporary external-check waiver supersedes its release classification.

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

<a id="v043-source-content-scope-from-planmd"></a>
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

<a id="v043-source-phases"></a>
## Phases

Ordered by dependency, and sized so each ends in something playable.

<a id="v043-source-c1--weapon-slots-and-a-second-weapon"></a>
### C1 — Weapon slots and a second weapon

**Owner gate-order revision — 2026-10-20:** the owner explicitly replied “yes
proceed” to continuing planned C1–C7 with missing browser/device acceptance
release-blocking rather than build-blocking. P5 and P6 acceptance stay open;
software readiness is verified. This historical ordering note is superseded by
Session15's explicit temporary external-check waiver below. No additional
optional features or sprites are selected.

C1 foundation ownership (claim before edits): `src/game/core/archetypes/contracts.ts`,
`src/game/content/define-theme.ts`, both production themes' `{weapons,index}.ts`,
`src/game/state/run-state.ts`, `src/game/systems/weapons/{weapon-loadout,resolve-weapon}.ts`,
`src/game/entities/projectile-actor.ts`, `src/game/scenes/run-scene.ts`,
`tests/fixtures/alternate-theme.ts`, `tests/unit/weapons/weapon-loadout.test.ts`,
`tests/unit/content/theme.test.ts`, `tests/unit/run-state/run-state.test.ts`,
`tests/e2e/weapon-slots-v043.spec.ts`, and plan/status/master/progress/README/
`build/content/C1_FOUNDATION*`, acceptance reports/reconciliation/handoffs. This first verified slice establishes
serializable slot state, independent scheduling and actual hit-source ownership.
The second tool, owned upgrades, on-hit splash, balance and combined C1 gate
remain subsequent C1 slices; C2 cannot begin before C1 passes.

C1 Session14 ownership (2026-10-20, claimed before runtime edits):
`src/game/core/archetypes/{ids,contracts,effects}.ts`, `src/game/content/define-theme.ts`,
both themes' `{weapons,upgrades,index,copy}.ts`, `src/game/state/{run-state,statistics}.ts`,
`src/game/systems/upgrades.ts`, `src/game/systems/upgrades/{describe-upgrade,upgrade-tiers}.ts`,
`src/game/systems/weapons/{resolve-weapon,weapon-loadout,melee-stab,on-hit-splash}.ts`,
`src/game/systems/statistics/run-statistics.ts`, `src/game/systems/effects/on-kill-effects.ts`, `src/game/systems/simulation/{build-models,pacing-simulator}.ts`,
`src/game/entities/{projectile-actor,cone-attack-actor}.ts`, `src/game/scenes/run-scene.ts`,
`src/game/ui/pause-menu-ui.ts`, `src/test-support/telemetry-bridge.ts`,
`tests/fixtures/alternate-theme.ts`, corresponding units in `tests/unit/{weapons,upgrades,statistics,content,ui-selectors,simulation}/**`,
`tests/e2e/{second-tool-v043,weapon-slots-v043,grabber-weapon}.spec.ts`,
`scripts/balance.ts`, `build/content/C1_SECOND_TOOL*`, active plan/status/master,
README/progress/reconciliation/current+successor handoffs, `build/AUTONOMOUS_DEVELOPMENT_PLAN.md`,
`build/performance/P5_ACCEPTANCE_REPORT.md`, and the C1 sections of
PLAN/THEME_ARCHETYPES/EDUCATION_PIVOT/ECO_CONTENT_MAP. Reuse melee/projectile:
add optional authored cone geometry to melee, bounded on-hit splash, owner-local
progression and level-up acquisition. No factual education claim or bitmap work.

- [x] C1 foundation — slot state/resolution, independent clocks and hit ownership.
- [x] C1 second tool and weapon-conditioned upgrade offers.
- [x] C1 on-hit splash ledger, simulator, balance/readability/affected stress gate.

C1 gate verified locally on2026-10-20:509units/59files, types/lint/build/diff,
15 unique affected serial browser cases (final feedback subset5), both themes/
all models/all difficulties balance. Completed record and exact limits are in
[master](MASTER_BUILD_PLAN.md#v0-4-3-c1) and
[report](content/C1_SECOND_TOOL_REPORT.md). C2 is verified in Session15 below; C3 is verified in Session16; C4 verified in Session17; C5–C7 are verified below. The subsequent owner
waiver supersedes the missing P5/P6 external checks' release-blocking classification.

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

<a id="v043-source-c2--weapon-evolution"></a>
### C2 — Weapon evolution

Session15 ownership (2026-10-20, claimed before edits):
`src/game/core/archetypes/{ids,effects}.ts`, `src/game/content/define-theme.ts`,
both themes' `{weapons,index,copy}.ts`, `src/game/systems/upgrades.ts`,
`src/game/systems/upgrades/{describe-upgrade,upgrade-tiers}.ts`,
`src/game/systems/weapons/weapon-loadout.ts`,
`src/game/systems/simulation/{build-models,pacing-simulator}.ts`,
`tests/unit/weapons/weapon-evolution.test.ts`, affected content/tier/selector/simulation units,
`tests/e2e/second-tool-v043.spec.ts`, `build/content/C2*`, `build/BUILD_PLAN_V0.4.md`, plan/status/master/progress/
reconciliation/README/roadmap, product/theme/education/content map, P5 acceptance and
P6 readiness reports/current handoff. No persistence, sprite, physics or dependency edits.

- [x] Theme-owned evolution choice after four secondary-reach picks; replacement
  preserves slot position/capacity/clock and transfers local gains to the new ID.
- [x] Condition, stale/idempotent choice, reset, preview and combat/provenance rules.
- [x] Both-theme bounded browser/readability, affected load, balance and software gate.

Owner revision (2026-10-20): “yes waive those checks for now and continue with
build for c2” temporarily waives the outstanding actual Safari, missing selected
browser/OS combinations and older physical integrated-GPU acceptance checks.
They are waived/unverified, never passed. This supersedes their release-blocking
classification for now, without changing support evidence, historical results or
other phase verification. No new browser/device campaign is authorized or needed.

An evolved weapon is a new definition unlocked by a condition, not a mutated one.
Upgrade tiers (REC-065) are the natural trigger surface.

C2 verified locally2026-10-20:527units/60files, types/lint/build/diff;
eight unique affected browser cases verified, corrected evolution subset2
passes14.6s and final player-copy subset2 passes14.5s, one worker/zero retries. Both themes/ten models/three difficulties
balance. See [report](content/C2_REPORT.md) and [master](MASTER_BUILD_PLAN.md#v0-4-3-c2).

<a id="v043-source-c3--shrines-and-curses"></a>
### C3 — Shrines and curses

Session16 ownership (2026-10-20, claimed before edits):
`src/game/core/archetypes/{ids,contracts,effects}.ts`, `src/game/content/define-theme.ts`,
both production themes' `{shrines,curses,index,copy}.ts`,
`src/game/systems/chaos/world-modifiers.ts`, `src/game/systems/upgrades.ts`,
`src/game/systems/upgrades/{upgrade-tiers,describe-upgrade}.ts`,
`src/game/state/run-state.ts`, `src/game/scenes/run-scene.ts`,
`src/game/systems/simulation/pacing-simulator.ts`, `scripts/balance.ts`,
`tests/fixtures/alternate-theme.ts`, affected world/content/shrine/tier/selector units,
`tests/unit/chaos/curses.test.ts`, `tests/e2e/shrines-curses-v043.spec.ts`,
`tests/e2e/{phase-five-v02,shrine-arrivals}.spec.ts` if catalog-size assertions change,
`build/content/C3*`, status/plan/master/progress/reconciliation/README/roadmap,
PLAN/THEME_ARCHETYPES/EDUCATION_PIVOT/ECO_CONTENT_MAP and current/successor handoffs.
Retirement link-only dependencies: `build/content/C2_REPORT.md`,
`build/performance/P5_ACCEPTANCE_REPORT.md`; preserve their historical evidence.

- [x] Add scheduled pressure-for-XP shrine in both themes through existing world model.
- [x] Add two one-time level-up curses, run-local acceptance/provenance/reset,
  clear real-number offer preview and no repeat/tier-scaled bargain.
- [x] Validate definitions/references/composition and preserve exact XP/caps/causal work.
- [x] Both-theme affected browsers/readability, pacing and final software gate.

A curse is the inverse of a shrine: pressure the player accepts for a reward,
but persistent and chosen at a different moment. Both resolve through the world
model from REC-035, which already takes any number of contributors.

C3 verified locally2026-10-20:547units/61files, types/lint/build/diff; seven
unique affected serial browser cases verified (initial7pass40.1s, final C3 subset2
pass12.4s after visible-reward ordering correction and fixture XP correction).
Both themes/ten models/three difficulties/baseline+combined world fixture balance
(120scenarios; baseline output identical to C2). See [report](content/C3_REPORT.md)
and [master](MASTER_BUILD_PLAN.md#v0-4-3-c3). C4–C7 are verified below.

<a id="v043-source-c4--elite-modifiers-"></a>
### C4 — Elite modifiers ✅

Verified Session17: split/shield/acceleration family in both themes, exact inherited
identity/depth and source rewards, bounded pending work, shield-capped ledger,
simulation-age acceleration and readable markers.561units/63files and six unique
affected serial browser cases pass; see [report](content/C4_REPORT.md) and
[completed ownership/record](MASTER_BUILD_PLAN.md#v0-4-3-c4). C5–C7 are verified below.

<a id="v043-source-c5--mini-boss-and-final-boss-"></a>
### C5 — Mini-boss and final boss ✅

A boss is an enemy with a health bar, a telegraphed pattern, and a director
milestone that spawns exactly one. The final boss replaces the end-of-timer
prompt: it spawns where the decision used to appear, and REC-064's choice moves
to after the kill rather than being removed. See "Decisions settled before C1".

- [x] Unique capped mini/final milestones, theme-owned enemy and warning pattern.
- [x] Live boss phase, retained pause/level intent and after-kill endless/clearing.
- [x] Exact capped ledger/reward/reset, readable health/telegraph and affected checks.
- [x]583units/64files, six unique affected serial browser cases,60 coarse TTK scenarios;
  broader campaigns deferred, external checks waived/unverified. [Report](content/C5_REPORT.md),
  [completed ownership/record](MASTER_BUILD_PLAN.md#v0-4-3-c5).

<a id="v043-source-c6--persistence-unlocks-and-advanced-statistics-"></a>
### C6 — Persistence, unlocks, and advanced statistics ✅

- [x] Validated schema2, deterministic schema1 migration and safe local adapter.
- [x] Durable settings/terminal-only lifetime totals and theme-owned next-run unlocks.
- [x] Readable requirements/new rewards/failure warnings, affected browsers/software.

595units/65files, types/lint/build/diff pass;10 unique affected serial browser cases
verified cumulatively, including final five-case persistence capture and death-layout
check. [Report](content/C6_REPORT.md), [completed ownership](MASTER_BUILD_PLAN.md#v0-4-3-c6).
C7 is verified below; missing external device/browser checks remain waived/unverified.

The first real slice of `SAVE_DATA.md`. The session statistics slice from REC-062
is already shaped for the payload's lifetime-statistics field, so this is mostly
adapter and migration work rather than new modelling.

<a id="v043-source-c7--save-export-and-import-"></a>
### C7 — Save export and import ✅
- [x] Canonical codec, strict shared validation/migration and unknown-ID preservation.
- [x] Title-only export/file/paste preview, explicit backup/recovery/reset and stale checks.
- [x]655units/67files, five unique serial browser cases, types/lint/build/diff and production marker exclusion.

See [report](content/C7_REPORT.md), [results](content/C7_RESULTS.json) and
[completed ownership/record](MASTER_BUILD_PLAN.md#v0-4-3-c7).
Encoded text export, import with validation, preview, backup, and migration.
`SAVE_DATA.md` §"Verification required when implemented" is the acceptance list.

<a id="v043-source-what-this-stream-must-not-do"></a>
## What this stream must not do

- Edit anything in V0.4.1's ownership block (`BUILD_PLAN_V0.4.md` §3)
- Read a sprite in a system, or size a hitbox from one. The seam gives new
  content this for free: an actor with no sheet renders its primitive, so
  nothing added here needs art to ship
- Assume every content id has a sprite — most will not, for a while
- Reuse reconciliation ids below REC-100. REC-090 is preserved as a V0.4.3
  implementation discovery even though it predates the renumbering; new V0.4.3
  entries begin at REC-100.

<a id="v043-source-decisions-settled-before-c1"></a>
## Decisions settled before C1

These were the open questions. They remain the intended content-growth model,
but C1 must revalidate them after V0.4.2 rather than assuming the older
high-density direction survived unchanged.

<a id="v043-source-a-weapon-has-both-global-upgrades-and-its-own"></a>
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

<a id="v043-source-evolution-replaces-the-weapon-in-its-slot"></a>
### Evolution replaces the weapon in its slot

An evolved weapon takes the place of the one it grew from. It does not consume a
second slot, and the slot count is unchanged by evolving.

<a id="v043-source-the-final-boss-replaces-the-end-of-timer-prompt"></a>
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

<a id="v043-source-completed-correction-and-follow-on-disposition"></a>
## Completed correction and follow-on disposition

Q6 is complete in `44585dd`; G1–G4 are locally complete through `a10e3eb`.
Their original claims/checklists and final outcomes are consolidated in the
[master log](MASTER_BUILD_PLAN.md#readable-gameplay). PR27 CI repair/delivery
history remains in Git, the master, status, progress and its retained
[report](performance/PR27_CI_REPAIR.md). No Q6 or gameplay follow-on gate is open.

Remaining work is [cumulative delivery and owner-selected V0.4.4 planning](NEXT_READABLE_GAMEPLAY_HANDOFF.md).
The historical external waiver remains unverified; no current broad CI/browser/
stress/soak acceptance or new publication is established by this consolidation.

<a id="v043-source-pr28-ci-repair--claimed-before-edits--2026-10-22"></a>
## PR28 CI repair — claimed before edits / 2026-10-22

Owner requests diagnosing/fixing failed Actions. Active bounded repair ownership:
`tests/e2e/{enemy-roster,phase-six-v02,readable-contact-v0421,sprites}.spec.ts`,
`build/performance/PR28_CI_REPAIR.md`, this plan, BUILD_STATUS, MASTER_BUILD_PLAN,
AUTONOMOUS_PROGRESS and RECONCILIATION; Git/PR metadata for the existing PR28.
Failed run39705612316 on dd30186 reports four failures,138passes/6skips.
All four fail old five-role fixture expectations against eight configured
non-boss roles. Derive exact expected IDs/counts from activeTheme, retain the
existing semantic assertions and do not change runtime, retries, skips or timeouts.
Run affected browser cases serially/zero retries, types/units/lint/build/whitespace;
push one repair commit and verify matching-head Actions. No new content/art,
manual stress campaign, merge or physical/browser acceptance is selected.

<a id="v043-source-pr28-roster-ci-repair--local-verification--2026-10-22"></a>
## PR28 roster CI repair — local verification / 2026-10-22

Failed39705612316 on dd30186 has138browser passes/6skips/four failures: old
five-role checks observe eight after G2. Four browser tests now derive exact
non-boss IDs/counts from activeTheme, including zero-count bosses in the roster
map and one elite per role. Sprite/contact/feedback semantics remain asserted;
five-child family rules stay five. No runtime/retry/skip/timeout/dependency change.
Final703units/74files, types/lint/build/whitespace and four affected serial
Chromium cases3.8s/zero retries pass; port4173 clean. Initial typing/zero-boss
expectation corrections are recorded in [repair report](performance/PR28_CI_REPAIR.md).
Matching-head automatic full Actions remains pending until its actual result.
Existing external waiver/unverified state remains; no merge or art selection.


<a id="readable-gameplay-design-context"></a>
## Readable gameplay — original priorities, candidate assessment and sources

Consolidated 2026-10-22 after G1–G4. Candidate reserves remain unselected;
historical statements about next work are superseded by the current sprite plan.

<a id="readable-design-readable-cleanup-gameplay--four-phase-roadmap"></a>
# Readable cleanup gameplay — four-phase roadmap

Owner direction: 2026-10-21 (Australia/Sydney). Status: **Q6/G1 verified locally; G2 complete with three local keeps. G3/G4 locally complete; publication and new sprite work unstarted.**
The owner requests the ranked survivor-game ideas in a few phases, consideration
of Australian rubbish data as enemy candidates, and rebalancing existing enemies
where required. Implementation evidence and limits are in [G1_REPORT](content/G1_REPORT.md).

<a id="readable-design-authority-sequencing-and-ownership"></a>
## Authority, sequencing and ownership

Product intent lives in [PLAN.md](PLAN.md). This roadmap retains priorities,
candidate assessment and source context. [BUILD_STATUS.md](BUILD_STATUS.md)
owns actual completion; [the master log](MASTER_BUILD_PLAN.md#readable-gameplay)
owns completed Q6/G1–G4 plans and gates. Do not reopen verified C1–C7.

Sequence: **Q6 → G1 existing-roster balance → G2 bounded outdoor variety →
G3 encounter rhythm and optional sites → G4 mastery and replay goals**.
G1–G4 are phase labels, not saved IDs or retroactive V0.4.3 content.
The completed implementation authority is the [master log](MASTER_BUILD_PLAN.md#readable-gameplay).
Preserve theme-owned tuning, presentation/physics separation, stable IDs and
existing persistence contracts. No additional content is selected by this record.

<a id="readable-design-priorities-carried-forward-from-the-genre-analysis"></a>
## Priorities carried forward from the genre analysis

These are design judgments for this project, not measured retention results.

| Rank | Feature | Owning phase / treatment |
| --- | --- | --- |
| 1 | Readable, satisfying tool actions | Q6 prerequisite; preserve through every gate |
| 2 | Visible tool growth and transformation | Q6/G1; improve existing Grabber/Sweep/Vacuum/evolution |
| 3 | Material behaviours that change decisions | G1 existing roles, then G2 candidates |
| 4 | Player-controlled risk/reward | G3; refine existing shrines/curses |
| 5 | Gradual introduction | G1–G3; teach before combining |
| 6 | Pressure, upgrade, relief, renewed challenge | G1/G3; measure wall time as well as game time |
| 7 | Complementary tools and viable choices | G1; avoid one compulsory build |
| 8 | Worthwhile destinations | G3; use existing arena/sites/minimap |
| 9 | Unlocks that encourage a new approach | G4; use existing profile/unlock services |
| 10 | Bosses testing learned skills | G3; refine existing mini/final encounters |
| 11 | Useful results and specific next goals | G4; existing results/Field Guide |
| 12 | Optional discovery and sourced information | G2 descriptions; G4 optional guide depth |
| 13 | Distinct playable characters | Deferred until tool/material choices justify expansion |
| 14 | Permanent statistical growth | Secondary; no grind needed to make the opening enjoyable |
| 15 | Large proc chains/spectacle | Bounded, readable effects only; parked eco chains stay parked |
| 16 | Complex equipment economy/crafting | Deferred; no new resource economy in these phases |
| 17 | 3D traversal/movement tricks | Outside current camera/control scope |
| 18 | Maximum enemy density | Technical ceiling only, never a design success metric |

<a id="readable-design-australian-waste-evidence--two-different-measures"></a>
## Australian waste evidence — two different measures

Reviewed against the supplied primary sources on **2026-10-21**. Keep source,
region, reporting period, metric and denominator with any eventual fact entry.
The datasets describe different populations: neither measures combat danger,
health, speed, persistence or the right tool for a material.

<a id="readable-design-a-waste-generated-by-weight"></a>
### A. Waste generated by weight

[DCCEEW, National waste and resource recovery report 2026](https://www.dcceew.gov.au/environment/protection/waste/publications/national-waste-resource-recovery-report-2026),
published 22 September 2026; Australia, FY2024–25. Generation includes material
subsequently recovered. These are the supplied leading material categories, not
an exhaustive breakdown of the approximately 79.0 million tonnes total.

| Rank | Category | Million tonnes generated |
| --- | --- | --- |
| 1 | Building/demolition materials: concrete, brick, asphalt, rubble, soil, rock | 27.4 |
| 2 | Organics: food, garden material, timber, biosolids | 15.5 |
| 3 | Ash, mainly coal-fired power stations | 10.3 |
| 4 | Hazardous waste excluding tyres, largely contaminated soil | 8.0 |
| 5 | Metals | 5.9 |
| 6 | Paper/cardboard | 4.9 |
| 7 | Plastics | 3.0 |
| 8 | Glass | 1.5 |

<a id="readable-design-b-outdoor-litter-collected-by-item-count"></a>
### B. Outdoor litter collected by item count

[Clean Up Australia, FY25 national litter fact sheet](https://www.cleanup.org.au/wp-content/uploads/2026/02/Clean-Up-Australia_Litter-Report-FY25_National-Fact-Sheet.pdf),
page 1, individual-items table. Australia, FY2024–25; **1,358 surveyed locations**.
These are shares of counted litter from participating surveyed sites, not a
census of all Australian litter. Site types are combined; local mixes vary.

| Rank | Item | Share of all counted litter |
| --- | --- | --- |
| 1 | Cigarette butts | 23.6% |
| 2 | Soft-plastic packets/wrappers | 18.6% |
| 3 | Plastic food/retail/garbage bags | 8.7% |
| 4 | Aluminium beverage cans | 5.6% |
| 5 | Plastic beverage bottles | 4.8% |
| 6 | Takeaway coffee cups | 4.3% |
| 7 | Plastic food containers/utensils | 4.1% |
| 8 | Glass beverage bottles | 3.4% |
| 9 | Hard-plastic fragments **larger than 5 mm** | 2.7% |
| 10 | Other soft plastics | 2.5% |

Plastics account for **80.8%** in the source's material classification, including
plastic cigarette filters. Do not add this material share to the individual-item
shares, normalize the top ten into a full distribution, or turn percentages into
literal spawn chances. Hard fragments >5 mm are not the existing Microplastics
identity. “Plastic dominates” does not mean “plastic bottles are the most counted
item.” Rubble's tonnage does not make it the common outdoor swarm.

<a id="readable-design-enemy-candidates-and-their-distinct-decisions"></a>
## Enemy candidates and their distinct decisions

The table preserves the original **candidate assessment**. Cigarette Butts,
Wrappers and Can were subsequently accepted in G2; other candidates remain
unselected. Names in this research table are editorial subjects, not runtime IDs. Motion, contact damage and danger cues are game abstractions.
The sources above do not justify toxicity numbers, decay estimates, universal
recycling rules or a tool-effectiveness matrix.

| Subject / grouping | Proposed gameplay role and player decision | Placement / constraint |
| --- | --- | --- |
| Cigarette Butts | Readable clusters of weak litter: clear a route before a site becomes crowded | G2 first candidate; retain visible footprint and room to dodge; no tiny invisible contact damage or automatic harmful patch on every successful collection |
| Packets / Wrappers | Telegraph a short gust, drift across the route, then pause: choose an interception point | G2 second candidate; distinct from continuously chasing Microplastics; finite movement, no off-screen unavoidable arrival |
| Aluminium Can | Telegraph a roll toward the player's previous position, then roll past and recover: sidestep rather than simply flee | G2 alternative/next candidate after prior gates; neutral reusable movement capability |
| Plastic Bags | Future gust-driven broad silhouette, only if distinguishable from wrappers | Candidate reserve; do not restore retired Plastic Bag mapping over `enemy.fast_fragile` or duplicate Bagged Waste |
| Plastic Bottle | Familiar middle-durability baseline and a source of finite fragments | Existing; keep stable role, balance in G1 |
| Coffee Cups | Recognizable composite packaging; possible cluster/site variant | Reserve until it creates a different decision; do not classify every cup as pure paper or universally recyclable |
| Food containers / utensils | Rigid-packaging grouping with optional visual variation | Reserve; distinct mechanics required before another archetype |
| Glass Bottle / Shards | Durable cleanup commitment followed by a stationary route hazard when fragmentation occurs | Existing; G1 preserves the finite material relationship |
| Hard-plastic pieces >5 mm | Larger visible fragment/obstruction candidate | Reserve; separate identity from Microplastics; no arbitrary renaming of saved roles |
| Other soft plastics | Visual/site variety within the wrapper/bag design space | Reserve, not a compulsory additional role |
| Building rubble | Slow or stationary heavy obstruction in a marked construction cleanup site | Later site/encounter candidate, not a prevalent park chaser; no routine crushing/asbestos-handling lesson |
| Organic waste | Low-durability food/garden grouping for a later market/park site | Later candidate; distinguish contexts, not all organics are ordinary litter or have one persistence time |
| Paper / Cardboard | Weak sheet or unfolding obstruction for a later packaging site | Later candidate; keep coffee-cup composites separate |
| Scrap metals | Heavy recoverable obstruction/encounter, distinct from light drink cans | Later industrial-site candidate; mass is not contact toxicity |
| Ash | Marked industrial area/encounter rather than a household rubbish enemy | Deferred; these rankings establish prevalence only, not exposure or handling guidance |
| Hazardous / contaminated waste | Clearly marked containment objective with a fictional specialist response | Deferred; no generic Grabber/Vacuum effectiveness or safe-disposal claim inferred |

<a id="readable-design-completed-four-phase-build"></a>
## Completed four-phase build

The [master build log](MASTER_BUILD_PLAN.md#readable-gameplay) now owns all
completed Q6/G1–G4 scope, exact ownership, decisions, checklists, commits and
verification. G1–G4 scoped local gates are complete through G4 `a10e3eb`.
Individual evidence reports remain linked there. Former phase prompts are retired.
Historical proposed candidates above do not authorize additional content or art;
the implemented settled roster is in [V0.4.4](SPRITE_PLAN_V0.4.4.md).

<a id="readable-design-next-decision"></a>
## Next decision

The [current handoff](NEXT_READABLE_GAMEPLAY_HANDOFF.md) covers cumulative local
delivery and separately selected sprite inventory/frame/canvas/style work. No
further gameplay phase is required by this roadmap. Broad current-app CI/browser/
stress/soak remains deferred; external Safari/browser-OS/older physical-GPU checks
remain waived/unverified. New facts, saved discoveries and additional content
remain separately selected scope.


<a id="performance-original-sequencing"></a>
## Performance — original session sequence and acceptance contract

Historical planning input; actual outcomes and waivers are recorded in the phase
records above. Do not execute this superseded session backlog.

<a id="performance-source-autonomous-development-plan--browser-performance-first"></a>
# Autonomous development plan — browser performance first

Current dates, statuses and gates: [BUILD_STATUS.md](BUILD_STATUS.md).
Assessment date: 2026-10-11 (Australia/Sydney).
Amended: 2026-10-11 with the owner's recycling-game ideation document.

<a id="performance-source-resource-policy-for-every-future-session"></a>
## Resource policy for every future session

The owner's AGENTS.md limited-local-browser policy overrides older session
command lists below. Prefer deterministic/source checks and existing matching-
head Actions evidence. Run only necessary bounded affected browsers serially,
one worker/zero retries; clean up owned processes. Full local Chromium/stress,
long soaks and repeated performance campaigns require a separately scheduled
consolidated run. Deferred requirements remain pending. Historical Session 1–7
recipes are context, not permission to repeat those campaigns.

<a id="performance-source-objective-and-authority"></a>
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

<a id="performance-source-verified-starting-point--2026-10-11-assessment-snapshot"></a>
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

<a id="performance-source-findings-that-determine-the-first-tasks"></a>
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

<a id="performance-source-performance-acceptance-contract"></a>
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

<a id="performance-source-milestone-and-ownership-integration"></a>
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

<a id="performance-source-session-execution-protocol"></a>
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

<a id="performance-source-selected-interruption-after-session-1"></a>
## Selected interruption after Session 1

The owner selected F16 as Beginner / Normal / Experienced (Normal slightly
below the old baseline), plus player walk/facing, crisp background text and common
tool-upgrade corrections. Q1 in the active plan owns this before Session 2/P1.
This replaces F16's provisional Relaxed/Standard/Challenge naming and its
unchanged-Standard assumption. Other optional features are unselected. After Q1
verifies, resume P1, then P2–P6; refresh the P0 comparison scenario for the new
Normal baseline rather than claim that old gameplay recordings are equivalent.

<a id="performance-source-performance-session-backlog--approximately-816-hours"></a>
## Performance session backlog — approximately 8–16 hours

<a id="performance-source-session-1--p0-recover-a-trustworthy-baseline"></a>
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

<a id="performance-source-session-2--p1-remove-diagnostic-work-from-the-production-loop"></a>
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

<a id="performance-source-session-3--p2-reduce-repeated-minimap-and-hud-work"></a>
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

<a id="performance-source-session-4--p3-optimize-the-highest-measured-simulation-hotspot"></a>
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

<a id="performance-source-session-5--p4-a-lightweight-presentation-mode-for-older-devices"></a>
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

<a id="performance-source-session-6--p5-first-slice-lifecycle-and-sustained-play-reliability"></a>
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

<a id="performance-source-session-7--p5-second-slice-startup-and-browser-compatibility"></a>
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

<a id="performance-source-session-8--p5-remaining-lifecyclecompatibility-acceptance"></a>
### Session 8 — P5: remaining lifecycle/compatibility acceptance

The affected Session 6/7 gates do not complete P5. Session 8 completed the
[acceptance inventory](performance/P5_ACCEPTANCE_REPORT.md); the native visibility
probe could not reach hidden state. Sessions 9–10 subsequently verify native
overlays and the scoped consolidated lifecycle campaign. Session15 explicitly
temporarily waives the outstanding external browser/device checks; continue
[current C7 work](MASTER_BUILD_PLAN.md#v0-4-3-c7). Historical evidence stays source-bound. Prefer
existing evidence and deterministic checks; only a necessary bounded serial
browser fixture is allowed. Long soaks/full local suites remain deferred, not
passed. P6 must wait for the P5 gate or an explicit recorded owner gate change.

<a id="performance-source-session-9--p5-continuation-native-events-and-remaining-acceptance"></a>
### Session 9 — P5 continuation: native events and remaining acceptance

Completed bounded slice: one trusted native same-window tab round trip passes
on Chromium/Metal, with 7.493 ms first observed advancement after 1.33 s hidden,
unchanged spawns/empty queues, and 14 deterministic focus-state checks. See the
[acceptance report](performance/P5_ACCEPTANCE_REPORT.md). No runtime defect or
change; authored/sustained/native-overlay/audio/device requirements remain open.

<a id="performance-source-session-10--p5-authorized-consolidated-lifecycle-and-device-evidence"></a>
### Session 10 — P5: authorized consolidated lifecycle and device evidence

Owner explicitly authorized the consolidated M5 campaign on 2026-10-19. Its
20-minute ownership window passes within explicit test-only survival/focus aids:
authored clock, five-minute endless extension, ten short terminals, native
paused/level-up/time-up/pending work, quality/resize and actual audio closure.
See [campaign report](performance/P5_CAMPAIGN_REPORT.md). No runtime defect/fix.

<a id="performance-source-session-11--p5-selected-desktop-support-and-engine-evidence"></a>
### Session 11 — P5: selected desktop support and engine evidence

Owner delegated support selection and authorized testing. Selected desktop
Chrome/Edge/Firefox/Safari current/previous-major on vendor-supported OS; 52
focused checks pass serially across installed Chrome and pinned Chromium/Firefox/
WebKit. Test-only key-hold/resize-readiness corrections; no runtime fix. See
[compatibility report](performance/P5_COMPATIBILITY_REPORT.md). Actual branded/
platform/older physical-device coverage remains open.

<a id="performance-source-session12--p5-branded-checks-and-p6-software-slice"></a>
### Session12 — P5 branded checks and P6 software slice

Owner requests P6 work alongside remaining P5.26 focused Edge155/154 checks
and two unpatched Firefox158/157 smokes pass. Safari access remains blocked;
owner confirms no older device. P6 software has96 browser/stress passes/six
opt-in skips/zero retries,488units/types/lint/build/audit, a verified portable
kit/manual checklist and18 frozen warmed Default/Low60/150/300 windows. See
[readiness report](performance/P6_READINESS_REPORT.md). Physical/Safari/other
release/platform acceptance remains pending, not passed.

<a id="performance-source-session13--owner-approved-c1-foundation"></a>
### Session13 — owner-approved C1 foundation

On 2026-10-20 the owner explicitly approves planned C1–C7 after verified software
checks, with missing browser/device evidence release-blocking. C1 is verified locally, including the second tool, owner-only progression,
on-hit splash and the combined affected gate. Session15 verifies C2 evolution;
Session16 verifies C3 shrines/curses; continue C4 using
[SESSION_20_PROMPT.md](MASTER_BUILD_PLAN.md#v0-4-3-c7). Owner explicitly
temporarily waives missing actual Safari/browser-OS/older physical-device checks;
waived/unverified, never passed. Historical measurements remain source-bound.
No optional/sprite scope is added.

<a id="performance-source-after-p5--p6-combined-readiness-gate-and-real-device-report"></a>
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



<a id="sprite-style1-history"></a>
## Sprite style 1 — superseded inventory and prompt contracts

Preserved 2026-10-22 for build history. REC-120/121, the current style guide and
V0.4.4 plan supersede these canvas sizes, old inventory and frame descriptions.
The five accepted style1 sheets remain shipped pending reviewed replacements.
These historical TBC/parked statements are not current generation instructions.

# V0.4.4 — Sprite roster reconciliation (TBC)

Current status and dates: [BUILD_STATUS.md](BUILD_STATUS.md). This is an ongoing,
gated plan, not a claim list. Read REC-078, the [master pipeline record](MASTER_BUILD_PLAN.md#v0-4-1),
[style guide](SPRITE_STYLE_GUIDE.md) and [manifest](sprites/MANIFEST.md).
Before any claim or generation, reconcile the roster against settled V0.4.2 /
V0.4.3 content; confirm stable IDs, subjects, sizes and frame roles. Optional
content and new art remain unselected. Higher sprite resolution remains parked.

## Settled roster checkpoint after G4 — 2026-10-22

G1–G4 are locally verified, ending on `codex/readable-gameplay-g4`.
[G4_REPORT](content/G4_REPORT.md) owns current limits. This reconciles identity,
body and current presentation for planning; it is not an art claim or acceptance.
Frame/canvas selections for remaining work are still TBC. The runtime definitions
and current sprite map remain authoritative; never derive a body from this table
or a generated sheet. Listed radius/display diameter are authored world units,
independent of camera2× and sheet pixels. Elite rendering keeps the base identity.

| Stable ID | Current eco subject | Radius / display diameter | Current presentation and frame constraint |
| --- | --- | --- | --- |
| `character.starter` | Environment Protector |18 /42| Accepted48px/8frame sheet; preserve Q6 per-frame hood anchors and existing walk/hit/death mapping |
| `enemy.swarm_basic` | Plastic Bottle |14 /36| Accepted32px/4frames idle/move/hit/death |
| `enemy.fast_fragile` | Microplastics |10 /26| Current24px/4frame sheet; never rename back to Plastic Bag or reinterpret old IDs |
| `enemy.slow_durable` | Glass Bottle |22 /50| Accepted48px/4frames; G1 durability change does not require new art |
| `enemy.death_spawner` | Bagged Waste |25 /56| Accepted48px/4frames; releases existing Bottle/Microplastics family |
| `enemy.stationary_fragment` | Glass Shards |12 /28| Reuses Glass death pose/frame3; stationary, no walk animation requirement; dedicated sheet TBC |
| `enemy.cluster_fodder` | Cigarette Butts |10 /28| G2 primitive individual, three actors per group; never draw a group as one body; sheet/frames TBC |
| `enemy.gust_drifter` | Packets / Wrappers |12 /34| G2 primitive; warning, oblique committed gust and recovery must stay readable; sheet/frames TBC |
| `enemy.committed_charger` | Aluminium Can |14 /38| G2 primitive; direct line warning, roll and recovery remain distinct; sheet/frames TBC |
| `enemy.mini_boss` | Compacted Waste |26 /64| Primitive; fixed-circle warning/one pulse/recovery/pursuit hold; sheet/frames TBC |
| `enemy.final_boss` | Dumping Colossus |32 /90| Primitive; same fixed-circle contract, unique terminal flag; sheet/frames TBC |

Microplastics remain both the live opening role and Bottle's Fragmentation result;
Glass Shards remain stationary. No independent Bottle/Bag/Glass fragment trio or
retired Plastic Bag sheet follows from the historical inventory. G2 groups do not
spawn new children. Knight-magic remains a complete primitive fallback pack; this
checkpoint does not require a second generated roster.

Other current presentation subjects, still unselected for generation:

- `weapon.starter` Cleanup Grabber: procedural extension/contact/retraction and
  Collection Sweep; base78reach/18width with earned growth. Historical64×16/3frame
  and32px icon suggestions are not accepted specs. Tool frames must align with
  real contact timing; no art-derived reach, width, target count or damage.
- `weapon.secondary` Cleanup Vacuum /`weapon.secondary_evolved` Cyclone Vacuum:
  melee cone pulses, primary caps3→7 /4→8 and nearby splash. Visual assets must
  preserve pulse versus fade and same-slot evolution; canvas/frame roles TBC.
  Sorting Pulse remains parked for eco.
- `pickup.experience` Impact Point: current radius7 primitive. Existing fractional
  reward/merge/magnet semantics do not create new stable orb-tier IDs. Sheet and
  tiers TBC; no art-derived pickup radius/reward.
- Five sites, not the old four: `shrine.spawn_surge` Landfill Breach,
  `shrine.greed` Fast Fashion Boom, `shrine.multiplicity` Single-Use Boom,
  `shrine.duplication` Overproduction Order, `shrine.escalation` Unmanaged Dump.
  All radius24/interaction120; idle/available/spent distinctions and current
  prompt/minimap/edge indicators must remain. Old64px/4frame specs are TBC.
- `hazard.damage_zone` Contamination Spill radius110, `hazard.obstacle` Debris
  Pile radius46, `hazard.periodic_burst` Methane Vent radius96. Warning/active/
  recovery or cleared states need a selected tile/scaling/frame design. Never
  replace fixed authored damage regions with sprite geometry.
- Elite cues, optional variants and full-roster/fallback/performance acceptance
  remain separate pending selections. G4 adds UI only; no new mastery sprites.

Next: owner selection of bounded subjects and exact style/frame/canvas contracts,
then the existing manifest claim/acceptance workflow. No manifest rows are claimed
or changed here. No generated art, higher resolution or pipeline edits occurred.
The historical tables below remain history, superseded where this checkpoint
resolves a subject count/identity/role.

## Remaining scope to reconcile

- Dedicated fragment sheets and elite treatment.
- Cleanup Grabber action/icon and pickup presentation.
- Shrines, hazards, variants and full-roster/fallback/performance acceptance.
- Keep accepted sheets as the style baseline, subject to promoted material changes.

The following original inventory and S2–S5 targets are retained as historical
inputs only. Their completed player/enemy portions are already in the master;
remaining rows are not automatically approved or valid after roster changes.
No original recommendation overrides REC-071–073 or current contracts.

## 1. Inventory

This was the original thirty-two-sheet inventory. It is retained as planning
history, not as the V0.4.4 claim list: Sorting Pulse is now parked for the
knight-magic theme and the Cleanup Grabber's sheet size/frame roles must come
from the V0.4.2 prototype.

| # | Subject | Class | Canvas | Frames | Detail | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Plastic Bottle | Standard enemy | 32×32 | 4 | medium | **Baseline — do first** |
| 2 | Plastic Bag | Small enemy | 24×24 | 4 | low | 1 |
| 3 | Glass Bottle | Large enemy | 48×48 | 4 | medium | 1 |
| 4 | Bagged Waste | Large enemy | 48×48 | 4 | medium | 1 |
| 5 | Environment Protector | Player | 48×48 | 8 | high | 1 |
| 6 | Cleanup Grabber — V0.4.4 target | Melee tool | 64×16 | 3 | medium | — |
| 7 | Impact Point | Pickup | 16×16 | 3 | low | 1 |
| 8–10 | Bottle / Bag / Glass fragments | Small enemy | 24×24 | 4 | low | 2 |
| 11–14 | Four shrines | Shrine | 64×64 | 4 | high | 2 |
| 15–17 | Three hazards | Hazard | 64×64 | 4 | medium | 2 |
| 18 | Elite outline overlay | Overlay | per class | 1 | low | 2 |
| 19–30 | Colour variants `c2`/`c3` for enemies 1–4 and fragments | — | — | — | — | **Free** — hue rotation |
| 31 | Cleanup Grabber icon — V0.4.4 target | Weapon | 32×32 | 3 | high | — |
| 32 | Impact orb tiers (3 sizes) | Pickup | 16×16 | 3 | low | 3 |

Twelve of the thirty-two are colour variants produced by hue rotation, so the
real generation count is **twenty**.

### The knight-magic problem

`knight-magic` is a second complete production pack, and theme validation requires
both to be complete. Generating a second full sprite roster doubles the work for a
pack nobody plays.

**Decision:** sprites are optional theme content. A pack without them falls back to
the current primitives, which keeps `knight-magic` valid and playable at zero art
cost. This has to be designed in from the start — see §3 — because retrofitting
optionality after the entities assume a texture is much harder.

---

### Phase S2 — The rest of the enemy roster
Bag, Glass, Bagged Waste, plus fragments and the elite overlay. Ends with every
enemy sprited and the primitives unused for enemies.

*Verification:* all four roles distinguishable in a 300-enemy crowd screenshot;
fragments visibly derived from their parents; `check` passes for every sheet.

### Phase S3 — Player, weapon, projectile, pickup (historical target)
The high-detail work. The player is the only 8-frame sheet and the only real
animation.

*Verification:* the walk cycle reads at the player's actual move speed; the
equipped weapon's full action is legible at the active camera and gameplay rate.
For the eco theme that now means the Cleanup Grabber's extend/contact/retract
cycle, not a travelling projectile.

### Phase S4 — Shrines and hazards
The static, high-ornament subjects. Hazards need a scaling decision — a 64×64
sheet stretched to a 110-unit damage zone will look soft, so these are likely
9-slice or tiled rather than scaled.

*Verification:* a shrine reads from across the arena; hazard telegraphs are still
unmistakable, which is the property REC-053 cares about.

### Phase S5 — Variants, polish, and the fallback proof
Colour variants, the `knight-magic` fallback path proven by running it with no
sprites at all, a full-roster consistency review with every sheet side by side,
and a final frame-time measurement against the S1 baseline.

*Verification:* both production packs run; `knight-magic` renders primitives with
no errors; the roster reads as one artist's work.

---

## 8. Risks

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Generated sprites do not match each other well enough | **High** | The style lock, the palette snap, and the baseline-comparison step. Budget several attempts per sprite |
| A sprite implies a different hitbox than its radius | Medium | The rule in §3, plus a `check` assertion that the drawn silhouette fits the declared radius |
| Two agents generate the same sprite twice | Medium | The claim protocol in the manifest, and attempt-numbered raw filenames so nothing is overwritten |
| Frame time regresses with 300 textured sprites | **Low, now** | The atlas moved to S1 (§6), which removes the batching risk rather than mitigating it. Still measured in S1 and again in S5 |
| The 4-step rule reads as flat rather than chunky | Medium | Tune the style lock after the first batch (style guide §8) — this is expected, not a failure |
| Art work stalls the milestone's mechanical items | Medium | Phases are independently shippable; the fallback means a half-finished roster still runs |

---

## 9. What "done" looks like

A run where every visible thing is a sprite drawn to the same style, the crowd is
*more* readable than it was with primitives rather than less, `knight-magic` still
runs on primitives with no errors, and any new sprite can be produced by pasting
the style lock plus one subject block into an image tool and running
`npm run sprites -- build`.

The last clause is the real deliverable. A finished roster that cannot be extended
is worth less than a half-finished one that can.

For the 2026-09-02 checkpoint, "done" is narrower: sheets #1–5 are accepted and
live from one atlas, the build is reproducible from untouched raw attempts, and
the remaining inventory is clearly handed to the post-rebalance sprite phase.
The full-roster definition above remains the target for that future phase after
its inventory is revalidated.


# Sprite Style Guide and Prompt System

The art bible for V0.4. It exists so that a sprite generated in three months sits
next to one generated today and reads as the same game.

Two things make that work, and they are the whole document: a **style lock** that
never changes between prompts, and a **subject slot** that is the only thing that
does. Everything else here is scaffolding around those two ideas.

Read this alongside [`MASTER_BUILD_PLAN.md#v0-4-1`](./MASTER_BUILD_PLAN.md#v0-4-1), for the completed pipeline, and
[SPRITE_PLAN_V0.4.4.md](SPRITE_PLAN_V0.4.4.md) for the gated remaining inventory.
This file owns the look.

> **On the reference.** The target was given as "HoloCure-like, somewhat 2-bit but
> still detailed enough", with an ArtStation link. The specification below is
> written from that description, not from an analysis of the image — nobody
> should treat these numbers as measured from the reference. They are a starting
> point to be corrected once the first batch exists. Correcting them is expected;
> see [Tuning the style lock](#8-tuning-the-style-lock).

---

## 1. The style in one paragraph

Chunky pixel art at a low native resolution, upscaled with nearest-neighbour so
every pixel stays square and visible. Each sprite is built from a **small number
of flat tonal steps per material** — the "somewhat 2-bit" read — but the shapes
themselves are detailed and specific, so a plastic bottle is unmistakably a
plastic bottle and not a generic blob. Bold, dark, fully-opaque outlines around
every silhouette. Saturated colour with clear value separation. No gradients, no
soft shadows, no anti-aliasing, no motion blur. Readability at a glance beats
fidelity: this is a sprite that will appear two hundred times on screen at once.

## 2. Hard constraints

These are the non-negotiables. A sprite that breaks one of them is rejected in QA
regardless of how good it looks in isolation.

| Constraint | Value | Why |
| --- | --- | --- |
| Native canvas | Per class, see §4 | Fixed sizes keep the whole roster in proportion |
| Upscale | Nearest-neighbour only | Any smoothing destroys the pixel read |
| Tonal steps per material | **4** (base, shadow, highlight, deep shadow) | The "2-bit" feel; more steps and it drifts into painterly |
| Outline | 1px at native res, fully opaque | The single strongest cue that sprites belong together |
| Outline colour | Darkest value of the sprite's own hue, never pure black | Pure black flattens a saturated palette |
| Anti-aliasing | None | Half-pixels destroy the grid |
| Background | Fully transparent | Composited over the arena floor |
| Light direction | Top-left, consistent across every sprite | The most common source of "these don't match" |
| Perspective | Straight-on, very slight top-down tilt | Matches the existing top-down arena |
| Palette | Drawn from the theme's tokens, see §3 | The sprites must not fight the UI |

### The 4-step rule, precisely

For each *material region* in a sprite — a bottle's plastic body, its cap, its
label — pick one hue and use exactly four values of it:

1. **Deep shadow** — the outline colour and the deepest occlusion
2. **Shadow** — the bottom-right ~30% of the form
3. **Base** — the dominant value, roughly half the region
4. **Highlight** — a small top-left accent, no more than ~15% of the region

Four steps is what produces the chunky, poster-like read. A sprite may contain
several material regions, each with its own four-step ramp — that is how it stays
detailed without becoming painterly.

## 3. Palette discipline

Sprites are theme content, so their colours come from the theme's existing token
palette rather than being invented per sprite. The `eco-guardian` pack already
defines the anchors:

| Token | Hex | Used by |
| --- | --- | --- |
| `enemy` | `#60a5fa` | Plastic bottle family |
| `enemyFast` | `#e2e8f0` | Plastic bag family |
| `enemyTank` | `#2dd4bf` | Glass bottle family |
| `enemySpawner` | `#c084fc` | Bagged waste family |
| `player` | `#4ade80` | The Environment Protector |
| `projectile` | `#7dd3fc` | Cleanup Grabber and reusable weapon effects |
| `pickup` | `#a3e635` | Impact points |
| `shrine` | `#fb7185` | Site events |
| `elite` | `#fde047` | Elite outline treatment |

**Rule:** a sprite's base value is its token colour. The other three steps are
derived from it, not chosen freely:

```
deep shadow  = token darkened 45%, saturation +10%
shadow       = token darkened 22%
base         = token exactly
highlight    = token lightened 25%, saturation −8%
```

Deriving rather than picking is what stops the roster drifting apart over dozens
of generations. Record every derived ramp in the manifest so it is reproducible.

### Colour variants

A variant ("bottle enemy colour 2") is **the same sprite with a rotated hue**,
never a redraw. Rotate the base hue by a fixed amount and re-derive the ramp:

| Variant | Hue rotation | Intended use |
| --- | --- | --- |
| `c1` | 0° (the token) | Default |
| `c2` | +40° | Second material of the same family |
| `c3` | −35° | Third material |
| `elite` | 0°, plus a 1px `elite` outline outside the normal outline | Elites, per REC-037 |

This means variants are a **post-process, not a prompt**. Generate `c1`, then
produce `c2` and `c3` by hue rotation in the pipeline. It is faster, free, and
guarantees they match.

## 4. Canvas sizes and sheet layout

Native canvas per class, chosen against the gameplay radii already in the theme:

| Class | Native canvas | Game radius | Notes |
| --- | --- | --- | --- |
| Small enemy (bag) | 24×24 | 10 | |
| Standard enemy (bottle) | 32×32 | 14 | The baseline everything is judged against |
| Large enemy (glass, bagged) | 48×48 | 22–25 | |
| Player | 48×48 | 18 | More detail budget; see §5 |
| Weapon / projectile | 16×16 | 6 | Reads at speed, so silhouette over detail |
| Pickup | 16×16 | 8 | |
| Shrine | 64×64 | 24 | Static, so it can carry the most detail |
| Hazard | 64×64 | 46–110 | Tiled or scaled; see the plan |

### Sheet layout

One horizontal strip per subject, frames left to right, no padding, no margin.
Frame `n` occupies `x = n * frameWidth`. This is the simplest thing Phaser's
`spritesheet` loader consumes and the easiest to verify by eye.

**Enemy states — 4 frames, and only 4:**

| Frame | State | Content |
| --- | --- | --- |
| 0 | `idle` | The rest pose |
| 1 | `move` | One alternate pose; idle/move alternate to walk |
| 2 | `hit` | Idle silhouette, flashed to near-white, used for the damage flash |
| 3 | `death` | A broken or scattered version of the silhouette |

Four states is deliberate. Two hundred enemies on screen means animation is noise
above a certain frame count, and the existing damage flash already substitutes a
colour rather than a frame.

**Player — 8 frames**, the one subject that gets a real animation budget:

| Frames | State |
| --- | --- |
| 0–3 | `walk` cycle (contact, down, pass, up) |
| 4 | `idle` |
| 5 | `hit` |
| 6–7 | `dash`/`hurt` reserved |

**Weapons — 3 frames:** `ready`, `fire`, `spent`.

## 5. Detail budget

Not every sprite deserves the same amount of work, and saying so explicitly stops
the roster from looking uneven:

- **Player and weapons** — highest. Multiple material regions, visible small
  features (a strap, a nozzle, a boot), readable silhouette asymmetry.
- **Shrines** — high, but static. They can afford ornament because there is only
  ever one of each on screen.
- **Standard and large enemies** — medium. Two or three material regions. The
  silhouette must be identifiable at 100% zoom in one glance.
- **Small enemies, pickups, projectiles** — low. Silhouette and colour only. At
  24×24 with a 1px outline there is barely room for anything else, and these are
  the ones that appear in the hundreds.

---

## 6. The prompt

This is the part to paste into an image tool. **The style block never changes.**
Only the subject block changes between sprites.

### 6.1 Style lock (constant — copy verbatim every time)

```text
STYLE LOCK — do not deviate:
Pixel art sprite, chunky low-resolution pixel style, drawn on a {CANVAS} pixel grid.
Limited palette: exactly 4 flat tonal steps per material region (deep shadow, shadow,
base, highlight). No gradients, no anti-aliasing, no dithering, no soft shadows,
no blur, no texture noise. Every pixel is a hard square edge.
1-pixel fully opaque outline around the entire silhouette, in the darkest tone of
the subject's own colour — never pure black.
Light source top-left, consistent. Straight-on view with a very slight top-down
tilt, as seen in a top-down arena game.
Bold saturated colour, strong value separation, poster-like readability at small size.
Detailed and specific in shape, simple in shading.
Fully transparent background. Subject centred, filling roughly 85% of the canvas,
with at least 2 pixels of clear space on every side.
No text, no logos, no watermark, no border, no drop shadow, no ground shadow,
no background scenery, no UI frame.
Reference feel: modern indie pixel-art roguelite character sprites — clean,
saturated, chunky, high-contrast.
```

### 6.2 Subject slot (the only part that changes)

```text
SUBJECT: {SUBJECT_DESCRIPTION}
BASE COLOUR: {HEX} — build the 4-step ramp from this exact hue.
SILHOUETTE: {SILHOUETTE_NOTE}
DETAIL BUDGET: {low | medium | high} — {DETAIL_NOTE}
```

### 6.3 Sheet slot (for a multi-frame request)

```text
SHEET: a single horizontal strip of {N} frames, each exactly {CANVAS} pixels,
no padding or gaps between frames, no frame borders or numbering.
Frames left to right: {FRAME_LIST}.
Every frame shares the identical palette, outline weight, light direction, and
subject scale. Only the pose changes between frames.
```

### 6.4 Worked example — Plastic Bottle, the baseline enemy

```text
STYLE LOCK — do not deviate:
Pixel art sprite, chunky low-resolution pixel style, drawn on a 32x32 pixel grid.
Limited palette: exactly 4 flat tonal steps per material region (deep shadow, shadow,
base, highlight). No gradients, no anti-aliasing, no dithering, no soft shadows,
no blur, no texture noise. Every pixel is a hard square edge.
1-pixel fully opaque outline around the entire silhouette, in the darkest tone of
the subject's own colour — never pure black.
Light source top-left, consistent. Straight-on view with a very slight top-down
tilt, as seen in a top-down arena game.
Bold saturated colour, strong value separation, poster-like readability at small size.
Detailed and specific in shape, simple in shading.
Fully transparent background. Subject centred, filling roughly 85% of the canvas,
with at least 2 pixels of clear space on every side.
No text, no logos, no watermark, no border, no drop shadow, no ground shadow,
no background scenery, no UI frame.
Reference feel: modern indie pixel-art roguelite character sprites — clean,
saturated, chunky, high-contrast.

SUBJECT: a discarded single-use plastic drink bottle, crumpled slightly, cap still on,
faded peeling label band around the middle, seen as a small hostile creature-object.
BASE COLOUR: #60a5fa — build the 4-step ramp from this exact hue.
SILHOUETTE: tall rounded rectangle, narrower neck at the top, wider base, one dent
in the left side so it is not symmetrical.
DETAIL BUDGET: medium — cap, neck ridge, and label band are the only interior detail.

SHEET: a single horizontal strip of 4 frames, each exactly 32x32 pixels,
no padding or gaps between frames, no frame borders or numbering.
Frames left to right: idle upright; leaning forward mid-tumble; same as idle;
crushed flat and split into two pieces.
Every frame shares the identical palette, outline weight, light direction, and
subject scale. Only the pose changes between frames.
```

### 6.5 Prompt rules

1. **Never edit the style lock to fix one sprite.** If a sprite comes out wrong,
   fix the subject slot. If the style lock genuinely needs a change, change it for
   the whole roster and regenerate — see §8.
2. **One subject per generation.** Do not ask for a family in one image.
3. **Seed if the tool supports it.** Record the seed in the manifest.
4. **Never ask for colour variants.** They are a hue rotation in the pipeline.
5. **The base colour is quoted as hex and repeated.** Models drift on colour more
   than on anything else; naming it twice measurably helps.
6. **Negatives stay in the style lock**, not scattered through the subject.

---

## 7. Acceptance checklist

Every sprite is checked against this before it enters the manifest as `accepted`.
It is deliberately mechanical — a subjective bar produces an inconsistent roster.

- [ ] Canvas is exactly the declared size, and the strip is exactly `N × width`
- [ ] Background is fully transparent (no white or checkerboard fill)
- [ ] Outline is present, 1px, closed all the way round, not pure black
- [ ] No more than 4 tonal steps in any single material region
- [ ] No anti-aliased or semi-transparent edge pixels
- [ ] Light reads as top-left in every frame
- [ ] Subject scale is identical across every frame in the strip
- [ ] Silhouette is identifiable against the arena floor at 100% zoom
- [ ] Base colour matches the declared token within a small tolerance
- [ ] Sits beside the current baseline sprite without either looking out of place

The last item is the one that matters most and the only one a script cannot
check. Keep the accepted Plastic Bottle open in a second window as the yardstick.

## 8. Tuning the style lock

The numbers in this document are a starting point. Expect to change them after the
first batch — that is the process working, not a failure.

**How to change the style lock safely:**

1. Change it in this file, in one commit, with the reason.
2. Bump `styleVersion` in the manifest.
3. Regenerate the **baseline sprite** first, and only that one.
4. Compare against the previous baseline side by side.
5. If accepted, mark every sprite at the old `styleVersion` as `stale` and
   regenerate in batches.

**Never** hand-fix a single sprite to match a style the prompt does not produce.
That is how a roster ends up unreproducible: the moment the file is lost, nobody
can make another one like it.

## 9. Known unknowns

Stated plainly rather than discovered later:

- **Consistency across generations is not guaranteed by any current image tool.**
  The style lock materially improves it; it does not make it deterministic. Budget
  for regenerating a sprite several times and picking the best.
- **Text and small symbols are unreliable at these sizes.** Nothing in the roster
  depends on generated text; the label band is a colour band, not lettering.
- **Exact hex adherence is approximate.** The pipeline's palette-snap step (see
  the plan, §4) exists because of this and is not optional.
- **4-frame death animations may generate as 4 unrelated drawings.** The sheet
  slot's "only the pose changes" line is the mitigation; verify per strip.



<a id="content-original-session-estimates"></a>
## Content — superseded session estimates and sequencing

Historical estimates, not a live C1–C7 backlog. Outcomes are recorded above.

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



<a id="sprite-preparation-2026-10-22"></a>
## 2026-10-22 — build-folder cleanup and eco style2 sprite preparation

Owner pauses Knights and Magic indefinitely until explicit reopening (REC-120).
Prompt preparation is complete (REC-121):26 subjects,23 primary plus3 optional
icons; all five existing sheets queued for regeneration at 2× each dimension with
same game scale/layout. Exact palettes, anchors, facing, frame continuity and
manual/automated acceptance are specified. Art generation/integration unstarted.

Completed G1–G4/Session21 prompts, redundant G2–G4 pointer plans, V0.4.3 plan
and gameplay roadmap are removed. Original V0.4.3 phase specifications, performance
sequencing, gameplay priorities/sources, superseded sprite inventory/style and
content session estimates are preserved in this log. Future sprite phases and
unselected ideas remain separate. Changed report links point to durable records;
raw measurements/source digests, source code, tests and assets are preserved.

Preparation verifies 489 local Markdown links,26 matching prompt/manifest frame
rows and 298 unchanged source/test/script/public-asset hashes; whitespace passes.
No runtime/build/browser rerun, art acceptance, publication or new remote evidence.
External Safari/browser-OS/older physical-GPU checks remain waived/unverified.
Current authority: [sprite plan](SPRITE_PLAN_V0.4.4.md) and [handoff](NEXT_READABLE_GAMEPLAY_HANDOFF.md).


## 2026-10-23 — first eco sprite generation checkpoint

On `codex/v0.4.4`, Bottle a2, Microplastics a4 and Glass a3 are generated and
saved with exact prompts/reference hashes/metadata and native four-cell review
strips at64/48/96px. [Batch1 report](sprites/review/style2/BATCH_1_REPORT.md)
records sources, bounds, review limits and35passing sprite tests, types/lint/
build/whitespace,5current-sheet checks and12unchanged shipped sprite file hashes.
Opt-in fixed source cells avoid independent pose recentering;2px outline never
changes alpha. Generation checkpoint complete; production art acceptance remains
open due measured footprint/idle-hit differences (REC-122). No live replacement,
new browser/device evidence or knight-themed work. Prior art remains shipped.


<a id="sprite-full-generation-2026-10-23"></a>
## 2026-10-23 — full eco roster generated through parallel subagents

Owner likes Batch1 and explicitly requests generating the rest simultaneously,
deferring individual fixes/in-game review. Three agents own disjoint 8-actor,
7-equipment and 8-world groups; root owns claims/shared documentation/Git and
an additional familiar wine-bottle alternative. All 26 catalog subjects now have
native review sheets, with 27 preserved style2 source/prompt/metadata/recipe sets.
The [gallery](sprites/review/style2/index.html) and
[full report](sprites/review/style2/FULL_ROSTER_REPORT.md) retain inventory,
known individual findings and source-bound evidence. All sources use built-in
imagegen; seeds/models are not invented. No hand-painted correction or acceptance.

Owner promotes recognisable everyday Australian/Sydney shapes over uncommon
angular/fantasy forms. Local primary context and authored inference boundaries
are in [reference notes](sprites/AUSTRALIAN_REFERENCE_NOTES.md). Glass a4 has a
wine-bottle silhouette; a3 remains intact. Stable IDs and world/gameplay values
are unchanged. The paused knight pack is not reopened or developed.

26 native format checks, 27 deterministic rebuilds/reference/source/output hash
checks, 36 sprite units, types/lint/build and whitespace pass. Gallery script syntax
and local asset targets pass; no gallery browser/in-game/stress/device campaign.
The opt-in common-grid contain mode uses one identical uniform transform across
cells and leaves strict defaults intact. Existing public/accepted/runtime assets
are unchanged; no dependencies/save/balance changes. All 26 remain review,
production integration/individual alignment/live acceptance pending. External
browser/OS/older physical-GPU evidence remains waived/unverified. No publication.


<a id="tool-presentation-2026-10-23"></a>
## 2026-10-23 — suction, optional attack guides and Escape-menu quit

Owner-selected runtime correction after full sprite generation. Eco vacuum uses
bounded inward air/dust during the existing pulse; Low reduces streams and reduced
motion keeps a static cue. Show attack radius defaults off and reveals precise
sector/selected-hit/splash guides when on. Grabber jaws close and extra Sweep cues
use three snapping prongs at existing resolved positions. Combat selection, damage,
clocks, balance, saved IDs and generated/live sprite assets are unchanged.

Pause gains pointer/Q Quit to Main Menu, abandoning transient run state through
normal scene shutdown without recording a finished run/unlock. Start creates a
fresh run. Panel/setting layout uses authored UI viewport and reserves the footer.
Persistent showAttackRadius is an additive optional schema2 boolean: historical
saves default off, invalid present values reject, current codec round-trips it.
Only eco owns the optional tool effects; knight definitions stay frozen.

[Report](content/TOOL_PRESENTATION_REPORT.md) owns231targeted/714fullunits, types/
lint/build/whitespace, three final serial browser cases and the existing Q6 real
vacuum regression, five inspected images, initial fixture failures/corrections and
cleanup/deferred limits. No broad browser/stress/device or new publication claim.

### Original bounded ownership and completed checklist

# Tool presentation and return-to-menu correction

Owner-selected2026-10-23, on codex/v0.4.4 after full sprite generation. This
bounded runtime correction does not promote generated sheets or reopen Knights
and Magic. Art review inventory remains intact.

## Ownership before code

- src/game/entities/{cone-attack-actor,grabber-actor}.ts and a new presentation-only
  claw cue actor; run-scene.ts only presentation wiring and paused menu exit.
- content/define-theme.ts validates optional presentation data;
  core/archetypes/tuning.ts optional tool-presentation tuning; eco-guardian/view.ts
  alone supplies it. No knight definition, balance value, hit timing or target change.
- state/settings-state.ts and persistence/profile-validation.ts: optional additive
  showAttackRadius boolean defaults false, old schema2 imports remain valid,
  malformed present values reject. No schema bump, lost profile fields or unlock
  grants on abandoning a live run. SAVE_DATA documents additive compatibility.
- ui/pause-menu-ui.ts: setting plus keyboard/pointer Quit to Main Menu, with normal
  teardown and resize; menu-scene setting dispatch already generic.
- Relevant settings/persistence units and one bounded serial browser file covering
  real effects/guide toggle/reduced motion/quality and actual quit/restart lifecycle.
- This plan, sequence/status/progress/master/reconciliation, product/design/theme
  compatibility notes and SAVE_DATA; no generated/public/accepted asset changes.

## Behaviour

Vacuum: bounded cyan air streaks/dust travel toward the nozzle during the actual
pulse, no damage implied during fade. Exact sector/selected-hit guide appears
only when Show attack radius is on (off by default). Low uses fewer streams;
reduced motion uses a quiet static pulse. Geometry and combat clocks stay unchanged.
Grabber: jaws close at extension contact; Collection Sweep extras become two/three
claw snaps at their resolved positions. Debug area circles are optional, no new hits.
Paused Escape menu adds Quit to Main Menu, pointer and Q; quit abandons the active
run and cleans scene/audio/timers without finishing/granting a run. Existing saved
progress/settings survive; Start reconstructs a fresh run. No confirmation modal.

## Gate

- [x] Meaningful setting legacy-import/invalid/round-trip persistence tests.
- [x] Targeted units, types/lint/build/whitespace.
- [x] Bounded serial browser: real pulse/guide toggle, reduced-motion/Low, claw
  cues, Escape quit/title/new run and unchanged finished-run counter. No broad
  browser/stress/device campaign; external checks remain waived/unverified.
- [x] Record findings/status/checks with code; no full sprite acceptance inferred.

Verification fixture ownership extension: tests/unit/persistence/save-codec.test.ts
for complete settings round-trip and historical schema2 missing-field coverage.


Completed 2026-10-23. See content/TOOL_PRESENTATION_REPORT.md for 714 full / 231 targeted
unit evidence, three final serial browser cases plus existing Q6 vacuum regression,
inspected images, initial fixture corrections and deferred external checks.

<a id="ranged-enemy-2026-10-23"></a>
## Takeaway Cup — selected ranged enemy/live draft /2026-10-23

Owner requested concept, enemy sheet, generated sprite and game integration.
Codex completed the bounded V0.4.4 addition on codex/v0.4.4. Claim8718bcb recorded
scope before generation. The previous26 catalog subjects remain review-only.

- [x] Eco-only optional `enemy.ranged_attacker`: familiar unbranded takeaway cup,
  16HP,68speed,4contact,3XP; body14/display40 independent of art. Introduction
  one at66%, low weight1 +0.2 growth; no other role/boss timing changed. New role
  gets18sim seconds before mini; original spacing elsewhere retained.
- [x] Core optional ranged capability, authored theme tuning, full locked-bearing
  1000ms preparation, one210speed/7radius/8damage shot,180ms release/1820ms rest.
  Shot lifetime1800ms, global cap32; swept first impact, obstacles, armour/shared
  invulnerability, causal source and finite cleanup. Pause freezes; pre-release
  defeat cancels; committed shots survive; clearing waits for them.
- [x] Built-in imagegen: four immutable drafts; a3 compact death selected.
  Seven64×64 poses (448×64 sheet); attack-frame metadata follows simulation phase,
  hit overrides, independent authored base anchors/facing. Standalone texture;
  optional padded equal-cell pipeline prevents wrapping/clipping without hand edits
  or per-pose fitting. Existing five-sheet atlas/outputs remain byte-identical.
- [x] [Enemy sheet](enemies/TAKEAWAY_CUP.md), catalog, manifest, gallery and current
  handoff updated. Gallery's malformed historical contact-sheet href repaired
  while adding cup. Old raw prompts remain reproducibility evidence, not pending
  session tasks. No persistent field/schema or knight content changed.
- [x] 719units/75files; typecheck/lint/build; six sprite build/check and deterministic
  equal hashes;3 unique serial Chromium cases, five inspected images;30 eco pacing
  scenarios. [Report](content/RANGED_ENEMY_REPORT.md) owns precise evidence/limits.

Owner art acceptance remains pending: small idle/hit contour differences, broader
mirrored continuity and extended playtest may be revised later. All original26
review subjects remain unpromoted; no broad performance/device/CI/publication or
new external acceptance claim. Coarse pacing model omits ranged shots and cannot
prove survival/fairness. REC-126 retains optional-content and padded-grid decisions.

<a id="sprite-progress-audit-2026-10-23"></a>
## Sprite inventory/progress audit —2026-10-23

Owner requests confirmation of created sprites, remaining future work and master
progress update. Inspected current catalog, raw metadata, native recipes/checks,
live eco sprite bindings, active plan, completed reports and optional roadmap.
No generation/integration or gameplay expansion is selected by this audit.

- [x]27/27 subjects present:24 sheets +3 icons;102 cells.31 immutable raw sources
  and prompt sidecars present; recorded source/prompt/reference hashes checked.
- [x]All27 configured native format checks and deterministic rebuilds pass;
  recorded source/output SHA256 match. [JSON](sprites/review/style2/PROGRESS_AUDIT.json)
  records every subject and current live binding.
- [x]Confirmed runtime distinction: six unique sheets, five original style1 plus
  cup style2 draft; seven bindings include old Glass-Shards alias.26 new subjects
  remain review-only, zero owner-accepted style2. No full sprite milestone closure.
- [x]Audited remaining work: individual continuity/scale/anchor/palette corrections,
  deliberate live state mapping, remaining integration and consolidated acceptance.
  Optional roadmap/education expansions stay unselected, knight theme stays paused.
- [x]Documentation verification:343 local links, no new explicit master anchor
  collisions, six runtime sheet checks, production build and whitespace pass.
  Existing bundle-size advisory retained; no runtime/assets changed.
- [x]Removed misleading preparation-only/unstarted generation wording from active
  sprite execution plan and synchronized status/handoff. Historical claims below
  are retained once in this master; raw prompt files remain reproducibility data.

[Report](sprites/review/style2/PROGRESS_REPORT.md) gives known issues, remaining
order and future-option inventory. No new browser/stress/device/remote-CI claim;
last runtime evidence remains6c17610's719units/75files/three scoped browser cases.
V0.4.4 and V0.4 overall stay open until the remaining art/integration gates pass.

<details>
<summary>Historical sprite preparation and generation ownership/contracts (superseded execution instructions)</summary>

# V0.4.4 — eco sprite regeneration and completed-roster art

Owner-selected direction, 2026-10-22: prepare prompts for the settled roster,
regenerate all existing sheets at twice each frame dimension, preserve the same
in-game scale and layout, and enforce consistent art and functional frames.
Knights and Magic is paused indefinitely until the owner explicitly reopens it.

[Status](BUILD_STATUS.md) owns completion/delivery evidence. Q6/G1–G4 are locally
complete in the [master log](MASTER_BUILD_PLAN.md#readable-gameplay). Their runtime
IDs and roles settle this inventory. Historical S2–S5 and obsolete 32-sheet
inventories have been retired into the master; they do not add work here.

## Current authority and ownership

- [Style guide](SPRITE_STYLE_GUIDE.md): style 2, exact shared prompt, palettes,
  resolution/anchor rules and acceptance checklist.
- [Prompt catalog](SPRITE_PROMPTS.md): 26 complete subject blocks with target
  frame/strip dimensions and ordered frame content, including five replacements.
- [Manifest](sprites/MANIFEST.md): existing accepted evidence, replacement queue,
  attempts, claims and future acceptance. Historical attempts are never overwritten.
- [Master pipeline](MASTER_BUILD_PLAN.md#v0-4-1), REC-071–078 and REC-120/121:
  sprites follow actors, never drive simulation; nearest filtering is per texture.

This session owns documentation only: AGENTS/README, build Markdown and sprite
manifest, status/progress/reconciliation, obsolete completed prompt/plan removal
and link repairs. No runtime, generated art, recipes, dependencies or evidence
files change. Prompt preparation is complete after the documentation checks below.
The request prepares generation inputs; it does not claim generated or accepted
art. No active generation claim is created by writing the catalog.

<a id="sprite-audit-historical-settled-roster"></a>
## Inventory and scale decisions

All ten current eco enemies receive sheets: Plastic Bottle, Microplastics, Glass
Bottle, Bagged Waste, Glass Shards, Cigarette Butts, Packets / Wrappers, Aluminium
Can, Compacted Waste and Dumping Colossus. Add the Environment Protector, Grabber,
Vacuum, Cyclone Vacuum, Impact Point, five sites and three hazard centre tiles.
Three static tool icons are optional companion assets, not required new UI work.
Total: **23 primary sheets + 3 optional icons**. The catalog owns exact dimensions.

Existing replacements: Bottle32→64, Microplastics24→48, Glass48→96,
Bagged Waste48→96, Player48→96 (each axis). Existing enemy4/player8 frame counts
and horizontal order remain. New subjects use the catalog's selected logical
baseline doubled in both axes; those baseline files never previously existed.
Glass Shards get a dedicated48px four-frame sheet instead of the Glass death
pose alias; preserve stationary identity and28-world-unit display.

Authored world display diameters stay: player42; Bottle36; Microplastics26;
Glass50; Bag56; Shards28; Butts28; Wrappers34; Can38; mini64; final90.
For the player retain normalized Q6 hood anchors and actual facing metadata.
Doubled canvas alone is insufficient: preserve normalized silhouette occupancy.
No new bodies, caps, skills, saved IDs, tuning, tool geometry or timings.

Procedural grabber reach/Sweep, vacuum cone/pulse/fade/splash, warning circles,
directional cues, elite/shield/acceleration treatment and grid remain code-native.
Hazard sprites are centre decoration, never authoritative area masks. Tool/site/
pickup/hazard frame lists are explicit art contracts pending runtime mapping;
they must not be driven through a generic walking loop into false gameplay states.
There are five sites, including `shrine.escalation`. Do not revive retired
Plastic Bag, fictional fragment IDs, reward tiers or Sorting Pulse.

## Ordered execution handoff

1. **Preparation (this session):** audit/consolidate completed plans; record theme
   pause; write inventory, palettes, shared lock, subjects and acceptance rules.
2. **Baseline and pipeline:** before code, claim a bounded `codex/v0.4.4` phase
   from the actual current base. Own scripts/sprites.ts, sprite pipeline/resolver/
   loader/view only as required, eco sprites.ts, relevant units, browser inspector,
   raw/accepted/public sprite outputs, manifest and matching docs. Inspect current
   normalization/atlas code: dimensions and source recipes are hardcoded, and
   outline/placement handling must support 2px style2 without per-pose auto-fit.
   Generate/accept the new Bottle baseline first with a manifest claim, keeping
   old assets until acceptance. Preserve numbered raw attempts and exact prompts.
3. **Player and five-sheet replacement checkpoint:** regenerate Microplastics,
   Glass, Bag and Player to match accepted style2 Bottle; review all same-frame
   overlays, anchors, facing, walk/hit/death transitions and actual display sizes.
   Keep world values unchanged; update frame metadata, anchor coordinates and
   atlas entries together. Do not double camera or physical actor sizes.
4. **Remaining actors:** dedicated Glass Shards, individual Butt, Wrapper, Can,
   mini and final boss. Preserve parent materials and code-owned warnings;
   accept one subject per commit and inspect each beside the current roster.
5. **Tools, pickup, sites and hazards:** integrate only with deliberate state
   mapping. Keep geometric hit/interaction/warning truth in code. Review tile
   edges/coverage before hazard integration and grip/pulse alignment before tools.
   Optional icons may follow without adding UI scope automatically.
6. **Consolidated eco acceptance:** one bounded serial roster/fallback/performance
   campaign for changed presentation; Default/Low and reduced motion, one worker,
   zero retries, inspect images and clean owned resources. Use old source-bound
   measurements only as comparison, not a current pass. Existing external Safari/
   browser-OS/older physical-GPU checks remain waived/unverified.

No new knight-themed art, balancing, copy, feature parity or dedicated knight
campaign is permitted by these steps. Retained generic contract checks may read
its frozen fixture; any required themed edits must wait for explicit reopening.
An empty/synthetic sprite map can prove generic fallback without expanding that pack.

## Verification and completion

Preparation gate:

- [x] Completed prompts removed only after their durable results are in master.
- [x] Completed multistage execution records consolidated; future proposals kept
  separately and clearly unselected; links redirected to retained master anchors.
- [x] Indefinite theme pause recorded in AGENTS and active design/plan authorities.
- [x] All current subjects and five replacements have copyable descriptions,
  exact doubled dimensions, frame roles, palettes and continuity instructions.
- [x] Documentation link/dimension/inventory checks, unchanged code/assets hashes,
  and whitespace validation pass: 489 links, 26 dimension/frame rows and 298 hashes.

Later art gate (unstarted): configured sprite checks, relevant content/architecture/
sprite units, types/lint/build, atlas/dimension/alpha verification; manual source/
processed/game-size review and necessary bounded serial gameplay cases. Review
300-actor texture cost once cumulatively, not for every prompt/art session. Check
atlas page/texture limits and startup bytes: doubled dimensions cost4× texels.
No full browser/device campaign is passed by this documentation change.


## Batch 1 generation claim — 2026-10-23

Owner explicitly requests creating the first batch. Branch `codex/v0.4.4`, based
on current checkout71c9b1b plus documentation preparation584ba62. Scope: Plastic
Bottle baseline, then Microplastics and Glass Bottle. Own this plan, manifest,
raw attempt PNG/prompt/metadata sidecars, versioned review sheets under
build/sprites/review/style2/, batch report, progress/status/reconciliation and
master completion record. Existing accepted/public assets and runtime remain
unchanged until the configured pipeline and live acceptance phase is verified.

Art generation may proceed for this bounded batch using reviewed Bottle as the
style reference after source-level review. Source-level review is not final
in-game acceptance. If the existing normalizer would recenter poses or lose the
requested resolution, preserve the raw outputs and use a deterministic fixed-cell
review conversion recorded with the batch; no painted repairs. Any additional
pipeline/code ownership must be claimed before editing. No player, other content
or knight-magic work in this batch.

Gate: preserve actual tool output and exact prompt/reference hashes; inspect all
four poses for material/geometry continuity, transparent background and one-row
layout; verify final review dimensions/alpha/palettes if converted, record review
versus accepted honestly, retain old source/runtime hashes. No broad browser run
for generation-only assets. Runtime integration/performance acceptance remains
open rather than implied by source-art review.


Batch1 ownership extension before code: `src/game/systems/sprites/sprite-pipeline.ts`,
`tests/unit/sprites/sprite-pipeline.test.ts`, and `scripts/sprite-review.ts` for
an opt-in fixed source-cell grid, requested2px outline and reproducible review
conversion only. Existing recipes/default normalization stay unchanged. Explicit
source-grid coordinates are recorded per attempt; one common scale, no per-frame
recentering. Verify meaningful fixed-offset/outline tests and unchanged current
five-sheet rebuild bytes. Review output never enters public/accepted automatically.


### Batch1 first-pass result — 2026-10-23

Three subjects generated: Bottle a2, Microplastics a4, Glass a3; native review
strips 256×64/192×48/384×96. [Batch report](sprites/review/style2/BATCH_1_REPORT.md)
owns exact checks and remaining layout findings.35 sprite units, types/lint/build,
current 5-sheet checks and 12unchanged accepted/public file hashes pass. Generation
checkpoint is complete; strict footprint/idle-hit alignment and final live
acceptance are not passed. All 3stay review,0 accepted. Refine prompts/regenerate
from measured bounds before production promotion; no hand-painted pose repairs.
No runtime replacement, new browser/device pass or next-content scope follows.


## Owner-selected parallel full-roster generation — 2026-10-23

Owner likes Batch1 designs and explicitly requests subagents to generate all
remaining sprites simultaneously, deferring individual corrections and in-game
review. This lifts the earlier sequential acceptance gate for generation only;
Batch1 stays review and is not silently production-accepted. Select all23remaining
catalog rows, including3previously optional icons. No further layout refinement,
production binding, balance, saved IDs, knight-theme work or browser campaign.

Three agents own disjoint asset IDs: actors (Bag, Player, Shards, Butt, Wrapper,
Can, mini/final bosses); equipment (Grabber/Vacuum/evolution, pickup,3icons); world
(five sites, three hazards). Each owns only its assigned raw PNG/prompt/metadata/
review-recipe files and review outputs. Root owns manifest claims, shared reports,
plans/status/progress/reconciliation, validation and commits. Do not concurrently
stage or commit from agents. Root records all claims before dispatch in one claim
commit to make ownership visible; one subject per acceptance commit still applies
if art is accepted later. No acceptance occurs in this generation pass.

Use imagegen skill, built-in tool, one distinct subject per call, true transparency,
style2 lock/catalog and Batch1 as references. Preserve each actual source and exact
prompt/reference hashes with honest tool/seed metadata. Save native review strips
when deterministic format conversion can preserve one common source grid/scale.
If generator layout prevents safe conversion, retain source for review and record
that specifically; do not hand-paint, invent frames or hide a skipped check.

Gate: all 26 catalog subjects have preserved generated sources/prompt evidence (3old
plus23new); intended dimensions/frame counts catalogued; available native outputs
pass format checks; shared source/runtime/accepted assets remain unchanged. Owner
visual testing, alignment and live/performance acceptance remain explicitly pending.


### Familiar Australian appearance — owner amendment during parallel generation

Owner asks that items resemble familiar everyday Australian/Sydney examples,
explicitly contrasting the angular glass shape with wine bottles or jars. Read
the design prompt and local primary reference context before generation. Root
owns Australian reference notes and a further Glass Bottle a4 wine-bottle review
alternative, retaining a3 unchanged. The familiar-object silhouette supersedes
older squat/angular art descriptors, while stable IDs, material role, frame
count and world display size remain fixed. Shared style/light/palette discipline
continues; use neutral ordinary materials with theme-colour accents rather than
turning mundane objects into magical/futuristic constructs. No new game facts,
disposal rules or prevalence-driven balance are introduced.


Root conversion ownership extension before code: sprite-pipeline.ts, its unit
file and shared converter documentation for opt-in fixed-grid `fit: contain`.
A rectangular common source cell may be letterboxed into the target using the
existing uniform min-scale and the same centering offset for every cell, without
per-pose bounding-box fitting, distortion or clipping. Default strict aspect
validation stays unchanged. This supports generated boards taller than the
requested strip; extra padding is a review concern, never a gameplay-size change.


### Parallel full-roster generation gate — complete 2026-10-23

All 26 catalog subjects have generated sources and native review strips:23 primary
plus 3icons.27 style2source/recipe sets include angular Glass a3 and familiar wine
alternative a4. Three subagents delivered their disjoint 8/7/8 groups. Root checked
26 native formats,27 deterministic rebuilds and source/reference/output digests;
36 sprite units, types/lint/build and whitespace pass. Gallery syntax/asset targets
pass; no gallery browser or in-game acceptance is claimed. [Full report](sprites/review/style2/FULL_ROSTER_REPORT.md)
and [gallery](sprites/review/style2/index.html) own inventory, evidence and known
individual review notes. Pre-existing public/accepted/runtime assets remain
unchanged. All 26stay review,0 accepted; alignment/live/performance gates remain
for later owner testing. Generation objective complete; no knight work or art
correction campaign is silently selected.

## Ranged addition completed; next open work

Owner-selected Takeaway Cup concept, enemy sheet, generated art and live runtime
slice is complete; [master record](MASTER_BUILD_PLAN.md#ranged-enemy-2026-10-23)
and [report](content/RANGED_ENEMY_REPORT.md) own implementation and evidence.
The live draft is not owner art acceptance. Catalog now27 subjects (24 primary
sheets +3 icons). Previous26 stay review-only; their individual corrections,
acceptance and remaining integration are the next open handoff. No other content
is selected by this completion, and Knights and Magic remains indefinitely paused.

</details>

## V0.4.4 owner-authorized delivery verification —2026-10-26

Owner requests all current sprites/features be published through a PR into main.
Fresh remote inspection finds PR28 merged as9e29ca6 and no open PR. Preserve18
subsequent phase commits and merge main's marker without content conflicts
(78cd2e7). Fresh719units/75files, typecheck/lint/build, six sprite checks,27native/
31raw/prompt hashes and branch whitespace pass. High-severity audit gate passes
with two existing moderate Vitest findings. Automatic PR CI owns consolidated
browser regression; current matching-head result pending at pre-push checkpoint.
[Status](BUILD_STATUS.md) records delivery scope and limitations. Publication
includes all generated assets, keeps26 style2 outputs review-only and cup live
draft, and preserves indefinite knight pause. Remaining art/integration and
external device evidence stay open. No new runtime change in this delivery slice.

<a id="pr29-ci-repair"></a>
## PR29 CI repair — local verification /2026-10-26

Owner authorizes fixing failed run40245699120/b861e8c:135passes/6skips/13failures.
Seven old settings-row clicks now use read-only rendered controls in MODE=test
telemetry; counts/pages/resources derive from declared content; elite fracture
uses stable role; clearing fixture stays inside tool reach and handles early
terminal clock freeze. No gameplay/tuning/art/save/knight changes, retry/timeout
increases or disabled assertions.13unique affected eco/generic cases pass
cumulatively (9 + corrected4), one worker/zero retries;719units/75files,
types/lint/build/production guard/whitespace, audit high gate pass (2existing
moderate findings). [Report](performance/PR29_CI_REPAIR.md) owns first-run failures,
production evidence and limits. Matching-head full CI remains pending until the
actual automatic run finishes; no overall V0.4.4/device acceptance inferred.

### Original pre-code bounded repair ownership (completed)

#### PR29 CI repair —2026-10-26, claimed before code

Owner requests fixing failed checks. Failed run40245699120 on b861e8c has135
passes/6skips/13failures. Scope: outdated settings click coordinates after the
new row/footer layout, fixed sprite/guide counts and atlas-only requests, a
first-enemy fragmentation assumption, and clearing fixture range isolation.
Ownership: pause-menu-ui.ts read-only control-point getter, existing test-only
telemetry publication in run-scene.ts/menu-scene.ts and telemetry-bridge.ts;
tests/e2e helper and affected difficulty/elite/G4/interface/overtime/phase-eight/
presentation/save-portability/sprite-browser/sprites tests; matching status,
master/progress/reconciliation and repair report. No tuning/art/save/theme change,
no retry/timeout increase, no disabled assertions or frozen knight edits.
Gate: focused failed eco/generic cases serial1worker/0retries, fullunits,
typecheck/lint/build/production guard, whitespace; push samePR and inspect CI.
Heavy full browser/stress regression remains assigned to automatic PR workflow.

<a id="eco-style2-live-switch"></a>
## Full eco style2 live switch —2026-10-26

Owner explicitly requests all new sprites and removal of old sprites. Claimed on
`codex/v0.4.4` from clean main; separate claim commit29878a3 precedes code. Bulk
promotion is one coherent presentation phase, not27claims of perfect individual
art continuity. Future art corrections retain per-subject claim/acceptance rules.
[Implementation/evidence/playtest report](sprites/STYLE2_INTEGRATION_REPORT.md).

Completed claim (historical exact scope):

## Bulk live switch — claimed 2026-10-26 before code

Owner selects all new eco sprites and deletion of old sprites. Codex claims a
bounded integration phase on `codex/v0.4.4` from current clean main. This explicit
bulk selection advances the individual-selection handoff: promote all 27 existing
outputs together, with no generation or pixel repairs. Remove superseded style1
production/accepted outputs through replacement, preserve raw attempts/prompts,
historical reports and frozen knight files. Visual refinement stays owner playtest.

Ownership: `scripts/sprites.ts`, new style2 recipe registry, eco `sprites.ts`,
optional sprite presentation metadata/validation, atlas packing, SpriteView,
pickup/shrine/hazard/grabber/cone actors, HUD tool icons, sprite browser fixture,
relevant sprite units/scoped e2e and new integration case, accepted/public sprite
outputs, manifest, this plan, BUILD_STATUS, sequence/handoff/master/reconciliation.
No gameplay tuning, saved IDs/state, enemy logic or knight changes.

Short checks: all configured sprite rebuild/format/hash/atlas bounds checks;
unit suite, types/lint/build/production guard; one serial scoped eco campaign
covering roster/facing, real tool phases, world states, fallback, Default/Low and
reduced motion. Record texture/startup byte cost. Full-app stress/soak and external
device checks deferred to consolidated CI/owner selection; never claim a pass.

- [x] Claim scope and owner bulk selection before code.
- [ ] Promote all 27 outputs, deliberate state bindings and remove old live art.
- [ ] Pass short checks, inspect captures and document playthrough checklist.


### Verified outcome

- [x] Promote all27 selected style2 outputs with explicit tool/pickup/site/hazard
  phases and equipped icons; replace five old accepted/public sheets and atlas,
  remove old Shards alias. No raw attempts/prompts or knight files deleted.
- [x]27rebuilds/checks;720units/75files; every selected output byte and102atlas
  frames verified. Types/lint/build/production/whitespace pass.
- [x]13unique serial scoped browser cases pass cumulatively with no retries;
  final expanded Default/Low/reduced-motion cases pass together. Actual tool
  contact/recovery, site spent, collection, hazard borders, all11 enemy sizes/
  bodies, icons and synthetic fallback verified. Captures inspected.
- [x] Current remaining plan/handoff and normal-play checklist updated.

One2048×736 atlas,211882PNG+JSONbytes,6029312decodedRGBAbytes. Storage increase
is recorded without performance/latency claims. Full-app300-actor/stress/soak/
current-head CI deferred; previously waived external checks remain unverified.
No push/PR/merge/deployment/new gameplay/tuning/save changes. Owner playtest and
selected corrections/consolidated acceptance remain; overallV0.4 stays open.

## Player gait correction a4 —2026-10-26

Owner requests review/regeneration after full switch. Separate sprite claime0eccf2
precedes imagegen. Native8×96px sheet now has distinct passing steps and runtime
0→1→2→3; gear/roles/display/body/stride preserved. Raw a4, prompt/reference hashes,
fixed-grid recipe and check evidence preserved; selected inventory/atlas updated.
39sprite units/27sprite checks/types/lint/build and3serial browser cases pass.
REC-130 records integer-grid/footprint findings and remaining playtest limits.
Next claimed B: gust/menu/card presentation and separate research-session prompt.

## Owner playtest correction B —2026-10-26

[Report](content/PLAYTEST_CORRECTIONS_REPORT.md) owns implementation, evidence,
initial failures and limits. Completed B: slower broad eco gusts with unchanged
actual pulses, measured/masked scrolling pause/title-guide content, truthful
fixed-card tool identity/STAT labels and correct one-time guide caps. Research
prompt is written for a separate future session, no redesign or chat creation.

Historical exact claim (e0eccf2):

## Owner playtest correction claim —2026-10-26, before edits

Codex claims two bounded follow-ups on codex/v0.4.4 after46dbb17:
A) one regenerated player subject, nexta4, distinct four-step gait, same8frame
roles/dimensions/world scale and a distance-driven four-pose cycle. Own prompt/
style-guide amendment, manifest, raw/review evidence, recipe registry, eco sprites,
accepted/public player/atlas outputs, sprite units/scoped browser checks and docs.
B) slower broad vacuum gusts (presentation only), scrolling/clipping pause/menu
body content and measured equipment rows, truthful fixed-item/weapon labels in
upgrade cards, and a separate-session research prompt. Own cone actor, tool-effects
tuning contract/eco view/validation, pause/level-up UI, upgrade description selector,
relevant tests and matching plan/status/master/reconciliation/handoff/report.
No changes to damage, targeting, timing of actual attacks, rarity rolls/stat boosts,
upgrade caps, persistence or knight files. Research prompt does not select a new
progression system or create/message another chat.

Short checks: selected sprite rebuild/format and exact atlas pixels; focused/full
units, types/lint/build; necessary serial gait/gust/menu-scroll/card browser cases,
Default/Low/reduced-motion and actual narrow/resized canvas. Preserve raw a3.
Full app/stress/soak/device checks stay deferred/waived/unverified.

- [x] A: a4 regenerated/reviewed/live;39sprite units/27checks/types/lint/build and3serial browser cases pass. See REC-130.
- [x] B: implement requested presentation/UI corrections and research handoff;
  verify and record findings in the same phase commit.

Verified B gate:723full units/75files, types/lint/build/whitespace;11unique scoped
serial browser cases pass cumulatively, one worker/zero retries. New scroll/card
cases also pass in actual WebGLDefault/Low-reduced-motion and earlier Canvas,
resizing to800×600. Three A sprite browser cases and39focused/27sprite checks are
recorded separately in708259a. Captures inspected; owned resources cleaned up.
REC-131 records wheel-event, measured-height and actual-tier discoveries. No
full-app/stress/soak/remote-CI/device pass or publication. OverallV0.4 remains open.
