# P5 consolidated acceptance — Sessions 8–9

**P5 remains pending.** This evidence inventory is complete; it does not close
sustained lifecycle, native overlay/pending-work or broader compatibility acceptance.
No runtime defect was demonstrated. Session 8 delivered the inventory; Session 9
adds a bounded native-tab acceptance fixture and deterministic focus-state checks.
No runtime change is delivered. P6, content, persistence and sprite work remain gated.

## Session 8 checkpoint and evidence rules

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
| Window blur/focus | Existing `phase-five.spec.ts` synthetic event wiring remains distinct. Session 9 `tests/e2e/native-visibility-v043.spec.ts` records trusted blur/focus plus hidden/visible from same-window tabs without focus emulation. `tests/unit/lifecycle/focus.test.ts` executes actual handlers against both themes: automatic pause/resume ownership, duplicate events, preserved paused/level_up/time_up/dead/complete states and late events without engine access. | **Covered** for one native playing-run round trip and deterministic state guards; native overlay/window-minimize/device combinations and sustained transitions are not claimed. |
| Native visibility loss/resume without catch-up | Session 9 bounded case and `P5_NATIVE_VISIBILITY.json`: matching native window IDs, trusted hidden/visible, 1,330.6 ms hidden interval, unchanged elapsed/spawns/empty queues; first observed advancing rAF sample adds 7.493 ms at unchanged 0.5 rate. Phaser retains loop ownership; no runtime handler change. | **Covered** for this brief macOS Chromium/Metal playing-run case only. Empty queues/light load do not establish recovery with pending work or sustained combat; overlay guards are deterministic, not native overlay acceptance. |
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

## Session 9 — native events and focus-state acceptance

Starting source: clean `b8114cb` on existing `codex/v0.4.3`; runtime/tests from
Session 8 were unchanged. Read-only recheck confirms [run 38829241556](https://github.com/PDVersion/Arena-Survivor/actions/runs/38829241556)
completed successfully for **`03965ef`** at **11:40:11 AEDT on 2026-10-16**:
474 units/56 files, types/lint/build, 93 browser passes/one existing skip,
zero audit findings. PR #25 remains merged at `54b9b1b`. This is not CI for
`b8114cb` or this new local test/evidence slice; no remote action is performed.

### Native method and observed result

The installed Playwright source/types explicitly show default focus emulation.
A new CDP session disabling that override did not restore native visibility:
the first Session 9 attempt verified both tabs had the same window ID but
failed the hidden-state precondition in 6.3 s. It demonstrated no game defect.
The corrected fixture spawns one owned Chromium process with a fresh temporary
profile and no Playwright launch defaults, then attaches with the installed
`connectOverCDP(..., { noDefaults: true })` option to its default context.
This prevents focus/media emulation from being installed in either tab.
A first external-context attempt stops before navigation in 1.3 s because it
has no inherited baseURL; constructing the absolute URL fixes that fixture issue.
These are two recorded setup failures, not successful game checks or automatic
retries. No native hidden/visible transition occurred in either failed attempt.

The corrected case passes: **one test / 4.4 s (5.1 s including runner overhead),
one worker, zero automatic retries, 30 s upper bound**, with a single brief
hidden/visible round trip. The fixture uses the existing read-only test telemetry;
no production facade, synthetic event dispatch or document visibility override
is added. Both tabs independently report window ID **862793913**.
Trusted native events include blur→hidden and focus→visible; an initial focus
event before blur is retained in the raw record. Assertions require the actual
hidden/visible precondition before accepting any game evidence.

| Environment / observation | Result |
| --- | --- |
| Device / OS | Apple M5 Pro, 48 GiB, Darwin 25.5.0 / macOS |
| Browser / renderer | Chromium 151.0.7922.34, WebGL, ANGLE Metal Renderer: Apple M5 Pro |
| Actual viewport / DPR | **1280×657 / 1** inside a 1280×800 native browser window |
| Delivery / presentation | Vite test mode / Default, existing eco theme, 0.5 gameplay rate |
| Scenario flags | noContact/noXp/noHazards/noWeapon; light natural arrivals; no combat stress |
| Hidden event → visible event | **1,330.6 ms** (includes tab-operation overhead around the requested 1,200 ms dwell) |
| Hidden elapsed / held elapsed | **258.463333 ms / 258.463333 ms**, status paused |
| Natural spawns hidden / held / first resumed sample | **1 / 1 / 1**; all other source counts unchanged |
| Gameplay/load queue backlog hidden / held / first resumed sample | **0 / 0 / 0**, no processed gameplay work |
| First observed advancing rAF sample | **265.956667 ms**, playing; delta **7.493333 ms**, below 250 ms acceptance bound |
| Page errors | **0** |

The first advancing sample is observed through rAF and published telemetry;
it is not an instrumented engine step/compositor timestamp. A replay of the
hidden interval would contribute about 665 ms at the base rate and fail this
bound. No backlog was seeded: this proves no catch-up in the measured light
case, not behavior with pending effects, audio voices or a 300-live crowd.
This native Metal run is correctness evidence, not a performance comparison or
physical older-device acceptance. There is no minimization/mobile/other-browser
claim. The observer does not modify game state or event handlers.

Raw capture: [`P5_NATIVE_VISIBILITY.json`](P5_NATIVE_VISIBILITY.json), copied
verbatim from Playwright's `testInfo.outputPath("native-visibility.json")`.
The test attaches that file to the result. Future images must also use
`testInfo.outputPath`; no screenshot is necessary for these event/count assertions.
All owned tabs/browser/server/temp profile are closed/removed, port 4173 has no
listener after execution, and unknown/review-port 4213 processes are untouched.
Final fixture review only reformats code and adds a 2 s forced-termination fallback
for interrupted child cleanup; the passing gameplay observations are unchanged.
No additional browser campaign is repeated for that cleanup-only adjustment.

### Deterministic state coverage and final checks

`tests/unit/lifecycle/focus.test.ts` transpiles and executes the actual two
RunScene handlers, matching the existing lifecycle test convention. Fourteen
checks across both production themes verify that duplicate events resume only
the handler's own interruption, paused/level_up/time_up/dead/complete states
retain object identity and intent, and late events with no run avoid stopped
engine access. These are state-ownership checks; only playing-run tab events
were exercised natively. They do not claim audio-device release.

| Session 9 executed check | Result |
| --- | --- |
| `npm test -- --run tests/unit/lifecycle/focus.test.ts` | **14 pass / 1 file** |
| `npm run typecheck` | Pass |
| `npm test -- --run` | **488 pass / 57 files** |
| `npm run lint` | Pass |
| `npm run build` | Pass; existing start-game chunk advisory |
| `ARENA_NATIVE_VISIBILITY=1 npm run test:e2e -- tests/e2e/native-visibility-v043.spec.ts --headed --workers=1 --retries=0` | **1 pass**, following the two explicit setup corrections above |
| `git diff --check` and changed-document link review | Pass on final reviewed files |

The native fixture is opt-in and self-launches its owned headed browser. Normal
headless regression will add one opt-in skip; that skip is not a native pass.
Runtime imports/test telemetry contracts did not change, so production/startup
guards were not repeated. Balance/audit are not required for test-only work.
Full local browser/stress, authored-duration/extended overtime, ten terminal
cycles, long soaks and device/browser matrices remain deferred, not passed.

## Remaining P5 gate and next meaningful action

1. **Consolidated lifecycle:** schedule a separately owner-authorized serial gate
   under the resource policy. Cover the authored ending, extended overtime/
   clearing, ten terminal reconstructions, pause/resize/Default–Low, pending
   loader/audio/queue ownership and required long soak together. Include native
   overlay transitions and resumed pending work where needed. Record resource
   counts and actual WebAudio close completion; GC movement alone is not leakage.
   This session does not authorize that campaign or waive any requirement.
2. **Compatibility:** obtain the intended supported browsers/devices and access
   to representative older integrated-GPU hardware. Record physical evidence;
   the brief M5 Metal/native-tab result cannot replace it.
3. Do not rerun the passed light native-tab case or create another inventory-only
   slice without a new defect, changed source or a specific remaining acceptance
   requirement. The next useful work requires the authorized consolidated gate
   and/or available hardware. No P6 or content work while P5 remains open.

P5 remains pending. The successor is [Session 10 / P5](../SESSION_10_PROMPT.md);
Session 9's handoff is retired with its durable report/progress/master record.
