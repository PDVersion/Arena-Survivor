> Historical evidence at its recorded revision/date. Old “current”, “next” and
> unchecked gates below are not the live work queue. See [current status](../../../BUILD_STATUS.md)
> and the remaining-work audit; later owner waivers/corrections supersede old status.

# Full eco sprite roster — generation checkpoint

2026-10-23, `codex/v0.4.4`. The owner liked the initial three designs, explicitly
requested parallel subagents to generate everything else, and deferred individual
corrections and in-game testing. All **26 catalog subjects are now generated**:
23 primary subjects plus 3 tool icons. There are27 preserved style2 attempts,
including both angular Glass a3 and the familiar wine-bottle alternative a4.
**All are review assets; no production art acceptance is claimed.**

[Open the review gallery](index.html) · [Inventory](ALL_SPRITES_INVENTORY.json) ·
[Validation](FULL_ROSTER_CHECKS.json) · [Manifest](../../MANIFEST.md) ·
[Appearance references](../../AUSTRALIAN_REFERENCE_NOTES.md).

## Delivery and provenance

Three disjoint subagents generated8 actors,7 equipment subjects and8 world objects
simultaneously. Root retained the initial 3 subjects and generated Glass a4 in
response to the owner's recognisability feedback. Built-in imagegen was used,
one distinct subject per call; no CLI fallback, hand-painted fixes or seed/model
claims. Original outputs, exact assembled prompts and reference SHA256 hashes
are retained under ../../raw/. Metadata records actual tool/model/seed availability
and the augmented familiar-object brief. Generated subjects are not new saved IDs.

Each selected subject has a native review PNG, a deterministic recipe and a
checks.json file. The gallery links its native strip, untouched raw source,
precise prompt, metadata and format checks. Its frame slider/play control is an
artwork inspection aid; cycling every frame does not assert gameplay animation,
warning timing, an attack hit, item collection or a site activation.

The original five accepted sheets and all runtime/public assets are unchanged.
New sheets keep the doubled file-dimension target; world display, physics,
weapon geometry, collision and balance do not change in this generation pass.
Future integration must deliberately bind current states and preserve actual
footprint/anchors; review-sheet resolution alone does not prove live scale.

## Familiar Australian appearance

The owner explicitly prefers ordinary recognisable objects to unusual angular
forms. The [reference notes](../../AUSTRALIAN_REFERENCE_NOTES.md) separate primary
local context from authored shape choices. Council household examples support
wine bottles and jars; NSW container examples support common drink-can/bottle
forms. Suppliers describe practical litter-grabber and vacuum construction.
No source establishes exact local market share, spawn probabilities, damage,
material hazards, universal recycling eligibility or safe handling advice.

Prompts therefore favour a long-neck cylindrical wine bottle, charcoal tied
household sack, individual spent cigarette butt, chip packet, dented beverage can,
curved broken container glass, ordinary refuse bale, dumped household bulk,
practical cleanup worker and ordinary tools. Sites use a refuse bunker, garment
rack, takeaway carton, timber pallet and bin enclosure; hazards use ground-level
spill, construction rubble and ordinary vent infrastructure. The pickup remains
a fictional game token. No knight content is generated or reopened.

## Deferred individual review notes

Owner direction is to generate the whole roster now and revisit individual art
later. These are retained findings, not blockers to this generation checkpoint:

- Batch1 footprint and idle/hit shifts remain recorded in BATCH_1_REPORT; the
  owner likes the designs but has not passed live alignment/scale acceptance.
- Player anchors/facing, all movement loops, body-size correspondence, tool
  contact/pulse/fade and hazard/site state mappings need later live review.
- Three world-site activation cells contain generated signal rays; the obstacle
  has extra warning/hit cues. They were recorded rather than hand-removed.
- Restricted site/boss palettes map natural brown timber/cardboard to olive in
  native review output. Raw sources retain brown; palette/subject refinements
  can improve realism later without discarding source evidence.
- Pickup centre/footprint varies across cells; Grabber grip drifts slightly;
  evolved nozzle width varies. Tool icons are not consistently folded/diagonal.
  Metadata retains the per-subject findings. No gameplay truth comes from art.
- Uniform contain conversion on Player, final boss and wine alternative keeps
  one source-grid transform, but padding/normalized occupancy still needs review.

Nothing is promoted automatically because a format check passes. No gameplay,
persistence, stable-ID, theme-tuning or live-asset changes follow from this pass.

## Verification actually performed

- 26 selected native strips pass exact width/height/frame-count agreement with
  the catalog, binary alpha, permitted palette and closed-outline checks.
- 27 source/review recipes (including the retained angular glass alternative)
  rebuild deterministically to identical SHA256 hashes. Raw-source, output and
  all recorded local reference hashes match.
- 36 sprite unit tests across 4 files, typecheck, lint and production build pass.
  The existing bundle-size advisory remains. Common-grid contain mode is opt-in;
  strict default aspect/crop validation still passes its prior guards.
- Baseline comparison confirms all pre-existing public, accepted sprite and
  runtime source files unchanged except the explicitly owned build-only pipeline
  module and its tests. No settings, dependencies, balance or saved IDs change.
- Gallery JavaScript syntax passes; every subject's linked native/source/prompt/
  metadata/check target exists. No browser run is claimed for the gallery.
- 521 repository-local Markdown links and 130 gallery asset targets pass.
  Whitespace checks pass. No browser/stress/soak/device campaign, server or
  recorder is started. Existing Safari/browser-OS/older physical-GPU checks stay
  waived/unverified. No push, PR, merge or publication is performed.

The selected generation objective is complete. Later work is owner-driven visual
refinement, production binding and scoped in-game acceptance, with the paused
Knights and Magic pack left untouched.
