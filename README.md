# Arena Survivor

A browser-first arena survival game built around player-controlled swarm escalation and explosive build interactions.

## Status

V0.2 is complete: the expanded enemy roster, overcrit and compound skills, Chaos and four shrine roles, baseline elites, bounded audiovisual feedback, a 300-enemy representative load path, and a reconciled terminal statistics ledger.

**V0.3 is in progress** — a rebalancing, escalation, and readability milestone that tunes the loop before more content lands on it. It also swaps the production theme to environment/nature.

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

Open the URL printed by Vite (normally `http://localhost:5173`). Runs last five minutes, combat fires automatically, and risk/reward shrines permanently raise world pressure.

Controls:

```text
WASD / Arrow keys = Move
Escape            = Pause or resume
E / Space         = Activate a shrine while in range
1 / 2 / 3         = Choose a level-up upgrade
R / Enter         = Restart after death or completion
M                 = Mute or unmute session audio
```

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

Each milestone is announced before it arrives. The first wave sweeps past on a fixed heading rather than chasing, because that role is faster than you and a homing pack of them is unsurvivable with the starter weapon; later waves do home in.

The game renders a fixed 1600×900 view scaled to fit the window and letterboxed, so every window shows exactly the same amount of world. Enemies always appear outside it.

To play the retained knight-magic theme instead, change the one import in `src/game/content/active-theme.ts`. Both packs are complete and validated.

## Test and build

Install Playwright's Chromium once on a new machine:

```bash
npx playwright install chromium
```

Run the complete V0.2 verification gate:

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
```

It reports spawns by role, live enemies, kills, experience, and level per 15-second bucket. It models pacing only — not movement, positioning, damage taken, or build choice — so read its output as a band, not a prediction.

Balance values live in the active theme's tuning pack (`progression.ts`, `director.ts`, `difficulty.ts`), never as literals in systems or scenes.

The normal Chromium regression suite runs on every pull request. The tagged 300-enemy stress path is a separate manual GitHub Actions workflow; run it before a release and after changes to spawning, combat/effect queues, statistics, feedback limits, or restart cleanup.

For a manual smoke test, verify movement, combat, XP collection, upgrade choices, pause/focus behavior, all shrine roles, elites, mute and reduced-motion behavior, the terminal statistics ledger, repeated restart, and a clean browser console.

## Current limitations

- Visuals and sounds are generated placeholders; audio uses theme-defined synthesized cues.
- Balance values, the five-second kill-chain window, and the 300/192 entity budgets are provisional pending broader hardware and playtesting.
- Profile persistence, save export/import, additional weapons, bosses, and advanced elite variants remain later-milestone work.
- The production bundle currently includes Phaser in the initial chunk, so Vite reports its large-chunk advisory during builds.
