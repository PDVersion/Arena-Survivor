# Build dates and status

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

## Current selected work — 2026-10-22

Completed multistage V0.4.3 and Q6/G1–G4 records now live in the master only;
completed G1–G4/Session21 prompts and redundant G2–G4 pointer plans are deleted.
Current art authority: [V0.4.4](SPRITE_PLAN_V0.4.4.md),
[shared style](SPRITE_STYLE_GUIDE.md), [26 subject prompts](SPRITE_PROMPTS.md).
All five existing sheets will be regenerated at 2× width and 2× height, preserving
world display/layout. Prompt preparation is selected; generation/integration and
style2 acceptance remain unstarted. No new runtime/CI/merge/device claim.


Updated **2026-10-22 (Australia/Sydney)**. This file replaces the scattered
milestone date/status annotations. Git history establishes build/merge dates;
phase reports establish the scope actually verified. A completed slice is not
completion of its enclosing milestone, and a branch pass is not a merge.

## Milestone history

| Milestone | Build checkpoint | Merge evidence | State / record |
| --- | --- | --- | --- |
| V0.1 | 2026-08-12, `a96802c` (Phase 6) | 2026-08-12, `55b63cf` | Complete; [master](MASTER_BUILD_PLAN.md#v0-1) |
| V0.2 | 2026-08-14, `0ce157a` (Phase 7) | 2026-08-14, `83951a1` | Complete; [master](MASTER_BUILD_PLAN.md#v0-2) |
| V0.3 | 2026-08-17, `5d0b4f9` (Phase 10) | 2026-08-17, `74820d8` | Complete; [master](MASTER_BUILD_PLAN.md#v0-3) |
| V0.3.1 | 2026-08-18–19 corrections; final `a5e63fe` | Corrections retained in the merged baseline `103afa7` | Complete correction series; [master](MASTER_BUILD_PLAN.md#v0-3-post-milestone-corrections-v031) / REC-058–068 |
| V0.4.0 | 2026-08-19, `1d446c3` | 2026-08-19, `726c016` | Complete optional-sprite seam; [master](MASTER_BUILD_PLAN.md#v0-4-0) |
| V0.4.1 | 2026-09-02, `0991a85` checkpoint | 2026-09-04, `5a0b55e` | Complete **five-sheet checkpoint**, not full roster; [master](MASTER_BUILD_PLAN.md#v0-4-1) |
| V0.4.2 | Gameplay corrections by 2026-09-18, `3862082`; test fixes followed | 2026-09-21, `52db2ea` | Complete readable baseline; [master](MASTER_BUILD_PLAN.md#v0-4-2) |
| V0.4.2.1 | 2026-09-21, `6e17cc0`; animation correction `7a3641c` | 2026-09-25, `103afa7` | Complete contact/material correction; [master](MASTER_BUILD_PLAN.md#v0-4-2-1) |
| V0.4.3 | C1–C7 and CI repairs delivered on `codex/v0.4.3` | [PR #27](https://github.com/PDVersion/Arena-Survivor/pull/27) merged 2026-10-21 as `9837158`; head `c735cb8` | Delivered checkpoint; Q6 subsequently verified locally; [plan](MASTER_BUILD_PLAN.md#v0-4-3-source-plan) |
| V0.4.4 | No build date | No merge | Selected eco style2 preparation; art/integration unstarted; [sprite plan](SPRITE_PLAN_V0.4.4.md) |
| V0.4 overall | No overall completion date | No overall completion claim | In progress; [sequence/gates](BUILD_PLAN_V0.4.md) |

V0.4.3's plan was introduced on 2026-09-17 (`6b1e56b`); that is a planning
date, not its build completion date. The former “scheduled phases not started”
and “next unbuilt increment” annotations are superseded by the evidence below.

## V0.4.3 verified checkpoints and remaining gates

| Work | Date / commit | Verified scope and limits |
| --- | --- | --- |
| P0 measurements | 2026-10-12, `354d725` | Measurement/software gate; [baseline](performance/P0_BASELINE.md) |
| Q1–Q2 corrections | 2026-10-12, `8d142ed`, `7ff8bbf` | Presentation, selected F16 difficulty, events/roster/inspection; [master](MASTER_BUILD_PLAN.md#v0-4-3-corrections) |
| P1 | 2026-10-12, `8cd149c` | Production diagnostics guard; [report](performance/P1_REPORT.md) |
| Q3–Q4 corrections | 2026-10-12–13, `941a065`, `dae5570` | Cards/offer caps, opening health and stat inspection; [master](MASTER_BUILD_PLAN.md#v0-4-3-corrections) |
| Q5 initial CI/audit repair | 2026-10-13, `28ecdba`, recorded in `6f9ec78` | Matching-head Actions/audit verified; REC-113/114 |
| P2 | 2026-10-13, `64e77c4` | Reduced repeated interface work; [report](performance/P2_REPORT.md) |
| P3 | 2026-10-14, `05c1d4e` | Measured burst CPU improvement; [report](performance/P3_REPORT.md) |
| P4 | 2026-10-15, `d9047c0` | Default/Low affected local gate; [report](performance/P4_REPORT.md) |
| P5 lifecycle slice (Session 6) | 2026-10-15, `8b700d9` | Pickup cap/rewards and bounded shutdown/reconstruction; REC-117 resolved; [report](performance/P5_LIFECYCLE_REPORT.md) |
| P5 startup slice (Session 7) | 2026-10-15, `3d1ee2f` | Measured startup and demonstrated graphics/asset/module failure recovery; [report](performance/P5_STARTUP_REPORT.md) |
| PR #25 CI repair | 2026-10-16, `2086a41` | Portable artifacts/bounded UI-test budgets; matching-head Actions passes; [report](performance/CI_REPAIR_20261016.md) |
| P5 acceptance inventory (Session 8) | 2026-10-16, local evidence-only slice | Requirement matrix inspected; 474 units/56 files, types/lint/build pass; native visibility probe fails its hidden-state precondition; [report](performance/P5_ACCEPTANCE_REPORT.md) |
| P5 native-event slice (Session 9) | 2026-10-16, local test/evidence slice | One native same-window Chromium/Metal playing-run round trip passes; 14 deterministic state guards; final 488 units/57 files, types/lint/build; [report](performance/P5_ACCEPTANCE_REPORT.md) |
| P5 consolidated lifecycle (Session 10) | 2026-10-19, local test/evidence slice | Owner-authorized 20-minute M5 campaign passes: full authored clock, endless extension, ten short terminals, native overlays/pending work, twelve clean lifecycles, thirteen actual closed AudioContexts; scoped aids/limits in [report](performance/P5_CAMPAIGN_REPORT.md) |
| P5 available-engine compatibility (Session 11) | 2026-10-19, local test/evidence slice | 52 serial focused passes across installed Chrome, Chromium, Firefox, WebKit; test timing/readiness fixes; [report](performance/P5_COMPATIBILITY_REPORT.md) |
| P5 branded-browser follow-up (Session12) | 2026-10-19, local test/evidence slice | Edge155/154:26 focused passes; Firefox158/157:two unpatched application smokes; native Safari blocked by automation setting, no gameplay assertions; [report](performance/P5_COMPATIBILITY_FOLLOWUP.md) |
| P5 overall | **Verified scoped software; external checks temporarily waived** | Session15 explicit owner waiver covers missing actual Safari/browser-OS/older physical integrated-GPU checks. No new external pass; historical source limits retained |
| P6 | **Software verified; external checks temporarily waived** |96 serial browser/stress passes/six opt-in skips/zero retries,488units, verified device pack and18 final warmed windows; software slice verified. Physical/browser checks waived/unverified by Session15 owner; [report](performance/P6_READINESS_REPORT.md) |
| C1 foundation | **Verified local slice, 2026-10-20** | Serializable slots, independent attack clocks and attack-owned hit data; [report](content/C1_FOUNDATION_REPORT.md). Foundation retained; the completed C1 gate is recorded below |
| C1 second-tool gate | **Verified local phase, 2026-10-20** | Cleanup Vacuum/Runic Fan, owner-only upgrades, hit splash/ledger/number flush, simulator and bounded gameplay/readability/stress;509units/59files and15 unique affected browser cases. [Report](content/C1_SECOND_TOOL_REPORT.md) |
| C2 evolution | **Verified local phase, 2026-10-20** | Same-slot Cyclone Vacuum/Runic Tempest after four reach picks, exact clock/modifier carryover;527units/60files, eight unique affected browser cases; [report](content/C2_REPORT.md) |
| C3 shrines/curses | **Verified local phase, 2026-10-20** | One scheduled shrine and two run-local one-time curses per theme; visible resolved reward/cost, exact fractional XP/reset;547units/61files, seven unique affected browser cases and120 balance scenarios. [Report](content/C3_REPORT.md) |
| C4 elite family | **Verified local phase,2026-10-20** | Both-theme split/shield/acceleration with inherited identity and finite causal work;561units/63files,six unique affected browser cases; [report](content/C4_REPORT.md) |
| C5 bosses | **Verified local phase,2026-10-20** | Unique capped mini/final, live boss_fight and post-kill endless/clearing,583units/64files, six unique affected serial browser cases and60 coarse TTK scenarios; [report](content/C5_REPORT.md) |
| C6 local profile | **Verified local phase,2026-10-20** | Schema2 local persistence, terminal lifetime stats, two theme-owned unlocks,595units/65files,10 unique affected serial browser cases; [report](content/C6_REPORT.md) |
| C7 portable saves | **Verified local phase,2026-10-20** | Canonical codec, preview/backup/recovery/reset,655units/67files and five affected serial browser cases; [report](content/C7_REPORT.md) |
| C1–C7 / optional content | **C1–C7 local gates verified** | Owner approves planned content; Session15 temporarily waives outstanding browser/device checks without marking them passed. F16 delivered; unrelated optional proposals remain unselected |

## Session21 correction disposition (historical)

C7 is committed locally as `88f220b`; clean branch review found ten commits ahead
of the local origin tracking ref. C1–C7 scoped local gates remain verified.
Q6 is the next open correction gate in [the active plan](MASTER_BUILD_PLAN.md#readable-gameplay-q6):
player-motion/alignment diagnosis, truthful cone feedback, and owner-selected
vacuum primary-target growth with weapon upgrades. Modest early caps are accepted;
exact later cap steps/evolution tuning remain undecided and unimplemented.
Read-only review reran25 affected units/3files, all pass; no new browser evidence,
runtime correction or completion claim. Owner subsequently requests delivery:
publish existing completed work and selected planning in a draft V0.4.3 PR,
leaving Q6 open. Fresh delivery checks pass655units/67files, types/lint/build.
Audit fails with one high finding in pinned Vite6.4.3 (three launch-editor
advisories); dependency pin unchanged, no bypass. Browser regression is deferred
to PR CI; current-head CI is pending at this recording checkpoint. No merge or
deployment is authorized.

## Readable gameplay planning amendment — 2026-10-21

[Four-phase roadmap](MASTER_BUILD_PLAN.md#readable-gameplay-design-context) records owner-requested genre
priorities, verified Australian waste/litter context, candidate enemies and measured
rebalance requirements. Q6 remains next; G1–G4 are planned, not implemented or
assigned a new milestone. No enemy stats or live roster changed in this amendment.
The [baseline](content/READABLE_ROSTER_BASELINE.md) runs120 deterministic model
scenarios across both themes/presets/world fixtures; parked eco models are clearly
excluded from representative acceptance. This documentation amendment passes22
added local-link checks,120-record validation, runtime/test/asset hash preservation,
production build and whitespace checks. Existing bundle-size advisory remains;
no browser suite was run and no new browser/device/CI pass is claimed.

## Historical planning claim and next implementation — 2026-10-21

Owner explicitly requests publishing the planning amendment to main as a claim.
G1 is claimed to Codex on future `codex/readable-gameplay-g1`, with Q6 still its
first prerequisite. [Ownership/gates](MASTER_BUILD_PLAN.md#readable-gameplay-g1)
and [start prompt](MASTER_BUILD_PLAN.md#readable-gameplay-g1) are durable. No Q6/G1 code is implemented
or verified by this publication; G2–G4 and new art remain future work.

PR27 is verified merged at2026-10-21T04:35:26Z as `9837158`, head `c735cb8`.
Its [head CI39535388393](https://github.com/PDVersion/Arena-Survivor/actions/runs/39535388393)
completed successfully. This evidence covers that milestone head only, not the
new documentation claim or future gameplay changes. Later repair notes below
remain historical checkpoints rather than current blockers.

## Latest remote evidence

PR #26 merged on2026-10-19 at03:11:29UTC as `c6daeb6`, head `2806720`.
[Run39189877476](https://github.com/PDVersion/Arena-Survivor/actions/runs/39189877476)
succeeds on that head:488units/57files,91 browser passes/two flaky/four skips,
zero audit findings. Two retried failures are repaired in the local P6 software
slice; current local combined run passes96 cases/six explicit opt-in skips with
zero retries. No matching-head CI result is claimed for subsequent local changes.
Read-only Session21 GitHub inspection also finds successful merge CI
[run39193504359](https://github.com/PDVersion/Arena-Survivor/actions/runs/39193504359)
on `c6daeb6`. Neither run covers local C7 `88f220b` or the pending Q6 corrections.
PR26 is merged, not an active PR to update. No new publication/workflow is run.

### Historical PR25 checkpoints

Read-only Session 8 recheck: PR #25 merged on **2026-10-16 at 11:34:15 AEDT**,
head `03965ef2fc15e856e8c38f7ee52ec91b1ca875cd`, merge commit
`54b9b1b7bae8b9d23d66c57333b066ea129d1035`.
[Run 38829241556](https://github.com/PDVersion/Arena-Survivor/actions/runs/38829241556)
on `03965ef` was in progress during Session 8. Session 9 confirms it completed
successfully on **2026-10-16 at 11:40:11 AEDT**: **474 units / 56 files**,
types/lint/build, **93 browser passes / one existing skip**, zero audit findings.
This result covers `03965ef` only; at that checkpoint later local slices had no matching-head CI.
Session 9 publishes nothing and triggers no workflow.

The owner previously authorized publication of the two P5 commits and CI repair;
the earlier verified PR #25 checkpoint is `2086a41b0e1888e7689f115514893c18dd905cae`.
[Actions run 38824954227](https://github.com/PDVersion/Arena-Survivor/actions/runs/38824954227)
completed successfully on **2026-10-16 at 11:01 AEDT**: types, **474 unit tests
across 56 files**, lint, build, **93 browser passes / one existing skip** and
audit (**zero vulnerabilities**). This is remote evidence, not a full local run.
The older failed run on `d9047c0` remains a historical failure.

This pass does not establish long-soak, additional-browser, physical older-device
or sustained mixed-combat performance acceptance. Such checks stay unverified
unless their scenario-specific reports provide evidence; Session15 explicitly
temporarily waives the specified outstanding external requirements. No P5/P6 gate is closed
merely by consolidating documents or observing green CI.

## Maintenance and document ownership

- Add future date/status changes here; do not reintroduce banner annotations in
  individual build plans. Keep phase checklists and acceptance criteria with the
  corresponding active plan, and measured results with their reports.
- `MASTER_BUILD_PLAN.md` holds completed implementation/architecture records only.
  Ongoing/TBC plans, optional proposals and deferred sprite inventory stay separate.
- `AUTONOMOUS_PROGRESS.md` retains historical session evidence; its old statements
  about pending publication or preserved edits describe those checkpoints.
- Completed Session 3–6 prompt files are retired. Their outcomes live in the
  master, progress and reports; the completed Session 7 slice has its report.
  Keep only the current handoff, then remove it once its session is complete and
  its result is durably recorded. Git retains previously tracked prompts.
- This documentation cleanup adopts the previously uncommitted roadmap design
  review and status annotations with owner authorization. No runtime scope,
  optional feature selection, merge or deployment is implied.

## Consolidation verification

The documentation cleanup passes 517 local link/catalog-source checks, 155
unique explicit master anchors and preservation checks for all 126 architecture
IDs/relationships, historical code/verification blocks, original design-review
recommendations and active C1–C7 scope. `npm run build` and whitespace checks
pass; emitted runtime JS/CSS hashes are unchanged. No local browser/stress suite
was run for this documentation-only change. The existing chunk-size advisory
remains. This is a later local documentation checkpoint, not a new remote CI pass.


## PR27 CI repair — local gate verified, remote confirmation pending

Owner authorizes fixing failed Actions. Failed run39521650366 on5511e86 has
6browser failures/1flaky; audit was skipped. Narrow fixture/input/simulation-budget
repairs and Vite6.4.4 audit patch pass655units/67files, types/lint/build/diff and
audit0findings. Seven unique affected browser cases pass cumulatively, serially
with zero retries; one reproduced shrine assertion failure is retained in the
[repair report](performance/PR27_CI_REPAIR.md). Full current-head Actions is pending
at this checkpoint; no historical run is claimed. Q6 stays open. Existing dirty
roadmap planning is preserved unstaged. No merge/deployment/device acceptance.


PR27 repair follow-up: run39528406842 on a87f57f has116browser passes/6skips and
no flaky tests; both C3 dense-load polls fail their10-second wall budget after
reaching258–275simulation-ms. The same90-second progress budget fixes that next
fixture limit; both affected cases pass12.5s locally/zero retries, types/lint/diff
pass. All earlier repaired cases pass remotely. Final current-head CI is pending.


PR27 second continuation:39531764460 on df75471 passes both C3 cases but has
115passes/6skips/1flaky/2failures. Newly affected benchmark and short terminal
need bounded simulation-completion waits. Horde Space interaction changes world
modifiers after tagged enemies spawn; move it after exact spawn-time reward
assertions, then assert surge activation1/scheduled100. Three affected cases
pass17.9s locally, one worker/zero retries; types/affected lint/diff pass. Final
current-head full Actions remains unverified until its own run completes.

## Readable gameplay — completed local build / 2026-10-22

Q6 `44585dd`; G1 `54e9b2f`; G2A `b4d61ae`, G2B `7ce03c5`, G2C `5b50d7b`;
G3 `d8ae891`; G4 **`a10e3eb`** on `codex/readable-gameplay-g4`.
All four scoped local gates pass. The [single master log](MASTER_BUILD_PLAN.md#readable-gameplay)
contains completed ownership/checklists, decisions, verification and report links.
Final G4 evidence records 703 full units/74 files, 283 focused/25 files, types,
lint/build/whitespace, five serial browser cases and 120 unchanged ambient cases.
These are source-bound phase passes, not a new current full-app CI pass.

Next: cumulative delivery review/one PR when requested, then owner-selected
V0.4.4 inventory/frame/canvas/style planning. Art generation remains unstarted.
Broad regression/stress/soak deferred; actual Safari/missing browser-OS/older
physical-GPU evidence temporarily waived/unverified. V0.4 overall is incomplete.

Documentation-only closure consolidates the phase plans without changing runtime,
tests, assets, packages or retained evidence. No push/PR/merge or CI dispatch.

Closure verification: 482 repository-local Markdown links checked with no new
broken targets/anchors; 321 retained G4 source/evidence SHA256 hashes match.
Only 11 Markdown files change; whitespace checks pass. No runtime/build/browser
suite was rerun for this documentation-only consolidation, and no new gameplay
or external acceptance is claimed. Existing phase commits remain intact.

## Readable gameplay PR delivery — 2026-10-22

Owner explicitly requests creating the cumulative PR. Delivery ownership is
limited to Git/PR metadata and appended status/progress/reconciliation notes;
no runtime, dependency, art or test change is selected. Fresh remote inspection:
`origin/main` is `c200b21`, with no open PR and no main-only commits; local
`4bac071` contains the seven Q6/G1/G2A/G2B/G2C/G3/G4 phase commits plus the
consolidation. Preserve these commits and publish one PR into main.

Fresh delivery verification passes all703unit tests/74files, typecheck, lint,
production build and whole-branch whitespace. The existing bundle-size advisory
remains. `npm audit --audit-level=high` exits0 with two moderate findings in
Vitest/@vitest/mocker (GHSA-qxg6-89mg-rqv8, GHSA-xp26-3454-mjgp); this is not a
zero-findings audit. Pins/lockfile are unchanged and no audit bypass is used.

Select the existing automatic PR CI as the consolidated browser regression
campaign; no repeated heavy local browser run or manual stress dispatch. Remote
current-head CI is pending until its own run completes. Prior scoped reports
retain source/aided-fixture limits. Actual Safari/missing browser-OS/older physical
GPU evidence remains waived/unverified. PR creation does not merge or deploy;
V0.4.4 inventory/frame/canvas/style selection remains next after delivery.

## PR28 roster CI repair — local verification / 2026-10-22

Failed39705612316 on dd30186 has138browser passes/6skips/four failures: old
five-role checks observe eight after G2. Four browser tests now derive exact
non-boss IDs/counts from activeTheme, including zero-count bosses in the roster
map and one elite per role. Sprite/contact/feedback semantics remain asserted;
five-child family rules stay five. No runtime/retry/skip/timeout/dependency change.
Final703units/74files, types/lint/build/whitespace and four affected serial
Chromium cases3.8s/zero retries pass; port4173 clean. Initial typing/zero-boss
expectation corrections are recorded in [repair report](performance/PR28_CI_REPAIR.md).
Matching-head automatic full Actions remains pending until its actual result.
Existing external waiver/unverified state remains; no merge or art selection.


## Documentation and sprite preparation — 2026-10-22

REC-120 pauses Knights and Magic indefinitely until explicit owner reopening.
REC-121 selects eco style2 prompts at twice both frame dimensions while keeping
world size, layout and simulation fixed. [Prompt catalog](SPRITE_PROMPTS.md):
23 primary sheets plus3 optional icons, including regeneration of all 5 existing
sheets. Style2 generated/accepted 0/0; pipeline integration unstarted.

Completed execution plans and original design/source context are in the master.
Removed 5 completed prompt files and 5 redundant completed plan/roadmap files.
Unselected proposals, product/exploration references, SAVE_DATA, evidence reports
and current sprite plans remain separate. Historic report links are redirected;
raw evidence and source digests are retained. No publication/merge/CI is run.

Preparation checks: 489 local Markdown links resolve;26 prompt/manifest dimension/
frame rows match; 298 source/test/script/public-asset hashes unchanged; whitespace
passes. Runtime/build/browser checks were not rerun for Markdown-only work.
Existing external browser/device checks remain waived/unverified.
