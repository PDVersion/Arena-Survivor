# P6 — physical device and branded-browser checklist

This checklist records evidence; it does not waive P5 or certify a device from an engine test. The owner confirmed on 2026-10-19 that no older device is available. Physical older integrated-GPU acceptance is **pending**.

## Reproduce and retain a portable artifact

On the development checkout, run `npx vite-node scripts/build-device-pack.ts`.
The instrumented pack is emitted under `test-results/p6-device-pack`, separate from production `dist`. Copy the whole folder to the target. With Node.js 20+ installed, run `node serve.mjs` and open `http://127.0.0.1:4180` in the actual browser. No npm install, account or external network is needed on the target. Server binds loopback and refuses an occupied port; Ctrl+C stops it.

The recorder exports its actual iframe viewport, which is smaller than the monitor/browser window; do not label that a full-window production viewport. Open `http://127.0.0.1:4180/index.html?frameMeasure=1` for separate full-window manual play.

The manifest records revision, tracked-diff digest, pending-file names and artifact SHA-256 values. Retain the whole pack/manifest alongside exported captures. Captures include that identity. This is an instrumented test build; do not deploy it as production or compare its timings directly to uninstrumented production without a matched control.

## Selected targets

- Current and previous-major Chrome/Edge/Firefox on vendor-supported Windows 11; Chrome/Edge/Firefox/Safari on vendor-supported macOS; Chrome/Firefox on vendor-supported desktop Linux.
- Representative older laptop: physical Intel UHD 620/630-class or comparable older integrated GPU, 8 GiB memory, 1920×1080, hardware acceleration enabled. Record actual model, OS, driver version, plugged-in/battery state and power mode. Do not accept a generic renderer string as proof of exact hardware.
- Keyboard/mouse, WebGL/WebAudio; Default and Low. Mobile/touch is outside the selected desktop contract. Existing viewport emulation is not physical-device evidence.

## Capture procedure

1. Record browser name/version/channel, OS/version, physical CPU/GPU/memory, graphics driver and power mode. Confirm hardware acceleration and the exported actual renderer. Retain unexpected software fallback as a limitation, not older-GPU success.
2. For each 60/150/300 aided benchmark, select Default in the actual game Settings and record three independent windows; repeat in Low. The recorder waits for ten seconds of active warmup, then observes a sixty-second wall window, with a three-minute bound. Focus the iframe after starting. Keep the page visible. Pauses, choices, interruptions and actual populations remain visible in the evidence; they cannot be silently excluded to claim continuous play.
3. Download each JSON with a unique device/browser/quality/load/repeat filename. Check source identity, actual quality, live count, sample counts, duration, hidden/non-playing counts, p95/p99/max and >100ms intervals. The recorder uses browser rAF spacing; it does not measure GPU time or whole-engine CPU. Its differences between telemetry elapsed snapshots are not engine frame deltas. Distributions retain at most 16,384 accepted samples. There is no automatic pass/fail or GC/leak inference.
4. Play an ordinary run with contact/hazards enabled. Choose upgrades naturally, move, pause/resume, change Default/Low while paused, resize, reach an actual authored ending and restart. Record whether survival/ending is unassisted; report death honestly rather than replacing it with invulnerability. Aided crowd timings do not replace playable evidence.
5. Make one real tab/window transition during active play and while an overlay is held. Observe visibility/focus behavior and retained intent; native acceptance needs trusted events/capture, not emulated focus or overwritten properties. The portable wrapper alone is not that native-event proof.
6. Check real audio onset/stop/mute and replay after a user gesture. In-flight WebAudio service shutdown/close evidence from Session10 is scoped to its browser; simple AudioContext construction/close is only a capability probe.
7. Stop the server/browser sessions you started. Preserve browser errors, failed captures, artifact hashes and notes. Leave unknown services alone.

## Review criteria

The active plan's provisional targets are desktop wall p95 ≤20ms; older-device/worst supported 300-load p95 ≤40ms; >100ms intervals below 1%, with p99/max also reported. Compare like mode/renderer/scenario/quality/sample controls. Thresholds are not required CI assertions and are not established by M5 or SwiftShader observations. Exact actor/body/listener/timer/queue/reward ownership comes from the lifecycle fixtures and actual device follow-up; read-only telemetry is not a complete heap/object census.

Missing target rows remain pending until actual evidence is reviewed, or the owner explicitly revises the acceptance gate. Current/previous release coverage must use the actual branded build; Playwright's patched engine version is complementary, not proof of a Safari/Firefox stable application pass.
