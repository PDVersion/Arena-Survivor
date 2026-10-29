> Historical evidence at its recorded revision/date. Old “current”, “next” and
> unchecked gates below are not the live work queue. See [current status](../BUILD_STATUS.md)
> and the remaining-work audit; later owner waivers/corrections supersede old status.

# G2C — committed Can pass: keep; G2 ready for G3 locally

2026-10-22. Branch `codex/readable-gameplay-g2`, parent G2B `7ce03c5`; G2A is
`b4d61ae`, G1`54e9b2f`, Q6`44585dd`. G2C is this report's owning candidate commit,
not a main merge. Exact claim/self-review are in BUILD_PLAN_G2 before code edits.

**Keep** `enemy.committed_charger`: Aluminium Can / Barrel Construct. It aims at
the player's position when warning begins, announces that route for1000simulated
ms, passes beyond it over1000ms, then stops1400ms. The player can sidestep the
captured route and return for cleanup. Base90×3.5 travels315units, compared with
the wrapper's oblique180-unit crossing. The warning is2wall seconds at0.5 rate.
At150-unit activation it starts inside the minimum225-unit vertical half-view,
not from an offscreen spawn. Both roles reuse one generic state machine/cue.

18HP/0armour,7harm,3XP,radius14/display38; one retained introduction at55%, natural
weight2/growth0.4/bias0. Essential arrow/ring and primitive body/label/end caps
remain visible with Low/reduced-motion. No new AI branch, invulnerability, attack
hitbox, sprite/generated art, save field, weapon/camera/rate/cap change. Existing
material families/IDs retain their meaning. Movement/stats are game fiction.

## Verification on this candidate

- G2 recipe plus difficulty/weapons/persistence: **288tests/30files pass**.
- Consolidated final unit run: **686tests/72files pass**, including guide/catalog,
  UI/state/profile/statistics/lifecycle and other integration selectors. Types,
  lint and build pass (existing bundle-size advisory); whole-branch whitespace
  checked before commit. No dependency changes.
- **12serial Chromium Canvas browser cases pass**,1worker,0retries,4.2s total:
  cluster/gust/roll ×both themes ×Default/Low+reduced-motion. Four newly selected
  Can cases plus eight affected G2 regressions. Actual observations/browser version
  and warning/recovery/group screenshots saved in G2C_BROWSER; inspected both
  themes/settings. Can mixed scenes contain Can, warning wrapper, weak fodder,
  old Bottle and Microplastics; outsiders retain health while the cone kills Can.
- One introduction remains queued at zero capacity and on repeated threshold
  checks, then admits one actor at capacity1 with fresh approach state. An initial
  offscreen distance exceeds trigger range. A50-unit sideways player move during
  the warning cannot steer the heading: roll remains on the old center line and
  passes beyond the original player x.50 exceeds the combined body half-widths.
  Actual actor velocity integration at20simulated-ms steps travels322.875units
  (eco)/330.75(knight), including existing resolved speed modifiers at55%Normal.
- Actual cone pulses clear21.375spawn health, record equal actual/source damage,
  and pay3.375XP once; duplicate lethal adds nothing. Both primitive and cue are
  destroyed, retained causal queue drains. Browser fixture owns/destroys its game;
  runner closes browser/server. No listener remains on4173 at final review.
- Four actual both-theme/all-preset baseline/C3 balance CLI commands pass
  (30cases each). G2C_BEFORE/AFTER.json preserve120before+120after summaries.
  G2C_SOURCES.json binds final tracked/new runtime/test files with SHA256.

The first consolidated full unit run was684pass/1fail: an unchanged older Q6
starter-stat expectation included the new vacuum-only `primaryTargets` field.
Test and selector had no diff since G1. Claimed a narrow test-only correction
before editing: starter excludes inapplicable capacity; explicit both-theme
secondary capacity and knight projectile checks cover the real contract. No
selector/UI/weapon runtime change. Final686unit pass includes that new check.
An initial candidate-only director test also needed its documented rounded share
fixture updated for the new normalized role; production weights were not changed
to fit an expectation.

## Pacing trade-offs

|Theme/world/build|Level|XP|Cap dwell sim s|Retained effective work|
|---|---|---|---|---|
|eco-guardian/baseline/evolved-packed|30→30|1778.7→1780.7|0.0→0.0|6421→6639|
|eco-guardian/baseline/two-tools-packed|27→27|1161.0→1157.1|3.0→5.4|13668→13773|
|eco-guardian/baseline/damage-rush|25→25|974.9→967.6|12.9→16.2|13802→13747|
|eco-guardian/c3/evolved-packed|45→45|7201.1→7145.8|52.5→52.5|18865→18561|
|eco-guardian/c3/two-tools-packed|39→39|4158.3→4166.8|82.0→83.3|19078→18961|
|eco-guardian/c3/damage-rush|41→41|5188.5→5179.9|70.5→71.2|19019→19094|
|knight-magic/baseline/evolved-packed|31→31|1848.4→1840.1|0.0→0.3|15707→15581|
|knight-magic/baseline/two-tools-packed|26→26|1119.8→1115.2|27.3→28.5|16116→15784|
|knight-magic/baseline/damage-rush|25→25|911.7→911.4|34.1→42.2|16224→15845|
|knight-magic/c3/evolved-packed|44→44|6524.0→6519.7|78.5→78.1|22087→22016|
|knight-magic/c3/two-tools-packed|38→38|3765.7→3747.9|100.2→100.7|22854→22785|
|knight-magic/c3/damage-rush|39→39|4047.4→4047.3|99.9→102.4|23477→23354|

In these Normal samples, Can actors are about0.4–1.5% of admitted natural actors;
all original roles remain materially present. Can costs some throughput/XP and
adds cap dwell to weak builds (knight damage-rush34.1→42.2s), while several retained
work totals fall as role composition changes. None of the108applicable cases (120total,12parked)
loses a final level (unchanged or+1); this is not a survival metric or a reason to
raise caps. Maximum live remains300. Keep weight2, not a dominant flood, and
carry existing optional-pressure bottlenecks into G3's encounter-rhythm review.
Eco spread/explosion outputs remain parked and excluded from attainable claims.

The ambient model omits geometry/motion/incoming damage/offers/player decisions,
travel, introductions/children/elites/bosses. C3 applies shrine+curses at start
synthetically; it does not time a voluntary event. Body movement and screenshot
fixtures are explicitly aided: fixed20ms integration from actual velocities,
forced progress/capacity/player relocation and equipped secondary. They prove
phase/cue/target/reward compatibility, not natural first encounters or survival.
Broad browser/stress/soak/device regressions remain deferred; actual Safari,
missing browser/OS and older physical integrated-GPU checks remain waived/
unverified. No new CI/main merge or production hardware claim.

## Complete G2 disposition and next handoff

|Candidate|Decision|Distinct player choice|
|---|---|---|
|G2A Cigarette Butts / Ashling|Keep (`b4d61ae`)|Clear a weak lane; starter picks one, cone clears group|
|G2B Packets / Wrappers / Paper Wisp|Keep (`7ce03c5`)|Read oblique gust; intercept during stationary pause|
|G2C Aluminium Can / Barrel Construct|Keep (this commit)|Sidestep old-position direct pass; return during recovery|

**G2's scoped local gate is complete; ready to start G3. G3 is unstarted.**
[PHASE_G3_PROMPT](../MASTER_BUILD_PLAN.md#readable-gameplay-g3) is written/reviewed and deliberately
leaves implementation for the next owner instruction. It flags the55% Can vs50%
mini-boss/52%shrine overlap, warning crowding and pressure/XP snowball risks.
No G4, new sprites, world generator, currency, material matrix or factual content
was pulled forward. Local commits only; no push/PR/merge implied.
