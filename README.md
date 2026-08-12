# Arena Survivor

A browser-first arena survival game built around player-controlled swarm escalation and explosive build interactions.

## Project documents

- [V0.1 build plan](build/BUILD_PLAN.md) — implementation phases, verification gates, and commit boundaries.
- [Theme and archetype system](build/THEME_ARCHETYPES.md) — modular content boundaries and safe retheme workflow.
- [Portable save data plan](build/SAVE_DATA.md) — encoded text export/import, versioning, validation, and migration.
- [Reconciliation log](RECONCILIATION.md) — decisions, pitfalls, discoveries, and future guardrails.
- [Game plan](build/PLAN.md) — the broader product and design vision.

Before beginning any work, read the V0.1 build plan and then the reconciliation log. The repository-wide workflow is defined in [AGENTS.md](AGENTS.md).

## Run locally

Requirements: Node.js 20+ and npm 10+.

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). Phase 2 displays a large bounded arena with a camera-followed player.

Controls:

```text
WASD / Arrow keys = Move
Escape           = Pause or resume
```

## Test and build

Install Playwright's Chromium once on a new machine:

```bash
npx playwright install chromium
```

Run the Phase 2 verification gate:

```bash
npm run typecheck
npm test -- --run tests/unit/player tests/unit/run-state
npm run test:e2e -- --grep "movement|boundaries|pause"
npm run build
```

Optional checks:

```bash
npm run lint
npm test -- --run
npm run test:e2e
```

For a manual smoke test, run `npm run dev`; move in all eight directions, press opposing directions together, walk into every arena boundary, toggle pause, and confirm the camera follows smoothly with no browser-console errors.
