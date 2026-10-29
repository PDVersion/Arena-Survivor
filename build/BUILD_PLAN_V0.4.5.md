# V0.4.5 — current handoff

All currently selected phases1–7 are implemented and locally verified. No active
phase/art claim remains. Original bounded claims, implementation results and
checks moved to the [master build log](MASTER_BUILD_PLAN.md#v0-4-5), including
[Elite guide/document audit](MASTER_BUILD_PLAN.md#elite-guide-doc-audit).

Current [status](BUILD_STATUS.md),[product](PLAN.md),[tuning/playthrough report](content/MONEY_TOOLS_SANDBOX_REPORT.md)
and [handoff](NEXT_READABLE_GAMEPLAY_HANDOFF.md) carry the live result. Overall
V0.4 owner acceptance, consolidated regression/fixture reconciliation/current-head
CI remain open; PR delivery was selected2026-10-29. External device/browser gaps retain their
waiver and remain unverified. Local completion is not deployment.

Unbuilt proposed work is listed in [REMAINING_WORK](REMAINING_WORK.md), separately
from built-but-unverified acceptance. A new owner selection needs a bounded phase
claim before code/generation. No paused-theme work, passive-system redesign follows from this handoff. Completed progression research is included as a dated
proposal; its old source snapshot is not current tuning authority.

## PR delivery — 2026-10-29

Owner selected a PR into `main` with all completed branch work. Bounded ownership:
Git/PR metadata, current status/handoff/master/reconciliation, and the completed
progression research/retired prompt. No runtime, tuning, art, frozen-pack or save
change. Remote inspection: main is an ancestor,23 completed commits ahead before
this delivery record; no existing PR. Quick gates passed:743unit tests/81files,
types, lint, build,34sprite sheets and whitespace. Existing bundle-size advisory
remains. Full browser regression is delegated to PR CI; obsolete fixtures may
need reconciliation. Stress/soak/external checks and overall owner acceptance
remain open. No merge or deployment. Completed claim recorded in the master.

## PR30 CI repair — claimed2026-10-29

Owner requests diagnosing/fixing failed Actions and pushing the same PR. Initial
run40825861165 on517f420 fails only sprite-pipeline exact-atlas comparison at the
5s unit timeout (742other tests pass); subsequent steps were not reached.
Bounded ownership: sprite verification assertions, failed eco/generic browser
fixtures and read-only test telemetry only if later CI evidence requires it;
status/progress/master/reconciliation and CI repair evidence. Preserve exact
assertions; no timeout/retry increases, skips, tuning/art/save or frozen-pack
changes. Use native byte equality for PNG buffers/rows instead of generic deep
comparisons. Gates: focused sprites then fullunits/types/lint/build/sprite checks;
necessary failed browser cases serially, full regression in Actions. Inspect
matching-head CI and fix observed follow-up failures before closing repair.

Bounded fixture follow-up now locally verified:21distinct cases cumulatively,
serial/zero retries; lint/types/whitespace and audit high gate pass. Q6's retired
cone fixture is preserved in build/history; replacement aura coverage retains
actual level/range/tick/ledger assertions. See performance/PR30_CI_REPAIR.md.
Push this repair while the preceding Actions campaign completes; full CI is
still pending, not claimed passed.

### Evidence-based repair extension — claimed2026-10-29 before runtime edits

Superseded run40828495077 canceled after its logs identified more stale fixtures;
latest c95d6f5 campaign continues. Local failures expose two actual bugs: material
pool RNG is evaluated once per find predicate (can find no valid child and crash
a boss kill), and difficulty scales outer weapon data but seven-level/cleanup
resolution overwrites it with unscaled nested data. Own run-scene.ts single-draw
fragment lookup, difficulty resolver nested authored numeric scaling, associated
unit/browser regressions, read-only test roster/telemetry if needed, failed
roster/director/progression/shrine/lifecycle/sprite-browser/boss fixtures and
repair records. No new mechanic/tuning literal/art/save/frozen-pack edits.
Gate: meaningful seeded mixed-pool boss regression and all-level difficulty
resolver units, fullunits/types/lint/build/production guard, only affected serial
browser cases, then matching-head full Actions. No timeout/retry increases/skips.

Runtime extension locally verified:744units plus final24diagnostic seam units,
types/lint/build/34sprite sheets/production guard and cumulative41distinct focused
browser cases pass. See REC-143 and performance/PR30_CI_REPAIR.md. Push the bounded
repair; current-head full Actions remains pending, no merge/deployment.

## Hosted-renderer timing follow-up — 2026-10-29

Completed run40830296454/c95d6f5 reports136passes/6existing opt-in skips/20failures
and1flaky contact case. The runtime/fixture repair169c17f addresses18failures;
the last two are the1.5s wall-window gait sample and monolithic sandbox30s test.
Bounded follow-up owns sprites.spec.ts, testing-area-v045.spec.ts and
phase-three.spec.ts plus these records. Use a controlled RAF clock with real
physics/input/rendering to observe all4walk poses; split sandbox money/isolation,
active-clock/lag and tree/mixed-combat into3independent cases, retaining assertions.
Contact validation keeps its successful immunity/health snapshot atomically,
rather than re-reading after the active-wall immunity window may expire.
No increased test timeout/retries, new skips or gameplay changes.5focused cases
pass serially/zero retries (28.6s total), types/lint/whitespace pass. Earlier
744units/build/production evidence remains unchanged. Push and inspect final-head
CI; full current-head browser/audit acceptance remains pending until it completes.

## Observed intermittent input/reward follow-up — 2026-10-29

Run40832103795/169c17f reports153passes/6existing opt-in skips/2timing failures
(already addressed by b7e8e98) and2flaky paths: paused difficulty navigation lost a
zero-duration Tab press; the surge reward fixture had no in-reach kills within
its fixed wall window. Own difficulty-v043.spec.ts and phase-six.spec.ts plus
repair records. Hold Tab/choice keys until their real game result is observed,
then release in finally; place scripted surge enemies within reach instead of
waiting on slow-runner travel. Keep real damage, provenance, exact rewards,
100arrivals and restart assertions.2focused cases pass serial/zero retries (7.5s),
types/lint/whitespace pass. No source/tuning/art/save changes, increased limits or
new skips. Push final fixture follow-up; matching-head full CI remains pending.

## Completed-run trace follow-up — claimed 2026-10-30

Run40834008030/7559741 is fully completed:156passes,2sandbox timeouts,1menu
retry pass,6existing opt-in skips. Saved traces measure native checkbox setup
at~3.2s each and pointer clicks at~2s, exhausting the unchanged30s sandbox
budget before assertions. Own only testing-area-v045.spec.ts, interface-work.spec.ts
and repair/status/master/reconciliation records. Batch sandbox fixture checkbox
and field setup through existing DOM change handlers; retain native tree/root,
spawn/resume/clear actions and all gameplay/save assertions. Hold the confirmed
flaky menu Tab until consumed. No runtime edits, timeout/retry increases, new
skips or frozen theme changes. Gate:3affected cases serially/zero retries,
types/lint/whitespace. Push once; wait for the entire new CI run before further
repairs. Earlier remote runs are completed and will not be canceled.

## Completed-run trace repair — 2026-10-30

Fully completed run40834008030 (7559741):156passed,2failed sandbox cases,
1menu retry pass,6existing opt-in skips. Downloaded browser-failures traces
show~3.2s per native checkbox and~2s per pointer click;30s expired during
fixture setup, not a failed gameplay assertion. Sandbox loadout/spawn setup
now batches existing DOM change handlers, re-querying rebuilt checkbox nodes.
Native upgrade/root clicks, spawn/resume/clear, exact actor count, bounded field,
clock, screenshot, save isolation and error assertions remain. Menu Tab stays
held until the observed tab changes, then releases in finally. This is fixture
setup coverage; it does not claim native checkbox pointer coverage in these two
cases. Other sandbox checkbox interactions remain unchanged. No runtime,
art/tuning/save/frozen-pack edits, increased limits/retries or new skips.

3affected cases pass serially/zero retries (15.2s); types/lint/whitespace pass.
744unit and prior production evidence are unchanged historical checks; this
test-only batch relies on the upcoming full Actions run for fresh full gates.
Push once, then wait until that matching-head run fully completes before any
further repair. No remote runs canceled or concurrent repair pushes.
