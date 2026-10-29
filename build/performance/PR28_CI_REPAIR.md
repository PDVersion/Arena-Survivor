> Historical evidence at its recorded revision/date. Old “current”, “next” and
> unchecked gates below are not the live work queue. See [current status](../BUILD_STATUS.md)
> and the remaining-work audit; later owner waivers/corrections supersede old status.

# PR28 — roster-aware browser CI repair

Owner requests repair2026-10-22. Existing PR: https://github.com/PDVersion/Arena-Survivor/pull/28
Failed run: https://github.com/PDVersion/Arena-Survivor/actions/runs/39705612316
Head: `dd30186`. Bounded ownership was claimed in BUILD_PLAN_V0.4.3 before edits.

## Diagnosis and change

Types,703unit tests/74files, lint and build passed remotely. Browser CI reported
138passes/6skips/four failures (all reproduced on its two automatic retries).
Each failure was an exact five-role expectation in enemy-roster, reduced-motion
elite feedback, walk-through contact and sprite loading. The test-only all-roster
harness enumerates every configured non-boss enemy: G2 made that eight.

The four test files now derive expected IDs/counts from activeTheme non-boss
definitions. Roster/contact/sprite checks compare exact positive ID sets, not
minimum counts. The roster test additionally verifies one of every non-boss and
zero of both bosses; reduced-motion checks one elite per expected role. Stationary
Shards frame3, atlas-only resource count, no page errors, displacement/shove,
zero solid resolution and feedback48cap assertions remain. No fixture/runtime,
physics, sprite source, gameplay balance, retry/skip/timeout/workflow change.
The five-child Bagged Waste assertion remains five: family size is not roster size.

## Verification and initial corrections

Final local types,703unit tests/74files, lint, production build and whitespace
pass. Existing bundle-size advisory remains; generated runtime bundle names/sizes
are unchanged. Four affected browser cases pass together in3.8s, one Chromium
worker/zero retries/180s global bound. Playwright owns/cleans its server and
contexts; port4173 has no listener after completion.

Initial typecheck exposed the literal theme union's missing optional boss key;
use an `in` guard. The first browser attempt passed three and failed the roster
object assertion because telemetry pre-seeds bosses at zero. The exact expected
object now includes those zeros; the final four-case run is the passing evidence.

No full heavy local suite is repeated. Push the repair to existing PR28 and wait
for matching-head automatic full CI, pending at this local recording checkpoint.
No audit rerun is necessary for test-only changes; prior threshold pass/two moderate
Vitest findings remain disclosed. No new physical/native/retention evidence;
actual Safari/missing browser-OS/older physical-GPU checks stay waived/unverified.
