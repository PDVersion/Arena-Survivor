## Bulk integration claim —2026-10-26

Owner explicitly selects all new eco sprites and removal of old sprites. Codex
claims the existing 27 outputs (no new generation) for production binding under
[the bounded phase](../SPRITE_PLAN_V0.4.4.md#bulk-live-switch--claimed-2026-10-26-before-code).
Raw prompts/sources and historical evidence stay preserved. Art refinements are
reviewed during normal play; this selection is not a claim of perfect continuity.

# Sprite manifest — accepted evidence and style 2 queue

Knights and Magic is paused indefinitely until the owner explicitly reopens it.
This queue covers `eco-guardian` only. [Plan](../SPRITE_PLAN_V0.4.4.md),
[style/acceptance](../SPRITE_STYLE_GUIDE.md), [copyable prompts](../SPRITE_PROMPTS.md).

**Live: five accepted style1 sheets plus one style2 Takeaway Cup draft.**
Style2 catalog27 subjects /31 preserved attempts /0 owner-accepted subjects.
The original26 are review-only. The new ranged cup alone is live by explicit
owner request to draft and integrate it. Format checks/software gate pass;
owner art/strict continuity acceptance is pending. Its normalized live copy is
kept in accepted/ for rebuild parity; that path does not imply owner art approval.
[Gallery](review/style2/index.html) · [cup sheet](../enemies/TAKEAWAY_CUP.md) ·
[verification](../content/RANGED_ENEMY_REPORT.md). Existing five replacements stay
pending and their shipped sources/atlas remain unchanged.

Fresh2026-10-23 [file audit](review/style2/PROGRESS_REPORT.md):27/27 native outputs,
102 cells and31 raw attempts verified; all27 format/hash/rebuild checks pass.
No active generation claim. Art acceptance and live integration remain separate.

## Existing accepted baseline (unchanged)

| ID | Frame | Frames | Style | Latest raw attempt | Status |
| --- | --- | --- | --- | --- | --- |
| `enemy.swarm_basic` |32×32|4|1|a1|accepted, replacement pending|
| `enemy.fast_fragile` |24×24|4|1|a3|accepted, replacement pending|
| `enemy.slow_durable` |48×48|4|1|a2|accepted, replacement pending|
| `enemy.death_spawner` |48×48|4|1|a2|accepted, replacement pending|
| `character.starter` |48×48|8|1|a2|accepted, replacement pending|

## Claim and acceptance workflow

Before generation, select the next eligible row under the plan's ordered gate.
Set target status `generating`, claimant/session and next attempt; commit that
claim separately (`sprites: claim {id}`). One accepted subject per commit with
raw source, prompt/reference evidence, configured build outputs and manifest row.
No fresh generation follows just from the `todo` status; the baseline/pipeline
phase must first be claimed. Do not take over an old claim without checking its
actual progress and recording the handoff.

Raw path: `build/sprites/raw/{id_with_underscores}.a{next}.png`, never overwritten.
Record the EXACT assembled style+subject prompt, reference hashes, date, exposed
model/seed (otherwise n/a), conversion recipe and acceptance observations in an
attempt sidecar. A seed alone cannot reproduce stochastic generated art.
Keep old accepted sheets until a replacement passes manual continuity/game-size
review and configured deterministic checks. No hand-painted fixes.
Status: `todo`, `generating`, `review`, `accepted`, `rejected`. Optional icons
start `optional`, and become todo only when selected. Asset keys for icons are
not content/saved IDs. Same-world-size regeneration never creates a new archetype.

## Style 2 queue

All rows use style2; attempts and claimant are empty until actual generation.
Next attempt is computed from preserved raw files, not reset to a1 for replacements.
Current descriptions and frame roles live in the catalog; immutable assembled prompts
for actual generated attempts are preserved beside their raw sources.

| ID | Subject | Target frame | Frames | Next attempt | Claimed by | Target status |
| --- | --- | --- | --- | --- | --- | --- |
| `enemy.swarm_basic` | Plastic Bottle | 64×64 | 4 | a2 | Codex 2026-10-23 | review |
| `enemy.fast_fragile` | Microplastics | 48×48 | 4 | a4 | Codex 2026-10-23 | review |
| `enemy.slow_durable` | Glass Bottle | 96×96 | 4 | a4 | Codex root 2026-10-23 | review |
| `enemy.death_spawner` | Bagged Waste | 96×96 | 4 | a3 | Codex actors 2026-10-23 | review |
| `character.starter` | Environment Protector | 96×96 | 8 | a3 | Codex actors 2026-10-23 | review |
| `enemy.stationary_fragment` | Glass Shards | 48×48 | 4 | a1 | Codex actors 2026-10-23 | review |
| `enemy.cluster_fodder` | Cigarette Butts | 48×48 | 4 | a1 | Codex actors 2026-10-23 | review |
| `enemy.gust_drifter` | Packets / Wrappers | 64×64 | 4 | a1 | Codex actors 2026-10-23 | review |
| `enemy.committed_charger` | Aluminium Can | 64×64 | 4 | a1 | Codex actors 2026-10-23 | review |
| `enemy.mini_boss` | Compacted Waste | 128×128 | 4 | a1 | Codex actors 2026-10-23 | review |
| `enemy.final_boss` | Dumping Colossus | 192×192 | 4 | a1 | Codex actors 2026-10-23 | review |
| `weapon.starter` | Cleanup Grabber action | 128×32 | 3 | a1 | Codex equipment 2026-10-23 | review |
| `weapon.secondary` | Cleanup Vacuum action | 128×64 | 3 | a1 | Codex equipment 2026-10-23 | review |
| `weapon.secondary_evolved` | Cyclone Vacuum action | 128×64 | 3 | a1 | Codex equipment 2026-10-23 | review |
| `pickup.experience` | Impact Point | 32×32 | 3 | a1 | Codex equipment 2026-10-23 | review |
| `shrine.spawn_surge` | Landfill Breach | 128×128 | 4 | a1 | Codex world 2026-10-23 | review |
| `shrine.greed` | Fast Fashion Boom | 128×128 | 4 | a1 | Codex world 2026-10-23 | review |
| `shrine.multiplicity` | Single-Use Boom | 128×128 | 4 | a1 | Codex world 2026-10-23 | review |
| `shrine.duplication` | Overproduction Order | 128×128 | 4 | a1 | Codex world 2026-10-23 | review |
| `shrine.escalation` | Unmanaged Dump | 128×128 | 4 | a1 | Codex world 2026-10-23 | review |
| `hazard.damage_zone` | Contamination Spill | 128×128 | 4 | a1 | Codex world 2026-10-23 | review |
| `hazard.obstacle` | Debris Pile | 128×128 | 4 | a1 | Codex world 2026-10-23 | review |
| `hazard.periodic_burst` | Methane Vent | 128×128 | 4 | a1 | Codex world 2026-10-23 | review |
| `icon.weapon.starter` | Cleanup Grabber icon | 64×64 | 1 | a1 | Codex equipment 2026-10-23 | review |
| `icon.weapon.secondary` | Cleanup Vacuum icon | 64×64 | 1 | a1 | Codex equipment 2026-10-23 | review |
| `icon.weapon.secondary_evolved` | Cyclone Vacuum icon | 64×64 | 1 | a1 | Codex equipment 2026-10-23 | review |

## Retired inventory

Old fragment.* rows, Plastic Bag, four-site count, elite-overlay generation and
Sorting Pulse are not this queue. Their original context is preserved in the
[master history](../MASTER_BUILD_PLAN.md#sprite-style1-history).

## Generation log

Append a line per attempt. This is what makes the roster reproducible: without the
seed and the style version, a sprite that gets lost cannot be remade to match.

| Date | ID | Attempt | Style ver | Seed | Outcome | Note |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-08-19 | `enemy.swarm_basic` | 1 | 1 | n/a (built-in) | review | First Plastic Bottle baseline; untouched 1402×1122 RGBA tool output built into an in-game review sheet on 2026-08-21. |
| 2026-09-02 | `enemy.fast_fragile` | 1 | 1 | n/a (built-in) | rejected | Plastic Bag poses and style read clearly, but the tool rendered its transparency checkerboard into an opaque RGB file. |
| 2026-09-02 | `enemy.fast_fragile` | 2 | 1 | n/a (built-in) | rejected | Targeted alpha-only retry improved the torn death pose but again returned an opaque RGB checkerboard. |
| 2026-09-02 | `enemy.slow_durable` | 1 | 1 | n/a (built-in) | rejected | Glass Bottle silhouette and four poses match the brief, but the tool rendered an opaque RGB checkerboard. |
| 2026-09-02 | `enemy.slow_durable` | 2 | 1 | n/a (built-in) | rejected | Targeted alpha-only retry retained the stronger armoured silhouette but again returned opaque RGB. |
| 2026-09-02 | `enemy.death_spawner` | 1 | 1 | n/a (built-in) | rejected | Bagged Waste is readable and its contents spill clearly, but the tool rendered an opaque RGB checkerboard. |
| 2026-09-02 | `enemy.death_spawner` | 2 | 1 | n/a (built-in) | rejected | Targeted alpha-only retry improved pose consistency but again returned opaque RGB. |
| 2026-09-02 | `character.starter` | 1 | 1 | n/a (built-in) | rejected | The eight Environment Protector poses read clearly, but the tool rendered an opaque RGB checkerboard. |
| 2026-09-02 | `character.starter` | 2 | 1 | n/a (built-in) | rejected | Targeted alpha-only retry improved pose and equipment consistency but returned an opaque black RGB background. |
| 2026-09-18 | `character.starter` | 2 | 1 | n/a (built-in) | accepted | Deterministic normalization now retains the largest connected subject per frame, removing detached generator marks without hand-editing the preserved raw attempt; runtime uses the clean 0→1→2→1 walk cycle. |
| 2026-09-21 | `enemy.fast_fragile` | 3 | 1 | n/a (built-in) | accepted | Replaced the obsolete Plastic Bag with a transparent four-pose Microplastics cluster; deterministic normalization preserves the multicolour material regions and compact connected silhouette. |

| 2026-10-23 | `enemy.swarm_basic` | 2 | 2 | n/a (built-in) | review | New transparent four-pose source; fixed-grid64px review strip. Source style approved for batch references; final layout/live acceptance pending. |
| 2026-10-23 | `enemy.fast_fragile` | 4 | 2 | n/a (built-in) | review | New connected multicolour four-pose source;48px fixed-grid review. Final alignment/live scale acceptance pending. |
| 2026-10-23 | `enemy.slow_durable` | 3 | 2 | n/a (built-in) | review | New teal four-pose source;96px fixed-grid review. Intact source silhouettes clean; final alignment/live scale acceptance pending. |
| 2026-10-23 | `enemy.death_spawner` | 3 | 2 | n/a (built-in) | review | Parallel actors source/native strip preserved; familiar Australian appearance; individual/live review deferred by owner. |
| 2026-10-23 | `character.starter` | 3 | 2 | n/a (built-in) | review | Parallel actors source/native strip preserved; familiar Australian appearance; individual/live review deferred by owner. |
| 2026-10-23 | `enemy.stationary_fragment` | 1 | 2 | n/a (built-in) | review | Parallel actors source/native strip preserved; familiar Australian appearance; individual/live review deferred by owner. |
| 2026-10-23 | `enemy.cluster_fodder` | 1 | 2 | n/a (built-in) | review | Parallel actors source/native strip preserved; familiar Australian appearance; individual/live review deferred by owner. |
| 2026-10-23 | `enemy.gust_drifter` | 1 | 2 | n/a (built-in) | review | Parallel actors source/native strip preserved; familiar Australian appearance; individual/live review deferred by owner. |
| 2026-10-23 | `enemy.committed_charger` | 1 | 2 | n/a (built-in) | review | Parallel actors source/native strip preserved; familiar Australian appearance; individual/live review deferred by owner. |
| 2026-10-23 | `enemy.mini_boss` | 1 | 2 | n/a (built-in) | review | Parallel actors source/native strip preserved; familiar Australian appearance; individual/live review deferred by owner. |
| 2026-10-23 | `enemy.final_boss` | 1 | 2 | n/a (built-in) | review | Parallel actors source/native strip preserved; familiar Australian appearance; individual/live review deferred by owner. |
| 2026-10-23 | `shrine.spawn_surge` | 1 | 2 | n/a (built-in) | review | Parallel world source/native strip preserved; familiar Australian appearance; individual/live review deferred by owner. |
| 2026-10-23 | `shrine.greed` | 1 | 2 | n/a (built-in) | review | Parallel world source/native strip preserved; familiar Australian appearance; individual/live review deferred by owner. |
| 2026-10-23 | `shrine.multiplicity` | 1 | 2 | n/a (built-in) | review | Parallel world source/native strip preserved; familiar Australian appearance; individual/live review deferred by owner. |
| 2026-10-23 | `shrine.duplication` | 1 | 2 | n/a (built-in) | review | Parallel world source/native strip preserved; familiar Australian appearance; individual/live review deferred by owner. |
| 2026-10-23 | `shrine.escalation` | 1 | 2 | n/a (built-in) | review | Parallel world source/native strip preserved; familiar Australian appearance; individual/live review deferred by owner. |
| 2026-10-23 | `hazard.damage_zone` | 1 | 2 | n/a (built-in) | review | Parallel world source/native strip preserved; familiar Australian appearance; individual/live review deferred by owner. |
| 2026-10-23 | `hazard.obstacle` | 1 | 2 | n/a (built-in) | review | Parallel world source/native strip preserved; familiar Australian appearance; individual/live review deferred by owner. |
| 2026-10-23 | `hazard.periodic_burst` | 1 | 2 | n/a (built-in) | review | Parallel world source/native strip preserved; familiar Australian appearance; individual/live review deferred by owner. |
| 2026-10-23 | `enemy.slow_durable` | 4 | 2 | n/a (built-in) | review | Familiar wine-bottle alternative; previous angular a3 retained for comparison. |
| 2026-10-23 | `weapon.starter` | 1 | 2 | n/a (built-in) | review | Parallel equipment source/native strip preserved; familiar practical construction; individual/live review deferred. |
| 2026-10-23 | `weapon.secondary` | 1 | 2 | n/a (built-in) | review | Parallel equipment source/native strip preserved; familiar practical construction; individual/live review deferred. |
| 2026-10-23 | `weapon.secondary_evolved` | 1 | 2 | n/a (built-in) | review | Parallel equipment source/native strip preserved; familiar practical construction; individual/live review deferred. |
| 2026-10-23 | `pickup.experience` | 1 | 2 | n/a (built-in) | review | Parallel equipment source/native strip preserved; familiar practical construction; individual/live review deferred. |
| 2026-10-23 | `icon.weapon.starter` | 1 | 2 | n/a (built-in) | review | Parallel equipment source/native strip preserved; familiar practical construction; individual/live review deferred. |
| 2026-10-23 | `icon.weapon.secondary` | 1 | 2 | n/a (built-in) | review | Parallel equipment source/native strip preserved; familiar practical construction; individual/live review deferred. |
| 2026-10-23 | `icon.weapon.secondary_evolved` | 1 | 2 | n/a (built-in) | review | Parallel equipment source/native strip preserved; familiar practical construction; individual/live review deferred. |

## Runtime inspection follow-up — 2026-10-12 Q2

Use `/sprite-browser.html` to inspect current atlas bindings at native zoom,
step/freeze every pose and export per-sheet good/bad/review notes. Glass Shards
currently bind to the accepted Glass Bottle broken pose (frame 3), explicitly
labelled "Reused accepted pose". No sheet or claim is added and the remaining
roster generation gate is unchanged. Tool reviews are local developer assessments,
not acceptance edits to this manifest or game-profile saves.

### Q3 review finding — Glass Bottle detached pixels (2026-10-12)

The owner highlighted detached cyan/dark pixels at the bottom-right of an intact
Glass Bottle pose. Inspection confirms they exist in the accepted source and
processed runtime art, rather than a particle effect or inspection overlay. The
intact-pose brief does not call for debris; treat this as an art-review defect.
The shattered frame intentionally contains angular fragments. No pixels, source
attempts, atlas or acceptance state were changed. Future remediation must use the
claim/prompt/regeneration/acceptance workflow after the roster gate, retaining the
original sheet and matching world display size. See REC-111.

## Owner-selected ranged addition —2026-10-23

`enemy.ranged_attacker` / Takeaway Cup: Codex root claim8718bcb, a1–a4 generated;
**a3 live draft, owner art acceptance pending**, next attempt a5. Seven64×64
frames: idle/move/hit/death/prepare/release/recover. Review, normalized baseline
and public PNG SHA256 `74fbd0a70ae6042f2e86d4c1fb95bd464ab07989075cdb96914456103b4512fe`.
[Exact prompt](raw/enemy_ranged_attacker.a3.prompt.txt),
[metadata](raw/enemy_ranged_attacker.a3.metadata.json),
[recipe](raw/enemy_ranged_attacker.a3.review.json),
[native checks](review/style2/enemy_ranged_attacker.a3.checks.json).
One fixed equal grid with virtual transparent margins; measured paper-base
anchors. Small generated idle/hit contour differences and extended art/pacing
review remain open. No prior catalog art promoted. Knights and Magic stays paused.
