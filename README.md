# Arena Survivor

A browser-first arena survival game built around player-controlled swarm escalation and explosive build interactions.

## Status

V0.2 is complete: the expanded enemy roster, overcrit and compound skills, Chaos and four shrine roles, baseline elites, bounded audiovisual feedback, a 300-enemy representative load path, and a reconciled terminal statistics ledger.

**V0.3 is implementation-complete**, with play-test corrections on `claude/v0.3.1`: the roster closes ~20% slower than V0.3, shrines arrive across the run at scattered positions, overlay text is measured rather than placed at fixed offsets, the game opens on a title screen, the HUD has a health bar, and the Field Guide catalogues shrines, the upgrade pool, and the session's totals (REC-058 to REC-063).

V0.3 in full — a rebalancing, escalation, and readability milestone: a compounding experience curve, a procedural spawn director, enemies with physical presence, elapsed-time escalation, arena hazards, levelling skills with a detonation that scales off what it kills, upgrade cards that state exact before-and-after values, a pause menu, impact feedback, and a published time-to-kill table. The production theme is now environment/nature, with knight-magic retained as a second complete pack.

## Project documents

- [V0.3 build plan](build/BUILD_PLAN_V0.3.md) — current scope, phase order, verification gates, and commit boundaries.
- [Education pivot](build/EDUCATION_PIVOT.md) — exploratory design for the type system, real-data enemy stats, and the knowledge layer.
- [Completed V0.2 build plan](build/BUILD_PLAN_V0.2.md) — implementation record for the interaction milestone.
- [Completed V0.1 build plan](build/BUILD_PLAN_V0.1.md) — implementation record for the first playable.
- [Theme and archetype system](build/THEME_ARCHETYPES.md) — modular content boundaries and safe retheme workflow.
- [Portable save data plan](build/SAVE_DATA.md) — encoded text export/import, versioning, validation, and migration.
- [Reconciliation log](RECONCILIATION.md) — decisions, pitfalls, discoveries, and future guardrails.
- [Game plan](build/PLAN.md) — the broader product and design vision.

Before beginning any work, read the current V0.3 build plan and then the reconciliation log. The repository-wide workflow is defined in [AGENTS.md](AGENTS.md).

## Run locally

Requirements: Node.js 20+ and npm 10+.

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). The game opens on a title screen; press Enter, Space, or click to begin. Runs last five minutes, combat fires automatically, and risk/reward shrines permanently raise world pressure. Shrines arrive one at a time across the run at scattered positions rather than all at the start; while one is off screen, a named marker on the edge of the view points the way.

Controls:

```text
WASD / Arrow keys = Move
Enter / Space     = Begin a run from the title screen
Escape            = Pause or resume
E / Space         = Activate a shrine while in range
1 / 2 / 3         = Choose a level-up upgrade
R / Enter         = Restart after death or completion
M                 = Mute or unmute session audio
Tab / left/right  = Switch pause-menu tabs while paused
Up / down         = Switch Field Guide sections
```

Upgrade cards state exactly what they do — `Damage 15.0 → 17.5 (+25%)`, `Charges 1 → 2` — with a level badge or a `NEW` marker. The numbers can be hidden from the pause menu's settings tab; the badges always show. Pause also lists your current stats, every upgrade taken with counts, and live world pressure.

The Field Guide tab has three sections, switched with the up and down arrows or by clicking: what each shrine costs and gives before you walk to it; the whole upgrade pool with how many you have taken this session, the most you have taken in one run, and the per-run cap; and the session's totals, including total damage and your best run. Session figures survive a restart but not a page reload — persistence lands in V0.4.

### What a run looks like

The active theme is **environment/nature**: plastic bottles, bags, glass, and bagged waste rather than knights and monsters. World pressure is called **Pollution**.

The spawn director escalates from run progress rather than a clock, so the shape below holds at any run length:

| Progress | Roster | Cadence | Batch |
| --- | --- | --- | --- |
| Start | Plastic Bottle only | 900 ms | 1 |
| 20% | Plastic Bag joins — announced by a wave | 737 ms | 1 |
| 40% | Glass Bottle joins | 603 ms | 2 |
| 45% | Bagged Waste joins | ~570 ms | 2 |
| 60%+ | Elites begin appearing without any shrine | — | 3–4 |

Enemies also get tougher on the clock alone, in ten discrete steps, so a cautious run still escalates — under V0.2 a player who never touched a shrine faced an identical world at 4:30 and 0:30. Arena hazards appear as the run progresses: a contamination spill that damages and slows, a debris pile that blocks movement and shots until cleared, and a methane vent that flares on a cycle. Everything telegraphs before it can hurt you.

Each milestone is announced before it arrives. The first wave sweeps past on a fixed heading rather than chasing, because that role is faster than you and a homing pack of them is unsurvivable with the starter weapon; later waves do home in.

The game renders a fixed 1600×900 view scaled to fit the window and letterboxed, so every window shows exactly the same amount of world. Enemies always appear outside it.

To play the retained knight-magic theme instead, change the one import in `src/game/content/active-theme.ts`. Both packs are complete and validated.

## Test and build

Install Playwright's Chromium once on a new machine:

```bash
npx playwright install chromium
```

Run the complete V0.3 verification gate:

```bash
npm run typecheck
npm test -- --run
npm run lint
npm run build
npm run test:e2e:ci
npm run test:e2e:stress
npm audit --audit-level=high
```

## Balance without playing

A five-minute run takes five minutes to evaluate, so pacing questions go through the headless simulator instead:

```bash
npm run balance                                      # every build model, 5 minutes
npm run balance -- --build crit --minutes 10         # one model, longer run
npm run balance -- --build damage-rush --chaos 3     # under world pressure
npm run balance -- --theme knight-magic              # a specific theme pack
npm run balance -- --build spread --ttk              # time-to-kill table
```

It reports spawns by role, live enemies, kills, experience, and level per 15-second bucket. It models pacing only — not movement, positioning, damage taken, or build choice — so read its output as a band, not a prediction.

Balance values live in the active theme's tuning pack (`progression.ts`, `director.ts`, `difficulty.ts`), never as literals in systems or scenes.

The normal Chromium regression suite runs on every pull request. The tagged 300-enemy stress path is a separate manual GitHub Actions workflow; run it before a release and after changes to spawning, combat/effect queues, statistics, feedback limits, or restart cleanup.

For a manual smoke test, verify movement, combat, XP collection, upgrade choices, pause/focus behavior, all shrine roles, elites, mute and reduced-motion behavior, the terminal statistics ledger, repeated restart, and a clean browser console.

## Current limitations

- Visuals and sounds are generated placeholders; audio uses theme-defined synthesized cues.
- Balance values, the five-second kill-chain window, and the 300/192 entity budgets are provisional pending broader hardware and playtesting. `npm run balance -- --ttk` is the instrument for revisiting them.
- Profile persistence, save export/import, weapon slots and melee delivery, bosses, and advanced elite variants remain V0.4 work. Settings are session-only until the persistence adapter lands.
- The production bundle currently includes Phaser in the initial chunk, so Vite reports its large-chunk advisory during builds.
