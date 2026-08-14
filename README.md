# Arena Survivor

A browser-first arena survival game built around player-controlled swarm escalation and explosive build interactions.

## Status

V0.2 is implementation-complete and ready for milestone review. The game now includes the expanded enemy roster, overcrit and compound skills, Chaos and four shrine roles, baseline elites, bounded audiovisual feedback, a 300-enemy representative load path, and a reconciled terminal statistics ledger.

## Project documents

- [V0.2 build plan](build/BUILD_PLAN_V0.2.md) — current scope, phase order, verification gates, and commit boundaries.
- [Completed V0.1 build plan](build/BUILD_PLAN_V0.1.md) — implementation record for the first playable.
- [Theme and archetype system](build/THEME_ARCHETYPES.md) — modular content boundaries and safe retheme workflow.
- [Portable save data plan](build/SAVE_DATA.md) — encoded text export/import, versioning, validation, and migration.
- [Reconciliation log](RECONCILIATION.md) — decisions, pitfalls, discoveries, and future guardrails.
- [Game plan](build/PLAN.md) — the broader product and design vision.

Before beginning any work, read the current V0.2 build plan and then the reconciliation log. The repository-wide workflow is defined in [AGENTS.md](AGENTS.md).

## Run locally

Requirements: Node.js 20+ and npm 10+.

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). Runs last five minutes, combat fires automatically, and risk/reward shrines permanently increase Chaos and world pressure.

Controls:

```text
WASD / Arrow keys = Move
Escape           = Pause or resume
E / Space         = Activate a shrine while in range
1 / 2 / 3         = Choose a level-up upgrade
R / Enter         = Restart after death or completion
M                 = Mute or unmute session audio
```

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

Focused Phase 7 checks:

```bash
npm test -- --run tests/unit/statistics tests/unit/content tests/unit/architecture
npm run test:e2e:stress
```

The normal Chromium regression suite runs on every pull request. The tagged 300-enemy stress path is a separate manual GitHub Actions workflow; run it before a release and after changes to spawning, combat/effect queues, statistics, feedback limits, or restart cleanup.

For a manual smoke test, verify movement, combat, XP collection, upgrade choices, pause/focus behavior, all shrine roles, elites, mute and reduced-motion behavior, the terminal statistics ledger, repeated restart, and a clean browser console.

## Current limitations

- Visuals and sounds are generated placeholders; audio uses theme-defined synthesized cues.
- Balance values, the five-second kill-chain window, and the 300/192 entity budgets are provisional pending broader hardware and playtesting.
- Profile persistence, save export/import, additional weapons, bosses, and advanced elite variants remain later-milestone work.
- The production bundle currently includes Phaser in the initial chunk, so Vite reports its large-chunk advisory during builds.
