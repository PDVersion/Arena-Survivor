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


## Matching-head continuation — a87f57f / run39528406842

The first repair run passes116browser cases with6explicit skips and no flaky
tests, but both C3 cases now reach a later dense-load poll and fail. They advance
only258–275 simulation-ms in10 wall-seconds, below the unchanged1000ms target.
The seed-pool, shrine, frame-input, profile and evolved-tool corrections all pass.
Audit is again skipped because the browser step fails; local audit remains0.

Apply the same existing90-second simulation-progress budget and120-second test
bound to the two C3 cases. Keep the259000 elapsed target,300cap, unchanged world,
reward and reset assertions. No new skip/retry/renderer/gameplay change.
Two affected cases pass once locally in12.5s, one worker/zero retries; final types,
affected lint and diff checks pass. Full software/build/audit gates from a87f57f
remain valid for this test-timeout-only follow-up. Current-head remote CI must run
again; report its final result in the PR without manufacturing an evidence commit.


## Second matching-head continuation — df75471 / run39531764460

Both C3 cases now pass remotely. This run reports115passes/6skips/1flaky and
2failures: the existing450-actor benchmark times out waiting30s for completion,
and the Horde reward test expects4.5936XP but observes3.9816. The short interaction
terminal also needs a retry after its15s completion wait. Audit remains skipped.

Claim the newly affected capacity-probe/phase-four-v02 specs before editing.
Use90s bounded simulation-completion waits,240s total for the benchmark's two
complete runs and120s for the interaction terminal. Hold restart until generation
changes and release in finally. All exact450population/origin and queue/stat reset
assertions remain. No test is skipped and no retries are added.

The Horde fixture's second Space interaction can change Chaos/reward scaling
after some tagged enemies already spawn. Rewards retain spawn-time modifiers,
so current-world multipliers cannot retrospectively price the mixed cohort. Move
the second interaction after exact reward assertions, retaining stable single-
activation spawn conditions. Then explicitly assert the surge still has exactly
one activation and100scheduled arrivals. No gameplay reward code is changed.

Three affected cases pass once locally17.9s, one worker/zero retries, six-minute
global bound. Types/affected lint/diff pass. Prior full655units/build/audit0 remain
valid for this test-only follow-up; no whole local campaign repeated. Report final
CI honestly: another exact-head full run is required after publication and is not
yet passed. The90-minute session budget ends03:02:46UTC; a full33–36minute Actions
run may outlast it. No merge, deployment, Q6 completion or external acceptance.
