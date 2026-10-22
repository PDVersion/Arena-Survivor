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
| `weapon.secondary_evolved` | Cyclone Vacuum | Evolved melee cone | Replace Cleanup Vacuum after four owned reach picks; wider cone and stronger nearby splash, keeping earned reach/capacity and adding one target. | V0.4.3 C2 |
| `upgrade.evolve_secondary` | Evolve to Cyclone Vacuum | Evolution choice | One normal level-up choice; replaces in the same slot, no extra slot. | V0.4.3 C2 |
| `weapon.secondary` | Cleanup Vacuum | Melee cone | Pulses a short cone, starting with three targets and growing to seven; each selected hit splashes nearby targets. | V0.4.3 C1 |
| `upgrade.equip_secondary` | Equip Cleanup Vacuum | Weapon acquisition | Fill the empty second automatic-tool slot through a normal level-up choice. | V0.4.3 C1 |
| `upgrade.secondary_range` | Longer Vacuum Nozzle | Weapon-owned track | Extend only the Vacuum and add one primary target per pick; appears after it is equipped. | V0.4.3 C1 |
| `upgrade.weapon_range` | Longer Grabber | Weapon track, owned level 1 | Extend the Cleanup Grabber's reach. Four upgrades raise it from level 1 to level 5. | Live |
| `upgrade.weapon_collection_sweep` | Collection Sweep | Weapon track, starts unowned | Periodically sweep a wider area at the grabber's jaws. Higher levels trigger more often and add sweeps along extension and retraction. | Live |

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
| `enemy.cluster_fodder` | Cigarette Butts | Slow weak individuals in spaced groups; clear a lane or use a cone. | Nothing | G2A local keep |
| `enemy.gust_drifter` | Packets / Wrappers | Announced oblique gust, then pause for interception. | Nothing | G2B local keep |
| `enemy.committed_charger` | Aluminium Can | Announced direct roll through old player position; sidestep then clear in recovery. | Nothing | G2C local keep |
| `enemy.swarm_basic` | Plastic Bottle | Common moving plastic waste; the baseline crowd role. | Microplastics through Fragmentation | Live |
| `enemy.fast_fragile` | Microplastics | Small, fast, multicolour shards and pieces of plastic waste. This replaces Plastic Bag. | Nothing | Live |
| `enemy.slow_durable` | Glass Bottle | Slow, durable glass waste. | Glass Shards through Fragmentation | Live |
| `enemy.death_spawner` | Bagged Waste | A large rubbish bag of mixed waste whose threat is what spills out. | Plastic Bottle, Microplastics, Glass Bottle | Live |
| `enemy.stationary_fragment` | Glass Shards | A stationary contact hazard left by broken glass. It can be cleared but still hurts a player who stands on it. | Nothing | Live |

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
| `upgrade.damage` | Reinforced Tools | General / offense | Process more waste with every tool. |
| `upgrade.attack_speed` | Rapid Cycling | General / offense | Cycle all equipped tools more frequently. |
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


## V0.4.3 C3 — sites and run-local contracts

| Stable ID | Name | Decision / wording |
| --- | --- | --- |
| `shrine.escalation` | Unmanaged Dump | Raise Pollution for the rest of this run in exchange for more impact credit. One scheduled site at86% progress; activation is voluntary. |
| `curse.frenzy` / `upgrade.accept_frenzy` | Overflow Contract | Accept more arrivals for more impact credit for the rest of this run. Once per run, chosen at level-up. |
| `curse.escalation` / `upgrade.accept_escalation` | Contamination Pact | Raise Pollution for more impact credit for the rest of this run. Once per run, chosen at level-up. |

All multipliers and effects come from shrine/curse definitions. These are game
risk/reward choices, not educational fact cards. Restart clears the contracts;
accepted contract names remain visible in the run's equipment/upgrade tally.

## V0.4.3 elite variants

Dispersing Waste splits into two same-role copies once per lineage; Wrapped Waste
halves damage above half health; Rolling Waste accelerates over three simulation
seconds. These are game modifiers on material roles, not new material identities
or environmental effectiveness claims. Markers2/◇/» remain visible over actor art.


### V0.4.3 C5 — bounded fictional encounters

Compacted Waste and Dumping Colossus are readable mini/final encounter fiction,
not persistence estimates, disposal advice or a promoted layered-material system.
They use the same tool damage path as existing waste actors. Their marked circle
teaches the immediate game action: move clear before the pulse. No knowledge
question, content-source claim, type effectiveness, material layer or sprite
inventory is added. Boss values and labels remain theme-owned.

## Australian rubbish candidate roster — planned 2026-10-21

The [readable gameplay roadmap](READABLE_GAMEPLAY_ROADMAP.md#enemy-candidates-and-their-distinct-decisions)
contains the complete candidate decision table and separate sourced rankings.
**Cigarette Butts → Packets/Wrappers → Aluminium Can** is the proposed prototype
order, one verified behaviour at a time after Q6/G1. These names are not live
content, stable IDs, approved sprite subjects or a commitment to ship all three.

Plastic bags, coffee cups, food containers/utensils, >5mm plastic pieces and other
soft plastics are candidate reserves, not renamed existing roles. Rubble,
organics, cardboard and scrap belong to later suitable sites; ash/hazardous waste
remain deferred industrial/containment subjects. The existing five-role material
map above stays authoritative until a verified owning phase updates it.

G1 evaluates current health/armour, speed/harm, rewards and arrival mix against
corrected tools. Changes require before/after balance evidence; no spawn shares
are copied from tonnes or survey percentages. The historical C1/C2 fixed-cap
wording remains subject to the pending Q6 owner-track capacity correction.

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

[Reviewed plan](BUILD_PLAN_G2.md), [candidate report](content/G2A_REPORT.md).
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
[PHASE_G3_PROMPT](PHASE_G3_PROMPT.md) is written/reviewed. G3 ready/unstarted;
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
complete; [reviewed G4 handoff](PHASE_G4_PROMPT.md) is current, G4/art unstarted.
