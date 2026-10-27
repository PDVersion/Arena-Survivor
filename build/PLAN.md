# Arena Survivor — current product contract

Updated2026-10-27. Eco Guardian is the active game. Knights and Magic is paused indefinitely under owner direction2026-10-22.
Preserve its content/history; no generic backlog or audit reopens it.

Current evidence/status: [BUILD_STATUS](BUILD_STATUS.md). Completed implementation:
[master build log](MASTER_BUILD_PLAN.md#v0-4-5). Unbuilt work and pending acceptance:
[REMAINING_WORK](REMAINING_WORK.md). Original specification/examples are preserved
in the [design history log](logs/PRODUCT_DESIGN_HISTORY_20261027.md).

## Implemented gameplay

- Environment Protector moves with WASD/arrows and fires automatic cleanup tools.
  Keyboard pause, interactions, choice keys and quit-to-title are implemented.
- Five-minute active-wall timer pauses on menus/focus loss; movement keeps its
  authored pacing. Difficulty presets, minimap, settings and Low/reduced-motion
  presentation exist. Current game may continue Endless or clear the field after
  the final encounter; death/restart and profile summaries exist.
- Four weapon slots from five tools: Cleanup Grabber, Cleanup Vacuum aura, Cleaning
  Bin, Orbiting Shovels and outward Rake Sweep. Each has one seven-level fixed
  progression (acquisition is Level1). Active eco has no Cyclone evolution or four
  independent tool tracks. Fixed tool upgrades are untiered; general stat picks
  retain rarity/quality and mostly unlimited stacking.
- Money levels the player: silver/gold/note drops aggregate exact value. Rare map
  magnet accelerates money collection; food restores20health. Saved Impact and a
  capped outside-run shop persist between runs. Sandbox uses an isolated save.
- Twelve enemy definitions: ten ordinary types plus mini/final bosses. Cigarettes
  open individually; natural Microplastics arrive later in threes. Plastic/mixed
  waste may fragment, glass produces shards, cigarettes/cans do not make plastic
  fragments. Better cleanup/Fortune mitigates ordinary breakage. Wrappers pursue
  airborne; cans commit to a roll; cups shoot; rats roam, flee and leak money.
- Four elite identities modify ordinary types: standard, splitting2, shield◇ and
  accelerating». Field Guide Elites explains their actual modifiers. Boss summon
  patterns and final near-death mixed load pay independently of boss rewards.
- Optional sites and two run-local risk/reward contracts exist. Critical hits
  progress yellow2x/white3x/red4x, capped at red. Stable historical IDs remain.
- Field Guide (sites, enemies, elites, equipment, capabilities, lifetime), run
  reviews, browser-local profiles/unlocks, portable save import/export/preview/
  backup and outside-run Impact Shop are implemented. No sourced fact database.
- Separate sprite browser and Testing area exist. Testing includes manual enemy/
  pickup spawns, level/health/money/Impact editors, real seven-level upgrade paths,
  general upgrades, shop, pause/clear/reset and optional natural arrivals.

## Current constraints

Simulation reads stable contracts, never sprite pixels. Names/tuning/presentation
are theme-owned. Art has preserved built-in-generation source/prompt/recipes;
regenerate for edits. Existing limits bound actors, pickups, summons and effects.
Avoid repeated heavy browser campaigns; record deferred checks honestly.

[Content map](ECO_CONTENT_MAP.md), [theme contract](THEME_ARCHETYPES.md),
[save contract](SAVE_DATA.md), [sprite guide](SPRITE_STYLE_GUIDE.md) and
[current playthrough/report](content/MONEY_TOOLS_SANDBOX_REPORT.md) carry detail.

## Product decisions still open

[REMAINING_WORK](REMAINING_WORK.md) is the sole current inventory. Proposals there
are not selected by this cleanup: capped passive slots/items, seeded challenges,
controls/mobile/controller work, discovery/education/material systems, resource/
restoration/objective progression and distribution. Generic old combat examples
and fantasy/pool ideas are not a queue. An explicit next owner choice is needed.

<!-- Historical heading anchors retained for existing links. -->
<a id="arena-survival--game-plan"></a>
<a id="familiar-australian-appearance--2026-10-23"></a>
<a id="owner-direction--knights-and-magic-paused-indefinitely"></a>
<a id="core-concept"></a>
<a id="readable-cleanup-priorities--owner-planning-direction-2026-10-21"></a>
<a id="three-run-difficulty-levels--selected-after-v043-p0"></a>
<a id="v042-direction-correction"></a>
<a id="core-gameplay-loop"></a>
<a id="initial-run-structure"></a>
<a id="player-controls"></a>
<a id="player-base-stats"></a>
<a id="starting-weapon"></a>
<a id="cleanup-grabber"></a>
<a id="enemy-archetypes"></a>
<a id="grunt"></a>
<a id="runner"></a>
<a id="tank"></a>
<a id="swarm-design"></a>
<a id="chaos-system"></a>
<a id="chaos"></a>
<a id="shrine-system"></a>
<a id="shrine-of-the-horde"></a>
<a id="shrine-of-greed"></a>
<a id="shrine-of-multiplicity"></a>
<a id="shrine-of-duplication"></a>
<a id="blood-altar"></a>
<a id="curse-system"></a>
<a id="fracture"></a>
<a id="swarming"></a>
<a id="giant"></a>
<a id="frenzy"></a>
<a id="glass-world"></a>
<a id="infestation"></a>
<a id="crit-system"></a>
<a id="example-crit-damage"></a>
<a id="crit-feedback"></a>
<a id="piercing-system"></a>
<a id="piercing-momentum"></a>
<a id="through-and-through"></a>
<a id="piercing-feedback"></a>
<a id="on-kill-mechanics"></a>
<a id="explosion"></a>
<a id="chain-reaction"></a>
<a id="fracture"></a>
<a id="bloodlust"></a>
<a id="enemy-splitting"></a>
<a id="broodmother"></a>
<a id="upgrade-categories"></a>
<a id="basic-offensive-upgrades"></a>
<a id="critical-upgrades"></a>
<a id="projectile-upgrades"></a>
<a id="on-kill-upgrades"></a>
<a id="world-upgrades"></a>
<a id="upgrade-rarity"></a>
<a id="example-build"></a>
<a id="sound-design-philosophy"></a>
<a id="visual-feedback"></a>
<a id="initial-ui"></a>
<a id="level-up-screen"></a>
<a id="run-end-screen"></a>
<a id="v01-scope"></a>
<a id="player"></a>
<a id="arena"></a>
<a id="enemies"></a>
<a id="weapon"></a>
<a id="xp"></a>
<a id="upgrade-system"></a>
<a id="ui"></a>
<a id="v02-scope"></a>
<a id="add-enemies"></a>
<a id="add-mechanics"></a>
<a id="add-world-systems"></a>
<a id="add-feedback"></a>
<a id="add-statistics"></a>
<a id="v03-scope"></a>
<a id="rebuild-progression"></a>
<a id="give-the-world-pressure"></a>
<a id="give-enemies-presence"></a>
<a id="make-skills-scale"></a>
<a id="tell-the-player-everything"></a>
<a id="close-the-gaps"></a>
<a id="v04-scope"></a>
<a id="technical-direction"></a>
<a id="architecture-principles"></a>
<a id="theme-and-archetype-modularity"></a>
<a id="primary-design-principles"></a>
<a id="1-readability-comes-before-density"></a>
<a id="2-difficulty-should-be-player-controlled"></a>
<a id="3-builds-should-create-understandable-interactions"></a>
<a id="4-keep-technical-caps-separate-from-design-targets"></a>
<a id="5-feedback-is-part-of-the-mechanic"></a>
<a id="6-escalation-must-stay-legible"></a>
<a id="first-milestone"></a>
<a id="v043-c2--secondary-tool-evolution"></a>
<a id="v043-c3--voluntary-world-bargains"></a>
<a id="v043-c5--readable-boss-climax"></a>
<a id="v043-c6-implementation-checkpoint-2026-10-20"></a>
<a id="v043-c7--portable-progress"></a>
<a id="session21-selected-correction--vacuum-target-progression"></a>
<a id="q6-implemented-correction--2026-10-21"></a>
<a id="g1-accepted-balance--2026-10-21"></a>
<a id="g2a-weak-groups--kept-locally-2026-10-22"></a>
<a id="g2b-wrapper-role--local-keep-2026-10-22"></a>
<a id="g2c-kept--g2-complete--2026-10-22"></a>
<a id="g3-rhythm-and-informed-voluntary-pressure--2026-10-22"></a>
<a id="g4--useful-reviews-and-optional-reference--2026-10-22"></a>
<a id="tool-presentation-and-menu-exit--2026-10-23"></a>
<a id="selected-eco-ranged-addition-2026-10-23"></a>
<a id="owner-selected-money-and-cleanup-expansion-2026-10-27"></a>
