# Theme and Archetype System

## Familiar Australian appearance —2026-10-23

Use recognisable ordinary Australian/Sydney objects before abstract/fantasy
silhouettes. Read [appearance references](sprites/AUSTRALIAN_REFERENCE_NOTES.md).
Wine bottles/jars, drink cans, snack packets, household rubbish bags and practical
cleanup equipment guide the shapes. Theme colours accent credible materials;
they do not erase object identity. This is appearance direction, not a new factual
lesson, prevalence ranking, disposal claim, tuning change or saved content ID.
Older angular/squat Glass Bottle art is retained for comparison; a wine-bottle
alternative follows the owner direction. World display size remains unchanged.


## Owner direction — Knights and Magic paused indefinitely

Effective 2026-10-22: all further `knight-magic` theme development is paused
indefinitely. Only the owner explicitly reopening the theme can end this pause;
a new milestone, generic parity rule, old plan or failing themed test cannot.
Do not plan or implement its content, tuning, names/copy, sprites, features or
new dedicated acceptance campaigns. Preserve its existing files and historical
records. Existing generic contract tests may read the frozen pack; a change that
would require editing it must be recorded and deferred until explicit reopening,
rather than silently expanding this scope. Continue eco-guardian through stable
core contracts. This overrides older instructions to keep both packs in step.


This document is the design reference for making Arena Survivor's fiction replaceable without rewriting its game systems.

From V0.3 Phase 2 the production theme is **environment/nature** (`eco-guardian`). The original **knights and magic** pack (`knight-magic`) is retained frozen for historical compatibility. Its earlier role as a continuously developed second production pack is suspended by the owner direction above.

The source-level authority is the active theme manifest under `src/game/content/themes/`. `active-theme.ts` selects one pack for the runtime; `theme-registry.ts` lists every pack for tooling and validation and is deliberately kept out of the runtime path so the production bundle never carries a theme it does not render.

This document continues to explain the boundary and the safe refactor process.

## Goal

A future theme pivot—science fiction, modern, horror, or something else—must not require searching scenes and systems for words such as `Grunt`, `Magic Bolt`, or `Shrine`. Core systems operate on stable, theme-neutral archetype IDs and capabilities. A theme pack supplies the names, descriptions, tuning, effect composition, visual/audio references, and content relationships for those archetypes.

Basic mathematical stats and engine rules are theme-neutral. Characters, weapons, enemies/monsters, skills, upgrades, pickups, shrines, curses, and future content are theme-owned definitions that satisfy core contracts.

## Ownership boundaries

| Concern | Owner | Example |
| --- | --- | --- |
| Primitive stats and rule contracts | Core | health, speed, crit chance, damage calculation |
| Stable semantic role | Archetype contract | `enemy.swarm_basic`, `weapon.starter` |
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
| `weapon.starter` | Cleanup Grabber | Magic Needle |
| `weapon.secondary` | Cleanup Vacuum | Runic Fan |
| `enemy.swarm_basic` | Plastic Bottle | Grunt |
| `enemy.fast_fragile` | Microplastics (V0.4.2.1; replaces Plastic Bag) | Runner |
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

### V0.4.2 starter-role migration

`weapon.starter_projectile` describes a delivery mechanism, not a semantic
role. V0.4.2 replaced it with `weapon.starter` while persistence was still
unshipped. The two production themes deliberately supply different delivery
kinds under the same role:

| Stable role after V0.4.2 | `eco-guardian` | `knight-magic` |
| --- | --- | --- |
| `weapon.starter` | Cleanup Grabber — narrow multi-target path, reach levels 1–5 | Magic Needle — the parked existing projectile |

### V0.4.2.1 material-family extension

The next correction keeps core IDs role-based. `enemy.fast_fragile` becomes
Microplastics in the eco pack; a new stationary-fragment role becomes Glass
Shards. Plastic Bottle fragments route to Microplastics, Glass Bottle fragments
route to Glass Shards, and Bagged Waste releases the finite primary material
set without creating another Bagged Waste. See
[`ECO_CONTENT_MAP.md`](./ECO_CONTENT_MAP.md) for the editorial relationship map.

This is the boundary working as intended: the core requires a starter weapon,
not a projectile. The theme owns whether that weapon delivers damage through a
melee reach or a travelling body. A melee delivery may resolve every actor in
its narrow corridor; this is geometry, not the projectile pierce mechanic. The old projectile actor and effect path stay
available; only the active eco definition stops using them.

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
from `copy.content`, everything it says a shrine does is read from the shrine
definition, and an upgrade's per-run cap is read from `maxLevel` on the upgrade
definition. See REC-060, REC-062, and the `copy.stats` / `copy.world` labels the
guide reuses.

The palette carries a `health` token distinct from `pickup`, so the HUD's health
and level bars are never the same colour by accident.

`tokens.tiers` and `copy.tiers` carry the six-rung upgrade roll ladder — common,
uncommon, rare, epic, legendary, unique. These are read by position rather than
by theme feel, so a pack should keep them recognisably white, green, blue,
purple, yellow, and red however far its own palette travels. The ladder's
weights and multipliers are `tuning.upgradeTiers`. Note the deliberate split in
REC-065: an upgrade's `rarity` is how often it *appears*, while its tier is how
good a particular offer of it *is*.

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

## Q1 difficulty and sprite presentation metadata

Beginner / Normal / Experienced are stable run-setting IDs; names/descriptions
and all preset multipliers live in each theme. The selected preset resolves an
immutable per-run view of character, weapon, enemy, hazard and director data.
The source manifest stays unchanged, preserving material identity and the
persistence-health model. Session choices apply to the next run; settings do
not silently change an active run's difficulty. Sprite metadata declares the
sheet's authored facing and walk poses/stride, including differently facing hit
poses; no physics or gameplay value is derived from those fields.


Q2 follow-up (2026-10-12): Microplastics now open the eco run; Plastic Bottles
enter quietly at 10% progress (30 seconds on the five-minute timer) and ramp
from ~6% to ~43% of calm natural spawn selection. At 0.5 gameplay rate this
first unlock is about 60 real seconds into active play. Microplastics now pay
1 XP as the common opening enemy; material health ordering stays unchanged.
Bagged Waste still releases its fixed 2 bottles / 2 Microplastics / 1 glass mix
pending owner confirmation. Site-event labels counter camera zoom at UI scale,
and spent events disappear from the minimap. Spawn accounting distinguishes
natural arrivals (including milestone waves), Fracture, Bagged Waste release,
site effects (surge/duplication) and test loads; source means immediate creation,
so ambient pressure modified by a shrine is still natural. No factual claims,
new material identities or bitmap generation are introduced.

Q4 opening balance: eco `enemy.fast_fragile` now has 9 base health as an explicit
one-hit opening override (REC-112), retaining the material ordering. Other roles
and starter damage stay unchanged. The standalone inspector resolves the chosen
difficulty using the game's resolver, labels stats through theme copy and reads
physics/stats from definitions, never sprites. Its starting values exclude
time/pressure/elites/upgrades; future live stat-book selectors must preserve that
distinction. The secondary pack's roster balance is unchanged.


### V0.4.3 C2 — secondary-tool evolution

After four actual picks of its owned reach upgrade, the second tool can evolve
through the normal level-up draw: Cleanup Vacuum → Cyclone Vacuum, Runic Fan →
Runic Tempest. A distinct definition replaces the source in the same slot with
its exact earned reach and existing attack clock. Shared upgrades stay shared;
old owner entries retire and reset returns to the starting loadout. The evolved
tool has a wider four-target cone and stronger bounded on-hit splash; theme
weapons data owns every value. Quality tiers retain their gains but do not count
as extra picks toward the condition. No paired-equipment subsystem, environmental
fact/material-effectiveness claim, persistence or sprite generation is introduced.
The education document's earlier max-level/paired-item example remains exploratory;
this shipped condition uses the existing capped owner track instead.


### V0.4.3 C3 — shrine and curse catalog

| Stable role | Eco | Knight/magic |
| --- | --- | --- |
| `shrine.escalation` | Unmanaged Dump | Shrine of Defiance |
| `curse.frenzy` | Overflow Contract | Frenzy Pact |
| `curse.escalation` | Contamination Pact | Doom Pact |

Each theme now owns `curses.ts` beside shrines/upgrades. A curse is a run-local,
one-time world bargain; its normal level-up offer uses `curse.accept` and records
stable accepted IDs separately from shrine activations. Shared world resolution
composes Chaos additions and spawn/XP products, retaining fractional rewards.
Curses do not add actors, timers, queues, inherited source rewards or profiles.
The new shrine uses the existing world-multiplier actor/arrival/guide path.
Both production themes remain complete; a small alternate fixture may omit this
optional new shrine and provide an empty curse registry.

### V0.4.3 C4 elite family

Both packs author four elite definitions: baseline plus split/shield/acceleration.
Eco Dispersing/Wrapped/Rolling Waste correspond to Splitting/Warded/Charging Elite.
Copy catalog owns names/descriptions, elites.ts owns finite mechanics and markers.
Identity is inherited, not inferred from sprite/tint. See content/C4_REPORT.md.


### V0.4.3 C5 — unique encounter capabilities

Enemy definitions may carry one unique mini/final boss capability with normalized
arrival and simulation warning/recovery/radius/damage. It is excluded from ambient
roles, random elites, duplication and descendant relationships. Stable mini/final
IDs map to Compacted Waste/Dumping Colossus or Runic Sentinel/Chaos Warden. All
combat/body/display/reward values are explicit theme data; primitive shape and
health bars observe combat state and never determine it. Exactly one of each kind
can be authored; no boss art is claimed by this phase.

## V0.4.3 C6 implementation checkpoint /2026-10-20

Browser-local schema2 now retains six settings, terminal-only lifetime statistics,
completed/death counts, longest run and stable identity/unlock IDs. Both themes
unlock the existing secondary tool after one finished run and bloodlust after25
finished-run kills, affecting the next run only. These are the planned mechanical
content unlocks, distinct from exploratory educational cosmetic feats. No permanent
stat bonus, active-run suspension, sprite or new factual content is added.
Corrupt storage is preserved; denied/quota storage falls back to memory with visible
warnings. Schema1 migration is deterministic. C7 portable export/import/preview and
explicit backup recovery are implemented through the same validated profile model.


### V0.4.3 C7 — portable progress

Title Settings → Manage Save exports the complete implemented profile to encoded
text/download, or previews a file/pasted save before explicit confirmation. Both
themes supply labels/warnings; stable IDs retain identity across display-name
changes. Unknown valid IDs remain saved and warn about unavailable selection.
Backup restore and reset each need confirmation. No save management is offered
during a live run; no transient simulation objects or suspended run are persisted.
Current progress is preserved on cancellation/invalid input/storage failure, and
corrupt source is quarantined without replacing a good backup. See SAVE_DATA.md
for exact format, bounds, storage transaction limits and accepted schema migration.

### Session21 selected correction — owner-track target capacity

Q6 will extend vacuum primary-target capacity through its own weapon progression;
the current three-target/four-target evolved definitions remain the implemented
baseline until that gate passes. A modest early cap is retained. Exact integer
steps, finite ceiling and evolution tuning belong to theme weapon data and need
balance verification. Earned capacity must survive same-slot evolution without
regression; splash caps are a separate authored mechanic. The reusable contract
must validate both Cleanup Vacuum/Cyclone Vacuum and Runic Fan/Runic Tempest while
keeping themed identity out of systems. No new stable IDs, save schema, materials
or sprites are selected by this planning decision.

## Readable roster roadmap — 2026-10-21 planning boundary

[Master gameplay design record](MASTER_BUILD_PLAN.md#readable-gameplay-design-context) owns the staged candidate
assessment and G1–G4 gates. Existing Plastic Bottle, Microplastics, Glass Bottle,
Bagged Waste and stationary Glass Shards keep their stable IDs and finite material
relationships. No current role is renamed to match a survey ranking. Plastic Bag
remains retired as the identity of `enemy.fast_fragile`; a future bag is a distinct
candidate, not restoration of that mapping. Hard-plastic pieces >5mm must not be
labelled Microplastics merely to reuse a role.

New candidate names are editorial proposals only; reserve neutral IDs and reusable
capabilities with both-theme validation at implementation. Gust drift, rolling
commitment/recovery and clustered litter must be data/capability driven, not themed
string branches in systems. Balance stats, weights, cues and timings stay theme
owned. Prevalence, persistence, mass and fictional contact harm are separate axes.
Read SAVE_DATA before any persisted ID/discovery/unlock change. Prototype primitives
before V0.4.4 acceptance; no new sprite claims or collision-from-art derivation.

## Q6 implemented correction — 2026-10-21

The second tool's own four reach picks each add one primary target, independent
of rarity and unrelated levels:3→4→5→6→7. Evolution retains all four gains and
adds its authored extra target (8). Splash remains finite and unchanged. The
short filled cue marks a single pulse, followed by a faint historical outline
and selected-hit rings; entering the fade causes no new damage. Frame-specific
presentation anchors align player poses without editing accepted art or bodies.
This supersedes the earlier fixed3/4 and pending-Q6 wording. No environmental
fact, effectiveness matrix, persisted state or new sprite is added.
[Verification and limits](content/Q6_REPORT.md). G1 enemy tuning follows this gate.

## G1 accepted balance — 2026-10-21

After verified Q6, the existing-roster comparison selects only eco Glass armour
40→20 and its director base weight12→8. Glass retains96health, slow70movement,
9contact harm and7XP; the health ordering/material relationships stay intact.
The calm late natural selection mix is approximately45%Bottle/30%Microplastics/
11%Glass/14%Bagged, replacing the historical43/28/16/13rounded mix. These are game
weights, never litter-survey probabilities. Microplastics still open one-hit;
Bottles remain the numerical baseline, Shards stationary/clearable and bag
families finite. Knight tuning, other roles, weapon damage, progression, presets,
cap300 and rate0.5 stay unchanged. No new content, art, facts or saved IDs.
[G1_REPORT](content/G1_REPORT.md) separates corrected-model effects from tuning,
retains all scenarios and records the bounded local gate and its limits. G1 is
locally complete; G2–G4 and sprite generation remain unstarted.

## G2A weak groups — kept locally 2026-10-22

`enemy.cluster_fodder` maps to eco Cigarette Butts and knight Ashling. Individual
weak actors approach slowly in groups of three; clear a narrow lane or catch the
group in a cone. First introduction at25% is three retained requests, then sparse
natural groups.6HP/64speed/3harm/1XP are game tuning, unrelated to surveyed item
percentages or factual toxicity/persistence. Visible pale/orange primitive parts
and separate20px bodies replace neither Microplastics nor any material family.
No post-cleanup contamination patch, new art, saved discovery or effectiveness
matrix. Both themes retain all prior tuning/contracts and rate0.5/cap300.

[Reviewed plan](MASTER_BUILD_PLAN.md#readable-gameplay-g2), [candidate report](content/G2A_REPORT.md).
G2A is locally complete; G2 remains in progress. Packets/Wrappers are next under
a separate reviewed claim; Can/G3/G4 and sprite generation remain unstarted.

## G2B wrapper role — local keep 2026-10-22

`enemy.gust_drifter`: eco Packets / Wrappers; knight Paper Wisp. One introduction
at32% and sparse later arrivals. Approach → visible fixed-bearing warning → short
oblique gust → stationary recovery gives an interception choice. Generic capability,
theme-owned timings/stats/essential cue, code-native packet silhouette. Fictional
movement/harm, no real handling/abundance claim, automatic waste patch, new guide
surface, sprite or save field. Existing material families/IDs unchanged.
[G2B_REPORT](content/G2B_REPORT.md) records keep and measured limits. Can next;
G2 in progress, G3/G4/art unstarted. Historical earlier status remains historical.

## G2C kept / G2 complete — 2026-10-22

`enemy.committed_charger`: eco Aluminium Can; knight Barrel Construct. A visible
fixed line captures the player's old position, then a fast direct roll passes it
and stops for recovery. Sideways movement avoids that route; cleanup rewards the
return. This differs from the wrapper's oblique gust and weak-group lane clearing.
One introduction at55%, sparse natural weight2; timings/stats/cue/body/presentation
are theme-authored and use the shared capability. The primitive can's body/label/
end caps are code-native presentation, never physics input. No generated art,
material/harm/handling fact, new information surface, saved field or ID remap.

All three G2 candidates are locally kept; G2 scoped gate complete. [G2C_REPORT](content/G2C_REPORT.md) owns source/checks/trade-offs and aided-fixture limits.
[G3 master record](MASTER_BUILD_PLAN.md#readable-gameplay-g3) is written/reviewed. G3 ready/unstarted;
G4/art unstarted, external evidence still deferred/waived/unverified. This is the
current state; earlier staged continuation paragraphs are historical checkpoints.

## G3 rhythm and informed voluntary pressure — 2026-10-22

Locally kept after owner-requested execution: shared later roles unlock25/34/44/
52/60%, mini72%, baseline elites82%, final100%. Eco Microplastics0/Bottle10 and
knight Grunt0/Runner20 remain distinct. First Glass/Tank4, Bag/Broodmother2 use
existing retained causal introductions. Five optional sites at16/40/66/84/90%
replace the repeated Multiplicity arrival; definitions/cost/reward values stay.

Existing prompts now name the choice and show resolved current-world arrivals,
durability/harm/XP/elite chance before acceptance; walk away to ignore. Named
edge pointers remain, with distinct minimap site diamonds and a shorter authored
placement band. Bosses stop pursuit during their fixed-circle warning, then resume
in recovery; no new attack/counter/health/damage/body. These are game decisions,
not real material/handling/abundance claims. No quiz, currency, new roster, saved
field/ID, guide framework or sprite work. [G3_REPORT](content/G3_REPORT.md) records
verification, pressure/XP trade-offs and aided/timed model limits. G3 locally
complete; [reviewed G4 handoff](MASTER_BUILD_PLAN.md#readable-gameplay-g4) is current, G4/art unstarted.

## G4 — useful reviews and optional reference / 2026-10-22

Locally verified G4 adds a concise run review: actual committed direct/splash
damage by tool, other effects as the remaining partition, recorded voluntary
site/curse pressure and an attainable next experiment. The old damage ledger,
metrics and upgrade tally remain in Details (click or Tab); R/Enter restarts.
A death source describes the recorded final hit at elapsed time, including
endless overtime; it is not a diagnosis of the whole run. Final-boss success
appears only from its recorded flag and can coexist with a later death.

Info and the pause Field Guide/Grimoire now include one paged enemy entry at a
time and read-only progress toward the existing finished-attempt/kill unlocks.
Enemy descriptions/relations come from the current theme; health, speed and
contact harm come from difficulty-resolved definitions, displayed to two decimals
and explicitly labelled game values. They are reference values, not every live
actor's time/world/elite-scaled state. Previous/Next and PgUp/PgDn navigate;
Tab/arrows switch sections and Escape returns. Reading is optional and changes
no progress. No new fact, ranking, disposal/handling advice, discovered-material
record, ID remap or permanent stat economy was selected. Existing environmental
copy has not received a new factual review in this phase.

[Report](content/G4_REPORT.md) owns checks/limits; [next handoff](NEXT_READABLE_GAMEPLAY_HANDOFF.md)
is current. G1–G4 are locally complete; new sprite generation remains unstarted.
