# Sprite Manifest

The working record for every sprite in the game: what was asked for, what came
back, and whether it was accepted. One row per sheet.

This is the file to open when generating. It answers "what do I paste in", "what
did I paste in last time", and "what still needs doing", which are the only three
questions that come up during an art pass.

- The prompt and the rules: [`../SPRITE_STYLE_GUIDE.md`](../SPRITE_STYLE_GUIDE.md)
- The milestone plan: [`../SPRITE_PLAN_V0.4.1.md`](../SPRITE_PLAN_V0.4.1.md)
- The parallel-stream contract: [`../BUILD_PLAN_V0.4.md`](../BUILD_PLAN_V0.4.md)

**Style version: `1`.** Every accepted sprite records the style version it was
generated under. Bumping the style lock bumps this, and every sprite below the
current version is `stale` and needs regenerating — see style guide §8.

---

## Working across sessions

**This file is the source of truth for what exists.** It is designed to be picked
up cold — by a later session, or by a second agent working at the same time — and
answer "what is done, what is being worked on, what is next" without reading
anything else.

### Claim before you generate

Two agents generating the same sprite is wasted work, and two agents *accepting*
different versions of the same sprite is worse. The protocol is one commit:

1. Pick the highest-priority row whose Status is `todo`.
2. Set its Status to `generating`, put your name or session id in **Claimed by**,
   and commit **that line alone** with the message `sprites: claim {id}`.
3. Generate, accept, and build.
4. Set Status to `accepted`, fill in Attempts, Seed, and Style ver, and commit the
   sprite files with it.

A claim commit is a few bytes and takes seconds. It is the entire mechanism that
lets this run in parallel, and skipping it is how two agents spend an hour on the
same bottle.

**A claim older than a day with no follow-up commit is stale** — take it, and note
the takeover in the generation log.

### One sprite, one commit

Never batch several accepted sprites into one commit. One sprite per commit keeps
the manifest line, the raw file, the accepted file, and the built output together,
so any sprite can be reverted on its own when it turns out to be the odd one out.

### Filenames

`{id}` is the content id with dots replaced by underscores.

| Stage | Path |
| --- | --- |
| Raw | `build/sprites/raw/{id}.a{attempt}.png` |
| Accepted | `build/sprites/accepted/{id}.png` |
| Built | `public/sprites/{theme}/{id}.png` |
| Variants | `public/sprites/{theme}/{id}.c2.png`, `{id}.c3.png` |

Raw files are attempt-numbered and never overwritten, so a rejected generation
stays as evidence of what the prompt produced.

## How to generate one

1. Find the row. Copy the **style lock** from the style guide (§6.1), substituting
   `{CANVAS}` from the Canvas column.
2. Append the row's **Subject block** verbatim.
3. Append the **sheet slot** (§6.3) with the row's Frames and Frame list.
4. Generate. Save to `build/sprites/raw/{id}.a{attempt}.png`. Record the seed.
5. Run the acceptance checklist (style guide §7). If it passes, copy to
   `build/sprites/accepted/{id}.png` and set Status to `accepted`.
6. `npm run sprites -- check`, then `npm run sprites -- build`.

**To regenerate:** increment Attempts and save as `.a{n+1}.png`. Never edit a
sprite by hand to fix it — fix the subject block, or the style lock if it is a
roster-wide problem (style guide §8).

**Status values:** `todo` · `generating` · `review` · `accepted` · `stale`

---

## Progress

**0 of 19 accepted.** Update this line with every acceptance — it is what a cold
session reads first.

```
todo        ████████████████████  19
generating  ░░░░░░░░░░░░░░░░░░░░   0
accepted    ░░░░░░░░░░░░░░░░░░░░   0
```

## Status

| # | ID | Subject | Canvas | Frames | Detail | Style ver | Attempts | Seed | Claimed by | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `enemy.swarm_basic` | Plastic Bottle | 32×32 | 4 | medium | — | 0 | — | Codex | `generating` |
| 2 | `enemy.fast_fragile` | Plastic Bag | 24×24 | 4 | low | — | 0 | — | — | `todo` |
| 3 | `enemy.slow_durable` | Glass Bottle | 48×48 | 4 | medium | — | 0 | — | — | `todo` |
| 4 | `enemy.death_spawner` | Bagged Waste | 48×48 | 4 | medium | — | 0 | — | — | `todo` |
| 5 | `character.starter` | Environment Protector | 48×48 | 8 | high | — | 0 | — | — | `todo` |
| 6 | `weapon.starter_projectile` | Sorting Pulse charge | 16×16 | 3 | low | — | 0 | — | — | `todo` |
| 7 | `pickup.experience` | Impact Point | 16×16 | 3 | low | — | 0 | — | — | `todo` |
| 8 | `fragment.swarm_basic` | Bottle shard | 24×24 | 4 | low | — | 0 | — | — | `todo` |
| 9 | `fragment.fast_fragile` | Bag scrap | 24×24 | 4 | low | — | 0 | — | — | `todo` |
| 10 | `fragment.slow_durable` | Glass shard | 24×24 | 4 | low | — | 0 | — | — | `todo` |
| 11 | `shrine.spawn_surge` | Landfill Breach | 64×64 | 4 | high | — | 0 | — | — | `todo` |
| 12 | `shrine.greed` | Fast Fashion Boom | 64×64 | 4 | high | — | 0 | — | — | `todo` |
| 13 | `shrine.multiplicity` | Single-Use Boom | 64×64 | 4 | high | — | 0 | — | — | `todo` |
| 14 | `shrine.duplication` | Overproduction Order | 64×64 | 4 | high | — | 0 | — | — | `todo` |
| 15 | `hazard.damage_zone` | Contamination Spill | 64×64 | 4 | medium | — | 0 | — | — | `todo` |
| 16 | `hazard.obstacle` | Debris Pile | 64×64 | 4 | medium | — | 0 | — | — | `todo` |
| 17 | `hazard.periodic_burst` | Methane Vent | 64×64 | 4 | medium | — | 0 | — | — | `todo` |
| 18 | `overlay.elite` | Elite outline | per class | 1 | low | — | 0 | — | — | `todo` |
| 19 | `weapon.starter_icon` | Sorting Pulse emitter | 16×16 | 3 | high | — | 0 | — | — | `todo` |

Colour variants (`c2`, `c3`) are **not listed**: they are produced by hue rotation
in `npm run sprites -- build` and never generated. See style guide §3.

---

## Subject blocks

Paste after the style lock. These are the authored half of each prompt, and the
part to edit when a generation comes back wrong.

### 1 · `enemy.swarm_basic` — Plastic Bottle · **baseline**

```text
SUBJECT: a discarded single-use plastic drink bottle, crumpled slightly, cap still on,
faded peeling label band around the middle, seen as a small hostile creature-object.
BASE COLOUR: #60a5fa — build the 4-step ramp from this exact hue.
SILHOUETTE: tall rounded rectangle, narrower neck at the top, wider base, one dent
in the left side so it is not symmetrical.
DETAIL BUDGET: medium — cap, neck ridge, and label band are the only interior detail.
```
Frames: `idle upright; leaning forward mid-tumble; same as idle; crushed flat and split into two pieces`

### 2 · `enemy.fast_fragile` — Plastic Bag

```text
SUBJECT: a light supermarket carrier bag caught mid-air, part-inflated by wind,
handles trailing, seen as a small hostile creature-object.
BASE COLOUR: #e2e8f0 — build the 4-step ramp from this exact hue.
SILHOUETTE: irregular billowing pouch, wider at the top than the bottom, two thin
handle loops rising from the top edge. Deliberately asymmetric.
DETAIL BUDGET: low — silhouette and two or three crease lines only.
```
Frames: `billowed open; collapsed and stretched sideways; billowed open; torn into drifting strips`

### 3 · `enemy.slow_durable` — Glass Bottle

```text
SUBJECT: a heavy glass bottle, thick-walled and squat, with a short neck and a
moulded seam, seen as a slow armoured hostile creature-object.
BASE COLOUR: #2dd4bf — build the 4-step ramp from this exact hue.
SILHOUETTE: broad heavy base, sharply narrowing shoulder, short thick neck.
Visibly heavier and wider than the plastic bottle at the same scale.
DETAIL BUDGET: medium — moulded seam line, thick base ring, one bright highlight
edge to read as glass rather than plastic.
```
Frames: `upright; rocking to one side; upright; shattered into large angular shards`

### 4 · `enemy.death_spawner` — Bagged Waste

```text
SUBJECT: a sealed rubbish bag, over-full and bulging, tied off at the top with a
twisted knot, contents straining against the film, seen as a hostile creature-object.
BASE COLOUR: #c084fc — build the 4-step ramp from this exact hue.
SILHOUETTE: heavy lumpy sphere, wider than it is tall, with a small twisted knot
on top. The lumps must break the outline so it never reads as a plain circle.
DETAIL BUDGET: medium — knot, two or three straining bulges, one taut crease.
```
Frames: `bulging and tied; leaning with the knot swinging; bulging and tied; split open with contents spilling out`

### 5 · `character.starter` — Environment Protector

```text
SUBJECT: a field cleanup operative in practical protective work gear — hooded
jacket, gloves, sturdy boots, a collection pack on the back — carrying a compact
handheld sorting tool. Determined, capable, not military.
BASE COLOUR: #4ade80 — build the 4-step ramp from this exact hue for the gear.
SILHOUETTE: upright human figure, readable head-torso-legs at small size, the
backpack breaking the silhouette on one side so facing is obvious.
DETAIL BUDGET: high — this is the sprite the player looks at constantly. Gear
straps, glove cuffs, boot soles, and the tool are all worth pixels. Face is
suggested by two dark eye pixels only, no detailed features.
```
Frames (8): `walk contact; walk down; walk pass; walk up; idle standing; hit recoil; reserved dash; reserved hurt`

### 6 · `weapon.starter_projectile` — Sorting Pulse charge

```text
SUBJECT: a small guided energy charge, a compact bright core with a short trailing
wake, reading as a clean technical pulse rather than a fireball.
BASE COLOUR: #7dd3fc — build the 4-step ramp from this exact hue.
SILHOUETTE: teardrop, blunt leading edge, tapering tail. Must read at speed, so
the silhouette does all the work.
DETAIL BUDGET: low — a bright core, one darker rim, nothing else.
```
Frames: `travelling; impact flare; fading remnant`

### 7 · `pickup.experience` — Impact Point

```text
SUBJECT: a small floating collectible token representing recovered material credit —
a faceted chip or shard with a clean bright centre.
BASE COLOUR: #a3e635 — build the 4-step ramp from this exact hue.
SILHOUETTE: compact angular diamond, clearly distinct from any round enemy.
DETAIL BUDGET: low — two facets and a bright centre pixel cluster.
```
Frames: `resting; bright pulse; being collected, compressed and brightest`

### 8–10 · Fragments

Fragments are pieces of their parent (REC-067), and their sprites should say so:
same palette and same material read, smaller and sharper-edged.

```text
SUBJECT: a broken-off piece of {a plastic drink bottle | a carrier bag | a glass
bottle}, jagged and clearly a fragment of a larger object, tumbling.
BASE COLOUR: {#60a5fa | #e2e8f0 | #2dd4bf} — build the 4-step ramp from this exact hue.
SILHOUETTE: small, angular, deliberately irregular. Must read as part of the parent
object rather than as its own creature.
DETAIL BUDGET: low — one torn or fractured edge is the whole detail.
```
Frames: `tumbling A; tumbling B; tumbling A; disintegrating`

### 11–14 · Shrines

All four share a frame list and differ only in subject. They are static and
one-per-arena, so they carry the most ornament in the game.

```text
SUBJECT: {see per-shrine line below}
BASE COLOUR: #fb7185 — build the 4-step ramp from this exact hue for the active
glow and marker elements; the structure itself may use one neutral material ramp.
SILHOUETTE: a distinct standing arena marker, clearly interactive, readable from
a distance as "go here". Taller than it is wide.
DETAIL BUDGET: high — this is a landmark the player crosses the arena for.
```
- `shrine.spawn_surge` — **Landfill Breach**: a split in the ground with a buried refuse cell exposed beneath it, pressure venting from the gap
- `shrine.greed` — **Fast Fashion Boom**: a toppling rack of discarded garments, tags still attached
- `shrine.multiplicity` — **Single-Use Boom**: a dispensing crate endlessly spilling identical single-use items
- `shrine.duplication` — **Overproduction Order**: a stamped shipping pallet with an order manifest pinned to it

Frames: `dormant; pulsing ready; being activated, brightest; spent and dark`

### 15–17 · Hazards

```text
SUBJECT: {see per-hazard line below}
BASE COLOUR: {#fb923c | #23372a | #fb7185} — build the 4-step ramp from this exact hue.
SILHOUETTE: ground-level arena feature, read from directly above, clearly not an
enemy and clearly not walkable-through-safely.
DETAIL BUDGET: medium — must telegraph its danger before it can hurt anyone.
```
- `hazard.damage_zone` — **Contamination Spill**: a spreading pool of contaminated runoff with a darker crusted edge
- `hazard.obstacle` — **Debris Pile**: a heaped blockage of compacted mixed waste, solid and immovable
- `hazard.periodic_burst` — **Methane Vent**: a cracked ground vent, gas building beneath it

Frames: `telegraphing / warning; active; active alternate; expiring`

### 18 · `overlay.elite` — Elite outline

```text
SUBJECT: an outline-only ring overlay marking an empowered enemy — no fill, just a
bright hard-edged border that will be drawn on top of another sprite.
BASE COLOUR: #fde047 — build the 4-step ramp from this exact hue.
SILHOUETTE: a closed ring, evenly weighted, with the interior fully transparent.
DETAIL BUDGET: low — weight and clarity only.
```
Frames: `1 — static`

### 19 · `weapon.starter_icon` — Sorting Pulse emitter

```text
SUBJECT: a compact handheld sorting tool — a short emitter barrel, a grip, and a
small charge indicator. Practical field equipment, not a weapon of war.
BASE COLOUR: #7dd3fc — build the 4-step ramp from this exact hue for the emitter;
the grip may use one neutral material ramp.
SILHOUETTE: clearly a held tool, asymmetric so its facing is obvious.
DETAIL BUDGET: high — appears in the Field Guide and on upgrade cards at rest,
where it is looked at rather than glanced at.
```
Frames: `ready; firing; recharging`

---

## Generation log

Append a line per attempt. This is what makes the roster reproducible: without the
seed and the style version, a sprite that gets lost cannot be remade to match.

| Date | ID | Attempt | Style ver | Seed | Outcome | Note |
| --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — | *No generations yet — Phase S1 has not started* |
