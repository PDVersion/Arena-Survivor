# V0.4.4 — eco sprite regeneration and completed-roster art

Owner-selected direction, 2026-10-22: prepare prompts for the settled roster,
regenerate all existing sheets at twice each frame dimension, preserve the same
in-game scale and layout, and enforce consistent art and functional frames.
Knights and Magic is paused indefinitely until the owner explicitly reopens it.

[Status](BUILD_STATUS.md) owns completion/delivery evidence. Q6/G1–G4 are locally
complete in the [master log](MASTER_BUILD_PLAN.md#readable-gameplay). Their runtime
IDs and roles settle this inventory. Historical S2–S5 and obsolete 32-sheet
inventories have been retired into the master; they do not add work here.

## Current authority and ownership

- [Style guide](SPRITE_STYLE_GUIDE.md): style 2, exact shared prompt, palettes,
  resolution/anchor rules and acceptance checklist.
- [Prompt catalog](SPRITE_PROMPTS.md): 26 complete subject blocks with target
  frame/strip dimensions and ordered frame content, including five replacements.
- [Manifest](sprites/MANIFEST.md): existing accepted evidence, replacement queue,
  attempts, claims and future acceptance. Historical attempts are never overwritten.
- [Master pipeline](MASTER_BUILD_PLAN.md#v0-4-1), REC-071–078 and REC-120/121:
  sprites follow actors, never drive simulation; nearest filtering is per texture.

This session owns documentation only: AGENTS/README, build Markdown and sprite
manifest, status/progress/reconciliation, obsolete completed prompt/plan removal
and link repairs. No runtime, generated art, recipes, dependencies or evidence
files change. Prompt preparation is complete after the documentation checks below.
The request prepares generation inputs; it does not claim generated or accepted
art. No active generation claim is created by writing the catalog.

<a id="settled-roster-checkpoint-after-g4--2026-10-22"></a>
## Inventory and scale decisions

All ten current eco enemies receive sheets: Plastic Bottle, Microplastics, Glass
Bottle, Bagged Waste, Glass Shards, Cigarette Butts, Packets / Wrappers, Aluminium
Can, Compacted Waste and Dumping Colossus. Add the Environment Protector, Grabber,
Vacuum, Cyclone Vacuum, Impact Point, five sites and three hazard centre tiles.
Three static tool icons are optional companion assets, not required new UI work.
Total: **23 primary sheets + 3 optional icons**. The catalog owns exact dimensions.

Existing replacements: Bottle32→64, Microplastics24→48, Glass48→96,
Bagged Waste48→96, Player48→96 (each axis). Existing enemy4/player8 frame counts
and horizontal order remain. New subjects use the catalog's selected logical
baseline doubled in both axes; those baseline files never previously existed.
Glass Shards get a dedicated48px four-frame sheet instead of the Glass death
pose alias; preserve stationary identity and28-world-unit display.

Authored world display diameters stay: player42; Bottle36; Microplastics26;
Glass50; Bag56; Shards28; Butts28; Wrappers34; Can38; mini64; final90.
For the player retain normalized Q6 hood anchors and actual facing metadata.
Doubled canvas alone is insufficient: preserve normalized silhouette occupancy.
No new bodies, caps, skills, saved IDs, tuning, tool geometry or timings.

Procedural grabber reach/Sweep, vacuum cone/pulse/fade/splash, warning circles,
directional cues, elite/shield/acceleration treatment and grid remain code-native.
Hazard sprites are centre decoration, never authoritative area masks. Tool/site/
pickup/hazard frame lists are explicit art contracts pending runtime mapping;
they must not be driven through a generic walking loop into false gameplay states.
There are five sites, including `shrine.escalation`. Do not revive retired
Plastic Bag, fictional fragment IDs, reward tiers or Sorting Pulse.

## Ordered execution handoff

1. **Preparation (this session):** audit/consolidate completed plans; record theme
   pause; write inventory, palettes, shared lock, subjects and acceptance rules.
2. **Baseline and pipeline:** before code, claim a bounded `codex/v0.4.4` phase
   from the actual current base. Own scripts/sprites.ts, sprite pipeline/resolver/
   loader/view only as required, eco sprites.ts, relevant units, browser inspector,
   raw/accepted/public sprite outputs, manifest and matching docs. Inspect current
   normalization/atlas code: dimensions and source recipes are hardcoded, and
   outline/placement handling must support 2px style2 without per-pose auto-fit.
   Generate/accept the new Bottle baseline first with a manifest claim, keeping
   old assets until acceptance. Preserve numbered raw attempts and exact prompts.
3. **Player and five-sheet replacement checkpoint:** regenerate Microplastics,
   Glass, Bag and Player to match accepted style2 Bottle; review all same-frame
   overlays, anchors, facing, walk/hit/death transitions and actual display sizes.
   Keep world values unchanged; update frame metadata, anchor coordinates and
   atlas entries together. Do not double camera or physical actor sizes.
4. **Remaining actors:** dedicated Glass Shards, individual Butt, Wrapper, Can,
   mini and final boss. Preserve parent materials and code-owned warnings;
   accept one subject per commit and inspect each beside the current roster.
5. **Tools, pickup, sites and hazards:** integrate only with deliberate state
   mapping. Keep geometric hit/interaction/warning truth in code. Review tile
   edges/coverage before hazard integration and grip/pulse alignment before tools.
   Optional icons may follow without adding UI scope automatically.
6. **Consolidated eco acceptance:** one bounded serial roster/fallback/performance
   campaign for changed presentation; Default/Low and reduced motion, one worker,
   zero retries, inspect images and clean owned resources. Use old source-bound
   measurements only as comparison, not a current pass. Existing external Safari/
   browser-OS/older physical-GPU checks remain waived/unverified.

No new knight-themed art, balancing, copy, feature parity or dedicated knight
campaign is permitted by these steps. Retained generic contract checks may read
its frozen fixture; any required themed edits must wait for explicit reopening.
An empty/synthetic sprite map can prove generic fallback without expanding that pack.

## Verification and completion

Preparation gate:

- [x] Completed prompts removed only after their durable results are in master.
- [x] Completed multistage execution records consolidated; future proposals kept
  separately and clearly unselected; links redirected to retained master anchors.
- [x] Indefinite theme pause recorded in AGENTS and active design/plan authorities.
- [x] All current subjects and five replacements have copyable descriptions,
  exact doubled dimensions, frame roles, palettes and continuity instructions.
- [x] Documentation link/dimension/inventory checks, unchanged code/assets hashes,
  and whitespace validation pass: 489 links, 26 dimension/frame rows and 298 hashes.

Later art gate (unstarted): configured sprite checks, relevant content/architecture/
sprite units, types/lint/build, atlas/dimension/alpha verification; manual source/
processed/game-size review and necessary bounded serial gameplay cases. Review
300-actor texture cost once cumulatively, not for every prompt/art session. Check
atlas page/texture limits and startup bytes: doubled dimensions cost4× texels.
No full browser/device campaign is passed by this documentation change.
