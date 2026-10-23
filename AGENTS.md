# Repository Working Agreement

## Owner direction — Knights and Magic paused indefinitely

Effective 2026-10-22: all further `knight-magic` theme development is paused
indefinitely. Only the owner explicitly reopening the theme can end this pause;
a new milestone, generic parity rule, old plan or failing themed test cannot.
Do not plan or implement its content, tuning, names/copy, sprites, features or
new dedicated acceptance campaigns. Preserve its existing files and historical
records. Existing generic contract tests may read the frozen pack; a change that
would require editing it must be recorded and deferred until explicit reopening,
rather than silently expanding this scope. Continue eco-guardian through stable
core contracts. This overrides older instructions to keep both packs in step.


Every work session in this repository starts by reading, in order:

1. `build/BUILD_PLAN_V0.4.md` — the current milestone sequence, active increment, ownership boundaries, gates, and reconciliation ranges.
2. `RECONCILIATION.md` — decisions, discoveries, pitfalls, and constraints learned while building.
3. `build/MASTER_BUILD_PLAN.md` — the completed implementation record; read the V0.3 architecture and verification conventions, then the relevant completed slices.

Then read `build/BUILD_STATUS.md` for the single milestone date/status summary.
Completed milestone plans are consolidated in the master; ongoing/TBC plans stay
separate. Retire a session prompt after its completed result is durably recorded,
and keep the next open section's handoff current.

Consult `build/PLAN.md` whenever product intent or game behaviour needs more detail. It is the product/design source; `build/SPRITE_PLAN_V0.4.4.md` is the active sprite implementation source, with `build/MASTER_BUILD_PLAN.md#v0-3` retained for architecture and verification conventions. Consult the master's V0.1/V0.2 sections only when their implementation history is relevant.

Consult `build/EDUCATION_PIVOT.md` before changing the environment theme's content, enemy identities, or any information/tooltip surface. It is exploratory except where a decision has been promoted into a build plan.

Consult `build/THEME_ARCHETYPES.md` before adding, naming, renaming, tuning, rendering, or wiring any character, weapon, enemy/monster, skill, upgrade, pickup, shrine, curse, or other themed content.

Consult `build/SAVE_DATA.md` before changing profile state, progression, unlocks, statistics, persistent settings, stable saved IDs, persistence adapters, migrations, or save import/export.

Consult `build/BUILD_PLAN_V0.4.md` before starting any V0.4 work. V0.4.1–V0.4.2.1
are merged. V0.4.3 P0–P6 software/C1–C7 and subsequent Q6/G1–G4 completed
records are consolidated in `build/MASTER_BUILD_PLAN.md`. External waived checks
remain unverified. Read `AUTONOMOUS_PROGRESS.md` and `build/SPRITE_PLAN_V0.4.4.md`
after the required order. Current work is eco-only style2 sprite preparation:
double each frame dimension, same world scale/layout. Use `build/SPRITE_PROMPTS.md`
for copyable subjects. Claim a bounded art/integration phase before code or generation.
Do not edit outside that phase's ownership block.

The seam itself (V0.4.0) is built and merged. Read REC-071 to REC-073 before changing the sprite seam: they settle the reconciliation ranges, how an actor chooses between a sprite and its primitive, and why the renderer's `pixelArt` flag was not used. A sprite is presentation and nothing else — never read one from a system, and never derive a radius, hitbox, mass, or separation value from one.

Consult `build/SPRITE_STYLE_GUIDE.md` before generating, editing, or accepting any sprite, and the master's V0.4.1 pipeline section before changing how sprites are loaded, packed, or resolved. Consult `build/SPRITE_PLAN_V0.4.4.md` for the gated remaining inventory. Track individual sprites in `build/sprites/MANIFEST.md`, and claim a sprite there before generating it. Never hand-edit a generated sprite to match a style the prompt does not produce — fix the prompt and regenerate, or the roster stops being reproducible.

Before changing code:

- Confirm the active phase and do not pull later-phase scope forward without recording why.
- Check `RECONCILIATION.md` for an existing decision before making a new one.
- Preserve the theme/archetype boundary: systems use stable IDs/contracts, while player-facing identity and themed definitions remain in the active theme pack.
- Add or update a reconciliation entry when work reveals a reusable decision, pitfall, issue, workaround, performance limit, or invalid assumption.

Balance values are theme-owned data. Never introduce a tuning literal into a system, scene, or entity — add it to the active theme's tuning pack and resolve it from there. Use `npm run balance` to answer a pacing question instead of playing a five-minute run.

Before completing a phase:

- Run that phase's short verification suite from its active build plan;
  `build/MASTER_BUILD_PLAN.md#v0-3` remains the fallback verification convention.
- Update the phase checklist and `RECONCILIATION.md` with material findings.
- Keep the phase implementation, tests, plan status, and reconciliation updates in the same phase commit.
- Do not mark a phase complete or begin the next phase until its verification passes.

## Branch naming

Milestone branches are named `<agent>/<milestone>`, where the prefix records which coding agent built the work:

| Prefix | Built with | Example |
| --- | --- | --- |
| `codex/` | ChatGPT Codex | `codex/v0.1`, `codex/v0.2` |
| `claude/` | Claude Code | `claude/v0.3`, `claude/v0.3.1` |

Use the prefix for the agent that is actually doing the work, decided when the branch is created. The prefix is a provenance record, not a permission boundary — any agent may read, review, or continue any branch.

A milestone built by more than one agent keeps the prefix of the agent that created the branch; note the split in the pull request description rather than renaming. Renaming a branch on GitHub **closes** any pull request that used it as the head, so pick the prefix before opening the pull request.

Everything else about a branch — one branch per milestone, one pull request into `main`, one reviewable commit per numbered phase — is unchanged by the prefix.

## Completed milestone delivery history

Historical V0.1–V0.4.2.1 delivery/ownership protocols are in
`build/MASTER_BUILD_PLAN.md`; dates and merge evidence are in
`build/BUILD_STATUS.md`. Do not reopen their phases or feature branches.

## Current Git workflow

Completed V0.4.3 and readable-gameplay delivery history lives in the master and
BUILD_STATUS. Do not reopen those completed phases. For V0.4.4 use `codex/v0.4.4`
from the verified current base when implementation starts; claim exact ownership
and short checks first. One reviewable commit per verified phase, separate
manifest claim and one accepted sprite per commit. Leave unrelated local edits
unstaged. Documentation-only preparation does not generate or accept art.

## Local test resource budget

Owner instruction (2026-10-15): keep heavy local Chromium/browser testing to
necessary checks for the current change. Run browser/performance checks serially
and clean up owned browsers/servers/recorders; do not leave background suites
running. Defer full-app browser/stress regression to GitHub Actions or one
consolidated local run after several build sessions. A phase must explicitly
record any deferred checks; never label them locally passed. This instruction
overrides older per-session full-browser test command lists.
