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

Open the URL printed by Vite (normally `http://localhost:5173`). Phase 1 displays a single themed Phaser canvas that fills and resizes with the browser window. Gameplay and movement begin in Phase 2.

## Test and build

Install Playwright's Chromium once on a new machine:

```bash
npx playwright install chromium
```

Run the complete Phase 1 verification gate:

```bash
npm run typecheck
npm test -- --run tests/unit/content tests/unit/architecture
npm run build
npm run test:e2e -- --grep "boots"
```

Optional checks:

```bash
npm run lint
npm test -- --run
```

For a manual smoke test, run `npm run dev`, resize the browser, and confirm exactly one canvas remains visible with no errors in the browser console.
