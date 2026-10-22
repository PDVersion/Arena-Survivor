# G3 — encounter rhythm, optional destinations and readable bosses

Owner explicitly requests execution of PHASE_G3_PROMPT. Date2026-10-22.
Branch `codex/readable-gameplay-g3` from verified G2C `5b50d7b`; clean at claim.
One verified local G3 phase commit; no publication/merge/G4/art implied.

## Exact ownership claimed before code

- Both themes' `director.ts`, `shrines.ts`, boss entries in `enemies.ts`, `copy.ts`.
  Keep existing role stats/weights, weapons, rate/camera/caps and all saved IDs.
- `src/game/core/archetypes/contracts.ts`, `src/game/content/define-theme.ts` for
  optional theme-authored boss warning hold; no tuning literal in scene/systems.
- `src/game/systems/bosses/bosses.ts`, `src/game/scenes/run-scene.ts` only boss
  movement hold and current in-range site preview integration.
- `src/game/systems/codex/describe-shrine.ts`, `src/game/entities/shrine-actor.ts`,
  `src/game/ui/minimap-ui.ts` for current-world preview/destination diamond.
- `src/game/systems/simulation/pacing-simulator.ts` for explicit timed world-only
  choices; `build/content/G3_CAPTURE.ts`, `build/content/G3*` evidence/report.
- `tests/unit/{director/spawn-director,bosses/bosses,shrine/shrine-placement,
  codex/describe-shrine,simulation/pacing-simulator,ui/presentation-quality}.test.ts`,
  new `tests/unit/director/encounter-rhythm.test.ts`, `tests/e2e/g3-encounters.spec.ts`;
  existing `tests/e2e/bosses-v043.spec.ts` only its authored mini threshold fixture.
  Other tests require an explicit extension if a real affected contract emerges.
- This plan/prompt, roadmap, BUILD_STATUS, BUILD_PLAN_V0.4/V0.4.3, PLAN,
  EDUCATION_PIVOT, THEME_ARCHETYPES, ECO_CONTENT_MAP, AUTONOMOUS_PROGRESS and
  RECONCILIATION. SAVE_DATA read; no saved state/adapter/schema changes selected.

## Reviewed implementation decisions

Prefer data and existing machinery. Natural milestone arrival is offscreen and
capacity-sensitive; fractions below are due times, not guaranteed first contact.
Five authored minutes / rate0.5 remains ten nominal wall minutes before pauses.

|Event|Old fraction|Trial fraction|Sim seconds|Nominal wall seconds|
|---|---|---|---|---|
|Microplastics / Runner|0|0|0|0|
|Bottle / Grunt|.10|.10|30|60|
|First optional surge site|.04|.16|48|96|
|Weak group|.25|.25|75|150|
|Wrapper gust|.32|.34|102|204|
|Optional Greed site|.18|.40|120|240|
|Glass / Tank|.40|.44|132|264|
|Bag / Broodmother|.45|.52|156|312|
|Can roll|.55|.60|180|360|
|Optional Multiplicity site|.34 / .52|.66 (one)|198|396|
|Mini-boss|.50|.72|216|432|
|Baseline elite ramp begins|.60|.82|246|492|
|Optional Duplication site|.72|.84|252|504|
|Optional Escalation site|.86|.90|270|540|
|Final boss|1|1|300|600|

Removing only the repeated Multiplicity arrival avoids compulsory scheduling of
two identical permanent doubling choices; the one existing definition remains
unchanged. Every site can still be ignored, and deliberate different-site stacks
remain possible. No fake guaranteed upgrade/evolution minute. Earlier taught
roles get18–30sim-second gaps; Can precedes mini by36sim seconds. Optional late
escalation leaves30sim seconds before final, but travel/kill/build may consume it.

Placement band trial560–1320→480–800, min separation620→360, same24attempts/160edge.
At base200 move speed, center-to-site travel is2.4–4sim seconds,4.8–8nominal wall
seconds before obstacles/route choice; reaching interaction range is shorter.
Minimum480 exceeds current view half-height225 and interaction120; a diagonal or
horizontal site can still be visible. Do not assert fully offscreen for all bearings.
Existing finite fallback remains unchanged and must be measured at corners.

Preview is read-only from current world + selected site at current threat step:
resolved arrivals/durability/harm/XP and elite chance, plus finite surge/duplication
source reward. Display existing themed labels, no new fact surface. Refresh only
when text changes; ignore keeps world unchanged. Existing input/activation guard
stays the owner of acceptance. Minimap site diamond differs from enemy dots.

Bosses hold movement during their already-fixed circular warning (theme boolean),
then resume pursuit during existing recovery. Keep health/damage/radius, pulse
rules and recovery durations; longer rest/cost changes require measured evidence.
Hold prevents body/circle divergence and gives a clear safe-space/return choice.
No new attack, tracking circle, counter, invulnerability or body derived from art.

Timed pacing choices apply only existing world-multiplier shrine and curse
contracts at explicit simulation times. Preserve spawn-time cohorts and exact-once
curse handling. Reject surge/duplication simulation rather than pretending to
model their actors/rewards. Before/after timed scenarios supplement the four
baseline/C3 CLI comparisons; never infer movement/offers/travel/survival/boss passes.

## Gate / execution checklist

- [x] Fresh120ambient/fourCLI baseline and timed ignored/accepted comparison.
- [x] Both-theme schedule/placement, resolved preview and warning hold implemented.
- [x] Deterministic ordering/restretch, no-change ignored, repeated acceptance,
  cap/retention/ledger/terminal/reset and timed cohort boundaries verified.
- [x] G3 short suite: content/architecture/director/shrine/chaos/bosses/codex/
  simulation/events/statistics/run-state/weapons plus affected UI tests; full units
  once for cross-cutting selectors. Types/lint/build/whole-branch whitespace.
- [x] Both-theme/all-preset before/after baseline/C3 plus weak/generalist/evolved
  timed choices; record XP/work/dwell/level trade-offs, model and timing limits.
- [x] Necessary bounded serial both-theme Default/Low+reduced-motion site-preview/
  ignore/accept/repeat and mixed boss/directional cue cases; relevant existing
  boss terminal/reset regression.1worker/0retries, screenshots/cleanup inspected.
- [x] Report/status/product/reconciliation and current next handoff in phase commit.

No natural first-contact/upgrade claim from forced clocks or positioned actors.
No broad browser/stress/soak campaign; external device/browser checks remain
waived/unverified. Gate failures must be fixed/recorded before completion.

### First-heavy introduction review, before theme edits

Use existing introductionCount overrides: Glass/Tank4 and Bag/Broodmother2 in
both themes, rather than their general21–23-member waves. Four walls teach a
route; two releasers expose finite offspring without a bulk first-encounter spike.
Later natural weights remain unchanged. Ambient balance omits milestone actors;
record this separately and test actual retained requests at capacity in browser.

### Verification fixture extension / themed opening distinction

Claim `tests/unit/chaos/curses.test.ts` to update its authored258000ms/6site
expectations to the new270000ms/5site schedule; no world-choice runtime change.
Knight retains its historical Grunt opening at0 and Runner unlock.20 (eco uses
Microplastics0/Bottle.10). Do not silently homogenize that pack. Its original
Runner→weak-group gap is15sim seconds; subsequent new teaching gaps stay≥18.
The table's eco opening labels/times are not a claim about knight's original pair.

### Affected historical fixtures / review refinements

Claim `tests/unit/enemies/g1-role-balance.test.ts` for its pre-unlock.40 Glass
sample to use the actual authored unlock, preserving its G1 armour/share assertions.
Claim `tests/e2e/{phase-five-v02,shrines-curses-v043}.spec.ts` for natural5-site/
270000ms expectations and affected focused checks. Preserve the deliberately named
`worldScenario=multiplicity2` synthetic two-instance fixture in planShrineArrivals;
it remains an explicit stress/world-composition aid, not a natural second site.
`worldScenario=all` uses the actual five-site schedule and new expected composition.
No test helper may silently change a benchmark's requested two-site load to one.

Visual review: lift the site detail above actors so the player cannot cover the
accept/ignore instruction, increase its text15px, and name the site inside the
panel (the aided fixture relocates actors, so the original static world label
cannot serve as the relocated panel's identity). Clamp details to the live view.

### Final handoff claim and review

Claim `build/PHASE_G4_PROMPT.md` for a reviewed next-session handoff only; G4
runtime work remains unstarted. Preserve all waived/deferred external evidence.
The final short recipe also includes enemies/G1 family assertions because role
unlock changes affect those fixtures. Preserve the synthetic multiplicity2 load;
all-site duplication now derives eight eligible roles, never hardcodes the old five.
No natural encounter timing or full-run survival acceptance is inferred.

## Accepted local gate — 2026-10-22

[Report](content/G3_REPORT.md) owns complete decisions/evidence/limits. Final short
342tests/35files; full696tests/73files; types/lint/build/whole-branch whitespace,
13unique affected serial browser cases,120before+120after ambient and90before+
90after timed scenarios pass. One old duplication fixture failed5vsactual8; its
roster-derived correction passes. Initial typed/schedule/G1 fixture failures are
recorded honestly in the report. Production emitted-marker static scan passes;
no extra production/full browser or device campaign was run. G3 complete locally,
G4 ready/unstarted with [reviewed handoff](PHASE_G4_PROMPT.md). No push/PR/merge/art.
