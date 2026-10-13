# Session 3 / P2 — copy into a new session

Execute Session 3 / P2 from `build/AUTONOMOUS_DEVELOPMENT_PLAN.md` in:
`/Users/pdv/Documents/Projects/Arena-Survivor`.

Run autonomously for up to 90 minutes of wall-clock time. Record start/deadline
and reserve the final 15–20 minutes for validation, review and progress recording.

Follow AGENTS.md's reading order: `build/BUILD_PLAN_V0.4.md`, `RECONCILIATION.md`,
then `build/BUILD_PLAN_V0.3.md`. Read `AUTONOMOUS_PROGRESS.md`, the active
`build/BUILD_PLAN_V0.4.3.md`, the autonomous roadmap and P1 performance report.
Inspect branch/history, dirty files and active plans before changing code.
Safely resume `codex/v0.4.3`; preserve all uncommitted work. Seven historical plan
status annotations and the roadmap's concurrent design-review section have been
kept outside phase commits. Do not overwrite, silently stage or discard them.
The architecture atlas has been adopted for the owner's requested tool linking.
Q4 adds one-hit opening Microplastics (base health 9), difficulty-resolved
starting stats in the sprite browser and an owner-requested PR checkpoint.
Q5 repairs browser CI timing/output paths and patches development tooling;
REC-113 audit passes locally and in [Actions on repair head `28ecdba`](https://github.com/PDVersion/Arena-Survivor/actions/runs/38332255864), with zero vulnerabilities. The checkpoint
[PR #24](https://github.com/PDVersion/Arena-Survivor/pull/24) stays draft while
P2–P6 remain. Verify its latest Actions head and Q5 progress before resuming. Inspect that PR/CI and confirm the Q4 gate and actual HEAD from progress/history rather than assuming it.

P0, Q1, Q2 and P1 are verified. Q3 corrects upgrade-card fitting and offers for
skills capped early by strong rolls, links the sprite browser/atlas and records
visual findings. P2 is next and unstarted. Work only within P2's ownership; add
a measured dependency to the active plan before editing outside that block.
Do not implement optional content, generate sprites or start P3 without P2's gate.

Complete P2:
1. Establish reproducible profiles for minimap visible/hidden and HUD/overlays.
   Identify actual repeated scans, allocations, redraws and text updates.
2. Reduce confirmed work: skip hidden-map preparation/drawing, reuse safe buffers
   and avoid unchanged HUD text/layout updates. Add theme-owned refresh cadence
   only if measured evidence justifies it. Keep critical health/XP/state updates
   prompt, visible world unchanged and consumed-site markers excluded.
3. Verify minimap visibility, resize, opacity, pause/restart and overlay pointer
   behavior; retain live/cumulative natural/fragmentation/Bagged Waste/environment
   spawn counts. Test both production themes and production telemetry exclusion.
4. Run relevant types/units/lint/build/browser checks and serial stress. Measure
   equivalent warmed sustained windows (at least 60 seconds, three serial repeats)
   before/after. Report renderer, actual visible/live populations, build mode,
   viewport, wall p95/p99/max/stalls, update CPU and exclusions separately.
5. Update phase checklist, AUTONOMOUS_PROGRESS.md and RECONCILIATION.md after each
   completed cycle. Commit the phase code/tests/docs together after its gate.
   Document blocked checks and continue independent work without calling them pass.

Production cap stays 300. P1's calm 600-live measurements on M5 Pro Metal suggest
headroom, but do not approve a cap increase or prove older-device/mixed-combat
support. SwiftShader and hardware reports must stay distinct; throttling is not
physical older-device acceptance. Half-speed gameplay is intentional: five timer
minutes mean about ten active real minutes, plus pauses. Glass Shards intentionally
stay stationary and clearable. Detached intact Glass Bottle pixels are an art
review finding requiring future prompt/regeneration, not hand-editing. Bagged
Waste remains fixed 2 bottles / 2 Microplastics / 1 glass at half normal rewards;
its requested composition/chance change still awaits owner confirmation.

The ordinary local review server may remain on port 4213. Do not reuse or stop an
unknown process; use known isolated test/production ports and clean up your own
servers. Atlas route: `/build/ARCHITECTURE_MAP.html`; sprite tool:
`/sprite-browser.html`. Preserve local review notes/game state.

If P2 finishes early, use only its measurement/reporting extensions. Finish with
actual elapsed time, changed files/commit, executed checks/results, equivalent
measurements and limits, remaining work/blockers and the next task (P3 after the
verified P2 gate). Do not claim unexecuted checks or unmeasured improvements.
