# Copyable sprite subject prompts — eco-guardian style 2

## Familiar Australian appearance —2026-10-23

Use recognisable ordinary Australian/Sydney objects before abstract/fantasy
silhouettes. Read [appearance references](sprites/AUSTRALIAN_REFERENCE_NOTES.md).
Wine bottles/jars, drink cans, snack packets, household rubbish bags and practical
cleanup equipment guide the shapes. Theme colours accent credible materials;
they do not erase object identity. This is appearance direction, not a new factual
lesson, prevalence ranking, disposal claim, tuning change or saved content ID.
Older angular/squat Glass Bottle art is retained for comparison; a wine-bottle
alternative follows the owner direction. World display size remains unchanged.


Prepared 2026-10-22. Knights and Magic is paused indefinitely until the owner
explicitly reopens it. This catalog covers the current eco roster, including
regeneration of all five shipped sheets. It requests prompts/specifications;
no generation, acceptance or runtime replacement is claimed here.

Latest addition (2026-10-23): [Takeaway Cup](#takeaway-cup-ranged-addition) adds
one eco ranged subject, now a live seven-frame draft. Catalog27 subjects with31
preserved style2 attempts; owner art acceptance remains pending. Original26
subjects below retain their review-only status.

Current checkpoint (2026-10-23): all 26subjects are generated for review, with
27 preserved style2 attempts including the wine-bottle alternative. Owner likes
the first 3designs and explicitly defers individual fixes/in-game review.
[Gallery](sprites/review/style2/index.html) ·
[Generation report](sprites/review/style2/FULL_ROSTER_REPORT.md).
No production acceptance or live replacement is implied. Exact assembled prompts
and references for actual attempts remain beside the untouched raw outputs.

## How to copy

Copy the [shared STYLE LOCK](SPRITE_STYLE_GUIDE.md#copy-this-shared-style-block-verbatim),
then ONE complete fenced subject below. Its frame size is the final target;
do not double it again. Attach the accepted Bottle/Player style references,
and that subject's old strip when replacing it. Follow the guide's reference,
anchor, palette and acceptance rules. All palette names below refer to exact
four-colour ramps in the guide; include those ramps when pasting outside this repo.
The blocks themselves repeat their full ramps for convenient external copying.

Existing sheets retain their four/eight-frame layout. New sheets use explicitly
selected sizes; “old” sizes for previously unsprited subjects are design baselines,
not a claim that those files exist. Static weapon icons are optional companion
assets, not new archetypes or promised UI wiring. Procedural warnings, Collection
Sweep, vacuum cone/fade, elite/shield/acceleration cues and arena grid stay code-native.
No separate Glass/Bottle/Bag fragment trio, retired Plastic Bag, Sorting Pulse,
colour-variant generations, new mastery/curses icon set or reward-tier IDs.

## Inventory

| Subject | Frame target | Strip target | Frames | In-game size / contract |
| --- | --- | --- | --- | --- |
| `enemy.swarm_basic` — Plastic Bottle | 64×64 | 256×64 | 4 | 36 |
| `enemy.fast_fragile` — Microplastics | 48×48 | 192×48 | 4 | 26 |
| `enemy.slow_durable` — Glass Bottle | 96×96 | 384×96 | 4 | 50 |
| `enemy.death_spawner` — Bagged Waste | 96×96 | 384×96 | 4 | 56 |
| `character.starter` — Environment Protector | 96×96 | 768×96 | 8 | 42 |
| `enemy.stationary_fragment` — Glass Shards | 48×48 | 192×48 | 4 | 28 |
| `enemy.cluster_fodder` — Cigarette Butts | 48×48 | 192×48 | 4 | 28 |
| `enemy.gust_drifter` — Packets / Wrappers | 64×64 | 256×64 | 4 | 34 |
| `enemy.committed_charger` — Aluminium Can | 64×64 | 256×64 | 4 | 38 |
| `enemy.mini_boss` — Compacted Waste | 128×128 | 512×128 | 4 | 64 |
| `enemy.final_boss` — Dumping Colossus | 192×192 | 768×192 | 4 | 90 |
| `weapon.starter` — Cleanup Grabber action | 128×32 | 384×32 | 3 | existing procedural reach/width |
| `weapon.secondary` — Cleanup Vacuum action | 128×64 | 384×64 | 3 | existing procedural cone/pulse |
| `weapon.secondary_evolved` — Cyclone Vacuum action | 128×64 | 384×64 | 3 | same secondary procedural cone/pulse |
| `pickup.experience` — Impact Point | 32×32 | 96×32 | 3 | current reward-derived diameter |
| `shrine.spawn_surge` — Landfill Breach | 128×128 | 512×128 | 4 | existing authored site display / interaction120 |
| `shrine.greed` — Fast Fashion Boom | 128×128 | 512×128 | 4 | existing authored site display / interaction120 |
| `shrine.multiplicity` — Single-Use Boom | 128×128 | 512×128 | 4 | existing authored site display / interaction120 |
| `shrine.duplication` — Overproduction Order | 128×128 | 512×128 | 4 | existing authored site display / interaction120 |
| `shrine.escalation` — Unmanaged Dump | 128×128 | 512×128 | 4 | existing authored site display / interaction120 |
| `hazard.damage_zone` — Contamination Spill | 128×128 | 512×128 | 4 | authored hazard radius 110 |
| `hazard.obstacle` — Debris Pile | 128×128 | 512×128 | 4 | authored hazard radius 46 |
| `hazard.periodic_burst` — Methane Vent | 128×128 | 512×128 | 4 | authored hazard radius 96 |
| `icon.weapon.starter` — Cleanup Grabber icon | 64×64 | 64×64 | 1 | existing UI slot; no UI enlargement |
| `icon.weapon.secondary` — Cleanup Vacuum icon | 64×64 | 64×64 | 1 | existing UI slot; no UI enlargement |
| `icon.weapon.secondary_evolved` — Cyclone Vacuum icon | 64×64 | 64×64 | 1 | existing UI slot; no UI enlargement |

## enemy.swarm_basic — Plastic Bottle

```text
SUBJECT ID: enemy.swarm_basic — Plastic Bottle. Eco-guardian only.
TASK: replacement. Logical baseline 32×32; final native frame 64×64px.
SHEET: 4 equal cells, ONE horizontal 256×64px strip; no gutters.
IN-GAME CONTRACT: 36; unchanged by image resolution.
DESCRIPTION: One discarded crumpled single-use drink bottle; cap attached, narrow ridged neck, faded unlettered label band, broad base and distinctive dent on its left side. Keep exactly the same cap, label height and dent in every intact pose. Medium detail: neck ridge, band and dent only.
PALETTE (deep/shadow/base/highlight):
Plastic blue: #173b73 #356fae #60a5fa #9ac8fb
Bottle neutral label: #4b5563 #9ca3af #e2e8f0 #f8fafc
FRAMES, left to right, indexed from 0:
0: upright idle.
1: small forward rocking/tumbling pose, same bottle.
2: exact idle geometry for hit.
3: crushed split body, with cap and label still recognizable.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## enemy.fast_fragile — Microplastics

```text
SUBJECT ID: enemy.fast_fragile — Microplastics. Eco-guardian only.
TASK: replacement. Logical baseline 24×24; final native frame 48×48px.
SHEET: 4 equal cells, ONE horizontal 192×48px strip; no gutters.
IN-GAME CONTRACT: 26; unchanged by image resolution.
DESCRIPTION: One compact connected cluster of three or four snapped red, blue, yellow and pale packaging pieces, a low jagged silhouette with uneven peaks. Keep shard colours and their adjacency identical across intact frames. No glitter, dust, detached confetti or bag silhouette. Low interior detail. It is one actor; Bottle fragmentation reuses this identity.
PALETTE (deep/shadow/base/highlight):
Pale plastic: #172d5f #64748b #e2e8f0 #f8fafc
Red plastic: #7f1d1d #b91c1c #ef4444 #fca5a5
Blue microplastic: #173b73 #356fae #2563eb #93c5fd
Yellow plastic: #713f12 #b7791f #facc15 #fde68a
FRAMES, left to right, indexed from 0:
0: compact cluster.
1: small connected forward scuttle tilt.
2: exact idle geometry for hit.
3: a few broken larger plastic pieces, without particle dust.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## enemy.slow_durable — Glass Bottle

```text
SUBJECT ID: enemy.slow_durable — Glass Bottle. Eco-guardian only.
TASK: replacement. Logical baseline 48×48; final native frame 96×96px.
SHEET: 4 equal cells, ONE horizontal 384×96px strip; no gutters.
IN-GAME CONTRACT: 50; unchanged by image resolution.
DESCRIPTION: One familiar discarded green/teal wine bottle: rounded cylindrical body, recognisable sloping shoulders, long narrow neck and plain screw cap. A simple blank paper label band may contrast the dark glass. Use the ordinary household bottle silhouette seen in Australia, never a squat angular potion flask or crystal. Opaque pixel glass with top-left highlight; no floating cyan specks or intact-pose debris. Preserve one identical bottle between states.
PALETTE (deep/shadow/base/highlight):
Glass: #0f4f52 #169b91 #2dd4bf #82eadc
FRAMES, left to right, indexed from 0:
0: upright heavy idle.
1: small heavy side rock.
2: exact idle geometry for hit.
3: large angular teal shards, material parent of Glass Shards.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## enemy.death_spawner — Bagged Waste

```text
SUBJECT ID: enemy.death_spawner — Bagged Waste. Eco-guardian only.
TASK: replacement. Logical baseline 48×48; final native frame 96×96px.
SHEET: 4 equal cells, ONE horizontal 384×96px strip; no gutters.
IN-GAME CONTRACT: 56; unchanged by image resolution.
DESCRIPTION: One overfilled violet rubbish bag, broad lumpy base, small twisted top knot, three stable bulges and one taut crease. No face or limbs. Preserve knot and fold locations. Death opens the same bag; visible contents suggest plastic bottle, coloured plastic pieces and teal glass without drawing extra living actors. Actual finite offspring are spawned by game code.
PALETTE (deep/shadow/base/highlight):
Mixed-waste violet: #3b1762 #8050bd #c084fc #dcb5fd
Waste neutral: #374151 #6b7280 #d1d5db #f8fafc
Waste olive: #3f4b26 #68753b #91a657 #c0d187
Orange waste / tool trim: #7c2d12 #c65d1a #fb923c #fdba74
FRAMES, left to right, indexed from 0:
0: sealed bulging idle.
1: slight lean with attached knot swinging.
2: exact idle geometry for hit.
3: torn open same bag with inert recognizable mixed contents.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## character.starter — Environment Protector

```text
SUBJECT ID: character.starter — Environment Protector. Eco-guardian only.
TASK: replacement. Logical baseline 48×48; final native frame 96×96px.
SHEET: 8 equal cells, ONE horizontal 768×96px strip; no gutters.
IN-GAME CONTRACT: 42; unchanged by image resolution.
DESCRIPTION: The SAME hooded cleanup operative as the accepted player: green protective jacket, gloves, sturdy boots, collection backpack and compact tool, same face, gear and asymmetric pack side. Practical, capable, not military. Preserve head-to-body proportions, backpack, tool hand and clothing seams. Use the old strip as exact pose-layout reference; double its measured per-frame hood anchors initially and verify them after normalization.
PALETTE (deep/shadow/base/highlight):
Protective green: #14532d #22a34e #4ade80 #8df0ac
Gear grey / metal: #111827 #374151 #6b7280 #d1d5db
Yellow plastic / trim: #713f12 #b7791f #facc15 #fde68a
Orange waste / tool trim: #7c2d12 #c65d1a #fb923c #fdba74
FRAMES, left to right, indexed from 0:
0: walk contact facing right.
1: walk down facing right.
2: walk pass facing right, compatible with 0→1→2→3 loop.
3: second passing step facing right, opposite knee/boot lifted from frame 1.
4: standing idle facing right.
5: hit recoil authored LEFT as existing stateFacing.hit requires.
6: retained unused reserved pose.
7: terminal collapse/death, never a living walk or dash pose.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## enemy.stationary_fragment — Glass Shards

```text
SUBJECT ID: enemy.stationary_fragment — Glass Shards. Eco-guardian only.
TASK: new dedicated sheet. Logical baseline 24×24; final native frame 48×48px.
SHEET: 4 equal cells, ONE horizontal 192×48px strip; no gutters.
IN-GAME CONTRACT: 28; unchanged by image resolution.
DESCRIPTION: One small low patch of two or three large jagged pieces from the regenerated Glass Bottle death frame, same teal ramp, thick fractured edges and top-left highlights. All pieces fit one small footprint. This is stationary clearable glass, not a mobile creature, sparkle or new timed hazard. Match parent shard shapes/material; no intact bottle neck.
PALETTE (deep/shadow/base/highlight):
Glass: #0f4f52 #169b91 #2dd4bf #82eadc
FRAMES, left to right, indexed from 0:
0: resting shard patch.
1: identical resting placement, no walk.
2: identical patch for hit.
3: flattened/cleared broken pieces within the same footprint.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## enemy.cluster_fodder — Cigarette Butts

```text
SUBJECT ID: enemy.cluster_fodder — Cigarette Butts. Eco-guardian only.
TASK: new. Logical baseline 24×24; final native frame 48×48px.
SHEET: 4 equal cells, ONE horizontal 192×48px strip; no gutters.
IN-GAME CONTRACT: 28; unchanged by image resolution.
DESCRIPTION: ONE discarded cigarette butt per cell: short pale paper/filter cylinder, orange filter end, compressed dark ash tip; same end orientation and paper crease throughout. The game places three separate actors in an arrival group: do not draw a group of three in one sprite. No smoke, flame, branding or mouth.
PALETTE (deep/shadow/base/highlight):
Pale plastic / filter paper: #172d5f #64748b #e2e8f0 #f8fafc
Orange waste / tool trim: #7c2d12 #c65d1a #fb923c #fdba74
Gear grey / metal: #111827 #374151 #6b7280 #d1d5db
FRAMES, left to right, indexed from 0:
0: single resting diagonal butt.
1: tiny rocking change of the same butt.
2: exact idle geometry for hit.
3: same butt crumpled with inert ash tip, no cloud.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## enemy.gust_drifter — Packets / Wrappers

```text
SUBJECT ID: enemy.gust_drifter — Packets / Wrappers. Eco-guardian only.
TASK: new. Logical baseline 32×32; final native frame 64×64px.
SHEET: 4 equal cells, ONE horizontal 256×64px strip; no gutters.
IN-GAME CONTRACT: 34; unchanged by image resolution.
DESCRIPTION: ONE empty violet soft-plastic snack wrapper, broad crinkled rectangle, serrated sealed ends and one yellow unlettered central band. Distinct from bag and microplastic cluster. Maintain identical folds, torn corner and band placement as it flexes. Runtime directional warning and fixed oblique gust remain visible outside it.
PALETTE (deep/shadow/base/highlight):
Mixed-waste violet: #3b1762 #8050bd #c084fc #dcb5fd
Yellow plastic / trim: #713f12 #b7791f #facc15 #fde68a
FRAMES, left to right, indexed from 0:
0: relaxed crinkle.
1: shallow flex/billow of the same wrapper.
2: exact idle geometry for hit.
3: flattened torn wrapper, no speed lines or flying scraps.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## enemy.committed_charger — Aluminium Can

```text
SUBJECT ID: enemy.committed_charger — Aluminium Can. Eco-guardian only.
TASK: new. Logical baseline 32×32; final native frame 64×64px.
SHEET: 4 equal cells, ONE horizontal 256×64px strip; no gutters.
IN-GAME CONTRACT: 38; unchanged by image resolution.
DESCRIPTION: ONE dented aluminium drink can lying on its side, readable rim at both ends, teal unlettered body band and one stable dent. Rounded short cylinder, broad metallic contour, clearly unlike tall bottles or a wrapper. Code supplies direct-roll warning and committed movement; keep endpoints and dent tied to the same can between poses.
PALETTE (deep/shadow/base/highlight):
Gear grey / metal: #111827 #374151 #6b7280 #d1d5db
Glass / teal paint: #0f4f52 #169b91 #2dd4bf #82eadc
FRAMES, left to right, indexed from 0:
0: resting side-on can.
1: modest rolling rock of same cylinder with matching band/rims.
2: exact idle geometry for hit.
3: crushed can retaining metallic rims and teal band.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## enemy.mini_boss — Compacted Waste

```text
SUBJECT ID: enemy.mini_boss — Compacted Waste. Eco-guardian only.
TASK: new. Logical baseline 64×64; final native frame 128×128px.
SHEET: 4 equal cells, ONE horizontal 512×128px strip; no gutters.
IN-GAME CONTRACT: 64; unchanged by image resolution.
DESCRIPTION: ONE low dense bale of compacted mixed waste, squared heavy silhouette, flattened blue packaging and teal glass embedded in a neutral compressed block, two binding straps. Distinct from Bagged Waste: no sack or knot. Same embedded pieces and strap paths in all intact poses. Fixed-circle warning/pulse/recovery and health label are drawn by runtime; no baked danger ring.
PALETTE (deep/shadow/base/highlight):
Glass: #0f4f52 #169b91 #2dd4bf #82eadc
Waste neutral: #374151 #6b7280 #d1d5db #f8fafc
Plastic blue: #173b73 #356fae #60a5fa #9ac8fb
FRAMES, left to right, indexed from 0:
0: heavy compacted idle.
1: small weight-shift maintaining block identity.
2: exact idle geometry for hit.
3: split compressed bale with broken straps and bounded inert waste.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## enemy.final_boss — Dumping Colossus

```text
SUBJECT ID: enemy.final_boss — Dumping Colossus. Eco-guardian only.
TASK: new. Logical baseline 96×96; final native frame 192×192px.
SHEET: 4 equal cells, ONE horizontal 768×192px strip; no gutters.
IN-GAME CONTRACT: 90; unchanged by image resolution.
DESCRIPTION: ONE towering broad mound of dumped mixed rubbish, violet bag mass interlocked with neutral bulk refuse, recognizable blue plastic and teal glass embedded throughout. Strong stepped shoulders and heavy wide base distinguish it from the smaller strapped bale. No humanoid limbs, face, castle, magical crown or new hazard source. Preserve every major embedded object between poses. Warning circle and boss terminal state stay code-owned.
PALETTE (deep/shadow/base/highlight):
Mixed-waste violet: #3b1762 #8050bd #c084fc #dcb5fd
Waste neutral: #374151 #6b7280 #d1d5db #f8fafc
Waste olive: #3f4b26 #68753b #91a657 #c0d187
Plastic blue: #173b73 #356fae #60a5fa #9ac8fb
Glass: #0f4f52 #169b91 #2dd4bf #82eadc
FRAMES, left to right, indexed from 0:
0: imposing stable mound.
1: slight ponderous weight shift.
2: exact idle geometry for hit.
3: collapsed inert mound of the same materials, contained within cell.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## weapon.starter — Cleanup Grabber action

```text
SUBJECT ID: weapon.starter — Cleanup Grabber action. Eco-guardian only.
TASK: new proposed action strip. Logical baseline 64×16; final native frame 128×32px.
SHEET: 3 equal cells, ONE horizontal 384×32px strip; no gutters.
IN-GAME CONTRACT: existing procedural reach/width; unchanged by image resolution.
DESCRIPTION: ONE practical long narrow litter pickup grabber pointing RIGHT, grip at the left, straight cyan shaft, fixed hinge and two green forked jaws at the right. Same shaft length and thickness in all cells. Lock grip pivot at (8,16) in each target 128×32 cell. Code owns extension/retraction translation and reach growth, so never draw three different-length shafts. No sword, projectile, muzzle flash or trail.
PALETTE (deep/shadow/base/highlight):
Tool cyan: #164e63 #3893b5 #7dd3fc #bae6fd
Protective green: #14532d #22a34e #4ade80 #8df0ac
Gear grey / metal: #111827 #374151 #6b7280 #d1d5db
FRAMES, left to right, indexed from 0:
0: extending/open jaws.
1: contact/closed jaws meeting at the tip.
2: retracting/opening jaws, identical grip/shaft geometry.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## weapon.secondary — Cleanup Vacuum action

```text
SUBJECT ID: weapon.secondary — Cleanup Vacuum action. Eco-guardian only.
TASK: new proposed tool strip. Logical baseline 64×32; final native frame 128×64px.
SHEET: 3 equal cells, ONE horizontal 384×64px strip; no gutters.
IN-GAME CONTRACT: existing procedural cone/pulse; unchanged by image resolution.
DESCRIPTION: ONE practical compact cleanup vacuum nozzle and small motor housing, aimed RIGHT, green handle, cyan intake rim and dark grey casing. Lock mounting pivot (16,32) in each target 128×64 cell and keep nozzle aperture at the same location. Draw tool only. The cone, splash, target caps, pulse versus fade are drawn by game code; never fill a cell with a fake damaging funnel.
PALETTE (deep/shadow/base/highlight):
Tool cyan: #164e63 #3893b5 #7dd3fc #bae6fd
Protective green: #14532d #22a34e #4ade80 #8df0ac
Gear grey / metal: #111827 #374151 #6b7280 #d1d5db
FRAMES, left to right, indexed from 0:
0: ready housing.
1: active intake vanes open, same mount/aperture.
2: recovery housing, same scale.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## weapon.secondary_evolved — Cyclone Vacuum action

```text
SUBJECT ID: weapon.secondary_evolved — Cyclone Vacuum action. Eco-guardian only.
TASK: new proposed tool strip. Logical baseline 64×32; final native frame 128×64px.
SHEET: 3 equal cells, ONE horizontal 384×64px strip; no gutters.
IN-GAME CONTRACT: same secondary procedural cone/pulse; unchanged by image resolution.
DESCRIPTION: The evolved version of the approved Cleanup Vacuum: SAME mount, nozzle position and basic housing, with a second visible intake ring and yellow reinforcement band. A recognizable equipment upgrade, not an unrelated weapon or larger damage region. Lock mounting pivot (16,32) in each target 128×64 cell. No tornado, detached particles or baked cone.
PALETTE (deep/shadow/base/highlight):
Tool cyan: #164e63 #3893b5 #7dd3fc #bae6fd
Protective green: #14532d #22a34e #4ade80 #8df0ac
Gear grey / metal: #111827 #374151 #6b7280 #d1d5db
Yellow plastic / trim: #713f12 #b7791f #facc15 #fde68a
FRAMES, left to right, indexed from 0:
0: reinforced ready.
1: active paired intake rings, same aperture.
2: recovery, same mount and footprint.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## pickup.experience — Impact Point

```text
SUBJECT ID: pickup.experience — Impact Point. Eco-guardian only.
TASK: new proposed collectible strip. Logical baseline 16×16; final native frame 32×32px.
SHEET: 3 equal cells, ONE horizontal 96×32px strip; no gutters.
IN-GAME CONTRACT: current reward-derived diameter; unchanged by image resolution.
DESCRIPTION: ONE small angular recovered-material credit token: compact lime diamond, two broad facets and a bright connected centre. Distinct from irregular microplastic and glass. Same outer silhouette and centre in all cells. No letters, number, halo or extra tiers. Runtime owns reward, magnetism, merge scale and collection.
PALETTE (deep/shadow/base/highlight):
Impact lime: #365314 #65a30d #a3e635 #d9f99d
FRAMES, left to right, indexed from 0:
0: idle facets.
1: brighter internal facet pulse, unchanged size.
2: collection highlight compressed inside same diamond envelope.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## shrine.spawn_surge — Landfill Breach

```text
SUBJECT ID: shrine.spawn_surge — Landfill Breach. Eco-guardian only.
TASK: new proposed site strip. Logical baseline 64×64; final native frame 128×128px.
SHEET: 4 equal cells, ONE horizontal 512×128px strip; no gutters.
IN-GAME CONTRACT: existing authored site display / interaction120; unchanged by image resolution.
DESCRIPTION: ONE fixed cleanup event landmark: a split refuse cell exposed under a broken rim, packed inert rubbish visible in the opening. Practical environmental fiction, no runes, altar, fantasy crystal or readable text. Rose signal panels share one visual language across all FIVE sites, but each silhouette stays distinct. Lock the structure base at (64,112) in every target 128×128 cell. Lighting changes within existing panels; structure never grows, teleports or changes inventory. Runtime retains exact event schedule, choice prompt and available/spent truth.
PALETTE (deep/shadow/base/highlight):
Site rose: #881337 #be3459 #fb7185 #fecdd3
Waste neutral: #374151 #6b7280 #d1d5db #f8fafc
Waste olive: #3f4b26 #68753b #91a657 #c0d187
FRAMES, left to right, indexed from 0:
0: dormant structure.
1: available with brighter rose panels.
2: activation accent within same structure.
3: spent with panels dark, same base and silhouette.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## shrine.greed — Fast Fashion Boom

```text
SUBJECT ID: shrine.greed — Fast Fashion Boom. Eco-guardian only.
TASK: new proposed site strip. Logical baseline 64×64; final native frame 128×128px.
SHEET: 4 equal cells, ONE horizontal 512×128px strip; no gutters.
IN-GAME CONTRACT: existing authored site display / interaction120; unchanged by image resolution.
DESCRIPTION: ONE fixed cleanup event landmark: a leaning rack of discarded garments with blank tags and one sagging rail. Practical environmental fiction, no runes, altar, fantasy crystal or readable text. Rose signal panels share one visual language across all FIVE sites, but each silhouette stays distinct. Lock the structure base at (64,112) in every target 128×128 cell. Lighting changes within existing panels; structure never grows, teleports or changes inventory. Runtime retains exact event schedule, choice prompt and available/spent truth.
PALETTE (deep/shadow/base/highlight):
Site rose: #881337 #be3459 #fb7185 #fecdd3
Waste neutral: #374151 #6b7280 #d1d5db #f8fafc
Waste olive: #3f4b26 #68753b #91a657 #c0d187
FRAMES, left to right, indexed from 0:
0: dormant structure.
1: available with brighter rose panels.
2: activation accent within same structure.
3: spent with panels dark, same base and silhouette.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## shrine.multiplicity — Single-Use Boom

```text
SUBJECT ID: shrine.multiplicity — Single-Use Boom. Eco-guardian only.
TASK: new proposed site strip. Logical baseline 64×64; final native frame 128×128px.
SHEET: 4 equal cells, ONE horizontal 512×128px strip; no gutters.
IN-GAME CONTRACT: existing authored site display / interaction120; unchanged by image resolution.
DESCRIPTION: ONE fixed cleanup event landmark: an open dispensing crate stacked with repeated empty unlettered cups and packaging. Practical environmental fiction, no runes, altar, fantasy crystal or readable text. Rose signal panels share one visual language across all FIVE sites, but each silhouette stays distinct. Lock the structure base at (64,112) in every target 128×128 cell. Lighting changes within existing panels; structure never grows, teleports or changes inventory. Runtime retains exact event schedule, choice prompt and available/spent truth.
PALETTE (deep/shadow/base/highlight):
Site rose: #881337 #be3459 #fb7185 #fecdd3
Waste neutral: #374151 #6b7280 #d1d5db #f8fafc
Waste olive: #3f4b26 #68753b #91a657 #c0d187
FRAMES, left to right, indexed from 0:
0: dormant structure.
1: available with brighter rose panels.
2: activation accent within same structure.
3: spent with panels dark, same base and silhouette.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## shrine.duplication — Overproduction Order

```text
SUBJECT ID: shrine.duplication — Overproduction Order. Eco-guardian only.
TASK: new proposed site strip. Logical baseline 64×64; final native frame 128×128px.
SHEET: 4 equal cells, ONE horizontal 512×128px strip; no gutters.
IN-GAME CONTRACT: existing authored site display / interaction120; unchanged by image resolution.
DESCRIPTION: ONE fixed cleanup event landmark: a strapped shipping pallet with duplicate unlettered cartons and a blank pinned order sheet. Practical environmental fiction, no runes, altar, fantasy crystal or readable text. Rose signal panels share one visual language across all FIVE sites, but each silhouette stays distinct. Lock the structure base at (64,112) in every target 128×128 cell. Lighting changes within existing panels; structure never grows, teleports or changes inventory. Runtime retains exact event schedule, choice prompt and available/spent truth.
PALETTE (deep/shadow/base/highlight):
Site rose: #881337 #be3459 #fb7185 #fecdd3
Waste neutral: #374151 #6b7280 #d1d5db #f8fafc
Waste olive: #3f4b26 #68753b #91a657 #c0d187
FRAMES, left to right, indexed from 0:
0: dormant structure.
1: available with brighter rose panels.
2: activation accent within same structure.
3: spent with panels dark, same base and silhouette.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## shrine.escalation — Unmanaged Dump

```text
SUBJECT ID: shrine.escalation — Unmanaged Dump. Eco-guardian only.
TASK: new proposed site strip. Logical baseline 64×64; final native frame 128×128px.
SHEET: 4 equal cells, ONE horizontal 512×128px strip; no gutters.
IN-GAME CONTRACT: existing authored site display / interaction120; unchanged by image resolution.
DESCRIPTION: ONE fixed cleanup event landmark: an overflowing refuse enclosure with a failed barrier and accumulating bags. Practical environmental fiction, no runes, altar, fantasy crystal or readable text. Rose signal panels share one visual language across all FIVE sites, but each silhouette stays distinct. Lock the structure base at (64,112) in every target 128×128 cell. Lighting changes within existing panels; structure never grows, teleports or changes inventory. Runtime retains exact event schedule, choice prompt and available/spent truth.
PALETTE (deep/shadow/base/highlight):
Site rose: #881337 #be3459 #fb7185 #fecdd3
Waste neutral: #374151 #6b7280 #d1d5db #f8fafc
Waste olive: #3f4b26 #68753b #91a657 #c0d187
FRAMES, left to right, indexed from 0:
0: dormant structure.
1: available with brighter rose panels.
2: activation accent within same structure.
3: spent with panels dark, same base and silhouette.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## hazard.damage_zone — Contamination Spill

```text
SUBJECT ID: hazard.damage_zone — Contamination Spill. Eco-guardian only.
TASK: new proposed centre tile. Logical baseline 64×64; final native frame 128×128px.
SHEET: 4 equal cells, ONE horizontal 512×128px strip; no gutters.
IN-GAME CONTRACT: authored hazard radius 110; unchanged by image resolution.
DESCRIPTION: ONE ground feature: a low crust-edged patch of fictional contaminated runoff, irregular connected internal islands, no flying liquid. This is a centre decoration, not the entire damage area. Keep silhouette/placement fixed and use the same arena tilt/light as the roster. Runtime retains exact authored area, border and warnings; do not stretch a square tile into the collision shape. Edge/tile treatment must be reviewed before integration.
PALETTE (deep/shadow/base/highlight):
Orange waste / tool trim: #7c2d12 #c65d1a #fb923c #fdba74
Waste olive: #3f4b26 #68753b #91a657 #c0d187
FRAMES, left to right, indexed from 0:
0: warning surface.
1: active surface.
2: alternate active internal ripple, same outer edge.
3: expired inert residue.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## hazard.obstacle — Debris Pile

```text
SUBJECT ID: hazard.obstacle — Debris Pile. Eco-guardian only.
TASK: new proposed centre tile. Logical baseline 64×64; final native frame 128×128px.
SHEET: 4 equal cells, ONE horizontal 512×128px strip; no gutters.
IN-GAME CONTRACT: authored hazard radius 46; unchanged by image resolution.
DESCRIPTION: ONE ground feature: a low solid heap of bulky inert debris with an unmistakable blocked silhouette and the same large stones/scrap in all intact cells. This is a centre decoration, not the entire damage area. Keep silhouette/placement fixed and use the same arena tilt/light as the roster. Runtime retains exact authored area, border and warnings; do not stretch a square tile into the collision shape. Edge/tile treatment must be reviewed before integration.
PALETTE (deep/shadow/base/highlight):
Debris green: #101c15 #1b2b20 #23372a #51644c
Waste neutral: #374151 #6b7280 #d1d5db #f8fafc
FRAMES, left to right, indexed from 0:
0: warning heap.
1: solid intact heap.
2: hit with identical footprint.
3: cleared flattened remnants.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## hazard.periodic_burst — Methane Vent

```text
SUBJECT ID: hazard.periodic_burst — Methane Vent. Eco-guardian only.
TASK: new proposed centre tile. Logical baseline 64×64; final native frame 128×128px.
SHEET: 4 equal cells, ONE horizontal 512×128px strip; no gutters.
IN-GAME CONTRACT: authored hazard radius 96; unchanged by image resolution.
DESCRIPTION: ONE ground feature: a cracked low vent with a stable rim and a connected rose inner opening; suggest pressure using the opening, no smoke plume that hides actors. This is a centre decoration, not the entire damage area. Keep silhouette/placement fixed and use the same arena tilt/light as the roster. Runtime retains exact authored area, border and warnings; do not stretch a square tile into the collision shape. Edge/tile treatment must be reviewed before integration.
PALETTE (deep/shadow/base/highlight):
Site rose: #881337 #be3459 #fb7185 #fecdd3
Debris green: #101c15 #1b2b20 #23372a #51644c
FRAMES, left to right, indexed from 0:
0: dormant opening.
1: warning brighter opening.
2: active opening brightest.
3: recovery dim opening.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## icon.weapon.starter — Cleanup Grabber icon

```text
SUBJECT ID: icon.weapon.starter — Cleanup Grabber icon. Eco-guardian only.
TASK: new optional presentation asset. Logical baseline 32×32; final native frame 64×64px.
SHEET: 1 equal cells, ONE horizontal 64×64px strip; no gutters.
IN-GAME CONTRACT: existing UI slot; no UI enlargement; unchanged by image resolution.
DESCRIPTION: ONE folded litter grabber with clearly separated grip, hinge, shaft and forked jaws. Match the corresponding approved tool action artwork exactly in material and construction; diagonal resting composition, no UI frame, text or invented equipment. This is an asset key only, never a new saved content ID.
PALETTE (deep/shadow/base/highlight):
Tool cyan: #164e63 #3893b5 #7dd3fc #bae6fd
Protective green: #14532d #22a34e #4ade80 #8df0ac
Gear grey / metal: #111827 #374151 #6b7280 #d1d5db
Yellow plastic / trim: #713f12 #b7791f #facc15 #fde68a
FRAMES, left to right, indexed from 0:
0: static ready icon.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## icon.weapon.secondary — Cleanup Vacuum icon

```text
SUBJECT ID: icon.weapon.secondary — Cleanup Vacuum icon. Eco-guardian only.
TASK: new optional presentation asset. Logical baseline 32×32; final native frame 64×64px.
SHEET: 1 equal cells, ONE horizontal 64×64px strip; no gutters.
IN-GAME CONTRACT: existing UI slot; no UI enlargement; unchanged by image resolution.
DESCRIPTION: ONE compact cleanup vacuum with green handle, cyan intake and dark casing. Match the corresponding approved tool action artwork exactly in material and construction; diagonal resting composition, no UI frame, text or invented equipment. This is an asset key only, never a new saved content ID.
PALETTE (deep/shadow/base/highlight):
Tool cyan: #164e63 #3893b5 #7dd3fc #bae6fd
Protective green: #14532d #22a34e #4ade80 #8df0ac
Gear grey / metal: #111827 #374151 #6b7280 #d1d5db
Yellow plastic / trim: #713f12 #b7791f #facc15 #fde68a
FRAMES, left to right, indexed from 0:
0: static ready icon.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

## icon.weapon.secondary_evolved — Cyclone Vacuum icon

```text
SUBJECT ID: icon.weapon.secondary_evolved — Cyclone Vacuum icon. Eco-guardian only.
TASK: new optional presentation asset. Logical baseline 32×32; final native frame 64×64px.
SHEET: 1 equal cells, ONE horizontal 64×64px strip; no gutters.
IN-GAME CONTRACT: existing UI slot; no UI enlargement; unchanged by image resolution.
DESCRIPTION: ONE same vacuum with paired intake rings and yellow reinforcement band. Match the corresponding approved tool action artwork exactly in material and construction; diagonal resting composition, no UI frame, text or invented equipment. This is an asset key only, never a new saved content ID.
PALETTE (deep/shadow/base/highlight):
Tool cyan: #164e63 #3893b5 #7dd3fc #bae6fd
Protective green: #14532d #22a34e #4ade80 #8df0ac
Gear grey / metal: #111827 #374151 #6b7280 #d1d5db
Yellow plastic / trim: #713f12 #b7791f #facc15 #fde68a
FRAMES, left to right, indexed from 0:
0: static ready icon.
CONTINUITY: one object, one scale, one camera and one top-left light. Preserve
material regions and anchor; no per-frame auto-fit, detached marks or new anatomy.
```

<a id="takeaway-cup-ranged-addition"></a>
## Takeaway Cup — ranged addition

Combine the shared style block with this subject. Attach Bottle a2 for style and
[cup a3](sprites/review/style2/enemy_ranged_attacker.a3.png) for design/poses.
For exact reproduction inputs use the immutable [assembled a3 prompt](sprites/raw/enemy_ranged_attacker.a3.prompt.txt)
and [reference hashes](sprites/raw/enemy_ranged_attacker.a3.metadata.json).
Next attempt a5; claim before generating. [Enemy sheet](enemies/TAKEAWAY_CUP.md)
owns runtime tuning and pending art review.

```text
SUBJECT: enemy.ranged_attacker — Takeaway Cup, eco only. New ranged role.
One unbranded takeaway coffee cup: tapered cream paper, brown cardboard sleeve,
dark snap-on lid, drinking opening RIGHT, stable small lower-left crease.
Familiar café cup proportions, no handle, straw, face, limbs or fantasy details.
SHEET: seven64×64 cells, one horizontal448×64 strip. Already double logical32.
Shared scale/camera/light and base anchor; every object stays in its own equal
cell with4px clearance. Centre x positions32,96,160,224,288,352,416.
No per-pose auto-fit. Keep idle/hit geometry and base position pixel-identical.
FRAMES:
0 upright idle, lid closed.
1 modest right rock, same cup/sleeve/lid/crease and base anchor.
2 exact idle geometry, runtime supplies hit flash.
3 compact crushed cup with lid on top, not wide detached side-by-side pieces.
4 backward LEFT tip, lid centre left of base; dry lip, no floating coffee.
5 forward RIGHT tip, lid centre right of base; tiny coffee bead connected at lip.
6 upright recovery, slight depressed lid, same base and scale.
Paper ramp: #172d5f #64748b #e2e8f0 #f8fafc.
Lid ramp: #111827 #374151 #6b7280 #d1d5db.
Sleeve/coffee ramp: #713f12 #b7791f #facc15 #fde68a; deep brown dominates.
2px hue-dark outline, top-left light, chunky clean outdoor-cleanup pixel style.
True RGBA transparency, binary alpha; no backgrounds, shadows, glow, labels,
text, logo, checkerboard, detached motion marks or independent projectile.
Code draws warning/shot; prepare/release/recover must stay visibly distinct.
References are style/design only; do not include the reference bottles/player.
```
