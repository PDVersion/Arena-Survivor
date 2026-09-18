# Eco Guardian Content Map

This is the wiki-shaped editorial map for the eco theme. It records player-
facing identity, relationships, and approved wording so content stays coherent
before the in-game catalogue is expanded. Stable IDs and runtime theme data
remain authoritative for behavior and numbers; the future catalogue should
derive its numeric details from those definitions rather than copying them here.

Status terms: **Live** is in V0.4.2, **V0.4.2.1** is approved for the next build,
and **Parked** is not offered by this theme.

## Character and weapon

| Stable ID | Name | Kind | Player-facing wording | Status |
| --- | --- | --- | --- | --- |
| `character.starter` | Environment Protector | Character | A field operative clearing an overflowing waste site. | Live |
| `weapon.starter` | Cleanup Grabber | Melee weapon | A mechanical grabber that extends through every item in its narrow path, then retracts. | Live |
| `upgrade.weapon_range` | Longer Grabber | Weapon track, owned level 1 | Extend the Cleanup Grabber's reach. Four upgrades raise it from level 1 to level 5. | Live |
| `upgrade.weapon_collection_sweep` (planned) | Collection Sweep | Weapon track, starts unowned | Periodically sweep a wider area at the grabber's jaws. Higher levels trigger more often and add sweeps along extension and retraction. | V0.4.2.1 |

Collection Sweep level wording:

| Level | Catalogue wording |
| --- | --- |
| 1 | Every eighth grab creates a collection sweep at maximum reach. |
| 2 | The collection sweep now triggers every sixth grab. |
| 3 | The collection sweep now triggers every fourth grab. |
| 4 | Every fourth grab sweeps during extension and again at maximum reach. |
| 5 | Sweeps trigger after two to four grabs and add one to three extra sweeps along both extension and retraction. |

## Enemy material families

| Stable role | Eco name | Identity and behavior | Can create | Status |
| --- | --- | --- | --- | --- |
| `enemy.swarm_basic` | Plastic Bottle | Common moving plastic waste; the baseline crowd role. | Microplastics through Fragmentation | Live behavior; relation changes in V0.4.2.1 |
| `enemy.fast_fragile` | Microplastics | Small, fast, multicolour shards and pieces of plastic waste. This replaces Plastic Bag. | Nothing | V0.4.2.1 |
| `enemy.slow_durable` | Glass Bottle | Slow, durable glass waste. | Glass Shards through Fragmentation | Live behavior; relation changes in V0.4.2.1 |
| `enemy.death_spawner` | Bagged Waste | A large rubbish bag of mixed waste whose threat is what spills out. | Plastic Bottle, Microplastics, Glass Bottle | Live; children change in V0.4.2.1 |
| `enemy.stationary_fragment` (planned) | Glass Shards | A stationary contact hazard left by broken glass. It can be cleared but still hurts a player who stands on it. | Nothing | V0.4.2.1 |

Relationship map:

```text
Plastic Bottle --Fragmentation--> Microplastics --x
Glass Bottle   --Fragmentation--> Glass Shards  --x
Bagged Waste   --on break-------> Plastic Bottle
                                + Microplastics
                                + Glass Bottle
```

`--x` means the role cannot fragment again. Bagged Waste never creates another
Bagged Waste. In plans and copy, “rubbish bag” refers to Bagged Waste; the old
fast Plastic Bag identity is retired.

Approved descriptions:

- **Microplastics:** “Small plastic fragments spread easily and are difficult
  to recover once they enter the environment.”
- **Glass Shards:** “Broken glass stays where it falls and remains hazardous
  until it is cleared.”
- **Bagged Waste:** “A mixed rubbish bag that releases several kinds of waste
  when it breaks.”

These are concise game descriptions, not sourced educational fact cards. Any
precise environmental claim added later must follow the evidence rules in
`EDUCATION_PIVOT.md`.

## General upgrades and gear

General stat upgrades are repeatable. Skill and world effects may retain caps
when another level would otherwise be meaningless.

| Stable ID | Name | Type | Approved description |
| --- | --- | --- | --- |
| `upgrade.damage` | Reinforced Tools | General / offense | Process more waste with every grab. |
| `upgrade.attack_speed` | Rapid Cycling | General / offense | Cycle the Cleanup Grabber more frequently. |
| `upgrade.crit_chance` | Precision Sort | General / critical | Increase the chance of a critical separation. |
| `upgrade.move_speed` | Field Boots | General / gear | Cover the site more quickly. |
| `upgrade.health` | Safety Gear | General / gear | Increase maximum health and recover by the same amount. |
| `upgrade.pickup_radius` | Collection Range | General / utility | Draw impact credit from farther away. |
| `upgrade.armour` | Protective Kit | General / gear | Reduce the harm waste does on contact. |
| `upgrade.regeneration` | Field Medic | General / gear | Recover health steadily while you work. |
| `upgrade.luck` | Sharp Eye | General / utility | Better equipment turns up more often. |
| `upgrade.fracture` | Fragmentation | General / material skill | Some cleared waste creates material-specific fragments. |
| `upgrade.bloodlust` | Cleanup Streak | General / skill | Recent clearances increase the Cleanup Grabber's cycling speed. |
| `upgrade.world_surge` | Single-Use Surge | General / world | Far more waste arrives, and clearing it is worth far more. |
| `upgrade.world_brittle` | Brittle World | General / world | Double your output, and let the site get much worse. |

## Parked or theme-inappropriate entries

Sorting Pulse, projectile pierce, extra projectiles, and their copy are parked
for the knight/magic theme or later reassignment. They must not appear in the
eco upgrade pool or its player-facing catalogue while Cleanup Grabber is the
starter. Compaction Burst, Cascade, and Sorting Momentum likewise remain parked
until a compatible real-world delivery and educational purpose are approved.

## Catalogue implementation rule

The future in-game information catalogue groups content as Character, Weapons,
Weapon Upgrades, General Upgrades/Gear, Enemies, Material Relationships, Skills,
World Effects, Shrines, and Hazards. Names/descriptions come from theme copy;
levels, values, caps, discovered state, and relationships come from live theme
definitions and session statistics. This document supplies structure and
wording review, never a second executable ruleset.
