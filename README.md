# Arena Survivor

A browser-first arena survival game built around player-controlled swarm escalation and explosive build interactions.

## Status

V0.1 is implementation-complete: the five-minute core loop, progression, Horde shrine, endings, restart, and full verification gate are built. V0.2 is planned but implementation has not started.

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

Open the URL printed by Vite (normally `http://localhost:5173`). V0.1 includes a five-minute arena run, automatic projectile combat, XP and upgrades, a player-activated Horde shrine, distinct run endings, and same-page restart.

Controls:

```text
WASD / Arrow keys = Move
Escape           = Pause or resume
E / Space         = Activate a shrine while in range
1 / 2 / 3         = Choose a level-up upgrade
R / Enter         = Restart after death or completion
```

## Test and build

Install Playwright's Chromium once on a new machine:

```bash
npx playwright install chromium
```

Run the complete V0.1 verification gate:

```bash
npm run typecheck
npm test -- --run
npm run build
npm run test:e2e
```

Optional checks:

```bash
npm run lint
npm audit --audit-level=high
```

For a manual smoke test, run `npm run dev`; verify movement, combat, XP collection, level-up choices, the HUD, pause/focus behavior, death/completion restart, and the browser console. Activate the nearby shrine with E or Space and confirm its one-time pulse produces a sustained tagged swarm with visibly accelerated XP rewards.
