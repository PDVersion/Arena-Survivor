# Eco Guardian — current content map

Updated2026-10-27 from the live eco manifest. Numeric definitions in code remain
source of truth; this map records identity/availability. Knights and Magic is paused indefinitely under owner direction2026-10-22.
Preserve its content/history; no generic backlog or audit reopens it.

[Status](BUILD_STATUS.md) · [Build log](MASTER_BUILD_PLAN.md#v0-4-5) ·
[Current tuning/report](content/MONEY_TOOLS_SANDBOX_REPORT.md).

## Character and weapons

Environment Protector; four automatic slots. Each equipped tool starts at Level1
and follows one fixed path to Level7. Collection Sweep is part of Grabber levels.

| Stable ID | Current name | Behaviour |
|---|---|---|
| `weapon.starter` | Cleanup Grabber | A mechanical grabber that extends through every item in its narrow path. |
| `weapon.secondary` | Cleanup Vacuum | Surrounds you with a grey cleaning field. Damages every piece of waste inside over time and slows it slightly. |
| `weapon.cleaning_bin` | Cleaning Bin | Tosses a small bin; cleans its landing area, then releases a cleaning burst. |
| `weapon.orbiting_rake` | Orbiting Shovels | Shovels circle clockwise with their broad heads leading. Seven stepped levels. |
| `weapon.rake_beam` | Rake Sweep | Rakes travel straight to the screen edge in your movement or last faced direction. |

`weapon.orbiting_rake` intentionally retains its historical stable ID while
displaying Orbiting Shovels. Cyclone/evolution and separate old tool tracks are
retired from eco offers, with historical saved IDs preserved.

## Enemies

| Stable ID | Name | Behaviour |
|---|---|---|
| `enemy.scavenger` | Litter Rat | Wanders with a stash of litter. Flees when disturbed and sheds money; cleanup releases its stash. |
| `enemy.ranged_attacker` | Takeaway Cup | Tips back, then flicks a coffee blob along the marked direction. Sidestep after it aims, then approach during recovery. Its attack is a game abstraction. |
| `enemy.swarm_basic` | Plastic Bottle | The most common thing on the ground, and it never truly goes away. |
| `enemy.fast_fragile` | Microplastics | Small plastic pieces arrive in groups of three later in the run, or from plastic breakage and site events. |
| `enemy.slow_durable` | Glass Bottle | Slow and durable. Breaks into glass shards rather than microplastics. |
| `enemy.death_spawner` | Bagged Waste | A mixed bundle that can leave plastic fragments when cleanup is rough. |
| `enemy.stationary_fragment` | Glass Shards | Broken glass stays where it falls and remains hazardous until it is cleared. |
| `enemy.mini_boss` | Compacted Waste | Telegraphs rotating loose-litter, hard-litter and fragment releases. Never summons Bagged Waste or Glass Bottles. More likely to shed mixed fragments when cleared. |
| `enemy.final_boss` | Dumping Colossus | Cycles light, heavy and pressure-release attacks. Below 20% health, telegraphs one final mixed load of every ordinary enemy type. More likely to fragment when cleared. |
| `enemy.cluster_fodder` | Cigarette Butts | Weak opening litter arriving individually. Does not break into microplastics. |
| `enemy.gust_drifter` | Packets / Wrappers | Floats directly toward you over other rubbish and ground obstacles. Still causes contact harm and can be cleaned by tools. |
| `enemy.committed_charger` | Aluminium Can | Watch the line, step sideways, then clear it while it rests. Its roll commits to where you were when the warning began. Does not produce microplastics. |

Natural groups: Microplastics3, cigarettes1. Glass → shards; plastic/mixed waste
→ Microplastics; cigarettes/cans → none. Nonrecursive death-fragment reward budget
is parent75% + children35%. Boss death uses mixed pools; boss attack summons pay
independently and never create another boss. Material relationships are gameplay
rules, not scientific/disposal claims.

## Elite identities

| Symbol | Name | Extra behaviour |
|---|---|---|
| None | Standard elite | Larger/tougher, higher damage/reward |
| 2 | Dispersing Waste | Two-way split for one generation |
| ◇ | Wrapped Waste | Half incoming damage above half health |
| » | Rolling Waste | Gradual speed increase to1.5x |

All current elites:2xhealth,1.5xcontact harm,2.5xmoney,1.3xsize. In-game Field Guide
→ Elites reads these values from actual definitions.

## General upgrades and run contracts

| Stable ID | Name | Limit |
|---|---|---|
| `upgrade.damage` | Reinforced Tools | Repeatable picks |
| `upgrade.attack_speed` | Rapid Cycling | Repeatable picks |
| `upgrade.crit_chance` | Precision Sort | Repeatable picks |
| `upgrade.move_speed` | Field Boots | Repeatable picks |
| `upgrade.health` | Safety Gear | Repeatable picks |
| `upgrade.pickup_radius` | Collection Range | Repeatable picks |
| `upgrade.fracture` | Careful Cleanup | 5 picks |
| `upgrade.bloodlust` | Cleanup Streak | 6 picks |
| `upgrade.armour` | Protective Kit | Repeatable picks |
| `upgrade.regeneration` | Field Medic | Repeatable picks |
| `upgrade.luck` | Sharp Eye | Repeatable picks |
| `upgrade.world_surge` | Single-Use Surge | 4 picks |
| `upgrade.world_brittle` | Brittle World | 3 picks |
| `upgrade.accept_frenzy` | Overflow Contract | 1 picks |
| `upgrade.accept_escalation` | Contamination Pact | 1 picks |

## Site events

- **Landfill Breach** — Open a buried cell for a surge of waste and a greater return.
- **Fast Fashion Boom** — Accept a permanent rise in output for permanently better returns.
- **Single-Use Boom** — Double the incoming waste and the value of clearing it.
- **Overproduction Order** — Duplicate everything currently on site for a richer return.
- **Unmanaged Dump** — Raise world pressure for the rest of this run in exchange for more money.

## Money, rare pickups and meta shop

Money uses historical pickup.experience; silver below4, gold from4, banknote from25.
Magnet0.08%, food0.15%(20HP), Impact0.12%per eligible cleanup. Fortune increases
chances;2%per-kind cap, rats3xbonus. Impact saves between runs; capped shop offers
health/damage/Fortune/movement bonuses. Sandbox currencies/profile are isolated.

## Catalogue and art availability

Field Guide already has sites/enemies/elites/equipment/capabilities/lifetime, plus
run stats and upgrade summaries. Persistent discoveries, educational facts,
achievements and a full material-layer catalogue are unbuilt proposals.

Thirty live content sprite bindings use34reproducible sheets/119atlas frames,
including preserved parked icon/evolved-cone history. HUD uses smaller existing
weapon art. No generation is outstanding. Rake a2appearance accepted by owner;
remaining general art/balance acceptance is in [remaining work](REMAINING_WORK.md).
Completed old content-map notes are in the [design history log](logs/PRODUCT_DESIGN_HISTORY_20261027.md).

<!-- Historical heading anchors retained for existing links. -->
<a id="eco-guardian-content-map"></a>
<a id="owner-direction--knights-and-magic-paused-indefinitely"></a>
<a id="character-and-weapon"></a>
<a id="enemy-material-families"></a>
<a id="general-upgrades-and-gear"></a>
<a id="parked-or-theme-inappropriate-entries"></a>
<a id="catalogue-implementation-rule"></a>
<a id="v043-c3--sites-and-run-local-contracts"></a>
<a id="v043-elite-variants"></a>
<a id="v043-c5--bounded-fictional-encounters"></a>
<a id="australian-rubbish-candidate-roster--planned-2026-10-21"></a>
<a id="q6-implemented-correction--2026-10-21"></a>
<a id="g1-accepted-balance--2026-10-21"></a>
<a id="g2a-weak-groups--kept-locally-2026-10-22"></a>
<a id="g2b-wrapper-role--local-keep-2026-10-22"></a>
<a id="g2c-kept--g2-complete--2026-10-22"></a>
<a id="g3-rhythm-and-informed-voluntary-pressure--2026-10-22"></a>
<a id="g4--useful-reviews-and-optional-reference--2026-10-22"></a>
