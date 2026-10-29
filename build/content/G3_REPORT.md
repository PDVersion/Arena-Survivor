> Historical evidence at its recorded revision/date. Old “current”, “next” and
> unchecked gates below are not the live work queue. See [current status](../BUILD_STATUS.md)
> and the remaining-work audit; later owner waivers/corrections supersede old status.

# G3 — encounter rhythm and informed optional sites

Local gate accepted2026-10-22. Branch `codex/readable-gameplay-g3` from verified
G2C`5b50d7b`. Owner requested reading/executing PHASE_G3_PROMPT; exact ownership,
self-review, new fixture claims and encounter table precede code in BUILD_PLAN_G3.
This report's phase commit is the final source, not its parent or a main merge.

## Result and decisions

Keep the G3 changes: clearer teaching gaps, smaller heavy introductions, one
instance per optional site definition, current-world cost/reward before acceptance,
and bosses that stop pursuit while their fixed warning is active. Existing
roles/IDs, non-boss stats/weights, weapons/earned capacity, world bargain values,
rate0.5, view2×, collision/separation/caps, saved state and art remain unchanged.

Five authored minutes remain600nominal wall seconds before pauses. Due progress:
weak groups.25, wrapper.34, Glass.44, Bag.52, Can.60, mini.72, baseline elites.82,
final1. Glass introduces4 at44% instead of the old21 at40%; Bag2 at52% instead of
the old22 at45% (the general formula at the new thresholds would give22/23).
Later ambient weights still apply. Capacity retains causal requests; a first
encounter no longer releases a whole general-purpose heavy wave. In the eco
ordinary family budget, two Bag parents mean at most12ordinary lethals/21base XP
before time/world/elite/Fracture, not an invented ambient lineage simulation.
Knight keeps its Grunt0/Runner.20 opening; eco keeps Microplastics0/Bottle.10.
The existing knight Runner→weak-group15sim-second gap is retained; subsequent
shared teaching gaps are≥18sim seconds. Can precedes mini by36sim seconds.

Sites now arrive at.16/.40/.66/.84/.90: surge, Greed, one Multiplicity,
Duplication, Escalation. Removing the second scheduled Multiplicity limits the
old4×arrival stack without changing the existing2×/1.5×XP definition. Different
site stacks and curses remain deliberate options. Final escalation leaves30sim
seconds/60nominal wall seconds before final; walking and combat consume that.
Nothing guarantees an upgrade, evolution, free collection or successful survival.

Placement uses480–800center distance and360separation instead of560–1320/620,
same24attempts/160edge. At base200 this is2.4–4sim seconds of unobstructed center
travel,4.8–8nominal wall seconds; interaction120 shortens that distance. It is a
real destination, not guaranteed offscreen horizontally. The existing bounded
corner fallback can relax the band. G3_PLACEMENT covers480seeded placements across
both themes, center/two corners:218.29–799.16distance,≤48random calls, none within
interaction120. This is sampled evidence, not a universal fallback-distance proof.

The in-range panel names its site and shows actual current→after arrivals,
durability, harm, XP and resolved elite probability (including the baseline timer
floor), plus finite surge/duplicate count and source return where relevant. It
reads immutable world state; merely viewing/ignoring changes nothing. Existing
Space/E input and exact-once actor guard own acceptance. World labels/copy stay
in the theme. Details update only when text changes, clamp to the live view and
render above actors. Shrines use minimap diamonds; existing named edge pointers
remain. Spent markers disappear. Owned name/prompt text now destroys with source.
Enemy-dot drawing stays allocation-free; only duplicate previews scan eligible
living actors. No new information/quiz gate or environmental/handling fact.

Both bosses use an optional theme-authored `holdDuringTelegraph` boolean. The
same state owns the fixed circle and pursuit hold; after its single pulse the
boss resumes pursuit through existing recovery. Damage/health/radius/timers and
boss admission/victory/endless/clearing/reset semantics are unchanged. The hold
stops AI velocity, not physical crowd separation/knockback; the announced damage
circle remains locked even if another physical system displaces the body.
No invulnerability, new counter, attack type or art-derived body was added.

## Checks and evidence

- Final short suite including affected enemies: **342tests/35files pass**.
  Full unit suite: **696tests/73files pass**. Types/lint/build and whole-branch
  whitespace pass; existing bundle advisory persists. No dependency changes.
- **13unique affected browser cases pass cumulatively**, serial,1worker,zero
  automatic retries:4G3Canvas both-theme ×Default/Low+reduced-motion,4existing
  boss WebGL ending/reset cases,3legacy world-site composition/reset cases and
  2C3curse/scheduled-site/XP/reset cases. Initial combined8pass/10.4s; reviewed
  panel + affected-site run8pass/1fail/24.6s; corrected single case1pass/2.0s.
  G3 cases repeated only after an actual panel refinement, not a broad campaign.
- G3 browsers inspect reveal/minimap/named pointers, bounds/current preview,
  unchanged ignored world, actual Space acceptance, repeated no-op, retained4/2
  heavy introductions at capacity1, unique mini, held velocity, two directional
  cues beside the circle, paused simulation warning, safe-space miss and resumed
  pursuit after exactly one pulse. Existing boss tests cover actual weapon
  lethals/source XP, overlays, both endings and reconstruction/reset. C3 cases
  cover real curse-card input, exact fractional XP, repeat guards and reset.
- New deterministic tests cover normalized ordering/restretch, deliberate gap/
  payoff constraints, pure stacked preview, late elite floor, valid boss hold,
  locked-circle damage and timed choices/cohorts. Ignored timed choices exactly
  match baseline; pre-choice buckets are unchanged; repeated curses are no-ops;
  actor-producing events and invalid times are rejected by the ambient model.
- G3_CHECKS preserves scoped command counts/outcomes and failed attempts.
  G3_SOURCES binds final runtime/tests and measurement tools with SHA256;
  G3_BEFORE/AFTER retain120cases each. Eight actual G3_{BEFORE,AFTER}_theme_world
  CLI logs contain30cases each. G3_TIMED_BEFORE/AFTER retain90cases each, with
  buckets, XP/levels/dwell/work and explicit choice times. G3_BROWSER preserves
  actual browser/version observations and inspected screenshots from both themes
  and both settings. All actual scenario counts include model-only outputs as
  labelled; eco parked spread/explosion are excluded from attainable claims.
- Static emitted-production scan finds none of the existing diagnostic markers.
  A separate full production/browser campaign was not run. Owned browser games,
  servers and browsers cleaned up; local4173 has no listener at final review.

Initial short tests found old6site/258000ms expectations and the knight retained
15second opening gap; update the authored expectations, not generic world rules.
Initial full suite695pass/1fail found the G1 Glass-share sample at.40 now before
unlock; sample at the actual unlock, preserving all armour/share/family checks.
The affected old all-site browser expected5duplicated roles, but G2 added three;
received8. Derive all8eligible non-boss roles from the active theme. A separately
named `multiplicity2` fixture explicitly retains two instances as a synthetic
world-composition load; production and natural schedules still have one. The
`all` fixture now uses the actual five sites/world chaos4.7. No cap/XP/duplication
rule was weakened to make tests pass. Type annotations in the new browser fixture
were corrected after initial typecheck; no product behaviour changed for typing.

## Balance: ambient comparison

Normal samples. Levels/XP/cap dwell are model outputs, not human outcomes.

|Theme/world/build|Final level|XP|Cap dwell simulated seconds|
|---|---|---|---|
|eco-guardian/baseline/evolved-packed|30→30|1781→1736|0.0→0.0|
|eco-guardian/baseline/two-tools-packed|27→26|1157→1086|5.4→5.2|
|eco-guardian/baseline/damage-rush|25→25|968→929|16.2→14.6|
|eco-guardian/c3/evolved-packed|45→44|7146→6966|52.5→51.7|
|eco-guardian/c3/two-tools-packed|39→38|4167→3983|83.3→80.3|
|eco-guardian/c3/damage-rush|41→41|5180→5116|71.2→65.3|
|knight-magic/baseline/evolved-packed|31→31|1840→1797|0.3→1.0|
|knight-magic/baseline/two-tools-packed|26→26|1115→1095|28.5→28.9|
|knight-magic/baseline/damage-rush|25→25|911→914|42.2→37.4|
|knight-magic/c3/evolved-packed|44→44|6520→6462|78.1→76.1|
|knight-magic/c3/two-tools-packed|38→38|3748→3720|100.7→99.7|
|knight-magic/c3/damage-rush|39→39|4047→4063|102.4→100.7|

Across108attainable cases of120total, final-level differences range−1/0/+1.
Several eco builds lose a level or some XP as high-reward roles enter later;
knight weak-build dwell improves in the shown samples while some packed dwell
rises slightly. Keep the teaching window trade-off; do not inflate XP or blanket
weapons to force every numerical output upward. G1 Glass armour/weight and Q6
capacity remain preserved. Ambient model omits the smaller heavy introductions,
later baseline elites and actual boss movement, so it cannot measure their value.

## Balance: explicit timed acceptance versus ignore

90scenarios per side:2themes ×3presets ×3builds ×5paths. Paths are ignored,
Greed-only, all scheduled Multiplicity instances, all world-multiplier sites,
and those sites +scripted curses at150/225sim seconds. Choices are accepted at
reveal time: travel/offer timing is deliberately not modelled. Only existing
world-multiplier definitions are supported; surge/duplication actors are rejected.

|Theme/build/path|Final level|XP|Cap dwell simulated seconds|
|---|---|---|---|
|eco-guardian/damage-rush/ignored|25→25|968→929|16.2→14.6|
|eco-guardian/damage-rush/multiplicity|36→28|3133→1370|120.8→65.3|
|eco-guardian/damage-rush/worldSitesCurses|47→37|8708→3463|144.9→91.9|
|eco-guardian/two-tools-packed/ignored|27→26|1157→1086|5.4→5.2|
|eco-guardian/two-tools-packed/multiplicity|35→29|2917→1527|113.3→61.4|
|eco-guardian/two-tools-packed/worldSitesCurses|43→37|5970→3434|142.0→89.3|
|eco-guardian/evolved-packed/ignored|30→30|1781→1736|0.0→0.0|
|eco-guardian/evolved-packed/multiplicity|42→34|5660→2605|105.1→42.7|
|eco-guardian/evolved-packed/worldSitesCurses|51→44|12902→6651|130.1→84.3|
|knight-magic/damage-rush/ignored|25→25|911→914|42.2→37.4|
|knight-magic/damage-rush/multiplicity|35→28|2753→1313|139.5→73.6|
|knight-magic/damage-rush/worldSitesCurses|46→37|7757→3442|163.4→103.7|
|knight-magic/two-tools-packed/ignored|26→26|1115→1095|28.5→28.9|
|knight-magic/two-tools-packed/multiplicity|35→29|2755→1497|128.9→69.7|
|knight-magic/two-tools-packed/worldSitesCurses|43→36|5957→3086|158.4→94.1|
|knight-magic/evolved-packed/ignored|31→31|1840→1797|0.3→1.0|
|knight-magic/evolved-packed/multiplicity|41→34|5207→2506|112.2→58.0|
|knight-magic/evolved-packed/worldSitesCurses|50→43|11331→6034|139.0→88.5|

In current Normal eco results, one Multiplicity raises damage-rush25→28,
base-packed26→29 and evolved-packed30→34 versus ignore, at the cost of more live
work/cap dwell. Optional pressure still buys power, not a free reward. The old
repeated-site path produced levels35–42 in those packs; it now yields28–34, with
substantially shorter dwell. Full world sites +scripted curses retain a large
XP advantage and risk: eco evolved gains40→44 with curses, and current compound
paths can still sit at cap for~84–104sim seconds in the shown Normal samples.
This is intentional optional pressure to review in natural play, not a prediction
that all those XP levels/offers are attainable before death.

Level7 appears around36.9–37.1sim seconds in the shown eco build models, long
before Can/mini; that model hardcodes acquisition/pick assumptions. It proves no
natural upgrade frequency, first contact or evolution timing. G3 adds no claim
that a real player earns a particular build at that clock. TTK is aggregate DPS
in isolated/packed contact bands, not focused boss-combat or survival time.

## Limits and handoff

Browser clocks/progress, actor positions, physics holds and capacity are aided.
Some forced-clock banner/activation flash overlaps remain visible in screenshots;
core circle/arrow/preview geometry is legible, and Low/reduced-motion retain it.
No natural first-encounter/upgrade timings were measured here. No full app browser,
stress, soak, human survival or physical performance claim. Actual Safari,
missing browser/OS and older integrated-GPU checks remain waived/unverified.

G3's selected local gate is complete. PHASE_G3_PROMPT is retired after this report
and the same-commit status/reconciliation updates. G4 remains unstarted; the
reviewed PHASE_G4_PROMPT is the current handoff. No new roster/art/currency/world
generator/material matrix, save schema or publication/PR/merge is included.
