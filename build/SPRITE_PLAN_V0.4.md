# V0.4 Sprite Plan

Everything in the game is currently a Phaser primitive — `Arc`, `Star`,
`Triangle`, `Rectangle` — coloured from a palette token. That was the right call
for V0.1 through V0.3 (REC-004: generated placeholders), and it has held up: the
roster is readable, the crowd is legible, and no art blocked any mechanic.

It is now the single largest thing standing between this build and looking like a
finished game. This plan replaces the primitives with sprites without giving up
what the primitives bought — a hard theme boundary, a fixed logical view, and a
crowd that stays readable at three hundred bodies.

- Art direction and the reusable prompt: [`SPRITE_STYLE_GUIDE.md`](./SPRITE_STYLE_GUIDE.md)
- Per-sprite tracking: [`sprites/MANIFEST.md`](./sprites/MANIFEST.md)
- Theme boundary rules this plan must not break: [`THEME_ARCHETYPES.md`](./THEME_ARCHETYPES.md)

## Why this is worth a milestone

Three reasons, in order of how much they matter:

1. **Identity.** A blue circle is a plastic bottle only because a tooltip says so.
   A sprite of a crushed bottle *is* one. The environment theme's whole argument —
   that the mechanics teach something — leans on the player recognising what they
   are fighting, and `EDUCATION_PIVOT.md` builds its knowledge layer on top of
   that recognition.
2. **Silhouette readability.** REC-057 already flagged that roles are separated by
   colour plus subtle geometry, and that distinct silhouettes would help both
   accessibility and split-second reads in a crowd. Sprites are how that gets
   fixed properly.
3. **It is the last obviously-placeholder thing.** Everything else in the build
   reads as deliberate.

## Scope

**In:** every enemy role, the player, the starter weapon and its projectile, XP
pickups, all four shrines, all three hazards, and the elite treatment. Loading,
atlas handling, a palette-snap step, and the swap from primitives to sprites in
the entities.

**Out:** animation beyond the frame counts in the style guide; per-weapon sprites
for weapons that do not exist yet (weapon slots are their own V0.4 item);
environment tiles and arena decoration; UI iconography; particle art. The floor
grid stays procedural.

**Explicitly not a rewrite.** Entities keep their contracts. A sprite is a new
presentation token resolved through the theme, exactly like a palette colour.

---

## 1. Inventory

Thirty-two sheets. Counted rather than estimated, because "add sprites" is the
kind of task that looks small until it is enumerated.

| # | Subject | Class | Canvas | Frames | Detail | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Plastic Bottle | Standard enemy | 32×32 | 4 | medium | **Baseline — do first** |
| 2 | Plastic Bag | Small enemy | 24×24 | 4 | low | 1 |
| 3 | Glass Bottle | Large enemy | 48×48 | 4 | medium | 1 |
| 4 | Bagged Waste | Large enemy | 48×48 | 4 | medium | 1 |
| 5 | Environment Protector | Player | 48×48 | 8 | high | 1 |
| 6 | Sorting Pulse projectile | Projectile | 16×16 | 3 | low | 1 |
| 7 | Impact Point | Pickup | 16×16 | 3 | low | 1 |
| 8–10 | Bottle / Bag / Glass fragments | Small enemy | 24×24 | 4 | low | 2 |
| 11–14 | Four shrines | Shrine | 64×64 | 4 | high | 2 |
| 15–17 | Three hazards | Hazard | 64×64 | 4 | medium | 2 |
| 18 | Elite outline overlay | Overlay | per class | 1 | low | 2 |
| 19–30 | Colour variants `c2`/`c3` for enemies 1–4 and fragments | — | — | — | — | **Free** — hue rotation |
| 31 | Sorting Pulse weapon icon | Weapon | 16×16 | 3 | high | 3 |
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

## 2. Pipeline

```
  prompt (style lock + subject slot)
        ↓  image tool, seed recorded
  raw generation           build/sprites/raw/{id}.png
        ↓  acceptance checklist, by eye
  accepted raw             build/sprites/accepted/{id}.png
        ↓  palette snap + alpha clean + variant rotation
  processed sheet          public/sprites/{theme}/{id}.png
        ↓  atlas pack (optional, see §5)
  runtime texture
```

**Palette snap** is the step that makes generated art usable. Image tools return
approximate colours and semi-transparent edges; the snap quantises every pixel to
the nearest colour in the sprite's declared 4-step ramp and forces alpha to 0 or
255. It is what turns "roughly the right blue, softly edged" into "exactly the
token blue, hard edged", and it is why the roster will match even though the
generator does not.

It also gives colour variants for free: snap to a hue-rotated ramp instead and the
same source produces `c2` and `c3`.

**Tooling:** one script, `scripts/sprites.ts`, with three commands:

| Command | Does |
| --- | --- |
| `npm run sprites -- check` | Validates every accepted sheet against the checklist bits a machine can verify: canvas size, strip width, alpha binarity, tonal step count, outline closure |
| `npm run sprites -- build` | Palette-snaps, generates variants, writes to `public/sprites/` |
| `npm run sprites -- status` | Prints the manifest as a progress table |

`check` is the important one. It is the difference between a consistency policy
and a consistency *guarantee* for everything except the parts that need an eye.

---

## 3. Contract changes

Small and additive. The theme boundary rules in `THEME_ARCHETYPES.md` hold: no
system learns a sprite's name, and application code keeps resolving through
`activeTheme`.

```ts
/** Where a sprite sheet lives and how it is cut. Optional per theme. */
export interface SpriteDefinition {
  readonly key: string;          // stable texture key, e.g. "enemy.swarm_basic"
  readonly path: string;         // public/ relative
  readonly frameWidth: number;
  readonly frameHeight: number;
  readonly frames: number;
  /** Frame index per named state, so systems never hard-code numbers. */
  readonly states: Readonly<Record<SpriteState, number>>;
}

export type SpriteState = "idle" | "move" | "hit" | "death";

export interface ThemeTokens {
  // ...existing
  /**
   * Sprites by content id. Optional: a pack without them renders the V0.3
   * primitives, which is what keeps a second production pack viable without a
   * second art roster.
   */
  readonly sprites?: Readonly<Partial<Record<ContentId, SpriteDefinition>>>;
}
```

Entities gain one branch, not two implementations:

```ts
// EnemyActor, PlayerActor, PickupActor, ShrineActor, HazardActor
const sprite = tokens.sprites?.[definition.id];
// A sprite replaces the primitive's fill; it never changes radius, body,
// separation, or anything the simulation reads. Presentation only.
```

**The rule that keeps this safe:** a sprite may change nothing a system reads.
Radius, separation radius, mass, and the physics body all continue to come from
the definition and `bodies` tuning. A sprite that looks bigger than its hitbox is
an art problem to fix in the art, never a reason to change the hitbox — the crowd
tuning in REC-052 and REC-067 was measured against those radii.

---

## 4. Phases

Sized so each ends in something playable, per the milestone convention.

### Phase S1 — Pipeline and the baseline sprite
Contract additions, the loader, `scripts/sprites.ts` with all three commands, and
**one** sprite: the Plastic Bottle. Ends with bottles rendering as sprites in a
live run while every other role stays a primitive.

This phase is deliberately one sprite. Everything that can go wrong with the
pipeline — sizing, alpha, palette drift, frame cutting, depth sorting, the damage
flash against a texture — goes wrong here, once, on the sprite that is also the
yardstick for every later one.

*Verification:* `sprites -- check` passes; a run shows bottles as sprites; crowd
separation, hit flash, elite outline, and death all still behave; no frame-time
regression against the 300-enemy stress path.

### Phase S2 — The rest of the enemy roster
Bag, Glass, Bagged Waste, plus fragments and the elite overlay. Ends with every
enemy sprited and the primitives unused for enemies.

*Verification:* all four roles distinguishable in a 300-enemy crowd screenshot;
fragments visibly derived from their parents; `check` passes for every sheet.

### Phase S3 — Player, weapon, projectile, pickup
The high-detail work. The player is the only 8-frame sheet and the only real
animation.

*Verification:* the walk cycle reads at the player's actual move speed; the
projectile is legible at its actual travel speed against a full crowd.

### Phase S4 — Shrines and hazards
The static, high-ornament subjects. Hazards need a scaling decision — a 64×64
sheet stretched to a 110-unit damage zone will look soft, so these are likely
9-slice or tiled rather than scaled.

*Verification:* a shrine reads from across the arena; hazard telegraphs are still
unmistakable, which is the property REC-053 cares about.

### Phase S5 — Variants, polish, and the fallback proof
Colour variants, the `knight-magic` fallback path proven by running it with no
sprites at all, and a full-roster consistency review with every sheet side by
side.

*Verification:* both production packs run; `knight-magic` renders primitives with
no errors; the roster reads as one artist's work.

---

## 5. Decisions to make, with a recommendation

Recorded here rather than discovered mid-phase.

| Question | Recommendation | Why |
| --- | --- | --- |
| Individual PNGs or a packed atlas? | **Individual PNGs for S1–S4, atlas in S5 if load time justifies it** | Twenty small PNGs is not a load problem; an atlas adds a build step and makes hand-inspection harder during exactly the phases that need it |
| Where do processed sprites live? | `public/sprites/{theme}/` | Served as static assets, no bundler involvement, cache-friendly |
| Are raw generations committed? | **Yes**, under `build/sprites/raw/` | They are the only reproduction record when a prompt is re-run; they are small |
| Nearest-neighbour filtering | Set `pixelArt: true` in the Phaser config | Currently `antialias: true`, which will blur every sprite. One-line change, must land in S1 |
| Damage flash against a texture | Tint to white rather than `setFillStyle` | The existing flash sets a fill colour, which does nothing to a textured sprite |
| Elite treatment | A separate outline overlay sprite, not a per-enemy elite sheet | Otherwise the roster doubles |

The `pixelArt: true` change is worth calling out: with `antialias: true` in
`config.ts` today, every sprite will render blurred, and it will look like the art
is wrong rather than the config.

---

## 6. Risks

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Generated sprites do not match each other well enough | **High** | The style lock, the palette snap, and the baseline-comparison step. Budget several attempts per sprite |
| A sprite implies a different hitbox than its radius | Medium | The rule in §3, plus a `check` assertion that the drawn silhouette fits the declared radius |
| Frame time regresses with 300 textured sprites | Medium | Measured in S1 before the roster grows. Phaser batches same-texture draws well; an atlas is the fallback |
| The 4-step rule reads as flat rather than chunky | Medium | Tune the style lock after the first batch (style guide §8) — this is expected, not a failure |
| Art work stalls the milestone's mechanical items | Medium | Phases are independently shippable; the fallback means a half-finished roster still runs |

---

## 7. What "done" looks like

A run where every visible thing is a sprite drawn to the same style, the crowd is
*more* readable than it was with primitives rather than less, `knight-magic` still
runs on primitives with no errors, and any new sprite can be produced by pasting
the style lock plus one subject block into an image tool and running
`npm run sprites -- build`.

The last clause is the real deliverable. A finished roster that cannot be extended
is worth less than a half-finished one that can.
