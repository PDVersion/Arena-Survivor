# V0.4 — Two Parallel Streams

V0.4 is two independent bodies of work that happen to share a version number:

| Stream | What | Plan | Branch |
| --- | --- | --- | --- |
| **V0.4.0** | The shared seam both streams need. One small PR, merged first. | This file, §2 | `claude/v0.4.0` |
| **V0.4.1** | Sprites: art pipeline, prompt system, and the full sprite roster | [`SPRITE_PLAN_V0.4.1.md`](./SPRITE_PLAN_V0.4.1.md) | `*/v0.4.1` |
| **V0.4.2** | Content growth from [`PLAN.md`](./PLAN.md) §V0.4: weapons, evolution, bosses, curses, unlockables, persistence | [`BUILD_PLAN_V0.4.2.md`](./BUILD_PLAN_V0.4.2.md) | `*/v0.4.2` |

**V0.4.1 and V0.4.2 are designed to be built at the same time by different
agents, on different branches, without coordinating.** This file is the contract
that makes that safe. Read it before starting either stream.

Further increments (V0.4.3, V0.4.4) follow the same pattern: claim a file
ownership block in §3, or the increment is not independent and should be
sequenced instead.

---

## 1. Why the split

The sprite work and the content work touch almost nothing in common. Sprites are
presentation: textures, a loader, and one branch in each entity. Content is
simulation: new definitions, new systems, new state. The only place they meet is
the theme manifest, and that meeting point is small enough to land up front and
then never touch again.

Splitting them also matches how they fail. Sprite work stalls on generation
quality, which is unpredictable and iterative. Content work stalls on design
decisions. Neither should be able to block the other, and under one milestone
they would.

**Note on scope drift:** PLAN.md lists *Endless mode* under V0.4. It shipped
early, in V0.3.1 (REC-064, REC-068). V0.4.2 inherits only what is left.

## 2. V0.4.0 — the seam

One PR. It lands **before either stream starts** and is the only commit that
touches the files both streams would otherwise contend for. It adds no sprites
and no content: it makes the space for both.

### What it changes

| File | Change |
| --- | --- |
| `src/game/core/archetypes/contracts.ts` | Add `SpriteDefinition`, `SpriteState`, `ThemeSprites`, and `ThemeTokens.sprites?` |
| `src/game/content/define-theme.ts` | Validate sprite entries when present; absent is valid |
| `src/game/content/themes/*/sprites.ts` | **New file per theme**, exporting `sprites = {}` |
| `src/game/content/themes/*/index.ts` | Import and wire `sprites` into `tokens` |
| `src/game/systems/sprites/resolve-sprite.ts` | **New.** Pure lookup, unit-testable without Phaser |
| `src/game/systems/sprites/sprite-view.ts` | **New.** The presentation branch — see REC-072 |
| `src/game/systems/sprites/load-sprites.ts` | **New.** Queues sheets and sets nearest-neighbour filtering per texture |
| `src/game/scenes/boot-scene.ts` | A `preload` that loads the active theme's sheets |
| `src/game/entities/*.ts` | One branch per actor: use the sprite if the theme has one, else the current primitive |
| `scripts/sprites.ts` | Skeleton with `check`, `build`, `status` — all three no-ops over an empty manifest |
| `package.json` | `"sprites": "vite-node scripts/sprites.ts"` |

Two entries are not what the first draft of this plan expected, and both are
recorded rather than quietly changed:

- **The loader had to be here.** Nothing in the original table loaded a texture,
  and `src/game/scenes/**` belongs to V0.4.2 from the moment this merges — so
  V0.4.1 could not have added preloading without reaching outside its block. The
  seam has to open that door.
- **`config.ts` is not changed.** `antialias: true` → `pixelArt: true` was the
  original instruction; Phaser expands `pixelArt` to `antialias: false` plus
  `roundPixels: true` for the whole renderer, which hardens every primitive in
  the game — and the primitives outlive the sprite roster. Nearest-neighbour is
  applied per texture in the loader instead. **REC-073.**

All six actors take the branch, not the five listed in `SPRITE_PLAN_V0.4.1.md`
§3: its own inventory in §1 includes the projectile.

### Why a separate `sprites.ts` per theme

The obvious place for sprite entries is `tokens.ts`, next to the palette. That
would be wrong here: `tokens.ts` is a file V0.4.2 will edit whenever it adds
content that needs a colour, and V0.4.1 edits it on every single sprite. A
dedicated file gives V0.4.1 sole ownership and removes the busiest conflict
in the whole plan.

### Why the seam ships empty

Every V0.4.0 change is inert on its own — no sprite exists, so every entity takes
the fallback branch and the game renders exactly as it does today. That is the
point: the PR is reviewable as "nothing changed visually", and it is verified by
the existing suite passing unmodified.

*Verification:* the full unit and browser suites pass with no test changes;
`npm run sprites -- status` prints an empty manifest; a run looks identical.

## 3. File ownership

**The rule: if a file is not in your stream's column, do not edit it.** If you
need a change in the other stream's territory, it belongs in a follow-up after
both merge, or in V0.4.0 before both start.

| Path | Owner |
| --- | --- |
| `build/SPRITE_*.md`, `build/sprites/**` | **V0.4.1** |
| `public/sprites/**` | **V0.4.1** |
| `src/game/content/themes/*/sprites.ts` | **V0.4.1** |
| `scripts/sprites.ts` | **V0.4.0, then V0.4.1** |
| `src/game/systems/sprites/**` | **V0.4.0, then V0.4.1** |
| `tests/unit/sprites/**`, `tests/e2e/sprites.spec.ts` | **V0.4.1** |
| `build/BUILD_PLAN_V0.4.2.md` | **V0.4.2** |
| `src/game/content/themes/*/` — everything except `sprites.ts` | **V0.4.2** |
| `src/game/systems/**` except `systems/sprites/` | **V0.4.2** |
| `src/game/state/**`, `src/game/scenes/**`, `src/game/ui/**` | **V0.4.2** |
| `tests/**` except the sprite paths above | **V0.4.2** |
| `src/game/core/**`, `src/game/config.ts`, `define-theme.ts` | **V0.4.0, then V0.4.2** |
| `src/game/scenes/boot-scene.ts` | **V0.4.0, then V0.4.2** |
| `src/game/entities/*.ts` | **V0.4.0, then V0.4.2** |
| `README.md`, `AGENTS.md` | **V0.4.2** — V0.4.1 documents itself inside `build/` |

`src/game/entities/*.ts` is the one genuinely shared file, which is exactly why
V0.4.0 writes the sprite branch into every actor up front. After that, V0.4.1
never opens an entity file again: adding a sprite is a data edit in
`themes/*/sprites.ts`.

## 4. The reconciliation problem, and its fix

`RECONCILIATION.md` is append-only and both streams will append to it. Two
branches appending at the same line is a guaranteed conflict, every time, and it
is the single most likely thing to make this plan annoying in practice.

**Fix:** V0.4.0 adds two anchors to the file, and each stream appends inside its
own. Different regions merge cleanly.

```markdown
## V0.4.0 entries — the seam
<!-- V0.4.0 is merged. Reserved ids: REC-071 to REC-073. -->

## V0.4.1 entries — sprites
<!-- V0.4.1 appends here. Reserved ids: REC-074 to REC-089. -->

## V0.4.2 entries — content
<!-- V0.4.2 appends here. Reserved ids: REC-090 onward. -->
```

REC-070 added the two stream anchors but reserved nothing for the seam, whose
first entry would therefore have been REC-071 — a silent collision with V0.4.1's
first id, which is the exact failure the reservation exists to prevent. V0.4.0
took REC-071 to REC-073 and moved V0.4.1's range up. **REC-071.**

Reserved id ranges matter as much as the anchors: two agents both reaching for
"the next number" produces two entries with the same id, which is worse than a
conflict because git merges it silently.

## 5. Working protocol for two agents

1. **V0.4.0 merges to `main` first.** Neither stream starts before it does.
   Built on `claude/v0.4.0`; read REC-071 to REC-073 before starting either stream.
2. Each stream branches from `main` after that merge.
3. **Merge `main` into your branch whenever the other stream lands**, rather than
   at the end. Both streams are long-lived; a single merge at the end is where the
   conflicts nobody planned for show up.
4. **Stay inside your ownership block.** A change outside it is a signal that the
   split was drawn in the wrong place — record it rather than reaching across.
5. **One PR per stream into `main`.** Order does not matter; the ownership table
   is what makes that true.
6. Sprite generation is tracked in [`sprites/MANIFEST.md`](./sprites/MANIFEST.md),
   which has its own claim protocol so even two agents *inside* V0.4.1 do not
   collide. See that file's §"Working across sessions".

### What each stream can assume about the other

- **V0.4.1 may assume** the content roster grows. New enemies, weapons, and
  shrines will appear that have no sprite. They render as primitives, which is
  correct and needs no action — sprite them in a later increment.
- **V0.4.2 may assume** sprites are optional and may appear for any content id at
  any time. Never read a sprite in a system, never derive a radius, hitbox, or
  separation value from one. A sprite is presentation; the simulation reads the
  definition. That rule is what makes the streams independent.

## 6. Definition of done

V0.4 is complete when both streams have merged, both production themes run, and
the ownership table has not been violated in either branch's history. The last
clause is worth checking: if it was violated, the next parallel milestone needs a
different split, and that is worth knowing before planning one.
