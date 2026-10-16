# P5 consolidated acceptance — Session 8

**P5 remains pending.** This evidence inventory is complete; it does not close
sustained lifecycle, native visibility or broader compatibility acceptance.
No runtime defect was demonstrated in this slice, so no runtime or test change
is delivered. P6, content, persistence and sprite work remain gated.

## Checkpoint and evidence rules

Inspected local source: `03965ef2fc15e856e8c38f7ee52ec91b1ca875cd`, clean
`codex/v0.4.3`. The documentation consolidation is preserved. Compared with
`2086a41`, its only source/tool changes are two documentation-link comments;
browser specifications are unchanged. Existing scenario evidence is reusable
within those limits, but this is not a matching-head CI pass.

Read-only GitHub inspection on 2026-10-16 finds [PR #25](https://github.com/PDVersion/Arena-Survivor/pull/25)
**merged at 11:34:15 AEDT**, merge commit `54b9b1b7bae8b9d23d66c57333b066ea129d1035`.
The current local branch is retained as requested. Existing [run 38829241556](https://github.com/PDVersion/Arena-Survivor/actions/runs/38829241556)
for `03965ef` was still in progress at inspection; no conclusion is inferred.
[Run 38824954227](https://github.com/PDVersion/Arena-Survivor/actions/runs/38824954227)
is confirmed successful for **`2086a41` only**: 474 units / 56 files, 93 browser
passes / one existing opt-in skip, types/lint/build and zero audit findings.
The workflow excludes `@stress`; that pass supplies no new stress or long-run
result. No publish, workflow dispatch, merge or deployment was performed here.

**Covered** means the named bounded requirement has actual asserted evidence.
**Partial** means only part of the requested acceptance is supported.
**Pending** means required scenario evidence is absent. Source inspection and
rule tests supplement engine/browser evidence; they do not establish native
OS events, physical-device performance, audio-device release or a long soak.
The tests listed below were read, including their flags, duration, assertions
and fixture limitations. Historical evidence is explicitly distinguished from
this session's execution.

## Requirement / evidence matrix

| Requirement | Actual inspected evidence | Status and remaining limit |
| --- | --- | --- |
| Authored-duration playable run and ending | `tests/unit/run-state/run-state.test.ts` asserts a 300,000 ms initial run, held `time_up`, terminal guards, death and reset. `tests/e2e/phase-five.spec.ts` completes 700 ms runs and checks zero clock, overlay and clean restart. `tests/e2e/phase-nine-v03.spec.ts` checks terminal damage flush/ledger in a 6,000 ms fixture and known-attacker death. Existing `2086a41` CI covers these short browser paths. | **Partial** — no uninterrupted authored five-simulated-minute / approximately ten-wall-minute playthrough at 0.5 rate. Rule duration and shortened endings do not substitute for it. |
| Timer decision held until choice | `tests/e2e/overtime.spec.ts`, “the timer ends in a decision rather than an ending”: 1,500 ms duration, `time_up`, timed mode, absent terminal overlay, unchanged elapsed after 500 wall ms. Run-state units freeze non-playing states. | **Covered** for the shortened timer decision; existing CI, current units. |
| Endless / overtime continuation and escalation | `overtime.spec.ts` chooses Digit1, advances >1,000 simulated ms, asserts arrivals/count-up; separate >1,500 ms sample asserts health/threat escalation. Run-state units advance both endless and clearing past duration. | **Partial** — short mechanics covered by existing CI/current units; extended overtime stability and ownership are pending. |
| Clearing, pending arrivals and terminal restart | `overtime.spec.ts` chooses Digit2 on a 2,000 ms fixture, checks natural arrivals stop, field reaches zero, terminal title/overlay, decision closes and restart returns to timed. `RunScene.isFieldClear` requires no enemies and no causal backlog; clearing update suppresses natural/milestone arrivals while other systems run. | **Partial** — shortened integration covered; no dedicated terminal ownership sample with outstanding spawner work, nor sustained clearing soak. No deletion of queued enemies is proposed. |
| Death and terminal presentation | `phase-three.spec.ts` contact fixture asserts dead/zero health, zero velocity/projectiles and dead overlay. `phase-nine-v03.spec.ts` known enemy attribution and terminal flush reconcile damage. `enterTerminalState` has terminalShown guard, snapshots then clears queues, destroys feedback/audio and pauses physics. | **Partial** — short death/terminal behavior covered; repeated death→restart ownership baseline and long-play terminal resources remain pending. |
| Pause and resize, unchanged simulation/world | `gameplay-rate.spec.ts` freezes clock for 500 wall ms at rate 0.5; `boot.spec.ts` and `phase-five.spec.ts` verify fixed logical/world view and coherent HUD on resize. `interface-work.spec.ts` covers opacity, overlays, resize and terminal restart. | **Covered** for bounded wiring in existing CI; sustained pause/resize ownership remains part of the pending lifecycle campaign. |
| Default/Low reversible changes and reconstruction | `presentation-v043.spec.ts` clicks the actual pause settings, switches Low→Default→Low, resizes, checks frozen player/statistics/clock, opacity/reduced motion, terminal restart and next-run setting; title/level-up and dense 300-enemy cases add UI wiring. `tests/unit/ui/presentation-quality.test.ts` checks both themes, immutable inputs and seeded pacing equivalence. P4 report has six both-theme bounded cases and measurements. | **Covered** for bounded UI/presentation isolation; sustained settings churn is pending. Session 6 direct fixture setter is not UI-switching evidence. |
| Window blur/focus | `phase-five.spec.ts`, “HUD and run remain coherent through focus loss and resize”: **synthetic** window blur/focus, focusPaused/audio flag, frozen clock, resize and resumed playing. Scene owns/removes named BLUR/FOCUS handlers; Phaser VisibilityHandler maps window events. | **Partial** — existing CI verifies synthetic event wiring, not native window switching, first-return delta or catch-up work. |
| Native visibility loss/resume without catch-up | Phaser 3.90 `VisibilityHandler.js` emits HIDDEN/VISIBLE separately from BLUR/FOCUS; `Game.onHidden/onVisible` call TimeStep pause/resume, and resume resets delta history. `handleMeasurementVisibility` only interrupts test frame measurements. `tests/unit/performance/frame-measurements.test.ts` rejects hidden/return samples, **not gameplay catch-up**. Session 8 native probe below failed its hidden-state precondition. | **Pending** — native hidden/focus ordering, first advancing simulation delta and resumed spawn/queue behavior are not accepted. No missing scene HIDDEN handler is diagnosed merely from source: Phaser already handles its loop. |
| Bounded pickup/resource reconstruction | `tests/e2e/lifecycle-v043.spec.ts` and `P5_LIFECYCLE_REPORT.md`: both themes × three idle Canvas stop/start reconstructions; 1,040 drops, 790 merges, 250 tracked/live/group/enabled bodies, exact 1,040 XP once, post-update removal and zero stopped resource/listener references. `tests/unit/lifecycle/pickup-lifecycle.test.ts` preserves ties/provenance/fractions/paid-cue races. | **Covered** for the cap-pressure/idle stop-start slice; update is disabled, so this is not authored gameplay or terminal restart coverage. Existing CI/current units. |
| Repeated terminal restart and long soak | `phase-five.spec.ts` checks three shortened completions / two restarts without navigation, fresh health/level/XP/upgrades. `phase-six-v03.spec.ts` resets hazards/escalation. Session 6 separately verifies stopped engine ownership. | **Partial** — ten end-to-end terminal/restart cycles and 20–30-minute sustained lifecycle soak remain pending. These distinct tests cannot be added together to claim ten terminal cycles. |
| Async loader failure and game destruction | `tests/unit/boot/boot-recovery.test.ts` checks declared file error blocks scene start, retry resets state, and an owned once-only async error callback schedules Game.destroy before reporting. `P5_STARTUP_REPORT.md` and raw final/startup samples verify actual atlas/module blocking, reload-to-run, unsupported text canvas, forced Canvas and normal WebGL startup. | **Covered** for observed network/module/graphics failures; malformed atlas/JSON, entry delivery and mid-run WebGL context loss remain **pending** outside this focused recovery claim. No pipeline changes. |
| Audio cleanup | `tests/unit/lifecycle/shutdown.test.ts` calls actual shutdown repeatedly and verifies AudioContext close called once, unlocked=false/voices=0. `AudioFeedbackService.destroy` clears the context reference; terminal and shutdown call it. Session 6 engine fixture disables Phaser audio and does not prove physical WebAudio closure. | **Partial** — deterministic ownership covered; pending close-promise completion, native device resources/in-flight voice behavior through real focus/terminal cycles. No audible acceptance claim. |
| Causal queue cleanup / exact rewards | `tests/unit/lifecycle/shutdown.test.ts` seeds both queues/claim sets, runs actual shutdown twice, rejects any physics/time/tween teardown access, and proves backlog/claims released without altering run data. Pickup units cover exact-once fractional rewards and provenance. `tests/e2e/load-harness.spec.ts` drains 80 scripted events; Session 6 seeds pending work before real scene stop. | **Covered** for tested stop/queue and XP ownership; long-run backlog/deduplication growth remains pending, no mid-run claim eviction. |
| Browser / renderer / viewport compatibility | Session 7 report: macOS Apple M5 Pro/48 GiB, Chromium 151.0.7922.34 SwiftShader WebGL and forced Canvas; 1280×720/DPR1 default and 900×600 failure/slow-network probes. Existing Linux Chromium CI broadens OS correctness, not browser engines or devices. | **Partial** — one engine with two rendering paths/limited sizes; Firefox/WebKit, mobile/touch, native GPU/context-loss matrix and physical older integrated-GPU evidence remain pending. Emulation/software GPU never becomes older-device acceptance. |

## Session 8 execution and bounded failed probe

Final checks on unchanged runtime/tests plus acceptance documentation:

| Executed check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm test -- --run` | **474 tests / 56 files pass**, including lifecycle, boot, run-state, presentation, event, timing and architecture units |
| `npm run lint` | Pass |
| `npm run build` | Pass; start-game 1,618.72 kB / 377.49 kB gzip, existing chunk advisory |
| `git diff --check` | Pass after final documentation review |
| New native visibility attempt | **Not accepted** — see precondition failure below |
| Read-only PR/run inspection | Confirmed merged checkpoint and prior-head success; newer run in progress |

One temporary opt-in Playwright acceptance probe attempted native page switching:
`ARENA_NATIVE_VISIBILITY=1 npm run test:e2e -- tests/e2e/lifecycle-visibility-v043.spec.ts --headed --workers=1 --retries=0`.
Declared bound: one test, 45 s maximum, one worker, zero retries. Its purpose was
native document hidden/visible events, unchanged elapsed/spawns during a 1.2 s
hidden interval, and first advancing simulation delta below 250 ms (hidden time
would contribute at least 600 ms at 0.5 rate). No throughput campaign was run.

Environment: local Apple M5 Pro / 48 GiB, macOS, Playwright Chromium
151.0.7922.34, headed, 1280×720 default desktop viewport, test mode / Default,
noContact/noXp/noHazards/noWeapon. Rendering backend was not collected before
failure and is **unverified for this probe**; no WebGL/Canvas compatibility result
is inferred. The initial sandbox attempt fails to bind port 4173 (EPERM) before
execution. The permitted execution fails after **6.3 s**, waiting 5 s for
`document.visibilityState === 'hidden'`; it stays `visible` after a second page
is brought forward. Neither native hidden nor return assertions were reached.
This is an unmet automation precondition, not a reproduced game defect. It does
not justify adding scene visibility handlers, clamping deltas or changing audio.

The temporary probe is removed rather than shipping an unverified opt-in test.
Its diagnostic is local `test-results/lifecycle-visibility-v043--b8423-umes-without-clock-catch-up-chromium/error-context.md`;
the durable failure and intended assertions are recorded here. No additional
browser rerun or synthetic replacement is labelled native evidence. Playwright
closed its owned browser/server, and a subsequent port 4173 listener check found
none. Unknown processes and the review server on 4213 were left alone.

No source/test/production boundary changed, so the existing production guard and
startup campaigns were not repeated. Full local Chromium, stress, authored and
extended overtime runs, browser/renderer matrix and long soaks are deferred under
the owner policy. Balance/audit are unnecessary for this evidence-only change.

## Remaining P5 gate and next bounded action

1. **Native events:** use one actual foreground Chromium window with two tabs
   in that same window; first verify a visibility observer receives native
   hidden/visible. At most one 30-second check, unchanged 0.5 rate, one brief
   (1–2 s) switch. Capture platform/browser/renderer/viewport/mode, elapsed and
   spawn/queue counters immediately before/during the switch and the first
   advancing frame after return. Require no hidden-time replay/catch-up burst.
   Also verify manually paused/level-up/time_up states are not auto-dismissed.
   If the environment cannot deliver native events, leave acceptance pending;
   do not dispatch synthetic events or overwrite document.hidden as a substitute.
2. **Consolidated lifecycle:** requires separately scheduled owner authorization
   under the resource policy. One serial run should cover authored ending,
   extended overtime/clearing, ten terminal reconstructions, pause/resize/mode
   switching, pending loader/audio/queue ownership and the required long soak.
   Record deterministic resource counts around transitions; GC fluctuation alone
   is not leak evidence. This session does not authorize that future campaign.
3. **Compatibility:** obtain the supported-browser/device selection and physical
   older-device access, then record actual renderer/device evidence. No arbitrary
   new support promise or hardware waiver is made by this report.

These gates remain open despite verified Session 6/7 fixes. P6 does not start.
The successor is [Session 9 / P5](../SESSION_9_PROMPT.md); completed Session 8's
handoff is retired only with this report, progress and master record committed.
