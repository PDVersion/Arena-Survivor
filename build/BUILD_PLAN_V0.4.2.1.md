# V0.4.2.1 — Readable Contact and Material Families

This is a corrective increment after the first V0.4.2 play test. It fixes what
the tighter view revealed, adds one optional Cleanup Grabber technique, and
turns the eco enemy roster into explicit material families before V0.4.3 grows
the game. It does not add a second weapon, persistence, or the remaining sprite
roster.

The player-facing content map is [`ECO_CONTENT_MAP.md`](./ECO_CONTENT_MAP.md).
Runtime definitions and theme copy remain the implementation authority; the map
is the editorial/design source that those definitions and the future in-game
catalogue must be checked against.

## Decisions locked for this increment

- The player walk animation must read as deliberate movement, not flashing. It
  advances from accumulated movement distance (or equivalent movement-state
  timing), never raw render-frame time, holds a pose for at least 300 ms at the
  current walking speed, and shows the idle frame while stationary.
- The minimap is anchored to the bottom-right safe area and must not overlap the
  HUD or any full-screen information overlay.
- The opening movement hint disappears on the first meaningful movement input
  or after 20 seconds of active, unpaused real time, whichever happens first.
- Player and enemy contact circles are authored to match the intended visible
  footprint as closely as a circle can match irregular pixel art. Physics never
  measures a bitmap. Theme data owns both the gameplay radius and presentation
  diameter, and a debug overlay/visual test verifies their agreement.
- Every enemy is walk-through. Player/enemy contact applies a small, cooldown-
  limited, theme-owned knockback to the player. Enemy/enemy separation and
  obstacle collision remain unchanged.
- The Cleanup Grabber retains its owned reach track and gains a separately
  acquired, five-level weapon track named **Collection Sweep**.
- `enemy.fast_fragile` changes from Plastic Bag to **Microplastics**. Bagged
  Waste remains the large rubbish-bag/death-spawner role.

## Phase tracker

- [x] P0 — Contract, content IDs, tuning seams, and catalogue mapping
- [x] P1 — Walk animation, minimap anchor, and opening-hint lifetime
- [x] P2 — Contact footprints, walk-through enemies, and player knockback
- [x] P3 — Collection Sweep levels 1–5
- [x] P4 — Microplastics, Glass Shards, material spawn relations, and integration

Each phase is one reviewable commit and updates `RECONCILIATION.md` when it
discovers or changes a reusable rule.

## P0 — Contract and data seam

**Commit:** `plan(v0.4.2.1): define contact and material family contracts`

- Add a stable stationary-fragment enemy role and a stable Collection Sweep
  upgrade/skill ID. Do not encode eco names in core IDs.
- Extend theme-owned tuning for authored sprite display diameter, contact
  knockback impulse/cooldown, sweep cadence/area, and material child mappings.
- Model death children as a bounded list or tagged family, not one hard-coded
  child ID. Validate that a family cannot recursively spawn itself.
- Add catalogue descriptors that can be derived from runtime definitions plus
  theme copy. Do not create a second set of gameplay numbers in the catalogue.
- Update the accepted Plastic Bag manifest entry only as part of an explicit
  regeneration/migration phase; never rename its files and pretend the old art
  depicts Microplastics.

## P1 — Readable presentation

**Commit:** `fix(v0.4.2.1): stabilise player motion and navigation UI`

- Replace the current clock-driven flashing with a movement-state animator.
  Reset to idle when stopped; accumulate distance/time without skipping through
  multiple visible poses after a long frame or overlay pause.
- Move the minimap to the bottom-right with UI-scale-aware margins. Hide it
  beneath Info/Settings and other full-screen overlays.
- Give the starting movement hint one run-local dismissal state. Dismiss it on
  the first non-trivial player displacement or at 20 seconds of active real
  play; fade once, then destroy it.
- Add focused browser captures at the supported viewport and UI scales.

## P2 — Contact that matches what the player sees

**Commit:** `fix(v0.4.2.1): align contact footprints and allow traversal`

- Audit the player and every enemy with a physics debug overlay. Author body
  radii and sprite display diameters together from the intended footprint;
  irregular shapes keep a conservative circular approximation.
- Remove player displacement by solid enemy roles. All enemies may overlap the
  player path; retain enemy/enemy separation and heavy-role mass differences.
- On valid damaging contact, apply a small knockback to the player away from the
  enemy. Gate repeated pushes with contact cooldown so a crowd cannot vibrate or
  pin the player. Put every magnitude in theme tuning.
- Unit-test direction, cooldown, and zero-distance fallback; browser-test that a
  player can cross each role and that visible contact is credible.

## P3 — Collection Sweep weapon track

**Commit:** `feat(v0.4.2.1): add the collection sweep grabber track`

Collection Sweep starts unowned and is offered separately from Longer Grabber
and general upgrades. A completed grabber attack increments its counter once,
regardless of targets hit. Level changes do not reset the counter.

| Level | Trigger | Effect |
| --- | --- | --- |
| 0 | — | Not owned; no sweep |
| 1 | Every 8 attacks | One circular sweep at maximum reach |
| 2 | Every 6 attacks | Same sweep, faster cadence |
| 3 | Every 4 attacks | Same sweep, faster cadence |
| 4 | Every 4 attacks | One sweep halfway through extension and one at maximum reach |
| 5 | New seeded interval of 2–4 attacks after each trigger | Keep the level-4 sweeps and add 1–3 seeded positions along the weapon path on extension and 1–3 on retraction |

- Roll cadence and extra positions once per trigger from the run's seeded RNG;
  never roll per render frame.
- Hit geometry is authored independently of animation. Each sweep hits every
  eligible enemy in its circle once per sweep and uses the attack's resolved
  damage/critical result. Radius and any damage multiplier are theme tuning and
  must be checked with `npm run balance` before acceptance.
- Present extension and retraction sweeps clearly without adding projectile
  entities. Add exact tests for levels 1–4 and bounded deterministic tests for
  level 5.

## P4 — Material-family enemies

**Commit:** `feat(v0.4.2.1): add microplastic and glass fragment families`

- Rename the eco presentation of `enemy.fast_fragile` from Plastic Bag to
  **Microplastics** and replace its sprite through the manifest claim/generate/
  accept/build workflow. Art is a readable cluster of typical multicolour waste
  shards/pieces, not glitter or detached motion particles.
- Add a stationary **Glass Shards** role. It does not chase, still deals
  cooldown-limited contact damage while the player remains on it, counts toward
  the enemy cap, can be cleared, and cannot fragment again.
- Change Fragmentation routing:
  - Plastic Bottle → Microplastics.
  - Glass Bottle → Glass Shards.
  - Microplastics and Glass Shards → no further fragments.
  - Bagged Waste → its all-material breakup below; do not also apply the generic
    two-child fragmentation path.
- Bagged Waste releases Plastic Bottle, Microplastics, and Glass Bottle when it
  breaks. It never releases another Bagged Waste, so the relationship is finite.
  Glass Shards remain a glass-fragment result rather than a primary bag child.
- Replace same-parent scaled fragments; no system may infer child identity from
  sprite art. Retained capacity-bound child spawns preserve causal ordering.

## Verification and completion gate

Run the V0.3 short suite plus:

```text
npm run typecheck
npm test -- --run
npm run build
npm run test:browser
npm run balance
npm run sprites -- check
```

Acceptance also requires one recorded visual/contact pass showing: stable walk
poses; bottom-right minimap; both hint dismissal paths; debug circles aligned
with player and all enemy silhouettes; traversal through every enemy role with
slight knockback; deterministic Collection Sweep behavior at every level; and
finite material-family spawning below the 300-enemy cap.

V0.4.3 remains blocked until this pass is accepted.

## Completion record — 2026-09-21

The automated visual/contact path records the supported viewport with the
bottom-right minimap, both hint dismissal paths, debug body circles, traversal
through the five-role roster, cooldown-limited contact shove, and a live
Collection Sweep trigger. Levels 1–4 have exact cadence/position tests; level 5
has seeded bounded tests. The material graph is validation-tested as finite,
the five-child Bagged Waste breakup is browser-tested below the 300-enemy cap,
and the Microplastics replacement passed the manifest acceptance/build check.

Completion gate: `npm run typecheck`, the 401-test unit suite, production build,
72-test Chromium suite (one opt-in measurement skipped), Collection Sweep
balance model, and five-sheet sprite check all pass.
