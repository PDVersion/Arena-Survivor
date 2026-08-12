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

Open the URL printed by Vite (normally `http://localhost:5173`). Phase 3 displays a bounded arena with a camera-followed player, an automatically firing starter projectile, and spawning swarm enemies.

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

Run the Phase 3 verification gate:

```bash
npm run typecheck
npm test -- --run tests/unit/combat tests/unit/targeting tests/unit/spawning
npm test -- --run tests/unit/content
npm run test:e2e -- --grep "combat|death"
npm run build
```

Optional checks:

```bash
npm run lint
npm test -- --run
npm run test:e2e
```

For a manual smoke test, run `npm run dev`; confirm enemies pursue the player, projectiles retarget and kill them, contact damage visibly dims the player no more than once per second, and enough contact damage ends movement in death. Also recheck movement, boundaries, pause, camera follow, and the browser console.
