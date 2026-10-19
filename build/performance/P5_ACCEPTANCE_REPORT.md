# P5 consolidated acceptance — Sessions 8–12

**P5 remains pending.** The scoped Session 10 lifecycle campaign passes;
Session 11 adds 52 focused Chrome/Chromium/Firefox/WebKit passes; actual branded/platform/older-device coverage remains pending.
No runtime defect was demonstrated. Session 8 delivered the inventory; Session 9
adds a bounded native-tab acceptance fixture and deterministic focus-state checks.
Session 10 adds the owner-authorized 20-minute lifecycle campaign. No runtime
change is delivered in those evidence slices. On 2026-10-20 the owner explicitly
authorizes C1–C7 after the verified software gate, with missing browser/device
acceptance release-blocking. P5 remains pending; sprites stay outside scope.

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
| Authored-duration playable run and ending | Session 10 `lifecycle-campaign-v043.spec.ts` reaches exactly 300,000 ms at unchanged rate 0.5, then holds the actual time-up decision; existing units/short endings remain complementary. | **Covered for aided lifecycle** — no-contact/no-hazard, seeded overlay XP/arrival, scripted movement and real upgrade choices. Unassisted human survival, natural pacing and hazard soak are not claimed. |
| Timer decision held until choice | `tests/e2e/overtime.spec.ts`, “the timer ends in a decision rather than an ending”: 1,500 ms duration, `time_up`, timed mode, absent terminal overlay, unchanged elapsed after 500 wall ms. Run-state units freeze non-playing states. | **Covered** for the shortened timer decision; existing CI, current units. |
| Endless / overtime continuation and escalation | Session 10 continues for five wall-clock minutes, advancing another 150,013.478 simulated ms past the authored limit at live populations up to 300. Existing overtime tests verify escalation/arrival rules. | **Covered for the scoped extension** — infinite-endless memory/performance and unassisted difficulty remain outside this evidence. |
| Clearing, pending arrivals and terminal restart | Existing overtime test verifies natural arrivals stop; Session 10 adds three short clearing cycles with genuine queued spawn work that is released and fought before completion, then runtime reconstruction. | **Covered for bounded clearing/queue lifecycle** — shortened fixtures, not three authored-length clearings. |
| Death and terminal presentation | Existing contact/death-attribution and ledger tests plus Session 10 sustained-endless contact death and three short one-health real-overlap deaths. Terminal accounting/queues/audio and reconstruction assertions pass. | **Covered for tested terminal lifecycle** — one-health setup is explicit; no human survival/difficulty claim. |
| Pause and resize, unchanged simulation/world | Existing UI/world-view/half-rate checks plus ten Session 10 paused quality dispatch/native window-bound changes; paused elapsed stays fixed and subsequent active ownership remains valid. | **Covered for scoped sustained lifecycle** — new dispatches use the actual scene setting method; existing P4 pointer/UI tests supply control-surface coverage. |
| Default/Low reversible changes and reconstruction | Existing P4 presentation isolation/UI/seeded model tests plus ten Session 10 Default↔Low changes with pause/resize, and twelve stable scene create/stop baselines. | **Covered for scoped campaign** — no new throughput/readability or older-device claim. |
| Window blur/focus | Sessions 9–10 same-window native tab checks record trusted blur/hidden/visible/focus with focus emulation absent during those rounds. Session 10 manual-pause, level-up and time-up intent remains held. Fourteen both-theme deterministic focus ownership tests remain in the 488-unit suite. | **Covered for bounded native playing/overlay paths** — sustained phase explicitly uses focus emulation; window-minimize/mobile/other-device combinations remain untested. |
| Native visibility loss/resume without catch-up | Session 9 light playing-run first observed delta 7.493 ms remains valid. Session 10 native manual-pause preserves one queued spawn through hide/show, then explicit resume releases it once; level-up/time-up remain held. | **Covered for these bounded paths** — no synthetic events/visibility overrides; long sustained phase is not native-focus evidence or a production frame-time campaign. |
| Bounded pickup/resource reconstruction | `tests/e2e/lifecycle-v043.spec.ts` and `P5_LIFECYCLE_REPORT.md`: both themes × three idle Canvas stop/start reconstructions; 1,040 drops, 790 merges, 250 tracked/live/group/enabled bodies, exact 1,040 XP once, post-update removal and zero stopped resource/listener references. `tests/unit/lifecycle/pickup-lifecycle.test.ts` preserves ties/provenance/fractions/paid-cue races. | **Covered** for the cap-pressure/idle stop-start slice; update is disabled, so this is not authored gameplay or terminal restart coverage. Existing CI/current units. |
| Repeated terminal restart and long soak | Session 10 owner-authorized 1,200,458 ms ownership window spans full authored clock, five-minute endless extension, ten short terminal cycles and fresh active play. Twelve create baselines and twelve stops pass. | **Covered for the scoped 20-minute campaign** — includes brief native/choice/pause intervals and short cycles; no heap/GC, infinite-play or ten authored-length-run claim. |
| Async loader failure and game destruction | `tests/unit/boot/boot-recovery.test.ts` checks declared file error blocks scene start, retry resets state, and an owned once-only async error callback schedules Game.destroy before reporting. `P5_STARTUP_REPORT.md` and raw final/startup samples verify actual atlas/module blocking, reload-to-run, unsupported text canvas, forced Canvas and normal WebGL startup. | **Covered** for observed network/module/graphics failures; malformed atlas/JSON, entry delivery and mid-run WebGL context loss remain **pending** outside this focused recovery claim. No pipeline changes. |
| Audio cleanup | Session 10 delegates to actual native AudioContext/oscillator/close APIs: all thirteen observed contexts close exactly once, their promises settle and state is closed; seven service closures begin with active voices and terminal voices become zero. Existing deterministic shutdown tests remain. | **Covered for browser WebAudio lifecycle** — sustained play muted; no audible quality, physical audio-device release, mobile policy or heap claim. |
| Causal queue cleanup / exact rewards | `tests/unit/lifecycle/shutdown.test.ts` seeds both queues/claim sets, runs actual shutdown twice, rejects any physics/time/tween teardown access, and proves backlog/claims released without altering run data. Pickup units cover exact-once fractional rewards and provenance. `tests/e2e/load-harness.spec.ts` drains 80 scripted events; Session 6 seeds pending work before real scene stop. | **Covered** for tested stop/queue and XP ownership; long-run backlog/deduplication growth remains pending, no mid-run claim eviction. |
| Browser / renderer / viewport compatibility | Session 11: 52 focused checks across installed Chrome155, pinned Chromium151, Firefox153 and WebKit26.5, M5/macOS, WebGL with DPR1/2 and resize; both themes isolated Canvas lifecycle. See [compatibility report](P5_COMPATIBILITY_REPORT.md). | **Partial** — desktop support policy now selected under owner delegation. Actual Safari/Edge, stable release/platform combinations and physical older integrated-GPU evidence remain pending. Mobile/touch is outside selected desktop control scope. Software/emulation never becomes older-device acceptance. |

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

## Session 10 — authorized consolidated lifecycle result

On 2026-10-19 the owner explicitly authorized the serial campaign, superseding
the prior Session 10 handoff's absence of approval. The new opt-in campaign
passes **once**, one worker/zero automatic retries, after documented bounded
preflight corrections. **1,200,458 ms**, authored clock exactly **300,000 ms** at
rate **0.5**, a five-wall-minute endless extension, ten short terminal cycles,
native paused/level-up/time-up transitions, deferred spawn work, ten paused
presentation/resize changes, twelve clean create/stop baselines and thirteen
actual closed AudioContexts are recorded. No runtime defect or fix.

Full method, setup failures, limits and checks:
[Session 10 campaign report](P5_CAMPAIGN_REPORT.md),
[raw capture](P5_CAMPAIGN_RESULTS.json),
[derived summary and hashes](P5_CAMPAIGN_SUMMARY.json).

The sustained test uses no-contact/no-hazard survival controls, scripted movement,
first-offer application and explicitly labelled focus emulation. Native overlay
rounds turn that emulation off and require trusted real tab events. It is not
unassisted survival, hazard soak, production throughput, direct active-scene
removal/destruction or physical-device acceptance. Causal histories are retained
per run and reset at stop; no mid-run identity eviction or heap/GC claim is made.
The final scene is explicitly stopped before Game destruction. See the report
for the distinction between top-level display counts and a recursive object census.

Final source checks: **488 units/57 files**, types/lint/build, production emitted-
code exclusion, unchanged fixture hashes, raw-result validation and whitespace/
local-document links pass. Full local regression/stress, new startup campaigns,
balance/audit and Actions were not run. The owned browser/server/profile are
cleaned up; unrelated processes/review port 4213 remain untouched.

## Session 10 remaining gate (superseded selection prerequisite below)

The scoped lifecycle campaign is now covered. **P5 overall remains open** for
broader browser/device compatibility and its required acceptance boundaries.
The next useful work requires owner-selected supported browsers and representative
older integrated-GPU access, or an explicit owner gate change. Current M5/Metal,
Canvas and Chromium/Linux evidence cannot imply that acceptance.

Do not repeat the unchanged long campaign, native case or another inventory-only
slice absent a reproduced defect, changed source or selected missing requirement.
Preserve the unassisted/hazard, direct-active-destruction and production-performance
limitations rather than silently converting a fixture pass into broader readiness.
P6/content remain gated. Session 11 result: [completed record](../MASTER_BUILD_PLAN.md#v0-4-3-p5-compatibility); current successor is [Session 12 / P5](../SESSION_13_PROMPT.md).

## Session 11 — delegated support selection and executed engine matrix

Owner instructed Codex to determine the browser list using modern browser standards and run the tests. This supersedes the selection/access prerequisite for available local browser testing; it does not provide physical older hardware or waive the gate. Selected current/previous-major desktop Chrome/Edge/Firefox/Safari on vendor-supported OS; mobile/touch outside this desktop contract. **52 focused passes in 4.9 minutes**, plus four final guard-only environment passes; test timing/readiness corrections only. Final 488 units/57 files, types/lint/build/whitespace pass. Full method, interrupted setup attempts, exact renderer/mode and remaining branded/platform/device matrix: [Session 11 report](P5_COMPATIBILITY_REPORT.md). P5 remains open; [Session 12](../SESSION_13_PROMPT.md) seeks missing evidence using the selected policy, without repeating accepted work.

## Session12 — remaining branded checks and P6 software preparation

Owner requests finishing P5, beginning P6 and remaining V0.4.3.26 focused
Edge155/154 checks and two unpatched headed Firefox158/157.0.1 smokes pass;
Safari26.5.2 blocks driver session creation, so no gameplay/native pass is claimed.
Exact environment, sources, bounds and cleanup: [branded follow-up](P5_COMPATIBILITY_FOLLOWUP.md).
Owner confirms no older device is available. P5 remains open for missing releases/
platforms/Safari access/physical older hardware; the selected list is unchanged.

P6's [software/readiness-tool slice](P6_READINESS_REPORT.md) is verified:96 full
local browser/stress passes with six explicit skips and zero retries,488units,
types/lint/build/audit, portable pack and18 warmed fixed-load windows. This
explicitly authorized preparation does not pass P5 or silently waive its gate.
The requested decision on moving missing acceptance to a release gate while
C1–C7 proceeds has no reply. Content has not started; [Session13](../SESSION_13_PROMPT.md)
continues from that decision/access, without another unchanged campaign.


## Session13 ordering revision (2026-10-20)

Owner explicitly permits planned C1–C7 after verified software checks while the
missing browser/device evidence remains release-blocking. P5 is still pending,
and no accepted campaign is repeated. C1's runtime foundation is verified in
`../content/C1_FOUNDATION_REPORT.md`; earlier P5/P6 frozen measurements and the
portable pack remain evidence for their recorded source, not later runtime.


Session14 (2026-10-20): C1's second-tool local gate is verified; see
`../content/C1_SECOND_TOOL_REPORT.md`. This adds scoped gameplay/owner-upgrade/
splash and short affected stress evidence, not P5 compatibility/native/long-play
acceptance. Missing browser/platform/older physical-device evidence remains
release-blocking. Original source-bound P5/P6 measurements/pack stay historical.
