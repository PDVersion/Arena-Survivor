# P5 / Session 11 — desktop browser compatibility

Owner delegated browser/device selection and authorized compatibility testing on 2026-10-19. This supersedes the Session 11 handoff's requirement to wait for owner selection; it does not waive physical hardware evidence. P5 remains open, P6 not started. Local delivery only.

## Selected support policy

This is a project support policy, not a claim that a universal browser-game certification standard exists. Target current stable and previous major desktop Chrome, Edge, Firefox and Safari on vendor-supported OS versions. Windows 11: Chrome/Edge/Firefox; supported macOS: Chrome/Edge/Firefox/Safari; supported desktop Linux: Chrome/Firefox. Require keyboard/mouse, WebGL and WebAudio. Target 1280×720 and 1920×1080; verify usable resizing to 900×600/620. Default and Low must preserve the simulation at 0.5. Mobile/touch/gamepad are outside this desktop control contract; no mobile acceptance inferred.

Rationale: the [Baseline core browser set](https://web.dev/baseline) spans Chrome, Edge, Firefox and Safari, with Android/iOS variants when mobile is supported. Use widely available platform features as the default implementation target. Baseline is feature interoperability guidance, not a performance or game certification. The current/previous-major release policy is our conservative selected scope, not a Baseline rule.

[Playwright browser documentation](https://playwright.dev/docs/browsers) supports Chromium, Firefox, WebKit and installed branded Chrome/Edge. Its engine builds can precede stable releases, and WebKit is not the Safari application. Engine checks complement actual branded release/device evidence rather than replacing it.

Representative older-device target: a physical Windows 11 laptop with Intel UHD 620/630-class integrated graphics (or comparable older integrated GPU), 8 GiB RAM, hardware acceleration enabled, 1920×1080; Default/Low, Chrome/Edge/Firefox stable. Record actual GPU/driver/OS/browser and power mode, renderer, objects/bodies/queues, frame p95/p99/max and >100ms intervals against the plan's provisional thresholds. Do not equate M5, emulated viewport or software rendering with that target.

## Method

Start checkout `f994fd9`, clean `codex/v0.4.3`. Read-only GitHub check confirms merged PR #25 (`03965ef` → `54b9b1b`), successful run `38829241556` only on `03965ef`. No later-head CI claim or remote mutation.

Explicit config `tests/playwright.compatibility.config.ts`: one worker, zero retries, fully serial, 15-minute global bound; own strict-port test server at 4173. Existing focused scenarios run unchanged assertions in installed Chrome and pinned Chromium/Firefox/WebKit. No long lifecycle/native campaign rerun. Headless automated contexts; no native-focus evidence claimed.

Thirteen checks per engine cover boot/single canvas/resize, renderer and actual AudioContext close settlement, half-rate simulation and paused reduced motion, both themes' 1,040-XP/250-pickup overflow and three idle stop/start baselines, normalized/opposing/bounded movement, frozen pause/resume, Default/Low pointer controls/resize/short completion/restart, title setting/level-up, and 300-live map presentation. Existing fixture limits remain: aided/short tests, isolated Canvas lifecycle with update disabled, not authored/long/hazard play or a measured production throughput campaign. Main gameplay is test-mode eco/Normal WebGL; alternate-theme integration is the isolated Canvas lifecycle case only.

## Setup failures and corrections

First attempt: 11 passed, four failed, one interrupted, 36 not run (~1.3 minutes), stopped after repeated input failures. Zero-duration Escape/Tab pulses were missed between frames: Phaser Key.onUp clears `_justDown` before `RunScene.update` can consume JustDown. Only test presses in phase-two/gameplay-rate/presentation gain 80ms holds, preserving actions, assertions, timeouts, gameplay and dependency source. This matches the Session 10 fixture finding. No runtime defect was reproduced.

A report backup used a repository-relative path where the reporter resolves relative to its config under tests. The backup script failed; a second run was inadvertently started before corrections. It was stopped immediately (three passed, one interrupted, 48 not run, 9.7s). Initial raw JSON was overwritten; initial failure traces/screenshots remain under `/private/tmp/arena-p5-compatibility-initial`. Counts/limitations are preserved in `P5_COMPATIBILITY_PREFLIGHTS.json`; second interrupted JSON in `P5_COMPATIBILITY_SETUP_ABORT.json`. Neither interrupted attempt is acceptance or an automatic retry.

The final config roots the report correctly and clears Desktop-device userAgent overrides: installed browser's actual version/UA is recorded rather than a preset UA that claimed Windows Chrome151 on macOS Chrome155. Initial preset metadata is not actual-platform evidence. Source frozen during each run; no dependency upgrades or runtime changes.

A third attempt passed ten Chrome cases and was interrupted at the first resized settings click (1.7 minutes). Trace records x=984 computed from a stale 1,280px canvas while the viewport had become 900px; HTML correctly intercepted the out-of-viewport click. The test now waits for the displayed canvas width to equal 900 before calculating pointer coordinates. Assertions and runtime are unchanged. Raw interrupted report: `P5_COMPATIBILITY_RESIZE_ABORT.json`; local trace backup `/private/tmp/arena-p5-compatibility-resize`. No automatic retries.

## Accepted results and limits

Final focused run: **52 passed / zero failed / zero skipped / zero flaky**, **295,298 ms (4.9 min)**, start 2026-10-19 01:58:32 UTC. One worker, zero retries. Raw result: [P5_COMPATIBILITY_RESULTS.json](P5_COMPATIBILITY_RESULTS.json). [Summary](P5_COMPATIBILITY_SUMMARY.json) retains environment snapshots, source/raw hashes and final guard-check results.

| Browser actually executed | Initial viewport/DPR | Reported renderer | Result |
| --- | --- | --- | --- |
| Installed Google Chrome 155.0.8059.85 | 1280×720 / 1 | WebGL1, ANGLE Metal Apple M5 Pro | 13 pass |
| Pinned Chromium 151.0.7922.34 | 1280×720 / 1 | WebGL1, ANGLE Vulkan SwiftShader software | 13 pass |
| Playwright Firefox 153.0 | 1280×720 / 1 | WebGL; reports “Apple M1, or similar” (privacy/generalized GPU string, not actual M1 hardware proof) | 13 pass |
| Playwright WebKit 26.5 | 1280×720 / 2 | WebGL; reports “Apple GPU” | 13 pass |

All execute on Apple M5 Pro / 48 GiB, macOS Darwin 25.5.0 arm64, headless, test mode. Native installed Chrome user agent is preserved; engine version alone does not establish a current/previous stable branded-release pass. Firefox/WebKit downloaded the browsers matching the existing Playwright pin; package/lock/dependencies were unchanged. All four environment probes report actual AudioContext close promise completion and `closed`; initial autoplay state varies by engine. These are simple capability probes, not another in-flight service-audio or native visibility campaign.

Both-theme isolated Canvas lifecycle assertions reconcile exactly 1,040 XP from 790 merges / 250 collected pickups, three cycles each, one baseline player body and stable display/postupdate counts. After stops: zero bodies/display/timers/tweens/tracked hazards/feedback/queue backlogs/claim IDs and absent scene blur/focus listeners. Main pointer tests preserve frozen paused elapsed/player/statistics and world dimensions; dense-map tests retain 300 live enemies and cap 300, with unchanged damage. No heap, physical-device or production frame-rate claim. Firefox dense-Low and WebKit resized settings screenshots were visually inspected; screenshots remain under Playwright output paths (accepted-run backup `/private/tmp/arena-p5-compatibility-accepted`).

TypeScript then found `configFile` possibly undefined in the new opt-in guard. Add optional chaining only; **four final environment probes pass in 6.6 s**, one worker/zero retries. Separate raw result: [P5_COMPATIBILITY_ENV_FINAL.json](P5_COMPATIBILITY_ENV_FINAL.json). The other six accepted source hashes remain unchanged; summary separates accepted and final source hashes. Ordinary Chromium regression skips this opt-in capability probe; skip is not compatibility acceptance.

Final `typecheck`, **488 units / 57 files**, lint, build and whitespace pass. Existing large-Phaser-chunk advisory remains. Runtime asset filenames unchanged. Startup/production browser guards were not repeated because their boundaries did not change. No full-app regression/stress, long campaign, dependency audit/balance or workflow run. Those deferred checks are not labelled passed.

## Remaining P5 acceptance

Selected scope is now established; do not ask the owner to choose the list again. Still pending: actual Safari and Edge releases, current/previous branded release coverage where only engine builds ran, Windows/Linux platform combinations, and the physical older integrated-GPU target. No older hardware is connected/available in this workspace. Obtain a device/session or owner-run captured results for the selected missing combinations. Prior Linux Chromium CI remains historical evidence for `03965ef` only.

P5 remains open with this substantive cross-engine slice accepted. P6/content remain gated; no implicit gate revision. Do not rerun accepted Chromium/native/long work for progress. Successor: [Session 12 / P5](../SESSION_12_PROMPT.md).
