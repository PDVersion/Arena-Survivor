# Arena Survival — Game Plan

## Core Concept

A browser-first environmental arena game focused on:

- Simple movement and automatic tools
- Large, identifiable environmental objects
- A slower pace in which individual actions can be read
- Real-world tools and mechanically meaningful material identities
- Player-controlled difficulty escalation
- Strong audiovisual feedback
- Risk/reward site events
- Optional educational depth that never blocks play

The core design philosophy is:

> **The player should understand what is on screen and what their tool just did.**

Enemy count can still create pressure and reward, but density is no longer the
product goal. The camera should make a modest population feel present, and a
technical ceiling such as 300 enemies should remain available without requiring
the design to fill it.

## Readable cleanup priorities — owner planning direction 2026-10-21

The [four-phase readable gameplay roadmap](READABLE_GAMEPLAY_ROADMAP.md) adds the
survivor-genre findings and Australian rubbish evidence to the product direction.
Prioritize readable tool actions, visible power growth, material-specific decisions,
voluntary risk/reward, gradual introductions and pressure/relief. Existing tools,
evolution, events, bosses and persistence are foundations to refine, not rebuild.

After the active Q6 correction gate: **G1** measure/rebalance the current roster
against corrected tools; **G2** prototype recognizable outdoor litter one role at
a time; **G3** refine encounter rhythm, useful destinations and optional escalation;
**G4** improve mastery goals, results and optional Field Guide discovery. G1 is now verified locally; G2–G4 remain planned follow-ons. These do not
retroactively complete V0.4.3 or add unselected content.

Use the roadmap's separate waste-tonnage and surveyed-litter-count rankings for
context. Neither becomes spawn probability, hit points or harm. Cigarette Butts,
Packets/Wrappers and Aluminium Can are leading prototypes; the remaining items
are candidates, with heavy/industrial waste reserved for later appropriate sites.
Preserve current material-family IDs and finite fragment relationships. Optional
facts never gate play. Detailed gates, candidate decisions and deferrals live in
the roadmap; Q6 remains the next implementation task.

## Three run difficulty levels — selected after V0.4.3 P0

Choose Beginner, Normal or Experienced before starting. Normal is the default,
slightly gentler than the previously single baseline; Experienced increases
pressure, and Beginner reduces incoming pressure while improving the starter
character/tool. Presets are theme-owned data resolved once per run and shown on
the title/settings surfaces. Changes during a run apply to the next run. The
0.5 gameplay rate, view, collision geometry, material relationships and caps
remain independent of difficulty. Preserve real-world identity and relative
material-health ordering; preset multipliers are game balance, not fact claims.

## V0.4.2 direction correction

The original plan was written around large swarms, projectile penetration,
explosions, and multiplicative chain reactions. Those systems remain useful
engine work and may fit the retained knight-magic theme, but they are no longer
the default direction for the environment game.

The new baseline is a 2× cropped camera view, an initial 0.5 gameplay rate, and
a short-range Cleanup Grabber starter. Actors become larger on screen through
camera zoom only: sprite files, world radii, hitboxes, mass, and separation are
unchanged. The first active-theme weapon is a recognisable real-world tool with
one readable stab, not an abstract orb projectile. See
[`MASTER_BUILD_PLAN.md#v0-4-2`](./MASTER_BUILD_PLAN.md#v0-4-2).

The first follow-up play test is scheduled as V0.4.2.1 before content growth.
It stabilises player animation, moves the minimap, dismisses the opening hint,
aligns authored contact footprints, replaces enemy blocking with slight player
knockback, adds the optional Collection Sweep grabber track, and establishes
Microplastics/Glass Shards material relationships. See
[`MASTER_BUILD_PLAN.md#v0-4-2-1`](./MASTER_BUILD_PLAN.md#v0-4-2-1) and
[`ECO_CONTENT_MAP.md`](./ECO_CONTENT_MAP.md).

The world camera and interface are separate presentation concerns. UI is
authored larger, rendered from high-resolution text textures, and fitted to the
screen rather than enlarged as part of the world camera. The title offers Start,
Info, and Settings; Info is the same reference surface available from Escape in
a run. A translucent minimap can be set to Off, Low, Medium, or High.

---

# Core Gameplay Loop

```text
MOVE AROUND ARENA
        ↓
ENEMIES SPAWN
        ↓
AUTO-ATTACK
        ↓
KILL ENEMIES
        ↓
GAIN XP
        ↓
LEVEL UP
        ↓
CHOOSE UPGRADES
        ↓
BECOME STRONGER
        ↓
ACTIVATE SHRINES / CURSES
        ↓
SPAWN MORE ENEMIES
        ↓
SURVIVE THE SWARM
        ↓
GAIN BETTER REWARDS
        ↓
INCREASE CHAOS
        ↓
REPEAT
```

The player should not only react to increasing difficulty.

They should actively cause difficulty spikes.

---

# Initial Run Structure

Target initial run length:

**5 minutes**

Later versions can increase this to 10 minutes or introduce endless mode.

A run starts with:

- Basic player
- Basic auto-targeting cleanup grabber
- Low enemy spawn rate
- Chaos multiplier at `1.0x`
- Several shrines placed around the arena

The player gradually builds power while deciding how aggressively to increase enemy density.

---

# Player Controls

Initial controls should remain simple.

```text
WASD / Arrow Keys = Move
E / Space          = Interact
```

Weapons attack automatically.

No aiming or manual firing is required initially.

---

# Player Base Stats

Example initial stats:

```text
Health:          100
Move Speed:      200
Armour:          0
Regeneration:    0
Pickup Radius:   80

Damage Bonus:    0%
Attack Speed:    0%

Crit Chance:     5%
Crit Damage:     200%

Luck:            0
XP Multiplier:   1.0x
```

These stats should be data-driven so upgrades can modify them easily.

---

# Starting Weapon

## Cleanup Grabber

Basic short-range automatic melee tool for the `eco-guardian` theme. The
retained `knight-magic` theme keeps the already-built Magic Needle projectile
under the same neutral starter-weapon role.

Example:

```text
Damage:          10
Attack Cooldown: 1 simulated second
Reach:           ~72 world units (initial experiment)
Targets:         Every enemy intersecting the narrow forward path
Motion:          narrow extend, contact, retract
Crit Chance:     Uses player stat
Crit Damage:     Uses player stat
```

The weapon automatically faces the nearest eligible enemy in reach, extends the
grabber, damages every enemy physically intersecting that narrow path, and
retracts. It does not spawn a projectile, splash, or wide sweep. Its dedicated
tree is reach only: the owned tool is level 1, and four reach picks take it to
level 5. Damage, attack speed, and critical chance belong to the repeatable
general upgrade pool.

The first priority is making this one action legible and satisfying before
adding more weapons or restoring the parked projectile interaction families.

V0.4.3 C1 adds one contrasting second automatic tool through ordinary level-up
choices, after the readable starter and software prerequisites. The Cleanup
Vacuum starts with a short forward cone of three primary targets, growing through its own track, with
bounded on-hit splash around each hit. It needs no kill or manual switching.
Both slots keep independent simulation clocks. Longer Grabber/Collection Sweep
belong to the grabber; the Vacuum has its own reach track. Shared damage,
attack-speed and crit gains still improve both. On-hit splash is a separate
ledger category from on-kill Compaction Burst, which remains parked in eco.
This is a game mechanic, not a material effectiveness or real-world handling
claim. New tools use primitives until the V0.4.4 roster/sprite gate.

---

# Enemy Archetypes

## Grunt

Basic swarm enemy.

```text
Health:    20
Speed:     70
Damage:    10
XP:        1
```

Purpose:

Create enemy density.

---

## Runner

Fast but fragile.

```text
Health:    10
Speed:     140
Damage:    8
XP:        1
```

Purpose:

Force player movement.

---

## Tank

Slow and durable.

```text
Health:    80
Speed:     45
Damage:    20
XP:        4
```

Purpose:

Create durable obstacles inside the swarm.

---

# Swarm Design

The readable eco game prioritizes identifiable materials and meaningful tool
interactions. Crowd density is one pressure/reward lever; hundreds of enemies are
a supported technical ceiling, not a required on-screen population. The original
high-density interactions below remain historical design context and apply only
where the active theme offers those capabilities.

Enemy count is not only a difficulty metric.

It is also:

- A source of XP
- A source of proc opportunities
- A source of piercing chains
- A source of explosions
- A source of crit feedback
- A build-enabler
- A score metric

Current technical ceiling, not a gameplay target:

```text
Peak Enemies Alive: at most 300 under the current actor budget
```

---

# Chaos System

Introduce a global multiplier called:

# CHAOS

Starts at:

```text
CHAOS: 1.0x
```

Chaos increases when the player activates shrines, accepts curses, or chooses dangerous upgrades.

Example progression:

```text
1.0x
1.4x
2.1x
3.8x
7.2x
12.6x
20.0x+
```

Chaos affects systems such as:

```text
Enemy Spawn Rate
Enemy Count
Elite Frequency
Enemy Modifiers
XP Gain
Loot Quality
Upgrade Rarity
Shrine Rewards
```

The player should constantly be tempted to push Chaos higher.

---

# Shrine System

Shrines appear around the arena.

Interacting with them causes an immediate risk/reward event.

Shrines should produce noticeable audiovisual feedback.

Example:

```text
SHRINE ACTIVATED

Screen pulse
Large sound effect
Temporary arena effect
Enemy spawn surge
Reward modifier applied
```

---

## Shrine of the Horde

```text
Spawn 100 enemies over 20 seconds.

Reward:
+50% XP from spawned enemies
```

Purpose:

Create a deliberate swarm event.

---

## Shrine of Greed

```text
Enemy Spawn Rate: x1.5
XP Gain:           x1.25
```

The effect persists for the rest of the run.

---

## Shrine of Multiplicity

```text
Enemy Spawn Multiplier: x2
XP Multiplier:          x1.5
```

These effects stack.

Example:

```text
Shrine 1: x2 enemies
Shrine 2: x2 enemies

Total:
x4 enemy spawn
```

---

## Shrine of Duplication

```text
Duplicate all currently living enemies.

Duplicated enemies:
+50% XP reward
```

This becomes increasingly dangerous as enemy density rises.

---

## Blood Altar

```text
Summon 3 elite hordes.

Reward:
1 Legendary Upgrade
```

This should feel like knowingly pressing a dangerous button.

---

# Curse System

Curses make the world harder while also improving rewards.

They can appear as level-up choices, shrine rewards, or special encounters.

---

## Fracture

```text
15% of enemies split into two smaller enemies on death.

Reward:
+25% XP Gain
```

---

## Swarming

```text
Enemy Spawn Rate: x1.5

Reward:
+20 Luck
```

---

## Giant

```text
Elite Health: +100%

Reward:
Elites drop an additional upgrade
```

---

## Frenzy

```text
Enemy Move Speed: +30%

Player Attack Speed: +20%
```

---

## Glass World

```text
Player Damage: x2
Enemy Damage:  x2
```

---

## Infestation

```text
Every 100 kills:

Immediately spawn 50 additional enemies.
```

---

# Crit System

Crit chance should not be capped at 100%.

Crit chance above 100% becomes higher crit tiers.

Example:

```text
0–99%      = Chance to Crit
100–199%   = Guaranteed Crit + chance to Overcrit
200–299%   = Guaranteed Overcrit + chance to Overcrit II
300–399%   = Guaranteed Overcrit II + chance to Overcrit III
```

Example:

```text
Crit Chance: 247%

Guaranteed:
Crit
Overcrit

47% chance:
Overcrit II
```

---

# Example Crit Damage

Assuming base hit:

```text
Normal Hit
10
```

Then:

```text
Crit
20!

Overcrit
40!!

Overcrit II
80!!!

Overcrit III
160!!!!
```

Exact multipliers can be adjusted during balancing.

---

# Crit Feedback

Crit tiers should have distinct audiovisual feedback.

Example:

```text
Normal:
tick

Crit:
tink!

Overcrit:
KSHING!

Overcrit II:
KSHH-CHING!

Overcrit III:
Heavy metallic impact + screen feedback
```

Higher-tier crits should feel dramatically more powerful.

---

# Piercing System

Projectiles can pass through multiple enemies.

Example:

```text
Pierce: 5
```

means a projectile can damage several enemies before disappearing.

---

## Piercing Momentum

```text
Each enemy pierced increases projectile damage by 10%.
```

Example:

```text
Enemy 1: 12 damage
Enemy 2: 13 damage
Enemy 3: 15 damage
Enemy 4: 16 damage
Enemy 5: 18 damage
```

---

## Through and Through

```text
Killing an enemy with a piercing projectile restores 1 Pierce.
```

This can potentially create very long piercing chains.

---

# Piercing Feedback

Each penetration can increase impact pitch.

Example:

```text
tk
tk
tik
tik
TIK
TINK
KSHING
```

A successful projectile ripping through a large swarm should be audibly recognizable.

---

# On-Kill Mechanics

Killing enemies should frequently trigger additional effects.

---

## Explosion

```text
Enemies explode on death.

Explosion damages nearby enemies.
```

---

## Chain Reaction

```text
Explosion kills can create additional explosions.
```

Example:

```text
Enemy dies
    ↓
Explosion
    ↓
5 enemies die
    ↓
5 explosions
    ↓
More enemies die
```

---

## Fracture

```text
Enemies may split into smaller enemies on death.
```

This creates the unusual situation where killing enemies can increase enemy count.

---

## Bloodlust

```text
Gain +1% Attack Speed
for every 10 enemies killed
during the previous 5 seconds.
```

Large kill chains directly increase offensive power.

---

# Enemy Splitting

Some enemies should naturally create more enemies.

Example:

## Broodmother

Large enemy.

On death:

```text
BROODMOTHER
     ↓
   BOOM
     ↓

5 SMALL ENEMIES SPAWN
```

This reinforces the swarm-focused identity.

---

# Upgrade Categories

Initial upgrade system should contain several categories.

---

## Basic Offensive Upgrades

```text
+Damage
+Attack Speed
+Projectile Speed
+Projectile Size
+Projectile Count
```

---

## Critical Upgrades

```text
+Crit Chance
+Crit Damage
+Overcrit Damage
+Higher Crit Tier bonuses
```

---

## Projectile Upgrades

```text
+Pierce
+Ricochet
+Homing
+Projectile Count
```

---

## On-Kill Upgrades

```text
Explosion
Fracture
Attack Speed Proc
XP Burst
Chain Reaction
```

---

## World Upgrades

These intentionally increase danger.

```text
Enemy Spawn Rate
Enemy Duplication
Elite Chance
Enemy Speed
Enemy Health
```

They provide stronger rewards in exchange.

---

# Upgrade Rarity

Potential rarity structure:

```text
Common
Rare
Epic
Legendary
Curse
```

Common upgrades mainly improve numbers.

Rare and Epic upgrades change mechanics.

Legendary upgrades create build-defining interactions.

Curses modify the world.

---

# Example Build

Possible build:

```text
Crit Chance: 220%

Pierce: 8

Fracture
Enemies can split on death.

Detonation
Enemies explode on death.

Contagion
Explosion kills can trigger Fracture.

Bloodlust
Rapid kills increase attack speed.

Piercing Momentum
Each pierced enemy increases projectile damage.
```

Then activate:

```text
SHRINE OF MADNESS

Enemy Spawn Rate:
x4 for 30 seconds
```

Result:

```text
Projectile fired
      ↓
Pierces enemy
      ↓
Pierces enemy
      ↓
Overcrit
      ↓
Enemy dies
      ↓
Explosion
      ↓
Multiple enemies die
      ↓
Some enemies fracture
      ↓
More enemies spawn
      ↓
More explosions
      ↓
Bloodlust activates
      ↓
Attack speed increases
      ↓
More projectiles
      ↓
More kills
      ↓
More fractures
```

The player has created a positive-feedback catastrophe.

This is desirable.

---

# Sound Design Philosophy

Audio should communicate build performance.

The player should be able to recognize mechanics by sound alone.

Important sounds:

```text
Normal hit
Crit
Overcrit
Pierce
High pierce chain
Enemy death
Explosion
Chain explosion
Shrine activation
Elite spawn
Level up
Legendary upgrade
Boss spawn
```

Audio must be throttled intelligently so hundreds of simultaneous enemies do not create unusable noise.

---

# Visual Feedback

Important mechanics should also provide subtle visual feedback.

Potential effects:

```text
Damage numbers
Crit text scaling
Overcrit text
Projectile trails
Enemy flash on hit
Explosion circles
Screen pulse on shrine activation
Small camera shake
Elite outline
Chaos indicator animation
Kill-chain counter
```

Effects should remain readable even with hundreds of enemies present.

---

# Initial UI

Main HUD:

```text
Health
XP Bar
Player Level
Timer
Chaos Multiplier
Current Enemy Count
Kill Count
```

Potential example:

```text
HP  ████████░░

LVL 14
XP  █████░░░░░

TIME 03:42

CHAOS x6.4

ENEMIES 187
KILLS   1,429
```

---

# Level-Up Screen

Game pauses when leveling.

Offer 3 upgrades.

Example:

```text
LEVEL UP

[ SHARPENED TIP ]

+2 Pierce


[ CRITICAL MASS ]

+25% Crit Chance


[ SWARMING ]

Enemy Spawn Rate x1.5
+20 Luck
```

The third choice is intentionally dangerous but potentially rewarding.

---

# Run End Screen

The statistics screen should reinforce build experimentation.

Example:

```text
RUN COMPLETE

Survival Time:          5:00
Player Level:             28

Enemies Killed:        2,841
Peak Enemies Alive:      312

Highest Chaos:          x9.7

Highest Crit Chance:     247%
Highest Overcrit:         III

Longest Pierce Chain:      18
Largest Kill Chain:         73

Total Damage:        482,391
```

Damage breakdown:

```text
Needle:             210,421
Crit Bonus:          94,842
Explosions:         102,382
Chain Reactions:     56,212
Other:               18,534
```

---

# V0.1 Scope

The first working version should contain only the essential systems.

## Player

- WASD movement
- Health
- Enemy collision damage
- Death
- Restart

## Arena

- Large arena
- Camera follows player
- Arena boundaries

## Enemies

- Basic spawning
- Grunt enemy
- Chase player
- Take damage
- Die
- Drop XP

## Weapon

- Auto-target nearest enemy
- Fire projectile
- Projectile collision
- Damage
- Crit
- Basic piercing

## XP

- XP drops
- Pickup radius
- XP bar
- Leveling

## Upgrade System

- Pause on level up
- Offer 3 upgrades
- Select upgrade
- Resume game

## UI

- Health
- XP
- Level
- Timer
- Kill count
- Enemy count

---

# V0.2 Scope

Once the basic loop works:

## Add Enemies

- Runner
- Tank
- Broodmother

## Add Mechanics

- Overcrit
- Piercing Momentum
- Explosions
- Fracture
- Bloodlust
- Chain reactions

## Add World Systems

- Chaos
- Shrines
- Enemy multipliers
- XP multipliers
- Elite enemies

## Add Feedback

- Crit sounds
- Overcrit sounds
- Pierce sounds
- Shrine activation sound
- Explosion sounds
- Damage numbers
- Basic particles
- Screen feedback

## Add Statistics

- Peak enemies alive
- Highest Chaos
- Highest crit
- Longest pierce
- Largest kill chain
- Damage breakdown

---

# V0.3 Scope

Once every mechanic exists, make the loop feel right before adding more content to it.

V0.3 is a rebalancing and readability milestone. It changes almost no mechanics; it changes how they scale, escalate, and communicate.

## Rebuild Progression

- Exponential experience curve rather than a linear one
- Experience rewards that depend on enemy role
- Experience rewards that scale with how tough an enemy spawned
- Per-upgrade counts in the run statistics

## Give the World Pressure

- Enemy health, damage, and speed scale with elapsed time as well as Chaos
- Timer-gated enemy roster milestones rather than a full roster within 30 seconds
- Spawn rate, batch size, and role mix driven by one spawn director
- Chaos shifts the composition of the swarm, not only its size
- Telegraphed milestone waves

## Give Enemies Presence

- Enemies occupy space and cannot perfectly overlap
- Small enemies bunch; large enemies block both enemies and the player
- Enemies spawn outside the visible viewport
- A fixed logical viewport so difficulty does not depend on window size

## Make Skills Scale

- Skills gain levels rather than being a one-time toggle
- Detonation starts small and grows in radius and damage
- Detonation damage derives from the killed enemy rather than a flat value
- Chain reactions gain declared depth limits and falloff
- No upgrade offer is ever a wasted pick

## Tell the Player Everything

- Level-up cards state the exact before and after values
- Level-up cards show the upgrade level and mark new options
- A detail toggle for players who prefer clean cards
- A pause menu showing current stats, owned upgrades, and world modifiers
- An experience bar, threat indicator, and wave announcements in the HUD

## Close the Gaps

- Armour, regeneration, and luck become real stats
- Pickup pressure is bounded and readable
- A published time-to-kill table and damage budget backing every tuned value

---

# V0.4 Scope

First correct the readable baseline in V0.4.2:

- Zoom the camera to 2× and crop the visible play area without enlarging actors
- Slow the coherent gameplay clock to 0.5 as an initial play-test value
- Replace the eco starter projectile with the short-range Cleanup Grabber
- Park projectile-only, pierce, splash, and chain offers outside the active eco pool

Then, only after that play-test gate passes, grow the content in V0.4.3:

- Additional weapons
- Weapon evolution
- Additional shrine types
- Additional curses
- Elite modifiers
- Mini-boss
- Final boss
- Unlockable weapons
- Unlockable upgrade pool
- Browser-local profile persistence
- Export complete progress as an encoded text file or copyable save code
- Import a save from a text file or pasted code with validation, preview, backup, and migration
- Endless mode
- More advanced statistics

---

# Technical Direction

Recommended stack:

```text
TypeScript
Phaser
Vite
Git
GitHub
```

Initial game runs locally in a browser.

```text
npm run dev
```

No backend is required.

Save data can initially use browser-local storage. The complete persistent profile must also be portable as an encoded text save that can be downloaded/uploaded as a `.txt` file or copied/pasted as a save code.

The portable save contains all persistent statistics, unlocks, progression, resources, settings, version metadata, and future persistent fields. It uses stable content IDs rather than themed display names. Import must decode, migrate, validate, preview, and back up the current profile before atomically replacing it; a failed or cancelled import must not alter current progress.

The encoding is for portability, not secrecy or anti-cheat. Players may deliberately transfer or adjust progress/unlocks through exported data, while strict validation prevents malformed values from crashing or corrupting the game. See [`SAVE_DATA.md`](./SAVE_DATA.md) for the format, state boundary, safety rules, and verification plan.

Future free hosting options can include:

```text
GitHub Pages
itch.io HTML5 hosting
```

---

# Architecture Principles

The game should be data-driven wherever possible.

Avoid hard-coding upgrades, enemies, and weapons throughout unrelated systems.

Prefer structures such as:

```text
Player Stats

Weapon Definitions

Enemy Definitions

Upgrade Definitions

Shrine Definitions

Curse Definitions

Run Modifiers
```

This makes it easier to add new content without rewriting the underlying game.

## Theme and Archetype Modularity

The initial fiction is knights and magic, but it must be treated as a replaceable content theme rather than embedded into the engine.

Basic stats, formulas, and reusable mechanic contracts are theme-neutral. Characters, weapons, enemies/monsters, skills, upgrades, pickups, shrines, curses, names, descriptions, tuning, and presentation references belong to an active theme manifest.

Core systems should use stable semantic archetype IDs such as:

```text
character.starter
weapon.starter
enemy.swarm_basic
shrine.spawn_surge
skill.on_kill_explosion
```

They should not use themed display names such as `Grunt`, `Magic Bolt`, or `Shrine of the Horde` as behavioural keys.

The current knight-magic theme should have one root manifest, one centralized copy catalog for names/descriptions, focused category definition files, and theme-owned visual/audio tokens. A future theme can be added beside it and selected from one active-theme entry point without changing simulation systems.

See [`THEME_ARCHETYPES.md`](./THEME_ARCHETYPES.md) for the required boundaries, source layout, validation, and safe retheme workflow.

---

# Primary Design Principles

## 1. Readability Comes Before Density

Every enemy and tool action should be identifiable at play speed. Enemy density
creates pressure, but a crowded screen is not proof of depth and the 300-enemy
limit is a ceiling rather than a target.

---

## 2. Difficulty Should Be Player-Controlled

The game becomes increasingly dangerous naturally, but the largest difficulty spikes should often result from the player's own decisions.

---

## 3. Builds Should Create Understandable Interactions

For the environment theme, prefer interactions that can be explained by the
tool or material on screen. The older projectile combination remains available
to knight-magic and future themes:

```text
Pierce
+
Crit
+
Explosion
+
Fracture
```

over simply stacking:

```text
+20% damage
+20% damage
+20% damage
```

---

## 4. Keep Technical Caps Separate From Design Targets

Technical limits can exist internally for stability. They should not force the
game toward visual clutter, nor should a quieter design lower them without a
performance or correctness reason.

---

## 5. Feedback Is Part of the Mechanic

Crits, overcrits, piercing, explosions, shrine activations, and chain reactions should feel different through both sound and visuals.

---

## 6. Escalation Must Stay Legible

Positive-feedback loops may return where their cause and result remain readable,
but they are no longer required of every build. The legacy form was:

```text
More enemies
    ↓
More kills
    ↓
More effects
    ↓
More attack speed
    ↓
More kills
    ↓
More enemies
```

Treat that loop as parked design space, not the active eco baseline. A tool's
motion, target, contact, and effect must remain understandable before spectacle
is added.

---

# First Milestone

The first milestone is considered successful when the player can:

1. Move around the arena.
2. Automatically shoot enemies.
3. Kill enemies.
4. Collect XP.
5. Level up.
6. Choose upgrades.
7. Increase crit and piercing.
8. Activate a shrine.
9. Cause a large enemy swarm.
10. Survive or die from the resulting chaos.
11. Restart and try a different build.

At that point, the project has moved beyond being a technical demo and becomes the first playable version of the game.


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

Q4 opening correction (2026-10-13): ordinary Microplastics begin with 9 base
health, becoming 6.75 / 8.55 / 9.9 in Beginner / Normal / Experienced. Opening
non-critical starter hits deal 12 / 10 / 10. Only this role's health changes;
time, Pollution and elite scaling still apply to later or modified enemies.
This is a playability override to the earlier persistence-derived health model,
not an environmental measurement. See REC-112 and `balance/Q4_OPENING_REPORT.md`.


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


### V0.4.3 C3 — voluntary world bargains

One additional scheduled shrine is Unmanaged Dump / Shrine of Defiance. It
raises Pollution/Chaos and the run's XP product through the existing world model.
Two one-time level-up curses offer arrival pressure or Pollution/Chaos pressure
for XP: Overflow Contract / Frenzy Pact and Contamination Pact / Doom Pact.
Acceptance lasts for the current run; walking past a shrine or choosing another
card declines it. Restart clears all accepted curses and world products.

Curse definitions own their pressure/reward values; normal upgrade entries refer
to their stable IDs. Cards show resolved XP reward and primary pressure first,
because only three detail rows fit. Other pressure effects remain inspectable
through the world stats; chosen bargains remain in the upgrade tally. The sixth
shrine arrives at86% authored duration using existing placement/interaction.
This bounded C3 adds these choices, not every illustrative shrine/curse example
above; no Blood Altar/forced legendary encounter, knowledge question, boss,
persistence or sprite work is introduced.


### V0.4.3 C5 — readable boss climax

One unique mini threat arrives at half the authored duration; one final threat
arrives at its limit. Both use ordinary enemy combat plus a harmless fixed-circle
warning and one pulse. The final fight stays live past the timer; defeating the
boss opens the existing choice to continue endlessly or stop arrivals and clear
remaining enemies/causal work. Pausing or earning a level does not discard the
fight's intent. Unique bosses are not copied by duplication sites and never
become ordinary random arrivals. Both themes own their fiction/tuning; these
primitive encounters add no sprite or layered-material knowledge system.

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

## Session21 selected correction — vacuum target progression

The C1/C2 descriptions above record the shipped local baseline: three primary
vacuum targets, four after evolution. Owner accepts a modest cap at early weapon
levels and selects increasing primary targets through the vacuum's own upgrade
progression. This replaces the fixed-cap design intent for the next Q6 correction;
it is not implemented yet. Exact level thresholds, increments, finite ceiling and
evolution tuning remain subject to theme-owned data and `npm run balance`.
Earned growth must survive evolution without a reduction. Shared damage/speed/crit,
independent clocks and bounded splash stay separate; unrelated player level-ups
do not automatically level this tool. The visible cone must communicate actual
pulse timing/affected targets, and player pose alignment remains a separate open
presentation correction. See BUILD_PLAN_V0.4.3 Q6 for verification and scope.

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
