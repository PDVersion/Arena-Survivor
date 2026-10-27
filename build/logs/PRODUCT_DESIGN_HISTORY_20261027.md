# Historical build-document log — captured 2026-10-27

Immutable pre-consolidation context, not a current work queue. Later owner decisions
supersede old counts, clocks, vacuum evolution and role descriptions. Current
status: [BUILD_STATUS](../BUILD_STATUS.md); remaining work: [audit](../REMAINING_WORK.md).


---

## Original build/PLAN.md

# Arena Survival — Game Plan

## Familiar Australian appearance — 2026-10-23

Use recognisable ordinary Australian/Sydney objects before abstract/fantasy
silhouettes. Read [appearance references](../sprites/AUSTRALIAN_REFERENCE_NOTES.md).
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

The [four-phase readable gameplay roadmap](../MASTER_BUILD_PLAN.md#readable-gameplay-design-context) adds the
survivor-genre findings and Australian rubbish evidence to the product direction.
Prioritize readable tool actions, visible power growth, material-specific decisions,
voluntary risk/reward, gradual introductions and pressure/relief. Existing tools,
evolution, events, bosses and persistence are foundations to refine, not rebuild.

After the active Q6 correction gate: **G1** measure/rebalance the current roster
against corrected tools; **G2** prototype recognizable outdoor litter one role at
a time; **G3** refine encounter rhythm, useful destinations and optional escalation;
**G4** improve mastery goals, results and optional Field Guide discovery. G1–G3 are now verified locally; G4 is ready/unstarted. These do not
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
[`MASTER_BUILD_PLAN.md#v0-4-2`](../MASTER_BUILD_PLAN.md#v0-4-2).

The first follow-up play test is scheduled as V0.4.2.1 before content growth.
It stabilises player animation, moves the minimap, dismisses the opening hint,
aligns authored contact footprints, replaces enemy blocking with slight player
knockback, adds the optional Collection Sweep grabber track, and establishes
Microplastics/Glass Shards material relationships. See
[`MASTER_BUILD_PLAN.md#v0-4-2-1`](../MASTER_BUILD_PLAN.md#v0-4-2-1) and
[`ECO_CONTENT_MAP.md`](../ECO_CONTENT_MAP.md).

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

The encoding is for portability, not secrecy or anti-cheat. Players may deliberately transfer or adjust progress/unlocks through exported data, while strict validation prevents malformed values from crashing or corrupting the game. See [`SAVE_DATA.md`](../SAVE_DATA.md) for the format, state boundary, safety rules, and verification plan.

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

See [`THEME_ARCHETYPES.md`](../THEME_ARCHETYPES.md) for the required boundaries, source layout, validation, and safe retheme workflow.

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
presentation correction. See the master Q6 record for verification and scope.

## Q6 implemented correction — 2026-10-21

The second tool's own four reach picks each add one primary target, independent
of rarity and unrelated levels:3→4→5→6→7. Evolution retains all four gains and
adds its authored extra target (8). Splash remains finite and unchanged. The
short filled cue marks a single pulse, followed by a faint historical outline
and selected-hit rings; entering the fade causes no new damage. Frame-specific
presentation anchors align player poses without editing accepted art or bodies.
This supersedes the earlier fixed3/4 and pending-Q6 wording. No environmental
fact, effectiveness matrix, persisted state or new sprite is added.
[Verification and limits](../content/Q6_REPORT.md). G1 enemy tuning follows this gate.

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
[G1_REPORT](../content/G1_REPORT.md) separates corrected-model effects from tuning,
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

[Reviewed plan](../MASTER_BUILD_PLAN.md#readable-gameplay-g2), [candidate report](../content/G2A_REPORT.md).
G2A is locally complete; G2 remains in progress. Packets/Wrappers are next under
a separate reviewed claim; Can/G3/G4 and sprite generation remain unstarted.

## G2B wrapper role — local keep 2026-10-22

`enemy.gust_drifter`: eco Packets / Wrappers; knight Paper Wisp. One introduction
at32% and sparse later arrivals. Approach → visible fixed-bearing warning → short
oblique gust → stationary recovery gives an interception choice. Generic capability,
theme-owned timings/stats/essential cue, code-native packet silhouette. Fictional
movement/harm, no real handling/abundance claim, automatic waste patch, new guide
surface, sprite or save field. Existing material families/IDs unchanged.
[G2B_REPORT](../content/G2B_REPORT.md) records keep and measured limits. Can next;
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

All three G2 candidates are locally kept; G2 scoped gate complete. [G2C_REPORT](../content/G2C_REPORT.md) owns source/checks/trade-offs and aided-fixture limits.
[G3 master record](../MASTER_BUILD_PLAN.md#readable-gameplay-g3) is written/reviewed. G3 ready/unstarted;
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
field/ID, guide framework or sprite work. [G3_REPORT](../content/G3_REPORT.md) records
verification, pressure/XP trade-offs and aided/timed model limits. G3 locally
complete; [reviewed G4 handoff](../MASTER_BUILD_PLAN.md#readable-gameplay-g4) is current, G4/art unstarted.

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

[Report](../content/G4_REPORT.md) owns checks/limits; [next handoff](../NEXT_READABLE_GAMEPLAY_HANDOFF.md)
is current. G1–G4 are locally complete; new sprite generation remains unstarted.


## Tool presentation and menu exit — 2026-10-23

Owner selects bounded procedural suction/dust on eco vacuum pulses and snapping
multi-prong Collection Sweep cues. Precise attack guides are presentation only,
behind Show attack radius (default OFF). Actual hit selection, reach/caps, damage,
clocks and material identities remain unchanged. Reduced motion/Low have quieter
variants. Escape pause menu adds pointer/Q Quit to Main Menu; it abandons the
active run without counting a finished run or granting an unlock. Saved settings/
progress remain. Generated sprite sheets remain in review and knight content
stays paused. [Implementation record](../MASTER_BUILD_PLAN.md#tool-presentation-2026-10-23).

## Selected eco ranged addition —2026-10-23

Takeaway Cup is an owner-selected live draft: familiar cream café cup/brown sleeve/
dark lid. It stops to tip back, warns along a fixed bearing, flicks one dodgeable
coffee blob, then recovers. This fictional attack offers sidestep-and-close
counterplay; Cigarette Butts retain their weak-group identity. [Enemy sheet](../enemies/TAKEAWAY_CUP.md)
owns current values and [master](../MASTER_BUILD_PLAN.md#ranged-enemy-2026-10-23)
records the verified software slice. All existing style2 roster replacements
remain review-only; owner individual art/playtest corrections may follow.
No new educational/disposal/toxicity claim. Knights and Magic remains paused.

## Owner-selected money and cleanup expansion —2026-10-27

[V0.4.5](../BUILD_PLAN_V0.4.5.md) selects money as run leveling, separate saved Impact
and shop, rare magnet/food/Impact drops affected by Fortune, aura vacuum/bin/orbit
rakes, detrimental material fragmentation, opening Cigarette Butts, late natural
Microplastics, fleeing litter-carrying rat, real active-wall run clock, and an
isolated testing area with interactive equipment trees and currency editors.
Stable historical experience/statistic IDs retain their meaning as earned run
progress; schema3 adds Impact/shop with explicit migration. Game rewards are
fiction, not a claim that all waste qualifies for a real container refund.
Knights and Magic remains paused; no new educational disposal claims.

V0.4.5 local implementation follows the owner-selected amendment above. Money,
saved Impact Shop, cleanup aura/bin/rakes, downside fragmentation, Cigarette
Butts opening, roaming rat and isolated testing area are built. The next product
step is owner feel/balance feedback using the
[normal-play checklist](../content/MONEY_TOOLS_SANDBOX_REPORT.md), with full
historical regression/art/device acceptance still open. Unlimited-stat vs capped
item redesign remains a separate research decision.


Owner correction2026-10-27: eco weapons now use one seven-level stepped path each.
Orbiting Shovels replace the orbiting-rake identity; Rake Sweep travels outward
in movement/last facing direction. Cleanup Vacuum has no Cyclone evolution.
Bin art is character-sized; its landing DOT/burst remains. Map-magnet pull starts
slow and accelerates. See [current report](../content/MONEY_TOOLS_SANDBOX_REPORT.md) for tuning and acceptance.


Owner phase6 correction2026-10-27: cigarettes/cans never produce Microplastics;
glass retains Glass Shards. Single-cigarette opening; later Microplastics own
three-piece natural arrivals. Wrappers pursue airborne through other rubbish.
Compacted Waste summons ordinary litter excluding Bagged Waste/Glass Bottles;
Colossus varies light/heavy/pressure patterns and releases one mixed load below
20%health. Boss attack summons pay independently; bounded death-fragment budgets
remain separate. Rare item chances lower; rake regenerated for readability.
All are game abstractions, with no new real-world disposal/material claims.
[Current implementation/checks](../content/MONEY_TOOLS_SANDBOX_REPORT.md).


---

## Original build/ECO_CONTENT_MAP.md

# Eco Guardian Content Map

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

The [readable gameplay roadmap](../MASTER_BUILD_PLAN.md#readable-gameplay-design-context)
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
[Verification and limits](../content/Q6_REPORT.md). G1 enemy tuning follows this gate.

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
[G1_REPORT](../content/G1_REPORT.md) separates corrected-model effects from tuning,
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

[Reviewed plan](../MASTER_BUILD_PLAN.md#readable-gameplay-g2), [candidate report](../content/G2A_REPORT.md).
G2A is locally complete; G2 remains in progress. Packets/Wrappers are next under
a separate reviewed claim; Can/G3/G4 and sprite generation remain unstarted.

## G2B wrapper role — local keep 2026-10-22

`enemy.gust_drifter`: eco Packets / Wrappers; knight Paper Wisp. One introduction
at32% and sparse later arrivals. Approach → visible fixed-bearing warning → short
oblique gust → stationary recovery gives an interception choice. Generic capability,
theme-owned timings/stats/essential cue, code-native packet silhouette. Fictional
movement/harm, no real handling/abundance claim, automatic waste patch, new guide
surface, sprite or save field. Existing material families/IDs unchanged.
[G2B_REPORT](../content/G2B_REPORT.md) records keep and measured limits. Can next;
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

All three G2 candidates are locally kept; G2 scoped gate complete. [G2C_REPORT](../content/G2C_REPORT.md) owns source/checks/trade-offs and aided-fixture limits.
[G3 master record](../MASTER_BUILD_PLAN.md#readable-gameplay-g3) is written/reviewed. G3 ready/unstarted;
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
field/ID, guide framework or sprite work. [G3_REPORT](../content/G3_REPORT.md) records
verification, pressure/XP trade-offs and aided/timed model limits. G3 locally
complete; [reviewed G4 handoff](../MASTER_BUILD_PLAN.md#readable-gameplay-g4) is current, G4/art unstarted.

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

[Report](../content/G4_REPORT.md) owns checks/limits; [next handoff](../NEXT_READABLE_GAMEPLAY_HANDOFF.md)
is current. G1–G4 are locally complete; new sprite generation remains unstarted.


---

## Original build/AUTONOMOUS_DEVELOPMENT_PLAN.md

# Optional development proposals — unselected backlog

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


Completed performance/session sequencing is in the [master build log](../MASTER_BUILD_PLAN.md#performance-original-sequencing).
P0–P6 software, C1–C7 and Q6/G1–G4 are completed records, not a new backlog.
F16 is delivered; other menu entries require checking current code and explicit
owner selection before becoming a bounded phase. The current remaining work is
[V0.4.4 art acceptance/integration](../SPRITE_PLAN_V0.4.4.md); selected generation
is complete.

## Current backlog disposition —2026-10-23 audit

Completed foundations are not pending tasks: F1–F7 delivered through C1–C7;
F16 difficulty presets delivered; Q6/G1–G4, vacuum/claws/attack-guide/menu quit,
and eco Takeaway Cup ranged slice delivered with scoped software evidence.
F13 already has selected Can/Wrapper/Butt/Cup additions; any further enemy is a
new selection. Existing Field Guide, run review and weapon slots are implemented;
persistent discovery, sourced facts and material effectiveness are still proposals.

Remaining optional choices: F8 seeds/challenges; F9 remaining accessibility and
remapping; F10 discovery/facts; F11 touch; F12 types/layers; further F13 content;
F14 resources; F15 restoration; F17 collection objectives; F18 gamepad. Education
E2–E8 remains exploratory except already promoted slices. No option is selected
by this audit. Complete selected art review/integration before assuming more
content is required. [Verified inventory/remaining work](../sprites/review/style2/PROGRESS_REPORT.md).
Historical assessment/estimates below retain context, not current implementation
status. Knights and Magic remains paused until explicit owner reopening.

## Recycling ideation — assessed against the existing game

Source: the owner-supplied **Game Concept: Recycling-Themed Roguelite Survival
Game**, received 2026-10-11. It was written without repository context. The
assessment below preserves its useful ideas for subsequent sessions without
requiring future agents to recover the chat attachment. It is design input,
not a replacement for the active milestone/product authorities or approval to
implement every example. See REC-101.

| Ideation suggestion | Repository assessment | Treatment in this roadmap |
| --- | --- | --- |
| Movement, auto-attacks/aim, XP magnetism, level-up choices, escalating runs | Shipped | Maintain and validate; no new foundational implementation |
| Ordinary cleanup character, grabber, plastic/glass rubbish enemies | Shipped as Environment Protector, Cleanup Grabber, and existing material roles | Preserve identities and stable IDs; no automatic rename |
| Grabber range, speed, damage, wider attacks | Reach track, general stat picks, and Collection Sweep already exist | Extend only for a selected mechanic that current tracks cannot provide |
| Plastic fragments and glass hazards | Microplastics and stationary Glass Shards already exist; finite relationships are accepted | Preserve REC-099; shards are clearable enemy actors, not a new timed hazard system |
| Plastic Bag as the fast enemy | Historical identity explicitly replaced by Microplastics | Do not restore or relabel the retired role; any floating bag would be a separately selected new role |
| Contamination zones, obstacles, burst hazards | Existing spill, debris, and vent systems cover these capabilities | Reuse their contracts for new themed sources rather than duplicate hazards |
| Ten-minute runs and longer modes | Five authored minutes at 0.5 gameplay rate already take about ten real minutes; endless/clearing shipped | Do not double authored duration from this suggestion; reconsider length only with pacing evidence |
| Adjustable effects, minimal instructions, clear silhouettes | Reduced motion, bounded feedback, title/settings, hint dismissal, and accepted core sprites exist | Performance P4 plus accessibility F9; colour-independent cues remain useful work |
| New waste behaviours and recycling tools | Modular content exists, but suggested additional roles/tools are unbuilt | F13 and concrete candidates within F1; introduce one of each at a time |
| WasteDex, first-encounter unlocks, defeat counts, optional facts | Field Guide already exists for reference/session totals; enemy discovery and sourced facts are missing | Extend F10 inside the existing guide; no second encyclopedia framework |
| Material drops and recovery efficiency | XP drops exist; recyclable-resource economy does not | F14, optional; begin with aggregate counters and no extra actor population |
| Park restoration and facilities | No between-run restoration loop exists | F15, optional after resources/persistence; a small milestone screen, not a city builder |
| Bosses and evolution | Already planned in V0.4.3, unbuilt | Enrich F5/F2 candidates; preserve C5's post-boss endless/clearing choice |
| Relaxed/Standard/Challenge modes | World tuning and player-chosen risk exist; explicit difficulty presets do not | F16, separate from Default/Low graphics settings |
| Mobile/controller controls | Keyboard/pointer paths exist; dedicated touch/gamepad support is unbuilt | F11 and F18, separately scoped and tested |
| Material specialisation, contamination penalties, collection stations, challenges | Exploratory beyond the accepted simple loop | F12/F17 after selected foundations; no forced quizzes or early specialist-tool requirement |

### Concrete content candidates, still optional

- **Enemy variety / F13:** prototype one new behaviour, with Aluminium Can
  rolling, Cardboard Box releasing bounded child items, or Food Scraps creating
  a short telegraphed zone as initial candidates. Battery, electronic waste,
  cigarette-butt groups, a charging Tyre, and a separately defined drifting
  Plastic Bag remain later alternatives. Reuse the finite spawn graph and hazard
  seams; do not add the entire ten-enemy list. A new role needs a distinct
  silhouette and behaviour, not only another health value.
- **Second tool / F1:** a Vacuum with a short cone or a Compactor with one
  telegraphed area action are initial candidates for a readable contrast to the
  grabber. They must respect the shared event budget, cooldowns, hit queries,
  and damage ledger. Names, widths, reach, and effectiveness remain theme data.
  A Magnetic Collector needs an eligible material role and verified handling
  model before selection; it is not effective against every item labelled
  "metal" by default. Sorting Drone and Recycling Turret are later bounded
  companion/emitter candidates, with summon/projectile caps and no independent
  unbounded AI loops. Compost Launcher and E-Waste Containment Device need a
  convincing processing role and corresponding content before implementation.
- **Boss / F5:** shortlist a Scrap Machine with a readable wind-up/charge, or
  a Landfill Golem using bounded existing waste spawns. Plastic Tide, Battery
  Overload, Garbage Truck, Microplastic Swarm, and Waste Mountain remain
  alternative pitches, not seven scheduled bosses. All summons share the
  existing enemy budget and finite fragmentation rules; a growing visual must
  never define its own collision footprint.
- **Collection identity / F9 and selected presentation work:** prefer theme
  copy such as collected, contained, or processed where appropriate. Existing
  upgrade copy and Processing Ledger already use this language. Inspect surfaces
  before changing them; keep damage, crit, and stable internal semantics intact.
  Collection sounds and disappearance cues are downstream presentation, and
  reuse effect budgets. Do not imply that fragmenting or crushing every material
  is safe real-world recycling.

### Product and performance constraints for these ideas

Keep gameplay first and detailed learning optional. Unlock reference entries
through committed encounter/defeat events, but never lock normal upgrades behind
reading, quizzes, or educational achievement. Distinguish in-game behaviour,
mechanical hints, and sourced real-world guidance in every information surface.
Define an encounter as seeing or engaging an item; merely spawning it outside
the camera should not silently count as discovery. Record that rule in F10's
contract and test it before adding persistent encounter counts.

Start fact content with a small reviewed Australian set; NSW/council guidance is
a possible scope to select, not universal disposal advice. Before publishing
facts, research authoritative current sources, record geography/applicability,
source URL and review date, and validate those fields. Do not promote the
ideation's disposal examples or the game's persistence-health estimates into
verified fact cards. Educational content stays theme-owned and outside gameplay
code, following `EDUCATION_PIVOT.md`.

New content must preserve the P0–P6 performance targets, both production theme
contracts, the readable camera/pace, and simple early controls. A new family of
resources, a drone, a boss spawn, and an existing XP pickup cannot each create
an independent unbounded object population. Any new visual asset follows the
V0.4.4 roster/style gate; prototype mechanics with supported primitives first.

## Optional feature menu — select before implementation

These are local product proposals grounded in the existing architecture. Labels
and tool identities remain provisional until theme/design reconciliation. Session
counts are initial estimates for **60–120 minute sessions**, including validation;
larger features deliberately span sessions rather than promising a whole system
in one hour. Already shipped features such as endless mode are not on this list.

| ID | Feature and player benefit | Estimated sessions | Dependency / runtime impact |
| --- | --- | --- | --- |
| F1 | **Second cleanup tool and weapon slots:** a meaningful alternative build alongside the grabber | 3–4 | C1, after performance gate; medium/high combat/render cost |
| F2 | **One weapon evolution:** a visible reward for completing a weapon track | 2 | C2, F1; bounded replacement in the same slot |
| F3 | **One new shrine and one curse:** additional optional risk/reward choices | 2 | C3, C1–C2 order; may raise entity pressure |
| F4 | **Two elite behaviours:** a shielded or splitting threat with readable telegraphs | 2–3 | C4, prior content gates; bounded modifier work |
| F5 | **Mini-boss and final boss:** a readable climax before the existing endless/clearing choice | 3–4 | C5, preceding gates; cap summons and telegraphs |
| F6 | **Remember settings and best runs:** browser-local persistence and a small unlock pool | 3–4 | C6 and `SAVE_DATA.md`; write at safe boundaries, not every frame |
| F7 | **Save backup and transfer:** encoded text export, validated preview, backup, confirmed import | 2–3 | C7, F6; parsing/storage work outside active combat |
| F8 | **Seed display and repeatable challenge runs:** reproducible practice and bug reports | 1–2 | Later scoped phase; same seed alone is not deterministic replay |
| F9 | **Accessible controls and clearer role cues:** remapping, contrast, readable UI options | 2–3 | Later scoped phase; preserve silhouettes/telegraphs and low-mode budgets |
| F10 | **Field Guide / WasteDex expansion:** first encounters, per-material defeat counts, optional sourced facts and post-run explanations | 3–4 | Reuse the existing guide; Education E4/E5, F6 for persistent tracking; source/review facts before shipping |
| F11 | **Touch controls:** movement and interaction on phones/tablets | 2–3 | Separate mobile viewport/input/performance gate |
| F12 | **Material effectiveness and layered waste:** appropriate tools expose or clean different layers | 4–6 | Exploratory E2/E3, F1; highest complexity, independently abandonable |
| F13 | **One new waste behaviour:** a rolling can, unfolding box, or zone-producing food waste | 2–3 | New scoped content phase; F1 not required; finite spawn/hazard rules and stress gate |
| F14 | **Automatic recyclable-resource totals:** recover materials alongside XP, initially without extra pickups | 3–4 | New economy phase, F6 for storage; exact committed rewards and bounded counters |
| F15 | **Small park-restoration progression:** three visible milestones and equipment/cosmetic unlocks between runs | 3–4 | F14 + F6; new scoped phase; menu presentation first, no city simulation |
| F16 | **Beginner/Normal/Experienced presets (Q1 verified):** approachable or more demanding runs chosen before play | 2–3 | Theme-owned difficulty data; Normal gentler than old baseline; Q1 balance/browser/stress gate |
| F17 | **One optional collection-station objective:** deposit selected resources or safely clear a marked zone for a reward | 3–4 | F14 for deposits; education research if factual; later E6-style opt-in objective, no mandatory quiz |
| F18 | **Controller support:** movement, interaction, and complete menu navigation with a gamepad | 2–3 | Existing input/settings seam; disconnect/focus/deadzone/menu regression coverage |

Historical initial shortlist (F1/F5/F6 now delivered): **F6, F1, F5, and F9** for retention, build variety,
a run climax, and accessibility. The owner can choose any subset. Preserve C1–C7
order unless a documented resequencing creates a smaller safe prerequisite; for
example, bringing a settings/statistics-only part of C6 earlier needs its own
phase boundary and rationale before code changes. The ideation also makes
**F13 and F10** useful next choices for recognisable variety and optional learning;
**F14/F15** are a later retention experiment rather than immediate prerequisites.
Selection does not authorize the entire feature menu or automatically promote
exploratory education scope.

V0.4.4 eco sprite preparation is selected after the locally completed G1–G4 roster.
Read the style/pipeline plans and claim manifest rows before any later art work.

## How future selections become bounded phases

Before implementation check current code and completed master records, select one
remaining capability, then write its exact ownership, dependencies, acceptance and
short checks in an active plan. C1–C7 and F16 are complete and cannot be restarted
from the old session estimates. The following are historical estimates for still
optional scope; G2/G4 already deliver parts of F13/F10. Scope only the remaining
chosen behaviour. Knights and Magic stays paused.

| Optional package | Session slices and acceptance |
| --- | --- |
| F10 — Guide expansion | (1) encounter/defeat state and exact-once committed-event tests, then reference selectors; (2) enemy/material sections in the existing guide, discovered-state filtering, counts, keyboard/pointer navigation and resize; (3) a small sourced/reviewed fact set with distinct game/fact copy and validation; (4) reload/import compatibility, opt-in debrief, and complete guide/browser gate if selected |
| F13 — One enemy | (1) author one role's theme contract, reusable movement/spawn/hazard behaviour and deterministic tests; (2) director integration, readable primitive cues, offspring/cap/ledger browser checks and balance; (3) dense mixed-roster/default-low stress, edge cases and corrections if needed |
| F14 — Resources | (1) finite theme-owned resource definitions, reward provenance and exact-once run counters alongside XP; (2) run-end/session summary and storage/schema migration, with restart/double-count/import fixtures; (3) browser collection/reload/recovery and stress with no new collectible actors; (4) narrowly scoped eligibility/recovery rules only if selected, plus full economy gate |
| F15 — Restoration | (1) three milestone conditions, costs/unlocks and pure insufficient-resource/idempotence tests; (2) existing-menu progress screen and bounded before/after scene presentation; (3) persist spend/unlock safely, handle storage failure and import compatibility; (4) complete restore/reload/browser/low-mode gate and adjust the progression economy using evidence |
| F16 — Difficulty | (1) neutral preset contracts, theme tuning and ordering and baseline-comparison tests; (2) pre-run choice, clear copy, settings compatibility and browser lifecycle; (3) simulator comparisons, escape/telegraph/readability checks and per-preset stress; difficulty never changes implicitly with graphics quality |
| F17 — Station/objective | (1) one optional objective's state/reward/expiry rules and duplicate-completion tests; (2) bounded placement/telegraph and existing interaction prompt; (3) committed resource deposit or zone-clear reward, helpful failure feedback and factual-content review when applicable; (4) ignore/complete/restart/reload, balance and stress gate |
| F18 — Controller | (1) input adapter with deadzones, action mapping, repeat behaviour and disconnect tests; (2) title/pause/guide/level-up/overtime/end-screen navigation and device-switch browser checks; (3) focus/unplug/reconnect, remapping compatibility and real-controller smoke if hardware is available |

## Design-review priorities and architecture index — 2026-10-12

Owner request: retain the repository-aware recommendations from the environmental
survivor prompt, place them beside the appropriate planned work, and provide a
single-file architecture map. This records prioritisation and proposed scope;
it does not select every optional feature, rename the game, reorder C1–C7,
or authorize content implementation inside a performance phase.

The [interactive architecture map](../ARCHITECTURE_MAP.html) indexes current game
features, retained secondary-theme mechanics, technical foundations and future
packages. Every item has a stable reference identifier, related-item links,
implementation/design sources and an explanation. Future-phase filters only
change the documentation view; they never enable game code or mark a gate passed.
The map is a dated snapshot, not a replacement for active plans or live progress.

### Recommended priority, with existing phase placement

| Priority / reference | Recommendation | Placement and dependencies | Acceptance / boundary |
| --- | --- | --- | --- |
| R01 / P0–P6 | Finish performance readiness before multiplying tools, actors and effects | Existing P0–P6 sequence; Q1/Q2 remain delivered corrections; read live progress for P1 status | Preserve correctness/caps, measure production and report physical older-device acceptance separately |
| R02 / F19 | Sharpen identity and selectively polish existing copy/UI | New optional identity/presentation package after the performance gate, with explicit ownership before implementation; coordinate with F9/F10 and C1 copy | “Cleanup Shift” is a proposed name, hopeful/practical/playful tone; no automatic rename. Correct obsolete Sorting Pulse wording, make card hierarchy action → mechanical change → optional context, and lead the run report with outcome/build moment |
| R03 / F10 | Extend the existing Field Guide with encounters, per-material counts and reviewed optional facts; add a personalised run takeaway | F10's existing four slices, exploratory Education E4/E5; F6 for persistent discovery history. This is a high design priority, not an implicit move ahead of C1–C7 | Start with one relevant takeaway, at most two; use committed outcomes and a pure selection rule. Reading/quizzes never gate ordinary play; sources, region and review dates required |
| R04 / F1 | Add one contrasting auto-firing cleanup tool, initially a short-cone Vacuum prototype | C1 / F1 after P6; reuse shipped delivery contracts, scheduling, causal budgets and the ledger | Test positioning/build variety at current camera/pace before extra slots or a large tool roster. Existing Longer Grabber and Collection Sweep are not duplicate new features |
| R05 / F13 | Add one distinct enemy behaviour and a legible wave response | Existing F13 slices; a named future content phase is still required, independent of F1 | First candidate: Rolling Can aimed at the player's previous position then rolling past. Charging Tyre is an alternative, not a second simultaneous commitment. Leaking Waste Container is later, using bounded existing hazard contracts |
| R06 / F6–F7 | Remember settings/best runs and add modest unlocks; preserve portable saves | Existing C6 / F6, then C7 / F7. Any earlier settings-only prerequisite needs documented resequencing/ownership | Prefer sidegrades, discovery/cosmetics and best records over permanent numerical power; preserve SAVE_DATA validation/backup/import rules |
| R07 / F2–F5 | Add one qualitative tool evolution and a readable boss climax | C2–C5 in their existing dependency order; keep post-boss endless/clearing choice | Evolution changes a visible action and replaces its slot. New shrine/curse/elite choices must stay understandable and bounded |
| R08 / F9 and V0.4.4 | Improve role cues, interaction hierarchy and successful-collection feedback; finish art against the settled roster | F9 for accessibility; measured presentation work belongs to P2/P4 only within their existing ownership. Remaining sprites stay V0.4.4-gated | Player harm, attack geometry and hazard warnings have priority over decoration; preserve reduced motion and bounded audio/effects |

F16 has already shipped in Q1 as Beginner / Normal / Experienced. Do not
schedule difficulty presets or endless/clearing again from the generic prompt.
The roadmap's earlier assessment table remains a dated historical snapshot;
current status comes from the active plan/progress, including concurrent sessions.

### Historical design suggestions — check completed implementations first

- **F1 / C1:** consider a bounded Vacuum → Collection Sweep interaction only
  if the prototype's suction/action is immediately legible. Theme data owns
  reach, angle, force, limits and cadence; no manual weapon switching is needed.
- **F2 / C2:** evolve an action qualitatively rather than awarding another
  percentage. A future containment attachment may reduce eligible fragment or
  spill consequences, but needs supporting enemy content and a tested trade-off.
- **F10 / E4–E5:** keep upgrade copy mechanical first; optional explanations
  share the existing information surface. Replace floating facts with a brief
  discovery cue and a voluntarily opened entry. Start without special fact-orb
  actors. “Learn mode” means optional information depth initially, not a parallel
  game ruleset. Explain Fragmentation's gameplay bargain without presenting
  pollution fragmentation as successful recovery or safe handling advice.
- **F13:** make Bottle, Microplastics, Glass, Shards and Bagged Waste visually
  distinguishable before expanding count. Preserve Q2's Microplastics opening
  and quiet bottle unlock unless an owner-selected tuning change supersedes it.
  Wave candidates are scattered arrivals, crossing sweeps, durable groups and
  mixed releases, with telegraphs/recovery; prefer varied responses to density.
- **F8, then F20:** show seeds/repeatable presets first; an optional daily local
  challenge can reuse a versioned challenge configuration later. A seed alone
  is not deterministic replay. Online leaderboards/backend are not prerequisites.
- **F12 / E2–E3:** defer the full material-effectiveness matrix until a second
  readable tool proves useful. Layered waste remains an independently
  abandonable experiment, not a mandatory educational foundation.
- **F14 → F15:** a small restoration screen can reinforce hope later, after
  resource/profile foundations. Do not expand it into a city-management game.
- **Later setting experiments:** oil/contamination fits hazards; heat waves may
  become telegraphed arena events; invasive plants belong to an accurately
  identified habitat setting; deforestation/biodiversity loss suit habitat
  conditions, objectives and restoration. These are ideas, not new scheduled
  enemy identities, factual claims or approved phases.

### Additional optional and parked identifiers

| ID | Item | Proposed placement / state |
| --- | --- | --- |
| F19 | Identity, copy and existing-screen hierarchy pass | Optional, unselected. Two slices: (1) inventory stale copy and propose name/tone/labels against current theme; (2) selected copy/layout changes with content validation, keyboard/pointer/resize and visual checks. No menu/framework rebuild |
| F20 | Daily challenge built from repeatable presets | Optional, deferred after F8; requires a named phase. Version challenge seed/config/date policy and validate repeatability claims before release |
| ART-RES | Double native sprite resolution while preserving world display size | **Parked at the owner's request.** No current-phase or automatic V0.4.4 inclusion. If revisited, compare one newly authored higher-resolution baseline at identical display size, measure cost and update style/pipeline coherently; upscaling existing final pixels adds no detail |

Keep the existing pixel style, palette anchors and sprite presentation/simulation
boundary. Do not rebuild Phaser/TypeScript as single-file vanilla Canvas. New
functions extend the existing contracts, theme definitions, selectors and UI.

### Concurrent-work and identifier guardrails

This amendment owns this section and `build/ARCHITECTURE_MAP.html` only. It
does not edit active build checklists, source, manifests, progress, README or
the shared reconciliation log while the other performance session is writing
them. Preserve earlier roadmap edits and re-read changed authorities before
refreshing the map. Record any promoted implementation decision in reconciliation
with its owning phase later; this section is the durable design-review record.

Map identifiers reuse content IDs (`enemy.fast_fragile`, `upgrade.weapon_range`),
feature IDs F1–F20 and phase IDs P0–P6 where available. `SYS-*`, `UI-*`,
`ART-*`, `DATA-*` and `TOOL-*` are documentation references, not new saved IDs.
Never renumber/reuse an existing map ID; retain a retired identifier with a
replacement pointer. Preserve ID fragments when updating the single HTML file.
The map embeds its catalog to work offline and requires no library/build change.
Source links resolve relative to the repository; the map itself also remains
usable when copied elsewhere, although source links then need the repository.

Map verification at capture: **126 unique items / 381 linked relationships**,
90 current items including current-phase foundations. Every source path exists;
isolated Chromium checks pass for phase/search/area/status filtering, expandable
details, related-item navigation/history, ID deep links, reset/list/summary
controls, mobile width and light/dark layouts, with no page errors. Visual
inspection uses settled screenshots. No game suite or performance recording is
run by this amendment; the other session retains those resources. The previous
roadmap text is verified unchanged after removing this added section.

## Verification and reporting

Run the phase's targeted units/browser paths after meaningful changes. Before
marking a phase complete, verify the applicable gate. The following full
browser/stress commands are CI or separately scheduled consolidated-gate
references; they are not per-session local requirements:

```sh
npm run typecheck
npm test -- --run
npm run lint
npm run build
npm run test:e2e:ci
npm run test:e2e:stress -- --workers=1
```

Use `npm run balance` when combat, progression, spawning, or world tuning changes.
Run `npm audit --audit-level=high` for dependency changes and milestone delivery
where network access permits. Keep the long readability measurement opt-in:

```sh
ARENA_LONG_MEASURE=1 npm run test:e2e -- --grep @measurement --workers=1
```

Manual performance recordings complement these commands; the existing short
stress test is not a sustained real-device benchmark. Record commands, exit
status, failures, skips, and blocked checks accurately. Never disable a failing
test or add retries to disguise performance regressions. Fix related defects;
leave unrelated user edits intact.

Keep `AUTONOMOUS_PROGRESS.md` concise: objective; branch/HEAD; current phase;
session start/deadline/actual elapsed; completed and partial work; commands and
results; evidence links; decisions/reconciliation IDs; outstanding issues;
selected/pending feature IDs; next task; blockers. Update after every completed
cycle and at interruption/end. On recovery, inspect the diff and verify partial
work before resuming; do not trust a stale checkbox.

At session end, report objective status, implemented features, fixed bugs,
measured improvements, executed checks, unverified work, remaining features,
known risks/blockers, and the next priority. Stop at the real deadline, a fully
validated objective, or an actual inability to progress. Do not wait for another
instruction between safe tasks during a running session.

Work stays in this repository. No production deployment, cloud/billing changes,
secret edits, destructive migration, unrelated data access, or external messaging.
Use isolated fixtures for saves. Runtime save import must still require the
player's explicit confirmation and successful backup. If restricted permissions
block a check, document it and continue independent work without pretending it ran.


## Deferred scope retained from consolidated historical plans

These are historical design inputs, not new content selection. Later delivered
items (including endless/clearing and difficulty presets) must not be scheduled
again. Current C1–C7, F1–F20, SAVE_DATA and the active plans govern what remains.

### V0.4 candidates

1. **Weapon and equipment slots, and delivery kinds.** Rather than one deepening weapon, move to a small number of auto-firing weapon slots plus passive equipment slots. This is the natural home for the type system described in [`EDUCATION_PIVOT.md`](../EDUCATION_PIVOT.md), and it is where weapon level caps and evolution belong.

   It is also where `WeaponDefinition` splits delivery into a discriminated union, so a melee weapon can declare an arc and a target cap instead of a projectile speed and lifetime. V0.3 deliberately stops at the generic stat surface — `range`, `knockback`, `armourPierce`, and optional per-weapon crit — because the union's shape depends on decisions slots have not made yet. Splash also belongs here, and needs an explicit boundary against the existing on-kill detonation skill: splash triggers on hit, detonation on kill, and the damage ledger has to keep them apart.
2. **Type and effectiveness system.** Enemy and tool attributes with a small effectiveness matrix. Designed in `EDUCATION_PIVOT.md`; it needs the slot system first.
3. **Endless mode.** The director already supports `t > 1`; endless needs only the escalation index and a terminal condition.
4. **Mini-boss at the final milestone.** The run currently ends when the timer expires; a telegraphed climax is a better ending.
5. **Per-run seed display and seeded replay.** Nearly free given the existing seeded randoms, and it makes balance reports reproducible.
6. **Profile persistence** for settings, best-run statistics, and unlocks — the natural first slice of `SAVE_DATA.md`.
7. **Meta-progression.** Permanent unlocks between runs are why the reference games retain players past the first hour, but they should land only once the in-run curve is right.
8. **Layered composite enemies.** Multi-material enemies whose outer shell breaks to expose a different interior. Strong design and a natural fit for the environment theme; see `EDUCATION_PIVOT.md`.
9. **Colour-independent enemy identification.** Roles are distinguished by colour plus subtle geometry; distinct silhouettes would help both accessibility and split-second reads in a 300-enemy crowd.
10. **Per-enemy invulnerability windows**, revisited alongside the above.

---
