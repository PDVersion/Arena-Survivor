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


## Batch 1 generation claim — 2026-10-23

Owner explicitly requests creating the first batch. Branch `codex/v0.4.4`, based
on current checkout71c9b1b plus documentation preparation584ba62. Scope: Plastic
Bottle baseline, then Microplastics and Glass Bottle. Own this plan, manifest,
raw attempt PNG/prompt/metadata sidecars, versioned review sheets under
build/sprites/review/style2/, batch report, progress/status/reconciliation and
master completion record. Existing accepted/public assets and runtime remain
unchanged until the configured pipeline and live acceptance phase is verified.

Art generation may proceed for this bounded batch using reviewed Bottle as the
style reference after source-level review. Source-level review is not final
in-game acceptance. If the existing normalizer would recenter poses or lose the
requested resolution, preserve the raw outputs and use a deterministic fixed-cell
review conversion recorded with the batch; no painted repairs. Any additional
pipeline/code ownership must be claimed before editing. No player, other content
or knight-magic work in this batch.

Gate: preserve actual tool output and exact prompt/reference hashes; inspect all
four poses for material/geometry continuity, transparent background and one-row
layout; verify final review dimensions/alpha/palettes if converted, record review
versus accepted honestly, retain old source/runtime hashes. No broad browser run
for generation-only assets. Runtime integration/performance acceptance remains
open rather than implied by source-art review.


Batch1 ownership extension before code: `src/game/systems/sprites/sprite-pipeline.ts`,
`tests/unit/sprites/sprite-pipeline.test.ts`, and `scripts/sprite-review.ts` for
an opt-in fixed source-cell grid, requested2px outline and reproducible review
conversion only. Existing recipes/default normalization stay unchanged. Explicit
source-grid coordinates are recorded per attempt; one common scale, no per-frame
recentering. Verify meaningful fixed-offset/outline tests and unchanged current
five-sheet rebuild bytes. Review output never enters public/accepted automatically.


### Batch1 first-pass result — 2026-10-23

Three subjects generated: Bottle a2, Microplastics a4, Glass a3; native review
strips 256×64/192×48/384×96. [Batch report](sprites/review/style2/BATCH_1_REPORT.md)
owns exact checks and remaining layout findings.35 sprite units, types/lint/build,
current 5-sheet checks and 12unchanged accepted/public file hashes pass. Generation
checkpoint is complete; strict footprint/idle-hit alignment and final live
acceptance are not passed. All 3stay review,0 accepted. Refine prompts/regenerate
from measured bounds before production promotion; no hand-painted pose repairs.
No runtime replacement, new browser/device pass or next-content scope follows.


## Owner-selected parallel full-roster generation — 2026-10-23

Owner likes Batch1 designs and explicitly requests subagents to generate all
remaining sprites simultaneously, deferring individual corrections and in-game
review. This lifts the earlier sequential acceptance gate for generation only;
Batch1 stays review and is not silently production-accepted. Select all23remaining
catalog rows, including3previously optional icons. No further layout refinement,
production binding, balance, saved IDs, knight-theme work or browser campaign.

Three agents own disjoint asset IDs: actors (Bag, Player, Shards, Butt, Wrapper,
Can, mini/final bosses); equipment (Grabber/Vacuum/evolution, pickup,3icons); world
(five sites, three hazards). Each owns only its assigned raw PNG/prompt/metadata/
review-recipe files and review outputs. Root owns manifest claims, shared reports,
plans/status/progress/reconciliation, validation and commits. Do not concurrently
stage or commit from agents. Root records all claims before dispatch in one claim
commit to make ownership visible; one subject per acceptance commit still applies
if art is accepted later. No acceptance occurs in this generation pass.

Use imagegen skill, built-in tool, one distinct subject per call, true transparency,
style2 lock/catalog and Batch1 as references. Preserve each actual source and exact
prompt/reference hashes with honest tool/seed metadata. Save native review strips
when deterministic format conversion can preserve one common source grid/scale.
If generator layout prevents safe conversion, retain source for review and record
that specifically; do not hand-paint, invent frames or hide a skipped check.

Gate: all 26 catalog subjects have preserved generated sources/prompt evidence (3old
plus23new); intended dimensions/frame counts catalogued; available native outputs
pass format checks; shared source/runtime/accepted assets remain unchanged. Owner
visual testing, alignment and live/performance acceptance remain explicitly pending.


### Familiar Australian appearance — owner amendment during parallel generation

Owner asks that items resemble familiar everyday Australian/Sydney examples,
explicitly contrasting the angular glass shape with wine bottles or jars. Read
the design prompt and local primary reference context before generation. Root
owns Australian reference notes and a further Glass Bottle a4 wine-bottle review
alternative, retaining a3 unchanged. The familiar-object silhouette supersedes
older squat/angular art descriptors, while stable IDs, material role, frame
count and world display size remain fixed. Shared style/light/palette discipline
continues; use neutral ordinary materials with theme-colour accents rather than
turning mundane objects into magical/futuristic constructs. No new game facts,
disposal rules or prevalence-driven balance are introduced.


Root conversion ownership extension before code: sprite-pipeline.ts, its unit
file and shared converter documentation for opt-in fixed-grid `fit: contain`.
A rectangular common source cell may be letterboxed into the target using the
existing uniform min-scale and the same centering offset for every cell, without
per-pose bounding-box fitting, distortion or clipping. Default strict aspect
validation stays unchanged. This supports generated boards taller than the
requested strip; extra padding is a review concern, never a gameplay-size change.


### Parallel full-roster generation gate — complete 2026-10-23

All 26 catalog subjects have generated sources and native review strips:23 primary
plus 3icons.27 style2source/recipe sets include angular Glass a3 and familiar wine
alternative a4. Three subagents delivered their disjoint 8/7/8 groups. Root checked
26 native formats,27 deterministic rebuilds and source/reference/output digests;
36 sprite units, types/lint/build and whitespace pass. Gallery syntax/asset targets
pass; no gallery browser or in-game acceptance is claimed. [Full report](sprites/review/style2/FULL_ROSTER_REPORT.md)
and [gallery](sprites/review/style2/index.html) own inventory, evidence and known
individual review notes. Pre-existing public/accepted/runtime assets remain
unchanged. All 26stay review,0 accepted; alignment/live/performance gates remain
for later owner testing. Generation objective complete; no knight work or art
correction campaign is silently selected.

## Active owner-selected ranged phase —2026-10-23

Owner requests a new eco ranged enemy, enemy sheet, generated sprite and live
integration. Selected Takeaway Cup, neutral optional `enemy.ranged_attacker`.
This explicitly advances one new subject beyond the earlier review-only batch.
Claimant Codex root on codex/v0.4.4. Ownership: additive enemy ID/contracts and
validation, eco enemies/copy/director/bodies/sprites, pure ranged attack/shot
logic, EnemyActor/SpriteView and RunScene integration, standalone reproducible
sprite recipe/script/assets, scoped tests and matching documents. No frozen
knight content, other roster art or save fields.

Gate: exact seven-cell native64px conversion, source/prompt/reference hashes;
inspect game-size art and prepare/release/recover; pure timing/locked aim/shot
collision/expiry tests; content and persistence compatibility; typecheck, full
units, lint, production build, balance model and one bounded serial Chromium
fixture for actual harm, dodge, pause, cancellation and clean menu/restart.
Full stress/device/browser campaigns deferred under owner resource budget.
Consolidate completion in master after gates pass.
