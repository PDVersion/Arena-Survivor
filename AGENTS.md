# Repository Working Agreement

Every work session in this repository starts by reading, in order:

1. `build/BUILD_PLAN.md` — current scope, phase order, architecture, tests, and commit boundaries.
2. `RECONCILIATION.md` — decisions, discoveries, pitfalls, and constraints learned while building.

Consult `build/PLAN.md` whenever product intent or game behaviour needs more detail. It is the product/design source; `build/BUILD_PLAN.md` is the implementation source.

Consult `build/THEME_ARCHETYPES.md` before adding, naming, renaming, tuning, rendering, or wiring any character, weapon, enemy/monster, skill, upgrade, pickup, shrine, curse, or other themed content.

Before changing code:

- Confirm the active phase and do not pull later-phase scope forward without recording why.
- Check `RECONCILIATION.md` for an existing decision before making a new one.
- Preserve the theme/archetype boundary: systems use stable IDs/contracts, while player-facing identity and themed definitions remain in the active theme pack.
- Add or update a reconciliation entry when work reveals a reusable decision, pitfall, issue, workaround, performance limit, or invalid assumption.

Before completing a phase:

- Run that phase's short verification suite from `build/BUILD_PLAN.md`.
- Update the phase checklist and `RECONCILIATION.md` with material findings.
- Keep the phase implementation, tests, plan status, and reconciliation updates in the same phase commit.
- Do not mark a phase complete or begin the next phase until its verification passes.

## Git workflow for V0.1

- Branch: `codex/v0.1`
- Delivery: one branch and one pull request into `main` for the complete V0.1 milestone.
- Each numbered build phase is one reviewable commit using the subject listed in the build plan.
- If a completed phase needs a later correction, use a focused `fix(v0.1): ...` commit and record the cause in `RECONCILIATION.md`; do not silently rewrite shared history.
- Keep unrelated refactors and V0.2 ideas out of the V0.1 pull request.
