# Session 8 / P5 — remaining lifecycle and compatibility acceptance

Work in `/Users/pdv/Documents/Projects/Arena-Survivor` on `codex/v0.4.3`.
Complete the remaining P5 acceptance work after the documentation consolidation.
Do not start P6, optional C1–C7 content, persistence or sprite generation.

Work autonomously for up to 90 minutes of wall-clock time. Record start/deadline
and actual elapsed time in `AUTONOMOUS_PROGRESS.md`; reserve the final 20 minutes
for verification, review and recording. If a required check cannot be completed
within scope/budget, preserve the work and record the gate as pending.

## Restore context

Read, in order:

1. `build/BUILD_PLAN_V0.4.md` — sequence, ownership and gates.
2. `RECONCILIATION.md` — especially REC-010, REC-020, REC-114, REC-117–119.
3. `build/MASTER_BUILD_PLAN.md` — V0.3 architecture/verification conventions;
   V0.4.3 completed P0–P4 and P5 slice records.
4. `build/BUILD_STATUS.md`, `AUTONOMOUS_PROGRESS.md`, `AGENTS.md`,
   `build/BUILD_PLAN_V0.4.3.md`, relevant roadmap Session 8/9 sections, and
   `build/performance/P5_LIFECYCLE_REPORT.md` / `P5_STARTUP_REPORT.md`.

Consult product/theme/save authorities required by AGENTS.md before affecting
their surfaces. Source code is the API authority; older master-plan sketches and
tuning figures are historical, not instructions to undo later corrections.

Inspect actual status/history and PR checks. Last verified published checkpoint:
`2086a41`, PR #25, matching-head Actions run `38824954227` passed 474 units / 56
files, 93 browsers / one existing skip, types/lint/build and zero audit findings.
Recheck current state; do not assume that evidence covers a later changed head.
The documentation cleanup is a subsequent local commit; inspect it rather than
resetting/recreating the branch. The formerly dirty eight plan edits have been
adopted/consolidated; completed plans and Session 3–6 prompts were retired.
Back up and preserve any new unrelated edits; do not blindly stage all files.

## Local resource policy — mandatory

The owner's AGENTS.md resource limit overrides historical full-suite/soak commands.

- Prefer existing matching-head Actions evidence, deterministic units/integration
  checks and source-level ownership analysis before opening a browser.
- Do not run full local Chromium, `test:e2e:ci`, `test:e2e:stress`, extended
  authored/overtime runs, 20–30 minute soaks, repeated performance campaigns or a
  browser/renderer matrix in this session.
- If real Phaser/browser ownership cannot be established adequately otherwise,
  use only the smallest bounded affected scenario, serially, one worker, zero
  automatic retries. Declare its purpose and upper bound before running it.
- Stop owned servers/browsers/recorders on completion or interruption. Leave
  unknown processes and any review server on port 4213 alone.
- Explicitly defer broader/long checks to existing Actions coverage or a separately
  scheduled consolidated gate. A deferred scenario remains pending. Do not start
  CI merely to relocate expensive checks without authorization to publish.

## Execute this slice

1. Create `build/performance/P5_ACCEPTANCE_REPORT.md` with a requirement/evidence
   matrix for authored run endings, overtime/endless/clearing, pause/resize,
   focus/visibility loss and resume, Default/Low switching, repeated reconstruction,
   async loader/audio/queue cleanup, and broader browser/device compatibility.
   Map each to an actual existing test/report and mark covered/partial/pending.
   Inspect the test content; green CI alone is not scenario evidence.
2. Resolve the smallest remaining correctness gaps within P5 ownership. Prior
   slices already fixed REC-117 pickup overflow retention, paid-cue reward races,
   stopped-scene references and observed graphics/asset/module startup failures.
   Preserve exact-once XP/provenance, deterministic merge ties, caps, time scaling
   and presentation/simulation separation. Fix only reproduced defects.
3. Add deterministic regressions for demonstrated failures; use a bounded real
   browser check only where necessary for lifecycle/visibility/focus wiring.
   Inspect existing e2e test hooks before adding any fixture. Keep test support
   excluded from production and screenshots in `testInfo.outputPath`.
4. Update the P5 matrix/checklist with exact executed checks and unresolved
   requirements. Do not mark P5 complete until its required gate is satisfied.
   If long-soak or unavailable browser/device evidence remains required, leave
   it pending and describe the next bounded verification step. Do not waive a
   gate yourself or move to P6 to hide incomplete P5 acceptance.

Ownership: the active P5 block in `BUILD_PLAN_V0.4.3.md`, affected lifecycle/boot
unit/browser tests and test fixtures, the new P5 acceptance report, progress,
BUILD_STATUS and material reconciliation updates. Add exact newly discovered
runtime dependencies to that block before editing. No sprite pipeline, balance,
new content, dependency upgrade or speculative pooling/Phaser splitting.

## Verification and delivery

Run affected deterministic tests after changes; final software checks are
`npm run typecheck`, `npm test -- --run`, `npm run lint`, `npm run build` and
`git diff --check`. For changed production/test boundaries, run the existing
production guard as necessary under the same serial browser budget. Avoid
repeating unchanged browser/startup campaigns. Balance/audit runs are only
needed for corresponding authorized changes; do not alter scope to justify them.

Record device/browser/renderer/mode and limitations for any new browser evidence.
Update active phase checklists, `build/BUILD_STATUS.md`, progress and material
reconciliation findings in the same reviewable commit as the verified change.
Use the P5 subject `fix(v0.4.3): bound lifecycle and startup costs` for a verified
P5 implementation slice; use a focused documentation subject for evidence-only
work. Move newly completed implementation records into the master, while keeping
unfinished requirements in the active plan. Delete this handoff only after its
session result is durably recorded; write a successor for the actual next open
section. If P5 remains pending, the successor stays P5; otherwise prepare P6.

Keep delivery local: no push, PR merge or deployment is authorized by this prompt.
Finish with commit, changed behaviour/evidence, executed and deferred checks,
remaining gate and next-session handoff. Never claim physical older-device,
additional-browser or long-soak acceptance without the corresponding evidence.
