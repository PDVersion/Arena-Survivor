# C1 — second automatic tool, owned upgrades and on-hit splash

Local gate verified on2026-10-20 (Australia/Sydney), starting from clean
`3b2b927` on existing `codex/v0.4.3`. C1 is complete; C2 is next. P5/P6
missing browser/device acceptance remains release-blocking under the owner's
explicit ordering revision. This is not overall V0.4.3 release acceptance.

## Delivered

The ordinary three-choice level-up draw can equip Cleanup Vacuum in eco or
Runic Fan in knight-magic. Acquisition is a standalone one-time common offer,
not a tier-scaled multiple-equipment effect. Duplicate/full-slot acquisitions
and unequipped/capped owner cards are unavailable and cannot consume a pending
choice if passed back stale. Existing rarity weights/category spread remain.

Both themes author one short cone in the existing melee union:6 damage,1400
simulation-ms cooldown,90 reach,1.1-radian sector,three direct targets. Each hit
can splash three neighbours within24 units for0.35 of its rolled damage. Disk
intersections, near-to-far selection and stable-ID ties are deterministic. No
new parallel delivery system or manual switching. Starter behavior/rate0.5
remain unchanged. The sector cue is a theme-colored primitive, not a sprite.

Owner upgrade entries live beside weapons; manifests merge them into the common
registry. Longer Grabber and Collection Sweep move beside the grabber under
unchanged IDs. Each second tool has its own four-pick reach track. Owner stat
gains resolve only for that slot; the existing shared WeaponStatModifiers shape
and global gains remain shared. Tier scaling/rounding/floors are reused. Both
weapon rows can be inspected in pause stats; acquisition shows actual new-tool
damage/cadence/reach and owner cards preview their own weapon, not the starter.

Splash is hit-triggered, non-recursive and separately counted from direct,
critical/momentum and kill-triggered explosions. It may kill and trigger the
existing bounded on-kill response, with a weapon source and distinct splash
payload; those kills are initial hits for detonation depth. Capped applied
damage enters the existing ledger once. Each actual hit also enters the existing
floating-number aggregator with the rolled tier. The primary loop skips actors
already defeated by an earlier splash, preventing a false second hit response.
Only the weapon declaring the Collection Sweep track (currently the starter)
can advance that mechanic.

No enemy tuning, XP/reward provenance, cap, gameplay-rate, dependency, save
adapter, sprite pipeline or physics teardown change. New range/sector/splash
values and capacity are theme-owned. Profile persistence remains C6/C7 scope.

## Verification and evidence

- Typecheck, **509 units /59 files**, lint, production build and diff check pass.
  Fourteen new rule cases cover both themes' normal pool acquisition, duplicate/
  capacity/owner/cap conditions, tier-scaled owner-only gains and integer rounding,
  reset/serialization, inspectable tool rows, cone/disk boundaries, deterministic
  target order/caps, splash ledger and on-kill separation, malformed tuning and
  standalone acquisition constraints, plus both simulator bands. Existing assumptions about
  the added ledger column, one-time acquisition and optional fixture roster were
  updated for the new structures while preserving starter mechanics and ledger
  reconciliation.
- First four new browser cases pass in14.997s; then the combined **14** affected
  cases pass in26.152s. Final review adds floating splash numbers, after which
  **five** affected cases pass in30.031s:four overlapping C1 cases plus one
  terminal aggregation/ledger case. **15 unique affected cases verified**, not
  23 distinct scenarios or a whole-app CI pass. All serial/one worker/zero retries.
  Caps were180/240/180s; new cases have30s timeouts. No browser failure occurred.
- Both actual theme scenes load sprites, use the production1600×900 FIT setup
  displayed at1280×720/DPR1, and take real XP through the collector into an actual
  offer. Injected seeded randomness selects an eligible offer;80ms keyboard input
  selects acquisition and then the newly eligible owner card. Observed owner
  reach gain14.4, shared/starter reach gain0. Restart returns the single starter
  clock0. Screenshots of offers/sector and both load modes were visually reviewed.
- Explicit-timestamp three-target eco probe:27 applied damage,10.2 splash,
  no on-kill explosion,three kills and3 XP dropped. Intended display damage30.6
  includes overkill; all30.6 flushes, no pending number. The ledger deliberately
  records capped actual damage rather than displayed intent. Knight probe records
  30 applied damage/12.2 splash/three kills/6 XP, same display intent30.6.
- Controlled dead-primary edge:two one-health targets and a final target set from
  authored damage/splash leave exactly one health on the survivor, two kills and
  10.1 applied damage. It cannot gain a second splash from the already-dead entry.
- Two short active-play mixed-load cases begin at300 actors in Default/Low and
  advance beyond2000 simulation ms at0.5. Both slots fire, splash occurs, peak300
  and current242/246 respect the cap, causal backlog0 at the final sample, ledger
  sums reconcile and there are no page errors. No-contact/no-hazards, muted/no
  audio device, level2 XP cap and fixed spawn positions are explicit test aids.
  These are short affected-work checks, not sustained300-load throughput/soaks.

The measured renderer is ANGLE Vulkan SwiftShader WebGL on the retained M5 host;
no hardware/GPU inference. The Desktop Chrome profile still supplies a Windows
user-agent string despite `test.use(undefined)`; this is not physical Windows
coverage. Legacy combat.weaponId/deliveryKind still describe the starter; new weaponSlots
identifies the equipped loadout. The legacy grabberActive counter covers both
melee presentation actors. No separate actual browser.version was captured this session. Exact
reported user agent, renderer, viewport, mode, clocks, counts, final source hashes
and screenshot hashes/paths are in `C1_SECOND_TOOL_RESULTS.json`. Images remain
under testInfo.outputPath. Preliminary four cases used1280×720 logical size; final
cases use production FIT. Preserve that distinction, not a false matched-head claim.

The original 14-case combined run predates only the floating-number wiring/final
fixture assertions. Its ten existing cases cover independent clocks/in-flight
source ownership, grabber geometry/lifetime, card identity/values/pause/resize and
Collection Sweep. Final five cover the changed hit-feedback path and terminal
flush. No full app/stress/native/lifecycle/startup campaign was repeated. Build
artifact inspection excludes test globals/fixtures; no production/startup browser
guard is claimed. Known Phaser bundle-size warning remains; no dependency change.

## Balance

Both themes run all eight build models over all three difficulties with TTK via
`npm run balance` (48 coarse scenarios). `C1_SECOND_TOOL_BALANCE.json` retains
configuration/results and output hashes. An initial unsupported `--theme all`
request was rejected before simulation; explicit theme runs pass. New models
equip the second tool at level2:single-target contact and ideal packed contact
using authored direct/splash caps. They do not model movement, cone occupancy,
overkill or additional tiered damage purchases; packed is a contact ceiling,
not an unlimited DPS promise or an optimal build.

At Normal, eco reaches model levels18/22 with345/549 kills and366/684 XP;
knight15/22 with235/487 kills and235/674 XP, single/packed respectively.
With zero crit at level2 the contact addition is4.286 DPS for one target and
26.357 ideal packed DPS above the10 DPS starter. Actual eco clustered hits cap
at27 HP total; the exact probe guards against phantom DPS from dead targets.
These bands support a bounded complementary tool; they are not survival or
production performance acceptance. Historical P5/P6 measurements/device pack
remain bound to their recorded sources and must be regenerated for future checks.

## Delivery and remaining gate

One local C1 implementation commit with tests/status/master/progress and material
reconciliation. No push/PR/merge/deployment/workflow dispatch. Owned browsers,
servers and game instances are cleaned; port4173 has no listener and review4213
is untouched. C2 begins from this verified C1 checkpoint, with a new definition
replacing its source weapon in the same slot. C3–C7 remain unstarted. Safari/
missing branded-platform/physical older integrated-GPU acceptance is still open
and release-blocking; no gate waiver, existing native/long campaign rerun or
claim of later matching-head CI.
