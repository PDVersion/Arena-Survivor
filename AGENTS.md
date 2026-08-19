# Repository Working Agreement

Every work session in this repository starts by reading, in order:

1. `build/BUILD_PLAN_V0.3.md` — current scope, phase order, architecture, tests, and commit boundaries.
2. `RECONCILIATION.md` — decisions, discoveries, pitfalls, and constraints learned while building.

Consult `build/PLAN.md` whenever product intent or game behaviour needs more detail. It is the product/design source; `build/BUILD_PLAN_V0.3.md` is the current implementation source. Consult `build/BUILD_PLAN_V0.2.md` and `build/BUILD_PLAN_V0.1.md` only when that milestone's implementation history is relevant.

Consult `build/EDUCATION_PIVOT.md` before changing the environment theme's content, enemy identities, or any information/tooltip surface. It is exploratory except where a decision has been promoted into a build plan.

Consult `build/THEME_ARCHETYPES.md` before adding, naming, renaming, tuning, rendering, or wiring any character, weapon, enemy/monster, skill, upgrade, pickup, shrine, curse, or other themed content.

Consult `build/SAVE_DATA.md` before changing profile state, progression, unlocks, statistics, persistent settings, stable saved IDs, persistence adapters, migrations, or save import/export.

Consult `build/BUILD_PLAN_V0.4.md` before starting any V0.4 work. V0.4 is two streams built in parallel — sprites (V0.4.1) and content (V0.4.2) — and that file owns the shared seam, the file-ownership table, and the reconciliation id ranges that keep them from colliding. Do not edit a file outside your stream's ownership block.

Consult `build/SPRITE_STYLE_GUIDE.md` before generating, editing, or accepting any sprite, and `build/SPRITE_PLAN_V0.4.1.md` before changing how sprites are loaded, packed, or resolved. Track individual sprites in `build/sprites/MANIFEST.md`, and claim a sprite there before generating it. Never hand-edit a generated sprite to match a style the prompt does not produce — fix the prompt and regenerate, or the roster stops being reproducible.

Before changing code:

- Confirm the active phase and do not pull later-phase scope forward without recording why.
- Check `RECONCILIATION.md` for an existing decision before making a new one.
- Preserve the theme/archetype boundary: systems use stable IDs/contracts, while player-facing identity and themed definitions remain in the active theme pack.
- Add or update a reconciliation entry when work reveals a reusable decision, pitfall, issue, workaround, performance limit, or invalid assumption.

Balance values are theme-owned data. Never introduce a tuning literal into a system, scene, or entity — add it to the active theme's tuning pack and resolve it from there. Use `npm run balance` to answer a pacing question instead of playing a five-minute run.

Before completing a phase:

- Run that phase's short verification suite from `build/BUILD_PLAN_V0.3.md`.
- Update the phase checklist and `RECONCILIATION.md` with material findings.
- Keep the phase implementation, tests, plan status, and reconciliation updates in the same phase commit.
- Do not mark a phase complete or begin the next phase until its verification passes.

## Branch naming

Milestone branches are named `<agent>/<milestone>`, where the prefix records which coding agent built the work:

| Prefix | Built with | Example |
| --- | --- | --- |
| `codex/` | ChatGPT Codex | `codex/v0.1`, `codex/v0.2` |
| `claude/` | Claude Code | `claude/v0.3`, `claude/v0.3.1` |

V0.4 splits into three branches because two of them are built concurrently:
`*/v0.4.0` (the shared seam, merged first), then `*/v0.4.1` (sprites) and
`*/v0.4.2` (content) in parallel. Either agent may take either parallel stream;
the prefix records whichever one actually does.

Use the prefix for the agent that is actually doing the work, decided when the branch is created. The prefix is a provenance record, not a permission boundary — any agent may read, review, or continue any branch.

A milestone built by more than one agent keeps the prefix of the agent that created the branch; note the split in the pull request description rather than renaming. Renaming a branch on GitHub **closes** any pull request that used it as the head, so pick the prefix before opening the pull request.

Everything else about a branch — one branch per milestone, one pull request into `main`, one reviewable commit per numbered phase — is unchanged by the prefix.

## Git workflow for V0.3.1

- Branch: `claude/v0.3.1`
- Delivery: one branch of play-test corrections to the merged V0.3 milestone. It
  adds no new milestone scope; each change fixes something V0.3 shipped wrong.
  See REC-058, REC-059, and REC-060.

## Git workflow for V0.3

- Branch: `claude/v0.3`
- Delivery: one branch for the complete V0.3 milestone, based on merged V0.2.
- Each numbered build phase is one reviewable commit using the subject listed in the build plan.
- If a completed phase needs a later correction, use a focused `fix(v0.3): ...` commit and record the cause in `RECONCILIATION.md`; do not silently rewrite shared history.
- Keep unrelated refactors and V0.4 ideas out of the V0.3 pull requests.
