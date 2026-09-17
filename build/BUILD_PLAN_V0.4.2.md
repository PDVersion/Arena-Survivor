# V0.4.2 — Readability, Pace, and the Cleanup Grabber

This is the design correction between the V0.4.1 sprite checkpoint and content
growth. The first five sprites proved the art direction, but also made the
remaining problem clearer: a wide camera, a fast simulation, and a projectile
starter make individual objects and actions too hard to read for the simple,
engaging environmental game this is becoming.

V0.4.2 changes the baseline before more content or more sprites are built:

1. show less of the arena through a camera zoom so existing actors occupy more
   screen space without changing their world size, bodies, or sprite files;
2. run the playable simulation at half speed as the first experiment; and
3. replace the eco theme's abstract Sorting Pulse with a short-range,
   auto-aimed cleanup grabber that stabs outward and retracts.

The old V0.4.2 content-growth plan had not started. It is now
[`BUILD_PLAN_V0.4.3.md`](./BUILD_PLAN_V0.4.3.md). The remaining sprite roster is
V0.4.4 work, after this baseline and V0.4.3's content roster are settled.

## Product decisions

### Zoom changes the view, not the world

Start with **2.0× camera zoom**. The renderer remains 1600×900 and the arena,
actor radii, physics bodies, separation, movement distances, and native sprite
sizes remain unchanged. The camera therefore shows roughly 800×450 world units
and crops the surrounding play area. This is exactly the intended effect:
sprites become twice as large on screen because the player is closer to them,
not because their art or hitboxes were enlarged.

The 300-enemy and 192-projectile limits remain technical ceilings, not density
targets. At the tighter view, far fewer actors are needed before the screen
feels occupied. Do not lower either cap until a representative stress run shows
that doing so improves behaviour or performance.

The camera's live `worldView` stays authoritative for off-screen spawning,
shrine visibility, and edge markers. Never substitute the 1600×900 render size
for the zoomed world view.

### Half speed is one coherent clock

Start with a **0.5 gameplay rate**: one real second advances 0.5 seconds of
playable simulation. This is an experiment value, not a promise that 0.5 is the
final answer.

The rate applies to player and enemy motion, spawn and weapon cadence, hazard
timing, regeneration, projectiles, melee presentation, and the run clock. A
five-minute authored run therefore takes about ten real minutes at 0.5. UI input,
menus, and audio controls stay responsive at wall speed. Hit-stop and the death
slowdown multiply the base rate; reduced-motion disables those feedback effects,
not the base gameplay rate.

There must be one resolved clock. Do not independently halve move speeds,
double cooldowns, double spawn intervals, and retime animations: that produces
four balance changes which will drift apart when the experiment is adjusted.

### The eco starter is a real cleanup tool

The active eco theme starts with a **Cleanup Grabber**, visually based on a
long-handled rubbish pickup tool. It auto-aims at the nearest eligible enemy in
a short forward reach, extends in a narrow stab, damages at most one target,
then retracts. The first version has no projectile entity, splash, pass-through,
or multi-target sweep.

Initial values are deliberately conservative and theme-owned: approximately
72 world units of reach, a narrow contact width, one target, and a one-second
simulated cooldown. The build must tune these with the zoom and half-speed
baseline rather than treating them as engine constants.

Use a delivery union under the neutral stable role `weapon.starter`:

- `eco-guardian`: melee stab delivery, presented as the Cleanup Grabber;
- `knight-magic`: the existing projectile delivery, presented as Magic Needle.

The already-built projectile actor, collision path, and knight-theme content
are parked, not deleted. Persistence has not shipped, so V0.4.2 is the safe
point to replace the delivery-specific `weapon.starter_projectile` stable ID
with the theme-neutral `weapon.starter` role.

Projectile-only and burst-chain upgrade offers must not remain in the active eco
draw after the starter changes. Park pierce, projectile-count, Piercing Momentum,
Compaction Burst, and Cascade with the knight/projectile content for now; do not
silently relabel them as grabber mechanics. The underlying reusable systems may
remain. V0.4.3 decides which interactions return as real-world tools.

The gameplay phase uses a primitive grabber presentation with an animation hook.
V0.4.4 owns the generated sprite sheet after the mechanic, reach, pose, and
frame roles have survived play testing.

## Delivery model

One core agent can build all three features sequentially, but that would hide
their separate effects and make the play-test evidence weaker. Use one short
seam phase, three equivalent parallel feature branches, and one integration
phase.

```text
main after V0.4.1
        |
        v
R0 integration seam on codex/v0.4.2
        |
        +-- codex/v0.4.2-view     (R1A)
        +-- codex/v0.4.2-pace     (R1B)
        +-- codex/v0.4.2-grabber  (R1C)
        |
        v
R2 merge, tune, play-test, and deliver codex/v0.4.2
```

The feature branches are temporary implementation branches. `codex/v0.4.2` is
the milestone branch and the only pull request into `main`.

## Phase tracker

- [x] R0 — Neutral camera, pace, and weapon-orchestration seams
- [ ] R1A — Tighter camera and cropped play area
- [ ] R1B — Half-speed gameplay experiment
- [ ] R1C — Cleanup Grabber melee starter
- [ ] R2 — Combined integration, measurement, and play-test gate

## Phase R0 — Land the three seams

**Commit:** `build(v0.4.2): isolate view pace and weapon delivery seams`

The core agent lands this before the parallel branches are created:

- Add theme-owned view tuning and pace tuning with behaviour-neutral values
  (`zoom: 1`, `gameplayRate: 1`) in separate files for both production themes.
- Add a camera configurator that owns zoom/follow setup and a frame-timing
  resolver that combines the base rate with hit-stop, death slowdown, pause,
  and reduced motion. Wire each into `RunScene` once.
- Route presentation timers, tweens, and sprite animation through a generic
  resolved gameplay-time input while its neutral value is still 1. R1B then
  changes rate data and focused timing logic without taking ownership of the
  completed sprite subsystem.
- Establish a weapon-delivery dispatch boundary while preserving projectile
  behaviour unchanged. The seam may extract orchestration, but it must not add
  the grabber yet.
- Add focused contract tests proving neutral tuning reproduces the current
  camera, clock, and projectile starter.
- Freeze the ownership blocks below. Parallel agents do not edit `RunScene`,
  theme indexes, shared contracts, or shared test fixtures unless R0 explicitly
  assigns that file to their block.

R0 is complete only when the existing unit and browser suites pass with no
observable gameplay change.

## Phase R1 — Three parallel features

All three branches start from the R0 commit. Each ends in a playable, testable
feature on its own and reports measurements against the R0 baseline.

### R1A — Tighter camera and cropped play area

**Branch:** `codex/v0.4.2-view`
**Commit:** `feat(v0.4.2): tighten the arena view`

Owned paths:

- `src/game/content/themes/*/view.ts`
- `src/game/systems/view/**`
- `tests/unit/view/**`
- `tests/e2e/view-scale.spec.ts`

Deliver:

- Set both production packs to 2.0× zoom through theme data.
- Keep the fixed 1600×900 render surface and UI scale unchanged.
- Prove camera `worldView` is approximately 800×450 at the arena centre.
- Prove ambient spawns and arriving shrines remain outside the cropped view,
  including near arena edges, and edge markers still point correctly.
- Capture a representative 1×/2× comparison using the same player position and
  enemy layout. Actors must occupy twice the screen dimension while their world
  radii and separation measurements are identical.

Do not retune speed, cadence, weapon range, hitboxes, actor scale, or sprite
files in this branch.

### R1B — Half-speed gameplay experiment

**Branch:** `codex/v0.4.2-pace`
**Commit:** `feat(v0.4.2): slow the playable simulation`

Owned paths:

- `src/game/content/themes/*/pace.ts`
- `src/game/systems/time/**`
- `tests/unit/time/**`
- `tests/e2e/gameplay-rate.spec.ts`

Deliver:

- Set both production packs to `gameplayRate: 0.5`.
- Drive simulation delta, Arcade physics, gameplay timers, tweens, sprite state
  timing, and later weapon presentation from the resolved rate or a documented
  presentation exception.
- Prove two wall-clock seconds advance approximately one simulated second and
  move an unobstructed actor approximately half as far as R0.
- Prove pause advances nothing; reduced motion still runs at 0.5; hit-stop and
  death slowdown multiply 0.5 instead of replacing it.
- Report authored duration and expected real duration together so the ten-minute
  wall-time consequence is visible rather than accidental.

Do not change any authored speed, health, damage, cooldown, director, or hazard
coefficient in this branch.

### R1C — Cleanup Grabber melee starter

**Branch:** `codex/v0.4.2-grabber`
**Commit:** `feat(v0.4.2): replace the eco starter with a cleanup grabber`

Owned paths:

- `src/game/core/archetypes/{ids,contracts,effects}.ts`
- `src/game/content/define-theme.ts`
- `src/game/content/themes/*/{weapons,copy,upgrades,skills}.ts`
- `src/game/entities/**` files created for melee presentation
- `src/game/systems/weapons/**`
- the weapon-delivery section extracted from `RunScene` by R0
- weapon, combat, content, upgrade-pool, and delivery-specific tests

Deliver:

- Replace the flat projectile-only weapon contract with a discriminated
  projectile/melee delivery union and validate each shape independently.
- Migrate the required stable role to `weapon.starter`; keep the knight theme's
  existing values and projectile path under that neutral role.
- Make the eco starter a short, narrow, single-target stab. Targeting and hit
  resolution are pure/testable; the scene only coordinates actors and feedback.
- Add a primitive extend/contact/retract presentation whose timing can later
  select sprite frames without feeding any measurement back into simulation.
- Remove projectile-only and burst-chain offers from the eco level-up pool while
  retaining their knight-theme definitions and reusable systems.
- Update stat descriptions so the eco pause/card surfaces show reach and cycle
  rate, never charges, pass-through, or projectile count for the grabber.
- Prove no projectile actor or projectile-cap slot is created by a grabber stab,
  exactly one eligible target is damaged, targets outside reach are untouched,
  and the parked knight projectile still fires and pierces as before.

Do not generate or claim a grabber sprite in this branch.

## Phase R2 — Integrate and retune the combined game

**Commit:** `fix(v0.4.2): reconcile the readable gameplay baseline`

The core agent merges R1A, R1B, and R1C into `codex/v0.4.2`, then evaluates the
combination rather than assuming three passing branches make a good game.

Required reconciliation:

- Update the balance simulator for delivery kinds and print simulated duration
  beside real duration at the active gameplay rate.
- Replace the projectile engagement-envelope assertion with delivery-specific
  guards. A projectile must cover its declared range; a melee weapon must never
  claim off-screen reach and must receive an enemy within a measured opening
  wait.
- Measure first contact, first successful grab, first kill, first level-up,
  enemies visible at 30/60/120 simulated seconds, and peak visible occupancy.
- Run the 300-enemy stress path at 2× zoom and record frame time. The cap remains
  300 unless measurement—not screen appearance—requires a change.
- Test the combined visual result: the tighter camera and 0.5 rate should make
  the Environment Protector and grabber action readable without making the
  opening empty or traversal tedious.
- Tune only through theme data. If the opening is too quiet, prefer arrival
  distance/cadence changes over undoing the readability goals.
- Update `THEME_ARCHETYPES.md`, the sprite manifest, and the V0.4.4 inventory.
  The old Sorting Pulse rows become parked knight-theme work; the unclaimed eco
  weapon row becomes the Cleanup Grabber only after its frame roles are known.

### Play-test gate

Do not start V0.4.3 until a short play test answers yes to all five:

1. Can the player identify the four enemy sprites without pausing?
2. Can the player see the grabber extend, make contact, and retract?
3. Does the opening produce interaction soon enough despite half speed?
4. Does the screen feel occupied well below the 300-enemy ceiling?
5. Is the simpler single-target starter engaging for at least the first two
   simulated minutes without relying on pierce, splash, or chain effects?

If 0.5 is too slow, test 0.6 or 0.75 through the one pace value. If 2× is too
tight, test 1.75 through the one view value. Do not compensate by changing actor
size or scattering timing literals.

## Verification

Each branch runs its focused unit/browser paths plus:

```text
npm run typecheck
npm test -- --run tests/unit/content tests/unit/architecture
npm run build
```

R0 and R2 additionally run the full suite from V0.3's verification convention:

```text
npm test -- --run
npm run test:e2e:ci
npm run balance
npm run sprites -- check
```

## Definition of done

V0.4.2 is complete when the active eco game renders a cropped 2× world view,
runs its coherent simulation at 0.5 rate, and starts with a short single-target
Cleanup Grabber whose full motion is readable. Neither the zoom nor sprite
presentation changes simulation geometry; the knight theme still proves the
parked projectile path; the active eco upgrade pool offers no dead or
projectile-only cards; the full suite passes; and the play-test gate is recorded
before V0.4.3 begins.
