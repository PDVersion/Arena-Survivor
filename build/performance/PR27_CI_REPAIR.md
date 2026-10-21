# PR27 Actions repair — 2026-10-21

Base: `5511e86` on `codex/v0.4.3`; failed run39521650366.
Owner explicitly requests fixing the failed PR checks and publishing the repair.
Session start01:32:46UTC /12:32:46AEDT, deadline03:02:46UTC, final20reserve02:42:46UTC.
The active plan claims exact test/dependency/document ownership before edits.
Pre-existing genre/roster roadmap changes and untracked baseline files stay unstaged.

## Observed failure and repair

CI passes install/types/655units/lint/build, then browser regression fails6cases,
reports1flaky/111passed/6skipped over31.3minutes. Audit is skipped after failure.
The separate prior local audit already identifies Vite6.4.3 launch-editor advisories.

- C3 curse seed selection used the full theme catalog; production uses the
  run's unlock-filtered pool after C6. Search seeds against runUpgradePool,
  preserving ordinary pickup/offer selection and all reward/cap assertions.
- C6 terminal expects1000 simulation-ms within a5-second wall poll. Evolved
  300-actor probes reach only416–475 simulation-ms in15 wall-seconds on Actions.
  Keep the same1000/2000 simulation-ms and population/ledger checks, use the
  established90-second simulation-progress budget and120-second test bound.
  These are wiring checks, not runner throughput acceptance; no gameplay rate changes.
- Frame measurement's instantaneous Escape can fall between Phaser frames.
  Hold until paused/resumed telemetry, release in finally; no repeated toggle.
- Horde test intentionally presses Space after E. Space can activate another
  adjacent shrine; feedbackCount counts every shrine. Reproduced2feedback versus
  expected1 locally. Assert surge world activation exactly1, scheduled100, and
  global feedback exactly the number of activated shrine instances. Hold the first
  E until consumed instead of resending it; retain all exact reward checks.
- Pin only Vite6.4.3→6.4.4 and refresh its lock metadata. Vendor npm metadata
  confirms compatible Node engines. Audit now reports0 vulnerabilities. No audit
  exclusions, retries, skips, gameplay/tuning/source changes or unrelated upgrades.

## Verification

- Full655unit tests/67files, typecheck, lint, production build, diff checks pass.
  Build uses Vite6.4.4; existing Phaser chunk warning remains.
- Affected serial browser run:6pass/1fail in36.6s, zero retries. It reproduces the
  global shrine counter mismatch after the first input correction. Corrected shrine
  case then passes once6.7s (7.5s total), one worker, zero retries,60s global bound.
  Seven unique affected cases now pass cumulatively; no whole local suite repeated.
- Initial sandboxed server start fails EPERM before tests; rerun with authorized
  loopback/browser permissions. Owned test servers/browsers close;4213 untouched.
- Full current-head browser/audit gate is delegated to PR Actions after push.
  No remote success is claimed at this recording checkpoint. Preserve failed run
  and exact matching-head evidence separately; PR body will record final status.

No Q6 motion/cone/cap progression, save schema, sprites or new device acceptance.
Actual Safari/platform/older-device evidence remains temporarily waived/unverified.
P5/P6 measurements/device pack remain source-bound. No merge or deployment.
