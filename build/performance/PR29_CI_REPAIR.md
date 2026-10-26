# PR29 CI repair —2026-10-26

Failed [run40245699120](https://github.com/PDVersion/Arena-Survivor/actions/runs/40245699120)
on b861e8c:135browser passes,6existing skips,13failures; audit step skipped after
browser failure. PR: [29](https://github.com/PDVersion/Arena-Survivor/pull/29).
Owner explicitly authorizes diagnosis, fixes and push to the same PR.

## Causes and repair

| Failures | Cause | Correction |
| --- | --- | --- |
|7 settings/menu cases|Old fixed row centres no longer matched seven settings and quit footer|Read actual setting/save target centres from existing test-only telemetry; pointer helper clicks by stable setting key|
|2 G4 cases|Fixed10enemy count,10pages and Can page9|Expected count/page iteration from configured theme; locate Can by stable ID|
|2 sprite cases|Fixed6cards and2atlas-only requests|Declared sprite map defines exact card count and deduplicated expected atlas/standalone resource paths|
|1 elite case|First enemy assumed fragmentation-capable, now cup|Choose neutral swarm_basic role explicitly, retain exact split/offspring/reward/ledger assertions|
|1 clearing case|Stationary cup stays beyond short tool reach and can kill the unmoving mode fixture|Spawn mode-test enemies within reach; retain real enemies/clearing/no-arrival/complete/restart assertions; real ranged attacks covered separately|

Settings points come from the rendered PauseMenuUi hit rectangles and existing
UI_SCALE transform, not duplicated layout arithmetic. They are published only
inside existing MODE=test scene telemetry; helpers do not invoke setting actions
or mutate settings. Menu/run, resize and save-management pointer paths are real.
Read-only inspection adds no new controls, saved field or gameplay behavior.

Initial local focused run:9pass/4fail. The remaining failures revealed rapid Tab
presses sharing a single update frame, a remaining fixed Can page index and an
impossible elapsed-time wait after early clearing completion. Synchronize on each
observed tab; resolve Can ID/page dynamically; stop the clearing observation wait
on terminal state and still require complete, zero enemies, correct title/restart.
No timeout/retry increases, skipped assertions or frozen-theme edits.

## Final scoped evidence

- All13unique formerly failed eco/generic cases pass cumulatively, serially with
  one worker and zero retries:9 in the first run and the corrected4 in12.3s.
  No repeat of the nine unchanged passing cases or full heavy local suite.
-719units/75files, explicit typecheck, lint, production build and whitespace pass.
  Existing bundle-size advisory remains. No dependency/art/tuning/save change.
- Production diagnostic guard/start/play/pause, sprite inspector and navigation
  pass with zero errors; [current scoped JSON](PR29_PRODUCTION_CHECK.json).
  Earlier sandboxed Chromium launch failed with macOS permission denial before
  browser assertions; serial escalated check passes. Historical P1 JSON restored.
- npm audit --audit-level=high exits0 with two existing moderate Vitest/mocker
  findings; no pin change or bypass. No zero-vulnerability claim.
- Owned4173/4174listeners are cleaned. Generic fixtures may read the frozen pack;
  no new knight campaign/content is selected. No sprite promotion or device pass.

Repair is committed/pushed through the existing PR. Automatic full PR CI must
verify the new head; the old failed run is not superseded by local tests alone.
External Safari/browser-OS/older physical integrated-GPU checks remain waived/
unverified. Overall V0.4.4 art/integration and owner acceptance remain open.
