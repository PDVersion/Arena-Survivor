# V0.4.4 — Sprite roster reconciliation (TBC)

Current status and dates: [BUILD_STATUS.md](BUILD_STATUS.md). This is an ongoing,
gated plan, not a claim list. Read REC-078, the [master pipeline record](MASTER_BUILD_PLAN.md#v0-4-1),
[style guide](SPRITE_STYLE_GUIDE.md) and [manifest](sprites/MANIFEST.md).
Before any claim or generation, reconcile the roster against settled V0.4.2 /
V0.4.3 content; confirm stable IDs, subjects, sizes and frame roles. Optional
content and new art remain unselected. Higher sprite resolution remains parked.

## Remaining scope to reconcile

- Dedicated fragment sheets and elite treatment.
- Cleanup Grabber action/icon and pickup presentation.
- Shrines, hazards, variants and full-roster/fallback/performance acceptance.
- Keep accepted sheets as the style baseline, subject to promoted material changes.

The following original inventory and S2–S5 targets are retained as historical
inputs only. Their completed player/enemy portions are already in the master;
remaining rows are not automatically approved or valid after roster changes.
No original recommendation overrides REC-071–073 or current contracts.

## 1. Inventory

This was the original thirty-two-sheet inventory. It is retained as planning
history, not as the V0.4.4 claim list: Sorting Pulse is now parked for the
knight-magic theme and the Cleanup Grabber's sheet size/frame roles must come
from the V0.4.2 prototype.

| # | Subject | Class | Canvas | Frames | Detail | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Plastic Bottle | Standard enemy | 32×32 | 4 | medium | **Baseline — do first** |
| 2 | Plastic Bag | Small enemy | 24×24 | 4 | low | 1 |
| 3 | Glass Bottle | Large enemy | 48×48 | 4 | medium | 1 |
| 4 | Bagged Waste | Large enemy | 48×48 | 4 | medium | 1 |
| 5 | Environment Protector | Player | 48×48 | 8 | high | 1 |
| 6 | Cleanup Grabber — V0.4.4 target | Melee tool | 64×16 | 3 | medium | — |
| 7 | Impact Point | Pickup | 16×16 | 3 | low | 1 |
| 8–10 | Bottle / Bag / Glass fragments | Small enemy | 24×24 | 4 | low | 2 |
| 11–14 | Four shrines | Shrine | 64×64 | 4 | high | 2 |
| 15–17 | Three hazards | Hazard | 64×64 | 4 | medium | 2 |
| 18 | Elite outline overlay | Overlay | per class | 1 | low | 2 |
| 19–30 | Colour variants `c2`/`c3` for enemies 1–4 and fragments | — | — | — | — | **Free** — hue rotation |
| 31 | Cleanup Grabber icon — V0.4.4 target | Weapon | 32×32 | 3 | high | — |
| 32 | Impact orb tiers (3 sizes) | Pickup | 16×16 | 3 | low | 3 |

Twelve of the thirty-two are colour variants produced by hue rotation, so the
real generation count is **twenty**.

### The knight-magic problem

`knight-magic` is a second complete production pack, and theme validation requires
both to be complete. Generating a second full sprite roster doubles the work for a
pack nobody plays.

**Decision:** sprites are optional theme content. A pack without them falls back to
the current primitives, which keeps `knight-magic` valid and playable at zero art
cost. This has to be designed in from the start — see §3 — because retrofitting
optionality after the entities assume a texture is much harder.

---

### Phase S2 — The rest of the enemy roster
Bag, Glass, Bagged Waste, plus fragments and the elite overlay. Ends with every
enemy sprited and the primitives unused for enemies.

*Verification:* all four roles distinguishable in a 300-enemy crowd screenshot;
fragments visibly derived from their parents; `check` passes for every sheet.

### Phase S3 — Player, weapon, projectile, pickup (historical target)
The high-detail work. The player is the only 8-frame sheet and the only real
animation.

*Verification:* the walk cycle reads at the player's actual move speed; the
equipped weapon's full action is legible at the active camera and gameplay rate.
For the eco theme that now means the Cleanup Grabber's extend/contact/retract
cycle, not a travelling projectile.

### Phase S4 — Shrines and hazards
The static, high-ornament subjects. Hazards need a scaling decision — a 64×64
sheet stretched to a 110-unit damage zone will look soft, so these are likely
9-slice or tiled rather than scaled.

*Verification:* a shrine reads from across the arena; hazard telegraphs are still
unmistakable, which is the property REC-053 cares about.

### Phase S5 — Variants, polish, and the fallback proof
Colour variants, the `knight-magic` fallback path proven by running it with no
sprites at all, a full-roster consistency review with every sheet side by side,
and a final frame-time measurement against the S1 baseline.

*Verification:* both production packs run; `knight-magic` renders primitives with
no errors; the roster reads as one artist's work.

---

## 8. Risks

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Generated sprites do not match each other well enough | **High** | The style lock, the palette snap, and the baseline-comparison step. Budget several attempts per sprite |
| A sprite implies a different hitbox than its radius | Medium | The rule in §3, plus a `check` assertion that the drawn silhouette fits the declared radius |
| Two agents generate the same sprite twice | Medium | The claim protocol in the manifest, and attempt-numbered raw filenames so nothing is overwritten |
| Frame time regresses with 300 textured sprites | **Low, now** | The atlas moved to S1 (§6), which removes the batching risk rather than mitigating it. Still measured in S1 and again in S5 |
| The 4-step rule reads as flat rather than chunky | Medium | Tune the style lock after the first batch (style guide §8) — this is expected, not a failure |
| Art work stalls the milestone's mechanical items | Medium | Phases are independently shippable; the fallback means a half-finished roster still runs |

---

## 9. What "done" looks like

A run where every visible thing is a sprite drawn to the same style, the crowd is
*more* readable than it was with primitives rather than less, `knight-magic` still
runs on primitives with no errors, and any new sprite can be produced by pasting
the style lock plus one subject block into an image tool and running
`npm run sprites -- build`.

The last clause is the real deliverable. A finished roster that cannot be extended
is worth less than a half-finished one that can.

For the 2026-09-02 checkpoint, "done" is narrower: sheets #1–5 are accepted and
live from one atlas, the build is reproducible from untouched raw attempts, and
the remaining inventory is clearly handed to the post-rebalance sprite phase.
The full-roster definition above remains the target for that future phase after
its inventory is revalidated.
