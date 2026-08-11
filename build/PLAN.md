# Arena Survival — Game Plan

## Core Concept

A browser-first arena survival game focused on:

- Large enemy swarms
- Player-controlled difficulty escalation
- Highly satisfying build interactions
- Multiplicative upgrades
- Overcrit mechanics
- Piercing and chain effects
- Strong audiovisual feedback
- Risk/reward shrines
- Positive-feedback build explosions

The core design philosophy is:

> **More enemies should often feel like a reward.**

The player should frequently choose to make the game more dangerous because doing so creates more XP, more targets, more build interactions, and more opportunities for satisfying chain reactions.

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
- Basic auto-targeting projectile weapon
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

## Needle / Magic Bolt

Basic auto-targeting projectile.

Example:

```text
Damage:             10
Attack Cooldown:    1 second
Projectile Speed:   400
Projectiles:        1
Pierce:             0
Crit Chance:        Uses player stat
Crit Damage:        Uses player stat
```

The weapon automatically targets the nearest enemy.

The initial prototype should focus on making this one weapon highly modifiable before adding many separate weapons.

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

Enemy density should be one of the most important mechanics.

The game should eventually support hundreds of enemies on screen.

Enemy count is not only a difficulty metric.

It is also:

- A source of XP
- A source of proc opportunities
- A source of piercing chains
- A source of explosions
- A source of crit feedback
- A build-enabler
- A score metric

Example end-game target:

```text
Peak Enemies Alive: 300+
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

After the main build system feels good:

- Additional weapons
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
weapon.starter_projectile
enemy.swarm_basic
shrine.spawn_surge
skill.on_kill_explosion
```

They should not use themed display names such as `Grunt`, `Magic Bolt`, or `Shrine of the Horde` as behavioural keys.

The current knight-magic theme should have one root manifest, one centralized copy catalog for names/descriptions, focused category definition files, and theme-owned visual/audio tokens. A future theme can be added beside it and selected from one active-theme entry point without changing simulation systems.

See [`THEME_ARCHETYPES.md`](./THEME_ARCHETYPES.md) for the required boundaries, source layout, validation, and safe retheme workflow.

---

# Primary Design Principles

## 1. More Enemies Can Be Good

Enemy density creates opportunities.

The player should frequently want more targets.

---

## 2. Difficulty Should Be Player-Controlled

The game becomes increasingly dangerous naturally, but the largest difficulty spikes should often result from the player's own decisions.

---

## 3. Builds Should Create Interactions

Prefer:

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

## 4. Avoid Hard Caps Where Possible

Systems such as crit, attack speed, enemy multiplier, and Chaos should be capable of reaching absurd levels.

Technical limits can exist internally for stability.

---

## 5. Feedback Is Part of the Mechanic

Crits, overcrits, piercing, explosions, shrine activations, and chain reactions should feel different through both sound and visuals.

---

## 6. Encourage Positive-Feedback Catastrophes

The strongest builds should sometimes create loops such as:

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

The game should allow this to become temporarily ridiculous rather than immediately suppressing it.

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
