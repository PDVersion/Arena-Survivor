# Begin G1 — reliable power growth and existing-roster rebalance

Work in `/Users/pdv/Documents/Projects/Arena-Survivor`. Implement the owner's
claimed G1 work from `build/READABLE_GAMEPLAY_ROADMAP.md`. This is an instruction
to do the work, not another planning-only assessment. Complete the prerequisite
Q6 first if it is still open, then proceed into G1 after its gate passes.

## Recover the current state

1. Read `AGENTS.md`, then its required authorities in order:
   `build/BUILD_PLAN_V0.4.md`, `RECONCILIATION.md`, the V0.3 architecture and
   verification conventions/relevant slices in `build/MASTER_BUILD_PLAN.md`,
   then `build/BUILD_STATUS.md`, `AUTONOMOUS_PROGRESS.md` and
   `build/BUILD_PLAN_V0.4.3.md`.
2. Read `build/READABLE_GAMEPLAY_ROADMAP.md`,
   `build/content/READABLE_ROSTER_BASELINE.{md,json}`, `build/PLAN.md`,
   `build/EDUCATION_PIVOT.md`, `build/THEME_ARCHETYPES.md`,
   `build/ECO_CONTENT_MAP.md` and `build/SAVE_DATA.md`. Consult sprite style/pipeline
   authorities if diagnosing Q6 presentation. Preserve the presentation/body seam.
3. Inspect local changes, branches, remote main and current PR/check state. PR27
   merged V0.4.3 as `9837158`; older baseline reports name older sources and are
   historical comparisons only. Never reset/recreate the checkout or treat an
   earlier green run as current-source verification.
4. Use `codex/readable-gameplay-g1`, based on the latest merged main containing
   this claim. Reuse it if it already contains suitable work; create it otherwise.
   Preserve unrelated edits and do not reopen the merged `codex/v0.4.3` branch.
   G1 is claimed to Codex; G2–G4 and new sprites are not part of this session.

## Prerequisite Q6 — complete before enemy tuning

Inspect the Q6 checklist and actual source/status. If already verified, cite its
commit and evidence and avoid repeating accepted work. If still open, implement
the existing owner-selected correction as its own phase commit before G1:

- Reproduce player jitter using a fixed actor/body anchor across idle/walk/hit,
  both horizontal directions and diagonals. Pose-bound centring is a hypothesis,
  not a proven cause. Correct presentation without changing bodies or hand-editing
  generated art; claim exact presentation/test paths in the active plan first.
- Align the visible vacuum pulse with actual origin/timing/selected hits. A
  lingering fade does not continuously damage a new entrant. Preserve deterministic
  targeting, independent attack clocks and direct/splash damage provenance.
- Grow finite integer primary-target capacity through the Vacuum's own upgrade
  track. Keep a modest opening cap; select later steps/ceiling in theme data using
  balance evidence. Evolution retains earned growth without reducing capacity.
  Unrelated player levels do not increase it; splash caps do not silently grow.
- Run the Q6 deterministic/software/balance checks and only necessary bounded
  serial motion/cone browser checks. Record results and limits in the active plan,
  status, progress and reconciliation with the correction commit. No G1 enemy
  tuning before this gate passes. If an external blocker prevents Q6 acceptance,
  record partial work and stop dependent tuning without inventing a pass.

## G1 ownership and implementation

The roadmap's G1 claim owns theme tuning, applicable simulation support, affected
tests and reports. Before edits, narrow the exact paths to the files actually
needed. Q6 scene/presentation changes keep their separate ownership and commit.

1. Capture a fresh baseline against the Q6-corrected tools. Run the four balance
   commands in `READABLE_ROSTER_BASELINE.json`; preserve every scenario and label
   its source, theme, difficulty, world fixture and simulated versus wall time.
   Eco `spread` and `explosion` assume parked mechanics: exclude their outputs
   from attainable-build acceptance. Extend models only for capabilities actually
   implemented, including owner-track target growth; do not tune against an
   imagined build or treat contact-only bands as survival predictions.
2. Assess health plus armour, speed, contact harm, reward, arrival mix and
   interaction with Grabber, Sweep, base/evolved Vacuum for each existing role.
   Keep Microplastics one-hit at the opening in all presets, the Bottle baseline,
   Glass's higher material durability, stationary clearable Shards and finite
   Bagged Waste offspring. Review parent-plus-children and elite-descendant reward
   budgets, retained work and exact-once damage/XP attribution.
3. Change only values supported by the before/after evidence, in theme data.
   Preserve useful role differences and a generalist fallback. Give upgrades and
   evolution a visible payoff and a period to enjoy it. Review Glass's compounded
   health/armour and population share before adding blanket damage or XP buffs.
   Keep values unchanged where they already serve their role; explain why.
4. Report level milestones, role mix, XP/kills, isolated/packed TTK bands and
   backlog/cap dwell where measured. Peak300 alone is neither a balance failure
   nor a performance result. Do not enlarge caps to conceal a throughput problem.
5. Preserve rate0.5, camera/body contracts, two production themes, independent
   clocks, finite causal work and existing save compatibility. Do not add G2
   enemies, a material-effectiveness matrix, currencies, characters, new art or
   precise environmental facts. Tonnes and surveyed item percentages are context,
   never direct health, damage or spawn probabilities.

## Verify and deliver the local phase

Run:

```text
npm run typecheck
npm test -- --run tests/unit/content tests/unit/architecture tests/unit/enemies tests/unit/director tests/unit/difficulty tests/unit/weapons tests/unit/simulation tests/unit/elites tests/unit/events
npm run lint
npm run build
git diff --check
```

Run the four both-theme/all-preset baseline/C3 balance commands from the recorded
JSON after applicable model updates. Add targeted differential tests for actual
tuning/contract risks, not tests that only repeat new literals. Validate contact
assumptions in a necessary bounded serial play/readability check: one worker,
zero automatic retries, screenshots under `testInfo.outputPath`, clean up owned
browsers/servers/recorders. Keep broad regression/stress/soak/device checks deferred
to an authorized consolidated run/Actions; never label deferred checks passed.
Existing external Safari/browser-OS/older-device checks remain waived/unverified.

Write `build/content/G1_REPORT.md` with source identity, before/after values and
reasons, models/fixtures, actual results, limitations and remaining work. Update
the roadmap G1 checklist, BUILD_STATUS, relevant product/theme docs, reconciliation
and AUTONOMOUS_PROGRESS in the same G1 commit as implementation/tests. Do not mark
G1 complete until its own gate passes, and do not start G2. Retire this prompt
only when its completed result is durable; leave an accurate next-phase handoff.

Use one reviewed local commit per verified Q6/G1 phase. Report the outcome,
verification and any limits plainly. The owner's request to publish this planning
claim to main does not by itself authorize merging later gameplay changes.
