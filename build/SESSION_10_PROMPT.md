# Session 10 / P5 — consolidated lifecycle gate and device evidence

Continue `/Users/pdv/Documents/Projects/Arena-Survivor`, existing `codex/v0.4.3`.
P5 remains open. Keep delivery local; no push, PR creation, merge, deployment or
workflow dispatch is authorized. No P6, content, persistence or sprites.

Read AGENTS.md authorities in order, status/progress, current P5 ownership,
REC-010/020/114/117–119 and all three P5 reports including the updated acceptance
matrix. Inspect Git/PR/Actions rather than resetting/recreating the checkout.
PR #25 merged `03965ef` as `54b9b1b`; run `38829241556` now passes on `03965ef`
(474 units/56 files, 93 browsers/one existing skip, zero audit findings), not the
later local evidence/test slices.

Session 9 completed the light native visibility check: one actual Chromium
window/two tabs, same window IDs, trusted blur/hidden/focus/visible, 1.33 s hidden,
frozen 258.463 ms elapsed and one natural spawn, empty queues unchanged, first
observed advancing rAF delta 7.493 ms at rate 0.5. Device: M5 Pro/48 GiB,
Chromium 151.0.7922.34 / native Metal WebGL, test/Default, viewport 1280×657/DPR1.
Raw capture: `build/performance/P5_NATIVE_VISIBILITY.json`. Fourteen deterministic
actual-handler checks preserve both themes' pause/level_up/time_up/terminal intent.
Final 488 units/57 files, types/lint/build pass. No runtime defect or fix.

Do not spend another session re-inventorying unchanged evidence or rerunning
that passed native case. Meaningful next work requires an explicit owner-approved
consolidated lifecycle campaign and/or available supported-browser/device evidence.
This handoff does not authorize full local Chromium/stress, authored/extended
runs, ten-cycle terminal reconstruction or long soaks. If no additional owner
scope/hardware is available, report the specific required authorization/access
without another documentation-only commit or a speculative fix.

The consolidated gate should cover authored-duration ending at unchanged 0.5,
extended overtime/clearing, ten terminal restarts including death, sustained
pause/resize/Default–Low, native overlay/pending-work resume, actual WebAudio
close completion/in-flight voice cleanup and required 20–30-minute soak together.
Record exact objects/bodies/listeners/timers/queues/reward baselines and device/
browser/renderer/mode; GC fluctuation alone is not leakage. Browser/device matrix
needs an owner-selected support scope and physical older integrated-GPU access.
Never infer physical older-device readiness from the M5 or software emulation.

The native fixture is opt-in and self-launches an owned browser. Playwright
normal pages enable focus emulation: disabling it from a different CDP session
proved insufficient. Attach with connectOverCDP noDefaults:true to the default
context of a fresh owned Chromium process; it needs absolute URLs. Don't mutate
visibility properties, synthesize events, patch dependencies or use a default
new context to claim native acceptance. Keep the test opt-in; headless CI skipping
it is not a native pass. No additional launch is needed absent a new reason.

After an authorized reproduced P5 defect, add deterministic regression coverage
and exact runtime ownership before editing. Preserve XP/provenance/ties/caps,
theme-owned tuning and presentation/simulation separation. Do not re-tear down
Phaser physics. Keep test support outside production and images under
`testInfo.outputPath`. Use only necessary bounded serial affected checks, declare
purpose/bound, one worker/no automatic retries, clean up owned resources, and
leave unknown processes/review port 4213 alone.

For authorized work, use up to 90 minutes with start/deadline/actual elapsed in
progress and final 20 minutes reserved. Final software checks: typecheck, all
units, lint, build, diff --check. Repeat production/startup guards only when
boundaries change. Update matrix/status/checklist/reconciliation/progress in the
same reviewed local commit; completed slice goes in master. Keep P5 open until
its required acceptance passes or the owner explicitly changes the gate.
Retire this prompt only after a new actual slice is durably recorded.
