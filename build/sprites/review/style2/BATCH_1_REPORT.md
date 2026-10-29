> Historical evidence at its recorded revision/date. Old “current”, “next” and
> unchecked gates below are not the live work queue. See [current status](../../../BUILD_STATUS.md)
> and the remaining-work audit; later owner waivers/corrections supersede old status.

# Style 2 first batch — generated review checkpoint

2026-10-23, `codex/v0.4.4`. Owner requests creating the first batch. Three new
source strips are generated and native-resolution review sheets are saved.
**Generation is complete for this first pass; production acceptance is open.**
The existing game assets are unchanged. Knights and Magic remains paused.

| Subject | Raw attempt | Native frame | Review strip | Status |
| --- | --- | --- | --- | --- |
| Plastic Bottle | a2 |64×64|[256×64](enemy_swarm_basic.a2.png)|review|
| Microplastics | a4 |48×48|[192×48](enemy_fast_fragile.a4.png)|review|
| Glass Bottle | a3 |96×96|[384×96](enemy_slow_durable.a3.png)|review|

The untouched sources are each 2172×724 RGBA. Exact assembled prompts, reference
paths/SHA256 digests, honest tool/seed metadata and deterministic recipes are
beside each attempt under ../../raw/. The tool exposes neither model nor seed;
neither is invented. Sources are copied from the generator output without edits.
New Bottle supplies the batch style reference after source-level visual review.
This source-style approval does not grant final game-size/continuity acceptance.

## Reproducible conversion

`npx vite-node scripts/sprite-review.ts build/sprites/raw/{id}.aN.review.json`

The opt-in source grid reads four 543×543 square cells at x 0/543/1086/1629 and
common y 90. One common nearest-neighbour scale maps them to target cells; no pose
is independently fitted or recentered. Palette snapping/binary alpha and a 2px
interior outline are mechanical conversions. No brush edits, replacement pixels,
pose fixes or inferred gameplay measurements. All converter outputs stay under
build/sprites/review, outside accepted/public. Each checks.json records source and
output hashes, per-frame bounds and the complete recipe.

The pipeline's existing five-sheet defaults remain byte-identical. The fixed-grid
option rejects non-integer/out-of-bounds/aspect-changing grids and crops that
would discard opaque artwork. Outline thickness recolours opaque pixels only,
without growing alpha or introducing a new hitbox.

## Visual findings and acceptance limits

The material ramps, clear silhouettes and four requested state roles read as one
batch. New intact Glass poses have no detached cyan debris. Microplastics remain
connected coloured pieces in intact poses; death separation stays in cell3.
All three processed strips pass native size, nonempty frames, approved-palette,
binary-alpha and closed-boundary checks.

Strict pose/layout review is **not passed**. [Bounds comparison](BATCH_1_BOUNDS.json)
compares the actual old and review alpha bounds. At doubled scale Bottle idle
would be22×56px; review is25×60. Its move width would be32; review is47. Microplastics
idle would be36×28; review is30×23. Glass idle would be46×88; review is48×81.
Glass idle versus hit also shifts2px horizontally/1px vertically. Other per-frame
bounds are retained in the comparison. The outline/margins must also be inspected
at game size; the Bottle review bottom is close to its cell edge.

These are real presentation differences, not a reason to adjust physical bodies
or world display diameters. Before promotion, refine the subject prompts using
these measured envelopes and regenerate; preserve the same fixed layout and
palette. Do not hand-reposition each pose or paint a correction. Exact idle/hit
geometry, movement-loop continuity, normalized footprints and live overlays must
pass before replacing shipped assets. No live game, browser, Default/Low,
reduced-motion or300-actor acceptance is claimed here. Future integration needs
reviewed metadata/atlas/recipe updates and the plan's scoped live gate.

## Verification

- 35 sprite unit tests across 4 files pass, including real-alpha doubling without
  recentering, thicker outline without alpha growth, and rejection of clipped or
  distorted grids. Initial24/31px crop fixture correction is described below.
- Typecheck, lint, production build and whitespace pass. Existing bundle advisory
  remains. No dependencies, simulation values, runtime sprite maps or saved IDs change.
- Rebuilding the five current eco recipes preserves all 12 accepted/public sprite
  file hashes; `npm run sprites -- check --theme eco-guardian` passes 5 sheets.
- Three review recipes pass checks; repeated conversion reproduces their hashes.
- No browser campaign/servers/recorders are started. External browser/OS/older
  physical-GPU checks remain waived/unverified. No push/PR/merge is performed.

Initial clip-test fixture used 31px cells, which did not actually cut any opaque
pixels because the old strip has transparent margins. That expectation failed;
the 24px fixture genuinely clips artwork and passes the rejection assertion.
This was a test fixture error, not a waived assertion. An auxiliary bounds script
could not load from/tmp under Vite's filesystem mapping; running the same script
from an owned temporary scripts path succeeds, and the temporary script is removed.
