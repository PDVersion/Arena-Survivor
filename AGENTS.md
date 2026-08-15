# Repository Working Agreement

Every work session in this repository starts by reading, in order:

1. `build/BUILD_PLAN_V0.2.md` — current scope, phase order, architecture, tests, and commit boundaries.
2. `RECONCILIATION.md` — decisions, discoveries, pitfalls, and constraints learned while building.

Consult `build/PLAN.md` whenever product intent or game behaviour needs more detail. It is the product/design source; `build/BUILD_PLAN_V0.2.md` is the current implementation source. Consult `build/BUILD_PLAN_V0.1.md` only when V0.1 implementation history is relevant.

Consult `build/THEME_ARCHETYPES.md` before adding, naming, renaming, tuning, rendering, or wiring any character, weapon, enemy/monster, skill, upgrade, pickup, shrine, curse, or other themed content.

Consult `build/SAVE_DATA.md` before changing profile state, progression, unlocks, statistics, persistent settings, stable saved IDs, persistence adapters, migrations, or save import/export.

Before changing code:

- Confirm the active phase and do not pull later-phase scope forward without recording why.
- Check `RECONCILIATION.md` for an existing decision before making a new one.
- Preserve the theme/archetype boundary: systems use stable IDs/contracts, while player-facing identity and themed definitions remain in the active theme pack.
- Add or update a reconciliation entry when work reveals a reusable decision, pitfall, issue, workaround, performance limit, or invalid assumption.

Before completing a phase:

- Run that phase's short verification suite from `build/BUILD_PLAN_V0.2.md`.
- Update the phase checklist and `RECONCILIATION.md` with material findings.
- Keep the phase implementation, tests, plan status, and reconciliation updates in the same phase commit.
- Do not mark a phase complete or begin the next phase until its verification passes.

## Branch naming

Milestone branches are named `<agent>/<milestone>`, where the prefix records which coding agent built the work:

| Prefix | Built with | Example |
| --- | --- | --- |
| `codex/` | ChatGPT Codex | `codex/v0.1`, `codex/v0.2` |
| `claude/` | Claude Code | `claude/v0.3` |

Use the prefix for the agent that is actually doing the work, decided when the branch is created. The prefix is a provenance record, not a permission boundary — any agent may read, review, or continue any branch.

A milestone built by more than one agent keeps the prefix of the agent that created the branch; note the split in the pull request description rather than renaming. Renaming a branch on GitHub **closes** any pull request that used it as the head, so pick the prefix before opening the pull request.

Everything else about a branch — one branch per milestone, one pull request into `main`, one reviewable commit per numbered phase — is unchanged by the prefix.

## Git workflow for V0.2

- Branch: `codex/v0.2`
- Delivery: one branch and one pull request into `main` for the complete V0.2 milestone, based on merged V0.1.
- Each numbered build phase is one reviewable commit using the subject listed in the build plan.
- If a completed phase needs a later correction, use a focused `fix(v0.2): ...` commit and record the cause in `RECONCILIATION.md`; do not silently rewrite shared history.
- Keep unrelated refactors and V0.3 ideas out of the V0.2 pull request.
