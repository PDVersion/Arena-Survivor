# Separate-session prompt — unlimited stat stacking versus capped items

Work in `/Users/pdv/Documents/Projects/Arena-Survivor`.

Investigate progression design for the Eco Guardian build. This session is
research and a concrete design recommendation, not authorization to implement,
rebalance, migrate saves or reopen the paused Knights and Magic theme.

Start with the repository's required reading order in AGENTS.md, then read
PLAN.md, EDUCATION_PIVOT.md, THEME_ARCHETYPES.md, SAVE_DATA.md, the current sprite/
playtest handoff, and the active eco upgrade/weapon/skill/progression definitions,
offer selection/tier application, pacing simulator and run-review selectors.
Check reconciliation before proposing a new decision. Respect existing phase
ownership and preserve unrelated work.

Owner observation: unlimited stat stacking can be fun, but the current choices
feel less systematic and less consequential than a fixed-item build. The owner
associates Megabonk with long-run stat accumulation, and Vampire Survivors and
HoloCure with more approachable capped item builds. Treat these as hypotheses to
investigate, not verified descriptions of every system in those games.

Compare three designs:

1. Current unlimited repeatable stat upgrades and quality rolls.
2. A finite collection of named passive items with capped levels. For example,
   Safety Gear could have five levels, each granting an authored HP increase,
   instead of unlimited HP picks. Its numbers are illustrative, not selected.
3. A hybrid: capped weapons/passive items during the authored run, with a clearly
   defined late-run or post-cap stat-stacking outlet.

Audit what the game actually does first. Existing names such as Safety Gear
already exist; naming something an item does not create a capped item system.
Distinguish flat stat additions from percentage/multiplicative gains, appearance
rarity from per-offer quality, player-wide stats from owner-specific weapon
upgrades, and a pick cap from an actual stat/skill level. Some weapon range and
skill upgrades currently scale with quality; acquisition/evolution do not. Count
available slots, picks, caps, unlock prerequisites and evolution requirements,
and explain current sources of choice dilution. Do not assume all stats are
percentages or all equipment effects are fixed.

Research the named games using current primary/official sources where possible.
Record version/date and citations next to each supported claim. Separate weapon,
passive item, equipment, banish/reroll, rarity and post-cap/endless systems. Label
unknowns or secondary-source evidence explicitly. Avoid treating a genre label
or the owner's comparison as proof of a game's exact rules.

Evaluate accessibility, cognitive load, meaningful exclusions/opportunity costs,
build identity, early bad luck, upgrade dilution, satisfying growth, combat
readability, repeat play and endless scaling. Consider the actual short Eco run
and its half-speed clock rather than assuming a long farming session. Explain
why a cap helps or fails to help if the player can still eventually take everything.

Deliver a repository design report containing:

- A concise current-system audit with concrete code references.
- A cited comparison table and trade-offs for all three designs.
- Two worked Eco builds per design, including decisions the player must forgo.
- A small proposed capped-item roster mapping current stable upgrade IDs to
  names/roles/caps, slot rules, level effects and possible synergies. Keep new
  items and numbers explicitly proposed. Include Safety Gear and competing
  defensive/utility choices; retain readable tool evolution.
- A concrete recommendation, strongest counterargument, and a smallest reversible
  prototype/A-B playtest plan with measures for comprehension, choice diversity,
  progression satisfaction, survival and replay motivation. Use `npm run balance`
  for pacing questions; state what its model cannot establish.
- Impacts on tier scaling, selection/banish/reroll rules, capped-pool exhaustion,
  random offers, endless mode, existing unlocks, run reviews, stable IDs and save
  compatibility. Do not invent historical per-item statistics from current saves.
- A phased implementation proposal with bounded ownership, tests, rollback and
  open owner decisions. Keep proposal distinct from approval or shipped scope.

Do not modify runtime code, tuning, assets or saves. Save the research report in
`build/`, record only material design findings in reconciliation, and leave an
implementation handoff for a later explicitly selected session. Do not create or
message another chat, publish, merge or deploy.
