# PR #24 Actions repair — 2026-10-13

Captured failed runs:
[233541e](https://github.com/PDVersion/Arena-Survivor/actions/runs/38319851611),
[dae5570](https://github.com/PDVersion/Arena-Survivor/actions/runs/38319758936).
Both stop at browser verification, so their audit step is skipped. Both runs have four failures and two flaky level-up cases. Neither is a passing gate.

| Failure | Observed CI evidence | Correction |
| --- | --- | --- |
| Walk-through movement | Five wall seconds moved ~37–47 units; expected >150 | Retain the distance/solid-resolution assertions, allow bounded 30 s |
| Quiet bottle unlock | 20 wall seconds reached .068–.079 progress; expected >.12 | Use an 8-second authored test run and 90 s simulation-transition budget; retain role/wave assertions |
| Collection Sweep | No completed sweep in 15 wall seconds | 90 s bounded wait, unchanged eight-attack/hit/projectile assertions |
| Upgrade layout | Linux cannot write `/private/tmp/arena-q3-upgrade-layout.png` | `testInfo.outputPath`, preserving real measured layout/pointer checks |
| Flaky level-up | Natural spawn/travel did not reach level-up in 35 wall seconds | Theme-derived close-arrival fixture that supplies the actual first XP threshold; real kills, rewards, choices and application |

An additional local crowd check reproduced three transient near-coincidences
against an arbitrary ceiling of two. The metric counts distances <0.5 units,
not persistent pair identities. The separation fixture now retains all 200
actors with weapons disabled and requires repeated bounded recovery to zero;
compound combat/ledger assertions remain in their separate path. Three repeated
cold/warm checks pass; production separation and balance values are not changed.

Dependency remediation is now explicitly authorized by the owner’s CI request:
Vitest 3.2.7 → 4.1.11, typescript-eslint 8.22.0 → 8.71.2, brace-expansion
1.1.18 → 1.1.21 and source-map-js 1.2.1 → 1.2.2; the new lint dependency tree
also selects brace-expansion 5.0.12. Tinypool and the vulnerable mocker version
are removed/replaced. Phaser, Vite, vite-node and TypeScript stay at their prior
versions. Exact versions/engines were inspected from npm; [Vitest v4 migration
requirements](https://v4.vitest.dev/guide/migration.html) support this project's
Node 20 / Vite 6 combination. No force install or audit exclusion is used.

Normal `npm ci` succeeds, and [the audit](Q5_AUDIT.json) reports **zero
vulnerabilities**, resolving the historical [Q4 audit blocker](Q4_AUDIT.md).
Types/lint, all 428 units and build pass. The production game/shared/tool asset
hashes remain the Q4 hashes. Balance and counterfactual script JSON exactly
match Q4's accepted reports. Full `CI=1 npm run test:e2e:ci -- --retries=0`:
**85 pass / one existing opt-in skip**, 8.5 min, one worker, source frozen.

Final serial stress: **3 pass**, 33.9 s. Instrumented short stress averages /
maxima / peak visible counts are Beginner 37.65 / 125.1 ms / 288, Normal
32.85 / 42.1 ms / 288, Experienced 32.51 / 43.2 ms / 298. The 125.1 ms interval
is retained; these software-rendered correctness checks do not establish
performance acceptance. Production and remote verification are recorded in
progress and PR checks. Workflow failure diagnostics now upload `test-results/` for seven
days; future Linux failures retain portable screenshot/trace evidence.
No performance improvement or older-device acceptance is claimed. P2–P6 remain
unstarted; this is a CI repair within the existing draft checkpoint PR.

Remote gate: repair head `28ecdba91462fdf059f1deb3c75652fea09c4ca5` passes
[Actions run 38332255864](https://github.com/PDVersion/Arena-Survivor/actions/runs/38332255864),
started **2026-10-13 01:27:58 UTC**, completed **01:43:02 UTC** (15 min 4 s).
All verification steps pass: clean install, types, **428 units / 51 files**, lint,
build, **85 browsers / one existing skip** (14.0 min), and audit with **zero
vulnerabilities**. No browser flaky/retry results. Q5 is verified; P2 remains
unstarted, and the checkpoint PR remains draft pending P2–P6 readiness. The
verification-record follow-up must still pass its own latest-head Actions check.
