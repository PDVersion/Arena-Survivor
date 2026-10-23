# Sprite manifest — accepted evidence and style 2 queue

Knights and Magic is paused indefinitely until the owner explicitly reopens it.
This queue covers `eco-guardian` only. [Plan](../SPRITE_PLAN_V0.4.4.md),
[style/acceptance](../SPRITE_STYLE_GUIDE.md), [copyable prompts](../SPRITE_PROMPTS.md).

**Shipped: five accepted style1 sheets. Target: 23 style2 primary sheets plus
three optional static tool icons. Style2 generated/accepted: 3/0.**
Existing sheets remain live; all five are scheduled for regeneration. The target
queue does not retroactively revoke their original acceptance or overwrite raw
attempts. Glass Shards currently reuse Glass frame3. Batch1 claims are tracked below.

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
Exact prompts and frame roles live only in the catalog to avoid conflicting copies.

| ID | Subject | Target frame | Frames | Next attempt | Claimed by | Target status |
| --- | --- | --- | --- | --- | --- | --- |
| `enemy.swarm_basic` | Plastic Bottle | 64×64 | 4 | a2 | Codex 2026-10-23 | review |
| `enemy.fast_fragile` | Microplastics | 48×48 | 4 | a4 | Codex 2026-10-23 | review |
| `enemy.slow_durable` | Glass Bottle | 96×96 | 4 | a3 | Codex 2026-10-23 | review |
| `enemy.death_spawner` | Bagged Waste | 96×96 | 4 | a3 | — | todo |
| `character.starter` | Environment Protector | 96×96 | 8 | a3 | — | todo |
| `enemy.stationary_fragment` | Glass Shards | 48×48 | 4 | a1 | — | todo |
| `enemy.cluster_fodder` | Cigarette Butts | 48×48 | 4 | a1 | — | todo |
| `enemy.gust_drifter` | Packets / Wrappers | 64×64 | 4 | a1 | — | todo |
| `enemy.committed_charger` | Aluminium Can | 64×64 | 4 | a1 | — | todo |
| `enemy.mini_boss` | Compacted Waste | 128×128 | 4 | a1 | — | todo |
| `enemy.final_boss` | Dumping Colossus | 192×192 | 4 | a1 | — | todo |
| `weapon.starter` | Cleanup Grabber action | 128×32 | 3 | a1 | — | todo |
| `weapon.secondary` | Cleanup Vacuum action | 128×64 | 3 | a1 | — | todo |
| `weapon.secondary_evolved` | Cyclone Vacuum action | 128×64 | 3 | a1 | — | todo |
| `pickup.experience` | Impact Point | 32×32 | 3 | a1 | — | todo |
| `shrine.spawn_surge` | Landfill Breach | 128×128 | 4 | a1 | — | todo |
| `shrine.greed` | Fast Fashion Boom | 128×128 | 4 | a1 | — | todo |
| `shrine.multiplicity` | Single-Use Boom | 128×128 | 4 | a1 | — | todo |
| `shrine.duplication` | Overproduction Order | 128×128 | 4 | a1 | — | todo |
| `shrine.escalation` | Unmanaged Dump | 128×128 | 4 | a1 | — | todo |
| `hazard.damage_zone` | Contamination Spill | 128×128 | 4 | a1 | — | todo |
| `hazard.obstacle` | Debris Pile | 128×128 | 4 | a1 | — | todo |
| `hazard.periodic_burst` | Methane Vent | 128×128 | 4 | a1 | — | todo |
| `icon.weapon.starter` | Cleanup Grabber icon | 64×64 | 1 | a1 | — | optional |
| `icon.weapon.secondary` | Cleanup Vacuum icon | 64×64 | 1 | a1 | — | optional |
| `icon.weapon.secondary_evolved` | Cyclone Vacuum icon | 64×64 | 1 | a1 | — | optional |

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

| 2026-10-23 | `enemy.swarm_basic` | 2 | 2 | n/a (built-in) | review | New transparent four-pose source; fixed-grid64px review strip. Source style approved for batch references; final layout/live acceptance pending. |

| 2026-10-23 | `enemy.fast_fragile` | 4 | 2 | n/a (built-in) | review | New connected multicolour four-pose source;48px fixed-grid review. Final alignment/live scale acceptance pending. |

| 2026-10-23 | `enemy.slow_durable` | 3 | 2 | n/a (built-in) | review | New teal four-pose source;96px fixed-grid review. Intact source silhouettes clean; final alignment/live scale acceptance pending. |
