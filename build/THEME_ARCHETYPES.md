# Theme and Archetype System

This document is the design reference for making Arena Survivor's fiction replaceable without rewriting its game systems.

From V0.3 Phase 2 the production theme is **environment/nature** (`eco-guardian`). The original **knights and magic** pack (`knight-magic`) is retained as a second, complete production theme. It is not a fixture: it must keep satisfying every contract and passing every rule test, which makes it a far stronger boundary regression target than a synthetic stub.

The source-level authority is the active theme manifest under `src/game/content/themes/`. `active-theme.ts` selects one pack for the runtime; `theme-registry.ts` lists every pack for tooling and validation and is deliberately kept out of the runtime path so the production bundle never carries a theme it does not render.

This document continues to explain the boundary and the safe refactor process.

## Goal

A future theme pivot—science fiction, modern, horror, or something else—must not require searching scenes and systems for words such as `Grunt`, `Magic Bolt`, or `Shrine`. Core systems operate on stable, theme-neutral archetype IDs and capabilities. A theme pack supplies the names, descriptions, tuning, effect composition, visual/audio references, and content relationships for those archetypes.

Basic mathematical stats and engine rules are theme-neutral. Characters, weapons, enemies/monsters, skills, upgrades, pickups, shrines, curses, and future content are theme-owned definitions that satisfy core contracts.

## Ownership boundaries

| Concern | Owner | Example |
| --- | --- | --- |
| Primitive stats and rule contracts | Core | health, speed, crit chance, damage calculation |
| Stable semantic role | Archetype contract | `enemy.swarm_basic`, `weapon.starter_projectile` |
| Player-facing identity and text | Theme copy catalog | “Plastic Bottle”, “Sorting Pulse”, descriptions |
| Tuning and mechanic composition | Theme category definition | enemy health/speed; projectile behaviour |
| Balance curves and cadence | Theme tuning pack | XP curve, spawn cadence, Chaos coefficients |
| Rendering/audio references | Theme tokens/assets | colours, texture keys, particles, sound keys |
| Simulation and orchestration | Systems/scenes | spawning, targeting, collision, XP, run state |

Balance values are theme data, not engine constants. A tuning literal inside a system, scene, or entity is a boundary violation: it makes a second theme impossible to balance independently and turns a tuning change into a code change.

Systems may ask what capabilities a definition has; they must never branch on a theme name or player-facing string.

## Planned source layout

```text
src/game/
  core/
    stats/                    Theme-neutral stat types and formulas
    archetypes/
      ids.ts                  Branded stable IDs and content kinds
      contracts.ts            Character, weapon, enemy, skill, etc. contracts
      effects.ts              Reusable mechanic/effect descriptors
  content/
    active-theme.ts           The only active-pack selection point
    define-theme.ts           Typed constructor and validation entry point
    themes/
      knight-magic/
        index.ts              Root manifest; the core reference for this theme
        copy.ts               All player-facing names and descriptions
        tokens.ts             Palette, shapes, asset/audio/feedback keys
        characters.ts
        weapons.ts
        enemies.ts
        skills.ts
        upgrades.ts
        pickups.ts
        shrines.ts
        curses.ts             Added when curses enter scope
  systems/                    Consume definitions through the content facade
  scenes/                     Never import a concrete theme directory
  ui/                         Resolves display copy from the active theme
```

`index.ts` is the one place to understand a complete theme. It assembles and exports the theme manifest. `copy.ts` is the one place to rename all player-facing content. Category files are touched only when that category's tuning or behaviour changes. `tokens.ts` and the theme asset directory are touched only when presentation changes.

## Stable IDs and current knight-magic mapping

IDs describe gameplay roles, not fiction. They remain stable across theme packs and must never be shown directly to players.

| Stable archetype ID | `eco-guardian` (production) | `knight-magic` (secondary) |
| --- | --- | --- |
| `character.starter` | Environment Protector | Wandering Knight |
| `weapon.starter_projectile` | Sorting Pulse | Magic Needle |
| `enemy.swarm_basic` | Plastic Bottle | Grunt |
| `enemy.fast_fragile` | Plastic Bag | Runner |
| `enemy.slow_durable` | Glass Bottle | Tank |
| `enemy.death_spawner` | Bagged Waste | Broodmother |
| `pickup.experience` | Impact Point | Arcane Spark |
| `shrine.spawn_surge` | Landfill Breach | Shrine of the Horde |
| `shrine.greed` | Fast Fashion Boom | Shrine of Greed |
| `shrine.multiplicity` | Single-Use Boom | Shrine of Multiplicity |
| `shrine.duplication` | Overproduction Order | Shrine of Duplication |
| `skill.piercing_momentum` | Sorting Momentum | Piercing Momentum |
| `skill.on_kill_explosion` | Compaction Burst | Detonation |
| `skill.fracture` | Fragmentation | Fracture |
| `skill.bloodlust` | Cleanup Streak | Bloodlust |
| `skill.chain_reaction` | Cascade | Chain Reaction |
| `upgrade.damage` | Reinforced Tools | Tempered Power |
| `upgrade.crit_chance` | Precision Sort | Critical Mass |
| `upgrade.pierce` | Deep Reach | Sharpened Tip |
| Chaos (HUD vocabulary) | Pollution | Chaos |

`skill.fracture` is worth noting: the mechanic shipped in V0.2 as a fantasy curse, and it models what plastic actually does — fragment rather than decompose. The stable ID needed no change.

The table is an intent map, not a second runtime catalog. When source files exist, names are edited in `copy.ts`, and this table records the conceptual mapping only.

## Theme manifest contract

The exact TypeScript shape will be reconciled during Phase 1, but it must preserve this separation:

```ts
defineTheme({
  id: "knight_magic",
  copy: { /* every player-facing name and description */ },
  tokens: { /* palette and presentation references */ },
  characters: { /* definitions keyed by stable character IDs */ },
  weapons: { /* definitions keyed by stable weapon IDs */ },
  enemies: { /* definitions keyed by stable enemy IDs */ },
  skills: { /* reusable themed mechanic definitions */ },
  upgrades: { /* level-up offers and modifiers */ },
  pickups: { /* collectible definitions */ },
  shrines: { /* risk/reward definitions */ },
  tuning: { /* balance values, including where and when shrines arrive */ },
});
```

Player-facing reference copy lives in `copy.codex` alongside the rest of `copy`.
The Field Guide never authors a number of its own: an entry's identity comes
from `copy.content`, and everything it says a shrine does is read from the
definition the run actually resolves. See REC-060 and the `copy.stats` /
`copy.world` labels it reuses.

Content definitions may compose reusable core effects such as projectile, contact damage, stat modifier, spawn burst, or reward multiplier. Adding a theme must not require adding theme-specific conditionals to those effects.

## Non-negotiable rules

1. Never compare or persist player-facing names to implement behaviour. Use stable IDs.
2. Never hard-code themed copy, colours, asset paths, or sound keys in systems, scenes, generic entities, or HUD code.
3. Never name generic runtime classes after the current theme. Prefer `EnemyActor` configured by `enemy.swarm_basic`, not `Grunt` with Grunt-specific logic.
4. Resolve the active theme through `active-theme.ts`; application code must not deep-import `themes/knight-magic`.
5. Validate each manifest at startup/build time for unique IDs, missing copy, broken references, invalid stat values, and unsupported effect descriptors.
6. Tests for game rules assert stable IDs and outcomes. Only theme validation/presentation tests assert current names.
7. Save data and telemetry store stable IDs plus a theme/schema version, never display names. Portable save requirements and migrations are defined in [`SAVE_DATA.md`](./SAVE_DATA.md).
8. A deferred content category gets a contract or registry hook only when useful; do not implement its gameplay early merely to fill the theme.

## Safe change workflows

Rename current content:

1. Edit `themes/knight-magic/copy.ts`.
2. Run theme validation and the presentation smoke test.
3. No simulation files should change.

Retune or rebuild one archetype:

1. Edit only its relevant theme category definition.
2. Update rule tests for the stable archetype ID.
3. Record balance or compatibility findings in `RECONCILIATION.md`.

Change visuals or audio:

1. Edit theme tokens and theme-owned assets.
2. Run manifest validation and visual/browser smoke tests.
3. Do not change combat or progression systems unless a new reusable capability is genuinely required.

Pivot the entire theme:

1. Add a sibling theme directory implementing the same required archetype roles, including its own tuning pack.
2. Register it in `theme-registry.ts` so validation and `npm run balance` cover it.
3. Select it in `active-theme.ts`.
4. Run contract, content, and critical-path tests, then compare `npm run balance` between packs.
5. Keep the old pack complete and registered; a pivot should be reversible as a one-line selection change, and the retained pack is the boundary regression target.

## Proof that the boundary works

Three manifests are validated on every run: the two production packs and a tiny test-only fixture with deliberately different labels and tokens. Automated tests prove that:

- the same run systems accept every manifest;
- both production packs satisfy every required archetype, copy entry, token, and tuning field;
- the two production packs expose identical stable roles while differing in identity, presentation, and tuning;
- changing the active theme changes presented labels without changing rules;
- theme-specific directories are not imported by systems, scenes, entities, or UI;
- `active-theme.ts` is the only runtime selection point, and it does not reach for the registry;
- the browser boot path resolves the expected theme from the facade rather than a hard-coded id.

V0.3 Phase 2 replaced the single-production-theme assumption. Keeping `knight-magic` complete costs one content directory and buys a real second implementation of every contract — the swap to `eco-guardian` was a one-line change in `active-theme.ts` plus one test that had hard-coded a theme id.
