# PR30 CI repair — 2026-10-29

Owner selected repair of failed Actions on the existing `codex/v0.4.5` PR.

## Initial failure and verified unit repair

Run40825861165 on517f420 failed only the exact-atlas unit assertion at5s;742other
units passed. Later lint/build/browser/audit steps were not reached. Commitd43d6e6
uses native byte equality for selected/accepted PNG files and every RGBA atlas
row, retaining lengths, counts, frame dimensions and bounds. No timeouts/retries
or pixel coverage changed. Focused7tests passed in556ms total, full743units in
1.78s locally; types/lint/build/34sprite sheets passed. Subsequent Actions
run40828495077 passes all units/types/lint/build and reaches full browser testing.

## Active-content fixture reconciliation

Focused serial local reproduction identified assumptions predating owner changes:

- Group fixture expected three Cigarettes at25% and primitive-only views. Resolve
  the actual clustered definition/role (Eco Microplastics at28%), retain capacity
  backlog/admission/duplicate-lethal checks, exact reward arithmetic and actual
  sprite/primitive views. Outside controls must use different enemy identities.
- Wrapper fixture expected a committed gust removed by owner direction. Replace
  Eco's two gust cases with two airborne pursuit cases: introduction retention,
  overlap with grounded glass, continuous retargeting, no old cue, exact lethal
  ledger and delayed corpse disposal. Preserve existing frozen-pack gust cases.
- Can/group interception used the retired cone dispatcher. Eco now drives the
  real aura scheduler at authored tick times with outside controls beyond range;
  preserved generic legacy packs retain their original path. Death sprites live
  for the authored220ms after actor removal; disposal checks wait for that hold,
  while duplicate-lethal ledger snapshots are compared at the same instant.
- Fixed-card and low-mode review fixtures referenced removed Cyclone offers.
  Exercise the Vacuum's fixed level step and Cleaning Bin contribution instead.
- Q6 cone selection/fade campaign is preserved in `build/history/` and replaced
  with real aura scheduler tests for all seven actually acquired levels: ten
  nearby hits, unaffected outside control, no between-tick entrant damage,
  player-following range and exact damage-breakdown accounting.
- Money's three frames now denote value, not motion/claim state. Presentation
  verifies actual silver→gold→note merges and stable art during pull/claim.
  Current Bin replaces removed evolved-weapon HUD identity.
- Sandbox captures use Playwright output paths instead of macOS-only `/private/tmp`.

Early local iterations exposed stale corpse-disposal/view-count assumptions;
these were corrected before claiming the affected cases passed. No gameplay,
content/tuning, sprite pixels, save data, retries, timeout budgets or frozen theme
files change. Full current-head Actions result remains required; scoped checks
are not a substitute for that result or owner/device/performance acceptance.

## Local follow-up checkpoint

21distinct affected/related Eco or generic cases cumulatively pass, serial1worker/
zero retries: group2, roll2, airborne2, fixed cards2, style2world2, aura1, low
review1, default encounter/review/anchors3, sandbox/shop4, overtime2. Lint/types/
whitespace pass. Audit high gate passes with2existing moderate Vitest findings.
Owned test servers stopped. No full local browser/stress/device pass is claimed.
Full remote matching-head result remains pending at this push.

## Runtime repair and remaining-fixture checkpoint — 2026-10-29

Superseded run40828495077 was canceled to release diagnostics after over20minutes
of browser work; it is partial evidence, not a full failure/pass summary. Its
listed failures were reproduced serially. Two actual runtime defects fixed:
material selection now draws one child ID before lookup (previous changing RNG
inside find could exhaust the list and crash boss kills), and preset scaling
now survives nested authored weapon/cleanup level resolution. No tuning values
changed. Every Eco weapon at all7levels/all3presets is covered; changing-RNG
mini-boss runtime asserts exactly one choice per child and expected material IDs.
The separation-only coincidence diagnostic excludes intentionally airborne actors.

Additional fixtures now follow current idle frames, single-cigarette opening,
late microplastic drift/group waves, proactive money merges, fixed upgrade pool,
clean critical shrine rewards, boss attack summons, nonrecursive paid Bagged
Waste fragments and live-keyboard/fixed-clock aided scenes. Historical Bagged
five-child fixture preserved in build/history. No frozen pack/art/save changes,
new skips, timeout or retry increases. Cumulative41distinct focused cases pass
serially without retries. Full744units/81files pass; final diagnostic seam also
passes24focused architecture/separation units. Types/lint/build/34sprite checks,
whitespace and production guard pass (PR30_PRODUCTION_CHECK.json). Existing
bundle advisory and2moderate audit findings retain prior status. Owned local
servers/browsers cleaned. Matching-head full Actions still required after push;
no overall owner/device/performance acceptance or merge/deployment inferred.
