# Sprite Style Guide and Prompt System

The art bible for V0.4. It exists so that a sprite generated in three months sits
next to one generated today and reads as the same game.

Two things make that work, and they are the whole document: a **style lock** that
never changes between prompts, and a **subject slot** that is the only thing that
does. Everything else here is scaffolding around those two ideas.

Read this alongside [`SPRITE_PLAN_V0.4.md`](./SPRITE_PLAN_V0.4.md), which owns the
inventory, the pipeline, and the integration work. This file owns the look.

> **On the reference.** The target was given as "HoloCure-like, somewhat 2-bit but
> still detailed enough", with an ArtStation link. The specification below is
> written from that description, not from an analysis of the image — nobody
> should treat these numbers as measured from the reference. They are a starting
> point to be corrected once the first batch exists. Correcting them is expected;
> see [Tuning the style lock](#tuning-the-style-lock).

---

## 1. The style in one paragraph

Chunky pixel art at a low native resolution, upscaled with nearest-neighbour so
every pixel stays square and visible. Each sprite is built from a **small number
of flat tonal steps per material** — the "somewhat 2-bit" read — but the shapes
themselves are detailed and specific, so a plastic bottle is unmistakably a
plastic bottle and not a generic blob. Bold, dark, fully-opaque outlines around
every silhouette. Saturated colour with clear value separation. No gradients, no
soft shadows, no anti-aliasing, no motion blur. Readability at a glance beats
fidelity: this is a sprite that will appear two hundred times on screen at once.

## 2. Hard constraints

These are the non-negotiables. A sprite that breaks one of them is rejected in QA
regardless of how good it looks in isolation.

| Constraint | Value | Why |
| --- | --- | --- |
| Native canvas | Per class, see §4 | Fixed sizes keep the whole roster in proportion |
| Upscale | Nearest-neighbour only | Any smoothing destroys the pixel read |
| Tonal steps per material | **4** (base, shadow, highlight, deep shadow) | The "2-bit" feel; more steps and it drifts into painterly |
| Outline | 1px at native res, fully opaque | The single strongest cue that sprites belong together |
| Outline colour | Darkest value of the sprite's own hue, never pure black | Pure black flattens a saturated palette |
| Anti-aliasing | None | Half-pixels destroy the grid |
| Background | Fully transparent | Composited over the arena floor |
| Light direction | Top-left, consistent across every sprite | The most common source of "these don't match" |
| Perspective | Straight-on, very slight top-down tilt | Matches the existing top-down arena |
| Palette | Drawn from the theme's tokens, see §3 | The sprites must not fight the UI |

### The 4-step rule, precisely

For each *material region* in a sprite — a bottle's plastic body, its cap, its
label — pick one hue and use exactly four values of it:

1. **Deep shadow** — the outline colour and the deepest occlusion
2. **Shadow** — the bottom-right ~30% of the form
3. **Base** — the dominant value, roughly half the region
4. **Highlight** — a small top-left accent, no more than ~15% of the region

Four steps is what produces the chunky, poster-like read. A sprite may contain
several material regions, each with its own four-step ramp — that is how it stays
detailed without becoming painterly.

## 3. Palette discipline

Sprites are theme content, so their colours come from the theme's existing token
palette rather than being invented per sprite. The `eco-guardian` pack already
defines the anchors:

| Token | Hex | Used by |
| --- | --- | --- |
| `enemy` | `#60a5fa` | Plastic bottle family |
| `enemyFast` | `#e2e8f0` | Plastic bag family |
| `enemyTank` | `#2dd4bf` | Glass bottle family |
| `enemySpawner` | `#c084fc` | Bagged waste family |
| `player` | `#4ade80` | The Environment Protector |
| `projectile` | `#7dd3fc` | Sorting Pulse and its upgrades |
| `pickup` | `#a3e635` | Impact points |
| `shrine` | `#fb7185` | Site events |
| `elite` | `#fde047` | Elite outline treatment |

**Rule:** a sprite's base value is its token colour. The other three steps are
derived from it, not chosen freely:

```
deep shadow  = token darkened 45%, saturation +10%
shadow       = token darkened 22%
base         = token exactly
highlight    = token lightened 25%, saturation −8%
```

Deriving rather than picking is what stops the roster drifting apart over dozens
of generations. Record every derived ramp in the manifest so it is reproducible.

### Colour variants

A variant ("bottle enemy colour 2") is **the same sprite with a rotated hue**,
never a redraw. Rotate the base hue by a fixed amount and re-derive the ramp:

| Variant | Hue rotation | Intended use |
| --- | --- | --- |
| `c1` | 0° (the token) | Default |
| `c2` | +40° | Second material of the same family |
| `c3` | −35° | Third material |
| `elite` | 0°, plus a 1px `elite` outline outside the normal outline | Elites, per REC-037 |

This means variants are a **post-process, not a prompt**. Generate `c1`, then
produce `c2` and `c3` by hue rotation in the pipeline. It is faster, free, and
guarantees they match.

## 4. Canvas sizes and sheet layout

Native canvas per class, chosen against the gameplay radii already in the theme:

| Class | Native canvas | Game radius | Notes |
| --- | --- | --- | --- |
| Small enemy (bag) | 24×24 | 10 | |
| Standard enemy (bottle) | 32×32 | 14 | The baseline everything is judged against |
| Large enemy (glass, bagged) | 48×48 | 22–25 | |
| Player | 48×48 | 18 | More detail budget; see §5 |
| Weapon / projectile | 16×16 | 6 | Reads at speed, so silhouette over detail |
| Pickup | 16×16 | 8 | |
| Shrine | 64×64 | 24 | Static, so it can carry the most detail |
| Hazard | 64×64 | 46–110 | Tiled or scaled; see the plan |

### Sheet layout

One horizontal strip per subject, frames left to right, no padding, no margin.
Frame `n` occupies `x = n * frameWidth`. This is the simplest thing Phaser's
`spritesheet` loader consumes and the easiest to verify by eye.

**Enemy states — 4 frames, and only 4:**

| Frame | State | Content |
| --- | --- | --- |
| 0 | `idle` | The rest pose |
| 1 | `move` | One alternate pose; idle/move alternate to walk |
| 2 | `hit` | Idle silhouette, flashed to near-white, used for the damage flash |
| 3 | `death` | A broken or scattered version of the silhouette |

Four states is deliberate. Two hundred enemies on screen means animation is noise
above a certain frame count, and the existing damage flash already substitutes a
colour rather than a frame.

**Player — 8 frames**, the one subject that gets a real animation budget:

| Frames | State |
| --- | --- |
| 0–3 | `walk` cycle (contact, down, pass, up) |
| 4 | `idle` |
| 5 | `hit` |
| 6–7 | `dash`/`hurt` reserved |

**Weapons — 3 frames:** `ready`, `fire`, `spent`.

## 5. Detail budget

Not every sprite deserves the same amount of work, and saying so explicitly stops
the roster from looking uneven:

- **Player and weapons** — highest. Multiple material regions, visible small
  features (a strap, a nozzle, a boot), readable silhouette asymmetry.
- **Shrines** — high, but static. They can afford ornament because there is only
  ever one of each on screen.
- **Standard and large enemies** — medium. Two or three material regions. The
  silhouette must be identifiable at 100% zoom in one glance.
- **Small enemies, pickups, projectiles** — low. Silhouette and colour only. At
  24×24 with a 1px outline there is barely room for anything else, and these are
  the ones that appear in the hundreds.

---

## 6. The prompt

This is the part to paste into an image tool. **The style block never changes.**
Only the subject block changes between sprites.

### 6.1 Style lock (constant — copy verbatim every time)

```text
STYLE LOCK — do not deviate:
Pixel art sprite, chunky low-resolution pixel style, drawn on a {CANVAS} pixel grid.
Limited palette: exactly 4 flat tonal steps per material region (deep shadow, shadow,
base, highlight). No gradients, no anti-aliasing, no dithering, no soft shadows,
no blur, no texture noise. Every pixel is a hard square edge.
1-pixel fully opaque outline around the entire silhouette, in the darkest tone of
the subject's own colour — never pure black.
Light source top-left, consistent. Straight-on view with a very slight top-down
tilt, as seen in a top-down arena game.
Bold saturated colour, strong value separation, poster-like readability at small size.
Detailed and specific in shape, simple in shading.
Fully transparent background. Subject centred, filling roughly 85% of the canvas,
with at least 2 pixels of clear space on every side.
No text, no logos, no watermark, no border, no drop shadow, no ground shadow,
no background scenery, no UI frame.
Reference feel: modern indie pixel-art roguelite character sprites — clean,
saturated, chunky, high-contrast.
```

### 6.2 Subject slot (the only part that changes)

```text
SUBJECT: {SUBJECT_DESCRIPTION}
BASE COLOUR: {HEX} — build the 4-step ramp from this exact hue.
SILHOUETTE: {SILHOUETTE_NOTE}
DETAIL BUDGET: {low | medium | high} — {DETAIL_NOTE}
```

### 6.3 Sheet slot (for a multi-frame request)

```text
SHEET: a single horizontal strip of {N} frames, each exactly {CANVAS} pixels,
no padding or gaps between frames, no frame borders or numbering.
Frames left to right: {FRAME_LIST}.
Every frame shares the identical palette, outline weight, light direction, and
subject scale. Only the pose changes between frames.
```

### 6.4 Worked example — Plastic Bottle, the baseline enemy

```text
STYLE LOCK — do not deviate:
Pixel art sprite, chunky low-resolution pixel style, drawn on a 32x32 pixel grid.
Limited palette: exactly 4 flat tonal steps per material region (deep shadow, shadow,
base, highlight). No gradients, no anti-aliasing, no dithering, no soft shadows,
no blur, no texture noise. Every pixel is a hard square edge.
1-pixel fully opaque outline around the entire silhouette, in the darkest tone of
the subject's own colour — never pure black.
Light source top-left, consistent. Straight-on view with a very slight top-down
tilt, as seen in a top-down arena game.
Bold saturated colour, strong value separation, poster-like readability at small size.
Detailed and specific in shape, simple in shading.
Fully transparent background. Subject centred, filling roughly 85% of the canvas,
with at least 2 pixels of clear space on every side.
No text, no logos, no watermark, no border, no drop shadow, no ground shadow,
no background scenery, no UI frame.
Reference feel: modern indie pixel-art roguelite character sprites — clean,
saturated, chunky, high-contrast.

SUBJECT: a discarded single-use plastic drink bottle, crumpled slightly, cap still on,
faded peeling label band around the middle, seen as a small hostile creature-object.
BASE COLOUR: #60a5fa — build the 4-step ramp from this exact hue.
SILHOUETTE: tall rounded rectangle, narrower neck at the top, wider base, one dent
in the left side so it is not symmetrical.
DETAIL BUDGET: medium — cap, neck ridge, and label band are the only interior detail.

SHEET: a single horizontal strip of 4 frames, each exactly 32x32 pixels,
no padding or gaps between frames, no frame borders or numbering.
Frames left to right: idle upright; leaning forward mid-tumble; same as idle;
crushed flat and split into two pieces.
Every frame shares the identical palette, outline weight, light direction, and
subject scale. Only the pose changes between frames.
```

### 6.5 Prompt rules

1. **Never edit the style lock to fix one sprite.** If a sprite comes out wrong,
   fix the subject slot. If the style lock genuinely needs a change, change it for
   the whole roster and regenerate — see §8.
2. **One subject per generation.** Do not ask for a family in one image.
3. **Seed if the tool supports it.** Record the seed in the manifest.
4. **Never ask for colour variants.** They are a hue rotation in the pipeline.
5. **The base colour is quoted as hex and repeated.** Models drift on colour more
   than on anything else; naming it twice measurably helps.
6. **Negatives stay in the style lock**, not scattered through the subject.

---

## 7. Acceptance checklist

Every sprite is checked against this before it enters the manifest as `accepted`.
It is deliberately mechanical — a subjective bar produces an inconsistent roster.

- [ ] Canvas is exactly the declared size, and the strip is exactly `N × width`
- [ ] Background is fully transparent (no white or checkerboard fill)
- [ ] Outline is present, 1px, closed all the way round, not pure black
- [ ] No more than 4 tonal steps in any single material region
- [ ] No anti-aliased or semi-transparent edge pixels
- [ ] Light reads as top-left in every frame
- [ ] Subject scale is identical across every frame in the strip
- [ ] Silhouette is identifiable against the arena floor at 100% zoom
- [ ] Base colour matches the declared token within a small tolerance
- [ ] Sits beside the current baseline sprite without either looking out of place

The last item is the one that matters most and the only one a script cannot
check. Keep the accepted Plastic Bottle open in a second window as the yardstick.

## 8. Tuning the style lock

The numbers in this document are a starting point. Expect to change them after the
first batch — that is the process working, not a failure.

**How to change the style lock safely:**

1. Change it in this file, in one commit, with the reason.
2. Bump `styleVersion` in the manifest.
3. Regenerate the **baseline sprite** first, and only that one.
4. Compare against the previous baseline side by side.
5. If accepted, mark every sprite at the old `styleVersion` as `stale` and
   regenerate in batches.

**Never** hand-fix a single sprite to match a style the prompt does not produce.
That is how a roster ends up unreproducible: the moment the file is lost, nobody
can make another one like it.

## 9. Known unknowns

Stated plainly rather than discovered later:

- **Consistency across generations is not guaranteed by any current image tool.**
  The style lock materially improves it; it does not make it deterministic. Budget
  for regenerating a sprite several times and picking the best.
- **Text and small symbols are unreliable at these sizes.** Nothing in the roster
  depends on generated text; the label band is a colour band, not lettering.
- **Exact hex adherence is approximate.** The pipeline's palette-snap step (see
  the plan, §4) exists because of this and is not optional.
- **4-frame death animations may generate as 4 unrelated drawings.** The sheet
  slot's "only the pose changes" line is the mitigation; verify per strip.
