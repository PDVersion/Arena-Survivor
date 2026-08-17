# Arena Survivor V0.3 Build Plan — Feel, Pacing, and Readability

This is the implementation plan for the milestone after the completed V0.2 interaction milestone. Where [`BUILD_PLAN_V0.2.md`](./BUILD_PLAN_V0.2.md) added mechanics, V0.3 makes the existing mechanics **feel** like a modern bullet-heaven: a progression curve that keeps climbing, enemies with physical presence, a procedural spawn director that escalates on a schedule, upgrade cards that state exactly what they do, and on-kill effects that grow with investment.

It also swaps the production theme to **environment/nature**, which becomes the primary fiction for the game from this milestone onward.

Every work session must read this file and then [`../RECONCILIATION.md`](../RECONCILIATION.md) before changing code.

## Why this milestone exists

The V0.2 build is mechanically complete but reads as flat during play:

- levels arrive at a constant pace because the XP requirement is linear while XP income is not;
- enemies occupy the same pixel and the swarm reads as one blob rather than a crowd;
- enemies appear inside the visible screen;
- every enemy is worth roughly the same, so killing a Tank feels identical to killing a Grunt;
- difficulty only rises when the player activates a shrine, so a cautious run has a flat five minutes;
- upgrade cards say "Increase damage dealt" and never say by how much, from what, to what;
- Detonation is one fixed 96-unit, 15-damage blast forever, no matter how invested the build is.

Reference points for the target feel: Vampire Survivors, Risk of Rain 2, HoloCure. All three share a property this build does not yet have — **the same action performed at minute four is visibly and numerically bigger than at minute one**, and the game tells you so.

## Relationship to the product plan

[`PLAN.md`](./PLAN.md) previously described V0.3 as content growth — additional weapons, bosses, unlocks, persistence, endless mode. That list is **re-sequenced, not cancelled**: it is now the V0.4 section of `PLAN.md`, and V0.3 is this rebalancing milestone. Balancing the loop before adding more content to it is the cheaper order — every new weapon, boss, and unlock inherits whatever curve exists when it lands, and re-tuning them later costs more than tuning the core now.

The re-sequencing is already recorded: `PLAN.md` carries the new V0.3 and V0.4 sections, `SAVE_DATA.md` moves its export/import expectation to V0.4, and [REC-043](../RECONCILIATION.md) states the decision and its evidence.

`AGENTS.md` and `README.md` still point every session at the completed V0.2 plan. They are repointed in **Phase 1 of this milestone**, deliberately not before, so no session begins V0.3 work against a plan that has not been approved.

## Why the theme swap is inside this milestone

The environment theme is now the primary fiction for the game, including the pure-fun stream — see [`EDUCATION_PIVOT.md`](./EDUCATION_PIVOT.md). That decision interacts directly with this milestone, because **every balance value V0.3 introduces is theme-owned data.**

If the swap landed after V0.3, the XP curve, spawn director, difficulty curves, body masses, and skill scaling would all be derived against knight-magic and then re-derived against environment content — the exact "tune it twice" cost this milestone was re-sequenced to avoid. So the swap lands in **Phase 2**, before any tuning phase, and everything after it is tuned once against the content that ships.

The swap is deliberately bounded: it re-skins and re-tunes the existing four enemy roles, one weapon, four shrines, and five skills. It adds **no new roles, no type system, and no knowledge layer**. Those are V0.4 and later.

## Delivery contract

- Begin from `main` after the merged V0.2 milestone.
- Build V0.3 on `claude/v0.3` and deliver it as one pull request into `main`. The `claude/` prefix records that this milestone is built with Claude Code; see the branch-naming convention in [`../AGENTS.md`](../AGENTS.md).
- Complete phases in order. Each numbered phase ends in one reviewable commit using the listed subject.
- Keep implementation, tests, plan status, and material reconciliation findings in the same phase commit.
- Run a phase's short verification before marking it complete or starting the next.
- Preserve all V0.1 and V0.2 acceptance paths unless a changed V0.3 requirement is explicitly recorded in reconciliation.
- Keep themed content behind the contracts in [`THEME_ARCHETYPES.md`](./THEME_ARCHETYPES.md). Every balance value introduced here is theme-owned data, never a literal inside a system or scene.
- Keep persistent shapes compatible with [`SAVE_DATA.md`](./SAVE_DATA.md).

## Phase tracker

- [ ] Phase 1 — Tuning seams, balance simulator, and plan re-pointing
- [ ] Phase 2 — Environment theme as the primary content pack
- [ ] Phase 3 — Progression curve, per-role rewards, and upgrade tallies
- [ ] Phase 4 — Procedural spawn director, fixed view, and off-screen spawning
- [ ] Phase 5 — Physical presence, spatial index, and crowd separation
- [ ] Phase 6 — Time and Chaos scaling, and arena hazards
- [ ] Phase 7 — Skill levels, scaling Detonation, and upgrade pool repair
- [ ] Phase 8 — Informative upgrade cards, pause menu, and HUD
- [ ] Phase 9 — Impact feedback and terminal polish
- [ ] Phase 10 — Survivability stats, pickup pressure, and the balance pass

---

# Findings from the V0.2 code

Each requested change below is anchored to what the code does today. These are the facts the plan is built on.

| # | Observation | Location |
| --- | --- | --- |
| 1 | `xpRequiredForLevel(level) = 2 + (level - 1) * 2` — strictly linear, so level 30 costs 15× level 1 while XP income grows far faster than that | `src/game/systems/xp.ts:20` |
| 2 | `selectedUpgradeIds` is an append-only list; nothing counts repeats and the end screen never shows upgrades | `src/game/state/run-state.ts:49`, `src/game/state/statistics.ts:44` |
| 3 | Enemies are added to a physics group with **no collider** — only two overlaps exist (player↔enemy, projectile↔enemy), so enemies fully interpenetrate | `src/game/scenes/run-scene.ts:334` |
| 4 | `SPAWN_RADIUS = 360` while a 1920×1080 window shows ±960×±540 of world, so spawns are always on screen; `pointOnSpawnRing` then *clamps* into the arena, dragging edge spawns even closer | `src/game/scenes/run-scene.ts:66`, `src/game/systems/spawning.ts:18` |
| 5 | XP rewards are per-definition (1 / 1 / 4 / 3) but never scale with run time, enemy buffs, or role beyond that constant | `src/game/content/themes/knight-magic/enemies.ts` |
| 6 | Enemy health scales only with Chaos (`1 + 0.20p`); elapsed time contributes nothing | `src/game/systems/chaos/world-modifiers.ts:48` |
| 7 | Level-up cards render `name\ndescription` only; no numbers, no level, no new-vs-repeat indicator | `src/game/ui/level-up-choice-ui.ts:61` |
| 8 | Spawn cadence is a constant `SPAWN_INTERVAL_MS = 400` divided by the shrine/Chaos multiplier; roster gating is `unlockAtMs` at 8 s / 16 s / 24 s, so the full roster is present within half a minute | `src/game/scenes/run-scene.ts:65`, `enemies.ts` |
| 9 | Pause sets a status and prints one HUD string; there is no pause UI | `src/game/scenes/run-scene.ts:1394`, `src/game/ui/hud.ts:52` |
| 10 | Detonation is a boolean skill with one fixed `{ radius: 96, damage: 15 }`; damage is flat regardless of what died | `src/game/content/themes/knight-magic/skills.ts:9` |
| ★ | `eliteChance = min(0.4, (chaos - 1) * 0.04)` → **zero elites** in any run without shrine activation | `world-modifiers.ts:58` |
| ★ | `selectUpgradeChoices` draws uniformly from all 13 upgrades with no filtering; re-picking an already-enabled skill is a **completely wasted level-up** | `src/game/systems/upgrades.ts:36`, `upgrades.ts:65` |
| ★ | `armour`, `regeneration`, and `luck` exist in `PlayerBaseStats` and are validated, but **no system reads them** — contact damage is applied raw | `player-stats.ts`, `run-scene.ts:1276` |
| ★ | Invulnerability is one global `lastContactDamageAtMs`, so standing in a crowd of 40 costs the same health as touching one Grunt | `run-scene.ts:161` |
| ★ | Every kill drops a pickup actor with no cap, so a 300-enemy chain produces a pickup storm | `run-scene.ts:1187` |
| ★ | `targetsWithinRadius` and `findNearestTarget` are O(n) scans over all live enemies, called per explosion and per shot | `on-kill-effects.ts:14`, `targeting.ts` |

---

# V0.3 acceptance

V0.3 is complete when a player can:

1. Complete every V0.1 and V0.2 path without regression, against the environment theme.
2. Play the environment theme as the production fiction, with knight-magic retained as a second real theme that still passes rename-only validation.
3. Watch level-ups start fast and visibly slow into deliberate milestones, while per-kill XP visibly grows, so late levels feel earned rather than automatic.
4. See a per-upgrade tally on the run-end screen showing each upgrade taken and how many times.
5. Push through a crowd where small enemies bunch and overlap slightly, large enemies block movement, and neither the player nor enemies pass through a durable enemy.
6. Never see an enemy appear inside the visible viewport during normal play, at any supported window size.
7. Earn clearly different rewards from each enemy role and from elites, with tougher late-run variants worth more than early ones.
8. Face enemies that get measurably tougher as the timer runs down and as Pollution rises, from one declared curve.
9. Watch the roster unlock on telegraphed milestones, with Pollution raising both rate and the share of dangerous roles — all derived from curves, so a run of any length needs no new authoring.
10. Encounter two or three arena hazards that create map variety and interact with movement and positioning.
11. Read exactly what an upgrade does before taking it — current value, resulting value, its level, and whether it is new — with a pause-menu toggle to hide the numbers.
12. Open the pause menu mid-run and read current stats, every upgrade owned with counts, active skills, and world modifiers.
13. Take the on-kill detonation early for a small blast and grow it into a large one, with blast damage scaling from the killed enemy's health rather than a flat number.
14. Never be offered an upgrade that does nothing, and never lose a level-up to a duplicate skill pick.
15. Feel big kills land — hit-stop, aggregated damage numbers, a rising kill-streak cue, and a readable death moment naming what killed them.
16. Sustain the 300-enemy representative load with separation, the director, hazards, and scaling effects all active, within the recorded frame budget.
17. Pass the two-theme validation and architecture guard with every new balance value living in theme data.

---

# Architecture additions

V0.3 adds six seams. Each exists because more than one phase needs it.

### Theme-owned tuning packs

All numbers introduced by this milestone live in tuning files inside the **active theme**, not in systems or scenes:

```text
content/themes/<theme>/
  progression.ts   XP curve bands, per-role reward weights, toughness reward share
  director.ts      Director curve coefficients, unlock fractions, weight ramps
  difficulty.ts    Time and Pollution curves for enemy health/damage/speed/elite chance
  bodies.ts        Per-role separation radius scale, mass, and solidity
  hazards.ts       Arena hazard definitions
```

`SPAWN_INTERVAL_MS`, `SPAWN_RADIUS`, and the `unlockAtMs` fields move out of the scene and the enemy definitions into `director.ts`. The scene reads a resolved plan; it never holds a cadence literal.

Both themes carry a full tuning pack. Knight-magic's is kept in step so the second theme stays a real regression target, not a stale fixture.

### Procedural director curves

The director resolves everything from **normalized run progress** rather than an authored phase list, so a 5-minute run, a 10-minute run, and an endless run all work from the same data. See Phase 4.

### Spatial index

One `systems/spatial/spatial-hash.ts` uniform grid, rebuilt once per frame from live enemies, consumed by crowd separation, explosion radius queries, nearest-target selection, hazard overlap, and pickup magnetism. It replaces four independent O(n) scans with one build plus bounded neighbourhood lookups, and it is the enabler for separation at 300 enemies rather than an optimisation added afterwards.

### Skill levels

`RunState` gains `skillLevels: Readonly<Partial<Record<SkillId, number>>>`. `skill.enable` becomes `skill.level` (+1, capped by the skill's `maxLevel`). Effect resolution takes a level and returns resolved values. This is what makes the detonation grow, and it is what removes wasted duplicate picks.

### Upgrade description selectors

One pure module, `systems/upgrades/describe-upgrade.ts`, answers "what does taking this do to the current state?" and returns structured before/after lines. It is consumed by the level-up card, the pause menu, and the run-end tally — three surfaces, one source of truth, fully unit-testable without Phaser.

### Settings state

`settings: { detailedUpgradeCards, reducedMotion, muted, viewScale }` in a serializable slice shaped for [`SAVE_DATA.md`](./SAVE_DATA.md). Session-only in this milestone; the localStorage adapter is a marked seam that V0.4 fills.

---

# Phase 1 — Tuning seams, balance simulator, and plan re-pointing

**Commit:** `build(v0.3): establish balance instrumentation and tuning seams`

The reason this is first: a five-minute run takes five minutes to evaluate. Every later phase in this milestone is a numbers change, and iterating numbers by playing is the slowest possible loop. A headless simulator turns a tuning question into a sub-second test.

Deliver:

- Create the five theme tuning files above in knight-magic with the current values, so this phase is behaviour-neutral and reviewable as a pure move.
- Add `systems/simulation/pacing-simulator.ts`: a deterministic, Phaser-free model that steps a full run at a fixed timestep and reports, per 15-second bucket — enemies spawned by role, live enemy estimate, player DPS from a supplied build model, kills, XP earned, level, and cumulative XP. It consumes the same tuning data and the same pure selectors as the game.
- Add a `npm run balance` script that prints the pacing table for a named build model (`passive`, `damage-rush`, `crit`, `explosion`) and a named run length, as a readable text report.
- Add telemetry fields for pacing: resolved director progress, spawn interval in effect, live count by role, XP earned per bucket, level timestamps.
- Repoint `AGENTS.md` and `README.md` from the completed V0.2 plan to this one, including the `claude/v0.3` branch and delivery workflow. `PLAN.md`, `SAVE_DATA.md`, and REC-043 already carry the re-sequencing.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/content tests/unit/architecture tests/unit/simulation
npm run build
npm run test:e2e -- --grep "boots|load harness"
```

Manual smoke: run `npm run balance` and confirm the simulated level curve matches a real five-minute run within roughly one level at the 1, 3, and 5 minute marks.

Exit gate: no behaviour changed, every V0.2 test passes untouched, and a tuning question can be answered without opening a browser.

---

# Phase 2 — Environment theme as the primary content pack

**Commit:** `feat(v0.3): make the environment theme the production content pack`

The environment/nature theme becomes the game's primary fiction, for the pure-fun stream as well as any later education layer. Knight-magic is retained as a **second real theme** — a far better boundary regression target than the synthetic fixture, because it is production-shaped content that must keep passing every rule test.

### Bounded scope

This phase re-skins and re-tunes **existing roles only**. It adds no enemy roles, no type/effectiveness system, no facts, and no codex. Those live in V0.4 and later, per [`EDUCATION_PIVOT.md`](./EDUCATION_PIVOT.md).

### Content mapping

| Stable ID | Environment identity | Notes |
| --- | --- | --- |
| `character.starter` | Environment Protector | Ranger/cleanup operative |
| `weapon.starter_projectile` | Sorting Pulse | Auto-targeting reclaim shot |
| `enemy.swarm_basic` | Plastic Bottle | **The baseline enemy.** Plastic dominates real litter counts, so the generic grunt being plastic is accurate as well as convenient |
| `enemy.fast_fragile` | Plastic Bag | Wind-blown, fast, fragile |
| `enemy.slow_durable` | Glass Bottle | Very high health, **high armour**, low contact damage — inert but effectively permanent |
| `enemy.death_spawner` | Rubbish Bag | Bursts into loose litter on death |
| `elite.baseline` | Illegal Dump variant | Existing elite treatment, re-skinned |
| `pickup.experience` | Impact Point | XP becomes "Impact" |
| `shrine.spawn_surge` | Landfill Breach | |
| `shrine.greed` | Fast Fashion Boom | |
| `shrine.multiplicity` | Single-Use Boom | |
| `shrine.duplication` | Overproduction Order | |
| `skill.piercing_momentum` | Sorting Momentum | |
| `skill.on_kill_explosion` | Compaction Burst | |
| `skill.fracture` | Fragmentation | Plastics fragment rather than decompose — the mechanic was already accurate |
| `skill.bloodlust` | Cleanup Streak | |
| `skill.chain_reaction` | Cascade | |
| Chaos | **Pollution Level** | HUD vocabulary change only |

`skill.fracture` deserves a note: the mechanic shipped in V0.2 already models what plastic actually does. That is the first evidence that the environment fiction fits these systems better than the fantasy one did.

### Stats derived from persistence

Enemy health is derived from real persistence, **log-scaled and normalized so the Plastic Bottle is the baseline**. Literal persistence would make glass 10,000× a banana peel and unplayable; log scaling keeps the ordering and the intuition while staying inside a playable band. This is a design decision to record, not a hidden fudge — the codex will later state the real figure alongside the modelled one.

Health and harm are deliberately decoupled: glass is a wall that barely hurts, and a small fast item can hurt disproportionately. That is both better enemy design and the actual lesson about what makes litter dangerous.

Deliver:

- Add `content/themes/eco-guardian/` implementing every required archetype, with its own copy, tokens, tuning pack, and derived stats.
- Switch `active-theme.ts` to the new pack; keep knight-magic complete and passing every rule and validation test.
- Extend theme validation and the architecture guard to require **both** production packs to satisfy every contract, and keep the synthetic alternate fixture for rename-only proof.
- Update `THEME_ARCHETYPES.md`: the primary theme, the stable-ID mapping table, and the two-production-theme workflow.
- Update the pacing simulator's build models to the new content.
- Record the log-scaling decision, the persistence sources used, and the resulting stat table in reconciliation.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/content tests/unit/architecture tests/unit/enemies tests/unit/simulation
npm run build
npm run test:e2e:ci
```

Manual smoke: play a full run in the environment theme, then flip `active-theme.ts` to knight-magic and confirm the same run plays with different names, colours, and tuning and no code changes.

Exit gate: two complete production themes pass every contract, no system or scene branches on a themed string, and the environment pack is the default.

---

# Phase 3 — Progression curve, per-role rewards, and upgrade tallies

**Commit:** `feat(v0.3): rebuild the progression curve and reward scaling`

Covers requests 1, 2, and 5.

### The XP curve (request 1)

Replace the linear requirement with banded geometric growth. Growth is fast early so the opening minute is generous, then compounds so late levels are milestones.

```text
xpRequiredForLevel(1) = 4
band 1  levels  1–4    growth ×1.35
band 2  levels  5–11   growth ×1.22
band 3  levels 12–24   growth ×1.16
band 4  levels 25+     growth ×1.12
```

Resulting requirements (rounded):

| Level | 1 | 2 | 3 | 4 | 5 | 8 | 10 | 12 | 15 | 20 | 25 | 30 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Need | 4 | 5 | 7 | 10 | 13 | 24 | 36 | 53 | 83 | 175 | 368 | 649 |
| Cumulative | 4 | 9 | 16 | 26 | 39 | 99 | 164 | 261 | 478 | 1,143 | 2,539 | 5,252 |

The curve is data (`progression.ts`), the formula is pure, and both are covered by table-driven tests including the exact boundary levels. Band 4 is open-ended, so longer and endless runs need no new authoring.

Target pacing, asserted by the simulator: roughly level 8–10 at 1:00, 14–17 at 2:30, and 26–31 at 5:00 for an average build. That lands close to the `PLAN.md` example run-end screen (level 28) and gives ~30 upgrade choices per run.

### Reward scaling (request 5)

Per-role base rewards, separated so a durable enemy is genuinely worth killing:

| Role | Environment identity | Current | Proposed | Rationale |
| --- | --- | --- | --- | --- |
| `enemy.swarm_basic` | Plastic Bottle | 1 | 1 | The unit of account |
| `enemy.fast_fragile` | Plastic Bag | 1 | 2 | Harder to hit, forces movement |
| `enemy.slow_durable` | Glass Bottle | 4 | 7 | Far more health and armour, and blocks space |
| `enemy.death_spawner` | Rubbish Bag | 3 | 5 | Plus its burst, see below |
| Death-spawn offspring | Loose litter | 0 | 1 | The burst is part of the package |
| Fracture children | Fragments | 0 | 0 | Unchanged — a player skill must not mint XP |
| Elite | Illegal Dump | ×2 | ×2.5 | Already a reward multiplier |

Add a **toughness share**: an enemy's reward is snapshotted at spawn as
`xpReward × (1 + (effectiveHealthMultiplier − 1) × 0.5)`.
A bottle spawned at minute four with a 1.5× health multiplier is worth 1.25; the same bottle at minute zero is worth 1. This is what keeps the exponential requirement fed without inflating the early game, and it makes the late-run swarm feel like a payday rather than a wall.

Giving death-spawn offspring non-zero reward changes the provisional data behind REC-030; update that entry rather than silently diverging. There is no reward loop because offspring are the fast-fragile role, which does not spawn on death.

### Upgrade tallies (request 2)

- Add `upgradeCounts: Readonly<Partial<Record<UpgradeId, number>>>` to run statistics, incremented at the same commit point as `selectedUpgradeIds`.
- `selectRunSummaryValues` gains an `upgrades` section: theme display name, count, and — where meaningful — the resulting value.
- The run-end overlay grows a third column, or a second page when the list exceeds the panel; the same selector feeds the pause menu in Phase 8.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/xp tests/unit/statistics tests/unit/simulation tests/unit/enemies
npm run build
npm run test:e2e -- --grep "level up|statistics"
npm run balance
```

Manual smoke: play a full run and confirm level-ups slow down without stalling, that a Glass Bottle kill is visibly worth more than a Plastic Bottle kill, and that the end screen lists every upgrade with an accurate count.

Exit gate: the curve is data-driven and exactly tested at band boundaries, reward provenance still reconciles, and the simulator's predicted level at 1/3/5 minutes matches live play within one level.

---

# Phase 4 — Procedural spawn director, fixed view, and off-screen spawning

**Commit:** `feat(v0.3): add the procedural spawn director and off-screen spawning`

Covers requests 4 and 8.

## The director is a set of curves, not a phase list

The requirement is that longer and endless runs must work **without hand-authoring more phases**. So the director resolves everything from normalized run progress:

```text
t = elapsedMs / durationMs        // 0 at start, 1 at the end, and free to exceed 1
```

Every director output is a function of `t`. Nothing in the data names a minute.

| Output | Function | Coefficients (`director.ts`) |
| --- | --- | --- |
| Spawn interval | `max(minMs, baseMs × e^(−k·t))` | `baseMs 900`, `k 1.0`, `minMs 300` |
| Batch size | `1 + floor(t × batchRamp)` | `batchRamp 3` |
| Role availability | live when `t ≥ role.unlockAt` | per role, below |
| Role weight | `w₀ × (1 + growth × clamp01((t − unlockAt) / (1 − unlockAt)))` | per role, below |
| Baseline elite chance | `maxElite × clamp01((t − eliteUnlock) / (1 − eliteUnlock))` | `eliteUnlock 0.60`, `maxElite 0.08` |
| Milestone wave | fires once when `t` crosses any `role.unlockAt` | burst of `15 + 15·t` |

Per-role coefficients:

| Role | `unlockAt` | At 5:00 | `w₀` | `growth` |
| --- | --- | --- | --- | --- |
| `enemy.swarm_basic` | 0.00 | 0:00 | 100 | −0.65 |
| `enemy.fast_fragile` | 0.20 | 1:00 | 30 | 0.00 |
| `enemy.slow_durable` | 0.40 | 2:00 | 12 | +0.90 |
| `enemy.death_spawner` | 0.45 | 2:15 | 5 | +2.60 |

**Derived output at a 5-minute run** — this table is computed from the curves above, not authored. It exists to show the curves produce the requested milestone shape.

| Progress | Remaining | Interval | Batch | Role share | Elite baseline |
| --- | --- | --- | --- | --- | --- |
| 0.0 | 5:00 | 900 ms | 1 | Bottle 100% | 0% |
| 0.2 | 4:00 | 737 ms | 1 | Bottle 74% · Bag 26% | 0% |
| 0.4 | 3:00 | 603 ms | 2 | Bottle 64% · Bag 26% · Glass 10% | 0% |
| 0.6 | 2:00 | 494 ms | 2 | Bottle 53% · Bag 26% · Glass 14% · Rubbish 7% | 0% |
| 0.8 | 1:00 | 404 ms | 3 | Bottle 43% · Bag 27% · Glass 17% · Rubbish 12% | 4% |
| 1.0 | 0:00 | 331 ms | 4 | Bottle 33% · Bag 28% · Glass 22% · Rubbish 17% | 8% |

Change `durationMs` to ten minutes and the same curves stretch to it. The compressed test runs traverse every milestone for free, which also removes the `durationScale` workaround an authored table would have needed.

**Endless (V0.4) needs no new data.** For `t > 1` every curve clamps at its floor or ceiling and an escalation index `E = max(0, t − 1)` feeds additional health, damage, and count multipliers. The director hook exists in V0.3; endless mode itself remains V0.4.

### Pollution layers on top

- **Rate:** `interval / worldSpawnMultiplier` — the existing `1 + 0.25p` curve plus shrine products, unchanged mechanism.
- **Composition:** each role carries a `chaosWeightBias`, and its weight becomes `weight × (1 + p × bias)`. Proposed biases — Bottle 0, Bag 0.10, Glass 0.35, Rubbish 0.50. High Pollution therefore shifts the swarm toward heavy roles, not just more of the same.
- **Elites:** `max(directorBaseline(t), min(0.4, 0.04p))`. This fixes the current situation where a shrine-free run never sees an elite at all.

Batch spawning matters more than it sounds: one enemy every 330 ms reads as a trickle, while three every 990 ms on a shared ring arc reads as a wave. Milestone waves are announced with a banner and cue, because the player should know the game just got harder and why.

## Fixed view and off-screen spawning (request 4)

### Fixed logical view

The game renders a **fixed 1600×900 logical view**, scaled to fit the window and letterboxed with the theme background where the aspect does not match. A small set of presentation presets (720p / 900p / 1080p) changes rendered pixel density only.

The hard rule: **every preset shows the same world area.** If a preset showed more world, a bigger window would mean more warning, more targets in range, and a different game — and every balance number in this milestone would be monitor-dependent.

### Spawn ring

Two changes, because a larger radius alone is not enough:

1. **Radius derives from the fixed view.** Half-diagonal of 1600×900 is ≈ 918, so `spawnRadius = 918 + margin ≈ 1020`, versus 360 today.
2. **Clamping is replaced with rejection.** `pointOnSpawnRing` currently clamps the candidate into the arena, which drags edge spawns on screen — precisely the reported bug when the player is near a wall. Replace with: sample the golden-angle ring, reject candidates outside the arena or inside the view rectangle, take the first valid candidate, and after N rejections fall back to the farthest in-arena point from the view centre.

The arena grows **2400×1600 → 3600×2400** so a full off-screen ring exists anywhere in the arena, and so shrine placement becomes a real traversal decision. Both changes touch existing e2e expectations that assert `ARENA_SIZE`; treat those updates as part of this phase.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/spawning tests/unit/director tests/unit/content tests/unit/simulation
npm run build
npm run test:e2e -- --grep "spawn|enemy roster|Chaos|view"
npm run test:e2e:stress
```

Manual smoke: play a shrine-free run and confirm no enemy ever appears on screen; confirm each milestone is announced and visibly changes the roster; resize the window across all presets and confirm the visible world area never changes; run the simulator at 5 and 10 minutes and confirm both produce sane curves from the same data.

Exit gate: zero on-screen spawns across a scripted sweep with the player at the centre, each edge, and each corner, at every preset; the director is pure, curve-driven, and unit-tested at several run lengths; the 300-enemy stress path still passes.

---

# Phase 5 — Physical presence, spatial index, and crowd separation

**Commit:** `feat(v0.3): give enemies physical presence`

Covers request 3. This is the highest-risk phase in the milestone — it adds per-frame work proportional to the swarm — so it lands after the director but before the difficulty ramp, and it carries the strictest performance gate.

### Approach

Full Arcade collider resolution between 300 enemies is the obvious approach and the wrong one: it fights `chase()`, which overwrites velocity every frame, and its cost is unbounded in a dense pile. Instead:

- **Enemy ↔ enemy: soft positional separation.** Build the spatial hash once per frame; for each enemy, examine its 3×3 cell neighbourhood, and for each overlapping neighbour apply a positional nudge of `overlap × 0.5 × otherMass / (mass + otherMass)`, clamped to a maximum displacement per frame. Velocity is untouched, so chasing is unaffected. Neighbour checks are capped (8 per enemy) so worst-case cost stays linear.
- **Player ↔ solid enemies: hard resolution.** Enemies flagged `solid` push the player out along the contact normal by the full overlap. Contact damage keeps flowing through the existing overlap handler, so damage semantics do not change. Guard against wedging the player outside arena bounds by preferring to displace the enemy when the player is against a wall.

### Body data (`bodies.ts`)

Separation radius is deliberately smaller than the drawn radius so small enemies still bunch, exactly as requested:

| Role | Environment identity | Draw radius | Separation scale | Effective | Mass | Solid |
| --- | --- | --- | --- | --- | --- | --- |
| `enemy.fast_fragile` | Plastic Bag | 10 | 0.55 | 5.5 | 0.6 | no |
| `enemy.swarm_basic` | Plastic Bottle | 14 | 0.70 | 9.8 | 1.0 | no |
| `enemy.slow_durable` | Glass Bottle | 22 | 1.00 | 22 | 4.0 | **yes** |
| `enemy.death_spawner` | Rubbish Bag | 25 | 0.95 | 23.8 | 3.0 | **yes** |
| Elite (any role) | — | ×1.3 | inherits | ×1.3 | ×2 | **yes** |

Bags overlap heavily and read as wind-blown drift; bottles bunch with visible gaps; glass and rubbish hold their ground and are walls.

Also add **contact knockback**: a solid enemy that damages the player shoves them, which sells the mass difference and gives a moment of recovery.

### Performance gate

This phase must not be merged on impression. Required evidence, recorded in reconciliation:

- average and worst frame time at 300 enemies, before and after, on the same machine;
- separation pair-check count per frame at the 300-enemy high-water mark;
- confirmation that explosions and targeting were migrated to the shared hash (they are net *savings* that partly pay for separation).

If the budget is exceeded, the documented fallback is half-rate separation (alternate frames, doubled displacement) before any reduction of the enemy cap.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/spatial tests/unit/separation tests/unit/effects tests/unit/targeting
npm run build
npm run test:e2e -- --grep "separation|presence|combat"
npm run test:e2e:stress
```

Manual smoke: walk into a Glass Bottle and confirm it blocks; walk through a drift of Plastic Bags and confirm it parts and reforms; stand in a corner under heavy load and confirm nothing tunnels through the player or the walls.

Exit gate: no enemy pair is fully coincident for more than one frame, solids are impassable for both player and enemies, the 300-enemy load stays within the recorded frame budget, and separation never alters damage, rewards, or statistics.

---

# Phase 6 — Time and Chaos scaling, and arena hazards

**Commit:** `feat(v0.3): scale world pressure with time and add arena hazards`

Covers request 6, starting conservatively as requested, plus arena hazards for map variety.

### Difficulty scaling

Add an elapsed-time curve alongside the existing Pollution curves, resolved through the same `selectWorldModifiers` selector so there is still exactly one place where world pressure is decided:

| Modifier | Pollution term (existing) | New time term | Combined at 5:00, Pollution 3 |
| --- | --- | --- | --- |
| Enemy health | `1 + 0.20p` | `1 + 0.50 × t` | 1.40 × 1.50 = **2.10×** |
| Enemy contact damage | `1 + 0.15p` | `1 + 0.20 × t` | 1.30 × 1.20 = **1.56×** |
| Enemy move speed | none | `1 + 0.10 × t` | **1.10×** |
| Elite chance | `min(0.4, 0.04p)` | director baseline from Phase 4 | max of the two |

Rules that keep this readable and safe:

- The time term advances in **steps of `1/10` of run progress**, not continuously — 30-second steps at five minutes, and correctly proportioned at any run length. A smooth ramp is imperceptible; a step is felt, and it lets the HUD show a threat level that changes at legible moments.
- Multipliers are **snapshotted at spawn**. Existing enemies never heal or accelerate mid-life, which would be both confusing and a statistics hazard.
- The snapshot is what feeds the Phase 3 toughness reward share and the Phase 7 victim-health explosion damage, so tougher enemies pay out more in both currencies.

Start at these values and expect to raise them. The simulator's TTK table (Phase 10) is the instrument for deciding.

### Arena hazards

Three hazards, deliberately no more, each a stable-ID contract with theme-owned identity and tuning. They exist for map variety and to make positioning matter beyond enemy avoidance.

| Stable ID | Environment identity | Behaviour |
| --- | --- | --- |
| `hazard.damage_zone` | Contamination Spill | Telegraphed static area; damage-over-time and a slow to anything inside; expires after a lifetime |
| `hazard.obstacle` | Debris Pile | Solid for the player and projectiles; destructible with its own health; drops a reward when cleared |
| `hazard.periodic_burst` | Methane Vent | Fixed point that telegraphs and then bursts on a cycle |

Design rules:

- Hazards are **world content, not enemies**: they never count toward the enemy cap, never award kills, and never enter the damage ledger as enemy damage.
- Count and frequency scale with Pollution and run progress from `difficulty.ts`, so they are part of the same escalation model rather than a separate system.
- `hazard.obstacle` reuses Phase 5's solid-body resolution. Enemies get a cheap tangential avoidance steer — one vector adjustment, no pathfinding. **This is the risk in this phase**: direct-chase enemies can pile against an obstacle. Cap obstacle size and count, and verify under the 300-enemy load that no pile becomes a permanent stall.
- Everything is telegraphed before it hurts. An untelegraphed hazard in a 300-enemy swarm is indistinguishable from a bug.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/chaos tests/unit/modifiers tests/unit/difficulty tests/unit/hazards tests/unit/simulation
npm run build
npm run test:e2e -- --grep "Chaos|world multiplier|difficulty|hazard"
npm run balance
```

Manual smoke: compare a Plastic Bottle's time-to-kill at 0:30 and 4:30 with the same build; confirm the HUD threat step changes are noticeable but not punishing; walk into each hazard and confirm it is telegraphed, escapable, and cleaned up on restart.

Exit gate: every scaling term resolves from one selector, is exposed in telemetry, snapshots at spawn, and restarts clean; hazards never corrupt kill, reward, or damage accounting; no obstacle pile stalls the swarm under load.

---

# Phase 7 — Skill levels, scaling Detonation, and upgrade pool repair

**Commit:** `feat(v0.3): make skills level and scale`

Covers request 10, plus the wasted-pick defect.

### Skill levels

`skill.enable` becomes `skill.level`: taking the upgrade increments the level, capped at the skill's `maxLevel`. Every skill effect resolver takes a level. This single change fixes the defect where re-picking a skill is a completely wasted level-up.

### Scaling Compaction Burst (the on-kill detonation)

Damage becomes a share of what died, as requested, rather than a flat number:

```text
damage = flat + victimEffectiveMaxHealth × share
radius = baseRadius + radiusPerLevel × (level − 1)
```

| Level | 1 | 2 | 3 | 4 | 6 | 8 (max) |
| --- | --- | --- | --- | --- | --- | --- |
| Radius | 44 | 56 | 68 | 80 | 104 | 128 |
| Victim health share | 30% | 38% | 46% | 54% | 70% | 86% |
| Flat damage | 3 | 5 | 7 | 9 | 13 | 17 |

Level 1 is deliberately weaker than today's fixed blast (44 vs 96 radius) so that investment has somewhere to go; level 8 is far stronger than today.

`victimEffectiveMaxHealth` is the enemy's max health *including* its spawn-time elite and difficulty multipliers, so a late-run elite Glass Bottle detonates for a great deal and a Plastic Bag barely pops. This is the interaction the design is asking for: killing the right target becomes the play, and Phase 6's health scaling feeds it automatically. `EnemyActor` must store `maxHealth` at construction — today only the mutable current `health` is retained.

### Scaling Cascade (chain reaction)

| Level | 1 | 2 | 3 | 4 | 5 (max) |
| --- | --- | --- | --- | --- | --- |
| Max chain depth | 2 | 3 | 4 | 5 | 6 |
| Damage falloff per depth | ×0.70 | ×0.74 | ×0.78 | ×0.82 | ×0.86 |
| Radius falloff per depth | ×0.85 | ×0.87 | ×0.89 | ×0.91 | ×0.93 |

An explicit depth limit replaces "bounded only by exact-once claims", which keeps a 300-enemy chain finite, readable, and measurable. Falloff means chains stay spectacular without becoming the only thing that matters.

Sorting Momentum, Fragmentation, and Cleanup Streak all take the same treatment: Momentum +10% per level, Fragmentation +5 percentage points of split chance per level, Cleanup Streak +0.5% attack speed per step per level.

### Upgrade pool repair

- `maxLevel` per upgrade; maxed upgrades leave the pool.
- Weighted rather than uniform selection, with rarity tiers (common / rare / epic) and `luck` feeding the weights (see Phase 10).
- Never offer three upgrades from the same category in one draw.
- Introduce the **dangerous third choice** that `PLAN.md` describes but the build never implemented — a world/curse upgrade such as Single-Use Surge (`enemy spawn ×1.5`, `+20 luck`) or Brittle World (`player damage ×2`, `enemy damage ×2`). These are the clearest expression of the "difficulty should be player-controlled" principle and they cost almost nothing now that the world model exists.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/upgrades tests/unit/effects tests/unit/skills tests/unit/content
npm run build
npm run test:e2e -- --grep "explosion|chain reaction|level up"
npm run test:e2e:stress
```

Manual smoke: take the detonation five times and confirm each pick visibly enlarges the blast; kill an elite Glass Bottle in a crowd and confirm the explosion is dramatically larger than a Plastic Bag's; confirm no offered upgrade is ever a no-op.

Exit gate: every skill level resolves from data, chains terminate at the declared depth, the damage ledger still reconciles exactly, and duplicate-pick waste is impossible.

---

# Phase 8 — Informative upgrade cards, pause menu, and HUD

**Commit:** `feat(v0.3): show the player what everything does`

Covers requests 7 and 9.

### Upgrade cards (request 7)

Each card renders through `describeUpgrade(state, upgrade)`:

```text
┌──────────────────────────────────────────────┐
│ 1.  REINFORCED TOOLS                  Lv 3→4 │
│     Increase damage dealt.                   │
│     Damage        15.0  →  17.5   (+25%)     │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│ 2.  SPLIT NOZZLE                      Lv 1→2 │
│     Launch one additional projectile.        │
│     Projectiles      1  →  2                 │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│ 3.  COMPACTION BURST                    NEW  │
│     Defeated waste bursts.                   │
│     Blast radius        44                   │
│     Blast damage        30% of target health │
└──────────────────────────────────────────────┘
```

- The **level badge** (`Lv 3→4`) and the **NEW** badge are always shown — they are identity, not detail.
- The **numeric before → after lines** are gated by the pause-menu toggle `Detailed upgrade cards`, **defaulting to on**.
- Multi-hit upgrades read as counts (`1 → 2 projectiles`, later `9 → 10`), stat upgrades read as resolved values plus the percentage, and skills read as their resolved effect values at the level being offered.
- Rarity is expressed by card border colour.
- A **level-up queue indicator** shows "2 more choices" when several levels land at once, so stacked pauses are legible.

### Pause menu (request 9)

`Esc` opens a four-tab overlay instead of a status string:

```text
STATS          UPGRADES          WORLD          SETTINGS

Health          86 / 125         Reinforced Tools      ×4
Damage          17.5             Split Nozzle          ×2
Attack rate     1.62 /s          Precision Sort        ×3
Crit chance     145%  (Tier 1)   Deep Reach            ×2
Crit damage     200%             Compaction Burst      ×3
Projectiles     3                Cascade               ×1
Pierce          2                Cleanup Streak        ×1
Move speed      260
Pickup radius   160              POLLUTION     ×2.8
Armour          4                Enemy spawn   ×1.90
Regeneration    0.5 /s           Enemy health  ×1.86
Impact bonus    ×1.50            Impact gain   ×2.25
```

Everything on this screen comes from the same selectors as the cards and the run-end tally. The Settings tab hosts `Detailed upgrade cards`, `Reduced motion`, `Mute`, and the view preset, replacing the current keyboard-only mute.

### HUD

- Replace the XP text with a real progress bar plus `LVL n`.
- Timer shows the current director milestone marker.
- Add live kill-chain counter and threat step indicator.
- Milestone and wave banners from Phase 4 render here.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/upgrades tests/unit/ui-selectors tests/unit/content tests/unit/settings
npm run build
npm run test:e2e -- --grep "level up|pause|hud|resize"
```

Manual smoke: confirm every card's stated "after" value matches the stat shown in the pause menu after taking it; toggle detail off and on; resize across presets during level-up and pause and confirm both overlays reflow.

Exit gate: card numbers are derived from the same code that applies the upgrade (so they cannot drift), the pause overlay never leaks input or resumes physics accidentally, and both overlays are resize- and restart-safe.

---

# Phase 9 — Impact feedback and terminal polish

**Commit:** `feat(v0.3): make big moments land`

The four presentation items that separate a game that is numerically correct from one that feels good. All four are downstream consumers of committed events and must never alter simulation results.

### Hit-stop

Two or three frames of freeze on an elite kill or a large chain. It is the cheapest possible "that felt good" and it is a large part of why the reference games land harder than their numbers suggest.

Implemented as a brief global time scale, so the run clock slows with it and simulation stays internally consistent. Because it does hand the player free real-world time, it is **budgeted**: a maximum total hit-stop per second, and no hit-stop at all while the frame budget is under pressure. Both are recorded in telemetry.

### Damage-number aggregation

With Phase 7's scaling explosions, per-hit numbers will become unreadable. Aggregate per enemy over a ~120 ms window and render one larger number. This also cuts feedback object churn under load, which partly pays for hit-stop.

### Kill-streak audio ramp

The pierce system already ramps pitch per projectile. Extend the same treatment to kill chains so a good run is audible — which `PLAN.md` explicitly asks for and the current build only half-delivers.

### Death moment

Brief slow-motion on death, then a cause-of-death line — "Overwhelmed by an elite Glass Bottle at 4:12" — above the existing statistics ledger. Requires recording the killing enemy's role, elite flag, and timestamp at the lethal transition.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/feedback tests/unit/statistics tests/unit/effects
npm run build
npm run test:e2e -- --grep "feedback|death|elite"
npm run test:e2e:stress
```

Manual smoke: trigger a large chain and confirm hit-stop reads as emphasis rather than lag; confirm damage numbers stay legible at 300 enemies; die deliberately to each role and confirm the cause line is correct.

Exit gate: simulation results are bit-identical with all four features enabled, muted, reduced, or disabled; hit-stop stays inside its budget under the 300-enemy load; aggregation never loses or double-counts damage.

---

# Phase 10 — Survivability stats, pickup pressure, and the balance pass

**Commit:** `feat(v0.3): complete the rebalancing milestone`

### Dead stats

`armour`, `regeneration`, and `luck` are declared, validated, and unread. Implement all three, because a rebalancing milestone that only adds offense produces a game where the answer to every problem is more damage:

- **Armour:** multiplicative reduction `damage × 100 / (100 + armour)`, which never reaches immunity and never trivialises late contact damage. Also becomes an **enemy** stat — the Glass Bottle's defining trait.
- **Regeneration:** health per second, applied on the simulation clock, paused with the run.
- **Luck:** weights rare/epic upgrade offers and nudges the fragmentation and elite rolls.

Add one upgrade for each so they are reachable, which also broadens the pool that Phase 7 draws from.

The global invulnerability window stays as it is for this milestone, per the recorded decision; revisit in V0.4 with solid enemies, hazards, and the damage ramp all live.

### Pickup pressure

Every kill currently drops an uncapped pickup actor. At 300 enemies with chains, that is a second unbounded entity population competing for frame time and covering the arena.

- Cap live pickups (proposed 250); on overflow, merge the two nearest into one worth the sum.
- Three visual tiers by value, so a Glass Bottle's drop is visibly worth crossing the arena for.
- Route magnetism through the Phase 5 spatial hash.

### The balance pass

This is the phase where the numbers actually get decided, using the simulator plus real play:

- Publish a **time-to-kill table** — for each role, at ten evenly spaced points across the run, for four reference builds — and tune until TTK stays inside the declared band. The failure mode this catches is the one the current build has: player DPS scaling and enemy health scaling diverging quietly.
- Publish a **DPS budget**: base 10 DPS at level 1 must reach roughly 400–600 effective DPS by the end of the run through multiplicative stacking, or the Phase 6 health ramp becomes a wall.
- Re-run the full stress path with every V0.3 system active.
- Re-run the simulator at 5 and 10 minutes to confirm the procedural director degrades gracefully at a length nobody tuned by hand.
- Record every provisional value and its evidence in reconciliation.

Short verification:

```text
npm test -- --run
npm run typecheck
npm run lint
npm run build
npm run test:e2e:ci
npm run test:e2e:stress
npm run balance
npm audit --audit-level=high
```

Manual smoke: three full runs — a cautious shrine-free run, a Pollution-stacking run, and a detonation build — confirming each ends between roughly level 24 and 32, that death feels earned, and that the console stays clean. Then one run with `durationMs` set to ten minutes, confirming the director and curves hold up untuned.

Exit gate: all seventeen acceptance points pass, TTK stays in band across the reference builds, the stress path meets its budget, and reconciliation records the final tuning values with the evidence behind them.

---

# Decisions taken

Recorded here so later phases do not relitigate them.

| # | Decision | Resolution | Lands in |
| --- | --- | --- | --- |
| 1 | Viewport | **Fixed 1600×900 logical view**, scaled to fit with letterboxed background. A few presentation presets change pixel density only — every preset shows the same world area | Phase 4 |
| 2 | Run length | **Stays 5 minutes.** Longer and endless runs must be **procedural** — the director and curves resolve from normalized progress, so no milestone is ever hand-authored again | Phase 4 |
| 3 | Detailed cards | **Default on**, with a pause-menu toggle to hide the numbers | Phase 8 |
| 4 | Dangerous upgrades | **Yes**, plus **2–3 arena hazards** for map variety, kept deliberately simple | Phases 6, 7 |
| 5 | Settings persistence | **Deferred to V0.4.** Session-only, with the adapter seam left in place | — |
| 6 | Armour / regeneration / luck | **Implement all three**; armour also becomes an enemy stat | Phase 10 |
| 7 | Invulnerability window | **Leave as is.** Revisit in V0.4 once solid enemies, hazards, and the damage ramp are all live | — |
| 8 | Primary theme | **Environment**, replacing knight-magic, which is retained as a second real theme. Swap lands before any tuning phase so nothing is tuned twice | Phase 2 |

---

# Additional recommendations

Where each recommendation from the original review ended up.

### Scheduled into this milestone

| Recommendation | Phase |
| --- | --- |
| Fixed logical viewport — without it every balance number is monitor-dependent | 4 |
| Shared spatial hash — pays for separation by removing three existing O(n) scans | 5 |
| Pacing simulator — turns a five-minute experiment into a sub-second test | 1 |
| Upgrade pool repair — a wasted level-up is the most frustrating thing in the current build | 7 |
| Baseline elite chance from run progress — elites currently never appear without shrines | 4 |
| Hit-stop on big kills | 9 |
| Damage-number aggregation | 9 |
| Level-up queue indicator | 8 |
| Kill-streak audio ramp | 9 |
| Death slow-motion and cause-of-death line | 9 |

### V0.4 candidates

1. **Weapon and equipment slots.** Rather than one deepening weapon, move to a small number of auto-firing weapon slots plus passive equipment slots. This is the natural home for the type system described in [`EDUCATION_PIVOT.md`](./EDUCATION_PIVOT.md), and it is where weapon level caps and evolution belong.
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

# Explicitly deferred beyond V0.3

Weapon and equipment slots; the type/effectiveness system; layered composite enemies; weapon evolution; mini-bosses and bosses; unlockable content pools and meta-progression; browser-local persistence and portable save export/import; endless mode; final art and audio production; and every education-layer feature described in [`EDUCATION_PIVOT.md`](./EDUCATION_PIVOT.md).

Stable IDs, serializable models, provenance, procedural director curves, and theme-owned tuning data must keep all of those additions possible without implementing them early.
