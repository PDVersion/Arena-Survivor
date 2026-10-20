# Build dates and status

Updated **2026-10-20 (Australia/Sydney)**. This file replaces the scattered
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
| V0.4.3 | Active on `codex/v0.4.3`; checkpoints below | [PR #25](https://github.com/PDVersion/Arena-Survivor/pull/25) merged 2026-10-16 as `54b9b1b`; head `03965ef` | In progress; [active plan](BUILD_PLAN_V0.4.3.md) |
| V0.4.4 | No build date | No merge | TBC; [sprite continuation](SPRITE_PLAN_V0.4.4.md), gated by roster reconciliation |
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
| C1–C7 / optional content | **C1–C3 verified; C4–C7 pending** | Owner approves planned content; Session15 temporarily waives outstanding browser/device checks without marking them passed. F16 delivered; unrelated optional proposals remain unselected |

## Latest remote evidence

PR #26 merged on2026-10-19 at03:11:29UTC as `c6daeb6`, head `2806720`.
[Run39189877476](https://github.com/PDVersion/Arena-Survivor/actions/runs/39189877476)
succeeds on that head:488units/57files,91 browser passes/two flaky/four skips,
zero audit findings. Two retried failures are repaired in the local P6 software
slice; current local combined run passes96 cases/six explicit opt-in skips with
zero retries. No matching-head CI result is claimed for subsequent local changes.
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
