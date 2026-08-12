# Theme and Archetype System

This document is the design reference for making Arena Survivor's fiction replaceable without rewriting its game systems. The current working theme is **knights and magic**. Its labels are provisional, and it remains the only production content pack required by the completed V0.1 milestone and the current V0.2 plan.

Once implementation begins, the source-level authority becomes the active theme manifest under `src/game/content/themes/`. This document continues to explain the boundary and the safe refactor process.

## Goal

A future theme pivot—science fiction, modern, horror, or something else—must not require searching scenes and systems for words such as `Grunt`, `Magic Bolt`, or `Shrine`. Core systems operate on stable, theme-neutral archetype IDs and capabilities. A theme pack supplies the names, descriptions, tuning, effect composition, visual/audio references, and content relationships for those archetypes.

Basic mathematical stats and engine rules are theme-neutral. Characters, weapons, enemies/monsters, skills, upgrades, pickups, shrines, curses, and future content are theme-owned definitions that satisfy core contracts.

## Ownership boundaries

| Concern | Owner | Example |
| --- | --- | --- |
| Primitive stats and rule contracts | Core | health, speed, crit chance, damage calculation |
| Stable semantic role | Archetype contract | `enemy.swarm_basic`, `weapon.starter_projectile` |
| Player-facing identity and text | Theme copy catalog | “Grunt”, “Magic Bolt”, descriptions |
| Tuning and mechanic composition | Theme category definition | Grunt health/speed; Bolt projectile behaviour |
| Rendering/audio references | Theme tokens/assets | colours, texture keys, particles, sound keys |
| Simulation and orchestration | Systems/scenes | spawning, targeting, collision, XP, run state |

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

| Stable archetype ID | Current knight-magic label | Milestone status |
| --- | --- | --- |
| `character.starter` | Player character (name TBD) | Required |
| `weapon.starter_projectile` | Magic Bolt / Needle (final label TBD) | Required |
| `enemy.swarm_basic` | Grunt | Required |
| `pickup.experience` | XP pickup (final label TBD) | Required |
| `shrine.spawn_surge` | Shrine of the Horde | Required |
| `upgrade.damage` | Damage upgrade (final label TBD) | Required |
| `upgrade.attack_speed` | Attack-speed upgrade (final label TBD) | Required |
| `upgrade.crit_chance` | Critical Mass | Required |
| `upgrade.pierce` | Sharpened Tip | Required |
| `upgrade.world_spawn` | Swarming | Deferred unless needed by V0.1 choices |
| `enemy.fast_fragile` | Runner | V0.2 |
| `enemy.slow_durable` | Tank | V0.2 |
| `enemy.death_spawner` | Broodmother | V0.2 |
| `skill.piercing_momentum` | Piercing Momentum | V0.2 |
| `skill.on_kill_explosion` | Detonation / Explosion | V0.2 |

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
});
```

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

1. Add a sibling theme directory implementing the same required archetype roles.
2. Select it in `active-theme.ts`.
3. Run contract, content, and critical-path tests.
4. Keep the old pack until the new pack is validated; a pivot should be reversible as a one-line selection change.

## Completed V0.1 proof that the boundary works

V0.1 includes a tiny test-only theme fixture with deliberately different labels and tokens. Automated tests prove that:

- the same run systems accept both manifests;
- changing the active fixture changes presented labels without changing rules;
- no required V0.1 archetype or copy entry is missing;
- theme-specific directories are not imported by systems/scenes/UI;
- production selects the knight-magic manifest.

This fixture proves interchangeability without building or maintaining a second real theme. V0.2 extends the same validation and rename-only tests as its enemy, skill, shrine, elite, and feedback contracts enter scope.
