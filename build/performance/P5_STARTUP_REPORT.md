> Historical evidence at its recorded revision/date. Old “current”, “next” and
> unchecked gates below are not the live work queue. See [current status](../BUILD_STATUS.md)
> and the remaining-work audit; later owner waivers/corrections supersede old status.

# P5 / Session 7 — startup and recovery

Affected startup gate: **verified locally, 2026-10-15**. P5 overall remains open
for consolidated lifecycle and broader compatibility acceptance. P6 and optional
content have not started. Starting source: `8b700d9` on `codex/v0.4.3`.
Delivery is local only; no push, PR or CI trigger.

## Demonstrated failures and correction

The baseline production probe records two startup defects:

- Denying canvas contexts causes two uncaught Phaser dependency errors before
  the entry's existing construction catch runs. No recovery screen appears.
- Aborting the declared atlas image still reaches the title screen, with no
  failure screen. Entering play would use unresolved declared art.

`main.ts` now checks the 2D canvas support required for text and awaits the
Game-start module inside its recovery boundary. This catches dependency fetch/
initialization errors as well as construction errors. BootScene records the first
loader network error and stops transition; an owned failure event schedules Game
destruction on its next step and displays recovery. Error details use textContent.
Both theme packs own/validate graphics instructions and the native reload button.
The reload actually reaches a run after the blocked atlas/module is available.

The dynamic boundary is required by observed failure recovery. It is not a
loading optimization: all game code is still required, and no startup-speed
improvement is claimed. No arbitrary Phaser split, manual chunks, service worker,
sprite loading/packing/resolution change, art, tuning, persistence or dependency
update. The existing WebGL→Canvas selection is preserved.

## Measurement method and limits

Opt-in collector: `scripts/performance-startup.ts`, served from the production
build by an owned preview server on 4174. One Chromium process, serial contexts,
no retries or overlapping suites. Apple M5 Pro / 48 GiB, macOS/Darwin 25.5.0,
Chromium 151.0.7922.34, ANGLE/Vulkan SwiftShader software WebGL. Default viewport
1280×720 / DPR 1; fallback/failure and slower-network checks use 900×600.
No representative older hardware or additional browser is implied.

Production excludes both the game test facade and Phaser's debug global. The
collector injects browser rendering/text/upload observers, with no observer or
writable test hook shipped in dist. Menu/run markers are the first on-screen
render call after title/HUD text construction. They are navigation-relative
JavaScript milestones, **not compositor presentation timestamps**. Input-to-run
subtracts the actual Enter event; navigation-to-run also includes the intentional
poll/input delay. These markers establish rendered startup transitions with
observer overhead, not exact time a human sees a fully painted interactive frame.

Cold means a fresh context and cleared HTTP cache, with the same browser process;
OS, GPU, JIT and process caches are not reset. Warm reload uses the same context.
ResourceTiming reports response/decompression byte counts and transfer endpoints;
its decodedBodySize is not image decoding. Texture counts are observed WebGL
bindings/uploads through the first run sample, including built-ins and generated
text, not a count of authored sprite assets. CPU upload spans exclude async GPU
work. A separate CDP trace reports image-decode scopes and cache housekeeping by
name; complete spans may overlap/nest across threads and are not critical-path
or GPU time. No browser frame-rate threshold gates these checks.

## All final cold/warm samples

| Sample | Menu draw ms | Enter→run draw ms | WebGL upload calls / distinct bindings | Upload call CPU ms |
| --- | ---: | ---: | ---: | ---: |
| cold 1 | 242.6 | 18.9 | 187 / 156 | 12.3 |
| warm 1 | 134.9 | 12.0 | 187 / 156 | 9.6 |
| cold 2 | 115.8 | 19.3 | 187 / 156 | 11.6 |
| warm 2 | 140.1 | 12.0 | 187 / 156 | 10.6 |
| cold 3 | 117.9 | 19.1 | 187 / 156 | 12.4 |
| warm 3 | 133.6 | 12.1 | 187 / 156 | 10.0 |

Do not select only the fast repeats or assume warm is always faster. Cold median
117.9 ms vs warm 134.9 ms reflects the scope/variation above, not a cold-cache
advantage. The single baseline pair was 244.0 / 141.6 ms; it establishes a working
baseline and failure reproduction, not a matched speed comparison.

Cold relevant JS/PNG/JSON resources transfer **405,481 bytes**, with 403,681
encoded body bytes. Warm transfers **1,800 bytes** with cache/revalidation effects;
per-resource raw values are retained. The local preview serves compressed content;
these values do not establish deployment/CDN/network behavior. Game-needed built
JS remains about **1.678 MB uncompressed** across entry/shared/start chunks; the
1,618.72 kB / 377.49 kB gzip start-game chunk still produces the existing size
advisory. The small entry does not mean Phaser's cost disappeared.

A 100 ms latency / 200,000 bytes/s download probe reaches the title/run markers
at **2,579.7 / 2,724.0 ms**, with Enter→run 18.7 ms. This is one bounded emulated
network case, not network/device acceptance. The refined separate decode probe
captures six `Decode Image` complete spans totaling **0.384 ms**, plus 27 decode
cache-maintenance spans totaling 0.010 ms. Summed scope time is not elapsed decode
latency. The earlier aggregate trace remains in the primary sample set; the
separate refined probe distinguishes actual decode from cache housekeeping.

## Correctness and recovery evidence

The final bounded production collector passes three cold/warm pairs, forced
Canvas startup/run, unsupported graphics, blocked atlas, blocked Game module,
both real reload-to-run retries, the slower-network case and separate decode
observations. Forced Canvas reaches title/run markers at 83.4 / 103.9 ms with no
WebGL uploads; this verifies fallback wiring, not Canvas performance superiority.
Every successful page has no page errors and no production test interface.
Expected failures have a fitted native reload control and no uncaught page error.
Recovery screenshots at 900×600 were inspected; paths are in the local scratch
folder `/private/tmp/arena-p5-startup-session/`.

The existing production guard also passes emitted-code exclusion, boot/play/
pause, sprite-browser stats and architecture navigation, with zero errors. One
existing test-mode boot/resize case verifies the asynchronous entry still installs
telemetry, starts one canvas and preserves logical/world dimensions on resize.
Both-theme deterministic tests cover required recovery copy, safe error rendering,
reload action, failure before importing Phaser, rejected dependency import,
loader failure/reset and exactly-once asynchronous destruction/report ordering.

| Executed check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm test -- --run` | **474 tests / 56 files pass** |
| `npm run lint` | Pass |
| `npm run build` | Pass; existing chunk advisory |
| `npm run test:e2e -- tests/e2e/boot.spec.ts --workers=1 --retries=0` | **1 pass**, 1.4 s total |
| `npm run check:production -- build/performance/P5_STARTUP_PRODUCTION_CHECK.json` | Pass, zero errors |
| primary startup collector (`--pairs 3 --verify --slow --decode`) | Pass, all cases serial |
| final focus-style build (`--pairs 0 --verify`) | Pass, fallback/failure/retry paths and final emitted hashes |
| refined decode-only collector (`--pairs 0 --normal-only --decode`) | Pass |
| production bundle hash comparison / whitespace / preservation | Pass |

Raw records: `P5_STARTUP_BEFORE.json`, `P5_STARTUP_SAMPLES.json`,
`P5_STARTUP_DECODE.json`, `P5_STARTUP_PRODUCTION_CHECK.json`, and
`P5_STARTUP_FINAL_CHECK.json`. Primary timings are pinned to their recorded
bundle hashes. Final review changed only the focus-ring CSS to inherit currentColor;
Vite consequently changed CSS/JS asset filenames. A final bounded fallback/failure/
retry check passes on that build, and its recorded JS hashes match current dist.
The timing campaign was not repeated for that focus-only change. No source edits occurred during a production probe. Initial collector attempts
failed because a debug global was absent and because the actual renderer uses
drawArrays, not drawElements. Neither is a passing game result. Initial unit/lint
harness repairs supplied a test window for the successful boot branch and removed
unnecessary quote escapes; assertions were preserved. No automatic retry hides a
failure.

Reproduce after `npm run build`:

```sh
npx vite-node scripts/performance-startup.ts --pairs 3 --verify --slow --decode --output /private/tmp/p5-startup.json
npm run test:e2e -- tests/e2e/boot.spec.ts --workers=1 --retries=0
npm run check:production -- /private/tmp/p5-production.json
```

## Deferred acceptance and handoff

P5 overall is still open. Full local `test:e2e:ci -- --workers=1 --retries=0`,
`test:e2e:stress -- --workers=1`, authored/overtime/long lifecycle and ten terminal
restart cycles, real focus/visibility catch-up, sustained settings/resize/mode
switching and broader browser/device compatibility remain pending under the
owner resource policy. The next eligible work is consolidated remaining P5
acceptance, then P6; no dependent content starts here.

This recovery specifically covers unavailable text-canvas contexts, dependency
fetch/initialization and loader network failures. Malformed atlas/JSON processing
errors, WebGL context loss after boot, initial HTML/entry delivery failure and
full browser/renderer matrices are not claimed covered. Do not infer generic
catch-all handling from these focused cases. Physical older-device and sustained
300-live mixed-combat acceptance remain pending.

Session start: **2026-10-15 15:06:48 AEDT / 04:06:48 UTC**. Original 90-minute
checkpoint: **16:36:48 AEDT / 05:36:48 UTC**. Startup implementation and checks
finished before interruption; the user requested continuation and handoff resumed
at **16:39:56 AEDT / 05:39:56 UTC**. Wall elapsed includes that interruption;
active work time is not inferred from it. Final recording is in
AUTONOMOUS_PROGRESS.md. Original eight dirty plans and three prompts remain
unstaged; backups are under `/private/tmp/arena-p5-startup-session/`.
