# Sprite art bible — style 2, double-resolution eco roster

## Familiar Australian appearance —2026-10-23

Use recognisable ordinary Australian/Sydney objects before abstract/fantasy
silhouettes. Read [appearance references](sprites/AUSTRALIAN_REFERENCE_NOTES.md).
Wine bottles/jars, drink cans, snack packets, household rubbish bags and practical
cleanup equipment guide the shapes. Theme colours accent credible materials;
they do not erase object identity. This is appearance direction, not a new factual
lesson, prevalence ranking, disposal claim, tuning change or saved content ID.
Older angular/squat Glass Bottle art is retained for comparison; a wine-bottle
alternative follows the owner direction. World display size remains unchanged.


Owner direction: 2026-10-22. Knights and Magic is paused indefinitely until the
owner explicitly reopens it. All prompts here are for `eco-guardian` only.
The [sprite plan](SPRITE_PLAN_V0.4.4.md) owns scope and integration gates;
[copyable prompts](SPRITE_PROMPTS.md) own individual subjects;
the [manifest](sprites/MANIFEST.md) owns attempts and acceptance.
[Master pipeline record](MASTER_BUILD_PLAN.md#v0-4-1) and REC-071–078 explain the seam.
Style 1 remains the shipped baseline until reviewed style 2 replacements pass.

## Resolution and scale contract

Double **both dimensions** of every logical frame, not the number of frames.
A 24×24 frame becomes 48×48; a four-frame 96×24 strip becomes 192×48.
This supplies four times the pixels. Regenerate with finer shape detail at the
new native grid; merely nearest-neighbour enlarging the old sheet adds no detail.
Nearest-neighbour remains the runtime texture filter.

World display diameter, camera, body radius, mass, separation, speeds, reach,
contact geometry and animation timing do not change. The existing view uses
`diameter / frameWidth` and `diameter / frameHeight`, so doubling the frame
halves its base scale. Preserve the old normalized silhouette footprint too:
more transparent padding would make the visible subject smaller despite an
unchanged display diameter. Compare alpha bounds against the old accepted sheet.
Never resize the actor or hitbox to compensate for incorrect art.

For a replacement, use the old accepted strip as the pose/layout reference and
preserve each frame's normalized placement, dimensions, facing and equipment.
Transfer a measured old anchor `(x,y)` initially to `(2x,2y)`; remeasure against
the new silhouette before binding. Player anchors are per frame, not inferred
from a bounding-box centre. Q6 hood alignment must remain stable in motion.
One common normalization scale for the whole strip; never fit each pose to its
own box. No frame-by-frame recentering that erases authored movement or makes
heads, feet, caps or tool grips jump.

## Art direction

Chunky, clean pixel art for an outdoor cleanup arena. Recognizable discarded
objects and practical workwear; object enemies gain personality through tilt,
crumples and movement, without faces, arms, weapons or fantasy ornaments.
Preserve the existing player's face and gear identity. Straight-on objects with
a slight top-down tilt, fixed across the roster; ground features use that same
arena view. One top-left light source, saturated readable shapes against the
dark green floor, flat shading, no photographic textures or soft light.

Use a nominal **2px outer outline at the new native resolution**, equivalent to
style 1's 1px outline. Use the darkest material hue, never pure black. Finer
interior details may use 1px accents, without dithering or scattered noise.
Exactly four available tones per material ramp; a small region need not use all
four. Opaque artwork and binary alpha only; empty pixels have alpha 0.
No semi-transparent glass, edge smoothing, glow haze, ground shadows, detached
speed lines, sparks, labels, text, logos, UI borders or painted checkerboards.
Breakage belongs only in death/cleared frames. Keep intact poses free of debris
(the old Glass Bottle detached-pixel defect must not recur).

## Palette lock

These are explicit palette values already used by the build, not ambiguous
instructions to darken a hex by a percentage. Copy ramps unchanged. A new material
must select and record its ramp before generation, not invent it per attempt.
Order: deep/outline, shadow, base, highlight.

| Material | Four colours |
| --- | --- |
| Plastic blue | `#173b73 #356fae #60a5fa #9ac8fb` |
| Pale plastic / filter paper | `#172d5f #64748b #e2e8f0 #f8fafc` |
| Glass / teal paint | `#0f4f52 #169b91 #2dd4bf #82eadc` |
| Mixed-waste violet | `#3b1762 #8050bd #c084fc #dcb5fd` |
| Protective green | `#14532d #22a34e #4ade80 #8df0ac` |
| Gear grey / metal | `#111827 #374151 #6b7280 #d1d5db` |
| Bottle neutral label | `#4b5563 #9ca3af #e2e8f0 #f8fafc` |
| Yellow plastic / trim | `#713f12 #b7791f #facc15 #fde68a` |
| Red plastic | `#7f1d1d #b91c1c #ef4444 #fca5a5` |
| Blue microplastic | `#173b73 #356fae #2563eb #93c5fd` |
| Orange waste / tool trim | `#7c2d12 #c65d1a #fb923c #fdba74` |
| Waste neutral | `#374151 #6b7280 #d1d5db #f8fafc` |
| Waste olive | `#3f4b26 #68753b #91a657 #c0d187` |
| Tool cyan (style 2) | `#164e63 #3893b5 #7dd3fc #bae6fd` |
| Impact lime (style 2) | `#365314 #65a30d #a3e635 #d9f99d` |
| Site rose (style 2) | `#881337 #be3459 #fb7185 #fecdd3` |
| Debris green (style 2) | `#101c15 #1b2b20 #23372a #51644c` |

The new ramps are art specifications for future recipes; this document does not
claim they are already supported by the five-sheet build configuration. Do not
paint elite markers into base sprites. Preserve runtime elite/shield/acceleration
cues. Colour variants, when selected, use deterministic palette rotation rather
than new generated drawings. No new collectible reward tiers or content IDs.

## Copy this shared style block verbatim

Combine this block with ONE complete subject block from SPRITE_PROMPTS.md.
Attach the current accepted Bottle and Player as style references; for a
replacement also attach that subject's accepted strip as the layout reference.
Once accepted, the style 2 Bottle becomes the new roster style reference.
Record the actual reference paths/digests with each attempt.

```text
STYLE LOCK — ARENA SURVIVOR ECO-GUARDIAN v2
Create production pixel-art sprite artwork for one subject only. Use the exact
frame size, strip dimensions, frame count and left-to-right order in the subject
block. One horizontal strip; equal cells; no gaps, margins, borders or numbering.
The frame size is already doubled; do not double it again.
Clean chunky outdoor-cleanup pixel art. Recognizable real discarded materials
and practical protective equipment. Match the attached approved style references.
Fixed slight top-down arena view; top-left light in every frame. Flat four-tone
material ramps exactly as supplied. Bold hue-dark 2px outer outline at the target
native resolution; restrained 1px interior detail, no pure black outline.
Use the increased pixel budget for clearer contours and small connected details,
while retaining the reference's proportions and chunky read at game display size.
Every cell depicts the SAME individual object: identical cap, label, dents,
seams, folds, colour regions and equipment. Only the requested pose/state changes.
Lock scale, camera, perspective and reference anchor across the strip. Never fit
each frame independently. No pose may be clipped or cross into another cell.
For replacements match normalized old-frame placement and silhouette footprint.
For new subjects leave at least 4px transparent clearance on each edge; use one
common pose envelope and scale, approximately 80–85% of the cell's longest side.
Opaque artwork on genuinely transparent RGBA background; alpha only 0 or 255.
No anti-aliasing, gradients, blur, dithering, photorealism, glow haze, shadows,
text, branding, watermark, scenery, UI, checkerboard or detached motion marks.
No new faces or limbs on rubbish. No debris in intact poses. Death may separate
material pieces, contained within that frame and recognizably from the same object.
Enemy hit frame preserves idle geometry and material identity; runtime tint supplies
hit feedback, so do not repaint the whole frame white. Keep gameplay warning
rings, direction lines and damage areas out of the artwork; the game draws them.
Output the requested strip, not a contact sheet, perspective mockup or animation.
```

## Frame contracts and continuity

Enemies: four cells `0 idle / 1 move / 2 hit / 3 death`. Idle and move are two
poses of one object, not stages of damage or different rotations of the camera.
Frame 2 has frame 0 geometry; a slight material highlight is allowed inside the
same ramp. Death is presentation only, never a reason to retain an enemy body.
Glass Shards remain stationary; their first three frames have identical placement.

Player: eight cells retained. `0–3` walk poses, `4` idle, `5` hit, `6` unused
reserved pose, `7` death. Runtime walks `0→1→2→1` by distance, not `0→1→2→3`.
Preserve that loop's matching contact poses. Frames 0–4 face right; existing hit
frame 5 is authored left and uses `stateFacing.hit = left`. Keep it left for this
layout-preserving regeneration. Frame 7 is a terminal/death pose, never a second
walk/hurt cell. No new dash mechanic or animation timing follows from frame 6.

Committed-motion enemies and bosses still use four cells. Telegraph direction,
fixed damage circles, warning/pulse/recovery timing remain code-owned; no new
attack frames are presumed reachable by the current idle/move/hit/death seam.
Validate existing cues over each new sheet. A six/eight-frame attack redesign
would require a separate presentation contract change, not just a prompt.

Tools, sites, pickups and hazards below have proposed explicit frame semantics.
Their current runtime may map only idle/move/hit/death or draw procedural
geometry. Integration must map each reachable phase deliberately; do not map an
idle/move loop to activate/spent, collection, or damaging states by accident.
No art can claim an attack hit, collected reward or site choice occurred.

## Acceptance — reject and regenerate on mismatch

1. Preserve untouched raw attempt, exact assembled prompt, tool/model when exposed,
   seed when exposed (otherwise `n/a`), references, style version and attempt ID.
   Keep old accepted/source sheets until replacements have passed review.
2. Check exact final frame/strip dimensions, order, binary alpha, approved ramps,
   outline and margins; inspect each crop for accidental second subjects or debris.
3. Overlay corresponding poses/anchors at 50% opacity in a review viewer. Compare
   normalized alpha bounds, centre/hood/grip, proportions, cap/label/seams and
   silhouette width/height; record per-frame bounds and measured anchor offsets.
   Enemy idle/hit geometry must coincide; player recoil retains its authored anchor
   and facing. Walk/contact loop must not snap at wrap.
4. Compare old/new at the SAME in-game display size and camera, against the real
   floor, alongside the accepted Bottle/Player. Approve extra detail only if the
   silhouette, material and danger remain readable at that size.
5. Inspect right/left mirrored movement, idle→move→hit→move and death, reduced
   motion and Default/Low. Check player hood stays aligned with the actor and
   existing held-tool origin; no sliding, growing, flipping discontinuity or
   immortal visual hitbox. Stationary shards must never appear to chase.
6. Tool contact must coincide with actual reach/pulse; cones and Collection Sweep
   keep their true geometry. Site available/spent and hazard warning/active/clear
   are visually distinct without obscuring runtime prompts, borders or warnings.
7. `npm run sprites -- check --theme eco-guardian` checks configured output only,
   not whether these prompts were followed. Run after recipe integration. Review
   `/sprite-browser.html` and necessary bounded live cases, then a consolidated
   eco roster/performance gate. Never label manual continuity checks automated.

Do not hand-paint repairs. Fix the subject prompt and regenerate; common style
changes bump the style version and return to Bottle first. Mechanical format,
palette and alpha conversion may be deterministic pipeline steps (REC-074/076),
but must not redraw forms, invent missing frames or independently reposition
poses. The current normalizer may need revision to retain this alignment and 2px
outline; measure it before replacing any shipped art. A doubled source normalized
back to style 1 dimensions does not satisfy the request.

## Pipeline and reproducibility limits

The build currently hardcodes five style 1 recipes in `scripts/sprites.ts`;
editing this document or manifest does not update their sizes, palettes or source
paths. Preserve existing attempt numbers and avoid overwriting accepted outputs
until the replacement recipe is reviewed. Larger frame metadata, anchor data,
atlas packing and style 2 outline handling are required integration work.
An image model may return larger separated subjects rather than exact cells.
Keep that raw file as evidence; accept only a deterministic final strip whose
layout and continuity pass all checks. Prompt consistency cannot guarantee a
correct sprite; exact dimensions and visual acceptance are separate gates.
